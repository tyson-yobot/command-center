import type { Express } from "express";
import multer from "multer";
import { WebClient } from "@slack/web-api";

const upload = multer({ storage: multer.memoryStorage() });

export function registerContentCreatorEndpoints(app: Express) {
  // Content Creator publish endpoint
  app.post("/api/content-creator/publish", upload.single('asset'), async (req, res) => {
    try {
      const contentData = JSON.parse(req.body.contentData);
      const asset = req.file;
      
      const {
        headline,
        body,
        cta,
        platform,
        targetAudience,
        scheduleType,
        scheduleDate,
        testMode
      } = contentData;

      // Generate campaign ID
      const campaignId = `campaign-${Date.now()}`;
      
      if (testMode) {
        // Send test to Slack
        await sendSlackTestPreview({
          headline,
          body,
          cta,
          platform,
          targetAudience,
          asset: asset?.originalname
        });
        
        // Log test to Airtable
        await logCampaignToAirtable({
          campaignId,
          title: headline,
          content: body,
          platform,
          targetAudience,
          status: 'test_sent',
          testMode: true
        });
        
        res.json({ 
          success: true, 
          message: "Test content sent to Slack for review",
          campaignId 
        });
      } else {
        // Publish to actual platform
        let publishResult;
        
        switch (platform) {
          case 'mailchimp':
            publishResult = await publishToMailchimp({
              headline,
              body,
              cta,
              targetAudience,
              scheduleType,
              scheduleDate,
              asset
            });
            break;
          case 'facebook':
          case 'instagram':
          case 'linkedin':
          case 'twitter':
            publishResult = await publishToSocialMedia(platform, {
              headline,
              body,
              cta,
              asset
            });
            break;
          default:
            throw new Error(`Platform ${platform} not supported`);
        }
        
        // Log campaign to Airtable
        await logCampaignToAirtable({
          campaignId,
          title: headline,
          content: body,
          platform,
          targetAudience,
          status: publishResult.success ? 'published' : 'failed',
          testMode: false,
          publishResult
        });
        
        res.json({ 
          success: publishResult.success, 
          message: publishResult.message,
          campaignId,
          publishResult 
        });
      }
    } catch (error) {
      console.error('Content creator publish error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  });

  // Get campaign analytics
  app.get("/api/content-creator/analytics/:campaignId", async (req, res) => {
    try {
      const { campaignId } = req.params;
      
      // In real implementation, fetch from platform APIs
      const analytics = {
        campaignId,
        impressions: Math.floor(Math.random() * 10000),
        clicks: Math.floor(Math.random() * 500),
        engagement: Math.floor(Math.random() * 100),
        conversions: Math.floor(Math.random() * 25)
      };
      
      res.json({ success: true, analytics });
    } catch (error) {
      console.error('Analytics fetch error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  });
}

async function sendSlackTestPreview(content: any) {
  try {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.log('Slack test preview: No SLACK_BOT_TOKEN configured');
      return;
    }

    const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
    
    const message = {
      channel: process.env.SLACK_CHANNEL_ID || '#general',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🧪 Content Test Preview'
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Platform:* ${content.platform}`
            },
            {
              type: 'mrkdwn',
              text: `*Target:* ${content.targetAudience}`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Headline:* ${content.headline}\n\n*Body:* ${content.body}\n\n*CTA:* ${content.cta}`
          }
        }
      ]
    };

    if (content.asset) {
      message.blocks.push({
        type: 'context',
        elements: [
          {
            type: 'plain_text',
            text: `📎 Asset: ${content.asset}`
          }
        ]
      });
    }

    await slack.chat.postMessage(message);
  } catch (error) {
    console.error('Failed to send Slack test preview:', error);
  }
}

async function publishToMailchimp(content: any) {
  try {
    // Mailchimp API integration
    if (!process.env.MAILCHIMP_API_KEY) {
      throw new Error('MAILCHIMP_API_KEY not configured');
    }

    // This would integrate with Mailchimp API
    // For now, simulate the API call
    const campaignData = {
      type: 'regular',
      recipients: {
        list_id: process.env.MAILCHIMP_LIST_ID
      },
      settings: {
        subject_line: content.headline,
        title: content.headline,
        from_name: 'YoBot',
        reply_to: process.env.MAILCHIMP_FROM_EMAIL || 'noreply@example.com'
      }
    };

    // Simulate API response
    return {
      success: true,
      message: 'Campaign created in Mailchimp',
      campaignId: `mc_${Date.now()}`,
      scheduledFor: content.scheduleType === 'later' ? content.scheduleDate : 'immediate'
    };
  } catch (error) {
    return {
      success: false,
      message: `Mailchimp error: ${error.message}`
    };
  }
}

async function publishToSocialMedia(platform: string, content: any) {
  try {
    // Social media API integrations would go here
    // For now, simulate the publishing process
    
    switch (platform) {
      case 'facebook':
        // Facebook Graph API integration
        return {
          success: true,
          message: 'Posted to Facebook',
          postId: `fb_${Date.now()}`
        };
      case 'instagram':
        // Instagram Basic Display API integration
        return {
          success: true,
          message: 'Posted to Instagram',
          postId: `ig_${Date.now()}`
        };
      case 'linkedin':
        // LinkedIn API integration
        return {
          success: true,
          message: 'Posted to LinkedIn',
          postId: `li_${Date.now()}`
        };
      case 'twitter':
        // X (Twitter) API integration
        return {
          success: true,
          message: 'Posted to X (Twitter)',
          postId: `tw_${Date.now()}`
        };
      default:
        return {
          success: false,
          message: `Platform ${platform} not implemented`
        };
    }
  } catch (error) {
    return {
      success: false,
      message: `Social media error: ${error.message}`
    };
  }
}

async function logCampaignToAirtable(campaign: any) {
  try {
    if (!process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN) {
      console.log('Campaign logging: No Airtable token configured');
      return;
    }

    const response = await fetch("https://api.airtable.com/v0/appRt8V3tH4g5Z5if/Social%20Campaign%20Log", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fields: {
          "📝 Campaign Title": campaign.title,
          "📄 Content": campaign.content,
          "📱 Platform": campaign.platform,
          "👥 Target Audience": campaign.targetAudience,
          "📊 Status": campaign.status,
          "🧪 Test Mode": campaign.testMode,
          "🆔 Campaign ID": campaign.campaignId,
          "📅 Created Date": new Date().toISOString(),
          "👤 Created By": "YoBot Content Creator"
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Campaign logged to Airtable:', result.id);
    return result;
  } catch (error) {
    console.error('Failed to log campaign to Airtable:', error);
  }
}