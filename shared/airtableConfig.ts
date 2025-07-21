export function getApiKey(): string {
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

export const COMMAND_CENTER_BASE_ID = process.env.COMMAND_CENTER_BASE_ID || '';
export const LEAD_ENGINE_BASE_ID = process.env.LEAD_ENGINE_BASE_ID || '';
export const OPS_BASE_ID = process.env.OPS_BASE_ID || '';

export const METRICS_TABLE_NAME = '📊 Command Center · Metrics Tracker';
export const SCRAPED_LEADS_TABLE_NAME = '📥 Scraped Leads (Universal)';
export const SCRAPED_LEADS_TABLE_ID = process.env.SCRAPED_LEADS_TABLE_ID || '';
export const INTEGRATION_TEST_LOG_TABLE = '🧪 Integration Test Log';
export const SALES_ORDERS_TABLE = '🧾 Sales Orders';

export const TABLE_NAMES = {
  METRICS_TRACKER: METRICS_TABLE_NAME,
  SCRAPED_LEADS: SCRAPED_LEADS_TABLE_NAME,
  INTEGRATION_TEST_LOG: INTEGRATION_TEST_LOG_TABLE,
  FOLLOW_UP_REMINDER: '📞 Follow-Up Reminder Tracker',
  CCEVENTS: '📅 Calendar Events',
};

export const SCRAPED_LEADS_TABLE = SCRAPED_LEADS_TABLE_NAME;

export function getAirtableApiKey(): string | undefined {
  return process.env.AIRTABLE_API_KEY;
}

export function tableUrl(baseId: string, table: string): string {
  return `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`;
}

export function recordUrl(baseId: string, table: string, recordId: string): string {
  return `${tableUrl(baseId, table)}/${recordId}`;
}
