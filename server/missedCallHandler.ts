import express from 'express';
import axios from 'axios';
import { auditLogger } from './systemAuditLog';
import { injectMissedCallToRAG, logMissedCallToHubSpot, logMissedCallToMetrics } from './missedCallRAG';

const router = express.Router();

interface MissedCallData {
  name: string;
  phone: string;
  timestamp: string;
  duration?: number;
  source?: string;
}

// Handle missed call webhook
router.post('/missed-call', async (req, res) => {
  try {
    const callData: MissedCallData = {
      name: req.body.name || 'Unknown Caller',
      phone: req.body.phone || 'Unknown Number',
      timestamp: req.body.timestamp || new Date().toISOString(),
      duration: req.body.duration,
      source: req.body.source || 'Phone System'
    };

    // Log to Airtable if configured
    if (process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID) {
      try {
        await axios.post(
          `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/📞%20Missed%20Call%20Log`,
          {
            fields: {
              "👤 Caller Name": callData.name,
              "📞 Phone": callData.phone,
              "🕒 Timestamp": callData.timestamp,
              "⏱️ Duration": callData.duration || 0,
              "📋 Source": callData.source
            }
          },
          {
            headers: {
              "Authorization": `Bearer ${process.env.AIRTABLE_API_KEY}`,
              "Content-Type": "application/json"
            }
          }
        );
      } catch (airtableError: any) {
        console.error('Failed to log missed call to Airtable:', airtableError.response?.data || airtableError.message);
      }
    }

    // Send Slack notification if configured
    if (process.env.SLACK_WEBHOOK_URL) {
      try {
        await axios.post(process.env.SLACK_WEBHOOK_URL, {
          text: `📞 Missed Call from *${callData.name}* (${callData.phone}) at ${new Date(callData.timestamp).toLocaleTimeString()}`,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `📞 *Missed Call Alert*\n\n*Caller:* ${callData.name}\n*Phone:* ${callData.phone}\n*Time:* ${new Date(callData.timestamp).toLocaleString()}\n*Source:* ${callData.source}`
              }
            },
            {
              type: "actions",
              elements: [
                {
                  type: "button",
                  text: {
                    type: "plain_text",
                    text: "Add to CRM"
                  },
                  style: "primary",
                  url: `https://app.hubspot.com/contacts/add?phone=${encodeURIComponent(callData.phone)}&firstname=${encodeURIComponent(callData.name)}`
                },
                {
                  type: "button",
                  text: {
                    type: "plain_text",
                    text: "Schedule Callback"
                  },
                  url: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Callback%20${encodeURIComponent(callData.name)}&details=Missed%20call%20from%20${encodeURIComponent(callData.phone)}`
                }
              ]
            }
          ]
        });
      } catch (slackError: any) {
        console.error('Failed to send Slack notification:', slackError.response?.data || slackError.message);
      }
    }

    // Auto-create HubSpot contact if configured
    if (process.env.HUBSPOT_API_KEY && callData.phone !== 'Unknown Number') {
      try {
        const [firstName, ...lastNameParts] = callData.name.split(' ');
        const lastName = lastNameParts.join(' ') || '';

        await axios.post('https://api.hubapi.com/contacts/v1/contact', {
          properties: [
            { property: 'firstname', value: firstName },
            { property: 'lastname', value: lastName },
            { property: 'phone', value: callData.phone },
            { property: 'hs_lead_status', value: 'NEW' },
            { property: 'lifecyclestage', value: 'lead' },
            { property: 'lead_source', value: 'Missed Call' }
          ]
        }, {
          headers: {
            'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (hubspotError: any) {
        // Contact might already exist, which is fine
        if (hubspotError.response?.status !== 409) {
          console.error('Failed to create HubSpot contact:', hubspotError.response?.data || hubspotError.message);
        }
      }
    }

    // Log to audit system
    auditLogger.logEvent({
      type: 'voice_call',
      module: 'Missed Call Handler',
      action: 'Missed Call Processed',
      details: `Missed call from ${callData.name} (${callData.phone}) logged and notifications sent`,
      status: 'success',
      metadata: callData
    });

    res.json({
      success: true,
      message: 'Missed call processed successfully',
      callData,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Missed call processing error:', error);
    
    auditLogger.logEvent({
      type: 'error',
      module: 'Missed Call Handler',
      action: 'Processing Failed',
      details: `Failed to process missed call: ${error.message}`,
      status: 'error',
      metadata: { error: error.message, requestBody: req.body }
    });

    res.status(500).json({
      success: false,
      error: 'Failed to process missed call',
      details: error.message
    });
  }
});

// Get missed call statistics
router.get('/stats', async (req, res) => {
  try {
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      return res.json({
        success: false,
        error: 'Airtable not configured for missed call tracking'
      });
    }

    const response = await axios.get(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/📞%20Missed%20Call%20Log`,
      {
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`
        },
        params: {
          sort: [{ field: '🕒 Timestamp', direction: 'desc' }],
          maxRecords: 100
        }
      }
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);

    const calls = response.data.records || [];
    const todayCalls = calls.filter((call: any) => 
      new Date(call.fields['🕒 Timestamp']) >= today
    );
    const weekCalls = calls.filter((call: any) => 
      new Date(call.fields['🕒 Timestamp']) >= thisWeek
    );

    res.json({
      success: true,
      stats: {
        totalMissedCalls: calls.length,
        todayMissedCalls: todayCalls.length,
        weekMissedCalls: weekCalls.length,
        recentCalls: calls.slice(0, 10).map((call: any) => ({
          name: call.fields['👤 Caller Name'],
          phone: call.fields['📞 Phone'],
          timestamp: call.fields['🕒 Timestamp'],
          source: call.fields['📋 Source']
        }))
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve missed call statistics',
      details: error.message
    });
  }
});

export default router;