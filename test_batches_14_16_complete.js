/**
 * Complete Test Script for Automation Batches 14-16 (Functions 131-160)
 * Tests all newly implemented automation functions and logs results to Airtable
 */

const BASE_URL = 'http://localhost:5000';

// Test data for comprehensive automation testing
const testData = {
  batch14: [
    {
      id: 131,
      name: "CRM Script Generator",
      endpoint: "/api/automation/generate-crm-script",
      payload: { notes: "Follow up with lead about pricing", testMode: true }
    },
    {
      id: 132,
      name: "Intake Form Validator",
      endpoint: "/api/automation/validate-intake",
      payload: { intake: { name: "John Doe", email: "john@test.com", phone: "555-1234" }, testMode: true }
    },
    {
      id: 133,
      name: "Silent Call Detector",
      endpoint: "/api/automation/detect-silent-call",
      payload: { call: { duration: 30, transcript: "" }, testMode: true }
    },
    {
      id: 134,
      name: "QA Failure Alert",
      endpoint: "/api/automation/alert-qa-fail",
      payload: { testName: "Sample QA Test", testMode: true }
    },
    {
      id: 135,
      name: "ISO Date Formatter",
      endpoint: "/api/automation/format-date-iso",
      payload: { date: "2024-06-04", testMode: true }
    },
    {
      id: 136,
      name: "Personality Assigner",
      endpoint: "/api/automation/assign-personality",
      payload: { industry: "healthcare", testMode: true }
    },
    {
      id: 137,
      name: "SmartSpend Entry Creator",
      endpoint: "/api/automation/create-smartspend-entry",
      payload: { data: { campaign: "Test Campaign", budget: 1000 }, testMode: true }
    },
    {
      id: 138,
      name: "Voice Session ID Generator",
      endpoint: "/api/automation/generate-voice-session-id",
      payload: { userId: "user_123", testMode: true }
    },
    {
      id: 139,
      name: "Call Digest Poster",
      endpoint: "/api/automation/post-call-digest",
      payload: { summaries: [{ call: "Call 1", summary: "Successful call" }], testMode: true }
    },
    {
      id: 140,
      name: "Live Error Push",
      endpoint: "/api/automation/push-live-error",
      payload: { error: { message: "Test error", type: "validation" }, testMode: true }
    }
  ],
  batch15: [
    {
      id: 141,
      name: "Bot Training Prompt Generator",
      endpoint: "/api/automation/generate-training-prompt",
      payload: { testMode: true }
    },
    {
      id: 142,
      name: "Cold Start Logger",
      endpoint: "/api/automation/log-cold-start",
      payload: { source: "Test System", testMode: true }
    },
    {
      id: 143,
      name: "Markdown Converter",
      endpoint: "/api/automation/convert-to-markdown",
      payload: { notes: "**Important:** Test note with formatting", testMode: true }
    },
    {
      id: 144,
      name: "QBO Invoice Summary",
      endpoint: "/api/automation/qbo-invoice-summary",
      payload: { testMode: true }
    },
    {
      id: 145,
      name: "Role Assignment by Domain",
      endpoint: "/api/automation/assign-role-by-domain",
      payload: { email: "test@lawfirm.com", testMode: true }
    },
    {
      id: 146,
      name: "Customer Reconciliation",
      endpoint: "/api/automation/reconcile-customers",
      payload: { testMode: true }
    },
    {
      id: 147,
      name: "Full API Health Check",
      endpoint: "/api/automation/full-api-check",
      payload: { testMode: true }
    },
    {
      id: 148,
      name: "ROI Summary Generator",
      endpoint: "/api/automation/roi-summary",
      payload: { testMode: true }
    },
    {
      id: 149,
      name: "Manual Override Logger",
      endpoint: "/api/automation/log-manual-override",
      payload: { user: "Test User", reason: "Testing override", testMode: true }
    },
    {
      id: 150,
      name: "Slack Message Formatter",
      endpoint: "/api/automation/format-slack-message",
      payload: { content: "Test message", status: "success", testMode: true }
    }
  ],
  batch16: [
    {
      id: 151,
      name: "VoiceBot Escalation Detection",
      endpoint: "/api/automation/detect-escalation",
      payload: { transcript: "I need to speak to a human", testMode: true }
    },
    {
      id: 152,
      name: "Failure Categorization",
      endpoint: "/api/automation/categorize-failure",
      payload: { moduleName: "stripe-payment", testMode: true }
    },
    {
      id: 153,
      name: "System Health Metric Update",
      endpoint: "/api/automation/update-health-metric",
      payload: { key: "cpu_usage", status: "optimal", testMode: true }
    },
    {
      id: 154,
      name: "Broken Link Detection",
      endpoint: "/api/automation/detect-broken-links",
      payload: { record: { contacts: [] }, linkedField: "contacts", testMode: true }
    },
    {
      id: 155,
      name: "AI Script Expansion",
      endpoint: "/api/automation/expand-to-script",
      payload: { prompt: "Schedule follow-up meeting", testMode: true }
    },
    {
      id: 156,
      name: "Google Drive Backup",
      endpoint: "/api/automation/drive-backup",
      payload: { data: { test: "data" }, fileName: "backup.json", testMode: true }
    },
    {
      id: 157,
      name: "New Lead Notification",
      endpoint: "/api/automation/notify-new-lead",
      payload: { lead: { name: "John Doe", email: "john@test.com" }, testMode: true }
    },
    {
      id: 158,
      name: "Domain Extraction",
      endpoint: "/api/automation/extract-domain",
      payload: { url: "https://www.example.com/page", testMode: true }
    },
    {
      id: 159,
      name: "Auto-Complete Task",
      endpoint: "/api/automation/auto-complete-task",
      payload: { task: { id: "task_123", label: "autofinish" }, testMode: true }
    },
    {
      id: 160,
      name: "Test Snapshot Creation",
      endpoint: "/api/automation/create-test-snapshot",
      payload: { testName: "Sample Test", details: { status: "PASS" }, testMode: true }
    }
  ]
};

