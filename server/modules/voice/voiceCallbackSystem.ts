import axios, { AxiosError } from 'axios';


import { COMMAND_CENTER_BASE_ID, TABLE_NAMES, getAirtableApiKey } from '@shared/airtableConfig';
import { sendFollowupSMS, logFollowupEvent } from '../automation/followupAutomation';

const BASE_ID = COMMAND_CENTER_BASE_ID;
const FOLLOWUP_TABLE = TABLE_NAMES.FOLLOW_UP_REMINDER;
const API_KEY = getAirtableApiKey();

// Airtable Field Names
const FIELD_PHONE_NUMBER = "📞 Number";
const FIELD_COMPLETED = "✅ Completed";
const FIELD_FOLLOWUP_DATE = "📅 Follow-Up Date";
const FIELD_OUTCOME = "📊 Outcome";
const FIELD_METHOD = "📨 Method";
const FIELD_NAME = "👤 Name";
 interface ApiResponse {
   success: boolean;
   error?: string;
   message?: string;
 }
 
 interface TriggerVoiceCallbackResponse extends ApiResponse {
   data?: any;
 }
 
 interface TrackResponseResult extends ApiResponse {
   // No additional data needed for trackResponse beyond success/message/error
 }
 
 interface CloseOutFollowupResponse extends ApiResponse {
   data?: any;
 }
 
 interface LogFollowupEventResponse extends ApiResponse {
   data?: any;
 }
 
 interface RetryFollowupResult extends ApiResponse {
   totalAttempts: number;
   results: Array<{
     attempt: number;
     success: boolean;
     messageSid?: string | null;
     error?: string;
     timestamp: string;
   }>;
 }
 
 interface StatusMonitorResult extends ApiResponse {
   totalOpen: number;
   overdue: number;
   overdueFollowups: any[];
 }
 
 interface DailySummaryPushResult extends ApiResponse {
   completed: number;
   pending: number;
   date: string;
 }

// Trigger voice callback using VoiceBot
export async function triggerVoiceCallback(phoneNumber: string, callId: string): Promise<TriggerVoiceCallbackResponse> {
  try {
    const url = "https://replit.yobot.bot/trigger-voicebot-callback";
    const data = {
      phone: phoneNumber,
      call_id: callId,
      intent: "followup_callback"
    };
    
    const headers = {
      "Authorization": `Bearer ${process.env.INTERNAL_API_KEY}`,
      "Content-Type": "application/json"
    };
    
    const response = await axios.post(url, data, { headers });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const errorMessage = `Voice callback trigger error: ${axiosError.response?.data?.message || axiosError.message}`;
    console.error(errorMessage);
    return { success: false, error: errorMessage };
  }
}

