import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Download, Settings, Volume2, Mic, Square, RotateCcw } from 'lucide-react';

interface Voice {
  id: string;
  name: string;
  category: string;
  description: string;
  samples?: number;
}

interface Model {
  id: string;
  name: string;
  description: string;
}

interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

export default function ElevenLabsVoiceStudioPro() {
  const [text, setText] = useState('Welcome to YoBot\'s advanced voice synthesis. This text will be converted to natural-sounding speech using ElevenLabs technology.');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [selectedModel, setSelectedModel] = useState('eleven_multilingual_v2');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [characterLimit, setCharacterLimit] = useState(10000);
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.0,
    use_speaker_boost: true
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load initial data
  useEffect(() => {
    loadVoices();
    loadModels();
    checkApiStatus();
    setCharacterCount(text.length);
  }, []);

  useEffect(() => {
    setCharacterCount(text.length);
  }, [text]);

  const checkApiStatus = async () => {
    try {
      const response = await fetch('/api/elevenlabs/test');
      const data = await response.json();
      
      if (data.success) {
        setApiStatus('connected');
        if (data.characterLimit) setCharacterLimit(data.characterLimit);
      } else {
        setApiStatus('error');
        setErrorMessage(data.error || 'API connection failed');
      }
    } catch (error) {
      setApiStatus('error');
      setErrorMessage('Failed to connect to ElevenLabs API');
    }
  };

  const loadVoices = async () => {
    try {
      const response = await fetch('/api/elevenlabs/voices');
      const data = await response.json();
      
      if (data.success && data.voices) {
        setVoices(data.voices);
      } else {
        // Fallback to default voices
        setVoices([
          { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', category: 'Premade', description: 'Young Adult Female, Narration' },
          { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', category: 'Premade', description: 'Young Adult Female, Narration' },
          { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', category: 'Premade', description: 'Young Adult Female, Narration' },
          { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', category: 'Premade', description: 'Young Adult Male, Narration' },
          { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', category: 'Premade', description: 'Young Adult Female, Narration' },
          { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', category: 'Premade', description: 'Young Adult Male, Narration' },
          { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', category: 'Premade', description: 'Middle-aged Male, Narration' },
          { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', category: 'Premade', description: 'Middle-aged Male, Narration' },
          { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', category: 'Premade', description: 'Young Adult Male, Narration' }
        ]);
      }
    } catch (error) {
      console.error('Failed to load voices:', error);
    }
  };

  const loadModels = async () => {
    try {
      const response = await fetch('/api/elevenlabs/models');
      const data = await response.json();
      
      if (data.success && data.models) {
        setModels(data.models);
      } else {
        setModels([
          { id: 'eleven_multilingual_v2', name: 'Eleven Multilingual v2', description: 'Latest multilingual, best quality' },
          { id: 'eleven_turbo_v2', name: 'Eleven Turbo v2', description: 'Fastest generation with good quality' },
          { id: 'eleven_flash_v2', name: 'Eleven Flash v2', description: 'Ultra-fast generation' },
          { id: 'eleven_monolingual_v1', name: 'Eleven Monolingual v1', description: 'English only, fastest generation' }
        ]);
      }
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  };

  const generateSpeech = async () => {
    if (!selectedVoice) {
      setErrorMessage('Please select a voice first');
      return;
    }

    if (!text.trim()) {
      setErrorMessage('Please enter some text to generate speech');
      return;
    }

    if (text.length > characterLimit) {
      setErrorMessage(`Text too long. Maximum ${characterLimit} characters allowed.`);
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setErrorMessage('');
    setShowSuccessToast(false);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => Math.min(prev + 10, 90));
    }, 100);

    try {
      const response = await fetch('/api/elevenlabs/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text,
          voice_id: selectedVoice,
          model_id: selectedModel,
          stability: voiceSettings.stability,
          similarity_boost: voiceSettings.similarity_boost,
          style: voiceSettings.style,
          use_speaker_boost: voiceSettings.use_speaker_boost
        })
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.audio) {
          setAudioUrl(data.audio);
          
          // Create new audio element
          if (audioRef.current) {
            audioRef.current.pause();
          }
          
          const audio = new Audio(data.audio);
          audioRef.current = audio;
          
          audio.onended = () => setIsPlaying(false);
          audio.onerror = () => {
            setErrorMessage('Audio playback failed');
            setIsPlaying(false);
          };
          
          // Show success notification
          setShowSuccessToast(true);
          setTimeout(() => {
            setShowSuccessToast(false);
            setGenerationProgress(0);
          }, 3000);
        } else {
          setErrorMessage(data.error || 'Speech generation failed');
        }
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || `Generation failed: ${response.status}`);
      }
    } catch (error) {
      clearInterval(progressInterval);
      setErrorMessage('Network error during speech generation');
      console.error('Speech generation error:', error);
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(0), 1000);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(error => {
        setErrorMessage('Audio playback failed');
        console.error('Playback error:', error);
      });
    }
  };

  const downloadAudio = () => {
    if (!audioUrl) return;

    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `yobot-voice-${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetSettings = () => {
    setVoiceSettings({
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.0,
      use_speaker_boost: true
    });
  };

  const selectedVoiceInfo = voices.find(v => v.id === selectedVoice);
  const selectedModelInfo = models.find(m => m.id === selectedModel);

  // Helper function to get persona icon
  const getPersonaIcon = (voiceName: string, description: string) => {
    const name = voiceName.toLowerCase();
    const desc = description.toLowerCase();
    
    if (desc.includes('female')) {
      if (desc.includes('young')) return '👩'; // Young Female
      if (desc.includes('middle')) return '👩‍💼'; // Professional Female
      return '🎭'; // General Female
    }
    
    if (desc.includes('male')) {
      if (desc.includes('young')) return '👨'; // Young Male
      if (desc.includes('middle')) return '🧔‍♂️'; // Middle-aged Male
      return '👨‍💼'; // Professional Male
    }
    
    return '🎤'; // Default microphone
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg">
      {/* Success Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          🔊 Voice Generated — Ready to Download
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Volume2 className="w-6 h-6 text-purple-600" />
            🎙️ Voice Studio
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Professional voice synthesis workflow
          </p>
          
          {/* Workflow Indicator */}
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
            <span className={selectedVoice ? 'text-green-600 font-medium' : ''}>
              [ Select Persona ]
            </span>
            <span>→</span>
            <span className={text.trim() ? 'text-green-600 font-medium' : ''}>
              [ Enter Text ]
            </span>
            <span>→</span>
            <span className={isGenerating ? 'text-blue-600 font-medium' : audioUrl ? 'text-green-600 font-medium' : ''}>
              [ Generate Voice ]
            </span>
            <span>→</span>
            <span className={audioUrl ? 'text-green-600 font-medium' : 'text-gray-400'}>
              [ Download ]
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge 
            variant={apiStatus === 'connected' ? 'default' : apiStatus === 'error' ? 'destructive' : 'secondary'}
            className="flex items-center gap-1"
          >
            <div className={`w-2 h-2 rounded-full ${
              apiStatus === 'connected' ? 'bg-green-500' : 
              apiStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
            }`} />
            {apiStatus === 'connected' ? 'Connected' : apiStatus === 'error' ? 'Error' : 'Checking'}
          </Badge>
          
          <Badge variant="outline">
            {characterCount} / {characterLimit}
          </Badge>
        </div>
      </div>

      {errorMessage && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <CardContent className="pt-4">
            <p className="text-red-800 dark:text-red-200 text-sm">{errorMessage}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Text Input */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Text Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter the text you want to convert to speech..."
              className="w-full h-40 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              maxLength={characterLimit}
            />
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Characters: {characterCount} / {characterLimit}
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={generateSpeech}
                  disabled={isGenerating || !text.trim() || !selectedVoice || apiStatus !== 'connected'}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Generate Voice
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={downloadAudio}
                  disabled={!audioUrl}
                  variant="outline"
                  className={`${!audioUrl ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-50'}`}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {audioUrl ? 'Download Audio' : 'Generate First'}
                </Button>
              </div>
            </div>

            {generationProgress > 0 && (
              <div className="space-y-2">
                <Progress value={generationProgress} className="w-full" />
                <p className="text-xs text-gray-500 text-center">
                  Generating audio... {generationProgress}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Voice & Model Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Voice Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Voice Persona</label>
              <select
                value={selectedVoice}
                onChange={(e) => {
                  const voice = voices.find(v => v.id === e.target.value);
                  setSelectedVoice(e.target.value);
                  setSelectedVoiceName(voice ? voice.name : '');
                }}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">🔊 No Voice Selected</option>
                {voices.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {getPersonaIcon(voice.name, voice.description)} {voice.name} - {voice.description}
                  </option>
                ))}
              </select>
              
              {/* Voice Selection Feedback */}
              {selectedVoice && selectedVoiceInfo ? (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">
                    ✅ Voice Applied: {selectedVoiceInfo.name}
                  </p>
                  <p className="text-xs text-green-600">
                    {getPersonaIcon(selectedVoiceInfo.name, selectedVoiceInfo.description)} {selectedVoiceInfo.description}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  Select a voice persona to begin
                </p>
              )}
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Model</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
              {selectedModelInfo && (
                <p className="text-xs text-gray-500 mt-1">
                  {selectedModelInfo.description}
                </p>
              )}
            </div>

            {/* Voice Settings */}
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Voice Settings</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetSettings}
                  className="h-6 px-2"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Stability: {voiceSettings.stability.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={voiceSettings.stability}
                  onChange={(e) => setVoiceSettings(prev => ({
                    ...prev,
                    stability: parseFloat(e.target.value)
                  }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Clarity: {voiceSettings.similarity_boost.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={voiceSettings.similarity_boost}
                  onChange={(e) => setVoiceSettings(prev => ({
                    ...prev,
                    similarity_boost: parseFloat(e.target.value)
                  }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Style: {voiceSettings.style.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={voiceSettings.style}
                  onChange={(e) => setVoiceSettings(prev => ({
                    ...prev,
                    style: parseFloat(e.target.value)
                  }))}
                  className="w-full"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="speaker-boost"
                  checked={voiceSettings.use_speaker_boost}
                  onChange={(e) => setVoiceSettings(prev => ({
                    ...prev,
                    use_speaker_boost: e.target.checked
                  }))}
                  className="rounded"
                />
                <label htmlFor="speaker-boost" className="text-xs text-gray-600">
                  Speaker Boost
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audio Preview & Download */}
      {audioUrl && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Volume2 className="w-5 h-5" />
              🎉 Voice Generated Successfully
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button
                onClick={togglePlayback}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-green-300 hover:bg-green-100"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause Preview
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    🔊 Preview Voice
                  </>
                )}
              </Button>

              <Button
                onClick={downloadAudio}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                size="sm"
              >
                <Download className="w-4 h-4" />
                Download Audio
              </Button>

              <div className="flex-1 text-center">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  ✅ Ready • {selectedVoiceInfo?.name} • {selectedModelInfo?.name}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}