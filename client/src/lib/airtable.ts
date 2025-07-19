// /lib/airtable.ts
import axios from 'axios';

const COMMAND_CENTER_BASE_ID = 'appRt8V3tH4g5Z51f';
const METRICS_TABLE_NAME = 'Command Center - Metrics Tracker Table';

const getAirtableApiKey = () => {
  const key = import.meta.env.VITE_AIRTABLE_KEY;
  if (!key) {
    console.warn('VITE_AIRTABLE_KEY is not set');
    return '';
  }
  return key;
};

const AIRTABLE_API_KEY = getAirtableApiKey();
if (!AIRTABLE_API_KEY) {
  console.warn('AIRTABLE_API_KEY is not set');
}
const BASE_ID = COMMAND_CENTER_BASE_ID;
const TABLE_NAME = METRICS_TABLE_NAME;

const airtableInstance = axios.create({
  baseURL: `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`,
  headers: {
    Authorization: `Bearer ${AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export class AirtableClient {
  async createLead(fields: any) {
    try {
      const response = await airtableInstance.post('', {
        records: [{ fields }],
      });
      return response.data;
    } catch (error: any) {
      console.error("Airtable create error:", error?.response?.data || error);
      throw new Error("Failed to create Airtable record.");
    }
  }
}

export async function createMetricsRecord(fields: any) {
  try {
    const response = await airtableInstance.post('', {
      records: [{ fields }],
    });
    return response.data;
  } catch (error: any) {
    console.error("Airtable create error:", error?.response?.data || error);
    throw new Error("Failed to create Airtable record.");
  }
}

export async function updateMetricsRecord(recordId: string, fields: any) {
  try {
    const response = await airtableInstance.patch('', {
      records: [{ id: recordId, fields }],
    });
    return response.data;
  } catch (error: any) {
    console.error("Airtable update error:", error?.response?.data || error);
    throw new Error("Failed to update Airtable record.");
  }
}
