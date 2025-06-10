// ElevenLabs Voice Synthesis Service

// Complete ElevenLabs voice library with all available default voices
export const DEFAULT_VOICES = [
  // Premium Female Voices
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', category: 'Premade', description: 'Young Adult Female, Narration', accent: 'American', use_case: 'Narration, Audiobooks' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', category: 'Premade', description: 'Young Adult Female, Narration', accent: 'American', use_case: 'Strong, Confident' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', category: 'Premade', description: 'Young Adult Female, Narration', accent: 'American', use_case: 'Soft, Pleasant' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', category: 'Premade', description: 'Young Adult Female, Emotional', accent: 'American', use_case: 'Expressive, Storytelling' },
  { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', category: 'Premade', description: 'Young Adult Female, Warm', accent: 'American', use_case: 'Friendly, Welcoming' },
  { id: 'oWAxZDx7w5VEj9dCyTzz', name: 'Grace', category: 'Premade', description: 'Young Adult Female, Elegant', accent: 'American', use_case: 'Sophisticated, Professional' },
  { id: 'cjVigY5qzO86Huf0OWal', name: 'Stella', category: 'Premade', description: 'Middle-aged Female, Authoritative', accent: 'American', use_case: 'Business, Educational' },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', category: 'Premade', description: 'Middle-aged Female, Sophisticated', accent: 'English', use_case: 'Refined, Elegant' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Alice', category: 'Premade', description: 'Middle-aged Female, Clear', accent: 'British', use_case: 'Clear, Articulate' },
  { id: 'ThT5KcBeYPX3keUQqHPh', name: 'Sarah', category: 'Premade', description: 'Young Adult Female, News', accent: 'American', use_case: 'News, Broadcasting' },
  
  // Premium Male Voices
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', category: 'Premade', description: 'Young Adult Male, Well-rounded', accent: 'American', use_case: 'Versatile, Natural' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', category: 'Premade', description: 'Young Adult Male, Casual', accent: 'American', use_case: 'Casual, Friendly' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', category: 'Premade', description: 'Middle-aged Male, Narration', accent: 'American', use_case: 'Deep, Authoritative' },
  { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', category: 'Premade', description: 'Young Adult Male, Raspy', accent: 'American', use_case: 'Unique, Character' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', category: 'Premade', description: 'Middle-aged Male, Crisp', accent: 'American', use_case: 'Clear, Professional' },
  { id: 'CYw3kZ02Hs0563khs1Fj', name: 'Dave', category: 'Premade', description: 'Young Adult Male, Conversational', accent: 'British-Essex', use_case: 'Conversational, Relatable' },
  { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', category: 'Premade', description: 'Middle-aged Male, Hoarse', accent: 'American', use_case: 'Character, Distinctive' },
  { id: 'bVMeCyTHy58xNoL34h3p', name: 'Jeremy', category: 'Premade', description: 'Young Adult Male, Excited', accent: 'American-Irish', use_case: 'Energetic, Enthusiastic' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', category: 'Premade', description: 'Middle-aged Male, Deep', accent: 'British', use_case: 'Deep, Resonant' },
  { id: 'rGKVfvBBpNxMgKHwF3sB', name: 'Bill', category: 'Premade', description: 'Middle-aged Male, Strong', accent: 'American', use_case: 'Strong, Commanding' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', category: 'Premade', description: 'Middle-aged Male, Warm', accent: 'British', use_case: 'Warm, Trustworthy' },
  { id: 'g5CIjZEefAph4nQFvHAz', name: 'James', category: 'Premade', description: 'Young Adult Male, Calm', accent: 'Australian', use_case: 'Calm, Measured' },
  
  // Multilingual Voices  
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', category: 'Multilingual', description: 'Young Adult Female, Upbeat', accent: 'American', use_case: 'Multilingual, Upbeat' },
  { id: 'jBpfuIE2acCO8z3wKNLl', name: 'Gigi', category: 'Multilingual', description: 'Young Adult Female, Childlish', accent: 'American', use_case: 'Playful, Young' },
  { id: 'jsCqWAovK2LkecY7zXl4', name: 'Freya', category: 'Multilingual', description: 'Young Adult Female, Overly Dramatic', accent: 'American', use_case: 'Dramatic, Expressive' },
  { id: 'piTKgcLEGmPE4e6mEKli', name: 'Nicole', category: 'Multilingual', description: 'Young Adult Female, Whisper', accent: 'American', use_case: 'Soft, Intimate' },
  { id: 'SOYHLrjzK2X1ezoPC6cr', name: 'Harry', category: 'Multilingual', description: 'Young Adult Male, Anxious', accent: 'American', use_case: 'Nervous, Uncertain' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', category: 'Multilingual', description: 'Young Adult Male, Articulate', accent: 'American', use_case: 'Clear, Articulate' },
  { id: 'flq6f7yk4E4fJM5XTYuZ', name: 'Michael', category: 'Multilingual', description: 'Old Adult Male, Experienced', accent: 'American', use_case: 'Wise, Experienced' },
  
  // Character & Unique Voices
  { id: 'pqHfZKP75CvOlQylNhV4', name: 'Clyde', category: 'Characters', description: 'Middle-aged Male, War Veteran', accent: 'American', use_case: 'Rough, Veteran' },
  { id: 'iP95p4xoKVk53GoZ742B', name: 'River', category: 'Characters', description: 'Young Adult Male, Confident', accent: 'American', use_case: 'Confident, Smooth' },
  { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian', category: 'Characters', description: 'Middle-aged Male, Authoritative', accent: 'American', use_case: 'Authoritative, Leader' },
  { id: 'ODq5zmih8GrVes37Dizd', name: 'Patrick', category: 'Characters', description: 'Middle-aged Male, Shouty', accent: 'American', use_case: 'Energetic, Loud' },
  { id: 'GBv7mTt0atIp3Br8iCZE', name: 'Thomas', category: 'Characters', description: 'Young Adult Male, Calm', accent: 'American', use_case: 'Meditative, Calm' },
  { id: 'Zlb1dXrM653N07WRdFW3', name: 'Emily', category: 'Characters', description: 'Young Adult Female, Excited', accent: 'American', use_case: 'Excited, Energetic' }
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

// Available models in ElevenLabs
export const AVAILABLE_MODELS = [
  { id: 'eleven_monolingual_v1', name: 'Eleven Monolingual v1', description: 'English only, fastest generation' },
  { id: 'eleven_multilingual_v1', name: 'Eleven Multilingual v1', description: 'Multiple languages, good quality' },
  { id: 'eleven_multilingual_v2', name: 'Eleven Multilingual v2', description: 'Latest multilingual, best quality' },
  { id: 'eleven_turbo_v2', name: 'Eleven Turbo v2', description: 'Fastest generation with good quality' },
  { id: 'eleven_flash_v2', name: 'Eleven Flash v2', description: 'Ultra-fast generation' }
];

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
        model_id: options.model_id || 'eleven_multilingual_v2',
        voice_settings: {
          stability: parseFloat(options.stability) || 0.5,
          similarity_boost: parseFloat(options.similarity_boost) || 0.75,
          style: parseFloat(options.style) || 0.0,
          use_speaker_boost: options.use_speaker_boost !== false
        }
      })
    });

    if (response.ok) {
      const audioBuffer = await response.arrayBuffer();
      return { audio: Buffer.from(audioBuffer), error: null };
    } else {
      const errorData = await response.text();
      throw new Error(`Speech generation failed: ${response.status} - ${errorData}`);
    }
  } catch (error) {
    console.error('Speech generation failed:', error);
    throw new Error(`Speech generation failed: ${error.message}`);
  }
}

