export function requireAirtableApiKey(): string {
  const key = process.env.AIRTABLE_API_KEY;
  if (!key) {
    throw new Error('AIRTABLE_API_KEY is not set');
  }
  return key;
}

const baseId = process.env.AIRTABLE_BASE_ID;
if (!baseId) {
  throw new Error('AIRTABLE_BASE_ID is not set');
}
export const BASE_ID = baseId;

export const METRICS_TABLE_NAME = 'Command Center - Metrics Tracker Table';
export const SCRAPED_LEADS_TABLE_NAME = '\ud83d\udce5 Scraped Leads (Universal)';
export const SCRAPED_LEADS_TABLE_ID = 'tblPRZ4nHbtj9opU';

export const COMMAND_CENTER_BASE_ID = 'appRt8V3tH4g5Z51f'; // Primary Command Center base
export const LEAD_ENGINE_BASE_ID = 'appb2F3D77tC4DWla';   // YoBot Lead Engine
export const OPS_BASE_ID = 'appCoAtCZdARb4AM2';          // Ops & Alerts base

export const SCRAPED_LEADS_TABLE = 'Scraped Leads (Universal) Table';
export const INTEGRATION_TEST_LOG_TABLE = 'Integration Test Log Table';
export const SALES_ORDERS_TABLE = 'Sales Orders';

export const TABLE_NAMES = {
  METRICS_TRACKER: 'Command Center - Metrics Tracker Table',
  SCRAPED_LEADS: 'Scraped Leads (Universal) Table',
  INTEGRATION_TEST_LOG: 'Integration Test Log Table',
  FOLLOW_UP_REMINDER: '\ud83d\udcde Follow-Up Reminder Tracker',
  CCEVENTS: 'tblCCEVENTS',
};

export function tableUrl(baseId: string, table: string): string {
  return `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`;
}

export function recordUrl(baseId: string, table: string, recordId: string): string {
  return `${tableUrl(baseId, table)}/${recordId}`;
}
