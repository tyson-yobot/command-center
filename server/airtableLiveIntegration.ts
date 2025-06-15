/**
 * Airtable Live Integration
 * Official Airtable REST API v1 integration for YoBot Command Center
 */

interface SalesOrder {
  'Bot Package': string;
  'Add-Ons': string[];
  'Total': number;
  'Status': string;
  'Client Email': string;
  'Client Name': string;
  'Order Date': string;
  'Payment Status': string;
}

interface SmartSpendData {
  'Client ID': string;
  'Budget Utilization': number;
  'Cost Per Lead': number;
  'ROI Percentage': number;
  'Total Spend': number;
  'Leads Generated': number;
  'Conversion Rate': number;
  'Budget Efficiency Score': number;
  'Last Updated': string;
}

interface RevenueForecast {
  'MRR': number;
  'ROI': number;
  'Close %': number;
  'Pipeline Value': number;
  'Client ID'?: string;
  'Last Updated': string;
}

interface SupportTicket {
  'Subject': string;
  'Body': string;
  'Client Email': string;
  'Urgency': 'Low' | 'Medium' | 'High' | 'Critical';
  'Status': string;
  'Date Created': string;
}

class AirtableLiveIntegration {
  private apiKey: string;
  private baseUrl = 'https://api.airtable.com/v0';

