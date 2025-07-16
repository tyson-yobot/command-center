import axios from 'axios';
import { getAirtableApiKey, BASE_ID, METRICS_TABLE_NAME } from './shared/airtableConfig';

<<<<<<< HEAD
const BASE_URL = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(METRICS_TABLE_NAME)}`;
=======
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || "";
const BASE_ID = "appRt8V3tH4g5Z51f";
const TABLE_NAME = "Command Center - Metrics Tracker Table";
>>>>>>> dev

export interface Metrics {
  conversations: number;
  messages: number;
  leads: number;
  revenue: number;
}

export async function fetchMetrics(): Promise<Metrics> {
  try {
    const apiKey = getAirtableApiKey();
    if (!apiKey) {
      console.warn('AIRTABLE_API_KEY is not set');
      return { conversations: 0, messages: 0, leads: 0, revenue: 0 };
    }

    const response = await axios.get(BASE_URL, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });

    const fields = response.data.records?.[0]?.fields || {};

    return {
      conversations: fields['fldcA7pxYCafK3DUw'] || 0,
      messages: fields['fldfPk5WrGABynlHl'] || 0,
      leads: fields['fldiGhisCfsshtBnP'] || 0,
      revenue: fields['fldwvwGDKQ2c8E7Hx'] || 0
    };
  } catch (error) {
    console.error('Failed to fetch Airtable metrics:', error);
    return { conversations: 0, messages: 0, leads: 0, revenue: 0 };
  }
}


