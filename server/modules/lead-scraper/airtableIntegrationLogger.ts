// Airtable Integration Test Logger for YoBot Command Center
const AIRTABLE_BASE_ID = "appRt8V3tH4g5Z51f"; // YoBot Command Center (Live Ops)
const INTEGRATION_TEST_LOG_TABLE = "Integration Test Log Table";

interface IntegrationTestLog {
  integrationName: string;
  passOrFail: boolean;
  notes: string;
  qaOwner: string;
  outputDataPopulated: boolean;
  recordCreated: boolean;
  retryAttempted: boolean;
  moduleType: string;
  relatedScenarioLink: string;
}

export async function logIntegrationTest(testData: IntegrationTestLog): Promise<boolean> {
  if (!process.env.AIRTABLE_API_KEY) {
    console.warn('Missing Airtable API key for integration test logging');
    return false;
  }

  try {
    const timestamp = new Date().toISOString();
    
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(INTEGRATION_TEST_LOG_TABLE)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        records: [{
          fields: {
            'Integration Name': testData.integrationName,
            'Pass/Fail': testData.passOrFail ? 'Pass' : 'Fail',
            'Notes': testData.notes,
            'QA Owner': testData.qaOwner,
            'Output Data Populated': testData.outputDataPopulated,
            'Record Created': testData.recordCreated,
            'Retry Attempted': testData.retryAttempted,
            'Module Type': testData.moduleType,
            'Related Scenario Link': testData.relatedScenarioLink,
            'Test Date': timestamp,
            'Status': testData.passOrFail ? 'Completed' : 'Failed'
          }
        }]
      })
    });

    if (response.ok) {
      console.log(`Integration test logged: ${testData.integrationName} - ${testData.passOrFail ? 'PASS' : 'FAIL'}`);
      return true;
    } else {
      const errorText = await response.text();
      console.error(`Failed to log integration test: ${response.status} ${errorText}`);
      return false;
    }
  } catch (error) {
    console.error('Error logging integration test:', error);
    return false;
  }
}