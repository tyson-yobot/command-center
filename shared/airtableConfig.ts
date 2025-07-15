export function getAirtableApiKey(): string {
  return 'paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa';
}

export const COMMAND_CENTER_BASE_ID = 'appRt8V3tH4g5Z51f'; // Primary Command Center base
export const LEAD_ENGINE_BASE_ID = 'appb2F3D77tC4DWla';   // YoBot Lead Engine
export const OPS_BASE_ID = 'appCoAtCZdARb4AM2';          // Ops & Alerts base

export const TABLE_NAMES = {
  METRICS_TRACKER: '📊 Command Center · Metrics Tracker',
  SCRAPED_LEADS: '📥 Scraped Leads (Universal)',
  INTEGRATION_TEST_LOG: '🧪 Integration Test Log',
  FOLLOW_UP_REMINDER: '📞 Follow-Up Reminder Tracker',
  CCEVENTS: '📅 Calendar Events',
};

export const SCRAPED_LEADS_TABLE = '📥 Scraped Leads (Universal)';
export const SCRAPED_LEADS_TABLE_NAME = '📥 Scraped Leads (Universal)';
export const SCRAPED_LEADS_TABLE_ID = 'tblPRZ4nHbtj9opU';
export const SALES_ORDERS_TABLE = '🧾 Sales Orders';

export function tableUrl(baseId: string, table: string): string {
  return `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`;
}

export function recordUrl(baseId: string, table: string, recordId: string): string {
  return `${tableUrl(baseId, table)}/${recordId}`;
}