  constructor() {
    this.apiKey = 'paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa';
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Sales Order Flow Integration
   * Base: YoBot® Sales & Automation
   * Table: Sales Orders Table
   */
  async createSalesOrder(orderData: Partial<SalesOrder>): Promise<any> {
    const baseId = 'appe0OSJtB1In1kn5'; // YoBot® Sales & Automation
    const tableName = 'Sales Orders Table';
    
    try {
      const response = await fetch(`${this.baseUrl}/${baseId}/${tableName}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          records: [{
            fields: {
              'Bot Package': orderData['Bot Package'] || 'YoBot Standard',
              'Add-Ons': orderData['Add-Ons'] || [],
              'Total': orderData['Total'] || 0,
              'Status': orderData['Status'] || 'New',
              'Client Email': orderData['Client Email'] || 'test@example.com',
              'Client Name': orderData['Client Name'] || 'Test Client',
              'Order Date': orderData['Order Date'] || new Date().toISOString(),
              'Payment Status': orderData['Payment Status'] || 'Pending'
            }
          }]
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Airtable API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          body: errorBody
        });
        throw new Error(`Airtable API error: ${response.status} - ${errorBody}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Sales Order creation failed:', error);
      throw error;
    }
  }

  async getSalesOrders(filterByEmail?: string): Promise<any[]> {
    const baseId = 'appe0OSJtB1In1kn5';
    const tableName = 'Sales Orders Table';
    
    try {
      let url = `${this.baseUrl}/${baseId}/${tableName}`;
      
      if (filterByEmail) {
        url += `?filterByFormula={Client Email}="${filterByEmail}"`;
      }

      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status}`);
      }

      const data = await response.json();
      return data.records || [];
    } catch (error) {
      console.error('Sales Orders fetch failed:', error);
      throw error;
    }
  }

  /**
   * SmartSpend™ Dashboard Integration
   * Base: YoBot® SmartSpend Tracker (Main)
   * Table: SmartSpend Master Table
   */
  async getSmartSpendData(clientId?: string): Promise<SmartSpendData | null> {
    const baseId = 'appGtcRZU6QJngkQS'; // YoBot® SmartSpend Tracker (Main)
    const tableName = 'SmartSpend Master Table';
    
    try {
      let url = `${this.baseUrl}/${baseId}/${tableId}`;
      
      if (clientId) {
        url += `?filterByFormula=OR({Client ID}="${clientId}",{Client Email}="${clientId}")&sort[0][field]=Last Updated&sort[0][direction]=desc&maxRecords=1`;
      } else {
        url += `?sort[0][field]=Last Updated&sort[0][direction]=desc&maxRecords=1`;
      }

      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status}`);
      }

      const data = await response.json();
      const record = data.records?.[0];
      
      if (!record) return null;

      return {
        'Client ID': record.fields['Client ID'] || '',
        'Budget Utilization': record.fields['Budget Utilization'] || 0,
        'Cost Per Lead': record.fields['Cost Per Lead'] || 0,
        'ROI Percentage': record.fields['ROI Percentage'] || 0,
        'Total Spend': record.fields['Total Spend'] || 0,
        'Leads Generated': record.fields['Leads Generated'] || 0,
        'Conversion Rate': record.fields['Conversion Rate'] || 0,
        'Budget Efficiency Score': record.fields['Budget Efficiency Score'] || 0,
        'Last Updated': record.fields['Last Updated'] || ''
      };
    } catch (error) {
      console.error('SmartSpend data fetch failed:', error);
      throw error;
    }
  }

  async updateSmartSpendData(clientId: string, updateData: Partial<SmartSpendData>): Promise<any> {
    const baseId = 'appSmartSpendTracker';
    const tableId = 'tblSmartSpendDashboard';
    
    try {
      // First, find the record by client ID
      const existingRecords = await this.getSmartSpendRecords(clientId);
      
      if (existingRecords.length === 0) {
        // Create new record
        const response = await fetch(`${this.baseUrl}/${baseId}/${tableId}`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            fields: {
              'Client ID': clientId,
              'Last Updated': new Date().toISOString(),
              ...updateData
            }
          })
        });

        if (!response.ok) {
          throw new Error(`Airtable API error: ${response.status}`);
        }

        return await response.json();
      } else {
        // Update existing record
        const recordId = existingRecords[0].id;
        const response = await fetch(`${this.baseUrl}/${baseId}/${tableId}/${recordId}`, {
          method: 'PATCH',
          headers: this.getHeaders(),
          body: JSON.stringify({
            fields: {
              'Last Updated': new Date().toISOString(),
              ...updateData
            }
          })
        });

        if (!response.ok) {
          throw new Error(`Airtable API error: ${response.status}`);
        }

        return await response.json();
      }
    } catch (error) {
      console.error('SmartSpend data update failed:', error);
      throw error;
    }
  }

  private async getSmartSpendRecords(clientId: string): Promise<any[]> {
    const baseId = 'appSmartSpendTracker';
    const tableId = 'tblSmartSpendDashboard';
    
    const url = `${this.baseUrl}/${baseId}/${tableId}?filterByFormula={Client ID}="${clientId}"`;
    
    const response = await fetch(url, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`);
    }

    const data = await response.json();
    return data.records || [];
  }

  /**
   * Revenue Forecast Integration
   * Base: YoBot® Sales & Automation
   * Table: Revenue Projections
   */
  async getRevenueForecast(): Promise<any> {
    const baseId = 'appbFDTqB2WtRNV1H';
    const tableId = 'tblRevenueProjections';
    
    try {
      const url = `${this.baseUrl}/${baseId}/${tableId}?sort[0][field]=Quarter&sort[0][direction]=desc&maxRecords=4`;
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status}`);
      }

      const data = await response.json();
      return data.records || [];
    } catch (error) {
      console.error('Revenue forecast fetch failed:', error);
      throw error;
    }
  }

  /**
   * Botalytics™ Integration
   * Base: YoBot® Sales & Automation
   * Table: 🧮 Botalytics Monthly Log
   */
  async getBotalyticsData(month?: string, clientId?: string): Promise<any[]> {
    const baseId = 'appe0OSJtB1In1kn5'; // YoBot® Sales & Automation base
    const tableId = '🧮 Botalytics Monthly Log'; // Botalytics Monthly Log table
    
    try {
      let url = `${this.baseUrl}/${baseId}/${tableId}`;
      let filters = [];
      
      if (month) {
        filters.push(`{📅 Month}="${month}"`);
      }
      
      if (clientId) {
        filters.push(`{🏢 Client}="${clientId}"`);
      }
      
      if (filters.length > 0) {
        url += `?filterByFormula=AND(${filters.join(',')})&sort[0][field]=${encodeURIComponent('📅 Month')}&sort[0][direction]=desc`;
      } else {
        url += `?sort[0][field]=${encodeURIComponent('📅 Month')}&sort[0][direction]=desc&maxRecords=12`;
      }

      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        console.error('Botalytics API Error:', response.status, await response.text());
        return [];
      }

      const data = await response.json();
      return data.records || [];
    } catch (error) {
      console.error('Botalytics data fetch failed:', error);
      return [];
    }
  }

  /**
   * Health check for Airtable connectivity
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Test with a simple request to YoBot® Sales & Automation base
      const baseId = 'appbFDTqB2WtRNV1H';
      const url = `${this.baseUrl}/${baseId}/tblSalesOrders?maxRecords=1`;
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      return response.ok;
    } catch (error) {
      console.error('Airtable health check failed:', error);
      return false;
    }
  }

  /**
   * 🎯 Client Pulse + Metrics Integration
   * Base: YoBot® Client CRM
   * Table: Client Overview or Pulse Tracker
   * Action: Pull latest values by client record
   * Optional: Trigger Slack alert if NPS < 6
   */
  async getClientPulseData(clientId?: string): Promise<any> {
    const baseId = 'appMbVQJ0n3nWRl1N'; // YoBot® Client CRM
    const tableId = 'Client Overview'; // Client Overview table
    
    try {
      let url = `${this.baseUrl}/${baseId}/${tableId}`;
      
      if (clientId) {
        url += `?filterByFormula=OR({Client ID}="${clientId}",{Client Email}="${clientId}")&sort[0][field]=Last Updated&sort[0][direction]=desc&maxRecords=1`;
      } else {
        url += `?sort[0][field]=Last Updated&sort[0][direction]=desc&maxRecords=10`;
      }

      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status}`);
      }

      const data = await response.json();
      return data.records || [];
    } catch (error) {
      console.error('Client pulse data fetch failed:', error);
      // Try Pulse Tracker table as fallback
      try {
        const fallbackTableId = 'CRM Contacts Table';
        let fallbackUrl = `${this.baseUrl}/${baseId}/${fallbackTableId}`;
        
        if (clientId) {
          fallbackUrl += `?filterByFormula=OR({Client ID}="${clientId}",{Client Email}="${clientId}")&sort[0][field]=Last Updated&sort[0][direction]=desc&maxRecords=1`;
        } else {
          fallbackUrl += `?sort[0][field]=Last Updated&sort[0][direction]=desc&maxRecords=10`;
        }

        const fallbackResponse = await fetch(fallbackUrl, {
          headers: this.getHeaders()
        });

        if (!fallbackResponse.ok) {
          throw new Error(`Airtable API error: ${fallbackResponse.status}`);
        }

        const fallbackData = await fallbackResponse.json();
        return fallbackData.records || [];
      } catch (fallbackError) {
        console.error('Client pulse fallback fetch failed:', fallbackError);
        throw error;
      }
    }
  }

  /**
   * 📞 Call Logs + Sentiment Integration
   * Base: YoBot® VoiceBot Logs
   * Tables: 📞 Voice Call Log, 📊 Call Sentiment Log
   * Action: Pull last 5 calls + stats by client ID
   */
  async getVoiceCallLogs(clientId?: string): Promise<any[]> {
    const baseId = 'appe0OSJtB1In1kn5'; // YoBot® Sales & Automation
    const tableId = 'Voice Call Log';
    
    try {
      let url = `${this.baseUrl}/${baseId}/${tableId}`;
      
      if (clientId) {
        url += `?filterByFormula={Client ID}="${clientId}"&sort[0][field]=Call Date&sort[0][direction]=desc&maxRecords=5`;
      } else {
        url += `?sort[0][field]=Call Date&sort[0][direction]=desc&maxRecords=5`;
      }

      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status}`);
      }

      const data = await response.json();
      return data.records || [];
    } catch (error) {
      console.error('Voice call logs fetch failed:', error);
      throw error;
    }
  }

  async getCallSentimentLogs(clientId?: string): Promise<any[]> {
    const baseId = 'appe0OSJtB1In1kn5'; // YoBot® Sales & Automation
    const tableId = 'Call Sentiment Log';
    
    try {
      let url = `${this.baseUrl}/${baseId}/${tableId}`;
      
      if (clientId) {
        url += `?filterByFormula={Client ID}="${clientId}"&sort[0][field]=Analysis Date&sort[0][direction]=desc&maxRecords=5`;
      } else {
        url += `?sort[0][field]=Analysis Date&sort[0][direction]=desc&maxRecords=5`;
      }

      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status}`);
      }

      const data = await response.json();
      return data.records || [];
    } catch (error) {
      console.error('Call sentiment logs fetch failed:', error);
      throw error;
    }
  }

  /**
   * Slack Alert for NPS < 6
   */
  async triggerNPSAlert(clientData: any): Promise<void> {
    const nps = clientData.fields?.['NPS Score'] || clientData.fields?.['Client NPS'];
    
    if (nps < 6) {
      // Import and use Slack integration
      const { sendSlackMessage } = await import('./alerts');
      
      const message = `🚨 LOW NPS ALERT: Client ${clientData.fields['Client Name'] || clientData.fields['Client ID']} has NPS score of ${nps}. Immediate attention required.`;
      
      await sendSlackMessage(message);
    }
  }

  /**
   * 🧠 AI Assistant Insights Integration
   * Base: YoBot® NLP Tracker
   * Table: 🧠 NLP Keyword Tracker
   * Action: Pull by week → aggregate accuracy, escalations
   */
  async getNLPInsights(week?: string): Promise<any[]> {
    const baseId = 'appe0OSJtB1In1kn5'; // YoBot® Sales & Automation
    const tableId = 'NLP Keyword Tracker';
    
    try {
      let url = `${this.baseUrl}/${baseId}/${tableId}`;
      
      if (week) {
        url += `?filterByFormula={Week}="${week}"&sort[0][field]=Week&sort[0][direction]=desc`;
      } else {
        url += `?sort[0][field]=Week&sort[0][direction]=desc&maxRecords=10`;
      }

      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status}`);
      }

      const data = await response.json();
      return data.records || [];
    } catch (error) {
      console.error('NLP insights fetch failed:', error);
      throw error;
    }
  }

  /**
   * 📅 Smart Calendar Integration
   * Base: YoBot® Sales & Automation
   * Table: 📅 Calendar Bookings
   * Action: Filter by today's date and client
   */
  async getTodayCalendarBookings(clientId?: string): Promise<any[]> {
    const baseId = 'appe0OSJtB1In1kn5'; // YoBot® Sales & Automation
    const tableId = 'Calendar Bookings';
    
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      let url = `${this.baseUrl}/${baseId}/${tableId}`;
      
      if (clientId) {
        url += `?filterByFormula=AND({Date}="${today}",{Client ID}="${clientId}")&sort[0][field]=Time&sort[0][direction]=asc`;
      } else {
        url += `?filterByFormula={Date}="${today}"&sort[0][field]=Time&sort[0][direction]=asc`;
      }

      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status}`);
      }

      const data = await response.json();
      return data.records || [];
    } catch (error) {
      console.error('Calendar bookings fetch failed:', error);
      throw error;
    }
  }

  /**
   * 📤 Export Data Functions
   * Export Sales Orders or SmartSpend data as CSV
   */
  async exportSalesOrdersCSV(): Promise<string> {
    try {
      const salesOrders = await this.getSalesOrders();
      
      if (!salesOrders.length) {
        return 'No data available for export';
      }

      // Convert to CSV format
      const headers = Object.keys(salesOrders[0].fields);
      const csvHeaders = headers.join(',');
      
      const csvRows = salesOrders.map(record => {
        return headers.map(header => {
          const value = record.fields[header];
          // Handle arrays and objects
          if (Array.isArray(value)) {
            return `"${value.join('; ')}"`;
          }
          if (typeof value === 'object' && value !== null) {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          // Handle strings with commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',');
      });

      return [csvHeaders, ...csvRows].join('\n');
    } catch (error) {
      console.error('Sales orders export failed:', error);
      throw error;
    }
  }

  async exportSmartSpendCSV(): Promise<string> {
    try {
      // Get SmartSpend data from multiple clients
      const smartSpendData = await this.getSmartSpendData();
      
      if (!smartSpendData) {
        return 'No SmartSpend data available for export';
      }

      // Convert single record to array for CSV processing
      const dataArray = [smartSpendData];
      const headers = Object.keys(dataArray[0]);
      const csvHeaders = headers.join(',');
      
      const csvRows = dataArray.map(record => {
        return headers.map(header => {
          const value = record[header];
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',');
      });

      return [csvHeaders, ...csvRows].join('\n');
    } catch (error) {
      console.error('SmartSpend export failed:', error);
      throw error;
    }
  }
}

export const airtableLive = new AirtableLiveIntegration();