// Get user's account information and limits  
export async function getUserAccount() {
  if (!process.env.ELEVENLABS_API_KEY) {
    return { error: 'ElevenLabs API key not configured' };
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/user', {
      headers: {
        'Accept': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      }
    });

    if (response.ok) {
      const data = await response.json();
      return { 
        subscription: data.subscription,
        character_count: data.subscription?.character_count || 0,
        character_limit: data.subscription?.character_limit || 10000,
        error: null 
      };
    } else {
      return { error: 'Failed to fetch user info' };
    }
  } catch (error) {
    console.error('Failed to fetch user info:', error);
    return { error: error.message };
  }
}

// Stream speech generation for real-time playback
export async function generateSpeechStream(text: string, voiceId: string, options: any = {}) {
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
        model_id: options.model_id || 'eleven_multilingual_v2',
        voice_settings: {
          stability: parseFloat(options.stability) || 0.5,
          similarity_boost: parseFloat(options.similarity_boost) || 0.75,
          style: parseFloat(options.style) || 0.0,
          use_speaker_boost: options.use_speaker_boost !== false
        }
      })
    });

    return response;
  } catch (error) {
    console.error('Speech streaming failed:', error);
    throw error;
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

// Get user subscription details
export async function getUserSubscription() {
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

// Professional Voice Cloning with enhanced features
export async function professionalVoiceClone(name: string, description: string, files: Buffer[], labels?: string[]) {
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured');
  }

  try {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    
    if (labels && labels.length > 0) {
      formData.append('labels', JSON.stringify({ usecase: labels }));
    }
    
    files.forEach((file, index) => {
      formData.append('files', new Blob([file]), `voice_sample_${index}.wav`);
    });

    const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      },
      body: formData
    });

    if (response.ok) {
      const result = await response.json();
      return { success: true, voice_id: result.voice_id, message: 'Voice cloned successfully' };
    } else {
      const errorText = await response.text();
      throw new Error(`Voice cloning failed: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    throw new Error(`Voice cloning failed: ${error.message}`);
  }
}

// Sound Effects Generation
export async function generateSoundEffect(prompt: string, duration?: number) {
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured');
  }

  try {
    const requestBody: any = {
      text: prompt,
      duration_seconds: duration || 10,
      prompt_influence: 0.3
    };

    const response = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      },
      body: JSON.stringify(requestBody)
    });

    if (response.ok) {
      const audioBuffer = await response.arrayBuffer();
      return Buffer.from(audioBuffer);
    } else {
      const errorText = await response.text();
      throw new Error(`Sound effect generation failed: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    throw new Error(`Sound effect generation failed: ${error.message}`);
  }
}

