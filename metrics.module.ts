import axios from "axios";

import { COMMAND_CENTER_BASE_ID, TABLE_NAMES, getAirtableApiKey } from "./shared/airtableConfig";
import { AIRTABLE_BASES } from "./server/modules/airtable/airtableConfig";

const AIRTABLE_API_KEY = getAirtableApiKey();
const BASE_ID = AIRTABLE_BASES?.COMMAND_CENTER?.baseId || COMMAND_CENTER_BASE_ID;
const TABLE_NAME = AIRTABLE_BASES?.COMMAND_CENTER?.tables?.METRICS_TRACKER || TABLE_NAMES.METRICS_TRACKER;

if (!AIRTABLE_API_KEY || !BASE_ID || !TABLE_NAME) {
  console.error("❌ Airtable configuration missing: Check API key, Base ID, and Table Name");
  process.exit(1);
}

const BASE_URL = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;
const headers = {
  Authorization: `Bearer ${AIRTABLE_API_KEY}`,
};

export async function fetchMetrics() {
  try {
    const response = await axios.get(BASE_URL, { headers });
    const records = response.data.records;
    const latest = records?.[0]?.fields || {};

    return {
      conversations: latest["fldcA7pxYCafK3DUw"] || 0,
      messages: latest["fldfPk5WrGABynlHl"] || 0,
      leads: latest["fldiGhisCfsshtBnP"] || 0,
      revenue: latest["fldwvwGDKQ2c8E7Hx"] || 0,
    };
  } catch (error) {
    console.error("❌ Failed to fetch Airtable metrics:", error);
    return {
      conversations: 0,
      messages: 0,
      leads: 0,
      revenue: 0,
    };
  }
}
