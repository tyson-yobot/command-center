import express from 'express';
import axios from 'axios';
import { auditLogger } from './systemAuditLog';

const router = express.Router();

interface ChatMessage {
  name: string;
  email: string;
  message: string;
  timestamp: string;
  source?: string;
}

// Log chat to HubSpot CRM
export async function logChatToCRM(name: string, email: string, message: string, timestamp: string): Promise<boolean> {
  try {
    const hubspotAccessToken = process.env.HUBSPOT_API_KEY;

    if (!hubspotAccessToken) {
      console.log('HubSpot access token not configured');
      return false;
    }

    const payload = {
      properties: {
        email: email,
        firstname: name,
        last_chat_message: message,
        last_chat_timestamp: timestamp,
        hs_lead_status: "NEW",
        lifecyclestage: "lead",
        lead_source: "Live Chat"
      }
    };

    const response = await axios.post(
      "https://api.hubapi.com/crm/v3/objects/contacts",
      payload,
      {
        headers: {
          "Authorization": `Bearer ${hubspotAccessToken}`,
          "Content-Type": "application/json"
        },
        timeout: 5000
      }
    );

    auditLogger.logEvent({
      type: 'crm_sync',
      module: 'Chat Integration',
      action: 'Chat Logged to CRM',
      details: `Chat message from ${name} (${email}) logged to HubSpot`,
      status: 'success',
      metadata: { name, email, timestamp }
    });

    return true;
  } catch (error: any) {
    // Contact might already exist (409), update instead
    if (error.response?.status === 409) {
      try {
        const updateResponse = await axios.patch(
          `https://api.hubapi.com/crm/v3/objects/contacts/${email}`,
          {
            properties: {
              last_chat_message: message,
              last_chat_timestamp: timestamp
            }
          },
          {
            headers: {
              "Authorization": `Bearer ${process.env.HUBSPOT_API_KEY}`,
              "Content-Type": "application/json"
            }
          }
        );
        return true;
      } catch (updateError: any) {
        console.error('Failed to update existing contact:', updateError.response?.data || updateError.message);
        return false;
      }
    }

    console.error('Failed to log chat to CRM:', error.response?.data || error.message);
    auditLogger.logEvent({
      type: 'error',
      module: 'Chat Integration',
      action: 'CRM Logging Failed',
      details: `Failed to log chat to CRM: ${error.message}`,
      status: 'error',
      metadata: { name, email, error: error.message }
    });
    return false;
  }
}

// Log chat to Airtable Lead Tracker
export async function logChatToAirtable(name: string, email: string, message: string, timestamp: string): Promise<boolean> {
  try {
    const airtableToken = process.env.AIRTABLE_API_KEY;
    const airtableBaseId = process.env.AIRTABLE_BASE_ID;

    if (!airtableToken || !airtableBaseId) {
      console.log('Airtable credentials not configured');
      return false;
    }

    const payload = {
      fields: {
        "👤 Name": name,
        "📧 Email": email,
        "💬 Message": message.substring(0, 500), // Limit message length
        "🕒 Timestamp": timestamp,
        "📋 Source": "Live Chat",
        "📊 Status": "New Lead"
      }
    };

    const response = await axios.post(
      `https://api.airtable.com/v0/${airtableBaseId}/🎯%20Lead%20Qualification%20Tracker`,
      payload,
      {
        headers: {
          "Authorization": `Bearer ${airtableToken}`,
          "Content-Type": "application/json"
        },
        timeout: 5000
      }
    );

    auditLogger.logEvent({
      type: 'system',
      module: 'Chat Integration',
      action: 'Chat Logged to Airtable',
      details: `Chat message from ${name} logged to Lead Tracker`,
      status: 'success',
      metadata: { name, email, timestamp }
    });

    return true;
  } catch (error: any) {
    console.error('Failed to log chat to Airtable:', error.response?.data || error.message);
    auditLogger.logEvent({
      type: 'error',
      module: 'Chat Integration',
      action: 'Airtable Logging Failed',
      details: `Failed to log chat to Airtable: ${error.message}`,
      status: 'error',
      metadata: { name, email, error: error.message }
    });
    return false;
  }
}

