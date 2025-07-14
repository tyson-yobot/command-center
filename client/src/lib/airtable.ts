
// /lib/airtable.ts
import axios from 'axios';

import { requireAirtableApiKey, BASE_ID, METRICS_TABLE_NAME } from '@shared/airtableConfig';

const AIRTABLE_API_KEY = requireAirtableApiKey();
const TABLE_NAME = METRICS_TABLE_NAME;

import { COMMAND_CENTER_BASE_ID, TABLE_NAMES, requireAirtableApiKey } from '@shared/airtableConfig';

const AIRTABLE_API_KEY = requireAirtableApiKey();
if (!AIRTABLE_API_KEY) {
  console.warn('AIRTABLE_API_KEY is not set');
}
const BASE_ID = COMMAND_CENTER_BASE_ID;
const TABLE_NAME = TABLE_NAMES.METRICS_TRACKER;


const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || "";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;

if (!AIRTABLE_API_KEY || !BASE_ID || !TABLE_NAME) {
  console.warn('AIRTABLE_API_KEY, AIRTABLE_BASE_ID, or AIRTABLE_TABLE_NAME is not set');
}


const BASE_ID = process.env.AIRTABLE_BASE_ID || "appRt8V3tH4g5Z51f";


const BASE_ID = "appRt8V3tH4g5Z51f";

const TABLE_NAME = "Command Center - Metrics Tracker Table";




const airtableInstance = axios.create({
  baseURL: `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`,
  headers: {
    Authorization: `Bearer ${AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export class AirtableClient {
  async createLead(fields) {
    try {
      const response = await airtableInstance.post('', {
        records: [{ fields }],
      });
      return response.data;
    } catch (error) {
      console.error("Airtable create error:", error?.response?.data || error);
      throw new Error("Failed to create Airtable record.");
    }
  }
}

export async function createMetricsRecord(fields) {
  try {
    const response = await airtableInstance.post('', {
      records: [{ fields }],
    });
    return response.data;
  } catch (error) {
    console.error("Airtable create error:", error?.response?.data || error);
    throw new Error("Failed to create Airtable record.");
  }
}

export async function updateMetricsRecord(recordId, fields) {
  try {
    const response = await airtableInstance.patch('', {
      records: [{ id: recordId, fields }],
    });
    return response.data;
  } catch (error) {
    console.error("Airtable update error:", error?.response?.data || error);
    throw new Error("Failed to update Airtable record.");
  }
}
