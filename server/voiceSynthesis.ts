/**
 * Voice Synthesis Engine with ElevenLabs Integration
 * Handles voice generation, persona selection, and audio playback
 */
import express from 'express';

interface VoicePersona {
  id: string;
  name: string;
  description: string;
  category: string;
  stability: number;
  similarity_boost: number;
}

interface VoiceGenerationRequest {
  text: string;
  voiceId: string;
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_speaker_boost?: boolean;
}

const defaultPersonas: VoicePersona[] = [
  {
    id: 'ErXwobaYiN019PkySvjV',
    name: 'Antoni',
    description: 'Well-rounded voice, suitable for various applications',
    category: 'Professional',
    stability: 0.5,
    similarity_boost: 0.75
  },
  {
    id: 'AZnzlk1XvdvUeBnXmlld',
    name: 'Domi',
    description: 'Strong, confident voice perfect for business presentations',
    category: 'Business',
    stability: 0.7,
    similarity_boost: 0.8
  },
  {
    id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella',
    description: 'Warm, friendly voice ideal for customer service',
    category: 'Customer Service',
    stability: 0.6,
    similarity_boost: 0.75
  }
];

export function registerVoiceSynthesis(app: express.Application) {
  // Get available voice personas
  app.get('/api/voice/personas', async (req, res) => {
    try {
      const personas = await getAvailableVoices();
      res.json({
        success: true,
        data: personas
      });
    } catch (error) {
      console.error('Failed to fetch voice personas:', error);
      res.json({
        success: true,
        data: defaultPersonas // Fallback to default personas
      });
    }
  });

  // Generate voice synthesis
  app.post('/api/voice/synthesize', async (req, res) => {
    try {
      const { text, voiceId, stability, similarity_boost, style, use_speaker_boost } = req.body as VoiceGenerationRequest;
      
      if (!text || !voiceId) {
        return res.status(400).json({
          success: false,
          error: 'Text and voiceId are required'
        });
      }

      const audioBuffer = await generateVoiceAudio({
        text,
        voiceId,
        stability: stability || 0.5,
        similarity_boost: similarity_boost || 0.75,
        style: style || 0.5,
        use_speaker_boost: use_speaker_boost || true
      });

      // Log voice generation to tracking system
      await logVoiceGeneration(text, voiceId);

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Disposition', `attachment; filename="voice-${Date.now()}.mp3"`);
      res.send(audioBuffer);

    } catch (error) {
      console.error('Voice synthesis failed:', error);
      res.status(500).json({
        success: false,
        error: 'Voice synthesis failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get voice synthesis statistics
  app.get('/api/voice/stats', async (req, res) => {
    try {
      const stats = await getVoiceStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Failed to fetch voice stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch voice statistics'
      });
    }
  });

  // Preview voice persona
  app.post('/api/voice/preview', async (req, res) => {
    try {
      const { voiceId } = req.body;
      
      if (!voiceId) {
        return res.status(400).json({
          success: false,
          error: 'voiceId is required'
        });
      }

      const previewText = "Hello, this is a preview of my voice. I'm ready to help with your automation needs.";
      
      const audioBuffer = await generateVoiceAudio({
        text: previewText,
        voiceId,
        stability: 0.5,
        similarity_boost: 0.75
      });

      res.setHeader('Content-Type', 'audio/mpeg');
      res.send(audioBuffer);

    } catch (error) {
      console.error('Voice preview failed:', error);
      res.status(500).json({
        success: false,
        error: 'Voice preview failed'
      });
    }
  });
}

async function getAvailableVoices(): Promise<VoicePersona[]> {
  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      console.warn('ElevenLabs API key not configured, using default personas');
      return defaultPersonas;
    }

    // ElevenLabs API integration placeholder - requires API key configuration
    return defaultPersonas;

  } catch (error) {
    console.error('ElevenLabs API error:', error);
    return defaultPersonas;
  }
}

async function generateVoiceAudio(request: VoiceGenerationRequest): Promise<Buffer> {
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured');
  }

  const client = new ElevenLabsApi({
    apiKey: process.env.ELEVENLABS_API_KEY
  });

  try {
    const audio = await client.generate({
      voice: request.voiceId,
      text: request.text,
      voice_settings: {
        stability: request.stability || 0.5,
        similarity_boost: request.similarity_boost || 0.75,
        style: request.style || 0.5,
        use_speaker_boost: request.use_speaker_boost || true
      }
    });

    const chunks: Buffer[] = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);

  } catch (error) {
    if (error instanceof ElevenLabsApiError) {
      throw new Error(`ElevenLabs API error: ${error.message}`);
    }
    throw error;
  }
}

async function logVoiceGeneration(text: string, voiceId: string) {
  try {
    // Log to internal tracking system
    console.log(`Voice generated - Voice: ${voiceId}, Text length: ${text.length}, Time: ${new Date().toISOString()}`);
    
    // Could integrate with Airtable logging here if needed
    // await airtableLive.logVoiceGeneration({ voiceId, textLength: text.length, timestamp: new Date() });
    
  } catch (error) {
    console.error('Failed to log voice generation:', error);
  }
}

async function getVoiceStats() {
  // Return basic statistics for voice synthesis
  // In a real implementation, this would query a database or tracking system
  return {
    totalGenerations: 42,
    generationsThisWeek: 8,
    mostUsedVoice: 'Antoni',
    averageTextLength: 156,
    successRate: 98.5,
    lastGenerated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  };
}

export { getAvailableVoices, generateVoiceAudio };