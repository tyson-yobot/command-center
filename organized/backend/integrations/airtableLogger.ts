// 🔐 SECURITY LOCKDOWN: Airtable Integration Test Logger
// Enforces strict data integrity - no hardcoded values allowed in LIVE mode

import axios from 'axios';
import { getSystemMode } from './systemMode';

interface TestLogEntry {
  passed: boolean;
  executed: boolean;
  validationOutcome: string;
  outputDataPopulated: boolean;
  moduleType: string;
  relatedScenario: string;
  notes: string;
  qaOwner: string;
  testDate: string;
  retryAttempted: boolean;
  integrationName: string;
  loggerSource: string;
  timestamp: string;
  lastEditor: string;
}

class AirtableLogger {
  private baseId = 'appbFDTqB2WtRNV1H';
  private tableId = 'tbl7K5RthCtD69BE1';
  private apiKey = process.env.AIRTABLE_API_KEY;

  constructor() {
    if (!this.apiKey) {
      console.error('🚨 CRITICAL: AIRTABLE_API_KEY missing - all test logging will fail');
    }
  }

  /**
   * 🛡️ Logger Integrity Tracker - Validates mandatory fields
   */
  private validateIntegrity(entry: TestLogEntry): boolean {
    const systemMode = getSystemMode();
    
    if (systemMode === 'live') {
      // LIVE MODE: Zero tolerance for missing data
      const requiredFields = ['loggerSource', 'timestamp', 'integrationName'];
      
      for (const field of requiredFields) {
        if (!entry[field as keyof TestLogEntry]) {
          console.error(`🚨 INTEGRITY VIOLATION: Missing ${field} in LIVE mode`);
          return false;
        }
      }

      // Block any hardcoded test values
      const blockedValues = ['test', 'demo', 'sample', 'mock', 'fake'];
      const entryString = JSON.stringify(entry).toLowerCase();
      
      for (const blocked of blockedValues) {
        if (entryString.includes(blocked)) {
          console.error(`🚨 HARDCODE VIOLATION: Blocked value "${blocked}" detected`);
          return false;
        }
      }
    }

    return true;
  }

  /**
   * 📋 Log test execution to Airtable with strict integrity checking
   */
  async logTestExecution(
    integrationName: string,
    passed: boolean,
    notes: string = "",
    qaOwner: string = "System",
    outputDataPopulated: boolean = false,
    executed: boolean = true,
    retryAttempted: boolean = false,
    moduleType: string = "Webhook",
    relatedScenario: string = ""
  ): Promise<boolean> {
    
    const systemMode = getSystemMode();
    
    if (systemMode === 'live' && !this.apiKey) {
      console.error('🚨 LIVE MODE VIOLATION: Cannot log to Airtable without API key');
      return false;
    }

    const entry: TestLogEntry = {
      passed,
      executed,
      validationOutcome: passed ? 'Success' : 'Failed',
      outputDataPopulated,
      moduleType,
      relatedScenario,
      notes: notes || (passed ? 'Execution completed successfully' : 'Execution failed'),
      qaOwner,
      testDate: new Date().toISOString(),
      retryAttempted,
      integrationName,
      loggerSource: 'YoBot Command Center',
      timestamp: new Date().toISOString(),
      lastEditor: 'Automated System'
    };

    // 🛡️ Validate integrity
    if (!this.validateIntegrity(entry)) {
      console.error('🚨 INTEGRITY CHECK FAILED - Test logging blocked');
      return false;
    }

    try {
      if (systemMode === 'live' && this.apiKey) {
        // Real Airtable logging in LIVE mode
        const response = await axios.post(
          `https://api.airtable.com/v0/${this.baseId}/${this.tableId}`,
          {
            fields: {
              'Integration Name': entry.integrationName,
              'Pass/Fail': entry.passed ? 'Pass' : 'Fail',
              'Executed (Wired)?': entry.executed,
              'Validation Outcome': entry.validationOutcome,
              'Output Data Populated?': entry.outputDataPopulated,
              'Module Type': entry.moduleType,
              'Related Scenario': entry.relatedScenario,
              'Notes / Debug': entry.notes,
              'QA Owner': entry.qaOwner,
              'Test Date': entry.testDate,
              'Retry Attempted?': entry.retryAttempted,
              'Logger Source': entry.loggerSource,
              'Timestamp': entry.timestamp,
              'Last Editor': entry.lastEditor
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log(`✅ Test logged to Airtable: ${integrationName} - ${passed ? 'PASS' : 'FAIL'}`);
        return true;
      } else {
        // Test mode: Just log locally
        console.log(`📊 TEST MODE LOG: ${integrationName} - ${passed ? 'PASS' : 'FAIL'}`);
        return true;
      }
    } catch (error) {
      console.error('🚨 AIRTABLE LOGGING FAILED:', error);
      
      if (systemMode === 'live') {
        // In LIVE mode, logging failure means test failure
        console.error('🚨 LIVE MODE: Test marked as FAILED due to logging failure');
        return false;
      }
      
      return false;
    }
  }

  /**
   * 🔄 Bulk test execution logger
   */
  async logBulkTests(tests: Array<{
    name: string;
    passed: boolean;
    notes?: string;
    moduleType?: string;
  }>): Promise<boolean> {
    
    let allPassed = true;
    
    for (const test of tests) {
      const result = await this.logTestExecution(
        test.name,
        test.passed,
        test.notes,
        "Bulk Test Runner",
        test.passed, // Output data populated if test passed
        true, // Executed
        false, // No retry on bulk
        test.moduleType || "Webhook"
      );
      
      if (!result) {
        allPassed = false;
      }
      
      // Small delay between logs to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return allPassed;
  }

  /**
   * 🧪 Validate test environment integrity
   */
  validateTestEnvironment(): boolean {
    const systemMode = getSystemMode();
    
    if (systemMode === 'live') {
      if (!this.apiKey) {
        console.error('🚨 LIVE MODE VIOLATION: AIRTABLE_API_KEY required');
        return false;
      }
      
      console.log('✅ LIVE MODE: Airtable logging validated');
      return true;
    }
    
    console.log('📊 TEST MODE: Airtable logging in simulation mode');
    return true;
  }
}

export const airtableLogger = new AirtableLogger();
export default AirtableLogger;