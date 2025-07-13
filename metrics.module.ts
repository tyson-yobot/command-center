import axios from "axios";
import { AIRTABLE_BASES } from "./server/modules/airtable/airtableConfig";


// Expects `AIRTABLE_API_KEY` in the environment for authentication
=======

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || "";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
if (!AIRTABLE_API_KEY) {
  console.warn('AIRTABLE_API_KEY is not set');
}
const BASE_ID = AIRTABLE_BASES.COMMAND_CENTER.baseId;
const TABLE_NAME = AIRTABLE_BASES.COMMAND_CENTER.tables.METRICS_TRACKER;


const BASE_ID = "appRt8V3tH4g5Z51f";
const TABLE_NAME = "Command Center - Metrics Tracker Table";


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
