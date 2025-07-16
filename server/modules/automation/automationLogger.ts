/**
 * Automation Logging System with Dashboard Security
 * Tracks all automation functions with proper authentication and Slack alerts
 */

import axios from 'axios';
import { COMMAND_CENTER_BASE_ID } from "../config/airtableBase";

const VALID_DASHBOARD_ID = "COMMAND_CENTER";

interface AutomationLog {
  function: string;
  dashboard: string;
  status: 'Success' | 'Failed';
  error?: string;
  timestamp: string;
  moduleOwner?: string;
  moduleType?: string;
}

export async function logAutomationStatus(
  functionName: string, 
  status: 'Success' | 'Failed', 
  dashboard = "COMMAND_CENTER", 
  error = "",
  moduleOwner = "System",
  moduleType = "Automation"
): Promise<void> {
  
  // Dashboard security check
  if (process.env.DASHBOARD_ID !== VALID_DASHBOARD_ID) {
    console.warn("❌ Automation logging blocked: invalid dashboard context");
    return;
  }

  const logData: AutomationLog = {
    function: functionName,
    dashboard,
    status,
    error,
    timestamp: new Date().toISOString(),
    moduleOwner,
    moduleType
  };

  // Log to Airtable
  await logToAirtable(logData);

  // Send Slack alert on failure
  if (status === 'Failed') {
    await sendSlackAlert(`❌ '${functionName}' failed in ${dashboard}. Error: ${error}`);
  }

  // Console logging with module ownership
  console.log(`🧠 ${moduleOwner} owns ${moduleType} module - ${functionName}: ${status}`);
}

async function logToAirtable(logData: AutomationLog): Promise<void> {
  try {
    const airtableKey = process.env.AIRTABLE_VALID_TOKEN || process.env.AIRTABLE_API_KEY;
    
    if (!airtableKey) {
      console.warn("Airtable API key not configured for automation logging");
      return;
    }

    const url = `https://api.airtable.com/v0/${COMMAND_CENTER_BASE_ID}/tblXyLogAuto`;
    const headers = {
      "Authorization": `Bearer ${airtableKey}`,
      "Content-Type": "application/json"
    };

    const payload = {
      "records": [{
        "fields": {
          "⚙️ Function": logData.function,
          "📍 Dashboard": logData.dashboard,
          "✅ Status": logData.status,
          "🛠 Error": logData.error || "",
          "👤 Owner": logData.moduleOwner,
          "🏷️ Type": logData.moduleType,
          "⏰ Timestamp": logData.timestamp
        }
      }]
    };

    await axios.post(url, payload, { headers });
  } catch (error: any) {
    console.error("Failed to log to Airtable:", error.message);
  }
}

async function sendSlackAlert(message: string): Promise<void> {
  try {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.warn("Slack webhook not configured for failure alerts");
      return;
    }

    const payload = {
      text: `🚨 YoBot Automation Alert:\n${message}`
    };

    await axios.post(webhookUrl, payload);
  } catch (error: any) {
    console.error("Failed to send Slack alert:", error.message);
  }
}

// Dashboard security middleware for automation routes
export function automationSecurityMiddleware(req: any, res: any, next: any) {
  // Check for internal Command Center requests (allow these)
  const isInternalRequest = req.headers['x-internal-request'] === 'command-center' || 
                           req.ip === '127.0.0.1' || 
                           req.ip === '::1' ||
                           req.connection?.remoteAddress === '127.0.0.1';

  // Allow internal Command Center requests to bypass dashboard check
  if (isInternalRequest) {
    // Still check kill switch for internal requests
    if (process.env.KILL_SWITCH === "true") {
      console.warn("🔒 Global automation shutdown active.");
      return res.status(410).json({
        error: "System offline",
        message: "Global automation shutdown active"
      });
    }
    return next();
  }

  // For external requests, enforce strict dashboard fingerprint check
  if (process.env.DASHBOARD_ID !== VALID_DASHBOARD_ID) {
    console.warn("❌ Automation blocked: invalid dashboard context");
    return res.status(403).json({
      error: "Unauthorized dashboard",
      message: "Invalid dashboard fingerprint"
    });
  }

  // Global kill switch check
  if (process.env.KILL_SWITCH === "true") {
    console.warn("🔒 Global automation shutdown active.");
    return res.status(410).json({
      error: "System offline",
      message: "Global automation shutdown active"
    });
  }

  next();
}

// Module ownership tracking
export function trackModuleOwnership(functionName: string, owner: string, type: string) {
  console.log(`🧠 ${owner} owns ${type} module - ${functionName}`);
}

export default {
  logAutomationStatus,
  automationSecurityMiddleware,
  trackModuleOwnership
};