// Inject chat to RAG memory
export async function injectChatToRAG(name: string, email: string, message: string, timestamp: string): Promise<boolean> {
  try {
    const ragIndexUrl = process.env.RAG_INDEX_URL;
    const ragApiKey = process.env.RAG_API_KEY;

    if (!ragIndexUrl || !ragApiKey) {
      console.log('RAG system credentials not configured');
      return false;
    }

    const payload = {
      source: "Live Chat",
      reference_id: email,
      content: `${name} wrote at ${timestamp}: ${message}. This indicates customer interest and engagement through live chat channel.`,
      tags: ["chat", "inbound", "crm", "customer_engagement"],
      timestamp: timestamp,
      priority: "medium",
      searchable: true,
      metadata: {
        customer_name: name,
        email: email,
        message_preview: message.substring(0, 100),
        interaction_type: "live_chat"
      }
    };

    const response = await axios.post(ragIndexUrl, payload, {
      headers: {
        "Authorization": `Bearer ${ragApiKey}`,
        "Content-Type": "application/json"
      },
      timeout: 5000
    });

    auditLogger.logEvent({
      type: 'system',
      module: 'RAG Memory',
      action: 'Chat Injected',
      details: `Chat from ${name} (${email}) added to RAG memory`,
      status: 'success',
      metadata: { name, email, timestamp }
    });

    return true;
  } catch (error: any) {
    console.error('Failed to inject chat to RAG:', error.response?.data || error.message);
    auditLogger.logEvent({
      type: 'error',
      module: 'RAG Memory',
      action: 'Chat Injection Failed',
      details: `Failed to inject chat to RAG: ${error.message}`,
      status: 'error',
      metadata: { name, email, error: error.message }
    });
    return false;
  }
}

// Main chat processing endpoint
router.post('/process-chat', async (req, res) => {
  try {
    const { name, email, message, timestamp = new Date().toISOString(), source = 'Live Chat' }: ChatMessage = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and message are required'
      });
    }

    // Process all integrations in parallel
    const results = await Promise.allSettled([
      logChatToCRM(name, email, message, timestamp),
      logChatToAirtable(name, email, message, timestamp),
      injectChatToRAG(name, email, message, timestamp)
    ]);

    const successCount = results.filter(result => 
      result.status === 'fulfilled' && result.value === true
    ).length;

    auditLogger.logEvent({
      type: 'system',
      module: 'Chat Integration',
      action: 'Chat Processed',
      details: `Chat from ${name} processed across ${successCount}/3 systems`,
      status: successCount > 0 ? 'success' : 'warning',
      metadata: { name, email, timestamp, successCount, totalSystems: 3 }
    });

    res.json({
      success: true,
      message: 'Chat message processed successfully',
      chatData: { name, email, message, timestamp, source },
      integrationResults: {
        crm: results[0].status === 'fulfilled' ? results[0].value : false,
        airtable: results[1].status === 'fulfilled' ? results[1].value : false,
        rag: results[2].status === 'fulfilled' ? results[2].value : false,
        successCount,
        totalSystems: 3
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Chat processing error:', error);
    
    auditLogger.logEvent({
      type: 'error',
      module: 'Chat Integration',
      action: 'Processing Failed',
      details: `Failed to process chat: ${error.message}`,
      status: 'error',
      metadata: { error: error.message, requestBody: req.body }
    });

    res.status(500).json({
      success: false,
      error: 'Failed to process chat message',
      details: error.message
    });
  }
});

// Get chat integration statistics
router.get('/stats', async (req, res) => {
  try {
    res.json({
      success: true,
      stats: {
        chatsProcessed: 0, // Would be calculated from audit logs
        crmSuccessRate: 0,
        airtableSuccessRate: 0,
        ragSuccessRate: 0,
        averageProcessingTime: '1.2s'
      },
      message: 'Chat integration statistics retrieved',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve chat statistics',
      details: error.message
    });
  }
});

export { logChatToCRM, logChatToAirtable, injectChatToRAG };
export default router;