// ElevenLabs Voice Synthesis Service

// Default voices available in ElevenLabs
export const DEFAULT_VOICES = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', category: 'Premade', description: 'Young Adult Female, Narration' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', category: 'Premade', description: 'Young Adult Female, Narration' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', category: 'Premade', description: 'Young Adult Female, Narration' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', category: 'Premade', description: 'Young Adult Male, Narration' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', category: 'Premade', description: 'Young Adult Female, Narration' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', category: 'Premade', description: 'Young Adult Male, Narration' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', category: 'Premade', description: 'Middle-aged Male, Narration' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', category: 'Premade', description: 'Middle-aged Male, Narration' },
  { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', category: 'Premade', description: 'Young Adult Male, Narration' },
  { id: 'CYw3kZ02Hs0563khs1Fj', name: 'Dave', category: 'Premade', description: 'Young Adult Male, Conversation' },
  { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Fin', category: 'Premade', description: 'Old Male, Narration' },
  { id: 'ThT5KcBeYPX3keUQqHPh', name: 'Sarah', category: 'Premade', description: 'Young Adult Female, News' },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', category: 'Premade', description: 'Middle-aged Female, Narration' },
  { id: 'pMsXgVXv3BLzUgSXRplE', name: 'Matilda', category: 'Premade', description: 'Young Adult Female, Narration' },
  { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matthew', category: 'Premade', description: 'Middle-aged Male, Narration' },
  { id: 'g5CIjZEefAph4nQFvHAz', name: 'James', category: 'Premade', description: 'Young Adult Male, News' },
  { id: 'oWAxZDx7w5VEj9dCyTzz', name: 'Grace', category: 'Premade', description: 'Young Adult Female, Narration' },
  { id: 'bVMeCyTHy58xNoL34h3p', name: 'Daniel', category: 'Premade', description: 'Middle-aged Male, Deep' }
];

// Get all available voices (default + custom if API available)
export async function getAllVoices() {
  if (!process.env.ELEVENLABS_API_KEY) {
    return { 
      voices: DEFAULT_VOICES, 
      error: 'ElevenLabs API key not configured - showing default voices' 
    };
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'Accept': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      }
    });

    if (response.ok) {
      const data = await response.json();
      const voices = data.voices?.map((voice: any) => ({
        id: voice.voice_id,
        name: voice.name,
        category: voice.category || 'Custom',
        description: voice.description || '',
        samples: voice.samples?.length || 0,
        settings: voice.settings
      })) || DEFAULT_VOICES;

      return { voices, error: null };
    } else {
      return { voices: DEFAULT_VOICES, error: 'Failed to fetch custom voices' };
    }
  } catch (error) {
    console.error('Failed to fetch voices:', error);
    return { voices: DEFAULT_VOICES, error: error.message };
  }
}

// Generate speech from text
export async function generateSpeech(text: string, voiceId: string = '21m00Tcm4TlvDq8ikWAM', options: any = {}) {
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured');
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: text,
        model_id: options.model_id || 'eleven_monolingual_v1',
        voice_settings: {
          stability: options.stability || 0.5,
          similarity_boost: options.similarity_boost || 0.5,
          style: options.style || 0.0,
          use_speaker_boost: options.use_speaker_boost || true
        }
      })
    });

    if (response.ok) {
      const audioBuffer = await response.arrayBuffer();
      return { audio: Buffer.from(audioBuffer), error: null };
    } else {
      throw new Error(`Speech generation failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('Speech generation failed:', error);
    throw new Error(`Speech generation failed: ${error.message}`);
  }
}

// Stream speech generation
export async function streamSpeech(text: string, voiceId: string = '21m00Tcm4TlvDq8ikWAM', options: any = {}) {
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured');
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: text,
        model_id: options.model_id || 'eleven_monolingual_v1',
        voice_settings: {
          stability: options.stability || 0.5,
          similarity_boost: options.similarity_boost || 0.5,
          style: options.style || 0.0,
          use_speaker_boost: options.use_speaker_boost || true
        }
      })
    });

    if (response.ok && response.body) {
      return response.body;
    } else {
      throw new Error(`Speech streaming failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('Speech streaming failed:', error);
    throw new Error(`Speech streaming failed: ${error.message}`);
  }
}

