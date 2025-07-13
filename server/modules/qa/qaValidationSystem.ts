import type { Express } from "express";
import { COMMAND_CENTER_BASE_ID } from "../../config/airtableBase";

interface QATestResult {
  integrationName: string;
  status: 'PASS' | 'FAIL' | 'PENDING';
  notes: string;
  scenarioLink: string;
  outputDataPopulated: boolean;
  recordCreated: boolean;
  retryAttempted: boolean;
  moduleType: string;
  testTimestamp: string;
}

interface QAValidationSpec {
  integrationName: string;
  endpoint: string;
  expectedBehavior: string;
  testData: any;
  scenarioLink: string;
  moduleType: string;
}

// QA Validation Specifications from Final Spec Document
const QA_VALIDATION_SPECS: QAValidationSpec[] = [
  {
    integrationName: "Slack → Client Alert",
    endpoint: "/api/automation/critical-escalation",
    expectedBehavior: "Send Slack alert with retry and dynamic message support",
    testData: { severity: "High", description: "Test critical alert", clientId: "TEST_001" },
    scenarioLink: "https://replit.dev/scenario/slack-alert-qaflow",
    moduleType: "Slack"
  },
  {
    integrationName: "Airtable → Sales Order Sync",
    endpoint: "/api/automation/sales-orders", 
    expectedBehavior: "Create sales order record in Airtable with proper field mapping",
    testData: { clientName: "Test Client", product: "YoBot Pro", amount: 2500, currency: "USD" },
    scenarioLink: "https://replit.dev/scenario/airtable-sync-sales",
    moduleType: "Airtable"
  },
  {
    integrationName: "Zendesk → Ticket Log",
    endpoint: "/api/automation/new-support-ticket",
    expectedBehavior: "Create Zendesk ticket and log to system",
    testData: { subject: "QA Test Ticket", description: "Automated validation test", priority: "normal" },
    scenarioLink: "https://replit.dev/scenario/zendesk-log",
    moduleType: "Zendesk"
  },
  {
    integrationName: "VoiceBot → Live Call Trigger",
    endpoint: "/api/voicebot/start-pipeline",
    expectedBehavior: "Start voice pipeline with call logging and sentiment capture",
    testData: { campaignId: "QA_CAMPAIGN", contactList: ["test@example.com"], scriptId: "SCRIPT_001" },
    scenarioLink: "https://replit.dev/scenario/voicebot-call",
    moduleType: "VoiceBot"
  },
  {
    integrationName: "VoiceBot → Sentiment Logger", 
    endpoint: "/api/voicebot/initiate-call",
    expectedBehavior: "Log sentiment data from voice interactions",
    testData: { phoneNumber: "+1234567890", script: "QA Test Script", sentiment: "positive" },
    scenarioLink: "https://replit.dev/scenario/voicebot-sentiment",
    moduleType: "VoiceBot"
  },
  {
    integrationName: "Business Card → CRM",
    endpoint: "/api/mobile/scan-business-card",
    expectedBehavior: "Extract business card data and sync to CRM",
    testData: { imageData: "base64_image_placeholder", route: "mobile" },
    scenarioLink: "https://replit.dev/scenario/mobile-bizcard-scan", 
    moduleType: "Mobile"
  },
  {
    integrationName: "Export Data",
    endpoint: "/api/data/export",
    expectedBehavior: "Export Airtable data to CSV/JSON formats",
    testData: { format: "csv", table: "tblCommandCenter", dateRange: "last_30_days" },
    scenarioLink: "https://replit.dev/scenario/airtable-export",
    moduleType: "Airtable"
  },
  {
    integrationName: "Send SMS",
    endpoint: "/api/automation/send-sms", 
    expectedBehavior: "Send SMS via Twilio with delivery confirmation",
    testData: { to: "+1234567890", message: "QA Test Message", clientId: "TEST_CLIENT" },
    scenarioLink: "https://replit.dev/scenario/sms-send",
    moduleType: "Twilio"
  },
  {
    integrationName: "New Booking Sync",
    endpoint: "/api/automation/new-booking-sync",
    expectedBehavior: "Sync booking to calendar and database",
    testData: { clientId: "TEST_CLIENT", date: "2025-06-15", service: "Consultation" },
    scenarioLink: "https://replit.dev/scenario/calendar-sync",
    moduleType: "Core Automation"
  }
];

class QAValidationSystem {
  private testResults: QATestResult[] = [];
  