// Speech-to-Speech Voice Conversion
export async function speechToSpeech(audioFile: Buffer, targetVoiceId: string, model?: string) {
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured');
  }

  try {
    const formData = new FormData();
    formData.append('audio', new Blob([audioFile]), 'input_audio.wav');
    formData.append('model_id', model || 'eleven_english_sts_v2');
    
    const response = await fetch(`https://api.elevenlabs.io/v1/speech-to-speech/${targetVoiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      },
      body: formData
    });

    if (response.ok) {
      const audioBuffer = await response.arrayBuffer();
      return Buffer.from(audioBuffer);
    } else {
      const errorText = await response.text();
      throw new Error(`Speech-to-speech conversion failed: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    throw new Error(`Speech-to-speech conversion failed: ${error.message}`);
  }
}

// Voice Dubbing (ElevenLabs feature)
export async function dubVoice(audioFile: Buffer, targetVoiceId: string, targetLanguage: string) {
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured');
  }

  try {
    const formData = new FormData();
    formData.append('audio', new Blob([audioFile]), 'input_audio.wav');
    formData.append('target_lang', targetLanguage);
    
    const response = await fetch(`https://api.elevenlabs.io/v1/dubbing`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      },
      body: formData
    });

    if (response.ok) {
      const result = await response.json();
      return { success: true, dubbing_id: result.dubbing_id, message: 'Dubbing started successfully' };
    } else {
      const errorText = await response.text();
      throw new Error(`Voice dubbing failed: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    throw new Error(`Voice dubbing failed: ${error.message}`);
  }
}