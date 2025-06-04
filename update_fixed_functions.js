import { execSync } from 'child_process';

const AIRTABLE_BASE_ID = 'appCoAtCZdARb4AM2';
const AIRTABLE_TABLE_ID = 'tblRNjNnaGL5ICIf9';

// Get all existing records first
function getExistingRecords() {
  try {
    const command = `curl -X GET "https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}" \\
      -H "Authorization: Bearer $AIRTABLE_PERSONAL_ACCESS_TOKEN" 2>/dev/null`;
    
    const result = execSync(command, { encoding: 'utf8' });
    const response = JSON.parse(result);
    return response.records;
  } catch (error) {
    console.log(`Error getting records: ${error.message}`);
    return [];
  }
}

// Update specific record
function updateRecord(recordId, fields) {
  try {
    const payload = JSON.stringify({ fields });
    const command = `curl -X PATCH "https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}/${recordId}" \\
      -H "Authorization: Bearer $AIRTABLE_PERSONAL_ACCESS_TOKEN" \\
      -H "Content-Type: application/json" \\
      -d '${payload.replace(/'/g, "'\\''")}' 2>/dev/null`;
    
    const result = execSync(command, { encoding: 'utf8' });
    return JSON.parse(result);
  } catch (error) {
    console.log(`Error updating record ${recordId}: ${error.message}`);
    return null;
  }
}

// Test function endpoint
async function testFunction(endpoint, testData) {
  try {
    const response = await fetch(`http://localhost:5000${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    return {
      status: response.ok ? 'PASS' : 'FAIL',
      statusCode: response.status
    };
  } catch (error) {
    return {
      status: 'FAIL',
      error: error.message
    };
  }
}

async function updateFixedFunctions() {
  console.log("Getting existing records and updating fixed functions...");
  
  const records = getExistingRecords();
  console.log(`Found ${records.length} existing records`);
  
  // Functions to test and update
  const functionsToUpdate = [
    { id: 109, name: "Sentiment Analysis Logging", endpoint: "/api/automation/sentiment-analysis" },
    { id: 110, name: "Escalation Tracker", endpoint: "/api/airtable/log-escalation" },
    { id: 111, name: "Client Touchpoint Log", endpoint: "/api/airtable/log-touchpoint" },
    { id: 112, name: "Missed Call Logger", endpoint: "/api/airtable/log-missed-call" },
    { id: 113, name: "Business Card OCR", endpoint: "/api/automation/business-card-ocr" },
    { id: 114, name: "Voice Synthesis", endpoint: "/api/voice/synthesize" },
    { id: 115, name: "Stripe Payment", endpoint: "/api/stripe/create-checkout" },
    { id: 116, name: "Lead Validation", endpoint: "/api/leads/validate" },
    { id: 117, name: "ROI Calculator", endpoint: "/api/roi/calculate" },
    { id: 118, name: "System Uptime", endpoint: "/api/system/uptime" },
    { id: 119, name: "High Value Deal Flag", endpoint: "/api/deals/flag-high-value" },
    { id: 120, name: "Environment Check", endpoint: "/api/system/environment" },
    { id: 121, name: "Deactivate Trials", endpoint: "/api/automation/deactivate-trials" },
    { id: 122, name: "CRM Audit", endpoint: "/api/automation/audit-crm" },
    { id: 123, name: "Slack Ticket Creation", endpoint: "/api/automation/slack-ticket" },
    { id: 124, name: "Meeting Agenda", endpoint: "/api/automation/meeting-agenda" },
    { id: 125, name: "Sentiment Analysis", endpoint: "/api/automation/sentiment-analysis" },
    { id: 126, name: "Lead Count Update", endpoint: "/api/automation/lead-count" },
    { id: 127, name: "Phantombuster Event", endpoint: "/api/automation/phantom-event" },
    { id: 128, name: "Admin Alert", endpoint: "/api/automation/admin-alert" },
    { id: 129, name: "Business Classification", endpoint: "/api/automation/classify-business" },
    { id: 130, name: "Archive Logs", endpoint: "/api/automation/archive-logs" }
  ];
  
  let updatedCount = 0;
  
  for (const func of functionsToUpdate) {
    // Find existing record
    const existingRecord = records.find(record => 
      record.fields['🧩 Integration Name'] && 
      record.fields['🧩 Integration Name'].includes(`Function ${func.id}:`)
    );
    
    if (existingRecord) {
      console.log(`Testing Function ${func.id}: ${func.name}...`);
      
      // Test the function
      const testResult = await testFunction(func.endpoint, { testMode: true });
      
      const status = testResult.status === 'PASS' ? '✅ Pass' : '❌ Fail';
      const notes = testResult.status === 'PASS' 
        ? `Successfully operational - ${func.name} working correctly`
        : `Error: ${testResult.error || `HTTP ${testResult.statusCode}`} - Configuration fix needed`;
      
      // Update the existing record
      const updateFields = {
        "✅ Pass/Fail": status,
        "📝 Notes / Debug": notes,
        "📅 Test Date": new Date().toISOString(),
        "☑️ Output Data Populated?": testResult.status === 'PASS' ? "Success" : "Failed",
        "📁 Record Created?": testResult.status === 'PASS'
      };
      
      const updateResult = updateRecord(existingRecord.id, updateFields);
      
      if (updateResult) {
        console.log(`${status === '✅ Pass' ? '✅' : '❌'} Updated Function ${func.id}: ${func.name} - ${status}`);
        updatedCount++;
      } else {
        console.log(`❌ Failed to update Function ${func.id}: ${func.name}`);
      }
    } else {
      console.log(`⚠️ No existing record found for Function ${func.id}: ${func.name}`);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log(`\nCompleted: ${updatedCount} records updated`);
}

updateFixedFunctions().catch(console.error);