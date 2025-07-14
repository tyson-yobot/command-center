export function getAirtableApiKey(): string | undefined {
  return process.env.AIRTABLE_API_KEY;
}

export const COMMAND_CENTER_BASE_ID = 'appRt8V3tH4g5Z51f';
export const LEAD_ENGINE_BASE_ID = 'appb2F3D77tC4DWla';
export const OPS_BASE_ID = 'appCoAtCZdARb4AM2';

export const TABLE_NAMES = {
  METRICS_TRACKER: 'Command Center - Metrics Tracker Table',
  SCRAPED_LEADS: '📥 Scraped Leads (Universal)',
  INTEGRATION_TEST_LOG: 'Integration Test Log Table',
  FOLLOW_UP_REMINDER: '📞 Follow-Up Reminder Tracker',
  CCEVENTS: 'tblCCEVENTS',
};

export const SCRAPED_LEADS_TABLE_ID = 'tblPRZ4nHbtj9opU';
export const SALES_ORDERS_TABLE = 'Sales Orders';

export function tableUrl(baseId: string, table: string): string {
  return `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`;
}

export function recordUrl(baseId: string, table: string, recordId: string): string {
  return `${tableUrl(baseId, table)}/${recordId}`;
}

