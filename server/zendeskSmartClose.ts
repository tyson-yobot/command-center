import express from 'express';
import axios from 'axios';
import { postToAirtable } from './airtableSync';
import { sendSlackAlert } from './alerts';

const router = express.Router();

interface TicketAnalysis {
  ticketId: string;
  status: 'open' | 'pending' | 'solved' | 'closed';
  lastUpdate: string;
  aiResponseCount: number;
  customerSatisfaction: 'positive' | 'neutral' | 'negative' | 'unknown';
  resolutionIndicators: string[];
  shouldAutoClose: boolean;
  confidence: number;
}

// Analyze if ticket should be auto-closed
function analyzeTicketForClosure(ticket: any, interactions: any[]): TicketAnalysis {
  const ticketBody = ticket.description?.toLowerCase() || '';
  const comments = interactions.map((comment: any) => comment.body?.toLowerCase() || '').join(' ');
  const allContent = `${ticketBody} ${comments}`;

  // Positive resolution indicators
  const resolutionIndicators = [
    'thank you', 'thanks', 'resolved', 'fixed', 'working now', 'solved',
    'perfect', 'great', 'excellent', 'helpful', 'appreciate', 'satisfied'
  ];

  // Negative indicators (prevent auto-close)
  const negativeIndicators = [
    'still not working', 'still broken', 'not fixed', 'not resolved',
    'still having issues', 'problem persists', 'not satisfied', 'frustrated'
  ];

  const foundResolutionIndicators: string[] = [];
  let positiveScore = 0;
  let negativeScore = 0;

  // Check for resolution indicators
  resolutionIndicators.forEach(indicator => {
    if (allContent.includes(indicator)) {
      foundResolutionIndicators.push(indicator);
      positiveScore += 10;
    }
  });

  // Check for negative indicators
  negativeIndicators.forEach(indicator => {
    if (allContent.includes(indicator)) {
      negativeScore += 20;
    }
  });

  // Calculate confidence and satisfaction
  const totalScore = positiveScore - negativeScore;
  const confidence = Math.min(100, Math.max(0, totalScore)) / 100;
  
  let customerSatisfaction: 'positive' | 'neutral' | 'negative' | 'unknown' = 'unknown';
  if (totalScore >= 20) {
    customerSatisfaction = 'positive';
  } else if (totalScore >= -10) {
    customerSatisfaction = 'neutral';
  } else {
    customerSatisfaction = 'negative';
  }

  // Determine if should auto-close
  const shouldAutoClose = 
    confidence >= 0.7 && 
    customerSatisfaction === 'positive' && 
    foundResolutionIndicators.length >= 2 &&
    negativeScore === 0;

  return {
    ticketId: ticket.id,
    status: ticket.status,
    lastUpdate: ticket.updated_at,
    aiResponseCount: interactions.filter((i: any) => i.author_id === 'ai_agent').length,
    customerSatisfaction,
    resolutionIndicators: foundResolutionIndicators,
    shouldAutoClose,
    confidence
  };
}

// Auto-close tickets based on smart analysis
router.post('/analyze-and-close', async (req, res) => {
  try {
    const { ticketId, skipAnalysis = false } = req.body;

    if (!process.env.ZENDESK_SUBDOMAIN || !process.env.ZENDESK_EMAIL || !process.env.ZENDESK_API_TOKEN) {
      return res.status(400).json({
        success: false,
        error: 'Zendesk credentials not configured'
      });
    }

    const auth = Buffer.from(`${process.env.ZENDESK_EMAIL}/token:${process.env.ZENDESK_API_TOKEN}`).toString('base64');
    const baseUrl = `https://${process.env.ZENDESK_SUBDOMAIN}.zendesk.com/api/v2`;

    // Get ticket details
    const ticketResponse = await axios.get(`${baseUrl}/tickets/${ticketId}.json`, {
      headers: { 'Authorization': `Basic ${auth}` }
    });

    const ticket = ticketResponse.data.ticket;

    // Get ticket comments/interactions
    const commentsResponse = await axios.get(`${baseUrl}/tickets/${ticketId}/comments.json`, {
      headers: { 'Authorization': `Basic ${auth}` }
    });

    const comments = commentsResponse.data.comments;

    // Analyze ticket for auto-closure
    const analysis = analyzeTicketForClosure(ticket, comments);

    // If manual override or analysis indicates closure
    if (skipAnalysis || analysis.shouldAutoClose) {
      // Update ticket to solved status
      const updateResponse = await axios.put(`${baseUrl}/tickets/${ticketId}.json`, {
        ticket: {
          status: 'solved',
          comment: {
            body: 'This ticket has been automatically resolved based on positive customer feedback and resolution indicators. If you need further assistance, please reply to reopen.',
            public: false
          }
        }
      }, {
        headers: { 
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });

      // Log the closure event
      await postToAirtable({
        "🎟️ Ticket ID": ticketId,
        "🤖 Closure Type": skipAnalysis ? "Manual Override" : "Smart Auto-Close",
        "📊 Confidence": `${Math.round(analysis.confidence * 100)}%`,
        "😊 Satisfaction": analysis.customerSatisfaction,
        "✅ Resolution Indicators": analysis.resolutionIndicators.join(', ') || 'None detected',
        "🕒 Closed At": new Date().toISOString(),
        "📈 Event Type": "Ticket Auto-Closure"
      });

      // Send Slack notification
      await sendSlackAlert(
        `🎯 *Ticket Auto-Closed*\n` +
        `Ticket ID: ${ticketId}\n` +
        `Confidence: ${Math.round(analysis.confidence * 100)}%\n` +
        `Satisfaction: ${analysis.customerSatisfaction}\n` +
        `Indicators: ${analysis.resolutionIndicators.join(', ') || 'Manual override'}`
      );

      res.json({
        success: true,
        message: 'Ticket automatically closed',
        ticketId,
        analysis,
        closureType: skipAnalysis ? 'manual' : 'automatic'
      });

    } else {
      res.json({
        success: false,
        message: 'Ticket does not meet auto-closure criteria',
        ticketId,
        analysis,
        reason: `Confidence too low (${Math.round(analysis.confidence * 100)}%) or negative indicators detected`
      });
    }

  } catch (error: any) {
    console.error('Smart close analysis error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze ticket for closure',
      details: error.response?.data || error.message
    });
  }
});

