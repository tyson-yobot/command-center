// backend/utils/airtable/slackAlert.ts

import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const sendSlackAlert = async (message: string) => {
  const webhookUrl = process.env.SLACK_ALERT_WEBHOOK;

  if (!webhookUrl) {
    console.error("❌ Slack webhook URL not set in environment.");
    return;
  }

  try {
    await axios.post(webhookUrl, {
      text: message,
    });
    console.log("✅ Slack alert sent.");
  } catch (error) {
    console.error("❌ Error sending Slack alert:", error);
  }
};
