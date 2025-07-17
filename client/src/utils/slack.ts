const SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';

/**
 * Sends a message to the YoBot® Command Center Slack channel.
 * @param message The string message to post.
 */
export const postToSlack = async (message: string): Promise<void> => {
  try {
    await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      body: JSON.stringify({ text: message }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('❗ Slack webhook failed:', error);
  }
};
