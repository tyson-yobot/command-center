
// /lib/airtable.ts
import axios from 'axios';

import { COMMAND_CENTER_BASE_ID, TABLE_NAMES } from '@shared/airtableConfig';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY ?? '';
const BASE_ID = process.env.AIRTABLE_BASE_ID || COMMAND_CENTER_BASE_ID;
const TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || TABLE_NAMES.METRICS_TRACKER;

if (!AIRTABLE_API_KEY) {
  console.warn('AIRTABLE_API_KEY is not set');
}

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
