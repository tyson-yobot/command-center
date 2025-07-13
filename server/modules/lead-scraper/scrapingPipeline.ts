import axios from 'axios';
import { logEventToAirtable } from './hubspotCRM';
import { getApiKey, BASE_ID, SCRAPED_LEADS_TABLE_ID } from '@shared/airtableConfig';

import { COMMAND_CENTER_BASE_ID } from '@shared/airtableConfig';

import {
  COMMAND_CENTER_BASE_ID,
  SCRAPED_LEADS_TABLE_ID,
  tableUrl,
  recordUrl,


interface LeadData {
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
      console.log('Apollo API key not configured, skipping enrichment');
      return null;
    }

    const url = "https://api.apollo.io/v1/mixed_people/search";
    const headers = {
      "Cache-Control": "no-cache",
      "Content-Type": "application/json"
    };
    
    const payload = {
      api_key: apolloKey,
      q_organization_domains: [companyDomain],
      person_titles: [],
      page: 1,
      person_names: [`${firstName} ${lastName}`]
    };

    const response = await axios.post(url, payload, { headers, timeout: 10000 });
    
    if (response.status === 200) {
      const data = response.data;
      if (data.people && data.people.length > 0) {
        const enriched = data.people[0];
        return {
          email: enriched.email,
          phone: enriched.phone,
          job_title: enriched.title,
          linkedin_url: enriched.linkedin_url
        };
      }
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

    const airtableBaseId = BASE_ID;
    const airtableTableId = SCRAPED_LEADS_TABLE_ID; // 📥 Scraped Leads · Universal
    const airtableToken = getApiKey();

    const airtableBaseId = COMMAND_CENTER_BASE_ID;



    const airtableBaseId = "appRt8V3tH4g5Z51f";

    const airtableTableId = "tblPRZ4nHbtj9opU"; // 📥 Scraped Leads · Universal

    const airtableToken = process.env.AIRTABLE_API_KEY || "";


    const airtableToken = process.env.AIRTABLE_API_KEY as string;


    const headers = {
      "Authorization": `Bearer ${airtableToken}`
    };

    let filterFormula = "";
    if (email) {
      filterFormula = `{📧 Email} = '${email}'`;
    } else if (fullName && domain) {
      filterFormula = `AND({🧑 Name} = '${fullName}', FIND('${domain}', {🌐 Website}))`;
    }

    if (!filterFormula) {
      return null;
    }

    const url = tableUrl(COMMAND_CENTER_BASE_ID, SCRAPED_LEADS_TABLE_ID);
    const response = await axios.get(url, {
      headers,
      params: {
        filterByFormula: filterFormula,
        maxRecords: 1
      }
    });

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

    const airtableBaseId = BASE_ID;
    const airtableTableId = SCRAPED_LEADS_TABLE_ID;
    const airtableToken = getApiKey();


    const airtableBaseId = COMMAND_CENTER_BASE_ID;


    const airtableToken = process.env.AIRTABLE_API_KEY as string;

    const url = recordUrl(COMMAND_CENTER_BASE_ID, SCRAPED_LEADS_TABLE_ID, recordId);

    const airtableBaseId = "appRt8V3tH4g5Z51f";
    const airtableTableId = "tblPRZ4nHbtj9opU";
    const airtableToken = process.env.AIRTABLE_API_KEY || "";

    const airtableToken = process.env.AIRTABLE_API_KEY as string;



    const headers = {
      "Authorization": `Bearer ${airtableToken}`,
      "Content-Type": "application/json"
    };
    
    const payload = {
      "fields": {
        "⚠️ Duplicates Found": true
      }
    };

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

    const airtableBaseId = BASE_ID;
    const airtableTableId = SCRAPED_LEADS_TABLE_ID;
    const airtableToken = getApiKey();


    const airtableBaseId = COMMAND_CENTER_BASE_ID;


    const airtableToken = process.env.AIRTABLE_API_KEY as string;

    const url = recordUrl(COMMAND_CENTER_BASE_ID, SCRAPED_LEADS_TABLE_ID, recordId);

    const airtableBaseId = "appRt8V3tH4g5Z51f";

    const airtableTableId = "tblPRZ4nHbtj9opU";

    const airtableToken = process.env.AIRTABLE_API_KEY || "";

    const airtableToken = process.env.AIRTABLE_API_KEY as string;



    const url = `https://api.airtable.com/v0/${airtableBaseId}/${airtableTableId}/${recordId}`;

    const headers = {
      "Authorization": `Bearer ${airtableToken}`,
      "Content-Type": "application/json"
    };
    
    const fields: any = {};
    if (email) fields["📧 Email"] = email;
    if (phone) fields["📱 Phone"] = phone;
    if (jobTitle) fields["🔍 Job Title"] = jobTitle;
    
    const payload = { fields };

    const response = await axios.patch(url, payload, { headers });
    console.log('Updated existing lead:', recordId);
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
    if (!slackUrl) {
      console.log('Slack webhook URL not configured, skipping duplicate alert');
      return;
    }
    
    const message = {
      "text": `⚠️ *Duplicate Lead Flagged* — ${fullName} @ ${domain} already exists in Airtable.`
    };
    
    await axios.post(slackUrl, message);
    console.log('Duplicate notification sent to Slack');
  } catch (error: any) {
    console.error('Failed to send duplicate notification:', error.message);
  }
}

