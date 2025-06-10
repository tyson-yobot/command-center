import { ElevenLabsApi, ElevenLabsApi as ElevenLabs } from 'elevenlabs';

// ElevenLabs API client
let elevenLabs: ElevenLabsApi | null = null;

if (process.env.ELEVENLABS_API_KEY) {
  elevenLabs = new ElevenLabs({ apiKey: process.env.ELEVENLABS_API_KEY });
}

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

// Get all available voices (default + custom)
export async function getAllVoices() {
  if (!elevenLabs) {
    return { voices: DEFAULT_VOICES, error: 'ElevenLabs API key not configured' };
  }

  try {
    const response = await elevenLabs.voices.getAll();
    const voices = response.voices.map(voice => ({
      id: voice.voice_id,
      name: voice.name,
      category: voice.category || 'Custom',
      description: voice.description || '',
      samples: voice.samples?.length || 0,
      settings: voice.settings
    }));

    return { voices, error: null };
  } catch (error) {
    console.error('Failed to fetch voices:', error);
    return { voices: DEFAULT_VOICES, error: error.message };
  }
}

// Generate speech from text
export async function generateSpeech(text: string, voiceId: string = '21m00Tcm4TlvDq8ikWAM', options: any = {}) {
  if (!elevenLabs) {
    throw new Error('ElevenLabs API key not configured');
  }

  try {
    const audio = await elevenLabs.generate({
      voice: voiceId,
      text: text,
      model_id: options.model_id || 'eleven_monolingual_v1',
      voice_settings: {
        stability: options.stability || 0.5,
        similarity_boost: options.similarity_boost || 0.5,
        style: options.style || 0.0,
        use_speaker_boost: options.use_speaker_boost || true
      }
    });

    return { audio, error: null };
  } catch (error) {
    console.error('Speech generation failed:', error);
    throw new Error(`Speech generation failed: ${error.message}`);
  }
}

// Stream speech generation
export async function streamSpeech(text: string, voiceId: string = '21m00Tcm4TlvDq8ikWAM', options: any = {}) {
  if (!elevenLabs) {
    throw new Error('ElevenLabs API key not configured');
  }

  try {
    const stream = await elevenLabs.generate({
      voice: voiceId,
      text: text,
      model_id: options.model_id || 'eleven_monolingual_v1',
      voice_settings: {
        stability: options.stability || 0.5,
        similarity_boost: options.similarity_boost || 0.5,
        style: options.style || 0.0,
        use_speaker_boost: options.use_speaker_boost || true
      },
      stream: true
    });

    return stream;
  } catch (error) {
    console.error('Speech streaming failed:', error);
    throw new Error(`Speech streaming failed: ${error.message}`);
  }
}

// Clone a voice from audio samples
export async function cloneVoice(name: string, description: string, files: Buffer[]) {
  if (!elevenLabs) {
    throw new Error('ElevenLabs API key not configured');
  }

  try {
    const voice = await elevenLabs.voices.clone({
      name,
      description,
      files: files as any
    });

    return { voiceId: voice.voice_id, error: null };
  } catch (error) {
    console.error('Voice cloning failed:', error);
    throw new Error(`Voice cloning failed: ${error.message}`);
  }
}

// Get voice settings
export async function getVoiceSettings(voiceId: string) {
  if (!elevenLabs) {
    throw new Error('ElevenLabs API key not configured');
  }

  try {
    const settings = await elevenLabs.voices.getSettings(voiceId);
    return { settings, error: null };
  } catch (error) {
    console.error('Failed to get voice settings:', error);
    return { settings: null, error: error.message };
  }
}

// Update voice settings
export async function updateVoiceSettings(voiceId: string, settings: any) {
  if (!elevenLabs) {
    throw new Error('ElevenLabs API key not configured');
  }

  try {
    await elevenLabs.voices.editSettings(voiceId, settings);
    return { success: true, error: null };
  } catch (error) {
    console.error('Failed to update voice settings:', error);
    return { success: false, error: error.message };
  }
}

// Get user subscription info
export async function getUserInfo() {
  if (!elevenLabs) {
    return { user: null, error: 'ElevenLabs API key not configured' };
  }

  try {
    const user = await elevenLabs.user.get();
    return { 
      user: {
        subscription: user.subscription,
        character_count: user.character_count,
        character_limit: user.character_limit,
        can_extend_character_limit: user.can_extend_character_limit,
        allowed_to_extend_character_limit: user.allowed_to_extend_character_limit
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Failed to get user info:', error);
    return { user: null, error: error.message };
  }
}

// Get available models
export async function getModels() {
  if (!elevenLabs) {
    return { models: [], error: 'ElevenLabs API key not configured' };
  }

  try {
    const models = await elevenLabs.models.getAll();
    return { models: models || [], error: null };
  } catch (error) {
    console.error('Failed to get models:', error);
    return { models: [], error: error.message };
  }
}

// Delete a custom voice
export async function deleteVoice(voiceId: string) {
  if (!elevenLabs) {
    throw new Error('ElevenLabs API key not configured');
  }

  try {
    await elevenLabs.voices.delete(voiceId);
    return { success: true, error: null };
  } catch (error) {
    console.error('Failed to delete voice:', error);
    return { success: false, error: error.message };
  }
}

// Convert text to speech with advanced options
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
  if (!elevenLabs) {
    throw new Error('ElevenLabs API key not configured');
  }

  const {
    text,
    voiceId = '21m00Tcm4TlvDq8ikWAM',
    model = 'eleven_monolingual_v1',
    stability = 0.5,
    similarityBoost = 0.5,
    style = 0.0,
    useSpeakerBoost = true,
    outputFormat = 'mp3_44100_128'
  } = options;

  try {
    const audio = await elevenLabs.generate({
      voice: voiceId,
      text: text,
      model_id: model,
      voice_settings: {
        stability,
        similarity_boost: similarityBoost,
        style,
        use_speaker_boost: useSpeakerBoost
      },
      output_format: outputFormat as any
    });

    return { audio, error: null };
  } catch (error) {
    console.error('Advanced TTS failed:', error);
    throw new Error(`Advanced TTS failed: ${error.message}`);
  }
}

export { elevenLabs };