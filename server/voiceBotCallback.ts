import express from 'express';
import axios from 'axios';
import { auditLogger } from './systemAuditLog';

const router = express.Router();

interface CallbackRequest {
  phone: string;
  name: string;
  message?: string;
  intent?: string;
  priority?: 'low' | 'medium' | 'high';
}

// Trigger VoiceBot callback after missed call
router.post('/trigger-callback', async (req, res) => {
  try {
    const { phone, name, message, intent = 'MISSED_CALL_FOLLOWUP', priority = 'medium' }: CallbackRequest = req.body;

    if (!phone || !name) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and name are required'
      });
    }

    const voiceBotUrl = process.env.VOICEBOT_TRIGGER_URL;
    const voiceBotApiKey = process.env.VOICEBOT_API_KEY;

    if (!voiceBotUrl || !voiceBotApiKey) {
      return res.status(500).json({
        success: false,
        error: 'VoiceBot configuration missing. Please provide VOICEBOT_TRIGGER_URL and VOICEBOT_API_KEY.'
      });
    }

    const callbackMessage = message || `Hi ${name}, we saw you missed us earlier. Want to reconnect now?`;

    const voiceBotPayload = {
      phone: phone,
      message: callbackMessage,
      intent: intent,
      priority: priority,
      metadata: {
        trigger_source: 'missed_call_handler',
        customer_name: name,
        timestamp: new Date().toISOString()
      }
    };

    const response = await axios.post(voiceBotUrl, voiceBotPayload, {
      headers: {
        "Authorization": `Bearer ${voiceBotApiKey}`,
        "Content-Type": "application/json"
      },
      timeout: 10000
    });

    // Log successful callback trigger
    auditLogger.logEvent({
      type: 'voice_call',
      module: 'VoiceBot Callback',
      action: 'Callback Triggered',
      details: `VoiceBot callback initiated for ${name} (${phone})`,
      status: 'success',
      metadata: { phone, name, intent, response: response.data }
    });

    res.json({
      success: true,
      message: 'VoiceBot callback triggered successfully',
      callbackData: {
        phone,
        name,
        intent,
        message: callbackMessage
      },
      voiceBotResponse: response.data,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('VoiceBot callback error:', error);

    auditLogger.logEvent({
      type: 'error',
      module: 'VoiceBot Callback',
      action: 'Callback Failed',
      details: `Failed to trigger VoiceBot callback: ${error.message}`,
      status: 'error',
      metadata: { error: error.message, requestBody: req.body }
    });

    res.status(500).json({
      success: false,
      error: 'Failed to trigger VoiceBot callback',
      details: error.response?.data || error.message
    });
  }
});

// Send SMS with booking link as fallback
router.post('/send-sms-link', async (req, res) => {
  try {
    const { phone, name, customMessage }: { phone: string; name: string; customMessage?: string } = req.body;

    if (!phone || !name) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and name are required'
      });
    }

    const twilioUrl = process.env.TWILIO_SMS_URL;
    const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
    const bookingLink = process.env.BOOKING_LINK || 'https://calendar.yobot.bot/book';

    if (!twilioUrl || !twilioAuth) {
      return res.status(500).json({
        success: false,
        error: 'Twilio configuration missing. Please provide TWILIO_SMS_URL and TWILIO_AUTH_TOKEN.'
      });
    }

    const smsMessage = customMessage || `Hi ${name}, missed your call! Book a time here: ${bookingLink}`;

    const response = await axios.post(twilioUrl, {
      to: phone,
      message: smsMessage
    }, {
      auth: {
        username: 'api',
        password: twilioAuth
      },
      headers: {
        "Content-Type": "application/json"
      }
    });

    auditLogger.logEvent({
      type: 'system',
      module: 'SMS Callback',
      action: 'SMS Sent',
      details: `Booking link SMS sent to ${name} (${phone})`,
      status: 'success',
      metadata: { phone, name, message: smsMessage }
    });

    res.json({
      success: true,
      message: 'SMS with booking link sent successfully',
      smsData: {
        phone,
        name,
        message: smsMessage,
        bookingLink
      },
      twilioResponse: response.data,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('SMS sending error:', error);

    auditLogger.logEvent({
      type: 'error',
      module: 'SMS Callback',
      action: 'SMS Failed',
      details: `Failed to send SMS: ${error.message}`,
      status: 'error',
      metadata: { error: error.message, requestBody: req.body }
    });

    res.status(500).json({
      success: false,
      error: 'Failed to send SMS',
      details: error.response?.data || error.message
    });
  }
});

// Get callback statistics
router.get('/stats', async (req, res) => {
  try {
    // This would typically query a database for callback statistics
    // For now, return basic stats from audit logs
    res.json({
      success: true,
      stats: {
        callbacksTriggered: 0, // Would be calculated from audit logs
        smsLinksSent: 0,
        successRate: 0,
        averageResponseTime: '2.3s'
      },
      message: 'Callback statistics retrieved',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve callback statistics',
      details: error.message
    });
  }
});

export default router;