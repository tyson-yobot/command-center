import axios from 'axios';

interface ScrapedLead {
  id: string;
  fields: {
    '👤 Lead Owner'?: string;
    '🛠️ Lead Source'?: string;
    '🆔 Source Campaign ID'?: string;
    '🌐 Platform'?: string;
    '🧑‍💼 Name'?: string;
    '✉️ Email'?: string;
    '📞 Phone'?: string;
    '🏢 Company'?: string;
    '🔗 Website'?: string;
    '💼 Title'?: string;
    '📍 Location'?: string;
    '📞 Call Status'?: string;
    '✅ Synced to HubSpot?'?: boolean;
    '🤖 Synced to YoBot Queue?'?: boolean;
    '📈 Enrichment Score'?: number;
    '📅 Date Added'?: string;
    '# Call Attempts'?: number;
    '📅 Last Called'?: string;
    '🚨 Slack Alert Sent'?: boolean;
    '🧠 Escalated'?: boolean;
    '🚦 Status'?: string;
  };
}

interface AirtableResponse {
  records: ScrapedLead[];
  offset?: string;
}

class AirtableLeadsService {
  private baseId = 'appb2f3D77Tc4DWAr';
  private tableId = 'tbluqrDSomu5UVhDw';
  private tableName = 'Scraped Leads (Universal)';
  private apiKey: string;

