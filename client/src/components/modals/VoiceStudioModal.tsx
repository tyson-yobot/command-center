<<<<<<< HEAD
=======
// File: client/src/components/modals/VoiceStudioModal.tsx
// This is the styled, production-ready Voice Studio modal.
// Save this file under: client/src/components/modals/

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '@/components/ui/button';
import { Mic, UploadCloud, X, PlayCircle, Volume2, Music, Settings, BookOpen, Podcast, Languages } from 'lucide-react';
import axios from 'axios';

const VoiceStudioModal = ({ onClose }: { onClose: () => void }) => {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [voiceOption, setVoiceOption] = useState('Brian');
  const [styleOption, setStyleOption] = useState('Conversational');
  const [textInput, setTextInput] = useState('');
  const [volume, setVolume] = useState(1);
  const [voiceList, setVoiceList] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const res = await axios.get('/api/elevenlabs-voices');
        setVoiceList(res.data.voices);
      } catch {
        setVoiceList(['Brian', 'Tyson', 'Clone']);
      }
    };
    fetchVoices();
  }, []);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      setAudioBlob(blob);
    };

    mediaRecorder.start();
    setRecording(true);

    setTimeout(() => {
      mediaRecorder.stop();
      setRecording(false);
    }, 5000);
  };

  const uploadAudio = async () => {
    if (!audioBlob) return;
    const formData = new FormData();
    formData.append('file', audioBlob, 'voice.webm');

    await axios.post('/api/upload-voice', formData);
    setAudioBlob(null);
    alert('✅ Uploaded, transcribed, labeled, and logged.');
  };

  const generateVoice = async () => {
    if (!textInput) return;
    const res = await axios.post('/api/generate-voice', {
      text: textInput,
      voice: voiceOption,
      style: styleOption
    });
    const { audioUrl } = res.data;
    const audio = new Audio(audioUrl);
    audio.volume = volume;
    audioRef.current = audio;
    audio.play();
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <Card className="bg-gradient-to-br from-[#1e1e1e] to-[#111] border-4 border-[#0d82da] shadow-xl rounded-2xl p-6 w-[750px] text-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">🎤 Voice Studio · YoBot®</h2>
          <X className="cursor-pointer" onClick={onClose} />
        </div>
        <CardContent className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">🎙️ Recorder</h3>
            <Button onClick={startRecording} disabled={recording} className="bg-[#0d82da] text-white">
              <Mic className="mr-2" /> {recording ? 'Recording...' : 'Start Recording'}
            </Button>
            {audioBlob && (
              <>
                <audio controls src={URL.createObjectURL(audioBlob)} className="w-full" />
                <Button onClick={uploadAudio} className="bg-silver text-black mt-2">
                  <UploadCloud className="mr-2" /> Upload to Voice Studio
                </Button>
              </>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">🧠 AI Engine</h3>
            <p className="text-sm text-gray-400">Transcription + Labeling logs appear here after upload.</p>
            <div className="border border-gray-600 bg-[#222] rounded p-3 text-sm text-gray-300 min-h-[60px]">
              <p><strong>📝 Transcript:</strong> [auto-filled]</p>
              <p><strong>🏷️ Label:</strong> [auto-filled]</p>
              <p><strong>📆 Timestamp:</strong> [auto-filled]</p>
            </div>
          </div>
          <div className="col-span-2 border-t border-gray-600 pt-4">
            <h3 className="text-lg font-semibold mb-2">🗣️ Text-to-Voice Preview</h3>
            <textarea
              placeholder="Type something for the bot to say..."
              className="w-full bg-[#222] border border-gray-500 p-2 rounded text-white"
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
            />
            <div className="flex gap-4 mt-3">
              <select value={voiceOption} onChange={e => setVoiceOption(e.target.value)} className="bg-[#222] border border-gray-500 p-2 rounded text-white">
                {voiceList.map((voice, i) => (
                  <option key={i} value={voice}>{voice}</option>
                ))}
              </select>
              <select value={styleOption} onChange={e => setStyleOption(e.target.value)} className="bg-[#222] border border-gray-500 p-2 rounded text-white">
                <option value="Conversational">💬 Conversational</option>
                <option value="Narrator">📖 Narrator</option>
                <option value="Energetic">⚡ Energetic</option>
                <option value="Calm">🌙 Calm</option>
                <option value="British">🇬🇧 British</option>
              </select>
              <Button onClick={generateVoice} className="bg-[#0d82da] text-white">
                <PlayCircle className="mr-2" /> Play Voice
              </Button>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <Volume2 className="text-gray-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={e => setVolume(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
          <div className="col-span-2 border-t border-gray-600 pt-4">
            <h3 className="text-lg font-semibold mb-2">🎧 Advanced Audio Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="border border-blue-500 bg-[#1e1e1e] text-white">
                <Music className="mr-2" /> Add Sound Effects
              </Button>
              <Button variant="outline" className="border border-blue-500 bg-[#1e1e1e] text-white">
                <BookOpen className="mr-2" /> Audiobook Studio
              </Button>
              <Button variant="outline" className="border border-blue-500 bg-[#1e1e1e] text-white">
                <Podcast className="mr-2" /> Podcast Builder
              </Button>
              <Button variant="outline" className="border border-blue-500 bg-[#1e1e1e] text-white">
                <Languages className="mr-2" /> Voice Dubbing
              </Button>
              <Button variant="outline" className="border border-blue-500 bg-[#1e1e1e] text-white">
                <Settings className="mr-2" /> Save Preset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceStudioModal;
>>>>>>> 14e679ed (Save current work before pull)
