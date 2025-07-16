// =========================================================================
// server/utils/functionRunner.ts — PRODUCTION VERSION
// Runs hooks like Slack alerts or async processing after Airtable changes
// =========================================================================
import { logInfo, logError } from "./logger.js";
import { sendSlackAlert } from "./slackAlert";
/**
 * Executes post-processing hooks based on trigger name.
 * Add new case blocks below to extend functionality.
 */
export const runFunction = async (name: string, payload: unknown) => {
  try {
    logInfo(`🔁 Function triggered: ${name} with payload ${JSON.stringify(payload)}`);

    switch (name) {
      case "onRecordCreate": {
        const slackMsg = `📦 New Airtable Record Created:\n\`\`\`${JSON.stringify(payload, null, 2)}\`\`\``;
        await sendSlackAlert(slackMsg);
        break;
      }

      case "onHighPriorityLog": {
        const slackMsg = `🚨 High Priority Alert:\n\`\`\`${JSON.stringify(payload, null, 2)}\`\`\``;
        await sendSlackAlert(slackMsg);
        break;
      }

      default:
        logInfo(`⚠️ No hook defined for function: ${name}`);
    }
  } catch (err) {
    logError(`❌ runFunction error (${name}): ${err}`);
  }
};
