// Airtable Integration Test Log implementation per specification
export async function logIntegrationTest({
  integrationName,
  passOrFail,
  notes,
  qaOwner = "YoBot System",
  outputDataPopulated = true,
  recordCreated = true,
  retryAttempted = false,
  moduleType = "Scraper",
  relatedScenarioLink = ""
}: {
  integrationName: string;
  passOrFail: boolean;
  notes: string;
  qaOwner?: string;
  outputDataPopulated?: boolean;
  recordCreated?: boolean;
  retryAttempted?: boolean;
  moduleType?: string;
  relatedScenarioLink?: string;
}) {
  try {
    if (!process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN) {
      console.error('AIRTABLE_PERSONAL_ACCESS_TOKEN not configured');
      return false;
    }

    const payload = {
      fields: {
        "🧪 Integration Name": integrationName,
        "✅ Pass/Fail": passOrFail ? "PASS" : "FAIL",
        "📝 Notes / Debug": notes,
        "📅 Test Date": new Date().toISOString().split('T')[0],
        "👤 QA Owner": qaOwner,
        "📤 Output Data Populated?": outputDataPopulated,
        "📁 Record Created?": recordCreated,
        "🔁 Retry Attempted?": retryAttempted,
        "⚙️ Module Type": moduleType,
        "🔗 Related Scenario Link": relatedScenarioLink
      }
    };

    const response = await fetch('https://api.airtable.com/v0/appRt8V3tH4g5Z5if/Integration%20Test%20Log', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Integration test logged: ${integrationName} - ${passOrFail ? 'PASS' : 'FAIL'}`);
      return result.id;
    } else {
      const errorText = await response.text();
      console.error('Airtable Integration Test Log failed:', response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error('Integration test logging error:', error);
    return false;
  }
}