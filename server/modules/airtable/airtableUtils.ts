/**
 * Airtable Utility Functions
 * Centralized logging and data management for YoBot webhook system
 */

import axios from 'axios';
import { COMMAND_CENTER_BASE_ID } from "../config/airtableBase";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_URL = 'https://api.airtable.com/v0';

// Base IDs from the table inventory
const BASES = {
  COMMAND_CENTER: COMMAND_CENTER_BASE_ID,
  OPS_ALERTS: 'appCoAtCZdARb4A4F', 
  CLIENT_CRM: 'appMbVQJ0n3nWR11N',
  SALES_AUTOMATION: 'appe05t1B1tn1Kn5',
  ROI_CALCULATOR: 'appbFDTqB2WtRNV1H',
  SMARTSPEND: 'appGtcRZUd0JqnkQS'
};

// Table names for easy reference
const TABLES = {
  METRICS_TRACKER: 'Command Center - Metrics Tracker Table',
  LEADS_INTAKE: 'Leads - Intake Table',
  CRM_CONTACTS: 'CRM Contacts Table',
  SUPPORT_TICKETS: 'Support Ticket Log Table',
  MISSED_CALLS: 'Missed Call Log Table',
  SALES_ORDERS: 'Sales Orders Table',
  WEBHOOK_LOG: 'Webhook Log Table',
  PDF_QUOTE_LOG: 'PDF Quote Log Table',
  FOLLOWUP_TRACKER: 'Follow-Up Reminder Tracker',
  FEATURE_REQUESTS: 'Feature Request Log Table'
};

interface AirtableRecord {
  fields: Record<string, any>;
}

/**
 * Log metric to Command Center Metrics Tracker
 */
