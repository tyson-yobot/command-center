import type { Express } from "express";

// In-memory storage for QA test logs
const qaTestLogs: Array<{
  id: string;
  integrationName: string;
  passFail: boolean;
  notes: string;
  qaOwner: string;
  moduleType: string;
  scenarioLink: string;
  outputDataPopulated: boolean;
  recordCreated: boolean;
  retryAttempted: boolean;
  timestamp: string;
}> = [];

// Airtable Integration QA Tracker - Live production logging
export function registerAirtableQATracker(app: Express) {
  
  // Log integration test results to Airtable
  app.post('/api/qa-tracker/log-test', async (req, res) => {
    try {
      const {
        integrationName,
        passFail,
        notes,
        qaOwner,
        moduleType,
        scenarioLink,
        outputDataPopulated,
        recordCreated,
        retryAttempted
      } = req.body;

      const testData = {
        fields: {
          "🧪 Integration Name": integrationName,
          "✅ Pass/Fail": passFail ? "✅ Pass" : "❌ Fail",
          "📝 Notes / Debug": notes || "",
          "📅 Test Date": new Date().toISOString(),
          "👤 QA Owner": qaOwner || "YoBot System",
          "📤 Output Data Populated?": outputDataPopulated || false,
          "📁 Record Created?": recordCreated || false,
          "🔁 Retry Attempted?": retryAttempted || false,
          "⚙️ Module Type": moduleType || "API",
          "🔗 Related Scenario Link": scenarioLink || ""
        }
      };

      // Log to Integration Test Log table using configured environment credentials
      const response = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Integration%20QA%20Log`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.AIRTABLE_VALID_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          records: [{
            fields: {
              "Integration Name": integrationName,
              "Pass/Fail": passFail ? "Pass" : "Fail",
              "Notes": notes || "",
              "Test Date": new Date().toISOString(),
              "QA Owner": qaOwner || "YoBot System",
              "Output Data Populated": outputDataPopulated || false,
              "Record Created": recordCreated || false,
              "Retry Attempted": retryAttempted || false,
              "Module Type": moduleType || "API",
              "Scenario Link": scenarioLink || ""
            }
          }]
        })
      });

      if (response.ok) {
        const result = await response.json();
        res.json({
          success: true,
          message: "Test logged to Airtable successfully",
          recordId: result.id,
          testName: integrationName,
          status: passFail ? "PASS" : "FAIL"
        });
      } else {
        const error = await response.text();
        res.status(500).json({
          success: false,
          error: "Failed to log to Airtable",
          details: error
        });
      }

    } catch (error: any) {
      console.error("QA Tracker error:", error);
      res.status(500).json({
        success: false,
        error: "QA tracker logging failed",
        details: error.message
      });
    }
  });

  // Get integration test status from Airtable
  app.get('/api/qa-tracker/status', async (req, res) => {
    try {
      const response = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Integration%20QA%20Log`, {
        headers: {
          "Authorization": `Bearer ${process.env.AIRTABLE_VALID_TOKEN}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const tests = data.records.map((record: any) => ({
          id: record.id,
          name: record.fields["🧪 Integration Name"],
          status: record.fields["✅ Pass/Fail"],
          date: record.fields["📅 Test Date"],
          owner: record.fields["👤 QA Owner"],
          notes: record.fields["📝 Notes / Debug"],
          moduleType: record.fields["⚙️ Module Type"]
        }));

        res.json({
          success: true,
          totalTests: tests.length,
          passedTests: tests.filter(t => t.status?.includes("✅")).length,
          failedTests: tests.filter(t => t.status?.includes("❌")).length,
          tests: tests.slice(-10) // Last 10 tests
        });
      } else {
        res.status(500).json({
          success: false,
          error: "Failed to fetch test status from Airtable"
        });
      }

    } catch (error: any) {
      console.error("QA Status fetch error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get QA status",
        details: error.message
      });
    }
  });

  // Bulk test result logger for automation functions
  app.post('/api/qa-tracker/bulk-log', async (req, res) => {
    try {
      const { testResults } = req.body;
      const loggedTests = [];

      for (const test of testResults) {
        const testData = {
          fields: {
            "🧪 Integration Name": test.functionName,
            "✅ Pass/Fail": test.success ? "✅ Pass" : "❌ Fail",
            "📝 Notes / Debug": test.notes || `Function ${test.functionId} execution`,
            "📅 Test Date": new Date().toISOString(),
            "👤 QA Owner": "YoBot Automation",
            "📤 Output Data Populated?": test.outputGenerated || false,
            "📁 Record Created?": test.recordCreated || false,
            "🔁 Retry Attempted?": false,
            "⚙️ Module Type": "Automation Function",
            "🔗 Related Scenario Link": `Function ${test.functionId}`
          }
        };

        try {
          const response = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Integration%20Test%20Log`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${process.env.AIRTABLE_VALID_TOKEN}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(testData)
          });

          if (response.ok) {
            const result = await response.json();
            loggedTests.push({
              functionId: test.functionId,
              recordId: result.id,
              status: "logged"
            });
          }
        } catch (error) {
          console.error(`Failed to log function ${test.functionId}:`, error);
        }
      }

      res.json({
        success: true,
        message: `Logged ${loggedTests.length} test results to Airtable`,
        loggedTests
      });

    } catch (error: any) {
      console.error("Bulk QA logging error:", error);
      res.status(500).json({
        success: false,
        error: "Bulk QA logging failed",
        details: error.message
      });
    }
  });
}

// Helper function to log individual automation function tests
export async function logAutomationTest(functionId: number, functionName: string, success: boolean, notes: string = "") {
  try {
    const testData = {
      fields: {
        "🧪 Integration Name": `Function ${functionId}: ${functionName}`,
        "✅ Pass/Fail": success ? "✅ Pass" : "❌ Fail",
        "📝 Notes / Debug": notes || `Automation function ${functionId} executed`,
        "📅 Test Date": new Date().toISOString(),
        "👤 QA Owner": "YoBot Live System",
        "📤 Output Data Populated?": success,
        "📁 Record Created?": success,
        "🔁 Retry Attempted?": false,
        "⚙️ Module Type": "Live Automation",
        "🔗 Related Scenario Link": `Function-${functionId}`
      }
    };

    const response = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Integration%20Test%20Log`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.AIRTABLE_VALID_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(testData)
    });

    return response.ok;
  } catch (error) {
    console.error(`Failed to log automation test for function ${functionId}:`, error);
    return false;
  }
}
