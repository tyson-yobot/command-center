import axios from 'axios';

export async function sendSlackAlert(text: string): Promise<boolean> {
  try {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
      console.log('SLACK_WEBHOOK_URL not configured');
      return false;
    }

    const payload = { text };
    const response = await axios.post(webhookUrl, payload);
    
    if (response.status === 200) {
      console.log(`✅ Slack alert sent: ${text.substring(0, 50)}...`);
      return true;
    }
    
    return false;
  } catch (error: any) {
    console.error('Slack alert error:', error.message);
    return false;
  }
}

export async function sendLeadAlert(fullName: string, email: string, leadSource: string): Promise<void> {
  const alertText = `🎯 New Lead Claimed: ${fullName} (${email}) via ${leadSource}`;
  await sendSlackAlert(alertText);
}

export async function sendAutomationFailureAlert(functionName: string, errorSnippet: string): Promise<void> {
  const alertText = `❌ Automation Failed: ${functionName} – ${errorSnippet}`;
  await sendSlackAlert(alertText);
}

export async function sendPlatinumFormAlert(fullName: string, email: string, company: string): Promise<void> {
  const alertText = `🎉 New Platinum Bot Claim!\n*Name:* ${fullName}\n*Email:* ${email}\n*Company:* ${company}`;
  await sendSlackAlert(alertText);
}