// Clone a voice from audio samples
export async function cloneVoice(name: string, description: string, files: Buffer[]) {
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured');
  }

  try {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    
    files.forEach((file, index) => {
      formData.append('files', new Blob([file]), `sample_${index}.wav`);
    });

    const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      },
      body: formData
    });

    if (response.ok) {
      const data = await response.json();
      return { voiceId: data.voice_id, error: null };
    } else {
      throw new Error(`Voice cloning failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('Voice cloning failed:', error);
    throw new Error(`Voice cloning failed: ${error.message}`);
  }
}

// Get voice settings
export async function getVoiceSettings(voiceId: string) {
  if (!process.env.ELEVENLABS_API_KEY) {
    return { settings: null, error: 'ElevenLabs API key not configured' };
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/voices/${voiceId}/settings`, {
      headers: {
        'Accept': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      }
    });

    if (response.ok) {
      const settings = await response.json();
      return { settings, error: null };
    } else {
      return { settings: null, error: `Failed to get voice settings: ${response.status}` };
    }
  } catch (error) {
    console.error('Failed to get voice settings:', error);
    return { settings: null, error: error.message };
  }
}

// Update voice settings
export async function updateVoiceSettings(voiceId: string, settings: any) {
  if (!process.env.ELEVENLABS_API_KEY) {
    return { success: false, error: 'ElevenLabs API key not configured' };
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/voices/${voiceId}/settings/edit`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      },
      body: JSON.stringify(settings)
    });

    if (response.ok) {
      return { success: true, error: null };
    } else {
      return { success: false, error: `Failed to update voice settings: ${response.status}` };
    }
  } catch (error) {
    console.error('Failed to update voice settings:', error);
    return { success: false, error: error.message };
  }
}

// Get user subscription info
export async function getUserInfo() {
  if (!process.env.ELEVENLABS_API_KEY) {
    return { user: null, error: 'ElevenLabs API key not configured' };
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/user', {
      headers: {
        'Accept': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      }
    });

    if (response.ok) {
      const user = await response.json();
      return { 
        user: {
          subscription: user.subscription,
          character_count: user.character_count,
          character_limit: user.character_limit,
          can_extend_character_limit: user.can_extend_character_limit
        }, 
        error: null 
      };
    } else {
      return { user: null, error: `Failed to get user info: ${response.status}` };
    }
  } catch (error) {
    console.error('Failed to get user info:', error);
    return { user: null, error: error.message };
  }
}

// Get available models
export async function getModels() {
  if (!process.env.ELEVENLABS_API_KEY) {
    return { models: [], error: 'ElevenLabs API key not configured' };
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/models', {
      headers: {
        'Accept': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      }
    });

    if (response.ok) {
      const models = await response.json();
      return { models: models || [], error: null };
    } else {
      return { models: [], error: `Failed to get models: ${response.status}` };
    }
  } catch (error) {
    console.error('Failed to get models:', error);
    return { models: [], error: error.message };
  }
}

// Delete a custom voice
export async function deleteVoice(voiceId: string) {
  if (!process.env.ELEVENLABS_API_KEY) {
    return { success: false, error: 'ElevenLabs API key not configured' };
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/voices/${voiceId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      }
    });

    if (response.ok) {
      return { success: true, error: null };
    } else {
      return { success: false, error: `Failed to delete voice: ${response.status}` };
    }
  } catch (error) {
    console.error('Failed to delete voice:', error);
    return { success: false, error: error.message };
  }
}

// Advanced text-to-speech with full options
export async function advancedTextToSpeech(options: {
  text: string;
  voiceId?: string;
  model?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
  outputFormat?: string;
}) {
  const {
    text,
    voiceId = '21m00Tcm4TlvDq8ikWAM',
    model = 'eleven_monolingual_v1',
    stability = 0.5,
    similarityBoost = 0.5,
    style = 0.0,
    useSpeakerBoost = true
  } = options;

  return await generateSpeech(text, voiceId, {
    model_id: model,
    stability,
    similarity_boost: similarityBoost,
    style,
    use_speaker_boost: useSpeakerBoost
  });
}