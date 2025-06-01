import express from 'express';
import axios from 'axios';
import { auditLogger } from './systemAuditLog';

const router = express.Router();

// Inject missed call to RAG memory
export async function injectMissedCallToRAG(name: string, phone: string, time: string): Promise<boolean> {
  try {
    const ragIndexUrl = process.env.RAG_INDEX_URL;
    const ragApiKey = process.env.RAG_API_KEY;

    if (!ragIndexUrl || !ragApiKey) {
      console.log('RAG system credentials not configured - cannot inject missed call memory');
      return false;
    }

    const payload = {
      source: "Missed Call Log",
      reference_id: phone,
      content: `${name} missed a call on ${time}. VoiceBot follow-up was triggered. Contact showed interest by calling but was unavailable to connect.`,
      tags: ["missed_call", "voicebot", "followup", "lead_qualification"],
      timestamp: time,
      priority: "medium",
      searchable: true,
      metadata: {
        caller_name: name,
        phone_number: phone,
        call_timestamp: time,
        follow_up_status: "triggered"
      }
    };

    const response = await axios.post(ragIndexUrl, payload, {
      headers: {
        "Authorization": `Bearer ${ragApiKey}`,
        "Content-Type": "application/json"
      },
      timeout: 5000
    });

    if (response.status === 200) {
      auditLogger.logEvent({
        type: 'system',
        module: 'RAG Memory',
        action: 'Missed Call Injected',
        details: `Missed call from ${name} (${phone}) added to RAG memory`,
        status: 'success',
        metadata: { name, phone, time }
      });
      return true;
    }

    return false;
  } catch (error: any) {
    console.error('Failed to inject missed call to RAG:', error.response?.data || error.message);
    
    auditLogger.logEvent({
      type: 'error',
      module: 'RAG Memory',
      action: 'Injection Failed',
      details: `Failed to inject missed call to RAG: ${error.message}`,
      status: 'error',
      metadata: { name, phone, time, error: error.message }
    });
    
    return false;
  }
}

// Log missed call to HubSpot as activity
export async function logMissedCallToHubSpot(name: string, phone: string, time: string): Promise<boolean> {
  try {
    const hubspotAccessToken = process.env.HUBSPOT_API_KEY;

    if (!hubspotAccessToken) {
      console.log('HubSpot access token not configured - cannot log missed call activity');
      return false;
    }

    // First, try to find the contact by phone number
    let contactId = null;
    try {
      const contactResponse = await axios.get(
        `https://api.hubapi.com/contacts/v1/contact/email/${phone}/profile`,
        {
          headers: { Authorization: `Bearer ${hubspotAccessToken}` }
        }
      );
      contactId = contactResponse.data.vid;
    } catch {
      // Contact not found by email, try by phone
      try {
        const searchResponse = await axios.get(
          `https://api.hubapi.com/contacts/v1/search/query`,
          {
            headers: { Authorization: `Bearer ${hubspotAccessToken}` },
            params: { q: phone }
          }
        );
        if (searchResponse.data.contacts && searchResponse.data.contacts.length > 0) {
          contactId = searchResponse.data.contacts[0].vid;
        }
      } catch {
        // Contact doesn't exist, we'll create the engagement without associating it
      }
    }

    const engagementPayload = {
      engagement: {
        active: true,
        type: "NOTE",
        timestamp: new Date(time).getTime()
      },
      metadata: {
        body: `📞 Missed call from ${name} (${phone}) at ${new Date(time).toLocaleString()}. VoiceBot follow-up triggered automatically.`
      },
      associations: contactId ? {
        contactIds: [contactId]
      } : undefined
    };

    const response = await axios.post(
      "https://api.hubapi.com/engagements/v1/engagements",
      engagementPayload,
      {
        headers: {
          "Authorization": `Bearer ${hubspotAccessToken}`,
          "Content-Type": "application/json"
        },
        timeout: 5000
      }
    );

    if (response.status === 200) {
      auditLogger.logEvent({
        type: 'crm_sync',
        module: 'HubSpot Integration',
        action: 'Missed Call Activity Logged',
        details: `Missed call activity logged for ${name} (${phone})`,
        status: 'success',
        metadata: { name, phone, time, contactId, engagementId: response.data.engagement?.id }
      });
      return true;
    }

    return false;
  } catch (error: any) {
    console.error('Failed to log missed call to HubSpot:', error.response?.data || error.message);
    
    auditLogger.logEvent({
      type: 'error',
      module: 'HubSpot Integration',
      action: 'Activity Logging Failed',
      details: `Failed to log missed call activity: ${error.message}`,
      status: 'error',
      metadata: { name, phone, time, error: error.message }
    });
    
    return false;
  }
}

// Log missed call to Command Center metrics
export async function logMissedCallToMetrics(name: string, phone: string, time: string): Promise<boolean> {
  try {
    const commandCenterUrl = process.env.COMMAND_CENTER_METRICS_URL;
    const commandCenterApiKey = process.env.COMMAND_CENTER_API_KEY;

    if (!commandCenterUrl || !commandCenterApiKey) {
      console.log('Command Center credentials not configured - cannot log missed call metrics');
      return false;
    }

    const payload = {
      event: "📞 Missed Call",
      source: "VoiceBot",
      reference_id: phone,
      details: `Call from ${name}`,
      timestamp: time,
      metadata: {
        caller_name: name,
        phone_number: phone,
        follow_up_triggered: true
      }
    };

    const response = await axios.post(commandCenterUrl, payload, {
      headers: {
        "Authorization": `Bearer ${commandCenterApiKey}`,
        "Content-Type": "application/json"
      },
      timeout: 5000
    });

    if (response.status === 200) {
      auditLogger.logEvent({
        type: 'system',
        module: 'Command Center Metrics',
        action: 'Missed Call Logged',
        details: `Missed call metrics logged for ${name} (${phone})`,
        status: 'success',
        metadata: { name, phone, time }
      });
      return true;
    }

    return false;
  } catch (error: any) {
    console.error('Failed to log missed call to metrics:', error.response?.data || error.message);
    
    auditLogger.logEvent({
      type: 'error',
      module: 'Command Center Metrics',
      action: 'Metrics Logging Failed',
      details: `Failed to log missed call metrics: ${error.message}`,
      status: 'error',
      metadata: { name, phone, time, error: error.message }
    });
    
    return false;
  }
}

export default router;