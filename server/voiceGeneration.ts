import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { WebClient } from '@slack/web-api';

interface VoiceGenerationResponse {
  success: boolean;
  message: string;
  filename?: string;
  error?: string;
}

/**
 * Generate voice reply using ElevenLabs API
 */
export async function generateVoiceReply(text: string, filename: string = "reply_audio.mp3"): Promise<VoiceGenerationResponse> {
  const apiKey = process.env.ELEVENLABS_API_KEY || "sk_2f92a9d46c884493a304aa02e74efb80ff4894ff514a777e";
  const voiceId = process.env.ELEVENLABS_VOICE_ID || "nPczCjzI2devNBz1zQrb"; // YoBot's working voice

  if (!apiKey) {
    return {
      success: false,
      message: "ElevenLabs API key not configured",
      error: "ELEVENLABS_API_KEY environment variable missing"
    };
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  
  const headers = {
    "xi-api-key": apiKey,
    "Content-Type": "application/json"
  };

  const payload = {
    text: text,
    model_id: "eleven_monolingual_v1",
    voice_settings: {
      stability: 0.4,
      similarity_boost: 0.8
    }
  };

  try {
    const response = await axios.post(url, payload, {
      headers,
      responseType: 'arraybuffer'
    });

    if (response.status === 200) {
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Save audio file
      const filepath = path.join(uploadsDir, filename);
      fs.writeFileSync(filepath, response.data);

      return {
        success: true,
        message: `Audio saved as ${filename}`,
        filename: filepath
      };
    } else {
      return {
        success: false,
        message: "Voice generation failed",
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }
  } catch (error: any) {
    console.error('ElevenLabs API error:', error.response?.data || error.message);
    
    // Send Slack alert for voice generation failure
    try {
      const slackToken = process.env.SLACK_BOT_TOKEN;
      if (slackToken) {
        const slackClient = new WebClient(slackToken);
        await slackClient.chat.postMessage({
          channel: "#support-queue",
          text: `❌ ElevenLabs voice gen failed for \`${filename}\`:\n\`\`\`${error.response?.data?.detail || error.message || "Unknown error"}\`\`\``
        });
      }
    } catch (slackError) {
      console.error('Failed to send Slack alert for voice generation failure:', slackError);
    }
    
    return {
      success: false,
      message: "Voice generation failed",
      error: error.response?.data?.detail || error.message || "Unknown error"
    };
  }
}

/**
 * Test ElevenLabs connection
 */
export async function testElevenLabsConnection(): Promise<{ success: boolean; message: string }> {
  const apiKey = process.env.ELEVENLABS_API_KEY || "sk_2f92a9d46c884493a304aa02e74efb80ff4894ff514a777e";
  
  if (!apiKey) {
    return {
      success: false,
      message: "ElevenLabs API key not configured"
    };
  }

  try {
    const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
      headers: {
        "xi-api-key": apiKey
      }
    });

    if (response.status === 200) {
      const voiceCount = response.data.voices?.length || 0;
      return {
        success: true,
        message: `Connected to ElevenLabs successfully. Found ${voiceCount} available voices.`
      };
    } else {
      return {
        success: false,
        message: `Connection failed with status ${response.status}`
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.detail || error.message || 'Failed to connect to ElevenLabs'
    };
  }
}

/**
 * Get available voices from ElevenLabs
 */
export async function getAvailableVoices(): Promise<any[]> {
  const apiKey = process.env.ELEVENLABS_API_KEY || "sk_2f92a9d46c884493a304aa02e74efb80ff4894ff514a777e";
  
  if (!apiKey) {
    throw new Error('ElevenLabs API key not configured');
  }

  try {
    const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
      headers: {
        "xi-api-key": apiKey
      }
    });

    return response.data.voices || [];
  } catch (error: any) {
    console.error('Error fetching voices:', error.response?.data || error.message);
    throw error;
  }
}