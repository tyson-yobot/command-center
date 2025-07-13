/**
 * Unified Airtable Logger for YoBot Command Center
 * Tests and logs all automation functions with proper error handling
 */

import axios from 'axios';

interface LogEntry {
  functionId: number;
  functionName: string;
  status: 'PASS' | 'FAIL';
  notes: string;
  moduleType: string;
  timestamp: string;
}

class AirtableLogger {
  private baseId: string;
  private tableId: string;
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.baseId = 'appRt8V3tH4g5Z5if';
    this.tableId = 'tbly0fjE2M5uHET9X';
    this.apiKey = process.env.AIRTABLE_API_KEY as string;
    this.baseUrl = `https://api.airtable.com/v0/${this.baseId}/${this.tableId}`;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(this.baseUrl, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        params: { maxRecords: 1 }
      });
      
      console.log('✅ Airtable connection successful');
      return response.status === 200;
    } catch (error: any) {
      console.error('❌ Airtable connection failed:', error.response?.status, error.response?.statusText);
      return false;
    }
  }

  async logAutomationTest(entry: LogEntry): Promise<boolean> {
    try {
      const payload = {
        records: [{
          fields: {
            '🔧 Integration Name': `Function ${entry.functionId}: ${entry.functionName} - ${entry.status} - ${entry.notes} - Module: ${entry.moduleType}`
          }
        }]
      };

      const response = await axios.post(this.baseUrl, payload, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        console.log(`✅ Logged Function ${entry.functionId}: ${entry.status}`);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error(`❌ Failed to log Function ${entry.functionId}:`, error.response?.status, error.response?.statusText);
      return false;
    }
  }

  async logBatch(entries: LogEntry[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const entry of entries) {
      const result = await this.logAutomationTest(entry);
      if (result) {
        success++;
      } else {
        failed++;
      }
      // Rate limiting: wait 200ms between requests
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`📊 Batch logging complete: ${success} success, ${failed} failed`);
    return { success, failed };
  }
}

export const airtableLogger = new AirtableLogger();