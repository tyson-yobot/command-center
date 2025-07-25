// File: client/src/components/modals/VoiceStudioModal.tsx
// ✅ FINAL VERSION — Fully Automated, No Hardcoding (except Airtable Base ID)

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Mic,
  UploadCloud,
  X,
  PlayCircle,
  Volume2,
  Music,
  BookOpen,
  Podcast,
  Languages,
  Trash2,
  Settings,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AIRTABLE_BASE_ID = 'appRt8V3tH4g5Z5if';
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

interface ImportMetaEnv {
  readonly VITE_AIRTABLE_KEY: string;
  readonly VITE_AIRTABLE_VOICE_TABLE: string;
  readonly VITE_AIRTABLE_STYLE_TABLE: string;
  // add other custom env variables here if needed
}

interface VoiceStudioModalProps {
  onClose: () => void;
}

interface VoiceResponse {
  audiourl: string;
}

interface UploadVoiceResponse {
  transcript: string;
  label: string;
  timestamp: string;
  confidence: number;
  wordCount: number;
}

// No need to redeclare ImportMeta interface; Vite already provides env property.

const VoiceStudioModal: React.FC<VoiceStudioModalProps> = ({ onClose }) => {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [voiceOption, setVoiceOption] = useState('');
  const [styleOption, setStyleOption] = useState('');
  const [textInput, setTextInput] = useState('');
  const [volume, setVolume] = useState(1);
  const [voiceList, setVoiceList] = useState<string[]>([]);
  const [styleList, setStyleList] = useState<{ label: string; value: string }[]>([]);
  const [transcript, setTranscript] = useState('');
  const [label, setLabel] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [confidence, setConfidence] = useState<number>(0);
  const [wordCount, setWordCount] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const res = await axios.get<{ voices: string[] }>('/api/elevenlabs-voices');
        setVoiceList(res.data.voices || []);
      } catch {
        setVoiceList([]);
      }
    };

    const fetchStyles = async () => {
      try {
<<<<<<< HEAD
        const res = await axios.get<any>(
          `${AIRTABLE_API_URL}/${import.meta.env.VITE_AIRTABLE_STYLE_TABLE}`,
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_KEY}`,
            },
          }
        );
        const styles = res.data.records.map((r: any) => ({
          label: r.fields['🎚️ Style Label'],
          value: r.fields['🔑 Style Value'],
        }));
=======
        const res = await axios.get('/api/airtable/voice-styles');
        const { styles } = res.data as { styles: { label: string; value: string }[] };
>>>>>>> 6ceca54e23ef93c85c6cc94b0ba290772fdbfea3
        setStyleList(styles);
        if (styles.length > 0) setStyleOption(styles[0].value);
      } catch {
        setStyleList([]);
      }
    };

    fetchVoices();
    fetchStyles();
  }, []);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    mediaRecorder.onstop = () => setAudioBlob(new Blob(chunks, { type: 'audio/webm' }));

    mediaRecorder.start();
    setRecording(true);
    setTimeout(() => {
      mediaRecorder.stop();
      setRecording(false);
    }, 5000);
  };

  const clearState = () => {
    setTranscript('');
    setLabel('');
    setTimestamp('');
    setConfidence(0);
    setWordCount(0);
    setAudioBlob(null);
  };

  const uploadAudio = async () => {
    if (!audioBlob) return;
    const formData = new FormData();
    formData.append('file', audioBlob, 'voice.webm');
    const res = await axios.post<UploadVoiceResponse>('/api/upload-voice', formData);
    const { transcript, label, timestamp, confidence, wordCount } = res.data;
    setTranscript(transcript);
    setLabel(label);
    setTimestamp(timestamp);
    setConfidence(confidence);
    setWordCount(wordCount);

    await axios.post(
      `${AIRTABLE_API_URL}/${import.meta.env.VITE_AIRTABLE_VOICE_TABLE}`,
      {
        records: [
          {
            fields: {
              '📝 Transcript': transcript,
              '🏷️ Label': label,
              '📆 Timestamp': timestamp,
              '🔢 Word Count': wordCount,
              '🎯 Confidence': confidence,
              '🎙️ Voice': voiceOption,
              '🎚️ Style': styleOption,
            },
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    toast.success('✅ Uploaded + Logged');
  };

  const generateVoice = async () => {
    try {
      const res = await axios.post<VoiceResponse>('/api/generate-voice', {
        text: textInput,
        voice: voiceOption,
        style: styleOption,
      });
      const audio = new Audio(res.data.audiourl);
      audio.volume = volume;
      audioRef.current = audio;
      audio.play();
    } catch {
      toast.error('Voice playback failed');
    }
  };

  const savePreset = async () => {
    await axios.post(
      `${AIRTABLE_API_URL}/${import.meta.env.VITE_AIRTABLE_VOICE_TABLE}`,
      {
        records: [
          {
            fields: {
              '🎙️ Voice': voiceOption,
              '🎚️ Style': styleOption,
              'Preset Name': 'Default Preset',
            },
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    toast.success('🎛️ Preset saved');
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
            <Button onClick={clearState} variant="outline" className="mt-2 border border-red-500 bg-[#1e1e1e] text-white">
              <Trash2 className="mr-2" /> Clear State
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">🧠 AI Engine</h3>
            <p className="text-sm text-gray-400">Transcription + Labeling logs appear here after upload.</p>
            <div className="border border-gray-600 bg-[#222] rounded p-3 text-sm text-gray-300 min-h-[60px]">
              <p><strong>📝 Transcript:</strong> {transcript}</p>
              <p><strong>🏷️ Label:</strong> {label}</p>
              <p><strong>📆 Timestamp:</strong> {timestamp}</p>
              <p><strong>🎯 Confidence:</strong> {confidence}</p>
              <p><strong>🔢 Word Count:</strong> {wordCount}</p>
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
                {styleList.map((style, i) => (
                  <option key={i} value={style.value}>{style.label}</option>
                ))}
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
              <Button onClick={savePreset} variant="outline" className="border border-blue-500 bg-[#1e1e1e] text-white">
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
