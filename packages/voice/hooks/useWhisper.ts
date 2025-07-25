// packages/voice/hooks/useWhisper.ts

import { useState } from 'react';
import axios from 'axios';

export function useWhisper({ onTranscription }: { onTranscription: (text: string) => void }) {
  const [recording, setRecording] = useState(false);

  const startRecording = async () => {
    setRecording(true);
    const mediaRecorder = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(mediaRecorder);
    const audioChunks: Blob[] = [];

    recorder.ondataavailable = event => audioChunks.push(event.data);
    recorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      const formData = new FormData();
      formData.append('audio', audioBlob);
      try {
        const res = await axios.post('/api/transcribe', formData);
        onTranscription(res.data.transcript);
      } catch (err) {
        console.error('Transcription failed', err);
      } finally {
        setRecording(false);
      }
    };

    recorder.start();
    setTimeout(() => recorder.stop(), 7000);
  };

  const stopRecording = () => {
    setRecording(false);
  };

  return { startRecording, stopRecording, recording };
}
