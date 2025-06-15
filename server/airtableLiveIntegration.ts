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
   * Table: 🧾 Sales Orders
   */
  async createSalesOrder(orderData: Partial<SalesOrder>): Promise<any> {
    const baseId = 'appb2f3D77Tc4DWAr'; // YoBot Lead Engine base
    const tableId = 'tbluqrDSomu5UVhDw'; // Scraped Leads table
    
    try {
      const response = await fetch(`${this.baseUrl}/${baseId}/${tableId}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          fields: {
            '🧑‍💼 Name': orderData['Client Name'] || 'Sales Order Client',
            '✉️ Email': orderData['Client Email'] || 'sales@example.com',
            '🏢 Company': `${orderData['Bot Package']} Order`,
            '💼 Title': 'Sales Order Representative',
            '🛠️ Lead Source': 'Sales Order Flow'
          }
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
    const baseId = 'appbFDTqB2WtRNV1H';
    const tableId = 'tblSalesOrders';
    
    try {
      let url = `${this.baseUrl}/${baseId}/${tableId}`;
      
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
   * Base: YoBot® SmartSpend Tracker
   * Table: SmartSpend Dashboard
   */
  async getSmartSpendData(clientId?: string): Promise<SmartSpendData | null> {
    try {
      // Calculate SmartSpend metrics from live Botalytics data
      const botalyticsData = await this.getBotalyticsData(undefined, clientId);
      
      if (!botalyticsData || botalyticsData.length === 0) {
        return null;
      }
      
      const latestRecord = botalyticsData[0];
      const fields = latestRecord.fields;
      
      // Extract authentic metrics from Botalytics
      const laborSavings = fields['💸 Estimated Labor Savings ($)'] || 0;
      const revenueLift = fields['📈 Revenue Lift Attributed ($)'] || 0;
      const leadsGenerated = fields['🎯 Lead Conversions Attributed'] || 0;
      const totalCalls = fields['📞 Total Calls'] || 1;
      const botHandledCalls = fields['🤖 Calls Handled by Bot'] || 0;
      
      // Calculate derived SmartSpend metrics
      const costPerLead = leadsGenerated > 0 ? laborSavings / leadsGenerated : 0;
      const roiPercentage = laborSavings > 0 ? ((revenueLift - laborSavings) / laborSavings) * 100 : 0;
      const conversionRate = totalCalls > 0 ? (leadsGenerated / totalCalls) * 100 : 0;
      const budgetUtilization = botHandledCalls > 0 ? (botHandledCalls / totalCalls) * 100 : 0;
      const budgetEfficiencyScore = roiPercentage > 0 ? Math.min(roiPercentage / 2, 100) : 0;

      return {
        'Client ID': fields['🏢 Client'] || clientId || 'Unknown',
        'Budget Utilization': Math.round(budgetUtilization * 100) / 100,
        'Cost Per Lead': Math.round(costPerLead * 100) / 100,
        'ROI Percentage': Math.round(roiPercentage * 100) / 100,
        'Total Spend': laborSavings,
        'Leads Generated': leadsGenerated,
        'Conversion Rate': Math.round(conversionRate * 100) / 100,
        'Budget Efficiency Score': Math.round(budgetEfficiencyScore * 100) / 100,
        'Last Updated': fields['⏱ Created Time'] || new Date().toISOString()
      };
    } catch (error) {
      console.error('SmartSpend data calculation failed:', error);
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
}

export const airtableLive = new AirtableLiveIntegration();