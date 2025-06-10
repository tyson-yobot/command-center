import twilio from 'twilio';

// Initialize Twilio client
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

/**
 * Sends SMS alert for mission-critical escalations
 * @param message - Alert message to send
 * @param recipient - Phone number to send to (optional, uses default from env)
 * @returns Promise resolving to message SID
 */
export async function sendSMSAlert(message: string, recipient?: string): Promise<string> {
  try {
    const toNumber = recipient || process.env.SMS_RECIPIENT;
    const fromNumber = process.env.TWILIO_FROM;

    if (!toNumber || !fromNumber) {
      throw new Error('Missing SMS configuration');
    }

    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: toNumber
    });

    console.log(`SMS sent successfully: ${result.sid}`);
    return result.sid;
  } catch (error) {
    console.error('SMS sending failed:', error);
    throw error;
  }
}

/**
 * Sends emergency escalation SMS with YoBot branding
 * @param escalationType - Type of escalation (call, deal, system)
 * @param details - Specific details about the escalation
 */
export async function sendEmergencyEscalation(
  escalationType: 'call' | 'deal' | 'system',
  details: string
): Promise<string> {
  const alertMessages = {
    call: `🚨 URGENT CALL ESCALATION - YoBot Alert\n${details}\nImmediate attention required!`,
    deal: `💰 HIGH-VALUE DEAL ALERT - YoBot\n${details}\nAction needed now!`,
    system: `⚠️ SYSTEM CRITICAL - YoBot Status\n${details}\nCheck dashboard immediately!`
  };

  return sendSMSAlert(alertMessages[escalationType]);
}