import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Play, Pause, Download, Volume2, Settings, Mic, Square } from 'lucide-react';

interface Voice {
  id: string;
  name: string;
  category: string;
  description: string;
  samples?: number;
}

interface Model {
  model_id: string;
  name: string;
  description: string;
  can_be_finetuned: boolean;
  can_do_text_to_speech: boolean;
  can_do_voice_conversion: boolean;
  can_use_style: boolean;
  can_use_speaker_boost: boolean;
  serves_pro_voices: boolean;
  token_cost_factor: number;
}

export default function ElevenLabsVoiceStudio() {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('eleven_monolingual_v1');
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  
  // Voice settings
  const [stability, setStability] = useState(0.5);
  const [similarityBoost, setSimilarityBoost] = useState(0.5);
  const [style, setStyle] = useState(0.0);
  const [useSpeakerBoost, setUseSpeakerBoost] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    loadVoices();
    loadModels();
    loadUserInfo();
  }, []);

  const loadVoices = async () => {
    try {
      const response = await fetch('/api/elevenlabs/voices');
      const data = await response.json();
      if (data.success) {
        setVoices(data.voices);
        if (data.voices.length > 0 && !selectedVoice) {
          setSelectedVoice(data.voices[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load voices:', error);
    }
  };

  const loadModels = async () => {
    try {
      const response = await fetch('/api/elevenlabs/models');
      const data = await response.json();
      if (data.success) {
        setModels(data.models);
      }
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  };

  const loadUserInfo = async () => {
    try {
      const response = await fetch('/api/elevenlabs/user');
      const data = await response.json();
      if (data.success) {
        setUserInfo(data.user);
      }
    } catch (error) {
      console.error('Failed to load user info:', error);
    }
  };

  const generateSpeech = async () => {
    if (!text.trim() || !selectedVoice) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/elevenlabs/advanced-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceId: selectedVoice.id,
          model: selectedModel,
          stability,
          similarityBoost,
          style,
          useSpeakerBoost
        })
      });

      const data = await response.json();
      if (data.success) {
        // Convert base64 to audio URL
        const audioBlob = new Blob([
          Uint8Array.from(atob(data.audioData), c => c.charCodeAt(0))
        ], { type: 'audio/mpeg' });
        
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      } else {
        alert('Speech generation failed: ' + data.error);
      }
    } catch (error) {
      console.error('Speech generation error:', error);
      alert('Speech generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const downloadAudio = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `elevenlabs_${selectedVoice?.name || 'voice'}_${Date.now()}.mp3`;
      a.click();
    }
  };

  const characterCount = text.length;
  const characterLimit = userInfo?.character_limit || 10000;
  const characterUsed = userInfo?.character_count || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">ElevenLabs Voice Studio</h2>
          <p className="text-slate-400">Professional AI voice synthesis</p>
        </div>
        {userInfo && (
          <div className="text-right">
            <div className="text-sm text-slate-400">Characters Used</div>
            <div className="text-white font-mono">
              {characterUsed.toLocaleString()} / {characterLimit.toLocaleString()}
            </div>
            <Progress 
              value={(characterUsed / characterLimit) * 100} 
              className="w-32 mt-1"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Voice Selection */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Mic className="w-5 h-5 mr-2" />
              Voice Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {voices.map((voice) => (
                <div
                  key={voice.id}
                  onClick={() => setSelectedVoice(voice)}
                  className={`p-3 rounded border cursor-pointer transition-all ${
                    selectedVoice?.id === voice.id
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-white font-medium">{voice.name}</div>
                    <Badge variant="secondary" className="text-xs">
                      {voice.category}
                    </Badge>
                  </div>
                  <div className="text-slate-400 text-sm mt-1">
                    {voice.description}
                  </div>
                  {voice.samples && (
                    <div className="text-slate-500 text-xs mt-1">
                      {voice.samples} samples
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Text Input and Settings */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Text & Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Model Selection */}
            <div>
              <label className="text-white text-sm font-medium">Model</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full mt-1 p-2 bg-slate-700 border border-slate-600 rounded text-white"
              >
                {models.map((model) => (
                  <option key={model.model_id} value={model.model_id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Text Input */}
            <div>
              <label className="text-white text-sm font-medium">
                Text ({characterCount} characters)
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter the text you want to convert to speech..."
                className="w-full mt-1 p-3 bg-slate-700 border border-slate-600 rounded text-white resize-none"
                rows={4}
                maxLength={characterLimit}
              />
            </div>

            {/* Voice Settings */}
            <div className="space-y-3">
              <div>
                <label className="text-white text-sm font-medium">
                  Stability: {stability.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={stability}
                  onChange={(e) => setStability(parseFloat(e.target.value))}
                  className="w-full mt-1"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium">
                  Similarity Boost: {similarityBoost.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={similarityBoost}
                  onChange={(e) => setSimilarityBoost(parseFloat(e.target.value))}
                  className="w-full mt-1"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium">
                  Style: {style.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={style}
                  onChange={(e) => setStyle(parseFloat(e.target.value))}
                  className="w-full mt-1"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="speakerBoost"
                  checked={useSpeakerBoost}
                  onChange={(e) => setUseSpeakerBoost(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="speakerBoost" className="text-white text-sm">
                  Use Speaker Boost
                </label>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={generateSpeech}
              disabled={!text.trim() || !selectedVoice || isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? (
                <>
                  <Square className="w-4 h-4 mr-2 animate-pulse" />
                  Generating...
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 mr-2" />
                  Generate Speech
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Audio Player */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Volume2 className="w-5 h-5 mr-2" />
              Audio Player
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedVoice && (
              <div className="text-center">
                <div className="text-white font-medium">{selectedVoice.name}</div>
                <div className="text-slate-400 text-sm">{selectedVoice.description}</div>
                <Badge className="mt-2">{selectedVoice.category}</Badge>
              </div>
            )}

            {audioUrl && (
              <>
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                
                <div className="flex space-x-2">
                  <Button
                    onClick={playAudio}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 mr-2" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    {isPlaying ? 'Pause' : 'Play'}
                  </Button>
                  
                  <Button
                    onClick={downloadAudio}
                    variant="outline"
                    className="border-slate-600 text-white hover:bg-slate-700"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}

            {!audioUrl && (
              <div className="text-center text-slate-400 py-8">
                <Volume2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Generate speech to play audio</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}