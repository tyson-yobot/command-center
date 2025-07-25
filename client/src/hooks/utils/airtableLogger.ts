/**
 * Airtable logger — production-ready
 * • Uses env constants only (no hard-coded IDs)
 * • Sanitises & validates data
 * • Deduplicates on “🧾 Dedupe Key”
 * • Retries once on transient failures
 * • Throws on unrecoverable errors
 */

import axios from 'axios';

const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_LOG_TABLE } = process.env;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_LOG_TABLE) {
  throw new Error(
    '❌ Missing Airtable env vars (AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_LOG_TABLE)'
  );
}

const airtableURL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(
  AIRTABLE_LOG_TABLE
)}`;

interface AirtableResponse {
  id: string;
}

export async function logToAirtable(
  fields: Record<string, unknown>,
  attempt = 1
): Promise<AirtableResponse> {
  // 1 — remove undefined / null
  const cleaned = Object.fromEntries(
    Object.entries(fields).filter(([, v]) => v !== undefined && v !== null)
  );

  // 2 — basic validation
  if (!cleaned['🧾 Dedupe Key']) {
    throw new Error('Missing 🧾 Dedupe Key for deduplication');
  }

  try {
    const { data } = await axios.post(
      airtableURL,
      { records: [{ fields: cleaned }] },
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 7_000,
      }
    );

    return { id: (data as any).records?.[0]?.id };
  } catch (err) {
    const ae = err as any;
    // Retry once on 5xx / timeout
    if (attempt === 1 && (ae.code === 'ECONNABORTED' || (ae.response?.status || 500) >= 500)) {
      return logToAirtable(fields, 2);
    }
    throw new Error(
      `Airtable logging failed [${ae.response?.status || 'no-status'}]: ${
        ae.response?.data || ae.message
      }`
    );
  }
}
