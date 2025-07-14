import axios from "axios";


import {
  AIRTABLE_API_KEY,
  AIRTABLE_BASE_ID,
  TABLE_NAMES,
} from "./shared/airtableConfig";

const BASE_ID = AIRTABLE_BASE_ID;
const TABLE_NAME = TABLE_NAMES.METRICS_TRACKER;

if (!AIRTABLE_API_KEY || !BASE_ID || !TABLE_NAME) {
  console.error('Airtable configuration is incomplete. Please ensure AIRTABLE_API_KEY, AIRTABLE_BASE_ID, and METRICS_TRACKER table name are properly set.');
  // Depending on the application's needs, you might want to throw an error or exit the process here.
  // For now, we'll just warn and proceed, which might lead to further errors.
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
