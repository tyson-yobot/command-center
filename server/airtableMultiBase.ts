/**
 * Multi-Base Airtable Integration
 * Handles all YoBot bases with proper authentication
 */

export class AirtableMultiBase {
  private token: string;
  
  // Base IDs from the inventory
  private bases = {
    commandCenter: 'appRt8V3tH4g5Z51f', // YoBot® Command Center (Live Ops)
    salesAutomation: 'appe0OSJtB1In1kn5', // YoBot® Sales & Automation
    smartSpend: 'appGtcRZU6QJngkQS', // YoBot® SmartSpend Tracker (Main)
    leadEngine: 'appb2F3D77tC4DWla', // YoBot Lead Engine
    clientCRM: 'appMbVQJ0n3nlR1lN', // YoBot® Client CRM
    opsAlerts: 'appCoAtCZdARb4AM2' // YoBot® Ops & Alerts Log
  };

  constructor() {
    this.token = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN || '';
  }

  private async makeRequest(baseId: string, tableName: string, method = 'GET', body?: any) {
    try {
      const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;
      
      const options: RequestInit = {
        method,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      };

      if (body && method !== 'GET') {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Airtable API error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Airtable request failed for ${tableName}:`, error);
      throw error;
    }
  }

  // Command Center Actions - Log button presses and metrics
  async logCommandCenterAction(actionData: {
    triggeredAction: string;
    status?: string;
    triggeredBy: string;
    timestamp?: string;
    voiceSource?: boolean;
  }) {
    const fields = {
      '🛠️ Triggered Action': actionData.triggeredAction,
      'Status': actionData.status || 'Completed',
      'Triggered By': actionData.triggeredBy,
      'Timestamp': actionData.timestamp || new Date().toISOString(),
      '🎙 Voice Source': actionData.voiceSource || false
    };

    return this.makeRequest(
      this.bases.commandCenter,
      'Command Center - Metrics Tracker Table',
      'POST',
      { fields }
    );
  }

  // Sales & Automation Data
  async getSalesOrdersData() {
    try {
      const data = await this.makeRequest(this.bases.salesAutomation, 'Sales Orders Table');
      return data.records || [];
    } catch (error) {
      console.error('Failed to get sales orders:', error);
      return [];
    }
  }

  async getBotalyticsData() {
    try {
      const data = await this.makeRequest(this.bases.salesAutomation, 'Botalytics Monthly Log Table');
      return data.records || [];
    } catch (error) {
      console.error('Failed to get Botalytics data:', error);
      return [];
    }
  }

  async getVoiceCallLogs() {
    try {
      const data = await this.makeRequest(this.bases.salesAutomation, 'Voice Call Log Table');
      return data.records || [];
    } catch (error) {
      console.error('Failed to get voice call logs:', error);
      return [];
    }
  }

  async getCallSentimentLogs() {
    try {
      const data = await this.makeRequest(this.bases.salesAutomation, 'Call Sentiment Log Table');
      return data.records || [];
    } catch (error) {
      console.error('Failed to get call sentiment logs:', error);
      return [];
    }
  }

  // SmartSpend Data
  async getSmartSpendData() {
    try {
      const data = await this.makeRequest(this.bases.smartSpend, 'SmartSpend Master Table');
      return data.records || [];
    } catch (error) {
      console.error('Failed to get SmartSpend data:', error);
      return [];
    }
  }

  // Lead Engine Data
  async getScrapedLeads() {
    try {
      const data = await this.makeRequest(this.bases.leadEngine, 'Scraped Leads (Universal) Table');
      return data.records || [];
    } catch (error) {
      console.error('Failed to get scraped leads:', error);
      return [];
    }
  }

  async getCallQueue() {
    try {
      const data = await this.makeRequest(this.bases.leadEngine, 'Call Queue Table');
      return data.records || [];
    } catch (error) {
      console.error('Failed to get call queue:', error);
      return [];
    }
  }

  // Client CRM Data
  async getClientBookings() {
    try {
      const data = await this.makeRequest(this.bases.clientCRM, 'Client Bookings Table');
      return data.records || [];
    } catch (error) {
      console.error('Failed to get client bookings:', error);
      return [];
    }
  }

  // Test connection to verify authentication
  async testConnection() {
    try {
      const testData = await this.makeRequest(
        this.bases.commandCenter,
        'Command Center - Metrics Tracker Table'
      );
      return {
        success: true,
        recordCount: testData.records?.length || 0,
        message: 'Successfully connected to Airtable'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const airtableMultiBase = new AirtableMultiBase();