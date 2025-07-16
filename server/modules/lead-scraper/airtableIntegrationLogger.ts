// Airtable Integration Test Logger for YoBot Command Center

import { COMMAND_CENTER_BASE_ID, TABLE_NAMES, tableUrl, getAirtableApiKey } from "../../../shared/airtableConfig";

const AIRTABLE_BASE_ID = COMMAND_CENTER_BASE_ID; // YoBot Command Center (Live Ops)
const INTEGRATION_TEST_LOG_TABLE = TABLE_NAMES.INTEGRATION_TEST_LOG;



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

// Constants for Airtable field names to improve readability and prevent typos
const AIRTABLE_FIELD_NAMES = {
  INTEGRATION_NAME: 'Integration Name',
  PASS_FAIL: 'Pass/Fail',
  NOTES: 'Notes',
  QA_OWNER: 'QA Owner',
  OUTPUT_DATA_POPULATED: 'Output Data Populated',
  RECORD_CREATED: 'Record Created',
  RETRY_ATTEMPTED: 'Retry Attempted',
  MODULE_TYPE: 'Module Type',
  RELATED_SCENARIO_LINK: 'Related Scenario Link',
  TEST_DATE: 'Test Date',
  STATUS: 'Status',
};

async function sendAirtableRequest(
  baseId: string,
  tableName: string,
  records: any[]
): Promise<boolean> {
  const apiKey = getAirtableApiKey();
  if (!apiKey) {
    console.warn('Missing Airtable API key. Cannot send request.');
    return false;
  }

  try {
    const response = await fetch(tableUrl(baseId, tableName), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ records })
    });

    if (response.ok) {
      return true;
    } else {
      const errorText = await response.text();
      console.error(`Airtable request failed: ${response.status} ${errorText}`);
      return false;
    }
  } catch (error) {
    console.error('Error sending Airtable request:', error);
    return false;
  }
}

export async function logIntegrationTest(testData: IntegrationTestLog): Promise<boolean> {
  const timestamp = new Date().toISOString();
  const records = [{
    fields: {
      [AIRTABLE_FIELD_NAMES.INTEGRATION_NAME]: testData.integrationName,
      [AIRTABLE_FIELD_NAMES.PASS_FAIL]: testData.passOrFail ? 'Pass' : 'Fail',
      [AIRTABLE_FIELD_NAMES.NOTES]: testData.notes,
      [AIRTABLE_FIELD_NAMES.QA_OWNER]: testData.qaOwner,
      [AIRTABLE_FIELD_NAMES.OUTPUT_DATA_POPULATED]: testData.outputDataPopulated,
      [AIRTABLE_FIELD_NAMES.RECORD_CREATED]: testData.recordCreated,
      [AIRTABLE_FIELD_NAMES.RETRY_ATTEMPTED]: testData.retryAttempted,
      [AIRTABLE_FIELD_NAMES.MODULE_TYPE]: testData.moduleType,
      [AIRTABLE_FIELD_NAMES.RELATED_SCENARIO_LINK]: testData.relatedScenarioLink,
      [AIRTABLE_FIELD_NAMES.TEST_DATE]: timestamp,
      [AIRTABLE_FIELD_NAMES.STATUS]: testData.passOrFail ? 'Completed' : 'Failed'
    }
  }];

  const success = await sendAirtableRequest(COMMAND_CENTER_BASE_ID, INTEGRATION_TEST_LOG_TABLE, records);

  if (success) {
    console.log(`Integration test logged: ${testData.integrationName} - ${testData.passOrFail ? 'PASS' : 'FAIL'}`);
  } else {
    console.error(`Failed to log integration test: ${testData.integrationName}`);
  }
  return success;
}

export async function logEventToAirtable(
  eventType: string,
  source: string,
  identifier: string,
  status: string,
  details: string
): Promise<boolean> {
  const timestamp = new Date().toISOString();
  const records = [{
    fields: {
      [AIRTABLE_FIELD_NAMES.INTEGRATION_NAME]: eventType,
      [AIRTABLE_FIELD_NAMES.PASS_FAIL]: status === 'SUCCESS' ? 'Pass' : 'Fail',
      [AIRTABLE_FIELD_NAMES.NOTES]: details,
      [AIRTABLE_FIELD_NAMES.QA_OWNER]: source,
      [AIRTABLE_FIELD_NAMES.OUTPUT_DATA_POPULATED]: true,
      [AIRTABLE_FIELD_NAMES.RECORD_CREATED]: true,
      [AIRTABLE_FIELD_NAMES.RETRY_ATTEMPTED]: false,
      [AIRTABLE_FIELD_NAMES.MODULE_TYPE]: 'Lead Scraper',
      [AIRTABLE_FIELD_NAMES.RELATED_SCENARIO_LINK]: identifier,
      [AIRTABLE_FIELD_NAMES.TEST_DATE]: timestamp,
      [AIRTABLE_FIELD_NAMES.STATUS]: status === 'SUCCESS' ? 'Completed' : 'Failed'
    }
  }];

  const success = await sendAirtableRequest(AIRTABLE_BASE_ID, INTEGRATION_TEST_LOG_TABLE, records);

  if (success) {
    console.log(`Event logged: ${eventType} - ${status}`);
  } else {
    console.error(`Failed to log event: ${eventType} - ${status}`);
  }
  return success;
}