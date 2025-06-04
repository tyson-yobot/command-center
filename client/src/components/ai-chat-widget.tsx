import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Minimize2, Maximize2, Bot, User, Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

interface ChatWidgetProps {
  clientId?: string;
  position?: 'bottom-right' | 'bottom-left' | 'embedded';
  theme?: 'light' | 'dark';
  voiceEnabled?: boolean;
}

// 014 - Frontend AI Chat Box (UI)
export default function AIChatWidget({ 
  clientId = 'default',
  position = 'bottom-right',
  theme = 'light',
  voiceEnabled = true
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (content: string, isVoiceCommand = false) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Check for escalation triggers if it's a voice command
      if (isVoiceCommand) {
        const escalationResponse = await fetch('/api/voice/escalation-trigger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            command: content,
            clientId,
            sessionId: `session_${Date.now()}`,
            userContext: { isVoiceCommand: true }
          })
        });

        const escalationResult = await escalationResponse.json();
        
        if (escalationResult.escalated) {
          const escalationMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            content: `I've escalated your request to a human agent. Escalation ID: ${escalationResult.escalationId}. Someone will assist you shortly.`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, escalationMessage]);
          setIsLoading(false);
          return;
        }
      }

      // Generate AI response (mock for now - replace with actual AI integration)
      const response = await generateAIResponse(content, clientId);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        type: 'bot',
        content: response.text,
        timestamp: new Date(),
        audioUrl: response.audioUrl
      };

      setMessages(prev => [...prev, botMessage]);

      // Auto-play voice response if available
      if (response.audioUrl && voiceEnabled) {
        const audio = new Audio(response.audioUrl);
        audio.play().catch(console.warn);
      }

    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 3).toString(),
        type: 'bot',
        content: 'I apologize, but I encountered an error. Please try again or contact support if the issue persists.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Chat Error",
        description: "Failed to get AI response",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = async (userInput: string, clientId: string) => {
    // This would integrate with your AI service (OpenAI, Claude, etc.)
    const responses = [
      "I understand your question. Let me help you with that.",
      "That's a great question! Here's what I can tell you...",
      "I'm here to assist you. Based on what you've shared...",
      "Let me provide you with some information about that.",
      "I can definitely help you with that inquiry."
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    let audioUrl;
    if (voiceEnabled) {
      try {
        const voiceResponse = await fetch('/api/voice/synthesize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: randomResponse,
            voice: 'Rachel'
          })
        });
        
        if (voiceResponse.ok) {
          const voiceData = await voiceResponse.json();
          audioUrl = `data:audio/mpeg;base64,${voiceData.audio_base64}`;
        }
      } catch (error) {
        console.warn('Voice synthesis failed:', error);
      }
    }

    return {
      text: randomResponse,
      audioUrl
    };
  };

  const startVoiceRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Voice Not Supported",
        description: "Speech recognition is not supported in this browser",
        variant: "destructive"
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    // Extended configuration for longer recording
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    // Set timeout for longer recording session
    let timeout: NodeJS.Timeout;

    recognition.onstart = () => {
      setIsListening(true);
      // Auto-stop after 30 seconds instead of 2-3 seconds
      timeout = setTimeout(() => {
        recognition.stop();
      }, 30000);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      
      if (finalTranscript.trim()) {
        clearTimeout(timeout);
        recognition.stop();
        sendMessage(finalTranscript, true);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      clearTimeout(timeout);
      setIsListening(false);
      
      if (event.error !== 'aborted') {
        toast({
          title: "Voice Recognition Error",
          description: `Could not process voice input: ${event.error}`,
          variant: "destructive"
        });
      }
    };

    recognition.onend = () => {
      clearTimeout(timeout);
      setIsListening(false);
    };

    recognition.start();
  };

  const positionClasses = {
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50',
    'embedded': 'relative'
  };

  const ChatButton = () => (
    <Button
      onClick={() => setIsOpen(true)}
      className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 shadow-lg"
    >
      <MessageCircle className="h-6 w-6 text-white" />
    </Button>
  );

  const ChatWindow = () => (
    <Card className="w-80 h-96 shadow-xl border-0">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            <span className="font-semibold">AI Assistant</span>
            <Badge variant="secondary" className="text-xs">Online</Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 p-0"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-64 px-4">
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs rounded-lg px-3 py-2 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.type === 'bot' && <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                    {message.type === 'user' && <User className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                    <div>
                      <p className="text-sm">{message.content}</p>
                      {message.audioUrl && voiceEnabled && (
                        <audio controls className="mt-2 w-full h-8">
                          <source src={message.audioUrl} type="audio/mpeg" />
                        </audio>
                      )}
                    </div>
                  </div>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>
        
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage(inputValue)}
              disabled={isLoading}
              className="flex-1"
            />
            {voiceEnabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={startVoiceRecording}
                disabled={isLoading || isListening}
                className={isListening ? 'bg-red-100 border-red-300' : ''}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
            <Button
              onClick={() => sendMessage(inputValue)}
              disabled={isLoading || !inputValue.trim()}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (position === 'embedded') {
    return <ChatWindow />;
  }

  return (
    <div className={positionClasses[position]}>
      {isOpen ? <ChatWindow /> : <ChatButton />}
    </div>
  );
}

// Function to inject chat widget programmatically (for external websites)
export function injectChatWidget(clientId: string, options?: Partial<ChatWidgetProps>) {
  const widgetContainer = document.createElement('div');
  widgetContainer.id = 'yobot-chat-widget';
  document.body.appendChild(widgetContainer);

  // This would be replaced with actual React rendering in a real implementation
  console.log(`Chat widget injected for client: ${clientId}`, options);
  
  return widgetContainer;
}