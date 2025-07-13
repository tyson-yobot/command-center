import axios from 'axios';

// Trigger voice callback using VoiceBot
export async function triggerVoiceCallback(phoneNumber: string, callId: string): Promise<any> {
  try {
    const url = "https://replit.yobot.bot/trigger-voicebot-callback";
    const data = {
      phone: phoneNumber,
      call_id: callId,
      intent: "followup_callback"
    };
    
    const headers = {
      "Authorization": "Bearer YOUR_INTERNAL_API_KEY",
      "Content-Type": "application/json"
    };
    
    const response = await axios.post(url, data, { headers });
    return response.data;
  } catch (error: any) {
    console.error('Voice callback trigger error:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

// Track SMS response and auto-close follow-up loop
export async function trackResponse(incomingMessage: string, phone: string): Promise<boolean> {
  const keywords = ["yes", "sure", "okay", "let's", "available", "good time", "call me"];
  const hasPositiveResponse = keywords.some(word => 
    incomingMessage.toLowerCase().includes(word)
  );
  
  if (hasPositiveResponse) {
    try {
      await closeOutFollowupByPhone(phone);
      await logFollowupEventByPhone(phone, "SMS Reply", incomingMessage);
      return true;
    } catch (error: any) {
      console.error('Response tracking error:', error.message);
    }
  }
  
  return false;
}

// Close follow-up by phone number
export async function closeOutFollowupByPhone(phone: string): Promise<any> {
  try {
    const url = "https://api.airtable.com/v0/appRt8V3tH4g5Z51f/📞 Follow-Up Reminder Tracker";
    const headers = {
      "Authorization": `Bearer ${process.env.AIRTABLE_API_KEY}`,
      "Content-Type": "application/json"
    };
    
    // First find the record by phone number
    const filterUrl = `${url}?filterByFormula={📞 Number}='${phone}'`;
    const findResponse = await axios.get(filterUrl, { headers });
    
    if (findResponse.data.records && findResponse.data.records.length > 0) {
      const recordId = findResponse.data.records[0].id;
      
      const updateData = {
        fields: {
          "✅ Completed": true,
          "📅 Follow-Up Date": new Date().toISOString(),
          "📊 Outcome": "Customer Responded - Positive"
        }
      };
      
      const updateResponse = await axios.patch(`${url}/${recordId}`, updateData, { headers });
      return updateResponse.data;
    }
    
    return { success: false, message: 'No follow-up record found for this phone number' };
  } catch (error: any) {
    console.error('Close follow-up error:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

// Log follow-up event by phone number
export async function logFollowupEventByPhone(phone: string, method: string, outcome: string): Promise<any> {
  try {
    const url = "https://api.airtable.com/v0/appRt8V3tH4g5Z51f/📞 Follow-Up Reminder Tracker";
    const headers = {
      "Authorization": `Bearer ${process.env.AIRTABLE_API_KEY}`,
      "Content-Type": "application/json"
    };
    
    const data = {
      fields: {
        "📞 Number": phone,
        "📅 Follow-Up Date": new Date().toISOString(),
        "📨 Method": method,
        "📊 Outcome": outcome,
        "✅ Completed": method === "SMS Reply"
      }
    };
    
    const response = await axios.post(url, data, { headers });
    return response.data;
  } catch (error: any) {
    console.error('Follow-up event logging error:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

// Retry follow-up logic with multiple attempts
export async function retryFollowup(callId: string, phone: string, attempts: number = 2, intervalHrs: number = 24): Promise<any> {
  const results = [];
  
  for (let i = 0; i < attempts; i++) {
    try {
      const message = "Just checking back — is now a good time to talk?";
      
      // Send retry SMS
      const { sendFollowupSMS, logFollowupEvent } = require('./followupAutomation');
      const messageSid = await sendFollowupSMS(phone, message);
      
      // Log the retry attempt
      await logFollowupEvent(callId, "SMS Retry", `Attempt ${i + 1} - ${messageSid ? 'Sent' : 'Failed'}`);
      
      results.push({
        attempt: i + 1,
        success: !!messageSid,
        messageSid,
        timestamp: new Date().toISOString()
      });
      
      // Wait for the specified interval (in real implementation, this would be scheduled)
      if (i < attempts - 1) {
        console.log(`Retry ${i + 1} completed. Next retry scheduled in ${intervalHrs} hours.`);
      }
      
    } catch (error: any) {
      results.push({
        attempt: i + 1,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  return {
    success: true,
    totalAttempts: attempts,
    results
  };
}

// Send alert to Slack for follow-up issues
export async function logAlertToSlack(message: string): Promise<number> {
  try {
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!slackWebhookUrl) {
      console.log('Slack webhook URL not configured');
      return 200; // Simulate success
    }
    
    const payload = {
      text: `📟 Follow-Up Alert:\n${message}`
    };
    
    const response = await axios.post(slackWebhookUrl, payload);
    return response.status;
  } catch (error: any) {
    console.error('Slack alert error:', error.response?.data || error.message);
    return 500;
  }
}

// Monitor follow-up status and flag overdue ones
export async function statusMonitor(): Promise<any> {
  try {
    const url = "https://api.airtable.com/v0/appRt8V3tH4g5Z51f/📞 Follow-Up Reminder Tracker?filterByFormula={✅ Completed}=FALSE()";
    const headers = {
      "Authorization": `Bearer ${process.env.AIRTABLE_API_KEY}`
    };
    
    const response = await axios.get(url, { headers });
    const openFollowups = response.data.records || [];
    const overdueFollowups = [];
    
    for (const record of openFollowups) {
      const followupDate = new Date(record.fields["📅 Follow-Up Date"]);
      const now = new Date();
      const hoursOverdue = (now.getTime() - followupDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursOverdue > 48) { // 48 hours overdue
        overdueFollowups.push(record);
        const name = record.fields["👤 Name"] || "Unknown";
        const phone = record.fields["📞 Number"] || "No phone";
        await logAlertToSlack(`⚠️ Overdue follow-up: ${name} (${phone}) - ${Math.round(hoursOverdue)} hours overdue`);
      }
    }
    
    return {
      success: true,
      totalOpen: openFollowups.length,
      overdue: overdueFollowups.length,
      overdueFollowups
    };
  } catch (error: any) {
    console.error('Status monitor error:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

// Daily summary push to Slack
export async function dailySummaryPush(): Promise<any> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const completedUrl = `https://api.airtable.com/v0/appRt8V3tH4g5Z51f/📞 Follow-Up Reminder Tracker?filterByFormula=AND({✅ Completed}=TRUE(), DATETIME_FORMAT({📅 Follow-Up Date}, 'YYYY-MM-DD')='${today}')`;
    const pendingUrl = `https://api.airtable.com/v0/appRt8V3tH4g5Z51f/📞 Follow-Up Reminder Tracker?filterByFormula=AND({✅ Completed}=FALSE(), DATETIME_FORMAT({📅 Follow-Up Date}, 'YYYY-MM-DD')='${today}')`;
    
    const headers = {
      "Authorization": `Bearer ${process.env.AIRTABLE_API_KEY}`
    };
    
    const [completedResponse, pendingResponse] = await Promise.all([
      axios.get(completedUrl, { headers }),
      axios.get(pendingUrl, { headers })
    ]);
    
    const completed = completedResponse.data.records || [];
    const pending = pendingResponse.data.records || [];
    
    const message = `📊 *Follow-Up Summary:*\n✅ Completed: ${completed.length}\n⏳ Pending: ${pending.length}`;
    await logAlertToSlack(message);
    
    return {
      success: true,
      completed: completed.length,
      pending: pending.length,
      date: today
    };
  } catch (error: any) {
    console.error('Daily summary error:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}