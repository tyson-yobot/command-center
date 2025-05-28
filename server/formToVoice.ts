import express from 'express';
import axios from 'axios';

const router = express.Router();

// VoiceBot webhook URL - can be configured via environment
const VOICEBOT_URL = process.env.VOICEBOT_WEBHOOK_URL || 'https://your-voicebot-url.com/trigger';

router.post('/form-submission', async (req, res) => {
  try {
    const { name, phone, message, product } = req.body;

    if (!name || !phone || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Build VoiceBot payload
    const voicePayload = {
      contact: { name, phone },
      prompt: `New form submitted about ${product || 'your services'}.\n\nMessage:\n${message}`,
      source: 'YoBot Webform → VoiceBot',
    };

    // Send to VoiceBot (if URL is configured)
    if (VOICEBOT_URL && !VOICEBOT_URL.includes('your-voicebot-url.com')) {
      const voiceRes = await axios.post(VOICEBOT_URL, voicePayload);
      console.log('🎤 VoiceBot triggered:', voiceRes.data);
    } else {
      console.log('🎤 VoiceBot payload ready (no URL configured):', voicePayload);
    }

    res.json({ 
      status: 'success',
      message: 'Form processed and sent to VoiceBot automation',
      contact: { name, phone }
    });
  } catch (err) {
    console.error('VoiceBot Trigger Error:', err);
    res.status(500).json({ error: 'VoiceBot trigger failed' });
  }
});

// Test endpoint for debugging
router.get('/test', async (_req, res) => {
  const mockSubmission = {
    name: 'Alex Chen',
    phone: '+15551234567',
    message: 'Interested in YoBot automation for our sales team. Need demo.',
    product: 'YoBot Enterprise Suite',
  };

  try {
    const voicePayload = {
      contact: { name: mockSubmission.name, phone: mockSubmission.phone },
      prompt: `Test form submission about ${mockSubmission.product}.\n\nMessage:\n${mockSubmission.message}`,
      source: 'YoBot Test Trigger',
    };

    if (VOICEBOT_URL && !VOICEBOT_URL.includes('your-voicebot-url.com')) {
      await axios.post(VOICEBOT_URL, voicePayload);
    }

    res.json({ 
      status: 'test completed',
      payload: voicePayload
    });
  } catch (err) {
    console.error('Test Error:', err);
    res.status(500).json({ error: 'Test failed' });
  }
});

export default router;