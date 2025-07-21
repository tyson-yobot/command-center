// ===========================================================================
// logger.ts – Airtable Logging Utility (Production-Ready)
// Wires structured log data into Airtable using REST API
// Shared logger functions imported from backend/utils/logger.ts
// ===========================================================================

import "../../loadEnv.js"; // 👈 this must come first✅ this is RIGHT
import { logInfo, logError } from "../logger.js"; // must use .js for ESM


const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_LOG_TABLE = process.env.AIRTABLE_LOG_TABLE;


const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_LOG_TABLE || "Logs")}`;

export async function logToAirtable(log: { message: string; context?: any }) {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_LOG_TABLE) {
    throw new Error("Missing Airtable env vars (API_KEY, BASE_ID, LOG_TABLE)");
  }

  try {
    const response = await fetch(AIRTABLE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              Message: log.message,
              ...(log.context && { Context: JSON.stringify(log.context) }),
            },
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(JSON.stringify(data));
    }

    logInfo("✅ Airtable log written", data);
    return data;
  } catch (err) {
    logError("❌ Airtable logging failed", err);
    throw err;
  }
}
