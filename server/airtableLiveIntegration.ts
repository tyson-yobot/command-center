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
            '💼 Title': 'Sales Order',
            '📍 Location': 'Command Center',
            '🛠️ Lead Source': 'Sales Order Flow',
            '📅 Date Added': '2025-06-15'
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
    const baseId = 'appSmartSpendTracker'; // YoBot® SmartSpend Tracker base
    const tableId = 'tblSmartSpendDashboard'; // SmartSpend Dashboard table
    
    try {
      let url = `${this.baseUrl}/${baseId}/${tableId}`;
      
      if (clientId) {
        url += `?filterByFormula={Client ID}="${clientId}"&sort[0][field]=Last Updated&sort[0][direction]=desc&maxRecords=1`;
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