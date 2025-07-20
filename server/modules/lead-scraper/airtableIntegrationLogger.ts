import axios from 'axios';
import { COMMAND_CENTER_BASE_ID, getAirtableApiKey } from '../../../shared/airtableConfig';

// Log events to Airtable
export async function logEventToAirtable(
  eventType: string, 
  source: string, 
  target: string, 
  status: 'SUCCESS' | 'ERROR' | 'PARTIAL', 
  details: string
): Promise<boolean> {
  try {
    const apiKey = getAirtableApiKey();
    if (!apiKey) {
      console.error('Missing Airtable API key for event logging');
      return false;
    }

    const url = `https://api.airtable.com/v0/${COMMAND_CENTER_BASE_ID}/tblEventLog`;
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };

    const payload = {
      records: [{
        fields: {
          'Event Type': eventType,
          'Source': source,
          'Target': target,
          'Status': status,
          'Details': details,
          'Timestamp': new Date().toISOString()
        }
      }]
    };

    const response = await axios.post(url, payload, { headers });
    return response.status === 200;
  } catch (error) {
    console.error('Failed to log event to Airtable:', error);
    return false;
  }
}

// Log operation for general purpose logging
export function logOperation(
  operation: string, 
  data: any, 
  result: 'success' | 'error' | 'blocked', 
  message: string
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    operation,
    data,
    result,
    message
  };
  
  console.log(`[LOG] ${operation}: ${message}`, logEntry);
}