  constructor() {
    // Try both available API keys
    let rawApiKey = process.env.AIRTABLE_API_KEY || '';
    
    // If the API key is corrupted, try the personal access token
    if (!rawApiKey || rawApiKey.includes('Please re-run')) {
      rawApiKey = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN || '';
    }
    
    if (!rawApiKey) {
      throw new Error('Airtable API key not configured');
    }
    
    // Extract valid API key (starts with 'pat' for personal access tokens or 'key' for legacy)
    const patMatch = rawApiKey.match(/pat[a-zA-Z0-9.]+/);
    const keyMatch = rawApiKey.match(/key[a-zA-Z0-9]+/);
    
    if (patMatch) {
      this.apiKey = patMatch[0];
    } else if (keyMatch) {
      this.apiKey = keyMatch[0];
    } else {
      // Clean the key and use first valid portion
      this.apiKey = rawApiKey.substring(0, 100).trim().replace(/[\r\n\t"'\s]/g, '');
    }
    
    if (!this.apiKey || this.apiKey.length < 10) {
      throw new Error('Invalid Airtable API key format');
    }
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  async getScrapedLeads(filters?: {
    callStatus?: string;
    syncedToYoBot?: boolean;
    maxRecords?: number;
  }): Promise<ScrapedLead[]> {
    try {
      let filterFormula = '';
      const conditions = [];

      if (filters?.callStatus) {
        conditions.push(`{📞 Call Status} = "${filters.callStatus}"`);
      }
      
      if (filters?.syncedToYoBot !== undefined) {
        conditions.push(`{🤖 Synced to YoBot Queue?} = ${filters.syncedToYoBot ? 'TRUE()' : 'FALSE()'}`);
      }

      if (conditions.length > 0) {
        filterFormula = conditions.length === 1 ? conditions[0] : `AND(${conditions.join(', ')})`;
      }

      const params: any = {
        maxRecords: filters?.maxRecords || 100,
        sort: [{ field: '📅 Date Added', direction: 'desc' }]
      };

      if (filterFormula) {
        params.filterByFormula = filterFormula;
      }

      const url = `https://api.airtable.com/v0/${this.baseId}/${encodeURIComponent(this.tableName)}`;
      
      const response = await axios.get<AirtableResponse>(url, {
        headers: this.getHeaders(),
        params
      });

      console.log(`📥 Fetched ${response.data.records.length} leads from Scraped Leads (Universal)`);
      return response.data.records;
    } catch (error: any) {
      console.error('Failed to fetch scraped leads from Airtable:', error.response?.data || error.message);
      throw new Error(`Airtable fetch failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async updateLeadCallStatus(recordId: string, status: string, callAttempts?: number): Promise<void> {
    try {
      const url = `https://api.airtable.com/v0/${this.baseId}/${encodeURIComponent(this.tableName)}/${recordId}`;
      
      const updateData: any = {
        fields: {
          '📞 Call Status': status,
          '📅 Last Called': new Date().toISOString().split('T')[0]
        }
      };

      if (callAttempts !== undefined) {
        updateData.fields['# Call Attempts'] = callAttempts;
      }

      await axios.patch(url, updateData, {
        headers: this.getHeaders()
      });
    } catch (error: any) {
      console.error('Failed to update lead call status:', error.response?.data || error.message);
      throw new Error(`Airtable update failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async markLeadAsSyncedToYoBot(recordId: string): Promise<void> {
    try {
      const url = `https://api.airtable.com/v0/${this.baseId}/${encodeURIComponent(this.tableName)}/${recordId}`;
      
      await axios.patch(url, {
        fields: {
          '🤖 Synced to YoBot Queue?': true
        }
      }, {
        headers: this.getHeaders()
      });
    } catch (error: any) {
      console.error('Failed to mark lead as synced:', error.response?.data || error.message);
      throw new Error(`Airtable sync update failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async createScrapedLead(leadData: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    website?: string;
    title?: string;
    location?: string;
    leadSource?: string;
    platform?: string;
    sourceCampaignId?: string;
    leadOwner?: string;
  }): Promise<string> {
    try {
      const url = `https://api.airtable.com/v0/${this.baseId}/${encodeURIComponent(this.tableName)}`;
      
      const createData = {
        fields: {
          '🧑‍💼 Name': leadData.name || '',
          '✉️ Email': leadData.email || '',
          '📞 Phone': leadData.phone || '',
          '🏢 Company': leadData.company || '',
          '🔗 Website': leadData.website || '',
          '💼 Title': leadData.title || '',
          '📍 Location': leadData.location || '',
          '🛠️ Lead Source': leadData.leadSource || 'Scraping Tool',
          '🌐 Platform': leadData.platform || 'Unknown',
          '🆔 Source Campaign ID': leadData.sourceCampaignId || '',
          '👤 Lead Owner': leadData.leadOwner || 'YoBot System',
          '📞 Call Status': 'Not Called',
          '✅ Synced to HubSpot?': false,
          '🤖 Synced to YoBot Queue?': false,
          '📈 Enrichment Score': 0,
          '📅 Date Added': new Date().toISOString().split('T')[0],
          '# Call Attempts': 0,
          '🚨 Slack Alert Sent': false,
          '🧠 Escalated': false,
          '🚦 Status': 'New Lead'
        }
      };

      const response = await axios.post(url, createData, {
        headers: this.getHeaders()
      });

      console.log(`📥 Created new lead in Scraped Leads (Universal): ${leadData.name || 'Unknown'}`);
      return response.data.id;
    } catch (error: any) {
      console.error('Failed to create scraped lead:', error.response?.data || error.message);
      throw new Error(`Airtable create failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async bulkCreateScrapedLeads(leadsData: Array<{
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    website?: string;
    title?: string;
    location?: string;
    leadSource?: string;
    platform?: string;
    sourceCampaignId?: string;
    leadOwner?: string;
  }>): Promise<string[]> {
    try {
      const url = `https://api.airtable.com/v0/${this.baseId}/${encodeURIComponent(this.tableName)}`;
      
      const createData = {
        records: leadsData.map(leadData => ({
          fields: {
            '🧑‍💼 Name': leadData.name || '',
            '✉️ Email': leadData.email || '',
            '📞 Phone': leadData.phone || '',
            '🏢 Company': leadData.company || '',
            '🔗 Website': leadData.website || '',
            '💼 Title': leadData.title || '',
            '📍 Location': leadData.location || '',
            '🛠️ Lead Source': leadData.leadSource || 'Scraping Tool',
            '🌐 Platform': leadData.platform || 'Unknown',
            '🆔 Source Campaign ID': leadData.sourceCampaignId || '',
            '👤 Lead Owner': leadData.leadOwner || 'YoBot System',
            '📞 Call Status': 'Not Called',
            '✅ Synced to HubSpot?': false,
            '🤖 Synced to YoBot Queue?': false,
            '📈 Enrichment Score': 0,
            '📅 Date Added': new Date().toISOString().split('T')[0],
            '# Call Attempts': 0,
            '🚨 Slack Alert Sent': false,
            '🧠 Escalated': false,
            '🚦 Status': 'New Lead'
          }
        }))
      };

      const response = await axios.post(url, createData, {
        headers: this.getHeaders()
      });

      console.log(`📥 Created ${response.data.records.length} new leads in Scraped Leads (Universal)`);
      return response.data.records.map((record: any) => record.id);
    } catch (error: any) {
      console.error('Failed to bulk create scraped leads:', error.response?.data || error.message);
      throw new Error(`Airtable bulk create failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  formatLeadsForPipeline(leads: ScrapedLead[]) {
    return leads.map(lead => ({
      recordId: lead.id,
      name: lead.fields['🧑‍💼 Name'] || 'Unknown',
      phone: lead.fields['📞 Phone'] || '',
      email: lead.fields['✉️ Email'] || '',
      company: lead.fields['🏢 Company'] || '',
      title: lead.fields['💼 Title'] || '',
      location: lead.fields['📍 Location'] || '',
      leadSource: lead.fields['🛠️ Lead Source'] || '',
      platform: lead.fields['🌐 Platform'] || '',
      enrichmentScore: lead.fields['📈 Enrichment Score'] || 0,
      callAttempts: lead.fields['# Call Attempts'] || 0,
      callStatus: lead.fields['📞 Call Status'] || 'Not Called'
    }));
  }
}

export default new AirtableLeadsService();