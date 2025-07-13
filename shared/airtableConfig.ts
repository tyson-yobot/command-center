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

export const METRICS_TABLE_NAME = 'Command Center - Metrics Tracker Table';
export const SCRAPED_LEADS_TABLE_NAME = '📥 Scraped Leads (Universal)';
export const SCRAPED_LEADS_TABLE_ID = 'tblPRZ4nHbtj9opU';
