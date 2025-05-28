import axios from 'axios';

export async function sendSlackAlert(message: string) {
  const webhook = process.env.SLACK_WEBHOOK_URL;
  if (!webhook) throw new Error("Missing Slack webhook");

  await axios.post(webhook, {
    text: `🚨 *YoBot® Escalation Alert* \n${message}`
  });
}