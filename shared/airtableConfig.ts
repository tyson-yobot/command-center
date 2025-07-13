export const COMMAND_CENTER_BASE_ID = 'appRt8V3tH4g5Z51f';
export const LEAD_ENGINE_BASE_ID = 'appb2F3D77tC4DWla';

export const TABLE_NAMES = {
  METRICS_TRACKER: 'Command Center - Metrics Tracker Table',
  SCRAPED_LEADS: 'Scraped Leads (Universal) Table',
  INTEGRATION_TEST_LOG: 'Integration Test Log Table',
  FOLLOW_UP_REMINDER: '📞 Follow-Up Reminder Tracker',
  CCEVENTS: 'tblCCEVENTS',
};

export function getAirtableApiKey(): string | undefined {
  return process.env.AIRTABLE_API_KEY;
}