// Push to Airtable Scraped Leads table
async function pushToAirtableLeads(leadData: LeadData): Promise<boolean> {
  try {

    const airtableBaseId = BASE_ID;
    const airtableTableId = SCRAPED_LEADS_TABLE_ID; // 📥 Scraped Leads · Universal


    const airtableBaseId = COMMAND_CENTER_BASE_ID;
    const airtableTableId = "tblPRZ4nHbtj9opU"; // 📥 Scraped Leads · Universal

    const airtableUrl = `https://api.airtable.com/v0/${airtableBaseId}/${airtableTableId}`;

    const airtableUrl = tableUrl(COMMAND_CENTER_BASE_ID, SCRAPED_LEADS_TABLE_ID);

    const headers = {
      "Authorization": `Bearer ${getApiKey()}`,
      "Content-Type": "application/json"
    };
    
    const payload = {
      "fields": {
        "📅 Timestamp": new Date().toISOString() + "Z",
        "🧑 Name": `${leadData.first_name} ${leadData.last_name}`,
        "📧 Email": leadData.email || "",
        "📱 Phone": leadData.phone || "",
        "🏢 Company": leadData.company,
        "🌐 Website": leadData.domain,
        "🔁 Synced to HubSpot?": false,
        "🏷 Source Tool": leadData.source
      }
    };
    
    const response = await axios.post(airtableUrl, payload, { headers });
    console.log('Lead pushed to Airtable:', leadData.first_name, leadData.last_name);
    return true;
  } catch (error: any) {
    console.error('Failed to push lead to Airtable:', error.message);
    return false;
  }
}

// Sync to HubSpot
async function syncToHubSpot(leadData: LeadData): Promise<boolean> {
  try {
    if (!leadData.email) {
      console.log('No email available, skipping HubSpot sync');
      return false;
    }

    const hubspotUrl = process.env.HUBSPOT_WEBHOOK_URL || "https://hook.us2.make.com/hubspot-sync";
    
    const response = await axios.post(hubspotUrl, {
      firstName: leadData.first_name,
      lastName: leadData.last_name,
      email: leadData.email,
      phone: leadData.phone,
      company: leadData.company,
      source: leadData.source,
      timestamp: new Date().toISOString()
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });

    console.log('Lead synced to HubSpot:', leadData.email);
    return true;
  } catch (error: any) {
    console.error('HubSpot sync failed:', error.message);
    return false;
  }
}

// Update Airtable sync status
async function updateSyncStatus(email: string, synced: boolean): Promise<void> {
  try {

    const airtableUrl = `https://api.airtable.com/v0/${BASE_ID}/${SCRAPED_LEADS_TABLE_ID}`;

    const airtableUrl = tableUrl(OPS_BASE_ID, 'tblScrapedLeads');

    const headers = {
      "Authorization": `Bearer ${getApiKey()}`
    };

    // Find record by email
    const searchResponse = await axios.get(airtableUrl, {
      headers,
      params: {
        filterByFormula: `{📧 Email} = "${email}"`,
        maxRecords: 1
      }
    });

    if (searchResponse.data.records.length > 0) {
      const recordId = searchResponse.data.records[0].id;
      
      // Update sync status
      await axios.patch(`${airtableUrl}/${recordId}`, {
        fields: {
          "🔁 Synced to HubSpot?": synced
        }
      }, { headers });
      
      console.log('Updated sync status for:', email);
    }
  } catch (error: any) {
    console.error('Failed to update sync status:', error.message);
  }
}

