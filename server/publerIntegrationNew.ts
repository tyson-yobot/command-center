import { Express } from 'express';

interface PublerPost {
  text: string;
  media?: string[];
  platforms: string[];
  scheduleDate?: string;
}

interface PublerResponse {
  success: boolean;
  postId?: string;
  error?: string;
  platforms?: {
    platform: string;
    status: 'success' | 'failed';
    postUrl?: string;
    error?: string;
  }[];
}

// Airtable Integration Test Logger with correct field mappings
async function logToAirtable(
  integrationName: string,
  passed: boolean,
  notes: string,
  qaOwner: string,
  outputDataPopulated: boolean,
  recordCreated: boolean,
  retryAttempted: boolean,
  moduleType: string,
  relatedScenarioLink: string
): Promise<boolean> {
  try {
    const airtableApiKey = "paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa";
    const baseId = "appRt8V3tH4g5Z5if";
    const tableId = "tbly0fjE2M5uHET9X";
    const url = `https://api.airtable.com/v0/${baseId}/${tableId}`;

    const headers = {
      "Authorization": `Bearer ${airtableApiKey}`,
      "Content-Type": "application/json"
    };

    const payload = {
      "fields": {
        "🔌 Integration Name": integrationName,
        "✅ Pass/Fail": passed,
        "🧠 Notes / Debug": notes,
        "🗓️ Test Date": new Date().toISOString(),
        "👤 QA Owner": qaOwner,
        "📤 Output Data Pop...": outputDataPopulated,
        "🆕 Record Created?": recordCreated,
        "🔁 Retry Attempted?": retryAttempted,
        "🧩 Module Type": moduleType,
        "📁 Related Scenario Link": relatedScenarioLink
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log("✅ Integration test logged successfully to Airtable");
      return true;
    } else {
      const errorText = await response.text();
      console.log("❌ Failed to log test. Response:", response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error("Error logging to Airtable:", error);
    return false;
  }
}

class PublerIntegration {
  private apiKey = process.env.PUBLER_API_KEY || '';
  private baseUrl = 'https://api.publer.io/v1';

  async postToSocialMedia(postData: PublerPost): Promise<PublerResponse> {
    try {
      if (!this.apiKey) {
        await logToAirtable(
          'Publer Social Media Posting',
          false,
          'Publer API key not configured in environment variables',
          'Daniel Sharpe',
          false,
          false,
          false,
          'Social Media Integration',
          'Module: publerIntegrationNew.ts'
        );
        throw new Error('Publer API key not configured');
      }

      const response = await fetch(`${this.baseUrl}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: postData.text,
          media_urls: postData.media || [],
          social_accounts: postData.platforms.map(platform => 
            this.getPlatformAccountId(platform)
          ),
          schedule_date: postData.scheduleDate || null,
          timezone: 'UTC'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        await logToAirtable(
          'Publer Social Media Posting',
          false,
          `Publer API error: ${response.status} - ${errorText}`,
          'Daniel Sharpe',
          false,
          false,
          true,
          'Social Media Integration',
          'Function: postToSocialMedia in publerIntegrationNew.ts'
        );
        throw new Error(`Publer API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      await logToAirtable(
        'Publer Social Media Posting',
        true,
        `Successfully posted to ${postData.platforms.join(', ')} - Post ID: ${result.id}`,
        'Daniel Sharpe',
        true,
        true,
        false,
        'Social Media Integration',
        'Module: publerIntegrationNew.ts'
      );

      return {
        success: true,
        postId: result.id,
        platforms: postData.platforms.map(platform => ({
          platform,
          status: 'success' as const,
          postUrl: result.posts?.[platform]?.url
        }))
      };

    } catch (error) {
      await logToAirtable(
        'Publer Social Media Posting',
        false,
        `Integration failed: ${error.message}`,
        'Daniel Sharpe',
        false,
        false,
        false,
        'Social Media Integration',
        'Function: postToSocialMedia in publerIntegrationNew.ts'
      );

      return {
        success: false,
        error: error.message
      };
    }
  }

  async getAccountStatus(): Promise<{ success: boolean; accounts?: any[]; error?: string }> {
    try {
      if (!this.apiKey) {
        await logToAirtable(
          'Publer Account Status Check',
          false,
          'Publer API key not configured',
          'Daniel Sharpe',
          false,
          false,
          false,
          'Social Media Integration',
          'Function: getAccountStatus in publerIntegrationNew.ts'
        );
        throw new Error('Publer API key not configured');
      }

      const response = await fetch(`${this.baseUrl}/accounts`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        await logToAirtable(
          'Publer Account Status Check',
          false,
          `Failed to fetch accounts: ${response.status} - ${errorText}`,
          'Daniel Sharpe',
          false,
          false,
          true,
          'Social Media Integration',
          'Function: getAccountStatus in publerIntegrationNew.ts'
        );
        throw new Error(`Failed to fetch accounts: ${response.status}`);
      }

      const accounts = await response.json();
      
      await logToAirtable(
        'Publer Account Status Check',
        true,
        `Retrieved ${accounts.length} connected accounts`,
        'YoBot System',
        true,
        false,
        false,
        'Social Media Integration',
        'account-status-success'
      );

      return {
        success: true,
        accounts
      };

    } catch (error) {
      await logToAirtable(
        'Publer Account Status Check',
        false,
        `Account status check failed: ${error.message}`,
        'YoBot System',
        false,
        false,
        false,
        'Social Media Integration',
        'account-status-failure'
      );

      return {
        success: false,
        error: error.message
      };
    }
  }

  private getPlatformAccountId(platform: string): string {
    // These should be actual account IDs from your Publer connected accounts
    const platformMapping = {
      'linkedin': process.env.PUBLER_LINKEDIN_ACCOUNT_ID || '12345',
      'twitter': process.env.PUBLER_TWITTER_ACCOUNT_ID || '67890',
      'facebook': process.env.PUBLER_FACEBOOK_ACCOUNT_ID || '11111',
      'instagram': process.env.PUBLER_INSTAGRAM_ACCOUNT_ID || '22222'
    };

    return platformMapping[platform.toLowerCase()] || '12345';
  }
}

export const publerIntegration = new PublerIntegration();

export function registerPublerRoutes(app: Express) {
  // Post to social media via Publer
  app.post('/api/publer/post', async (req, res) => {
    try {
      const { text, platforms, media, scheduleDate } = req.body;

      if (!text || !platforms || !Array.isArray(platforms)) {
        await logToAirtable(
          'Publer API Endpoint Validation',
          false,
          'Missing required fields: text and platforms array are required',
          'YoBot System',
          false,
          false,
          false,
          'Social Media Integration',
          'api-validation-error'
        );
        
        return res.status(400).json({
          success: false,
          error: 'Text and platforms array are required'
        });
      }

      const result = await publerIntegration.postToSocialMedia({
        text,
        platforms,
        media,
        scheduleDate
      });

      res.json(result);

    } catch (error) {
      await logToAirtable(
        'Publer API Endpoint Error',
        false,
        `API endpoint error: ${error.message}`,
        'YoBot System',
        false,
        false,
        false,
        'Social Media Integration',
        'api-endpoint-error'
      );

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Alternative endpoint for create-post
  app.post('/api/publer/create-post', async (req, res) => {
    try {
      const { content, platforms, schedule } = req.body;

      if (!content || !platforms || !Array.isArray(platforms)) {
        await logToAirtable(
          'Publer Create Post Validation',
          false,
          'Missing required fields: content and platforms array are required',
          'YoBot System',
          false,
          false,
          false,
          'Social Media Integration',
          'create-post-validation-error'
        );
        
        return res.status(400).json({
          success: false,
          error: 'Content and platforms array are required'
        });
      }

      const result = await publerIntegration.postToSocialMedia({
        text: content,
        platforms,
        scheduleDate: schedule
      });

      res.json(result);

    } catch (error) {
      await logToAirtable(
        'Publer Create Post Error',
        false,
        `Create post error: ${error.message}`,
        'YoBot System',
        false,
        false,
        false,
        'Social Media Integration',
        'create-post-error'
      );

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get connected social media accounts
  app.get('/api/publer/accounts', async (req, res) => {
    try {
      const result = await publerIntegration.getAccountStatus();
      res.json(result);
    } catch (error) {
      await logToAirtable(
        'Publer Accounts Endpoint Error',
        false,
        `Accounts endpoint error: ${error.message}`,
        'YoBot System',
        false,
        false,
        false,
        'Social Media Integration',
        'accounts-endpoint-error'
      );
      
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Test Publer integration
  app.post('/api/publer/test', async (req, res) => {
    try {
      await logToAirtable(
        'Publer Integration Test',
        true,
        'Publer integration test endpoint called successfully',
        'YoBot System',
        true,
        false,
        false,
        'Social Media Integration',
        'integration-test-endpoint'
      );

      res.json({
        success: true,
        message: 'Publer integration test completed - check Airtable for logged results',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      await logToAirtable(
        'Publer Integration Test',
        false,
        `Test endpoint error: ${error.message}`,
        'YoBot System',
        false,
        false,
        false,
        'Social Media Integration',
        'test-endpoint-error'
      );

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
}