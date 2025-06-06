import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, MicOff, Volume2, VolumeX, Brain, MessageSquare, Trash2, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface VoiceMessage {
  id: string;
  type: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  audioUrl?: string;
  processingTime?: number;
}

interface VoiceMemory {
  conversationId: string;
  context: string[];
  preferences: Record<string, any>;
  lastInteraction: Date;
}

export function VoiceInterfaceEnhanced() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [voiceMemory, setVoiceMemory] = useState<VoiceMemory | null>(null);
  const [selectedVoice, setSelectedVoice] = useState('21m00Tcm4TlvDq8ikWAM');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  // Fetch available voices
  const { data: voicesData } = useQuery({
    queryKey: ['/api/elevenlabs/voices'],
    refetchInterval: 30000
  });

  // Initialize voice memory
  useEffect(() => {
    const initMemory = () => {
      const conversationId = `conv_${Date.now()}`;
      setVoiceMemory({
        conversationId,
        context: [],
        preferences: {},
        lastInteraction: new Date()
      });
    };
    initMemory();
  }, []);

  // Voice generation mutation
  const generateVoiceMutation = useMutation({
    mutationFn: async ({ text, voiceId }: { text: string; voiceId: string }) => {
      const response = await apiRequest('POST', '/api/elevenlabs/generate', {
        text,
        voice_id: voiceId,
        model_id: 'eleven_multilingual_v2'
      });
      return response.blob();
    },
    onSuccess: (audioBlob, variables) => {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
      
      // Update messages with audio URL
      setMessages(prev => prev.map(msg => 
        msg.text === variables.text && msg.type === 'assistant'
          ? { ...msg, audioUrl }
          : msg
      ));
    },
    onError: (error) => {
      toast({
        title: "Voice Generation Failed",
        description: "Could not generate voice response",
        variant: "destructive"
      });
    }
  });

  // AI processing mutation
  const processAIMutation = useMutation({
    mutationFn: async ({ text, context }: { text: string; context: string[] }) => {
      const response = await apiRequest('POST', '/api/ai/process', {
        message: text,
        context: context,
        conversationId: voiceMemory?.conversationId,
        includeMemory: true
      });
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: VoiceMessage = {
        id: `msg_${Date.now()}_assistant`,
        type: 'assistant',
        text: data.response,
        timestamp: new Date(),
        processingTime: data.processingTime
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Update voice memory with new context
      if (voiceMemory) {
        setVoiceMemory(prev => prev ? {
          ...prev,
          context: [...prev.context, data.response].slice(-10), // Keep last 10 interactions
          lastInteraction: new Date()
        } : null);
      }
      
      // Generate voice response
      generateVoiceMutation.mutate({
        text: data.response,
        voiceId: selectedVoice
      });
      
      setIsProcessing(false);
    },
    onError: (error) => {
      setIsProcessing(false);
      toast({
        title: "AI Processing Failed",
        description: "Could not process your message",
        variant: "destructive"
      });
    }
  });

  const startListening = async () => {
    try {
      // Use real speech recognition directly instead of MediaRecorder
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        toast({
          title: "Speech Recognition Not Supported",
          description: "Your browser doesn't support speech recognition",
          variant: "destructive"
        });
        return;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      let finalTranscript = '';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        console.log('Voice recognition result:', finalTranscript || interimTranscript);
      };

      recognition.onend = () => {
        console.log('Voice recognition ended');
        setIsListening(false);
        setIsProcessing(true);
        
        if (finalTranscript.trim()) {
          const userMessage: VoiceMessage = {
            id: `msg_${Date.now()}_user`,
            type: 'user',
            text: finalTranscript.trim(),
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, userMessage]);
          
          // Process with AI including memory context
          const context = voiceMemory?.context || [];
          processAIMutation.mutate({
            text: finalTranscript.trim(),
            context
          });
        } else {
          setIsProcessing(false);
          toast({
            title: "No Speech Detected",
            description: "Please try speaking again",
            variant: "destructive"
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsProcessing(false);
        toast({
          title: "Speech Recognition Error",
          description: `Error: ${event.error}`,
          variant: "destructive"
        });
      };

      recognition.start();
      setIsListening(true);
      console.log('Voice recognition started');
      
      // Stop recognition after 60 seconds maximum
      setTimeout(() => {
        if (recognition && isListening) {
          recognition.stop();
        }
      }, 60000);
      
      toast({
        title: "Listening",
        description: "Recording started - up to 60 seconds. Click stop when finished."
      });
    } catch (error) {
      console.error('Speech recognition error:', error);
      toast({
        title: "Speech Recognition Failed",
        description: "Could not start speech recognition",
        variant: "destructive"
      });
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
      setIsProcessing(true);
    }
  };

  const processAudioInput = async (audioBlob: Blob) => {
    try {
      // Use real speech recognition instead of simulated
      const transcribedText = await performSpeechRecognition();
      
      const userMessage: VoiceMessage = {
        id: `msg_${Date.now()}_user`,
        type: 'user',
        text: transcribedText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Process with AI including memory context
      const context = voiceMemory?.context || [];
      processAIMutation.mutate({
        text: transcribedText,
        context
      });
      
    } catch (error) {
      setIsProcessing(false);
      console.error('Audio processing error:', error);
      toast({
        title: "Speech Recognition Failed",
        description: error instanceof Error ? error.message : "Could not process your audio input",
        variant: "destructive"
      });
    }
  };

  // Real speech recognition using Web Speech API
  const performSpeechRecognition = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      let finalTranscript = '';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        console.log('Voice recognition result:', finalTranscript || interimTranscript);
      };

      recognition.onend = () => {
        console.log('Voice recognition ended');
        if (finalTranscript.trim()) {
          resolve(finalTranscript.trim());
        } else {
          reject(new Error('No speech detected'));
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      recognition.start();
      console.log('Voice recognition started');
      
      // Stop recognition after 60 seconds maximum
      setTimeout(() => {
        recognition.stop();
      }, 60000);
    });
  };

  const clearConversation = () => {
    setMessages([]);
    if (voiceMemory) {
      setVoiceMemory(prev => prev ? {
        ...prev,
        context: [],
        lastInteraction: new Date()
      } : null);
    }
    toast({
      title: "Conversation Cleared",
      description: "Voice memory has been reset"
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Voice Interface with Memory
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isListening ? "destructive" : "secondary"}>
              {isListening ? "Listening" : isProcessing ? "Processing" : "Ready"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={clearConversation}
              disabled={messages.length === 0}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Voice Selection */}
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          <select 
            value={selectedVoice} 
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="bg-background border rounded px-2 py-1 text-sm"
          >
            {voicesData?.voices && voicesData.voices.length > 0 && (
              <>
                {/* My Voices (Custom) */}
                {voicesData.voices.filter((voice: any) => voice.category !== 'premade').length > 0 && (
                  <optgroup label="My Voices">
                    {voicesData.voices
                      .filter((voice: any) => voice.category !== 'premade')
                      .map((voice: any) => (
                        <option key={voice.voice_id} value={voice.voice_id}>
                          {voice.name}
                        </option>
                      ))}
                  </optgroup>
                )}
                
                {/* Premade Voices */}
                {voicesData.voices.filter((voice: any) => voice.category === 'premade').length > 0 && (
                  <optgroup label="ElevenLabs Premade">
                    {voicesData.voices
                      .filter((voice: any) => voice.category === 'premade')
                      .map((voice: any) => (
                        <option key={voice.voice_id} value={voice.voice_id}>
                          {voice.name}
                        </option>
                      ))}
                  </optgroup>
                )}
              </>
            )}
          </select>
          {voicesData && (
            <span className="text-xs text-muted-foreground">
              {voicesData.customCount || 0} custom, {voicesData.premadeCount || 0} premade
            </span>
          )}
        </div>

        {/* Memory Status */}
        {voiceMemory && (
          <div className="bg-muted/50 rounded p-3 text-sm">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4" />
              <span className="font-medium">Memory Status</span>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div>Conversation ID: {voiceMemory.conversationId.slice(-8)}</div>
              <div>Context Items: {voiceMemory.context.length}</div>
              <div>Last Interaction: {formatTime(voiceMemory.lastInteraction)}</div>
            </div>
          </div>
        )}

        {/* Conversation History */}
        <ScrollArea className="flex-1 border rounded-lg p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Start a conversation with your voice assistant</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                      <span>{formatTime(message.timestamp)}</span>
                      {message.audioUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const audio = new Audio(message.audioUrl);
                            audio.play();
                          }}
                        >
                          <Volume2 className="w-3 h-3" />
                        </Button>
                      )}
                      {message.processingTime && (
                        <span>{message.processingTime}ms</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Voice Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={isListening ? "destructive" : "default"}
            size="lg"
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
            className="h-16 w-16 rounded-full"
          >
            {isListening ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </Button>
          
          {isProcessing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
              Processing...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}