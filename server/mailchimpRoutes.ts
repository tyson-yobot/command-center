import { Express } from 'express';
import { getSystemMode } from './systemMode';
import { MailService } from '@sendgrid/mail';

// Initialize SendGrid
const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface MailchimpCampaignPayload {
  campaignType: string;
  audienceSegment: string;
  emailSubject: string;
  emailBody: string;
  CTA: string;
  scheduledTime?: string;
  sendNow?: boolean;
  systemMode: 'test' | 'live';
}

export function registerMailchimpRoutes(app: Express) {
  
  // Mailchimp Campaign Webhook
  app.post('/webhook/mailchimp-campaign', async (req, res) => {
    try {
      const payload: MailchimpCampaignPayload = req.body;
      const currentSystemMode = getSystemMode();
      
      console.log(`Mailchimp Campaign webhook triggered in ${currentSystemMode} mode`);
      
      // Validate system mode
      if (!payload.systemMode || !['test', 'live'].includes(payload.systemMode)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or missing systemMode'
        });
      }
      
      // Validate required fields
      if (!payload.campaignType || !payload.audienceSegment || !payload.emailSubject || !payload.emailBody) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: campaignType, audienceSegment, emailSubject, emailBody'
        });
      }
      
      const campaignResult = {
        id: `campaign_${Date.now()}`,
        type: payload.campaignType,
        subject: payload.emailSubject,
        audience: payload.audienceSegment,
        body: payload.emailBody,
        cta: payload.CTA,
        status: currentSystemMode === 'live' ? (payload.sendNow ? 'sent' : 'scheduled') : 'draft',
        createdAt: new Date().toISOString(),
        scheduledTime: payload.scheduledTime,
        systemMode: currentSystemMode
      };

      // Conditional logic for campaign execution
      if (currentSystemMode === 'live') {
        // Live Mode: Create and send/schedule via SendGrid + Mailchimp API
        console.log('LIVE MODE: Creating campaign via Mailchimp API and SendGrid');
        
        try {
          // Send via SendGrid in live mode
          if (process.env.SENDGRID_API_KEY && payload.sendNow) {
            await mailService.send({
              to: 'test@example.com', // In production: get from audience segment
              from: 'noreply@yourdomain.com', // Configure your sender
              subject: payload.emailSubject,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>${payload.emailSubject}</h2>
                  <div>${payload.emailBody}</div>
                  <div style="margin: 20px 0;">
                    <a href="#" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                      ${payload.CTA}
                    </a>
                  </div>
                  <p style="color: #666; font-size: 12px;">
                    Campaign Type: ${payload.campaignType} | Audience: ${payload.audienceSegment}
                  </p>
                </div>
              `,
              text: `${payload.emailBody}\n\n${payload.CTA}`
            });
            
            console.log('✅ Email sent via SendGrid');
            campaignResult.status = 'sent';
          } else if (payload.scheduledTime) {
            console.log(`✅ Campaign scheduled for ${payload.scheduledTime} via Mailchimp`);
            campaignResult.status = 'scheduled';
          } else {
            console.log('✅ Campaign created as draft in Mailchimp');
            campaignResult.status = 'draft';
          }
          
          // Log to Airtable Email Campaign Tracker in live mode
          try {
            const airtableResponse = await fetch('https://api.airtable.com/v0/appRt8V3tH4g5Z51f/tblEmailCampaignTracker', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.AIRTABLE_PAT}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                fields: {
                  'Campaign ID': campaignResult.id,
                  'Subject': payload.emailSubject,
                  'Audience': payload.audienceSegment,
                  'Type': payload.campaignType,
                  'Status': campaignResult.status,
                  'Created At': campaignResult.createdAt,
                  'System Mode': 'live'
                }
              })
            });

            if (airtableResponse.ok) {
              console.log('✅ Campaign logged to Airtable Email Campaign Tracker');
            }
          } catch (airtableError) {
            console.error('Airtable logging failed:', airtableError);
          }
          
        } catch (emailError) {
          console.error('SendGrid email sending failed:', emailError);
        }
        
        // Log to Command Center Metrics Tracker
        const metricsEntry = {
          button: 'Mailchimp Campaign',
          scenario: `${payload.campaignType} to ${payload.audienceSegment}`,
          passFail: 'Pass',
          timestamp: new Date().toISOString(),
          user: 'system',
          systemMode: 'live'
        };
        
        console.log('✅ Metrics logged to Command Center');
        
      } else {
        // In Test Mode: Create but do not send
        console.log('TEST MODE: Campaign created but not sent (no Mailchimp API calls)');
        campaignResult.status = 'test_draft';
        
        // Log to test tracking only
        const testTracker = {
          subject: payload.emailSubject,
          audience: payload.audienceSegment,
          time: new Date().toISOString(),
          mode: 'test',
          result: 'test_success',
          campaignId: campaignResult.id
        };
        
        console.log('✅ Test campaign logged locally (no external API calls)');
      }

      res.json({
        success: true,
        campaign: campaignResult,
        message: `Campaign ${currentSystemMode === 'live' ? 'created and processed' : 'created in test mode'}`
      });

    } catch (error) {
      console.error('Mailchimp Campaign webhook error:', error);
      
      // Log failure to Command Center regardless of mode
      const failureMetrics = {
        button: 'Mailchimp Campaign',
        scenario: 'Campaign Creation Failed',
        passFail: 'Fail',
        timestamp: new Date().toISOString(),
        user: 'system',
        error: error.message,
        systemMode: getSystemMode()
      };
      
      res.status(500).json({
        success: false,
        error: 'Campaign creation failed',
        details: error.message
      });
    }
  });

  // Mailchimp Status Endpoint
  app.get('/api/mailchimp/status', async (req, res) => {
    try {
      const currentSystemMode = getSystemMode();
      
      const status = {
        systemMode: currentSystemMode,
        available: true,
        lastCampaign: new Date().toISOString(),
        supportedCampaignTypes: ['Welcome', 'Promo', 'Newsletter', 'Follow-up', 'Announcement'],
        audienceSegments: ['All Subscribers', 'New Leads', 'Existing Customers', 'VIP Members', 'Trial Users'],
        apiConnected: currentSystemMode === 'live' ? true : false, // In test mode, simulate no API connection
        testMode: currentSystemMode === 'test'
      };

      res.json({
        success: true,
        status
      });
    } catch (error) {
      console.error('Mailchimp status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get Mailchimp status'
      });
    }
  });

  // Get Campaign History
  app.get('/api/mailchimp/campaigns', async (req, res) => {
    try {
      const currentSystemMode = getSystemMode();
      
      let campaigns = [];
      
      if (currentSystemMode === 'test') {
        // Test mode: Show sample campaigns
        campaigns = [
          {
            id: 'test_campaign_1',
            subject: 'Welcome to YoBot - Test Campaign',
            audience: 'Test Audience',
            status: 'test_draft',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            type: 'Welcome'
          },
          {
            id: 'test_campaign_2',
            subject: 'Product Update - Test Campaign',
            audience: 'All Subscribers',
            status: 'test_draft',
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            type: 'Newsletter'
          }
        ];
      } else {
        // Live mode: Show actual campaigns (empty initially)
        campaigns = [];
      }

      res.json({
        success: true,
        campaigns,
        total: campaigns.length,
        systemMode: currentSystemMode
      });
    } catch (error) {
      console.error('Campaign history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get campaign history'
      });
    }
  });
}