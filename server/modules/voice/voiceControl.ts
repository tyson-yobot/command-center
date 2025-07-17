import express from 'express';
import axios from 'axios';

const router = express.Router();

// Make webhook URL - can be configured via environment
const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL || 'https://hook.us2.make.com/zc2bsrcxh4wpuc0skhv9rf7hdtm4iv0a';

router.post('/trigger', async (req, res) => {
  try {
    const { command, user = 'System', context = '', priority = 'normal' } = req.body;

    if (!command) {
      return res.status(400).json({ error: 'Missing voice command' });
    }

    const payload = {
      command,
      user,
      context,
      priority,
      source: 'YoBot® Command Center',
      timestamp: new Date().toISOString(),
    };

    // Send to Make webhook (if URL is configured)
    if (MAKE_WEBHOOK_URL && !MAKE_WEBHOOK_URL.includes('example.com')) {
      const makeRes = await axios.post(MAKE_WEBHOOK_URL, payload);
      console.log('🎤 VoiceBot Command Sent to Make:', command);
      
      res.json({ 
        status: '✅ Command sent to VoiceBot', 
        command,
        user,
        priority,
        data: makeRes.data 
      });
    } else {
      console.log('🎤 Voice Command Ready (no webhook URL configured):', payload);
      
      res.json({ 
        status: '✅ Voice command processed (demo mode)', 
        command,
        user,
        priority,
        payload 
      });
    }
  } catch (err: any) {
    console.error('Voice Control Error:', err.response?.data || err.message);
    res.status(500).json({ 
      error: 'VoiceBot command failed',
      details: err.response?.data || err.message 
    });
  }
});

// Test endpoint for voice command testing
router.get('/test', async (_req, res) => {
  const testCommand = {
    command: 'Generate executive summary for today\'s performance',
    user: 'Command Center',
    context: 'Daily Report',
    priority: 'high'
  };

  try {
    const payload = {
      ...testCommand,
      source: 'YoBot® Command Center Test',
      timestamp: new Date().toISOString(),
    };

    if (MAKE_WEBHOOK_URL && !MAKE_WEBHOOK_URL.includes('example.com')) {
      await axios.post(MAKE_WEBHOOK_URL, payload);
    }

    res.json({ 
      status: 'test completed',
      message: 'Voice control test successful',
      payload
    });
  } catch (err: any) {
    console.error('Voice Test Error:', err);
    res.status(500).json({ 
      error: 'Voice test failed',
      details: err.message 
    });
  }
});

// Get voice command history/status
router.get('/status', (_req, res) => {
  res.json({
    status: 'operational',
    webhook_configured: MAKE_WEBHOOK_URL && !MAKE_WEBHOOK_URL.includes('example.com'),
    capabilities: [
      'Executive report generation',
      'CRM data summaries', 
      'Performance analytics',
      'Alert notifications',
      'System status updates'
    ],
    last_updated: new Date().toISOString()
  });
});

export default router;