async function runBatchTest(batchName, batchTests) {
  console.log(`\n🧪 Testing ${batchName} (${batchTests.length} functions)...`);
  
  const results = [];
  
  for (const test of batchTests) {
    try {
      console.log(`  Testing Function ${test.id}: ${test.name}...`);
      
      const response = await fetch(`${BASE_URL}${test.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(test.payload)
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log(`    ✅ PASS - ${test.name}`);
        results.push({
          id: test.id,
          name: test.name,
          status: 'PASS',
          message: result.message || 'Function executed successfully',
          timestamp: new Date().toISOString()
        });
      } else {
        console.log(`    ❌ FAIL - ${test.name}: ${result.error || 'Unknown error'}`);
        results.push({
          id: test.id,
          name: test.name,
          status: 'FAIL',
          error: result.error || 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.log(`    ❌ FAIL - ${test.name}: ${error.message}`);
      results.push({
        id: test.id,
        name: test.name,
        status: 'FAIL',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  return results;
}

async function logTestResultsToAirtable(batchResults, batchName) {
  console.log(`\n📝 Logging ${batchName} results to Airtable...`);
  
  for (const result of batchResults) {
    try {
      const logData = {
        testName: `Function ${result.id}: ${result.name}`,
        status: result.status,
        timestamp: result.timestamp,
        details: result.message || `${batchName} automation test`,
        errorMessage: result.error || ""
      };
      
      const response = await fetch(`${BASE_URL}/api/log-integration-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData)
      });
      
      if (response.ok) {
        console.log(`  ✅ Logged Function ${result.id} to Airtable`);
      } else {
        console.log(`  ❌ Failed to log Function ${result.id} to Airtable`);
      }
      
    } catch (error) {
      console.log(`  ❌ Error logging Function ${result.id}: ${error.message}`);
    }
  }
}

async function runCompleteTest() {
  console.log('🚀 Starting Complete Automation Batches 14-16 Test Suite');
  console.log('   Testing 30 new automation functions (131-160)');
  console.log('   Each test will be logged to Airtable Integration Test Log 2');
  
  const allResults = [];
  
  // Test Batch 14 (Functions 131-140)
  const batch14Results = await runBatchTest('Batch 14 (CRM & System Operations)', testData.batch14);
  allResults.push(...batch14Results);
  await logTestResultsToAirtable(batch14Results, 'Batch 14');
  
  // Test Batch 15 (Functions 141-150)
  const batch15Results = await runBatchTest('Batch 15 (Advanced Integrations)', testData.batch15);
  allResults.push(...batch15Results);
  await logTestResultsToAirtable(batch15Results, 'Batch 15');
  
  // Test Batch 16 (Functions 151-160)
  const batch16Results = await runBatchTest('Batch 16 (Voice & System Health)', testData.batch16);
  allResults.push(...batch16Results);
  await logTestResultsToAirtable(batch16Results, 'Batch 16');
  
  // Generate summary report
  const totalTests = allResults.length;
  const passedTests = allResults.filter(r => r.status === 'PASS').length;
  const failedTests = allResults.filter(r => r.status === 'FAIL').length;
  const passRate = ((passedTests / totalTests) * 100).toFixed(1);
  
  console.log(`\n📊 TEST SUMMARY REPORT`);
  console.log(`=================================`);
  console.log(`Total Functions Tested: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log(`Pass Rate: ${passRate}%`);
  console.log(`System Status: ${passRate >= 90 ? 'OPERATIONAL' : 'NEEDS ATTENTION'}`);
  
  // Log final summary to Airtable
  try {
    await fetch(`${BASE_URL}/api/log-integration-test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        testName: `Complete Batches 14-16 Test Suite (Functions 131-160)`,
        status: passRate >= 90 ? 'PASS' : 'FAIL',
        timestamp: new Date().toISOString(),
        details: `Tested ${totalTests} functions across 3 batches. Pass rate: ${passRate}%. ${passedTests} passed, ${failedTests} failed.`,
        errorMessage: failedTests > 0 ? `${failedTests} functions failed testing` : ""
      })
    });
    console.log(`\n✅ Summary logged to Airtable Integration Test Log 2`);
  } catch (error) {
    console.log(`\n❌ Failed to log summary: ${error.message}`);
  }
  
  if (failedTests > 0) {
    console.log(`\n⚠️  Failed Functions:`);
    allResults.filter(r => r.status === 'FAIL').forEach(result => {
      console.log(`   Function ${result.id}: ${result.name} - ${result.error}`);
    });
  }
  
  console.log(`\n🎯 Automation system expanded to 160+ functions across 16 batches`);
  console.log(`   All test results logged to Airtable for audit compliance`);
}

// Run the complete test suite
runCompleteTest().catch(console.error);