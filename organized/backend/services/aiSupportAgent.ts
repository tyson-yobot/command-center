import OpenAI from 'openai';
import { storage } from './storage';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface TicketData {
  ticketId: string;
  clientName: string;
  ticketBody: string;
  topic?: string;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
}

interface AIResponse {
  reply: string;
  escalationFlag: boolean;
  sentiment: 'positive' | 'neutral' | 'negative';
  suggestedAction: 'auto_reply' | 'human_review' | 'escalate';
}

/**
 * Get client context from CRM and bot interaction history
 */
async function getClientContext(clientName: string): Promise<string> {
  try {
    // Pull client data from storage/CRM
    const clientHistory = await storage.getClientHistory?.(clientName) || {};
    const botInteractions = await storage.getBotInteractions?.(clientName) || [];
    
    return `Client: ${clientName}
    - Package Tier: ${clientHistory.packageTier || 'Unknown'}
    - Recent Bot Interactions: ${botInteractions.length} conversations
    - Last Contact: ${clientHistory.lastContact || 'N/A'}
    - Known Issues: ${clientHistory.knownIssues || 'None'}
    - Success Rate: ${clientHistory.successRate || 'N/A'}`;
  } catch (error) {
    console.error('Error fetching client context:', error);
    return `Client: ${clientName} - No historical data available`;
  }
}

/**
 * Analyze ticket for escalation triggers and sentiment
 */
function analyzeTicket(ticketBody: string): { escalationFlag: boolean; sentiment: string; urgency: string } {
  const escalationKeywords = [
    'lawsuit', 'legal action', 'attorney', 'cancel', 'refund', 'scam', 
    'fraud', 'illegal', 'sue', 'complaint', 'BBB', 'review bomb'
  ];
  
  const negativeKeywords = [
    'angry', 'frustrated', 'terrible', 'awful', 'broken', 'useless',
    'waste', 'disappointed', 'hate', 'worst', 'horrible'
  ];
  
  const urgentKeywords = [
    'urgent', 'emergency', 'ASAP', 'immediately', 'critical', 'down',
    'broken', 'not working', 'lost money', 'major client'
  ];

  const bodyLower = ticketBody.toLowerCase();
  
  const escalationFlag = escalationKeywords.some(keyword => bodyLower.includes(keyword));
  const hasNegativeSentiment = negativeKeywords.some(keyword => bodyLower.includes(keyword));
  const hasUrgentKeywords = urgentKeywords.some(keyword => bodyLower.includes(keyword));
  
  let sentiment = 'neutral';
  if (hasNegativeSentiment || escalationFlag) sentiment = 'negative';
  if (bodyLower.includes('thanks') || bodyLower.includes('great') || bodyLower.includes('love')) sentiment = 'positive';
  
  let urgency = 'medium';
  if (escalationFlag) urgency = 'critical';
  else if (hasUrgentKeywords) urgency = 'high';
  else if (sentiment === 'positive') urgency = 'low';

  return { escalationFlag, sentiment, urgency };
}

/**
 * Generate AI response using OpenAI with client context
 */
export async function generateAIResponse(ticketData: TicketData): Promise<AIResponse> {
  const { clientName, ticketBody, topic } = ticketData;
  
  // Get client context and analyze ticket
  const clientContext = await getClientContext(clientName);
  const analysis = analyzeTicket(ticketBody);
  
  // Determine response strategy
  let suggestedAction: 'auto_reply' | 'human_review' | 'escalate' = 'auto_reply';
  if (analysis.escalationFlag) suggestedAction = 'escalate';
  else if (analysis.sentiment === 'negative' || analysis.urgency === 'high') suggestedAction = 'human_review';

  const systemPrompt = `You are an AI support agent for YoBot®, an enterprise automation platform.

Key Guidelines:
- Be professional, empathetic, and solution-oriented
- Reference client's specific package tier and history when relevant
- Provide clear next steps or solutions
- Keep responses under 200 words
- If technical issue, offer immediate troubleshooting steps
- If billing/contract issue, direct to appropriate team member

${analysis.escalationFlag ? 'CRITICAL: This ticket contains escalation triggers. Be extra careful and empathetic.' : ''}`;

  const userPrompt = `Client Context:
${clientContext}

Ticket Topic: ${topic || 'General Support'}
Urgency Level: ${analysis.urgency}
Client Message: "${ticketBody}"

Generate a professional support response that addresses their specific concern.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'claude-3-7-sonnet-20250219', // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const aiReply = response.choices[0]?.message?.content || 'Unable to generate response. Please contact our support team directly.';

    return {
      reply: aiReply,
      escalationFlag: analysis.escalationFlag,
      sentiment: analysis.sentiment as 'positive' | 'neutral' | 'negative',
      suggestedAction
    };
  } catch (error) {
    console.error('Error generating AI response:', error);
    
    // Fallback response for API failures
    return {
      reply: `Hi ${clientName}, thank you for contacting YoBot® support. We've received your message regarding "${topic}" and our team will respond within 24 hours. For urgent issues, please call our support hotline.`,
      escalationFlag: analysis.escalationFlag,
      sentiment: analysis.sentiment as 'positive' | 'neutral' | 'negative',
      suggestedAction: 'human_review'
    };
  }
}

/**
 * Log support interaction to Airtable for tracking
 */
export async function logSupportInteraction(ticketData: TicketData, aiResponse: AIResponse) {
  try {
    // Log to Airtable or your CRM system
    const logData = {
      ticketId: ticketData.ticketId,
      clientName: ticketData.clientName,
      topic: ticketData.topic,
      escalationFlag: aiResponse.escalationFlag,
      sentiment: aiResponse.sentiment,
      suggestedAction: aiResponse.suggestedAction,
      timestamp: new Date().toISOString(),
      aiGenerated: true
    };

    // Add your Airtable logging logic here
    console.log('Support interaction logged:', logData);
  } catch (error) {
    console.error('Error logging support interaction:', error);
  }
}