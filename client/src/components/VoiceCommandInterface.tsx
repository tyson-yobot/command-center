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
      recognitionInstance.maxAlternatives = 1;

      let silenceTimer: NodeJS.Timeout;
      let isManualStop = false;

      recognitionInstance.onstart = () => {
        console.log('Voice recognition started');
        onMicStatusChange('listening');
        isManualStop = false;
        
        // Auto-stop after 30 seconds to prevent indefinite listening
        silenceTimer = setTimeout(() => {
          if (!isManualStop) {
            recognitionInstance.stop();
          }
        }, 30000);
      };

      recognitionInstance.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            
            // Process command when final transcript is available
            if (finalTranscript.trim()) {
              console.log('Final transcript:', finalTranscript);
              processVoiceCommand(finalTranscript.trim());
            }
          } else {
            interimTranscript += transcript;
          }
        }

        onTranscriptChange(finalTranscript + interimTranscript);
        
        // Reset silence timer on speech activity
        if (silenceTimer) {
          clearTimeout(silenceTimer);
          silenceTimer = setTimeout(() => {
            if (!isManualStop) {
              recognitionInstance.stop();
            }
          }, 30000);
        }
      };

      recognitionInstance.onend = () => {
        console.log('Voice recognition ended');
        if (silenceTimer) clearTimeout(silenceTimer);
        onMicStatusChange('idle');
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (silenceTimer) clearTimeout(silenceTimer);
        
        // Auto-restart on network errors
        if (event.error === 'network' && !isManualStop) {
          setTimeout(() => {
            if (micStatus === 'listening') {
              recognitionInstance.start();
            }
          }, 1000);
        } else {
          onMicStatusChange('idle');
        }
      };

      setRecognition(recognitionInstance);
    }
  }, [onMicStatusChange, onTranscriptChange]);

  // Voice command processing function
  const processVoiceCommand = async (command: string) => {
    console.log('Processing voice command:', command);
    onMicStatusChange('processing');
    
    try {
      const response = await fetch('/api/voice-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          command,
          timestamp: new Date().toISOString(),
          userId: 'voice_user'
        })
      });

      const result = await response.json();
      console.log('Voice command result:', result);
      
      // Execute actual command actions
      if (command.toLowerCase().includes('start pipeline')) {
        // Trigger pipeline start
        window.location.hash = '#automation-ops';
      } else if (command.toLowerCase().includes('scrape leads')) {
        // Navigate to lead scraper
        window.location.hash = '#lead-scraper';
      } else if (command.toLowerCase().includes('show dashboard')) {
        // Navigate to dashboard
        window.location.hash = '#';
      }
      
    } catch (error) {
      console.error('Voice command processing failed:', error);
    } finally {
      setTimeout(() => {
        onMicStatusChange('idle');
      }, 1000);
    }
  };

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

  const startListening = async () => {
    if (recognition && micStatus === 'idle') {
      onTranscriptChange('');
      onMicStatusChange('listening');
      
      // Update backend voice status
      try {
        await fetch('/api/voice-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mic_status: 'listening', transcript: '', isProcessing: false })
        });
      } catch (error) {
        console.error('Failed to update voice status:', error);
      }
      
      recognition.start();
    }
  };

  const stopListening = async () => {
    if (recognition && micStatus === 'listening') {
      recognition.stop();
      onMicStatusChange('processing');
      
      // Update backend voice status
      try {
        await fetch('/api/voice-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mic_status: 'idle', transcript: realTimeTranscript, isProcessing: true })
        });
      } catch (error) {
        console.error('Failed to update voice status:', error);
      }
      
      // Simulate processing time
      setTimeout(async () => {
        onMicStatusChange('idle');
        try {
          await fetch('/api/voice-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mic_status: 'idle', transcript: realTimeTranscript, isProcessing: false })
          });
        } catch (error) {
          console.error('Failed to update voice status:', error);
        }
      }, 1000);
    }
  };

  const cancelListening = async () => {
    if (recognition) {
      recognition.abort();
      onMicStatusChange('idle');
      onTranscriptChange('');
      
      // Update backend voice status and send stop signal
      try {
        await fetch('/api/stop-listening', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Failed to stop listening:', error);
      }
    }
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900/95 via-blue-900/80 to-indigo-900/70 backdrop-blur-xl border border-blue-400/50 shadow-2xl shadow-blue-500/20">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Status Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🎤</span>
              <span className="text-blue-300 font-semibold text-lg">Voice Command Center</span>
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

            {/* Enhanced Real-time Transcript Display */}
            {(realTimeTranscript || micStatus === 'listening') && (
              <div className={`rounded-lg p-4 border-2 transition-all duration-300 ${
                micStatus === 'listening' 
                  ? 'bg-green-900/30 border-green-400 shadow-lg shadow-green-400/20' 
                  : 'bg-slate-700 border-slate-500'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-green-400 font-medium flex items-center">
                    <Mic className="w-4 h-4 mr-2" />
                    Live Transcription
                  </p>
                  {micStatus === 'listening' && (
                    <div className="flex space-x-1">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 bg-green-400 rounded-full animate-pulse"
                          style={{ animationDelay: `${i * 0.3}s` }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className={`min-h-[60px] p-3 rounded border ${
                  micStatus === 'listening' 
                    ? 'bg-slate-900/50 border-green-400/30' 
                    : 'bg-slate-800 border-slate-600'
                }`}>
                  {realTimeTranscript ? (
                    <p className="text-white text-lg leading-relaxed">{realTimeTranscript}</p>
                  ) : micStatus === 'listening' ? (
                    <p className="text-slate-400 italic">Listening for speech...</p>
                  ) : (
                    <p className="text-slate-500 text-sm">Transcript will appear here</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Voice Status Display */}
          {micStatus === 'listening' && (
            <div className="text-center mb-4">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Mic className="w-5 h-5 text-green-400 animate-pulse" />
                <span className="text-green-400 font-medium">🎙️ Speak Now...</span>
              </div>
              
              {/* Animated Voice Waveform */}
              <div className="flex items-center justify-center space-x-1 mb-3">
                {[1,2,3,4,5,6,7,8,9,10].map(i => (
                  <div 
                    key={i} 
                    className="w-1 bg-green-400 rounded-full animate-pulse transition-all duration-150" 
                    style={{
                      height: `${Math.random() * 16 + 8}px`,
                      animationDelay: `${i * 80}ms`,
                      animationDuration: `${Math.random() * 0.5 + 0.5}s`
                    }}
                  />
                ))}
              </div>
              
              {/* Real-time Transcript Preview */}
              {realTimeTranscript && (
                <div className="bg-slate-800/50 border border-green-400/30 rounded-lg p-3 mb-3">
                  <div className="text-xs text-slate-400 mb-1">Real-time transcript:</div>
                  <div className="text-green-300 text-sm">"{realTimeTranscript}"</div>
                </div>
              )}
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex justify-center space-x-3">
            {micStatus === 'idle' && (
              <Button
                onClick={startListening}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 shadow-lg"
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
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 shadow-lg"
                  title="Stop and Process"
                >
                  <MicOff className="w-4 h-4 mr-2" />
                  Stop
                </Button>
                <Button
                  onClick={cancelListening}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 shadow-lg"
                  title="Cancel Voice Command"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </>
            )}

            {micStatus === 'processing' && (
              <Button
                disabled
                className="bg-yellow-600 text-white px-6 py-2 opacity-75 shadow-lg"
              >
                <div className="flex items-center">
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
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