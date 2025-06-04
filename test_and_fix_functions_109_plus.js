import axios from 'axios';
import { execSync } from 'child_process';

const BASE_URL = 'http://localhost:5000';
const AIRTABLE_BASE_ID = 'appCoAtCZdARb4AM2';
const AIRTABLE_TABLE_ID = 'tblRNjNnaGL5ICIf9';

// Functions 109+ to test and fix
const functionsToTest = [
  { id: 109, name: "Sentiment Analysis Logging", endpoint: "/api/automation/sentiment-analysis", batch: "Advanced Analytics (101-110)" },
  { id: 110, name: "Escalation Tracker", endpoint: "/api/airtable/log-escalation", batch: "System Operations (110-120)" },
  { id: 111, name: "Client Touchpoint Log", endpoint: "/api/airtable/log-touchpoint", batch: "System Operations (110-120)" },
  { id: 112, name: "Missed Call Logger", endpoint: "/api/airtable/log-missed-call", batch: "System Operations (110-120)" },
  { id: 113, name: "Business Card OCR", endpoint: "/api/automation/business-card-ocr", batch: "System Operations (110-120)" },
  { id: 114, name: "Voice Synthesis", endpoint: "/api/voice/synthesize", batch: "System Operations (110-120)" },
  { id: 115, name: "Stripe Payment", endpoint: "/api/stripe/create-checkout", batch: "System Operations (110-120)" },
  { id: 116, name: "Lead Validation", endpoint: "/api/leads/validate", batch: "System Operations (110-120)" },
  { id: 117, name: "ROI Calculator", endpoint: "/api/roi/calculate", batch: "System Operations (110-120)" },
  { id: 118, name: "System Uptime", endpoint: "/api/system/uptime", batch: "System Operations (110-120)" },
  { id: 119, name: "High Value Deal Flag", endpoint: "/api/deals/flag-high-value", batch: "System Operations (110-120)" },
  { id: 120, name: "Environment Check", endpoint: "/api/system/environment", batch: "System Operations (110-120)" },
  { id: 121, name: "Deactivate Trials", endpoint: "/api/automation/deactivate-trials", batch: "Final Management (121-130)" },
  { id: 122, name: "CRM Audit", endpoint: "/api/automation/audit-crm", batch: "Final Management (121-130)" },
  { id: 123, name: "Slack Ticket Creation", endpoint: "/api/automation/slack-ticket", batch: "Final Management (121-130)" },
  { id: 124, name: "Meeting Agenda", endpoint: "/api/automation/meeting-agenda", batch: "Final Management (121-130)" },
  { id: 125, name: "Sentiment Analysis", endpoint: "/api/automation/sentiment-analysis", batch: "Final Management (121-130)" },
  { id: 126, name: "Lead Count Update", endpoint: "/api/automation/lead-count", batch: "Final Management (121-130)" },
  { id: 127, name: "Phantombuster Event", endpoint: "/api/automation/phantom-event", batch: "Final Management (121-130)" },
  { id: 128, name: "Admin Alert", endpoint: "/api/automation/admin-alert", batch: "Final Management (121-130)" },
  { id: 129, name: "Business Classification", endpoint: "/api/automation/classify-business", batch: "Final Management (121-130)" },
  { id: 130, name: "Archive Logs", endpoint: "/api/automation/archive-logs", batch: "Final Management (121-130)" }
];

async function testFunction(func) {
  try {
    const response = await axios.post(`${BASE_URL}${func.endpoint}`, { testMode: true }, {
      timeout: 5000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.status === 200) {
      return { status: 'PASS', error: null, response: response.data };
    } else {
      return { status: 'FAIL', error: `HTTP ${response.status}`, response: null };
    }
  } catch (error) {
    return { status: 'FAIL', error: error.message, response: null };
  }
}

async function updateAirtableRecord(func, testResult) {
  const status = testResult.status === 'PASS' ? '✅ Pass' : '❌ Fail';
  const notes = testResult.status === 'PASS' 
    ? `Successfully operational - ${func.name} working correctly`
    : `Error: ${testResult.error} - Needs configuration fix`;

  // Get existing record ID first
  try {
    const getCommand = `curl -X GET "https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}" \\
      -H "Authorization: Bearer $AIRTABLE_PERSONAL_ACCESS_TOKEN" 2>/dev/null`;
    
    const getResult = execSync(getCommand, { encoding: 'utf8' });
    const getResponse = JSON.parse(getResult);
    
    const existingRecord = getResponse.records.find(record => 
      record.fields['🧩 Integration Name'] && 
      record.fields['🧩 Integration Name'].includes(`Function ${func.id}:`)
    );

    if (existingRecord) {
      // Update existing record
      const updatePayload = JSON.stringify({
        fields: {
          "✅ Pass/Fail": status,
          "📝 Notes / Debug": notes,
          "📅 Test Date": new Date().toISOString(),
          "☑️ Output Data Populated?": testResult.status === 'PASS' ? "Success" : "Failed",
          "📁 Record Created?": testResult.status === 'PASS'
        }
      });

      const updateCommand = `curl -X PATCH "https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}/${existingRecord.id}" \\
        -H "Authorization: Bearer $AIRTABLE_PERSONAL_ACCESS_TOKEN" \\
        -H "Content-Type: application/json" \\
        -d '${updatePayload.replace(/'/g, "'\\''")}' 2>/dev/null`;
      
      const updateResult = execSync(updateCommand, { encoding: 'utf8' });
      return JSON.parse(updateResult);
    } else {
      console.log(`No existing record found for Function ${func.id}`);
      return null;
    }
  } catch (error) {
    console.log(`Failed to update Function ${func.id}: ${error.message}`);
    return null;
  }
}

async function testAndFixAll() {
  console.log("Testing and fixing all functions from 109 onwards...");
  console.log("====================================================");
  
  const results = [];
  let passCount = 0;
  let failCount = 0;
  let updatedCount = 0;

  for (const func of functionsToTest) {
    console.log(`Testing Function ${func.id}: ${func.name}...`);
    
    const testResult = await testFunction(func);
    results.push({ ...func, testResult });
    
    if (testResult.status === 'PASS') {
      console.log(`✅ Function ${func.id}: ${func.name} - OPERATIONAL`);
      passCount++;
    } else {
      console.log(`❌ Function ${func.id}: ${func.name} - ${testResult.error}`);
      failCount++;
    }

    // Update Airtable record
    const updateResult = await updateAirtableRecord(func, testResult);
    if (updateResult) {
      console.log(`📝 Updated Airtable record for Function ${func.id}`);
      updatedCount++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log("\n📊 COMPREHENSIVE TEST AND FIX RESULTS:");
  console.log("======================================");
  console.log(`Total Functions Tested: ${functionsToTest.length}`);
  console.log(`Operational: ${passCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Airtable Records Updated: ${updatedCount}`);
  console.log(`Success Rate: ${((passCount / functionsToTest.length) * 100).toFixed(1)}%`);

  console.log("\n✅ OPERATIONAL FUNCTIONS:");
  results.filter(r => r.testResult.status === 'PASS').forEach(r => {
    console.log(`- ${r.id}: ${r.name}`);
  });

  console.log("\n❌ FAILED FUNCTIONS (Need Fixes):");
  const failedFunctions = results.filter(r => r.testResult.status === 'FAIL');
  failedFunctions.forEach(r => {
    console.log(`- ${r.id}: ${r.name} - ${r.testResult.error}`);
  });

  return { results, passCount, failCount, updatedCount, failedFunctions };
}

testAndFixAll().catch(console.error);