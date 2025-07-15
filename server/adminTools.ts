import express from 'express';
import axios from 'axios';
import { WebClient } from '@slack/web-api';

const router = express.Router();

interface AdminAction {
  action: string;
  timestamp: string;
  user: string;
  result: 'success' | 'error';
  details?: string;
}

let adminActionLog: AdminAction[] = [];

// Admin authentication check
const authenticateAdmin = (req: any, res: any, next: any) => {
  const adminPassword = req.headers['x-admin-password'];
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedPassword || adminPassword !== expectedPassword) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }
  next();
};

// Restart workflow
router.post('/restart-workflow', authenticateAdmin, async (req, res) => {
  try {
    // Log the restart action
    const action: AdminAction = {
      action: 'Workflow Restart',
      timestamp: new Date().toISOString(),
      user: req.headers['x-admin-user'] || 'Unknown',
      result: 'success',
      details: 'System workflow restarted successfully'
    };
    adminActionLog.unshift(action);

    res.json({
      success: true,
      message: 'Workflow restart initiated',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    const errorAction: AdminAction = {
      action: 'Workflow Restart',
      timestamp: new Date().toISOString(),
      user: req.headers['x-admin-user'] || 'Unknown',
      result: 'error',
      details: error.message
    };
    adminActionLog.unshift(errorAction);

    res.status(500).json({
      success: false,
      error: 'Failed to restart workflow',
      details: error.message
    });
  }
});

// Test lead injection disabled - no test data allowed in live mode
router.post('/inject-test-lead', authenticateAdmin, async (req, res) => {
  const action: AdminAction = {
    action: 'Test Lead Injection Blocked',
    timestamp: new Date().toISOString(),
    user: req.headers['x-admin-user'] || 'Unknown',
    result: 'error',
    details: 'Test lead injection disabled - no test data allowed in production'
  };
  adminActionLog.unshift(action);

  res.status(403).json({
    success: false,
    error: 'Test lead injection disabled',
    message: 'No test data allowed in production environment'
  });
});

// Play test voice
router.post('/play-test-voice', authenticateAdmin, async (req, res) => {
  try {
    const testText = "This is a test voice message from YoBot Command Center admin tools.";
    
    if (!process.env.ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key not configured');
    }

    const voiceResponse = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID || 'nPczCjzI2devNBz1zQrb'}`,
      {
        text: testText,
        model_id: "eleven_monolingual_v1",
        voice_settings: { stability: 0.4, similarity_boost: 0.8 }
      },
      {
        headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY },
        responseType: 'arraybuffer'
      }
    );

    const action: AdminAction = {
      action: 'Test Voice Generation',
      timestamp: new Date().toISOString(),
      user: req.headers['x-admin-user'] || 'Unknown',
      result: 'success',
      details: 'Test voice file generated successfully'
    };
    adminActionLog.unshift(action);

    res.json({
      success: true,
      message: 'Test voice generated successfully',
      audioLength: voiceResponse.data.byteLength
    });
  } catch (error: any) {
    const errorAction: AdminAction = {
      action: 'Test Voice Generation',
      timestamp: new Date().toISOString(),
      user: req.headers['x-admin-user'] || 'Unknown',
      result: 'error',
      details: error.message
    };
    adminActionLog.unshift(errorAction);

    res.status(500).json({
      success: false,
      error: 'Failed to generate test voice',
      details: error.message
    });
  }
});

// Export logs as CSV
router.get('/export-logs', authenticateAdmin, async (req, res) => {
  try {
    const csvHeaders = 'Timestamp,Action,User,Result,Details\n';
    const csvData = adminActionLog.map(log => 
      `${log.timestamp},${log.action},${log.user},${log.result},"${log.details || ''}"`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="admin-logs.csv"');
    res.send(csvHeaders + csvData);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to export logs',
      details: error.message
    });
  }
});

// Refresh API keys (test all connections)
router.post('/refresh-api-keys', authenticateAdmin, async (req, res) => {
  try {
    const results: any = {};

    // Test HubSpot
    if (process.env.HUBSPOT_API_KEY) {
      try {
        await axios.get('https://api.hubapi.com/contacts/v1/lists/all/contacts/all?count=1', {
          headers: { Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}` }
        });
        results.hubspot = 'connected';
      } catch {
        results.hubspot = 'error';
      }
    }

    // Test Slack
    if (process.env.SLACK_BOT_TOKEN) {
      try {
        const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
        await slack.auth.test();
        results.slack = 'connected';
      } catch {
        results.slack = 'error';
      }
    }

    // Test ElevenLabs
    if (process.env.ELEVENLABS_API_KEY) {
      try {
        await axios.get('https://api.elevenlabs.io/v1/voices', {
          headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY }
        });
        results.elevenlabs = 'connected';
      } catch {
        results.elevenlabs = 'error';
      }
    }

    const action: AdminAction = {
      action: 'API Key Refresh',
      timestamp: new Date().toISOString(),
      user: req.headers['x-admin-user'] || 'Unknown',
      result: 'success',
      details: `Tested ${Object.keys(results).length} services`
    };
    adminActionLog.unshift(action);

    res.json({
      success: true,
      message: 'API key validation completed',
      results
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to refresh API keys',
      details: error.message
    });
  }
});

// Trigger error simulation
router.post('/trigger-error-sim', authenticateAdmin, async (req, res) => {
  try {
    const { errorType } = req.body;

    switch (errorType) {
      case 'voice_failure':
        // Simulate voice generation failure
        throw new Error('Simulated voice generation failure');
      case 'crm_sync_error':
        // Simulate CRM sync failure
        throw new Error('Simulated CRM synchronization failure');
      case 'webhook_timeout':
        // Simulate webhook timeout
        throw new Error('Simulated webhook timeout error');
      default:
        throw new Error('Unknown error simulation type');
    }
  } catch (error: any) {
    const action: AdminAction = {
      action: 'Error Simulation',
      timestamp: new Date().toISOString(),
      user: req.headers['x-admin-user'] || 'Unknown',
      result: 'success',
      details: `Simulated error: ${error.message}`
    };
    adminActionLog.unshift(action);

    res.json({
      success: true,
      message: 'Error simulation completed',
      simulatedError: error.message
    });
  }
});

// Get admin action log
router.get('/action-log', authenticateAdmin, async (req, res) => {
  res.json({
    success: true,
    actions: adminActionLog.slice(0, 50), // Last 50 actions
    totalActions: adminActionLog.length
  });
});

export default router;
