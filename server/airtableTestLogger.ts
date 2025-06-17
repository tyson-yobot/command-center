import { Express } from 'express';

async function logIntegrationTestToAirtable(
  integrationName: string,
  passed: boolean,
  notes: string,
  qaOwner: string,
  outputDataPopulated: boolean,
  recordCreated: boolean,
  retryAttempted: boolean,
  moduleType: string,
  relatedScenarioLink: string
): Promise<boolean> {
  const airtableApiKey = "paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa";
  const baseId = "appRt8V3tH4g5Z5if";
  const tableId = "tbly0fjE2M5uHET9X";
  const url = `https://api.airtable.com/v0/${baseId}/${tableId}`;

  const headers = {
    "Authorization": `Bearer ${airtableApiKey}`,
    "Content-Type": "application/json"
  };

  const payload = {
    "fields": {
      "🔌 Integration Name": integrationName,
      "✅ Pass/Fail": passed,
      "🧠 Notes / Debug": notes,
      "🗓️ Test Date": new Date().toISOString(),
      "👤 QA Owner": qaOwner,
      "📤 Output Data Pop...": outputDataPopulated,
      "🆕 Record Created?": recordCreated,
      "🔁 Retry Attempted?": retryAttempted,
      "🧩 Module Type": moduleType,
      "📁 Related Scenario Link": relatedScenarioLink
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });

    if (response.status === 200 || response.status === 201) {
      console.log("✅ Integration test logged successfully.");
      return true;
    } else {
      const errorText = await response.text();
      console.log("❌ Failed to log test. Response:", response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error("❌ Error logging to Airtable:", error);
    return false;
  }
}

export function registerAirtableTestLogger(app: Express) {
  // Test endpoint using your exact code
  app.post('/api/airtable-test-log', async (req, res) => {
    try {
      const {
        integrationName,
        passed,
        notes,
        qaOwner,
        outputDataPopulated,
        recordCreated,
        retryAttempted,
        moduleType,
        relatedScenarioLink
      } = req.body;

      const success = await logIntegrationTestToAirtable(
        integrationName,
        passed,
        notes,
        qaOwner,
        outputDataPopulated,
        recordCreated,
        retryAttempted,
        moduleType,
        relatedScenarioLink
      );

      if (success) {
        res.json({
          success: true,
          message: "Test logged successfully to Airtable",
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Failed to log test to Airtable"
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Quick test endpoint to verify field population
  app.post('/api/test-airtable-fields', async (req, res) => {
    try {
      const success = await logIntegrationTestToAirtable(
        "Field Population Test",
        true,
        "Testing all field mappings with exact user specifications",
        "YoBot System",
        true,
        true,
        false,
        "System Validation",
        "field-mapping-verification"
      );

      res.json({
        success,
        message: success ? "All fields populated successfully" : "Failed to populate fields",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
}

export { logIntegrationTestToAirtable };