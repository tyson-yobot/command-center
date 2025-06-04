/**
 * Direct Automation Test Script - Tests all 30 new functions (131-160) directly
 * Bypasses frontend routing issues and logs every result to Airtable
 */

import fetch from 'node-fetch';
const BASE_URL = 'http://localhost:5000';

// All 30 automation functions to test
const automationTests = [
  // Batch 14: Functions 131-140
  { id: 131, name: "CRM Script Generator", endpoint: "/api/automation/generate-crm-script" },
  { id: 132, name: "Intake Form Validator", endpoint: "/api/automation/validate-intake" },
  { id: 133, name: "Silent Call Detector", endpoint: "/api/automation/detect-silent-call" },
  { id: 134, name: "QA Failure Alert", endpoint: "/api/automation/alert-qa-fail" },
  { id: 135, name: "ISO Date Formatter", endpoint: "/api/automation/format-date-iso" },
  { id: 136, name: "Personality Assigner", endpoint: "/api/automation/assign-personality" },
  { id: 137, name: "SmartSpend Entry Creator", endpoint: "/api/automation/create-smartspend-entry" },
  { id: 138, name: "Voice Session ID Generator", endpoint: "/api/automation/generate-voice-session-id" },
  { id: 139, name: "Call Digest Poster", endpoint: "/api/automation/post-call-digest" },
  { id: 140, name: "Live Error Push", endpoint: "/api/automation/push-live-error" },
  
  // Batch 15: Functions 141-150
  { id: 141, name: "Bot Training Prompt Generator", endpoint: "/api/automation/generate-training-prompt" },
  { id: 142, name: "Cold Start Logger", endpoint: "/api/automation/log-cold-start" },
  { id: 143, name: "Markdown Converter", endpoint: "/api/automation/convert-to-markdown" },
  { id: 144, name: "QBO Invoice Summary", endpoint: "/api/automation/qbo-invoice-summary" },
  { id: 145, name: "Role Assignment by Domain", endpoint: "/api/automation/assign-role-by-domain" },
  { id: 146, name: "Customer Reconciliation", endpoint: "/api/automation/reconcile-customers" },
  { id: 147, name: "Full API Health Check", endpoint: "/api/automation/full-api-check" },
  { id: 148, name: "ROI Summary Generator", endpoint: "/api/automation/roi-summary" },
  { id: 149, name: "Manual Override Logger", endpoint: "/api/automation/log-manual-override" },
  { id: 150, name: "Slack Message Formatter", endpoint: "/api/automation/format-slack-message" },
  
  // Batch 16: Functions 151-160
  { id: 151, name: "VoiceBot Escalation Detection", endpoint: "/api/automation/detect-escalation" },
  { id: 152, name: "Failure Categorization", endpoint: "/api/automation/categorize-failure" },
  { id: 153, name: "System Health Metric Update", endpoint: "/api/automation/update-health-metric" },
  { id: 154, name: "Broken Link Detection", endpoint: "/api/automation/detect-broken-links" },
  { id: 155, name: "AI Script Expansion", endpoint: "/api/automation/expand-to-script" },
  { id: 156, name: "Google Drive Backup", endpoint: "/api/automation/drive-backup" },
  { id: 157, name: "New Lead Notification", endpoint: "/api/automation/notify-new-lead" },
  { id: 158, name: "Domain Extraction", endpoint: "/api/automation/extract-domain" },
  { id: 159, name: "Auto-Complete Task", endpoint: "/api/automation/auto-complete-task" },
  { id: 160, name: "Test Snapshot Creation", endpoint: "/api/automation/create-test-snapshot" }
];

async function logToAirtable(testName, status, details, errorMessage = "") {
  try {
    const response = await fetch(`${BASE_URL}/api/log-integration-test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        testName,
        status,
        timestamp: new Date().toISOString(),
        details,
        errorMessage
      })
    });
    
    const result = await response.text();
    
    if (response.ok) {
      console.log(`  ✅ Logged to Airtable: ${testName}`);
      return true;
    } else {
      console.log(`  ❌ Airtable logging failed for ${testName}: ${result.slice(0, 100)}...`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Airtable logging error for ${testName}: ${error.message}`);
    return false;
  }
}

