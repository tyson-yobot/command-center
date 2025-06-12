import axios from 'axios';
import { emailAlerts } from './emailAlerts';

interface TestResult {
  functionName: string;
  passed: boolean;
  notes?: string;
  executionTime?: number;
  error?: string;
}

interface AirtableRecord {
  id: string;
  fields: {
    '🔧 Integration Name': string;
  };
}

class TestLogger {
  private airtableUrl = "https://api.airtable.com/v0/appRt8V3tH4g5Z5if/tbly0fjE2M5uHET9X";
  private airtableHeaders = {
    "Authorization": "Bearer paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa",
    "Content-Type": "application/json"
  };
  private slackWebhookUrl = "https://hooks.slack.com/services/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";
  private existingRecords = new Map<string, string>(); // functionName -> recordId

  constructor() {
    this.loadExistingRecords();
  }

  private async loadExistingRecords() {
    try {
      const response = await axios.get(this.airtableUrl, {
        headers: this.airtableHeaders
      });
      
      if (response.data && response.data.records) {
        for (const record of response.data.records) {
          const integrationName = record.fields['🔧 Integration Name'];
          if (integrationName) {
            // Extract function name from the integration name field
            const functionMatch = integrationName.match(/^([^:]+):/);
            if (functionMatch) {
              const functionName = functionMatch[1].trim();
              this.existingRecords.set(functionName, record.id);
            }
          }
        }
        console.log(`📊 Loaded ${this.existingRecords.size} existing test records`);
      }
    } catch (error) {
      console.error('❌ Failed to load existing records:', error);
    }
  }

  async logTestResult(result: TestResult): Promise<boolean> {
    try {
      const recordId = this.existingRecords.get(result.functionName);
      const status = result.passed ? "✅" : "❌";
      const timestamp = new Date().toISOString();
      const notes = result.notes || (result.error ? `Error: ${result.error}` : "System test completed");
      
      // Format as single field matching Airtable structure
      const integrationName = `${result.functionName}: ${status} - ${notes} - ${timestamp}`;
      
      const payload = {
        fields: {
          "🔧 Integration Name": integrationName
        }
      };

      let response;
      if (recordId) {
        // Patch existing record
        response = await axios.patch(`${this.airtableUrl}/${recordId}`, payload, {
          headers: this.airtableHeaders
        });
        console.log(`🔄 Updated existing record for ${result.functionName}`);
      } else {
        // Create new record
        response = await axios.post(this.airtableUrl, payload, {
          headers: this.airtableHeaders
        });
        // Store new record ID for future patches
        if (response.data && response.data.id) {
          this.existingRecords.set(result.functionName, response.data.id);
        }
        console.log(`✅ Created new record for ${result.functionName}`);
      }

      // Send Slack alert
      await this.sendSlackAlert(result);

      // Send email alert if failed
      if (!result.passed) {
        await emailAlerts.sendFailureAlert(
          result.functionName, 
          result.error || 'Function test failed', 
          result.notes
        );
      }

      return response.status === 200;
    } catch (error) {
      console.error(`❌ Failed to log test result for ${result.functionName}:`, error);
      return false;
    }
  }

  private async sendSlackAlert(result: TestResult) {
    try {
      const status = result.passed ? "✅ PASSED" : "❌ FAILED";
      const message = `🧪 **Function Test Result**\n${status}: ${result.functionName}\n${result.notes ? `Notes: ${result.notes}` : ''}${result.executionTime ? `\nExecution Time: ${result.executionTime}ms` : ''}`;
      
      await axios.post(this.slackWebhookUrl, {
        text: message
      });
      console.log(`📱 Slack alert sent for ${result.functionName}`);
    } catch (error) {
      console.error(`❌ Failed to send Slack alert:`, error);
    }
  }



  async getTestStats() {
    try {
      const response = await axios.get(this.airtableUrl, {
        headers: this.airtableHeaders
      });
      
      if (response.data && response.data.records) {
        const total = response.data.records.length;
        const passed = response.data.records.filter(r => r.fields['✅ Passed?'] === '✅').length;
        const failed = total - passed;
        
        return { total, passed, failed };
      }
      
      return { total: 0, passed: 0, failed: 0 };
    } catch (error) {
      console.error('❌ Failed to get test stats:', error);
      return { total: 0, passed: 0, failed: 0 };
    }
  }
}

export const testLogger = new TestLogger();
export { TestResult };