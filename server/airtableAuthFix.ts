/**
 * Airtable Authentication Fix
 * Robust token handling and connection management
 */

import https from 'https';

export class AirtableAuth {
  private static instance: AirtableAuth;
  private token: string | null = null;
  private baseUrl = 'https://api.airtable.com/v0';
  
  constructor() {
    this.token = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN || null;
  }

  static getInstance(): AirtableAuth {
    if (!AirtableAuth.instance) {
      AirtableAuth.instance = new AirtableAuth();
    }
    return AirtableAuth.instance;
  }

  private cleanToken(token: string): string {
    // Ultra-strict cleaning: only keep alphanumeric and dots
    return token.replace(/[^a-zA-Z0-9.]/g, '').trim();
  }

  private makeRequest(path: string, method: 'GET' | 'POST' = 'GET', body?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.token) {
        reject(new Error('No Airtable token configured'));
        return;
      }

      const cleanToken = this.cleanToken(this.token);
      const url = new URL(path, this.baseUrl);
      
      // Use Buffer to ensure clean header construction
      const authHeader = Buffer.from(`Bearer ${cleanToken}`, 'ascii').toString('ascii');
      
      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname + url.search,
        method,
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
          'User-Agent': 'YoBot/1.0'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', chunk => data += chunk);
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(new Error('Invalid JSON response'));
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', reject);
      
      if (body && method === 'POST') {
        req.write(JSON.stringify(body));
      }
      
      req.end();
    });
  }

  async testConnection(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Test with YoBot Command Center base directly
      const baseId = 'appRt8V3tH4g5Z51f';
      const data = await this.makeRequest(`/${baseId}`);
      return {
        success: true,
        data,
        message: 'Airtable connection successful - YoBot base accessible'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getBaseData(baseId: string, tableName?: string): Promise<any> {
    const path = tableName ? `/${baseId}/${encodeURIComponent(tableName)}` : `/${baseId}`;
    return this.makeRequest(path);
  }

  async createRecord(baseId: string, tableName: string, fields: any): Promise<any> {
    const path = `/${baseId}/${encodeURIComponent(tableName)}`;
    return this.makeRequest(path, 'POST', { fields });
  }
}

// Export singleton instance
export const airtableAuth = AirtableAuth.getInstance();

// Integration functions for dashboard data
export async function getLiveMetrics(): Promise<any> {
  try {
    // Get data from YoBot Command Center bases
    const salesData = await airtableAuth.getBaseData('appRt8V3tH4g5Z51f', 'Sales Orders');
    const callData = await airtableAuth.getBaseData('appRt8V3tH4g5Z51f', 'Voice Call Log');
    
    return {
      success: true,
      data: {
        sales: salesData?.records || [],
        calls: callData?.records || [],
        timestamp: new Date().toISOString()
      }
    };
  } catch (error: any) {
    console.error('Live metrics error:', error);
    return {
      success: false,
      error: error.message,
      data: {}
    };
  }
}

export async function getSmartSpendData(): Promise<any> {
  try {
    const data = await airtableAuth.getBaseData('appRt8V3tH4g5Z51f', 'SmartSpend Master Table');
    return {
      success: true,
      data: data?.records || []
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
}

export async function getClientPulseData(): Promise<any> {
  try {
    const data = await airtableAuth.getBaseData('appRt8V3tH4g5Z51f', 'Client Overview');
    return {
      success: true,
      data: data?.records || []
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
}