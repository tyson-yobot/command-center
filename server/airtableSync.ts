import axios from 'axios';

/**
 * Posts data to Airtable tables for comprehensive event logging
 * @param table - The Airtable table name
 * @param fields - The data fields to store
 */
export async function postToAirtable(table: string, fields: Record<string, any>) {
  try {
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      console.log('Airtable credentials not configured, skipping sync');
      return;
    }

    const response = await axios.post(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${table}`,
      { fields },
      {
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`📦 Airtable row written to ${table}:`, response.data.id);
    return response.data;
  } catch (error: any) {
    console.error(`❌ Failed to write to Airtable table ${table}:`, error.response?.data || error.message);
  }
}

/**
 * Logs deal creation events to Airtable
 */
export async function logDealCreated(contact: any) {
  await postToAirtable('deals_created', {
    name: contact.name || `${contact.firstName} ${contact.lastName}`.trim(),
    email: contact.email,
    company: contact.company,
    source: 'business_card_scanner',
    created_at: new Date().toISOString(),
    status: 'new'
  });
}

/**
 * Logs voice escalations to Airtable
 */
export async function logVoiceEscalation(data: any) {
  await postToAirtable('voice_escalations', {
    user_id: data.user_id,
    intent: data.intent,
    sentiment: data.sentiment,
    confidence: data.confidence,
    source: data.source,
    escalation_type: data.intent === 'cancel' ? 'critical' : 'review',
    timestamp: new Date().toISOString()
  });
}

/**
 * Logs business card scans to Airtable
 */
export async function logBusinessCardScan(contact: any) {
  await postToAirtable('card_scans', {
    name: contact.name || `${contact.firstName} ${contact.lastName}`.trim(),
    email: contact.email,
    phone: contact.phone,
    company: contact.company,
    title: contact.title,
    scan_timestamp: new Date().toISOString(),
    processing_status: 'completed'
  });
}