  async runValidationTest(spec: QAValidationSpec): Promise<QATestResult> {
    const startTime = Date.now();
    let testResult: QATestResult = {
      integrationName: spec.integrationName,
      status: 'PENDING',
      notes: 'Test initiated',
      scenarioLink: spec.scenarioLink,
      outputDataPopulated: false,
      recordCreated: false,
      retryAttempted: false,
      moduleType: spec.moduleType,
      testTimestamp: new Date().toISOString()
    };

    try {
      // Execute test against endpoint
      const response = await fetch(`http://localhost:5000${spec.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(spec.testData)
      });

      const responseData = await response.json();
      const executionTime = Date.now() - startTime;

      if (response.ok && responseData.success) {
        testResult.status = 'PASS';
        testResult.outputDataPopulated = true;
        testResult.recordCreated = true;
        testResult.notes = `✅ PASS - ${spec.expectedBehavior} (${executionTime}ms)`;
        
        // Check for integration-specific success indicators
        if (responseData.slackMessageTs) testResult.notes += ` | Slack: ${responseData.slackMessageTs}`;
        if (responseData.airtableRecordId) testResult.notes += ` | Airtable: ${responseData.airtableRecordId}`;
        if (responseData.zendeskTicketId) testResult.notes += ` | Zendesk: ${responseData.zendeskTicketId}`;
        if (responseData.twilioMessageSid) testResult.notes += ` | Twilio: ${responseData.twilioMessageSid}`;
        
      } else {
        testResult.status = 'FAIL';
        testResult.notes = `❌ FAIL - ${responseData.error || 'Unknown error'} (${executionTime}ms)`;
      }

    } catch (error) {
      testResult.status = 'FAIL';
      testResult.notes = `❌ FAIL - Network/execution error: ${error.message}`;
    }

    this.testResults.push(testResult);
    
    // Log to Airtable QA if credentials available
    await this.logToAirtableQA(testResult);
    
    return testResult;
  }

  async runAllValidationTests(): Promise<QATestResult[]> {
    console.log('🧪 Starting comprehensive QA validation suite...');
    
    const results: QATestResult[] = [];
    
    for (const spec of QA_VALIDATION_SPECS) {
      console.log(`Testing: ${spec.integrationName}`);
      const result = await this.runValidationTest(spec);
      results.push(result);
      
      // Brief pause between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return results;
  }

  async logToAirtableQA(testResult: QATestResult): Promise<void> {
    if (!process.env.AIRTABLE_API_KEY) return;
    
    try {
      await fetch(`https://api.airtable.com/v0/${COMMAND_CENTER_BASE_ID}/tbldPRZ4nHbtj9opU`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.AIRTABLE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          records: [{
            fields: {
              "Integration Name": testResult.integrationName,
              "✅ Pass/Fail": testResult.status === 'PASS' ? "✅ Pass" : "❌ Fail",
              "📝 Notes / Debug": testResult.notes,
              "📅 Test Date": testResult.testTimestamp,
              "👤 QA Owner": "YoBot QA System",
              "📤 Output Data Populated?": testResult.outputDataPopulated,
              "📁 Record Created?": testResult.recordCreated,
              "🔁 Retry Attempted?": testResult.retryAttempted,
              "⚙️ Module Type": testResult.moduleType,
              "🔗 Related Scenario Link": testResult.scenarioLink
            }
          }]
        })
      });
    } catch (error) {
      console.log(`Airtable QA logging failed for ${testResult.integrationName}: ${error.message}`);
    }
  }

  generateValidationReport(): any {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.status === 'PASS').length;
    const failedTests = this.testResults.filter(r => r.status === 'FAIL').length;
    
    return {
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        passRate: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0
      },
      results: this.testResults,
      timestamp: new Date().toISOString()
    };
  }
}

export function registerQAValidationRoutes(app: Express) {
  const qaSystem = new QAValidationSystem();

  // Run comprehensive QA validation suite
  app.post('/api/qa/run-validation-suite', async (req, res) => {
    try {
      console.log('🚀 Starting QA validation suite...');
      const results = await qaSystem.runAllValidationTests();
      const report = qaSystem.generateValidationReport();
      
      res.json({
        success: true,
        message: 'QA validation suite completed',
        report: report,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'QA validation suite failed',
        details: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Run individual test
  app.post('/api/qa/test-integration/:integrationName', async (req, res) => {
    try {
      const { integrationName } = req.params;
      const spec = QA_VALIDATION_SPECS.find(s => 
        s.integrationName.toLowerCase().includes(integrationName.toLowerCase())
      );
      
      if (!spec) {
        return res.status(404).json({
          success: false,
          error: 'Integration test specification not found'
        });
      }
      
      const result = await qaSystem.runValidationTest(spec);
      
      res.json({
        success: true,
        result: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Individual test failed',
        details: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Get QA validation report
  app.get('/api/qa/validation-report', (req, res) => {
    const report = qaSystem.generateValidationReport();
    res.json({
      success: true,
      report: report,
      timestamp: new Date().toISOString()
    });
  });
}