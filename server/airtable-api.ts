import type { Request, Response } from "express";

const AIRTABLE_API_KEY = process.env.AIRTABLE_VALID_TOKEN || process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_COMMAND_CENTER_BASE_TOKEN;
const INTEGRATION_TEST_BASE = "appCoAtCZdARb4AM2";
const INTEGRATION_TEST_TABLE = "🧪 Integration Test Log 2";
const COMMAND_CENTER_BASE = "appRt8V3tH4g5Z51f";

// Get test metrics - disconnected from Integration Test Log per user request
export async function getTestMetrics(req: Request, res: Response) {
  const metrics = {
    isAuthenticated: false,
    message: "Integration Test Log disconnected per user request",
    lastUpdated: new Date().toISOString()
  };

  res.json(metrics);
}

// Get Command Center metrics (when authentication is available)
export async function getCommandCenterMetrics(req: Request, res: Response) {
  if (!AIRTABLE_API_KEY) {
    return res.status(500).json({ error: "Airtable API key not configured" });
  }

  try {
    // Try to fetch from Command Center tables
    const tables = [
      "tblbU2C2F6YPMgLjx", // Support Tickets
      "tblCCFd3TrNvLKqV4", // Call Recordings
      "tblJKwK8zXEhVrfSh", // NLP Keywords
      "tblBL9wYdFzW8K3Nc"  // Call Sentiment
    ];

    const metrics = {
      supportTickets: 0,
      callRecordings: 0,
      nlpKeywords: 0,
      sentimentAnalysis: 0,
      escalations: 0,
      missedCalls: 0,
      qaReviews: 0,
      clientTouchpoints: 0
    };

    // For now, return structure ready for when authentication is available
    res.json(metrics);
  } catch (error) {
    console.error("Error fetching Command Center metrics:", error);
    res.status(500).json({ error: "Command Center authentication required" });
  }
}

// Update test result in Integration Test Log
export async function updateTestResult(req: Request, res: Response) {
  if (!AIRTABLE_API_KEY) {
    return res.status(500).json({ error: "Airtable API key not configured" });
  }

  const { recordId, status, notes } = req.body;

  if (!recordId) {
    return res.status(400).json({ error: "Record ID required" });
  }

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${INTEGRATION_TEST_BASE}/${INTEGRATION_TEST_TABLE}/${recordId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            "✅ Pass/Fail": status === "pass" ? "✅ Pass" : "❌ Fail",
            "📝 Notes / Debug": notes || "",
            "📅 Test Date": new Date().toISOString()
          }
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error updating test result:", error);
    res.status(500).json({ error: "Failed to update test result" });
  }
}

// Log new test result to Integration Test Log
export async function logTestResult(req: Request, res: Response) {
  if (!AIRTABLE_API_KEY) {
    return res.status(500).json({ error: "Airtable API key not configured" });
  }

  const { testName, functionName, passed, notes, tester } = req.body;

  if (!testName || !functionName) {
    return res.status(400).json({ error: "Test name and function name required" });
  }

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${INTEGRATION_TEST_BASE}/${INTEGRATION_TEST_TABLE}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            "🧩 Integration Name": testName,
            "👤 QA Owner": tester || "System",
            "✅ Pass/Fail": passed ? "✅ Pass" : "❌ Fail",
            "📅 Test Date": new Date().toISOString(),
            "📝 Notes / Debug": notes || "",
            "📁 Record Created?": true
          }
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error logging test result:", error);
    res.status(500).json({ error: "Failed to log test result" });
  }
}