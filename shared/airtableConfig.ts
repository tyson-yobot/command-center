
// Retrieve Airtable API key without throwing. Useful for optional integrations
export function getAirtableApiKey(): string | undefined {
  return process.env.AIRTABLE_API_KEY;
}

// Retrieve Airtable API key and throw if it's missing
export function getApiKey(): string {
  const key = getAirtableApiKey();
  if (!key) {
    throw new Error('AIRTABLE_API_KEY is not set');
  }
  return key;
}

// Centralized base identifiers used throughout the system
export const BASE_IDS = {
  COMMAND_CENTER: 'appRt8V3tH4g5Z51f', // Primary Command Center base
  LEAD_ENGINE: 'appb2F3D77tC4DWla',   // YoBot Lead Engine
  OPS: 'appCoAtCZdARb4AM2',          // Ops & Alerts base
} as const;

// Default base ID pulled from environment (falls back to Command Center)
export const BASE_ID = process.env.AIRTABLE_BASE_ID || BASE_IDS.COMMAND_CENTER;

// Commonly used table names
export const TABLE_NAMES = {
  METRICS_TRACKER: 'Command Center - Metrics Tracker Table',
  SCRAPED_LEADS: 'Scraped Leads (Universal) Table',
  INTEGRATION_TEST_LOG: 'Integration Test Log Table',
  FOLLOW_UP_REMINDER: '📞 Follow-Up Reminder Tracker',
  CCEVENTS: 'tblCCEVENTS',
} as const;

// Individual constants maintained for backwards compatibility
export const COMMAND_CENTER_BASE_ID = BASE_IDS.COMMAND_CENTER;
export const LEAD_ENGINE_BASE_ID = BASE_IDS.LEAD_ENGINE;
export const OPS_BASE_ID = BASE_IDS.OPS;

export const SCRAPED_LEADS_TABLE = TABLE_NAMES.SCRAPED_LEADS;
export const SCRAPED_LEADS_TABLE_NAME = '📥 Scraped Leads (Universal)';
export const SCRAPED_LEADS_TABLE_ID = 'tblPRZ4nHbtj9opU';
export const INTEGRATION_TEST_LOG_TABLE = TABLE_NAMES.INTEGRATION_TEST_LOG;
export const SALES_ORDERS_TABLE = 'Sales Orders';

// Unified export of bases and tables for convenience
export const AIRTABLE = {
  BASE_IDS,
  TABLE_NAMES,
};

export function tableUrl(baseId: string, table: string): string {
  return `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`;
}

export function recordUrl(baseId: string, table: string, recordId: string): string {
  return `${tableUrl(baseId, table)}/${recordId}`;

}

