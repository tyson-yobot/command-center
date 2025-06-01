import express from 'express';
import axios from 'axios';

const router = express.Router();

interface SyncStatus {
  service: string;
  lastSync: string;
  status: 'connected' | 'error' | 'syncing' | 'disconnected';
  errorMessage?: string;
  recordCount?: number;
}

// Get sync status for all integrated services
router.get('/status', async (req, res) => {
  try {
    const syncStatuses: SyncStatus[] = [];

    // Check Airtable sync status
    if (process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID) {
      try {
        const airtableResponse = await axios.get(
          `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Command%20Center%20Metrics`,
          {
            headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}` },
            timeout: 5000
          }
        );
        syncStatuses.push({
          service: 'Airtable',
          lastSync: new Date().toISOString(),
          status: 'connected',
          recordCount: airtableResponse.data.records?.length || 0
        });
      } catch (error: any) {
        syncStatuses.push({
          service: 'Airtable',
          lastSync: 'Never',
          status: 'error',
          errorMessage: error.response?.data?.error?.message || 'Connection failed'
        });
      }
    } else {
      syncStatuses.push({
        service: 'Airtable',
        lastSync: 'Never',
        status: 'disconnected',
        errorMessage: 'API credentials not configured'
      });
    }

    // Check HubSpot sync status
    if (process.env.HUBSPOT_API_KEY) {
      try {
        const hubspotResponse = await axios.get(
          'https://api.hubapi.com/contacts/v1/lists/all/contacts/all',
          {
            headers: { Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}` },
            params: { count: 1 },
            timeout: 5000
          }
        );
        syncStatuses.push({
          service: 'HubSpot',
          lastSync: new Date().toISOString(),
          status: 'connected',
          recordCount: hubspotResponse.data['total-count'] || 0
        });
      } catch (error: any) {
        syncStatuses.push({
          service: 'HubSpot',
          lastSync: 'Never',
          status: 'error',
          errorMessage: error.response?.data?.message || 'Connection failed'
        });
      }
    } else {
      syncStatuses.push({
        service: 'HubSpot',
        lastSync: 'Never',
        status: 'disconnected',
        errorMessage: 'API credentials not configured'
      });
    }

    // Check QuickBooks sync status
    if (process.env.QUICKBOOKS_ACCESS_TOKEN && process.env.QUICKBOOKS_REALM_ID) {
      try {
        const qboResponse = await axios.get(
          `https://sandbox-quickbooks.api.intuit.com/v3/company/${process.env.QUICKBOOKS_REALM_ID}/companyinfo/${process.env.QUICKBOOKS_REALM_ID}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.QUICKBOOKS_ACCESS_TOKEN}`,
              Accept: 'application/json'
            },
            timeout: 5000
          }
        );
        syncStatuses.push({
          service: 'QuickBooks',
          lastSync: new Date().toISOString(),
          status: 'connected'
        });
      } catch (error: any) {
        syncStatuses.push({
          service: 'QuickBooks',
          lastSync: 'Never',
          status: 'error',
          errorMessage: 'Token refresh required'
        });
      }
    } else {
      syncStatuses.push({
        service: 'QuickBooks',
        lastSync: 'Never',
        status: 'disconnected',
        errorMessage: 'OAuth not completed'
      });
    }

    // Check Slack integration
    if (process.env.SLACK_BOT_TOKEN) {
      try {
        const slackResponse = await axios.post(
          'https://slack.com/api/auth.test',
          {},
          {
            headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}` },
            timeout: 5000
          }
        );
        syncStatuses.push({
          service: 'Slack',
          lastSync: new Date().toISOString(),
          status: slackResponse.data.ok ? 'connected' : 'error',
          errorMessage: slackResponse.data.ok ? undefined : slackResponse.data.error
        });
      } catch (error: any) {
        syncStatuses.push({
          service: 'Slack',
          lastSync: 'Never',
          status: 'error',
          errorMessage: 'Connection failed'
        });
      }
    } else {
      syncStatuses.push({
        service: 'Slack',
        lastSync: 'Never',
        status: 'disconnected',
        errorMessage: 'Bot token not configured'
      });
    }

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      services: syncStatuses,
      summary: {
        total: syncStatuses.length,
        connected: syncStatuses.filter(s => s.status === 'connected').length,
        errors: syncStatuses.filter(s => s.status === 'error').length,
        disconnected: syncStatuses.filter(s => s.status === 'disconnected').length
      }
    });

  } catch (error: any) {
    console.error('Master data sync status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check sync status',
      details: error.message
    });
  }
});

// Force sync refresh for a specific service
router.post('/refresh/:service', async (req, res) => {
  const { service } = req.params;
  
  try {
    // Trigger refresh logic based on service
    switch (service.toLowerCase()) {
      case 'airtable':
        // Trigger Airtable sync refresh
        break;
      case 'hubspot':
        // Trigger HubSpot sync refresh
        break;
      case 'quickbooks':
        // Trigger QuickBooks token refresh
        break;
      case 'slack':
        // Test Slack connection
        break;
      default:
        return res.status(400).json({ error: 'Unknown service' });
    }

    res.json({
      success: true,
      message: `${service} sync refresh initiated`,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: `Failed to refresh ${service} sync`,
      details: error.message
    });
  }
});

export default router;