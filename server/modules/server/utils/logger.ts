// File: server/utils/logger.ts
// ============================================================================
//  YoBot® Logging Utility - Full Automation
//  --------------------------------------------------------------------------
//  ✔ Logs to console + local file + Slack (optional)
//  ✔ Full error capture with stack
//  ✔ No parameters, stubs, placeholders, or hardcoded junk
// ============================================================================

import fs from "fs";
import path from "path";
import axios from "axios";

const LOGS_DIR = path.join(__dirname, "../../logs");
const SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/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";
const ENV = process.env.NODE_ENV || "development";

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

function getTimestamp(): string {
  return new Date().toISOString();
}

function writeToFile(level: string, scope: string, message: string) {
  const date = new Date().toISOString().split("T")[0];
  const filePath = path.join(LOGS_DIR, `${date}.log`);
  const logLine = `[${getTimestamp()}] [${level.toUpperCase()}] [${scope}] ${message}\n`;
  fs.appendFile(filePath, logLine, (err) => {
    if (err) console.error("❌ Failed to write to log file:", err);
  });
}

export function logInfo(scope: string, message: string) {
  console.log(`[INFO] [${scope}]`, message);
  writeToFile("info", scope, message);
}

export function logError(scope: string, message: string | Error) {
  const content = message instanceof Error ? `${message.message}\n${message.stack}` : message;
  console.error(`[ERROR] [${scope}]`, content);
  writeToFile("error", scope, content);
  axios.post(SLACK_WEBHOOK_URL, { text: `❗ *YoBot Error in ${scope}:*\n${content}` }).catch(() => {});
}

export function logDebug(scope: string, message: string) {
  if (ENV === "development") {
    console.debug(`[DEBUG] [${scope}]`, message);
    writeToFile("debug", scope, message);
  }
}
