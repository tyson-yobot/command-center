import axios from 'axios';

// Log follow-up event to Airtable
export async function logFollowupEvent(callId: string, method: string, outcome: string): Promise<any> {
  try {
    const url = "https://api.airtable.com/v0/appRt8V3tH4g5Z5if/📞 Follow-Up Reminder Tracker";
    const headers = {
      "Authorization": `Bearer paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa`,
      "Content-Type": "application/json"
    };
    
    const data = {
      fields: {
        "📞 Call ID": callId,
        "📅 Follow-Up Date": new Date().toISOString(),
        "📨 Method": method,
        "📊 Outcome": outcome,
        "✅ Completed": true
      }
    };
    
    const response = await axios.post(url, data, { headers });
    return response.data;
  } catch (error: any) {
    console.error('Follow-up logging error:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

// Send follow-up SMS using Twilio
export async function sendFollowupSMS(toNumber: string, messageBody: string): Promise<string | null> {
  try {
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
    
    if (!twilioSid || !twilioToken || !twilioPhone) {
      console.log('Twilio credentials not configured - SMS follow-up skipped');
      return null;
    }

    const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
    const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
    
    const data = new URLSearchParams({
      Body: messageBody,
      From: twilioPhone,
      To: toNumber
    });

    const response = await axios.post(url, data, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return response.data.sid;
  } catch (error: any) {
    console.error('SMS follow-up error:', error.response?.data || error.message);
    return null;
  }
}

// Check if follow-up is required
export function shouldFollowUp(callRecord: any): boolean {
  const status = callRecord["📞 Call Status"] || callRecord.status;
  return ["Missed", "Declined", "No Answer"].includes(status);
}

// Get last call info from Airtable
export async function getLastCallInfo(callId: string): Promise<any> {
  try {
    const url = `https://api.airtable.com/v0/appRt8V3tH4g5Z5if/📥 Inbound Call Log?filterByFormula={🔑 Call ID}='${callId}'`;
    const headers = {
      "Authorization": `Bearer paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa`
    };
    
    const response = await axios.get(url, { headers });
    const records = response.data.records || [];
    return records.length > 0 ? records[0].fields : {};
  } catch (error: any) {
    console.error('Call info retrieval error:', error.response?.data || error.message);
    return {};
  }
}

// Compose follow-up message
export function composeFollowupMessage(name: string, status: string): string {
  switch (status) {
    case "Missed":
      return `Hi ${name}, sorry we missed your call. Would you like to schedule a time to chat?`;
    case "Completed":
      return `Hi ${name}, thanks for chatting with us! Let us know if you have any follow-up questions.`;
    case "No Answer":
      return `Hi ${name}, we tried reaching you earlier. Please call us back when convenient.`;
    default:
      return `Hi ${name}, this is a quick check-in from the YoBot® team.`;
  }
}

// Main follow-up automation orchestrator
export async function executeFollowupAutomation(callId: string): Promise<any> {
  try {
    console.log(`Starting follow-up automation for call ${callId}`);
    
    // Get call information
    const callInfo = await getLastCallInfo(callId);
    if (!callInfo || Object.keys(callInfo).length === 0) {
      console.log(`No call info found for ${callId}`);
      return { success: false, message: 'Call not found' };
    }

    // Check if follow-up is needed
    if (!shouldFollowUp(callInfo)) {
      console.log(`Follow-up not required for call ${callId}`);
      return { success: true, message: 'Follow-up not required' };
    }

    // Compose message
    const customerName = callInfo["🧑 Caller Name"] || callInfo.name || "there";
    const status = callInfo["📞 Call Status"] || callInfo.status;
    const phoneNumber = callInfo["📞 Phone Number"] || callInfo.phone;
    
    if (!phoneNumber) {
      console.log(`No phone number found for call ${callId}`);
      return { success: false, message: 'No phone number available' };
    }

    const message = composeFollowupMessage(customerName, status);
    
    // Send SMS
    const messageSid = await sendFollowupSMS(phoneNumber, message);
    
    // Log the follow-up attempt
    const outcome = messageSid ? "SMS Sent Successfully" : "SMS Failed";
    await logFollowupEvent(callId, "SMS", outcome);
    
    console.log(`Follow-up automation completed for call ${callId}: ${outcome}`);
    
    return {
      success: true,
      message: `Follow-up ${outcome.toLowerCase()}`,
      messageSid,
      phoneNumber,
      messageContent: message
    };
    
  } catch (error: any) {
    console.error('Follow-up automation error:', error.message);
    return { success: false, error: error.message };
  }
}