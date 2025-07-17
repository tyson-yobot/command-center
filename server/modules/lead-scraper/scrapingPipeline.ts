import axios from 'axios';

import { logEventToAirtable } from './hubspotCRM';
import {
  getApiKey,
  COMMAND_CENTER_BASE_ID='appGtcRZU6QJngkQS',
  SCRAPED_LEADS_TABLE_ID='tbl185XqDi71n76II',
  OPS_BASE_ID='appGtcRZU6QJngkQS',
  tableUrl,
  recordUrl
} from '@shared/airtableConfig';

import { logEventToAirtable } from './airtableIntegrationLogger';
import { COMMAND_CENTER_BASE_ID, getApiKey, BASE_ID, SCRAPED_LEADS_TABLE_ID, tableUrl, recordUrl, OPS_BASE_ID } from '@shared/airtableConfig';

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

// Apollo enrichment function
async function enrichWithApollo(firstName: string, lastName: string, companyDomain: string): Promise<EnrichedData | null> {
  try {
    const apolloKey = process.env.APOLLO_API_KEY;
    if (!apolloKey) {
      return null;
    }

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

// Deduplication check - returns record ID if duplicate found
async function isDuplicate(email?: string, fullName?: string, domain?: string): Promise<string | null> {
  try {
    const airtableBaseId = "appRt8V3tH4g5Z5if";
    const airtableTableId = "tblPRZ4nHbtj9opU"; // 📥 Scraped Leads · Universal
    const airtableToken = process.env.AIRTABLE_API_KEY || "";

    const headers = { Authorization: `Bearer ${getApiKey()}` };
    let filterFormula = '';

    const url = tableUrl(COMMAND_CENTER_BASE_ID, SCRAPED_LEADS_TABLE_ID);
    const response = await axios.get(url, { headers, params: { filterByFormula: filterFormula, maxRecords: 1 } });
    if (response.status === 200) {
      const records = response.data.records || [];
      return records.length > 0 ? records[0].id : null;
    }
    return null;
  } catch (error: any) {
    console.error('Deduplication check failed:', error.message);
    return null;
  }
}

// Flag duplicate in Airtable
async function flagDuplicateInAirtable(recordId: string): Promise<boolean> {
  try {
    const airtableBaseId = "appRt8V3tH4g5Z5if";
    const airtableTableId = "tblPRZ4nHbtj9opU";
    const airtableToken = process.env.AIRTABLE_API_KEY || '';

    const url = recordUrl(COMMAND_CENTER_BASE_ID, SCRAPED_LEADS_TABLE_ID, recordId);

    const headers = {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json'
    };
    const payload = { fields: { '⚠️ Duplicates Found': true } };
    const response = await axios.patch(url, payload, { headers });
    return response.status === 200;
  } catch (error: any) {
    console.error('Failed to flag duplicate:', error.message);
    return false;
  }
}

// Update existing lead with new data
async function updateExistingLead(recordId: string, email?: string, phone?: string, jobTitle?: string): Promise<boolean> {
  try {
    const airtableBaseId = "appRt8V3tH4g5Z5if";
    const airtableTableId = "tblPRZ4nHbtj9opU";
    const airtableToken = process.env.AIRTABLE_API_KEY || '';

    const url = recordUrl(COMMAND_CENTER_BASE_ID, SCRAPED_LEADS_TABLE_ID, recordId);

    const headers = {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json'
    };
    const fields: any = {};
    if (email) fields['📧 Email'] = email;
    if (phone) fields['📱 Phone'] = phone;
    if (jobTitle) fields['🔍 Job Title'] = jobTitle;
    const payload = { fields };
    const response = await axios.patch(url, payload, { headers });
    return response.status === 200;
  } catch (error: any) {
    console.error('Failed to update existing lead:', error.message);
    return false;
  }
}

// Notify Slack about duplicate
async function notifyDuplicateSlack(fullName: string, domain: string): Promise<void> {
  try {
    const slackUrl = process.env.SLACK_WEBHOOK_URL;
    if (!slackUrl) return;
    const message = { text: `⚠️ *Duplicate Lead Flagged* — ${fullName} @ ${domain} already exists in Airtable.` };
    await axios.post(slackUrl, message);
  } catch (error: any) {
    console.error('Failed to send duplicate notification:', error.message);
  }
}

// Push to Airtable Scraped Leads table
async function pushToAirtableLeads(leadData: LeadData): Promise<boolean> {
  try {
    const airtableUrl = tableUrl(COMMAND_CENTER_BASE_ID, SCRAPED_LEADS_TABLE_ID);

    const airtableBaseId = 'appGtcRZU6QJngkQS';
    const airtableTableId = 'tbl185XqDi71n76II';
    const airtableToken = getApiKey();

    const headers = {
      "Authorization": `Bearer ${process.env.AIRTABLE_API_KEY}`,
      "Content-Type": "application/json"
    };

    const payload = {
      fields: {
        '📅 Timestamp': new Date().toISOString() + 'Z',
        '🧑 Name': `${leadData.first_name} ${leadData.last_name}`,
        '📧 Email': leadData.email || '',
        '📱 Phone': leadData.phone || '',
        '🏢 Company': leadData.company,
        '🌐 Website': leadData.domain,
        '🔁 Synced to HubSpot?': false,
        '🏷 Source Tool': leadData.source
      }
    };
    await axios.post(airtableUrl, payload, { headers });
    return true;
  } catch (error: any) {
    console.error('Failed to push lead to Airtable:', error.message);
    return false;
  }
}

// Sync to HubSpot
async function syncToHubSpot(leadData: LeadData): Promise<boolean> {
  try {
    if (!leadData.email) return false;
    const hubspotUrl = process.env.HUBSPOT_WEBHOOK_URL || 'https://hook.us2.make.com/hubspot-sync';
    await axios.post(hubspotUrl, {
      firstName: leadData.first_name,
      lastName: leadData.last_name,
      email: leadData.email,
      phone: leadData.phone,
      company: leadData.company,
      source: leadData.source,
      timestamp: new Date().toISOString()
    }, { headers: { 'Content-Type': 'application/json' }, timeout: 10000 });
    return true;
  } catch (error: any) {
    console.error('HubSpot sync failed:', error.message);
    return false;
  }
}

// Update Airtable sync status
async function updateSyncStatus(email: string, synced: boolean): Promise<void> {
  try {
    const airtableUrl = tableUrl(OPS_BASE_ID, 'tblScrapedLeads');
    const headers = { Authorization: `Bearer ${getApiKey()}` };

    const airtableBaseId = 'appGtcRZU6QJngkQS';
    const airtableTableId = 'tbl185XqDi71n76II';

    const headers = {
      "Authorization": `Bearer ${process.env.AIRTABLE_API_KEY}`
    };

    // Find record by email
    const searchResponse = await axios.get(airtableUrl, {
      headers,
      params: { filterByFormula: `{📧 Email} = "${email}"`, maxRecords: 1 }
    });
    if (searchResponse.data.records.length > 0) {
      const recordId = searchResponse.data.records[0].id;
      await axios.patch(`${airtableUrl}/${recordId}`, { fields: { '🔁 Synced to HubSpot?': synced } }, { headers });
    }
  } catch (error: any) {
    console.error('Failed to update sync status:', error.message);
  }
}

// Notify Slack about duplicate
async function notifyDuplicateSlack(fullName: string, domain: string): Promise<void> {
  try {
    const slackUrl = process.env.SLACK_WEBHOOK_URL;
    if (!slackUrl) return;
    const message = { text: `⚠️ *Duplicate Lead Flagged* — ${fullName} @ ${domain} already exists in Airtable.` };
    await axios.post(slackUrl, message);
  } catch (error: any) {
    console.error('Failed to send duplicate notification:', error.message);
  }
}

// Push to Airtable Scraped Leads table
async function pushToAirtableLeads(leadData: LeadData): Promise<boolean> {
  try {
    const airtableUrl = tableUrl(COMMAND_CENTER_BASE_ID, SCRAPED_LEADS_TABLE_ID);

    const airtableBaseId = 'appGtcRZU6QJngkQS';
    const airtableTableId = 'tbl185XqDi71n76II';
    const airtableToken = getApiKey();

    const headers = {
      "Authorization": `Bearer ${process.env.AIRTABLE_API_KEY}`,
      "Content-Type": "application/json"
    };

    const payload = {
      fields: {
        '📅 Timestamp': new Date().toISOString() + 'Z',
        '🧑 Name': `${leadData.first_name} ${leadData.last_name}`,
        '📧 Email': leadData.email || '',
        '📱 Phone': leadData.phone || '',
        '🏢 Company': leadData.company,
        '🌐 Website': leadData.domain,
        '🔁 Synced to HubSpot?': false,
        '🏷 Source Tool': leadData.source
      }
    };
    await axios.post(airtableUrl, payload, { headers });
    return true;
  } catch (error: any) {
    console.error('Failed to push lead to Airtable:', error.message);
    return false;
  }
}

// Sync to HubSpot
async function syncToHubSpot(leadData: LeadData): Promise<boolean> {
  try {
    if (!leadData.email) return false;
    const hubspotUrl = process.env.HUBSPOT_WEBHOOK_URL || 'https://hook.us2.make.com/hubspot-sync';
    await axios.post(hubspotUrl, {
      firstName: leadData.first_name,
      lastName: leadData.last_name,
      email: leadData.email,
      phone: leadData.phone,
      company: leadData.company,
      source: leadData.source,
      timestamp: new Date().toISOString()
    }, { headers: { 'Content-Type': 'application/json' }, timeout: 10000 });
    return true;
  } catch (error: any) {
    console.error('HubSpot sync failed:', error.message);
    return false;
  }
}

// Update Airtable sync status
async function updateSyncStatus(email: string, synced: boolean): Promise<void> {
  try {
    const airtableUrl = tableUrl(OPS_BASE_ID, 'tblScrapedLeads');
    const headers = { Authorization: `Bearer ${getApiKey()}` };

    const airtableBaseId = 'appGtcRZU6QJngkQS';
    const airtableTableId = 'tbl185XqDi71n76II';

    const headers = {
      "Authorization": `Bearer ${process.env.AIRTABLE_API_KEY}`
    };

    // Find record by email
    const searchResponse = await axios.get(airtableUrl, {
      headers,
      params: { filterByFormula: `{📧 Email} = "${email}"`, maxRecords: 1 }
    });
    if (searchResponse.data.records.length > 0) {
      const recordId = searchResponse.data.records[0].id;
      await axios.patch(`${airtableUrl}/${recordId}`, { fields: { '🔁 Synced to HubSpot?': synced } }, { headers });
    }
  } catch (error: any) {
    console.error('Failed to update sync status:', error.message);
  }
}

// Notify Slack about duplicate
async function notifyDuplicateSlack(fullName: string, domain: string): Promise<void> {
  try {
    const slackUrl = process.env.SLACK_WEBHOOK_URL;
    if (!slackUrl) return;
    const message = { text: `⚠️ *Duplicate Lead Flagged* — ${fullName} @ ${domain} already exists in Airtable.` };
    await axios.post(slackUrl, message);
  } catch (error: any) {
    console.error('Failed to send duplicate notification:', error.message);
  }
}

// Push to Airtable Scraped Leads table
async function pushToAirtableLeads(leadData: LeadData): Promise<boolean> {
  try {
    const airtableUrl = tableUrl(COMMAND_CENTER_BASE_ID, SCRAPED_LEADS_TABLE_ID);

    const airtableBaseId = 'appGtcRZU6QJngkQS';
    const airtableTableId = 'tbl185XqDi71n76II';
    const airtableToken = getApiKey();

    const headers = {
      "Authorization": `Bearer ${process.env.AIRTABLE_API_KEY}`,
      "Content-Type": "application/json"
    };

    const payload = {
      fields: {
        '📅 Timestamp': new Date().toISOString() + 'Z',
        '🧑 Name': `${leadData.first_name} ${leadData.last_name}`,
        '📧 Email': leadData.email || '',
        '📱 Phone': leadData.phone || '',
        '🏢 Company': leadData.company,
        '🌐 Website': leadData.domain,
        '🔁 Synced to HubSpot?': false,
        '🏷 Source Tool': leadData.source
      }
    };
    await axios.post(airtableUrl, payload, { headers });
    return true;
  } catch (error: any) {
    console.error('Failed to push lead to Airtable:', error.message);
    return false;
  }
}

// Sync to HubSpot
async function syncToHubSpot(leadData: LeadData): Promise<boolean> {
  try {
    if (!leadData.email) return false;
    const hubspotUrl = process.env.HUBSPOT_WEBHOOK_URL || 'https://hook.us2.make.com/hubspot-sync';
    await axios.post(hubspotUrl, {
      firstName: leadData.first_name,
      lastName: leadData.last_name,
      email: leadData.email,
      phone: leadData.phone,
      company: leadData.company,
      source: leadData.source,
      timestamp: new Date().toISOString()
    }, { headers: { 'Content-Type': 'application/json' }, timeout: 10000 });
    return true;
  } catch (error: any) {
    console.error('HubSpot sync failed:', error.message);
    return false;
  }
}

// Update Airtable sync status
async function updateSyncStatus(email: string, synced: boolean): Promise<void> {
  try {
    const airtableUrl = tableUrl(OPS_BASE_ID, 'tblScrapedLeads');
    const headers = { Authorization: `Bearer ${getApiKey()}` };

    const airtableBaseId = 'appGtcRZU6QJngkQS';
    const airtableTableId = 'tbl185XqDi71n76II';

    const headers = {
      "Authorization": `Bearer ${process.env.AIRTABLE_API_KEY}`
    };

    // Find record by email
    const searchResponse = await axios.get(airtableUrl, {
      headers,
      params: { filterByFormula: `{📧 Email} = "${email}"`, maxRecords: 1 }
    });
    if (searchResponse.data.records.length > 0) {
      const recordId = searchResponse.data.records[0].id;
      await axios.patch(`${airtableUrl}/${recordId}`, { fields: { '🔁 Synced to HubSpot?': synced } }, { headers });
    }
  } catch (error: any) {
    console.error('Failed to update sync status:', error.message);
  }
}

// Notify Slack about duplicate
async function notifyDuplicateSlack(fullName: string, domain: string): Promise<void> {
  try {
    const slackUrl = process.env.SLACK_WEBHOOK_URL;
    if (!slackUrl) return;
    const message = { text: `⚠️ *Duplicate Lead Flagged* — ${fullName} @ ${domain} already exists in Airtable.` };
    await axios.post(slackUrl, message);
  } catch (error: any) {
    console.error('Failed to send duplicate notification:', error.message);
  }
}

// Push to Airtable Scraped Leads table
async function pushToAirtableLeads(leadData: LeadData): Promise<boolean> {
  try {
    const airtableUrl = tableUrl(COMMAND_CENTER_BASE_ID, SCRAPED_LEADS_TABLE_ID);

    const airtableBaseId = 'appGtcRZU6QJngkQS';
    const airtableTableId = 'tbl185XqDi71n76II';
    const airtableToken = getApiKey();

    const headers = {
      "Authorization": `Bearer ${process.env.AIRTABLE_API_KEY}`,
      "Content-Type": "application/json"
    };

    const payload = {
      fields: {
        '📅 Timestamp': new Date().toISOString() + 'Z',
        '🧑 Name': `${leadData.first_name} ${leadData.last_name}`,
        '📧 Email': leadData.email || '',
        '📱 Phone': leadData.phone || '',
        '🏢 Company': leadData.company,
        '🌐 Website': leadData.domain,
        '🔁 Synced to HubSpot?': false,
        '🏷 Source Tool': leadData.source
      }
    };
    await axios.post(airtableUrl, payload, { headers });
    return true;
  } catch (error: any) {
    console.error('Failed to push lead to Airtable:', error.message);
    return false;
  }
}

// Sync to HubSpot
async function syncToHubSpot(leadData: LeadData): Promise<boolean> {
  try {
    if (!leadData.email) return false;
    const hubspotUrl = process.env.HUBSPOT_WEBHOOK_URL || 'https://hook.us2.make.com/hubspot-sync';
    await axios.post(hubspotUrl, {
      firstName: leadData.first_name,
      lastName: leadData.last_name,
      email: leadData.email,
      phone: leadData.phone,
      company: leadData.company,
      source: leadData.source,
      timestamp: new Date().toISOString()
    }, { headers: { 'Content-Type': 'application/json' }, timeout: 10000 });
    return true;
  } catch (error: any) {
    console.error('HubSpot sync failed:', error.message);
    return false;
  }
}

// Update Airtable sync status
async function updateSyncStatus(email: string, synced: boolean): Promise<void> {
  try {
    const airtableUrl = tableUrl(OPS_BASE_ID, 'tblScrapedLeads');
    const headers = { Authorization: `Bearer ${getApiKey()}` };

    const airtableBaseId = 'appGtcRZU6QJngkQS';
    const airtableTableId = 'tbl185XqDi71n76II';

    const headers = {
      "Authorization": `Bearer ${process.env.AIRTABLE_API_KEY}`
    };

    // Find record by email
    const searchResponse = await axios.get(airtableUrl, {
      headers,
      params: { filterByFormula: `{📧 Email} = "${email}"`, maxRecords: 1 }
    });
    if (searchResponse.data.records.length > 0) {
      const recordId = searchResponse.data.records[0].id;
      await axios.patch(`${airtableUrl}/${recordId}`, { fields: { '🔁 Synced to HubSpot?': synced } }, { headers });
    }
  } catch (error: any) {
    console.error('Failed to update sync status:', error.message);
  }
}

// Notify Slack about duplicate
async function notifyDuplicateSlack(fullName: string, domain: string): Promise<void> {
  try {
    const slackUrl = process.env.SLACK_WEBHOOK_URL;
    if (!slackUrl) return;
    const message = { text: `⚠️ *Duplicate Lead Flagged* — ${fullName} @ ${domain} already exists in Airtable.` };
    await axios.post(slackUrl, message);
  } catch (error: any) {
    console.error('Failed to send duplicate notification:', error.message);
  }
}

// Push to Airtable Scraped Leads table
async function pushToAirtableLeads(leadData: LeadData): Promise<boolean> {
  try {
    const airtableUrl = tableUrl(COMMAND_CENTER_BASE_ID, SCRAPED_LEADS_TABLE_ID);

    const airtableBaseId = 'appGtcRZU6QJngkQS';
    const airtableTableId = 'tbl185XqDi71n76II';
    const airtableToken = getApiKey();

    const headers = {
      "Authorization": `Bearer ${process.env.AIRTABLE_API_KEY}`,
      "Content-Type": "application/json"
    };

    const payload = {
      fields: {
        '📅 Timestamp': new Date().toISOString() + 'Z',
        '🧑 Name': `${leadData.first_name} ${leadData.last_name}`,
        '📧 Email': leadData.email || '',
        '📱 Phone': leadData.phone || '',
        '🏢 Company': leadData.company,
        '🌐 Website': leadData.domain,
        '🔁 Synced to HubSpot?': false,
        '🏷 Source Tool': leadData.source
      }
    };
    await axios.post(airtableUrl, payload, { headers });
    return true;
  } catch (error: any) {
    console.error('Failed to push lead to Airtable:', error.message);
    return false;
  }
}

// Sync to HubSpot
async function syncToHubSpot(leadData: LeadData): Promise<boolean> {
  try {
    if (!leadData.email) return false;
    const hubspotUrl = process.env.HUBSPOT_WEBHOOK_URL || 'https://hook.us2.make.com/hubspot-sync';
    await axios.post(hubspotUrl, {
      firstName: leadData.first_name,
      lastName: leadData.last_name,
      email: leadData.email,
      phone: leadData.phone,
      company: leadData.company,
      source: leadData.source,
      timestamp: new Date().toISOString()
    }, { headers: { 'Content-Type': 'application/json' }, timeout: 10000 });
    return true;
  } catch (error: any) {
    console.error('HubSpot sync failed:', error.message);
    return false;
  }
}

// Update Airtable sync status
async function updateSyncStatus(email: string, synced: boolean): Promise<void> {
  try {
    const airtableUrl = tableUrl(OPS_BASE_ID, 'tblScrapedLeads');
    const headers = { Authorization: `Bearer ${getApiKey()}` };

    const airtableBaseId = 'appGtcRZU6QJngkQS';
    const airtableTableId = 'tbl185XqDi71n76II';

    const headers = {
      "Authorization": `Bearer ${process.env.AIRTABLE_API_KEY}`
    };

    // Find record by email
    const searchResponse = await axios.get(airtableUrl, {
      headers,
      params: { filterByFormula: `{📧 Email} = "${email}"`, maxRecords: 1 }
    });
    if (searchResponse.data.records.length > 0) {
      const recordId = searchResponse.data.records[0].id;
      await axios.patch(`${airtableUrl}/${recordId}`, { fields: { '🔁 Synced to HubSpot?': synced } }, { headers });
    }
  } catch (error: any) {
    console.error('Failed to update sync status:', error.message);
  }
}

// Notify Slack about duplicate
async function notifyDuplicateSlack(fullName: string, domain: string): Promise<void> {
  try {
    const slackUrl = process.env.SLACK_WEBHOOK_URL;
    if (!slackUrl) return;
    const message = { text: `⚠️ *Duplicate Lead Flagged* — ${fullName} @ ${domain} already exists in Airtable.` };
    await axios.post(slackUrl, message);
  } catch (error: any) {
    console.error('Failed to send duplicate notification:', error.message);
  }
}

// Push to Airtable Scraped Leads table
async function pushToAirtableLeads(leadData: LeadData): Promise<boolean> {
  try {
    const airtableUrl = tableUrl(COMMAND_CENTER_BASE_ID, SCRAPED_LEADS_TABLE_ID);

    const airtableBaseId = 'appGtcRZU6QJngkQS';
    const airtableTableId = 'tbl185XqDi71n76II';
    const airtableToken = getApiKey();

    const headers = {
      "Authorization": `Bearer ${process.env.AIRTABLE_API_KEY}`,
      "Content-Type": "application/json"
    };

    const payload = {
      fields: {
        '📅 Timestamp': new Date().toISOString() + 'Z',
        '🧑 Name': `${leadData.first_name} ${leadData.last_name}`,
        '📧 Email': leadData.email || '',
        '📱 Phone': leadData.phone || '',
        '🏢 Company': leadData.company,
        '🌐 Website': leadData.domain,
        '🔁 Synced to HubSpot?': false,
        '🏷 Source Tool': leadData.source
      }
    };
    await axios.post(airtableUrl, payload, { headers });
    return true;
  } catch (error: any) {
    console.error('Failed to push lead to Airtable:', error.message);
    return false;
  }
}

// Sync to HubSpot
async function syncToHubSpot(leadData: LeadData): Promise<boolean> {
  try {
    if (!leadData.email) return false;
    const hubspotUrl = process.env.HUBSPOT_WEBHOOK_URL || 'https://hook.us2.make.com/hubspot-sync';
    await axios.post(hubspotUrl, {
      firstName: leadData.first_name,
      lastName: leadData.last_name,
      email: leadData.email,
      phone: leadData.phone,
      company: leadData.company,
      source: leadData.source,
      timestamp: new Date().toISOString()
    }, { headers: { 'Content-Type': 'application/json' }, timeout: 10000 });
    return true;
  } catch (error: any) {
    console.error('HubSpot sync failed:', error.message);
    return false;
  }
}

// Update Airtable sync status
async function updateSyncStatus(email: string, synced: boolean): Promise<void> {
  try {
    const airtableUrl = tableUrl(OPS_BASE_ID, 'tblScrapedLeads');
    const headers = { Authorization: `Bearer ${getApiKey()}` };

    const airtableBaseId = 'appGtcRZU6QJngkQS';
    const airtableTableId = 'tbl185XqDi71n76II';

    const headers = {
      "Authorization": `Bearer ${process.env.AIRTABLE_API_KEY}`
    };

    // Find record by email
    const searchResponse = await axios.get(airtableUrl, {
      headers,
      params: { filterByFormula: `{📧 Email} = "${email}"`, maxRecords: 1 }
    });
    if (searchResponse.data.records.length > 0) {
      const recordId = searchResponse.data.records[0].id;
      await axios.patch(`${airtableUrl}/${recordId}`, { fields: { '🔁 Synced to HubSpot?': synced } }, { headers });
    }
  } catch (error: any) {
    console.error('Failed to update sync status:', error.message);
  }
}

// Notify Slack about duplicate
async function notifyDuplicateSlack(fullName: string, domain: string): Promise<void> {
  try {
    const slackUrl = process.env.SLACK_WEBHOOK_URL;
    if (!slackUrl) return;
    const message = { text: `⚠️ *Duplicate Lead Flagged* — ${fullName} @ ${domain} already exists in Airtable.` };
    await axios.post(slackUrl, message);
  } catch (error: any) {
    console.error('Failed to send duplicate notification:', error.message);
  }
}

// Push to Airtable Scraped Leads table
async function pushToAirtableLeads(leadData: LeadData): Promise<boolean> {
  try {
    const airtableUrl = tableUrl(COMMAND_CENTER_BASE_ID, SCRAPED_LEADS_TABLE_ID);

    const airtableBaseId = 'appGtcRZU6QJngkQS';
    const airtableTableId = 'tbl185XqDi71n76II';
    const airtableToken = getApiKey();

    const headers = {
      "Authorization": `Bearer ${process.env.AIRTABLE_API_KEY}`,
      "Content-Type": "application/json"
    };

    const payload = {
      fields: {
        '📅 Timestamp': new Date().toISOString() + 'Z',
        '🧑 Name': `${leadData.first_name} ${leadData.last_name}`,
        '📧 Email': leadData.email || '',
        '📱 Phone': leadData.phone || '',
        '🏢 Company': leadData.company,
        '🌐 Website': leadData.domain,
        '🔁 Synced to HubSpot?': false,
        '🏷 Source Tool': leadData.source
      }
    };
    await axios.post(airtableUrl, payload, { headers });
    return true;
  } catch (error: any) {
    console.error('Failed to push lead to Airtable:', error.message);
    return false;
  }
}

// Sync to HubSpot
async function syncToHubSpot(leadData: LeadData): Promise<boolean> {
  try {
    if (!leadData.email) return false;
    const hubspotUrl = process.env.HUBSPOT_WEBHOOK_URL || 'https://hook.us2.make.com/hubspot-sync';
    await axios.post(hubspotUrl, {
      firstName: leadData.first_name,
      lastName: leadData.last_name,
      email: leadData.email,
      phone: leadData.phone,
      company: leadData.company,
      source: leadData.source,
      timestamp: new Date().toISOString()
    }, { headers: { 'Content-Type': 'application/json' }, timeout: 10000 });
    return true;
  } catch (error: any) {
    console.error('HubSpot sync failed:', error.message);
    return false;
  }
}

// Update Airtable sync status
async function updateSyncStatus(email: string, synced: boolean): Promise<void> {
  try {
    const airtableUrl = tableUrl(OPS_BASE_ID, 'tblScrapedLeads');
    const headers = { Authorization: `Bearer ${getApiKey()}` };

    const airtableBaseId = 'appGtcRZU6QJngkQS';
    const airtableTableId = 'tbl185XqDi71n76II';

    const headers = {
      "Authorization": `Bearer ${process.env.AIRTABLE_API_KEY}`
    };

    // Find record by email
    const searchResponse = await axios.get(airtableUrl, {
      headers,
      params: { filterByFormula: `{📧 Email} = "${email}"`, maxRecords: 1 }
    });
    if (searchResponse.data.records.length > 0) {
      const recordId = searchResponse.data.records[0].id;
      await axios.patch(`${airtableUrl}/${recordId}`, { fields: { '🔁 Synced to HubSpot?': synced } }, { headers });
    }
  } catch (error: any) {
    console.error('Failed to update sync status:', error.message);
  }
}

// Notify Slack about duplicate
async function notifyDuplicateSlack(fullName: string, domain: string): Promise<void> {
  try {
    const slackUrl = process.env.SLACK_WEBHOOK_URL;
    if (!slackUrl) return;
    const message = { text: `⚠️ *Duplicate Lead Flagged* — ${fullName} @ ${domain} already exists in Airtable.` };
    await axios.post(slackUrl, message);
  } catch (error: any) {
    console.error('Failed to send duplicate notification:', error.message);
  }
}

// Push to Airtable Scraped Leads table
async function pushToAirtableLeads(leadData: LeadData): Promise<boolean> {
  try {
    const airtableUrl = tableUrl(COMMAND_CENTER_BASE_ID, SCRAPED_LEADS_TABLE_ID);

    const airtableBaseId = 'appGtcRZU6QJngkQS';
    const airtableTableId = 'tbl185XqDi71n76II';
    const airtableToken = getApiKey();

    const headers = {
      "Authorization": `Bearer ${process.env.AIRTABLE_API_KEY}`,
      "Content-Type": "application/json"
    };

    const payload = {
      fields: {
        '📅 Timestamp': new Date().toISOString() + 'Z',
        '🧑 Name': `${leadData.first_name} ${leadData.last_name}`,
        '📧 Email': leadData.email || '',
        '📱 Phone': leadData.phone || '',
        '🏢 Company': leadData.company,
        '🌐 Website': leadData.domain,
        '🔁 Synced to HubSpot?': false,
        '🏷 Source Tool': leadData.source
      }
    };
    await axios.post(airtableUrl, payload, { headers });
    return true;
  } catch (error: any) {
    console.error('Failed to push lead to Airtable:', error.message);
    return false;
  }
}

// Sync to HubSpot
async function syncToHubSpot(leadData: LeadData): Promise<boolean> {
  try {
    if (!leadData.email) return false;
    const hubspotUrl = process.env.HUBSPOT_WEBHOOK_URL || 'https://hook.us2.make.com/hubspot-sync';
    await axios.post(hubspotUrl, {
      firstName: leadData.first_name,
      lastName: leadData.last_name,
      email: leadData.email,
      phone: leadData.phone,
      company: leadData.company,
      source: leadData.source,
      timestamp: new Date().toISOString()
    }, { headers: { 'Content-Type': 'application/json' }, timeout: 10000 });
    return true;
  } catch (error: any) {
    console.error('HubSpot sync failed:', error.message);
    return false;
  }
}

// Update Airtable sync status
async function updateSyncStatus(email: string, synced: boolean): Promise<void> {
  try {
    const airtableUrl = tableUrl(OPS_BASE_ID, 'tblScrapedLeads');
    const headers = { Authorization: `Bearer ${getApiKey()}` };

    const airtableBaseId = 'appGtcRZU6QJngkQS';
    const airtableTableId = 'tbl185XqDi71n76II';

    const headers = {
      "Authorization": `Bearer ${process.env.AIRTABLE_API_KEY}`
    };

    // Find record by email
    const searchResponse = await axios.get(airtableUrl, {
      headers,
      params: { filterByFormula: `{📧 Email} = "${
