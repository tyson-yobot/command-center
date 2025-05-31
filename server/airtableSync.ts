import axios from 'axios';

/**
 * Posts data to Airtable tables for comprehensive event logging
 * @param fields - The data fields to store
 */
export async function postToAirtable(fields: Record<string, any>) {
  try {
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_TABLE_ID) {
      console.log('Airtable credentials not configured, skipping sync');
      return;
    }

    const response = await axios.post(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_ID}`,
      { fields },
      {
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('📦 Airtable event logged:', response.data.id);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to write to Airtable:', error.response?.data || error.message);
  }
}

/**
 * Logs deal creation events to Airtable
 */
export async function logDealCreated(contact: any) {
  await postToAirtable({
    Event: 'Deal Created',
    Contact: contact.name || `${contact.firstName} ${contact.lastName}`.trim(),
    Email: contact.email,
    Company: contact.company,
    Source: 'Business Card Scanner',
    Timestamp: new Date().toISOString(),
    Status: 'Success'
  });
}

/**
 * Logs voice escalations to Airtable
 */
export async function logVoiceEscalation(data: any) {
  await postToAirtable({
    Event: 'Voice Escalation',
    Contact: `User ${data.user_id}`,
    Details: `${data.intent} - ${data.sentiment} (${data.confidence}% confidence)`,
    Source: data.source,
    Timestamp: new Date().toISOString(),
    Status: data.intent === 'cancel' ? 'Critical' : 'Review'
  });
}

/**
 * Logs business card scans to Airtable
 */
export async function logBusinessCardScan(contact: any) {
  await postToAirtable({
    Event: 'Business Card Scan',
    Contact: contact.name || `${contact.firstName} ${contact.lastName}`.trim(),
    Email: contact.email,
    Company: contact.company,
    Source: 'Business Card Scanner',
    Timestamp: new Date().toISOString(),
    Status: 'Completed'
  });
}

export async function logSyncError(contact: any, reason: string) {
  try {
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_TABLE_ID) {
      console.log('Airtable credentials not configured for error logging');
      return;
    }

    const contactName = contact?.name || `${contact?.firstName || ''} ${contact?.lastName || ''}`.trim() || 'Unknown Contact';
    const traceId = `R-${Math.floor(Math.random() * 10000)}`;

    await axios.post(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_ID}`,
      {
        fields: {
          Event: 'System Error',
          Contact: contactName,
          Email: contact?.email || 'N/A',
          Source: 'Business Card Scanner',
          Timestamp: new Date().toISOString(),
          Status: 'Failed',
          Details: reason,
          TraceID: traceId
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`❌ Error logged to Airtable: ${reason} (Trace: ${traceId})`);
  } catch (error: any) {
    console.error('Failed to log error to Airtable:', error.message);
  }
}