export async function logMetric(fields: {
  '🧠 Function Name': string;
  '📝 Source Form': string;
  '📅 Timestamp': string;
  '📊 Dashboard Name': string;
  '📕 Error Type'?: string;
  '📛 Error Message'?: string;
}) {
  try {
    const response = await axios.post(
      `${BASE_URL}/${BASES.COMMAND_CENTER}/${encodeURIComponent(TABLES.METRICS_TRACKER)}`,
      {
        fields: {
          ...fields,
          '📅 Timestamp': fields['📅 Timestamp'] || new Date().toISOString()
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Metric logged to Airtable:', fields['🧠 Function Name']);
    return response.data;
  } catch (error) {
    console.error('❌ Error logging metric to Airtable:', error);
    throw error;
  }
}

/**
 * Log lead to CRM Contacts
 */
export async function logLead(fields: {
  '👤 Name': string;
  '📧 Email': string;
  '📞 Phone'?: string;
  '🏢 Company'?: string;
  '📣 Lead Source': string;
  '🗒 Internal Notes'?: string;
  '📅 Date Added': string;
}) {
  try {
    const response = await axios.post(
      `${BASE_URL}/${BASES.CLIENT_CRM}/${encodeURIComponent(TABLES.CRM_CONTACTS)}`,
      {
        fields: {
          ...fields,
          '📅 Date Added': fields['📅 Date Added'] || new Date().toISOString()
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Lead logged to CRM:', fields['👤 Name']);
    return response.data;
  } catch (error) {
    console.error('❌ Error logging lead to Airtable:', error);
    throw error;
  }
}

/**
 * Log PDF quote generation
 */
export async function logPDFQuote(fields: {
  '🧾 Client Name': string;
  '📩 Email': string;
  '🛠️ Package Selected': string;
  '➕ Add-Ons'?: string;
  '💰 Total Quote': number;
  '📅 Date Requested': string;
  '📥 Source': string;
}) {
  try {
    const response = await axios.post(
      `${BASE_URL}/${BASES.SALES_AUTOMATION}/${encodeURIComponent(TABLES.PDF_QUOTE_LOG)}`,
      {
        fields: {
          ...fields,
          '📅 Date Requested': fields['📅 Date Requested'] || new Date().toISOString()
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ PDF Quote logged:', fields['🧾 Client Name']);
    return response.data;
  } catch (error) {
    console.error('❌ Error logging PDF quote:', error);
    throw error;
  }
}

/**
 * Log webhook activity
 */
export async function logWebhook(fields: {
  '📮 Endpoint Name': string;
  '📥 Payload Summary': string;
  '✅ Success?': string;
  '🧠 Handler Module': string;
  '🕒 Timestamp': string;
}) {
  try {
    const response = await axios.post(
      `${BASE_URL}/${BASES.OPS_ALERTS}/${encodeURIComponent(TABLES.WEBHOOK_LOG)}`,
      {
        fields: {
          ...fields,
          '🕒 Timestamp': fields['🕒 Timestamp'] || new Date().toISOString()
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Webhook logged:', fields['📮 Endpoint Name']);
    return response.data;
  } catch (error) {
    console.error('❌ Error logging webhook:', error);
    throw error;
  }
}

/**
 * Log missed call and create follow-up
 */
export async function logMissedCall(fields: {
  '📞 Caller Number': string;
  '👤 Caller Name'?: string;
  '📅 Call Time': string;
  '📱 SMS Sent': string;
  '🗒 Notes'?: string;
}) {
  try {
    // Log missed call
    const missedCallResponse = await axios.post(
      `${BASE_URL}/${BASES.SALES_AUTOMATION}/${encodeURIComponent(TABLES.MISSED_CALLS)}`,
      {
        fields: {
          ...fields,
          '📅 Call Time': fields['📅 Call Time'] || new Date().toISOString()
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Create follow-up reminder
    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + 1);

    await axios.post(
      `${BASE_URL}/${BASES.SALES_AUTOMATION}/${encodeURIComponent(TABLES.FOLLOWUP_TRACKER)}`,
      {
        fields: {
          '🧠 Reason': 'Missed Call',
          '📝 Assigned Rep': 'Daniel Sharpe',
          '📅 Due Date': followUpDate.toISOString().split('T')[0],
          '📞 Contact': fields['📞 Caller Number'],
          '🗒 Notes': `Missed call from ${fields['👤 Caller Name'] || 'Unknown'} - Auto SMS sent`
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Missed call and follow-up logged:', fields['📞 Caller Number']);
    return missedCallResponse.data;
  } catch (error) {
    console.error('❌ Error logging missed call:', error);
    throw error;
  }
}

/**
 * Log support ticket
 */
export async function logSupportTicket(fields: {
  '👤 Customer Name': string;
  '📧 Email': string;
  '📋 Subject': string;
  '📝 Message': string;
  '🎯 Priority': string;
  '📅 Created': string;
  '👨‍💼 Assigned To'?: string;
}) {
  try {
    const response = await axios.post(
      `${BASE_URL}/${BASES.OPS_ALERTS}/${encodeURIComponent(TABLES.SUPPORT_TICKETS)}`,
      {
        fields: {
          ...fields,
          '📅 Created': fields['📅 Created'] || new Date().toISOString()
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Support ticket logged:', fields['📋 Subject']);
    return response.data;
  } catch (error) {
    console.error('❌ Error logging support ticket:', error);
    throw error;
  }
}

/**
 * Auto-categorize feature request
 */
export function categorizeFeatureRequest(requestBody: string): string {
  const keywords = {
    'Dashboard': ['dashboard', 'ui', 'interface', 'display', 'chart', 'graph'],
    'Bot Logic': ['bot', 'ai', 'response', 'conversation', 'nlp', 'intent'],
    'Add-On': ['addon', 'add-on', 'module', 'plugin', 'extension'],
    'Tally Form': ['form', 'tally', 'input', 'field', 'submission'],
    'Replit Module': ['replit', 'code', 'function', 'script', 'webhook'],
    'Other': []
  };

  const lowerBody = requestBody.toLowerCase();
  
  for (const [category, words] of Object.entries(keywords)) {
    if (category === 'Other') continue;
    if (words.some(word => lowerBody.includes(word))) {
      return category;
    }
  }
  
  return 'Other';
}

/**
 * Send SMS via Twilio (placeholder - requires Twilio credentials)
 */
export async function sendSMS(to: string, message: string) {
  // This would integrate with Twilio API
  console.log(`📱 SMS to ${to}: ${message}`);
  return { success: true, sid: 'mock-sms-id' };
}

/**
 * Send Slack notification (placeholder - requires Slack webhook)
 */
export async function sendSlackAlert(channel: string, message: string) {
  // This would integrate with Slack API
  console.log(`💬 Slack to ${channel}: ${message}`);
  return { success: true };
}
