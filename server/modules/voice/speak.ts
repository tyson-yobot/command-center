import express from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const router = express.Router();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID;

// Ensure temp directory exists
const tempDir = '/tmp';
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

router.post('/', async (req, res) => {
  const { text, voiceId = VOICE_ID } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'No text provided for voice synthesis' });
  }

  if (!ELEVENLABS_API_KEY) {
    return res.status(400).json({ error: 'ElevenLabs API key not configured' });
  }

  try {
    console.log('🎤 Generating voice for:', text.substring(0, 50) + '...');

    const audioRes = await axios({
      method: 'POST',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      data: {
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.9,
          style: 0.0,
          use_speaker_boost: true
        },
      },
      responseType: 'arraybuffer',
      timeout: 30000 // 30 second timeout
    });

    const timestamp = Date.now();
    const filename = `voice_${timestamp}.mp3`;
    const filePath = path.join(tempDir, filename);
    
    fs.writeFileSync(filePath, audioRes.data);

    // Set proper headers for audio streaming
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Content-Length', audioRes.data.byteLength);

    // Stream the audio file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Clean up file after streaming
    fileStream.on('end', () => {
      setTimeout(() => {
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error cleaning up audio file:', err);
        });
      }, 5000); // Delete after 5 seconds
    });

    console.log('✅ Voice synthesis completed successfully');

  } catch (err: any) {
    console.error('ElevenLabs Error:', err.response?.data || err.message);
    
    if (err.response?.status === 401) {
      res.status(401).json({ error: 'Invalid ElevenLabs API key' });
    } else if (err.response?.status === 429) {
      res.status(429).json({ error: 'ElevenLabs rate limit exceeded' });
    } else {
      res.status(500).json({ 
        error: 'Voice synthesis failed',
        details: err.response?.data || err.message 
      });
    }
  }
});

// Test endpoint for voice synthesis
router.get('/test', async (req, res) => {
  const testText = "Hello from YoBot Command Center. Your enterprise automation platform is now speaking with professional voice synthesis.";
  
  try {
    // Use the same logic as the main endpoint
    const audioRes = await axios({
      method: 'POST',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      data: {
        text: testText,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.9,
        },
      },
      responseType: 'arraybuffer',
    });

    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(audioRes.data));

  } catch (err: any) {
    res.status(500).json({ 
      error: 'Voice test failed',
      details: err.message 
    });
  }
});

export default router;
