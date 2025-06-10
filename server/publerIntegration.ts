import { Express } from 'express';
import { integrationLogger } from './integrationTestLogger';

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

class PublerIntegration {
  private apiKey = process.env.PUBLER_API_KEY || '';
  private baseUrl = 'https://api.publer.io/v1';

  async postToSocialMedia(postData: PublerPost): Promise<PublerResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('Publer API key not configured');
      }

      const response = await fetch(`${this.baseUrl}/job_complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: postData.text,
          media_urls: postData.media || [],
          social_accounts: postData.platforms.map(platform => ({
            platform: platform.toLowerCase(),
            account_id: this.getPlatformAccountId(platform)
          })),
          schedule_date: postData.scheduleDate || null
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Publer API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      await integrationLogger.logSuccess(
        'Publer Social Media Posting',
        'Social Media Integration',
        `Successfully posted to ${postData.platforms.join(', ')} - Post ID: ${result.id}`,
        result.id
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
      await integrationLogger.logFailure(
        'Publer Social Media Posting',
        'Social Media Integration',
        error.message,
        'publer-post-failure'
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
        throw new Error('Publer API key not configured');
      }

      const response = await fetch(`${this.baseUrl}/accounts`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch accounts: ${response.status}`);
      }

      const accounts = await response.json();
      
      await integrationLogger.logSuccess(
        'Publer Account Status Check',
        'Social Media Integration',
        `Retrieved ${accounts.length} connected accounts`,
        'account-status-check'
      );

      return {
        success: true,
        accounts
      };

    } catch (error) {
      await integrationLogger.logFailure(
        'Publer Account Status Check',
        'Social Media Integration',
        error.message,
        'account-status-failure'
      );

      return {
        success: false,
        error: error.message
      };
    }
  }

  private getPlatformAccountId(platform: string): string {
    // Platform-specific account IDs would be configured based on connected accounts
    const platformMapping = {
      'linkedin': process.env.PUBLER_LINKEDIN_ACCOUNT_ID || 'linkedin_default',
      'twitter': process.env.PUBLER_TWITTER_ACCOUNT_ID || 'twitter_default',
      'facebook': process.env.PUBLER_FACEBOOK_ACCOUNT_ID || 'facebook_default',
      'instagram': process.env.PUBLER_INSTAGRAM_ACCOUNT_ID || 'instagram_default'
    };

    return platformMapping[platform.toLowerCase()] || platform.toLowerCase();
  }
}

export const publerIntegration = new PublerIntegration();

export function registerPublerRoutes(app: Express) {
  // Post to social media via Publer
  app.post('/api/publer/post', async (req, res) => {
    try {
      const { text, platforms, media, scheduleDate } = req.body;

      if (!text || !platforms || !Array.isArray(platforms)) {
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
      await integrationLogger.logFailure(
        'Publer API Endpoint',
        'Social Media Integration',
        error.message,
        'api-endpoint-error'
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
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Test Publer integration
  app.post('/api/publer/test', async (req, res) => {
    try {
      const testResult = await publerIntegration.getAccountStatus();
      
      if (testResult.success) {
        await integrationLogger.logSuccess(
          'Publer Integration Test',
          'Social Media Integration',
          'Publer API connection successful',
          'publer-integration-test'
        );
      }

      res.json({
        success: testResult.success,
        message: testResult.success ? 'Publer integration working' : 'Publer integration failed',
        accountCount: testResult.accounts?.length || 0,
        error: testResult.error
      });

    } catch (error) {
      await integrationLogger.logFailure(
        'Publer Integration Test',
        'Social Media Integration',
        error.message,
        'publer-test-failure'
      );

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
}