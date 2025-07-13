import axios from "axios";
import { COMMAND_CENTER_BASE_ID, TABLE_NAMES } from "./shared/airtableConfig";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID || COMMAND_CENTER_BASE_ID;
const TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || TABLE_NAMES.METRICS_TRACKER;

if (!AIRTABLE_API_KEY) {
  console.warn('AIRTABLE_API_KEY is not set');
}

const BASE_URL = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;

const headers = {
  Authorization: `Bearer ${AIRTABLE_API_KEY}`,
};

export async function fetchMetrics() {
  try {
    const response = await axios.get(BASE_URL, { headers });
    const records = response.data.records;

    // Get the latest record (or handle differently if you want totals)
    const latest = records?.[0]?.fields || {};

    return {
      conversations: latest["fldcA7pxYCafK3DUw"] || 0,
      messages: latest["fldfPk5WrGABynlHl"] || 0,
      leads: latest["fldiGhisCfsshtBnP"] || 0,
      revenue: latest["fldwvwGDKQ2c8E7Hx"] || 0,
    };
  } catch (error) {
    console.error("Failed to fetch Airtable metrics:", error);
    return {
      conversations: 0,
      messages: 0,
      leads: 0,
      revenue: 0,
    };
  }
}

