// Reusable bulk logger for 1,000+ automation functions
const PASS_FAIL_OPTIONS = {
  true: '✅',
  false: '❌'
};

export interface LogToAirtableParams {
  integrationName: string;
  passed: boolean;
  notes?: string;
  qaOwner?: string;
  outputDataPopulated?: boolean;
  recordCreated?: boolean;
  retryAttempted?: boolean;
  moduleType?: string;
  relatedScenarioLink?: string;
}

// Minimal utility function that can be called from anywhere
export async function logToAirtable(params: LogToAirtableParams): Promise<boolean> {
  const airtableApiKey = "paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa";
  const baseId = "appRt8V3tH4g5Z5if";
  const tableId = "tbly0fjE2M5uHET9X";
  const url = `https://api.airtable.com/v0/${baseId}/${tableId}`;

  const payload = {
    fields: {
      "Integration Name": params.integrationName,
      "Pass/Fail": PASS_FAIL_OPTIONS[params.passed],
      "Notes / Debug": params.notes || "",
      "Test Date": new Date().toISOString(),
      "QA Owner": params.qaOwner || "Daniel Sharpe",
      "Output Data Pop...": params.outputDataPopulated ?? true,
      "Record Created?": params.recordCreated ?? true,
      "Retry Attempted?": params.retryAttempted ?? false,
      "Module Type": params.moduleType || "Webhook",
      "Related Scenario Link": params.relatedScenarioLink || ""
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${airtableApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    console.log('📤 Payload:', payload);
    console.log('🌐 Response:', response.status, responseText);

    if (response.status === 200 || response.status === 201) {
      console.log('✅ Logged.');
      return true;
    } else {
      console.log('❌ Log failed.');
      return false;
    }
  } catch (error) {
    console.error('❌ Log failed:', error);
    return false;
  }
}

// Batch logger for multiple tests
export async function logBatchToAirtable(tests: LogToAirtableParams[]): Promise<boolean[]> {
  const results = [];
  for (const test of tests) {
    const result = await logToAirtable(test);
    results.push(result);
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return results;
}