async function testFunction(test) {
  console.log(`Testing Function ${test.id}: ${test.name}...`);
  
  try {
    const response = await fetch(`${BASE_URL}${test.endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ testMode: true })
    });
    
    const responseText = await response.text();
    
    // Check if response is HTML (routing issue)
    if (responseText.startsWith('<!DOCTYPE html>')) {
      console.log(`  ❌ FAIL - Function ${test.id}: Route not found (HTML response)`);
      await logToAirtable(
        `Function ${test.id}: ${test.name}`,
        'FAIL',
        'Automation function test - Route registration issue',
        'API endpoint returned HTML instead of JSON'
      );
      return { status: 'FAIL', error: 'Route not found' };
    }
    
    // Try to parse JSON response
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.log(`  ❌ FAIL - Function ${test.id}: Invalid JSON response`);
      await logToAirtable(
        `Function ${test.id}: ${test.name}`,
        'FAIL',
        'Automation function test - Invalid response format',
        'API endpoint returned invalid JSON'
      );
      return { status: 'FAIL', error: 'Invalid JSON response' };
    }
    
    if (response.ok && result.success) {
      console.log(`  ✅ PASS - Function ${test.id}: ${test.name}`);
      await logToAirtable(
        `Function ${test.id}: ${test.name}`,
        'PASS',
        `Successfully executed automation function. ${result.message || 'Function completed successfully'}`,
        ''
      );
      return { status: 'PASS', message: result.message };
    } else {
      console.log(`  ❌ FAIL - Function ${test.id}: ${result.error || 'Unknown error'}`);
      await logToAirtable(
        `Function ${test.id}: ${test.name}`,
        'FAIL',
        'Automation function test execution failed',
        result.error || 'Unknown error occurred'
      );
      return { status: 'FAIL', error: result.error };
    }
    
  } catch (error) {
    console.log(`  ❌ FAIL - Function ${test.id}: ${error.message}`);
    await logToAirtable(
      `Function ${test.id}: ${test.name}`,
      'FAIL',
      'Automation function test - Network or execution error',
      error.message
    );
    return { status: 'FAIL', error: error.message };
  }
}

async function runAllTests() {
  console.log('🚀 Starting Direct Automation Test Suite');
  console.log(`   Testing ${automationTests.length} automation functions (131-160)`);
  console.log('   Every test will be logged to Airtable Integration Test Log 2\n');
  
  const results = [];
  
  for (const test of automationTests) {
    const result = await testFunction(test);
    results.push({ ...test, ...result });
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Generate summary
  const totalTests = results.length;
  const passedTests = results.filter(r => r.status === 'PASS').length;
  const failedTests = results.filter(r => r.status === 'FAIL').length;
  const passRate = ((passedTests / totalTests) * 100).toFixed(1);
  
  console.log(`\n📊 FINAL TEST SUMMARY`);
  console.log(`=================================`);
  console.log(`Total Functions: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log(`Pass Rate: ${passRate}%`);
  console.log(`System Status: ${passRate >= 90 ? 'OPERATIONAL' : 'NEEDS ATTENTION'}`);
  
  // Log summary to Airtable
  await logToAirtable(
    `Complete Automation Functions 131-160 Test Suite`,
    passRate >= 90 ? 'PASS' : 'FAIL',
    `Comprehensive test of 30 new automation functions across batches 14-16. Pass rate: ${passRate}%. ${passedTests} functions passed, ${failedTests} failed.`,
    failedTests > 0 ? `${failedTests} automation functions failed testing and need attention` : ''
  );
  
  if (failedTests > 0) {
    console.log(`\n⚠️  Failed Functions:`);
    results.filter(r => r.status === 'FAIL').forEach(result => {
      console.log(`   Function ${result.id}: ${result.name} - ${result.error}`);
    });
  } else {
    console.log(`\n🎉 All automation functions passed! System fully operational.`);
  }
  
  console.log(`\n📝 All test results have been logged to Airtable Integration Test Log 2`);
  console.log(`   Automation system now includes 160+ functions across 16 batches`);
}

// Run the test suite
runAllTests().catch(console.error);