// Batch analyze multiple tickets for closure
router.post('/batch-analyze', async (req, res) => {
  try {
    const { maxTickets = 50, statusFilter = 'pending' } = req.body;

    if (!process.env.ZENDESK_SUBDOMAIN || !process.env.ZENDESK_EMAIL || !process.env.ZENDESK_API_TOKEN) {
      return res.status(400).json({
        success: false,
        error: 'Zendesk credentials not configured'
      });
    }

    const auth = Buffer.from(`${process.env.ZENDESK_EMAIL}/token:${process.env.ZENDESK_API_TOKEN}`).toString('base64');
    const baseUrl = `https://${process.env.ZENDESK_SUBDOMAIN}.zendesk.com/api/v2`;

    // Get tickets for analysis
    const ticketsResponse = await axios.get(`${baseUrl}/tickets.json?status=${statusFilter}&per_page=${maxTickets}`, {
      headers: { 'Authorization': `Basic ${auth}` }
    });

    const tickets = ticketsResponse.data.tickets;
    const analysisResults = [];
    let closedCount = 0;

    for (const ticket of tickets) {
      try {
        // Get ticket comments
        const commentsResponse = await axios.get(`${baseUrl}/tickets/${ticket.id}/comments.json`, {
          headers: { 'Authorization': `Basic ${auth}` }
        });

        const analysis = analyzeTicketForClosure(ticket, commentsResponse.data.comments);
        analysisResults.push(analysis);

        // Auto-close if criteria met
        if (analysis.shouldAutoClose) {
          await axios.put(`${baseUrl}/tickets/${ticket.id}.json`, {
            ticket: {
              status: 'solved',
              comment: {
                body: 'This ticket has been automatically resolved based on positive customer feedback and resolution indicators.',
                public: false
              }
            }
          }, {
            headers: { 
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/json'
            }
          });

          closedCount++;

          // Log each closure
          await postToAirtable({
            "🎟️ Ticket ID": ticket.id,
            "🤖 Closure Type": "Batch Auto-Close",
            "📊 Confidence": `${Math.round(analysis.confidence * 100)}%`,
            "😊 Satisfaction": analysis.customerSatisfaction,
            "🕒 Closed At": new Date().toISOString(),
            "📈 Event Type": "Batch Ticket Closure"
          });
        }

        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Error processing ticket ${ticket.id}:`, error);
      }
    }

    // Send summary alert
    if (closedCount > 0) {
      await sendSlackAlert(
        `📊 *Batch Ticket Closure Complete*\n` +
        `Analyzed: ${analysisResults.length} tickets\n` +
        `Auto-closed: ${closedCount} tickets\n` +
        `Success rate: ${Math.round((closedCount / analysisResults.length) * 100)}%`
      );
    }

    res.json({
      success: true,
      message: `Analyzed ${analysisResults.length} tickets`,
      results: {
        analyzed: analysisResults.length,
        closed: closedCount,
        analyses: analysisResults
      }
    });

  } catch (error: any) {
    console.error('Batch analysis error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to perform batch analysis',
      details: error.response?.data || error.message
    });
  }
});

export { router as zendeskSmartCloseRouter };