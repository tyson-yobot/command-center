/**
 * Twilio SMS Automation Functions
 * Functions 301-310: SMS and Communication Automation
 */

import twilio from 'twilio';

const accountSid = 'AC6463504e6a32a01c0acb185e16add065';
const authToken = '0a305c9074eb5c87e02bbdbcf5b93c0a';
const client = twilio(accountSid, authToken);

// Function 301: SMS Lead Notification
export async function sendSMSLeadNotification(phoneNumber: string, leadInfo: any) {
  try {
    const message = await client.messages.create({
      body: `New lead alert: ${leadInfo.name} from ${leadInfo.company}. Score: ${leadInfo.score}/100`,
      from: '+1234567890', // Replace with your Twilio phone number
      to: phoneNumber
    });
    
    return {
      success: true,
      messageId: message.sid,
      status: message.status
    };
  } catch (error: any) {
    console.error('SMS Lead Notification Error:', error);
    return { success: false, error: error.message };
  }
}

// Function 302: SMS Appointment Reminder
export async function sendAppointmentReminder(phoneNumber: string, appointment: any) {
  try {
    const message = await client.messages.create({
      body: `Reminder: Your appointment with ${appointment.company} is scheduled for ${appointment.date} at ${appointment.time}`,
      from: '+1234567890',
      to: phoneNumber
    });
    
    return {
      success: true,
      messageId: message.sid,
      reminderSent: true
    };
  } catch (error: any) {
    console.error('SMS Appointment Reminder Error:', error);
    return { success: false, error: error.message };
  }
}

// Function 303: SMS Follow-up Automation
export async function sendFollowUpSMS(phoneNumber: string, followUpData: any) {
  try {
    const message = await client.messages.create({
      body: `Hi ${followUpData.name}, following up on your interest in ${followUpData.service}. Ready to schedule a call?`,
      from: '+1234567890',
      to: phoneNumber
    });
    
    return {
      success: true,
      messageId: message.sid,
      followUpSent: true
    };
  } catch (error: any) {
    console.error('SMS Follow-up Error:', error);
    return { success: false, error: error.message };
  }
}

// Function 304: SMS Payment Reminder
export async function sendPaymentReminder(phoneNumber: string, paymentInfo: any) {
  try {
    const message = await client.messages.create({
      body: `Payment reminder: Invoice ${paymentInfo.invoiceId} for $${paymentInfo.amount} is due ${paymentInfo.dueDate}`,
      from: '+1234567890',
      to: phoneNumber
    });
    
    return {
      success: true,
      messageId: message.sid,
      reminderSent: true
    };
  } catch (error: any) {
    console.error('SMS Payment Reminder Error:', error);
    return { success: false, error: error.message };
  }
}

// Function 305: SMS Support Ticket Alert
export async function sendSupportTicketAlert(phoneNumber: string, ticketInfo: any) {
  try {
    const message = await client.messages.create({
      body: `Support ticket #${ticketInfo.ticketId} has been ${ticketInfo.status}. Priority: ${ticketInfo.priority}`,
      from: '+1234567890',
      to: phoneNumber
    });
    
    return {
      success: true,
      messageId: message.sid,
      alertSent: true
    };
  } catch (error: any) {
    console.error('SMS Support Alert Error:', error);
    return { success: false, error: error.message };
  }
}

// Function 306: SMS Survey Request
export async function sendSurveyRequest(phoneNumber: string, surveyData: any) {
  try {
    const message = await client.messages.create({
      body: `Hi ${surveyData.name}, we'd love your feedback! Please rate your experience: ${surveyData.surveyLink}`,
      from: '+1234567890',
      to: phoneNumber
    });
    
    return {
      success: true,
      messageId: message.sid,
      surveySent: true
    };
  } catch (error: any) {
    console.error('SMS Survey Request Error:', error);
    return { success: false, error: error.message };
  }
}

// Function 307: SMS Booking Confirmation
export async function sendBookingConfirmation(phoneNumber: string, bookingInfo: any) {
  try {
    const message = await client.messages.create({
      body: `Booking confirmed! ${bookingInfo.service} on ${bookingInfo.date} at ${bookingInfo.time}. Confirmation: ${bookingInfo.confirmationId}`,
      from: '+1234567890',
      to: phoneNumber
    });
    
    return {
      success: true,
      messageId: message.sid,
      confirmationSent: true
    };
  } catch (error: any) {
    console.error('SMS Booking Confirmation Error:', error);
    return { success: false, error: error.message };
  }
}

// Function 308: SMS Status Update
export async function sendStatusUpdate(phoneNumber: string, statusInfo: any) {
  try {
    const message = await client.messages.create({
      body: `Status update: Your ${statusInfo.type} is now ${statusInfo.status}. Reference: ${statusInfo.reference}`,
      from: '+1234567890',
      to: phoneNumber
    });
    
    return {
      success: true,
      messageId: message.sid,
      updateSent: true
    };
  } catch (error: any) {
    console.error('SMS Status Update Error:', error);
    return { success: false, error: error.message };
  }
}

// Function 309: SMS Emergency Alert
export async function sendEmergencyAlert(phoneNumber: string, alertInfo: any) {
  try {
    const message = await client.messages.create({
      body: `URGENT: ${alertInfo.message}. Action required: ${alertInfo.action}. Contact: ${alertInfo.contact}`,
      from: '+1234567890',
      to: phoneNumber
    });
    
    return {
      success: true,
      messageId: message.sid,
      emergencyAlertSent: true
    };
  } catch (error: any) {
    console.error('SMS Emergency Alert Error:', error);
    return { success: false, error: error.message };
  }
}

// Function 310: SMS Bulk Campaign
export async function sendBulkCampaign(phoneNumbers: string[], campaignData: any) {
  const results = [];
  
  for (const phoneNumber of phoneNumbers) {
    try {
      const message = await client.messages.create({
        body: campaignData.message,
        from: '+1234567890',
        to: phoneNumber
      });
      
      results.push({
        phoneNumber,
        success: true,
        messageId: message.sid
      });
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      results.push({
        phoneNumber,
        success: false,
        error: (error as any).message
      });
    }
  }
  
  return {
    campaignId: campaignData.campaignId,
    totalSent: results.filter(r => r.success).length,
    totalFailed: results.filter(r => !r.success).length,
    results
  };
}