// Send Slack alert
async function sendSlackAlert(eventType: string, source: string, status: string, details: string): Promise<void> {
  try {
    const slackUrl = process.env.SLACK_WEBHOOK_URL;
    if (!slackUrl) {
      console.log('Slack webhook URL not configured, skipping alert');
      return;
    }
    
    const slackPayload = {
      "text": `📡 *${eventType}* from *${source}*\nStatus: *${status}*\n🧾 ${details}`
    };
    
    await axios.post(slackUrl, slackPayload);
    console.log('Slack alert sent:', eventType);
  } catch (error: any) {
    console.error('Failed to send Slack alert:', error.message);
  }
}

// Main scraping pipeline
export async function processScrapedLead(leadData: LeadData): Promise<{ success: boolean; message: string }> {
  try {
    console.log('Processing scraped lead:', leadData.first_name, leadData.last_name);
    
    // Step 1: Enrichment via Apollo if missing email/phone
    if (!leadData.email || !leadData.phone) {
      console.log('Missing email or phone, attempting Apollo enrichment...');
      
      const enriched = await enrichWithApollo(leadData.first_name, leadData.last_name, leadData.domain);
      
      if (enriched) {
        leadData.email = enriched.email || leadData.email;
        leadData.phone = enriched.phone || leadData.phone;
        
        console.log('Lead enriched with Apollo data');
        
        // Log enrichment
        await logEventToAirtable(
          'Apollo Enrichment',
          'Lead Processing',
          `${leadData.first_name} ${leadData.last_name}`,
          'SUCCESS',
          `Enriched with email: ${enriched.email}, phone: ${enriched.phone}`
        );
      }
    }

    // Step 2: Deduplication check
    const fullName = `${leadData.first_name} ${leadData.last_name}`;
    const existingRecordId = await isDuplicate(leadData.email || '', fullName, leadData.domain);
    
    if (existingRecordId) {
      console.log('Duplicate lead detected, updating existing record:', fullName);
      
      // Flag as duplicate and update with any new data
      await flagDuplicateInAirtable(existingRecordId);
      
      // Update existing record if we have new enriched data
      if (leadData.email || leadData.phone) {
        await updateExistingLead(existingRecordId, leadData.email, leadData.phone);
      }
      
      // Notify Slack about duplicate
      await notifyDuplicateSlack(fullName, leadData.domain);
      
      // Log duplicate handling
      await logEventToAirtable(
        'Duplicate Lead Updated',
        leadData.source,
        leadData.email || fullName,
        'SUCCESS',
        `Updated existing record with new data. Record ID: ${existingRecordId}`
      );
      
      return { success: true, message: 'Duplicate lead updated with new data' };
    }

    // Step 3: Push to Airtable
    const airtableSuccess = await pushToAirtableLeads(leadData);
    if (!airtableSuccess) {
      throw new Error('Failed to push lead to Airtable');
    }

    // Step 4: Sync to HubSpot
    let hubspotSuccess = false;
    if (leadData.email) {
      hubspotSuccess = await syncToHubSpot(leadData);
      
      // Update sync status in Airtable
      await updateSyncStatus(leadData.email, hubspotSuccess);
    }

    // Step 5: Log event
    await logEventToAirtable(
      'Lead Synced',
      leadData.source,
      leadData.email || fullName,
      hubspotSuccess ? 'SUCCESS' : 'PARTIAL',
      `Lead processed. Phone: ${leadData.phone || 'N/A'}, HubSpot: ${hubspotSuccess ? 'Synced' : 'Failed'}`
    );

    // Step 6: Send Slack alert
    await sendSlackAlert(
      'Lead Synced',
      leadData.source,
      hubspotSuccess ? 'SUCCESS' : 'PARTIAL',
      `${leadData.email || fullName} | ${leadData.phone || 'No phone'}`
    );

    return { 
      success: true, 
      message: `Lead processed successfully. HubSpot sync: ${hubspotSuccess ? 'Success' : 'Failed'}` 
    };

  } catch (error: any) {
    console.error('Lead processing pipeline failed:', error.message);
    
    // Log error
    await logEventToAirtable(
      'Lead Processing Error',
      leadData.source,
      `${leadData.first_name} ${leadData.last_name}`,
      'ERROR',
      error.message
    );

    return { success: false, message: error.message };
  }
}

// Batch processing for multiple leads
export async function processBatchLeads(leads: LeadData[]): Promise<{ processed: number; failed: number; results: any[] }> {
  const results = [];
  let processed = 0;
  let failed = 0;

  for (const lead of leads) {
    const result = await processScrapedLead(lead);
    results.push({ lead: `${lead.first_name} ${lead.last_name}`, ...result });
    
    if (result.success) {
      processed++;
    } else {
      failed++;
    }

    // Add delay between processing to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return { processed, failed, results };
}