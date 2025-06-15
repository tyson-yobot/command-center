import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, X, Volume2 } from 'lucide-react';

interface VoiceCommandInterfaceProps {
  micStatus: 'idle' | 'listening' | 'processing';
  onMicStatusChange: (status: 'idle' | 'listening' | 'processing') => void;
  realTimeTranscript: string;
  onTranscriptChange: (transcript: string) => void;
}

export function VoiceCommandInterface({ 
  micStatus, 
  onMicStatusChange, 
  realTimeTranscript, 
  onTranscriptChange 
}: VoiceCommandInterfaceProps) {
  const [recognition, setRecognition] = useState<any>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [dataArray, setDataArray] = useState<Uint8Array | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Initialize Web Speech API
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        onMicStatusChange('listening');
      };

      recognitionInstance.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        onTranscriptChange(finalTranscript + interimTranscript);
      };

      recognitionInstance.onend = () => {
        onMicStatusChange('idle');
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        onMicStatusChange('idle');
      };

      setRecognition(recognitionInstance);
    }
  }, [onMicStatusChange, onTranscriptChange]);

  // Audio visualization setup
  useEffect(() => {
    if (micStatus === 'listening') {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          const context = new AudioContext();
          const analyserNode = context.createAnalyser();
          const source = context.createMediaStreamSource(stream);
          
          analyserNode.fftSize = 256;
          const bufferLength = analyserNode.frequencyBinCount;
          const dataArrayNew = new Uint8Array(bufferLength);

          source.connect(analyserNode);
          
          setAudioContext(context);
          setAnalyser(analyserNode);
          setDataArray(dataArrayNew);
          
          drawWaveform(analyserNode, dataArrayNew);
        })
        .catch(err => console.error('Error accessing microphone:', err));
    } else {
      if (audioContext) {
        audioContext.close();
        setAudioContext(null);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  }, [micStatus]);

  const drawWaveform = (analyserNode: AnalyserNode, dataArrayNew: Uint8Array) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      analyserNode.getByteFrequencyData(dataArrayNew);
      
      canvasCtx.fillStyle = 'rgb(15, 23, 42)'; // slate-900
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / dataArrayNew.length) * 2.5;
      let barHeight;
      let x = 0;
      
      for (let i = 0; i < dataArrayNew.length; i++) {
        barHeight = (dataArrayNew[i] / 255) * canvas.height * 0.8;
        
        const gradient = canvasCtx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, '#10b981'); // green-500
        gradient.addColorStop(1, '#059669'); // green-600
        
        canvasCtx.fillStyle = gradient;
        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    };
    
    draw();
  };

  const startListening = () => {
    if (recognition && micStatus === 'idle') {
      onTranscriptChange('');
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && micStatus === 'listening') {
      recognition.stop();
      onMicStatusChange('processing');
      
      // Simulate processing time
      setTimeout(() => {
        onMicStatusChange('idle');
      }, 1000);
    }
  };

  const cancelListening = () => {
    if (recognition) {
      recognition.abort();
      onMicStatusChange('idle');
      onTranscriptChange('');
    }
  };

  return (
    <Card className="bg-slate-800/90 backdrop-blur-sm border border-green-400 shadow-lg shadow-green-400/20">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Status Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Volume2 className="w-5 h-5 text-green-400" />
              <span className="text-white font-medium">Voice Command Center</span>
            </div>
            <Badge 
              className={`${
                micStatus === 'listening' ? 'bg-green-600 text-white animate-pulse' :
                micStatus === 'processing' ? 'bg-yellow-600 text-white' :
                'bg-slate-600 text-slate-300'
              }`}
            >
              {micStatus === 'listening' ? '🎙️ Listening...' :
               micStatus === 'processing' ? '⚡ Processing...' :
               '😴 Ready'}
            </Badge>
          </div>

          {/* Main Interface */}
          <div className="text-center space-y-4">
            {micStatus === 'listening' && (
              <div className="space-y-3">
                <p className="text-green-400 font-medium animate-pulse">🎙️ Speak Now...</p>
                
                {/* Audio Waveform */}
                <div className="bg-slate-900 rounded-lg p-4 border border-green-400/30">
                  <canvas 
                    ref={canvasRef}
                    width={300}
                    height={60}
                    className="w-full h-15"
                  />
                </div>
              </div>
            )}

            {micStatus === 'processing' && (
              <div className="space-y-3">
                <p className="text-yellow-400 font-medium">⚡ Processing your command...</p>
                <div className="flex justify-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-8 bg-yellow-400 rounded animate-pulse"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {micStatus === 'idle' && (
              <div className="space-y-3">
                <p className="text-slate-400">Click the microphone to start voice commands</p>
                <div className="flex justify-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 h-4 bg-slate-600 rounded"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Real-time Transcript */}
            {realTimeTranscript && (
              <div className="bg-slate-700 rounded-lg p-3 border border-green-400/30">
                <p className="text-green-400 text-sm font-medium mb-1">Transcript:</p>
                <p className="text-white text-sm">{realTimeTranscript}</p>
              </div>
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center space-x-3">
            {micStatus === 'idle' && (
              <Button
                onClick={startListening}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
                title="Start Voice Commands"
              >
                <Mic className="w-4 h-4 mr-2" />
                Start Listening
              </Button>
            )}

            {micStatus === 'listening' && (
              <>
                <Button
                  onClick={stopListening}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                  title="Stop and Process"
                >
                  <MicOff className="w-4 h-4 mr-2" />
                  Stop
                </Button>
                <Button
                  onClick={cancelListening}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2"
                  title="Cancel Voice Command"
                >
                  <X className="w-4 h-4" />
                </Button>
              </>
            )}

            {micStatus === 'processing' && (
              <Button
                disabled
                className="bg-yellow-600 text-white px-6 py-2 opacity-75"
              >
                Processing...
              </Button>
            )}
          </div>

          {/* Quick Commands */}
          <div className="space-y-2">
            <p className="text-slate-400 text-xs text-center">Try saying:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                '"Show dashboard"',
                '"Generate report"',
                '"Start automation"',
                '"Check system status"'
              ].map(command => (
                <Badge
                  key={command}
                  variant="outline"
                  className="text-xs border-green-400/30 text-green-400 cursor-pointer hover:bg-green-400/10"
                  onClick={() => onTranscriptChange(command.replace(/"/g, ''))}
                >
                  {command}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}