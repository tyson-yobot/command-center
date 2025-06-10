import { Request, Response } from "express";
import axios from "axios";
import { logEventSync } from "./airtableIntegrations";

// 019 - HubSpot OAuth Callback Flow
export async function handleHubSpotOAuth(req: Request, res: Response) {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({ error: "Authorization code is required" });
    }

    if (!process.env.HUBSPOT_CLIENT_ID || !process.env.HUBSPOT_CLIENT_SECRET) {
      return res.status(500).json({
        error: "HubSpot OAuth configuration missing",
        message: "Please provide HUBSPOT_CLIENT_ID and HUBSPOT_CLIENT_SECRET"
      });
    }

    // Exchange code for access token
    const tokenResponse = await axios.post('https://api.hubapi.com/oauth/v1/token', {
      grant_type: 'authorization_code',
      client_id: process.env.HUBSPOT_CLIENT_ID,
      client_secret: process.env.HUBSPOT_CLIENT_SECRET,
      redirect_uri: `${req.protocol}://${req.get('host')}/api/hubspot/oauth/callback`,
      code: code
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Get account info
    const accountResponse = await axios.get('https://api.hubapi.com/oauth/v1/access-tokens/' + access_token);
    const { hub_domain, hub_id, user_id } = accountResponse.data;

    // Store tokens securely (in production, use proper secret management)
    const tokenData = {
      access_token,
      refresh_token,
      expires_in,
      expires_at: Date.now() + (expires_in * 1000),
      hub_domain,
      hub_id,
      user_id,
      created_at: new Date().toISOString()
    };

    // Log the OAuth success event
    try {
      await logEventSync({
        eventType: "hubspot_oauth_success",
        details: `HubSpot OAuth completed for hub ${hub_domain}`,
        timestamp: new Date().toISOString(),
        source: "HubSpot OAuth",
        hubId: hub_id,
        userId: user_id
      });
    } catch (error: any) {
      console.warn("Failed to log OAuth event:", error.message);
    }

    res.json({
      success: true,
      message: "HubSpot OAuth completed successfully",
      account: {
        hub_domain,
        hub_id,
        user_id
      },
      token_info: {
        expires_in,
        scope: accountResponse.data.scopes,
        token_type: accountResponse.data.token_type
      }
    });

  } catch (error: any) {
    console.error("HubSpot OAuth failed:", error);
    
    // Log the OAuth failure
    try {
      await logEventSync({
        eventType: "hubspot_oauth_error",
        details: `HubSpot OAuth failed: ${error.message}`,
        timestamp: new Date().toISOString(),
        source: "HubSpot OAuth",
        error: error.response?.data || error.message
      });
    } catch (logError: any) {
      console.warn("Failed to log OAuth error:", logError.message);
    }

    res.status(500).json({
      error: "HubSpot OAuth failed",
      details: error.response?.data || error.message
    });
  }
}

// Initiate HubSpot OAuth flow
export async function initiateHubSpotOAuth(req: Request, res: Response) {
  try {
    if (!process.env.HUBSPOT_CLIENT_ID) {
      return res.status(500).json({
        error: "HubSpot OAuth configuration missing",
        message: "Please provide HUBSPOT_CLIENT_ID"
      });
    }

    const scopes = [
      'contacts',
      'content',
      'reports',
      'social',
      'automation',
      'timeline',
      'files',
      'hubdb',
      'forms',
      'integration-sync'
    ].join('%20');

    const redirectUri = encodeURIComponent(`${req.protocol}://${req.get('host')}/api/hubspot/oauth/callback`);
    const state = Buffer.from(JSON.stringify({ timestamp: Date.now() })).toString('base64');

    const authUrl = `https://app.hubspot.com/oauth/authorize?client_id=${process.env.HUBSPOT_CLIENT_ID}&scope=${scopes}&redirect_uri=${redirectUri}&state=${state}`;

    res.json({
      success: true,
      message: "HubSpot OAuth flow initiated",
      auth_url: authUrl,
      scopes: scopes.split('%20'),
      redirect_uri: redirectUri
    });

  } catch (error: any) {
    console.error("Failed to initiate HubSpot OAuth:", error);
    res.status(500).json({
      error: "Failed to initiate OAuth flow",
      details: error.message
    });
  }
}

// Refresh HubSpot access token
export async function refreshHubSpotToken(req: Request, res: Response) {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ error: "Refresh token is required" });
    }

    if (!process.env.HUBSPOT_CLIENT_ID || !process.env.HUBSPOT_CLIENT_SECRET) {
      return res.status(500).json({
        error: "HubSpot OAuth configuration missing",
        message: "Please provide HUBSPOT_CLIENT_ID and HUBSPOT_CLIENT_SECRET"
      });
    }

    const tokenResponse = await axios.post('https://api.hubapi.com/oauth/v1/token', {
      grant_type: 'refresh_token',
      client_id: process.env.HUBSPOT_CLIENT_ID,
      client_secret: process.env.HUBSPOT_CLIENT_SECRET,
      refresh_token: refresh_token
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, refresh_token: new_refresh_token, expires_in } = tokenResponse.data;

    res.json({
      success: true,
      message: "HubSpot token refreshed successfully",
      access_token,
      refresh_token: new_refresh_token,
      expires_in,
      expires_at: Date.now() + (expires_in * 1000)
    });

  } catch (error: any) {
    console.error("HubSpot token refresh failed:", error);
    res.status(500).json({
      error: "Failed to refresh HubSpot token",
      details: error.response?.data || error.message
    });
  }
}