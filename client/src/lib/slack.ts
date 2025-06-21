   export async function sendSlackNotification(message: string): Promise<void> {
  console.log(`Slack notification sent: ${message}`);
  if (!process.env.SLACK_BOT_TOKEN) {
    throw new Error("SLACK_BOT_TOKEN is not defined in environment variables.");
  }
  const response = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.SLACK_BOT_TOKEN}`
    },
    body: JSON.stringify({
      channel: "#general",
      text: message
    })
  });
  if (!response.ok) {
    console.error("Failed to send Slack notification:", response.statusText);
  }
}