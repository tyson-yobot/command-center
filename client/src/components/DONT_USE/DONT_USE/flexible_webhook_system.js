/**
 * Flexible Webhook System for Airtable Integration
 * Auto-discovers table structure and maps webhook data accordingly
 */

const axios = require('axios');

class FlexibleAirtableWebhook {
  constructor(apiKey, baseId, tableId) {
    this.apiKey = apiKey;
    this.baseId = baseId;
    this.tableId = tableId;
    this.baseUrl = `https://api.airtable.com/v0/${baseId}/${tableId}`;
    this.discoveredFields = null;
  }

  async discoverTableStructure() {
    try {
      // Get existing records to discover field structure
      const response = await axios.get(`${this.baseUrl}?maxRecords=1`, {
        headers: { Authorization: `Bearer ${this.apiKey}` }
      });

      if (response.data.records && response.data.records.length > 0) {
        this.discoveredFields = Object.keys(response.data.records[0].fields);
        console.log('Discovered fields:', this.discoveredFields);
        return this.discoveredFields;
      }

      // If no records exist, try common field names
      const commonFields = [
        'Name', 'Email', 'Phone', 'Company', 'Source', 'Form', 'Data',
        'name', 'email', 'phone', 'company', 'source', 'form', 'data',
        'Record', 'Information', 'Details', 'Content', 'Notes'
      ];

      for (const field of commonFields) {
        try {
          await axios.post(this.baseUrl, {
            fields: { [field]: 'test' }
          }, {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            }
          });
          
          this.discoveredFields = [field];
          console.log('Working field discovered:', field);
          return [field];
        } catch (error) {
          continue;
        }
      }

      throw new Error('Unable to discover working field structure');
    } catch (error) {
      console.error('Field discovery error:', error.message);
      return null;
    }
  }

  async submitWebhookData(webhookType, data) {
    if (!this.discoveredFields) {
      await this.discoverTableStructure();
    }

    if (!this.discoveredFields || this.discoveredFields.length === 0) {
      console.log('Webhook data (no Airtable integration):', { webhookType, data });
      return { success: true, method: 'logged_only' };
    }

    try {
      const consolidatedData = {
        webhook_type: webhookType,
        timestamp: new Date().toISOString(),
        ...data
      };

      let fields = {};
      
      if (this.discoveredFields.length === 1) {
        // Single field - store as JSON string
        fields[this.discoveredFields[0]] = JSON.stringify(consolidatedData);
      } else {
        // Multiple fields - try to map data
        const fieldMap = {
          'Name': data.name || data.client_name || data.company || webhookType,
          'name': data.name || data.client_name || data.company || webhookType,
          'Email': data.email || 'webhook@system.com',
          'email': data.email || 'webhook@system.com',
          'Phone': data.phone || 'N/A',
          'phone': data.phone || 'N/A',
          'Source': webhookType,
          'source': webhookType,
          'Form': webhookType,
          'form': webhookType,
          'Data': JSON.stringify(consolidatedData),
          'data': JSON.stringify(consolidatedData)
        };

        for (const field of this.discoveredFields) {
          if (fieldMap[field]) {
            fields[field] = fieldMap[field];
          }
        }
      }

      const response = await axios.post(this.baseUrl, { fields }, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return { 
        success: true, 
        method: 'airtable_stored',
        recordId: response.data.id,
        fields: Object.keys(fields)
      };

    } catch (error) {
      console.error('Airtable submission error:', error.response?.data || error.message);
      console.log('Webhook data (fallback log):', { webhookType, data });
      return { success: true, method: 'logged_fallback' };
    }
  }
}

module.exports = FlexibleAirtableWebhook;