// Track SMS response and auto-close follow-up loop
export async function trackResponse(incomingMessage: string, phone: string): Promise<TrackResponseResult> {
  const keywords = ["yes", "sure", "okay", "let's", "available", "good time", "call me"];
  const hasPositiveResponse = keywords.some(word => 
    incomingMessage.toLowerCase().includes(word)
  );
  
  if (hasPositiveResponse) {
    try {
      await closeOutFollowupByPhone(phone);
      await logFollowupEventByPhone(phone, "SMS Reply", incomingMessage);
      return { success: true, message: 'Positive response tracked and follow-up closed.' };
    } catch (error) {
      const errorMessage = `Response tracking error: ${(error as Error).message}`;
      console.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }
  
  return { success: false, message: 'No positive response found' };
}

// Close follow-up by phone number
export async function closeOutFollowupByPhone(phone: string): Promise<CloseOutFollowupResponse> {
  try {

    const url = `https://api.airtable.com/v0/${BASE_ID}/${FOLLOWUP_TABLE}`;

    const headers = {
<<<<<<< HEAD
      "Authorization": `Bearer ${process.env.AIRTABLE_API_KEY}`,
=======

      "Authorization": `Bearer ${process.env.AIRTABLE_API_KEY}`,
      "Authorization": `Bearer ${API_KEY}`,
>>>>>>> origin/main
      "Content-Type": "application/json"
    };
    
    // First find the record by phone number
    const filterUrl = `${url}?filterByFormula={${FIELD_PHONE_NUMBER}}='${phone}'`;
    const findResponse = await axios.get(filterUrl, { headers });
    
    if (findResponse.data.records && findResponse.data.records.length > 0) {
      const recordId = findResponse.data.records[0].id;
      
      const updateData = {
        fields: {
          [FIELD_COMPLETED]: true,
          [FIELD_FOLLOWUP_DATE]: new Date().toISOString(),
          [FIELD_OUTCOME]: "Customer Responded - Positive"
        }
      };
      
      const updateResponse = await axios.patch(`${url}/${recordId}`, updateData, { headers });
      return {
        success: true,
        data: updateResponse.data
      };
    }
    
    return { success: false, message: 'No follow-up record found for this phone number' };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const errorMessage = `Close follow-up error: ${axiosError.response?.data?.message || axiosError.message}`;
    console.error(errorMessage);
    return { success: false, error: errorMessage };
  }
}

// Log follow-up event by phone number
export async function logFollowupEventByPhone(phone: string, method: string, outcome: string): Promise<LogFollowupEventResponse> {
  try {

    const url = `https://api.airtable.com/v0/${BASE_ID}/${FOLLOWUP_TABLE}`;

    const headers = {
<<<<<<< HEAD
      "Authorization": `Bearer ${process.env.AIRTABLE_API_KEY}`,
=======

      "Authorization": `Bearer ${process.env.AIRTABLE_API_KEY}`,
      "Authorization": `Bearer ${API_KEY}`,
>>>>>>> origin/main
      "Content-Type": "application/json"
    };
    
    const data = {
      fields: {
        [FIELD_PHONE_NUMBER]: phone,
        [FIELD_FOLLOWUP_DATE]: new Date().toISOString(),
        [FIELD_METHOD]: method,
        [FIELD_OUTCOME]: outcome,
        [FIELD_COMPLETED]: method === "SMS Reply"
      }
    };
    
    const response = await axios.post(url, data, { headers });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const errorMessage = `Follow-up event logging error: ${axiosError.response?.data?.message || axiosError.message}`;
    console.error(errorMessage);
    return { success: false, error: errorMessage };
  }
}

// Retry follow-up logic with multiple attempts
export async function retryFollowup(callId: string, phone: string, attempts: number = 2, intervalHrs: number = 24): Promise<RetryFollowupResult> {
  const results = [];
  
  for (let i = 0; i < attempts; i++) {
    try {
      const message = "Just checking back — is now a good time to talk?";
      
      // Send retry SMS
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
      
    } catch (error) {
      results.push({
        attempt: i + 1,
        success: false,
        error: (error as Error).message,
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
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Slack alert error:', axiosError.response?.data || axiosError.message);
    return 500;
  }
}

// Monitor follow-up status and flag overdue ones
export async function statusMonitor(): Promise<StatusMonitorResult> {
  try {

    const url = `https://api.airtable.com/v0/${BASE_ID}/${FOLLOWUP_TABLE}?filterByFormula={${FIELD_COMPLETED}}=FALSE()`;

    const headers = {
<<<<<<< HEAD
      "Authorization": `Bearer ${process.env.AIRTABLE_API_KEY}`
=======

      "Authorization": `Bearer ${process.env.AIRTABLE_API_KEY}`

      "Authorization": `Bearer ${API_KEY}`
>>>>>>> origin/main
    };
    
    const response = await axios.get(url, { headers });
    const openFollowups = response.data.records || [];
    const overdueFollowups = [];
    
    for (const record of openFollowups) {
      const followupDate = new Date(record.fields[FIELD_FOLLOWUP_DATE]);
      const now = new Date();
      const hoursOverdue = (now.getTime() - followupDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursOverdue > 48) { // 48 hours overdue
        overdueFollowups.push(record);
        const name = record.fields[FIELD_NAME] || "Unknown";
        const phone = record.fields[FIELD_PHONE_NUMBER] || "No phone";
        await logAlertToSlack(`⚠️ Overdue follow-up: ${name} (${phone}) - ${Math.round(hoursOverdue)} hours overdue`);
      }
    }
    
    return {
      success: true,
      totalOpen: openFollowups.length,
      overdue: overdueFollowups.length,
      overdueFollowups
    };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const errorMessage = `Status monitor error: ${axiosError.response?.data?.message || axiosError.message}`;
    console.error(errorMessage);
    return { success: false, error: errorMessage, totalOpen: 0, overdue: 0, overdueFollowups: [] };
  }
}

// Daily summary push to Slack
export async function dailySummaryPush(): Promise<DailySummaryPushResult> {
  try {
    const today = new Date().toISOString().split('T')[0];
    

    const completedUrl = `https://api.airtable.com/v0/${BASE_ID}/${FOLLOWUP_TABLE}?filterByFormula=AND({${FIELD_COMPLETED}}=TRUE(), DATETIME_FORMAT({${FIELD_FOLLOWUP_DATE}}, 'YYYY-MM-DD')='${today}')`;
    const pendingUrl = `https://api.airtable.com/v0/${BASE_ID}/${FOLLOWUP_TABLE}?filterByFormula=AND({${FIELD_COMPLETED}}=FALSE(), DATETIME_FORMAT({${FIELD_FOLLOWUP_DATE}}, 'YYYY-MM-DD')='${today}')`;

    
    const headers = {
<<<<<<< HEAD
      "Authorization": `Bearer ${process.env.AIRTABLE_API_KEY}`
=======

      "Authorization": `Bearer ${process.env.AIRTABLE_API_KEY}`

      "Authorization": `Bearer ${API_KEY}`

>>>>>>> origin/main
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
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const errorMessage = `Daily summary error: ${axiosError.response?.data?.message || axiosError.message}`;
    console.error(errorMessage);
    return { success: false, error: errorMessage, completed: 0, pending: 0, date: new Date().toISOString().split('T')[0] };
  }
}