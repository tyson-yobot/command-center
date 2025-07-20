import axios from 'axios';

// Avoid circular import by defining the function directly in this file
// This function will be exported and used by other modules
import {
  getApiKey,
  COMMAND_CENTER_BASE_ID,
  SCRAPED_LEADS_TABLE_ID,
  OPS_BASE_ID,
  tableUrl,
  recordUrl,
  TABLE_NAMES
} from '../../../shared/airtableConfig';

// Define constants for fields and tables not exported from airtableConfig
const FOLLOWUP_TABLE = TABLE_NAMES.FOLLOW_UP_REMINDER;
const FIELD_FOLLOWUP_DATE = 'Follow-Up Date';
const FIELD_NAME = 'Name';
const FIELD_PHONE_NUMBER = 'Phone Number';
const FIELD_COMPLETED = 'Completed';

export interface LeadData {
  first_name: string;
  last_name: string;
  company: string;
  domain: string;
  email?: string;
  phone?: string;
  source: string;
}

interface EnrichedData {
  email?: string;
  phone?: string;
  job_title?: string;
  linkedin_url?: string;
}

interface DailySummaryPushResult {
  success: boolean;
  completed: number;
  pending: number;
  date: string;
  error?: string;
}

// Apollo enrichment function
async function enrichWithApollo(firstName: string, lastName: string, companyDomain: string): Promise<EnrichedData | null> {
  try {
    const apolloKey = process.env.APOLLO_API_KEY;
    if (!apolloKey) return null;

    const url = 'https://api.apollo.io/v1/mixed_people/search';
    const payload = {
      api_key: apolloKey,
      q_organization_domains: [companyDomain],
      person_titles: [],
      page: 1,
      person_names: [`${firstName} ${lastName}`]
    };

    const response = await axios.post(url, payload, { headers: { 'Content-Type': 'application/json' }, timeout: 10000 });
    if (response.status === 200 && response.data.people?.length) {
      const p = response.data.people[0];
      return { email: p.email, phone: p.phone, job_title: p.title, linkedin_url: p.linkedin_url };
    }
    return null;
  } catch (error: any) {
    console.error('Apollo enrichment failed:', error.message);
    return null;
  }
}

// Log operation to Airtable
export async function logOperation(operation: string, details: string, status: 'success' | 'error' | 'warning', notes?: string): Promise<void> {
  try {
    const url = `https://api.airtable.com/v0/${OPS_BASE_ID}/Operations`;
    const headers = {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json'
    };
    
    const payload = {
      records: [{
        fields: {
          Operation: operation,
          Details: details,
          Status: status,
          Notes: notes || '',
          Timestamp: new Date().toISOString()
        }
      }]
    };
    
    await axios.post(url, payload, { headers });
  } catch (error) {
    console.error('Failed to log operation to Airtable:', error);
  }
}

// For backward compatibility with existing imports
export const logEventToAirtable = logOperation;

// Daily summary push to Slack
export async function dailySummaryPush(): Promise<DailySummaryPushResult> {
  try {
    const today = new Date().toISOString().split('T')[0];

    const completedUrl = `https://api.airtable.com/v0/appRt8V3tH4g5Z5if/tblhxA9YOTf4ynJi2?filterByFormula=AND({Completed}=TRUE(), DATETIME_FORMAT({Follow-Up Date}, 'YYYY-MM-DD')='${today}')`;
    const pendingUrl = `https://api.airtable.com/v0/appRt8V3tH4g5Z5if/tblhxA9YOTf4ynJi2?filterByFormula=AND({Completed}=FALSE(), DATETIME_FORMAT({Follow-Up Date}, 'YYYY-MM-DD')='${today}')`;

    const headers = {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json'
    };

    const [completedResponse, pendingResponse] = await Promise.all([
      axios.get(completedUrl, { headers }),
      axios.get(pendingUrl, { headers })
    ]);

    const completed = completedResponse.data.records || [];
    const pending = pendingResponse.data.records || [];

    const message = `📊 *Follow-Up Summary:*\n✅ Completed: ${completed.length}\n🕐 Pending: ${pending.length}`;
    await logEventToAirtable('Follow-Up Summary', message, 'success', 'Daily summary pushed to Slack');

    return {
      success: true,
      completed: completed.length,
      pending: pending.length,
      date: today
    };
  } catch (error: any) {
    const axiosError = error as any;
    const errorMessage = `Daily summary error: ${axiosError.response?.data?.message || axiosError.message}`;
    console.error(errorMessage);
    return {
      success: false,
      error: errorMessage,
      completed: 0,
      pending: 0,
      date: new Date().toISOString().split('T')[0]
    };
  }
}
