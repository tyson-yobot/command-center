import { Request, Response } from "express";
import axios from "axios";
import { logEscalation, logEventSync } from "./airtableIntegrations";

// 012 - ElevenLabs Voice Response Generation
export async function generateVoiceResponse(req: Request, res: Response) {
  try {
    const { text, voice = "Rachel", model = "eleven_multilingual_v2" } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required for voice synthesis" });
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      return res.status(500).json({ 
        error: "ElevenLabs API key not configured",
        message: "Please provide ELEVENLABS_API_KEY to enable voice synthesis"
      });
    }

    // Get available voices to find the voice ID
    const voicesResponse = await axios.get('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      }
    });

    const selectedVoice = voicesResponse.data.voices.find(
      (v: any) => v.name.toLowerCase() === voice.toLowerCase()
    ) || voicesResponse.data.voices[0]; // Default to first voice if not found

    // Generate speech
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice.voice_id}`,
      {
        text,
        model_id: model,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      },
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    // Convert audio to base64 for transmission
    const audioBase64 = Buffer.from(response.data).toString('base64');

    // Log the voice generation event
    try {
      await logEventSync({
        eventType: "voice_synthesis",
        details: `Generated voice response using ${selectedVoice.name}`,
        timestamp: new Date().toISOString(),
        source: "ElevenLabs API",
        textLength: text.length
      });
    } catch (error: any) {
      console.warn("Failed to log voice synthesis event:", error.message);
    }

    res.json({
      success: true,
      message: "Voice response generated successfully",
      audio_base64: audioBase64,
      voice_used: selectedVoice.name,
      voice_id: selectedVoice.voice_id,
      text_length: text.length,
      model: model
    });

  } catch (error: any) {
    console.error("Voice synthesis failed:", error);
    res.status(500).json({
      error: "Failed to generate voice response",
      details: error.response?.data || error.message
    });
  }
}

// 013 - VoiceBot Command Trigger → Escalation
export async function triggerEscalationByCommand(req: Request, res: Response) {
  try {
    const { command, clientId, sessionId, userContext } = req.body;

    if (!command) {
      return res.status(400).json({ error: "Command is required" });
    }

    const escalationTriggers = [
      'help', 'support', 'human', 'agent', 'escalate', 'manager', 
      'speak to someone', 'customer service', 'complaint', 'problem',
      'not working', 'broken', 'error', 'issue', 'urgent'
    ];

    const shouldEscalate = escalationTriggers.some(trigger => 
      command.toLowerCase().includes(trigger.toLowerCase())
    );

    if (shouldEscalate) {
      // Create escalation record
      const escalationData = {
        ticketId: `ESC_${Date.now()}`,
        clientName: clientId || "Unknown Client",
        escalationType: "Voice Command Trigger",
        priority: "Medium",
        timestamp: new Date().toISOString(),
        reason: `User requested escalation via voice command: "${command}"`,
        sessionId: sessionId || "unknown",
        userContext: userContext || {}
      };

      try {
        await logEscalation(escalationData);
      } catch (error: any) {
        console.warn("Failed to log escalation:", error.message);
      }

      // Send escalation notification
      if (process.env.SLACK_WEBHOOK_URL) {
        try {
          await axios.post(process.env.SLACK_WEBHOOK_URL, {
            text: `🚨 Voice Escalation Triggered\nClient: ${clientId}\nCommand: "${command}"\nSession: ${sessionId}`,
            channel: '#support-escalations'
          });
        } catch (error: any) {
          console.warn("Failed to send Slack notification:", error.message);
        }
      }

      res.json({
        success: true,
        escalated: true,
        message: "Escalation triggered successfully",
        escalationId: escalationData.ticketId,
        triggeredBy: command,
        nextSteps: "A human agent will be notified"
      });
    } else {
      res.json({
        success: true,
        escalated: false,
        message: "No escalation triggers detected",
        command: command
      });
    }

  } catch (error: any) {
    console.error("Escalation trigger failed:", error);
    res.status(500).json({
      error: "Failed to process escalation trigger",
      details: error.message
    });
  }
}

// Helper function for manual escalation
export async function escalateToHuman(clientId: string, reason: string, context?: any) {
  const escalationData = {
    ticketId: `ESC_${Date.now()}`,
    clientName: clientId,
    escalationType: "Manual Escalation",
    priority: "High",
    timestamp: new Date().toISOString(),
    reason: reason,
    context: context || {}
  };

  try {
    await logEscalation(escalationData);
    
    if (process.env.SLACK_WEBHOOK_URL) {
      await axios.post(process.env.SLACK_WEBHOOK_URL, {
        text: `🚨 Manual Escalation\nClient: ${clientId}\nReason: ${reason}`,
        channel: '#support-escalations'
      });
    }

    return escalationData.ticketId;
  } catch (error: any) {
    console.error("Manual escalation failed:", error);
    throw error;
  }
}

// Test voice synthesis endpoint
export async function testVoiceSynthesis(req: Request, res: Response) {
  const testText = "Hello! This is a test of the YoBot voice synthesis system. The integration is working correctly.";
  
  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      return res.status(500).json({
        error: "ElevenLabs API key required",
        message: "Please configure ELEVENLABS_API_KEY to test voice synthesis",
        testText
      });
    }

    // Test voice generation
    const voiceRequest = {
      body: {
        text: testText,
        voice: "Rachel",
        model: "eleven_multilingual_v2"
      }
    };

    // Mock response object for testing
    const mockRes = {
      json: (data: any) => data,
      status: (code: number) => ({ json: (data: any) => ({ status: code, ...data }) })
    };

    const result = await generateVoiceResponse(voiceRequest as any, mockRes as any);

    res.json({
      success: true,
      message: "Voice synthesis test completed",
      testText,
      result: typeof result === 'object' ? result : { processed: true }
    });

  } catch (error: any) {
    res.status(500).json({
      error: "Voice synthesis test failed",
      details: error.message,
      testText
    });
  }
}
