// backend/tests/log-to-airtable-test.ts
// ----------------------------------------
// End-to-end test: Send a real log to Airtable from CLI
// ----------------------------------------

import "../loadEnv.js"; // 👈 this must come first✅ this is RIGHT
import { logToAirtable } from "../utils/airtable/logger.js";

async function runTest() {
  try {
    const result = await logToAirtable({
      message: "✅ This is a production Airtable test log",
      context: {
        source: "log-to-airtable-test.ts",
        timestamp: new Date().toISOString(),
        severity: "info",
        env: process.env.NODE_ENV || "undefined",
      },
    });

    console.log("✅ Test log succeeded:", result);
  } catch (err) {
    console.error("❌ Test log failed:", err);
  }
}

runTest();


