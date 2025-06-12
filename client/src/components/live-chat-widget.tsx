import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Send, X, Minimize2, Bot, User } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  message: string;
  timestamp: string;
}

interface LiveChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LiveChatWidget({ isOpen, onClose }: LiveChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'agent',
      message: 'Hello! I\'m your YoBot support assistant. How can I help you today?',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message: currentMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    // Simulate agent response
    setTimeout(() => {
      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        message: getAgentResponse(currentMessage),
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, agentMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const getAgentResponse = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('schedule') || lowerMessage.includes('calendar')) {
      return "I can help you with scheduling! You can use the Smart Calendar widget to view and manage team schedules. Would you like me to guide you through setting up a meeting?";
    } else if (lowerMessage.includes('automation') || lowerMessage.includes('function')) {
      return "For automation questions, I can help you understand how our YoBot functions work. What specific automation are you looking to implement?";
    } else if (lowerMessage.includes('ticket') || lowerMessage.includes('support')) {
      return "I can help you create and track support tickets. You can use the Create New Ticket button or ask me about any existing tickets you have.";
    } else if (lowerMessage.includes('voice') || lowerMessage.includes('elevenlabs')) {
      return "For voice generation, make sure you have your ElevenLabs API key configured. I can help you set up voice personas and test voice generation. What specific voice feature do you need help with?";
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! I'm your YoBot support assistant. I can help you with scheduling, automation functions, support tickets, voice generation, and general platform questions. How can I assist you today?";
    } else if (lowerMessage.includes('api') || lowerMessage.includes('key')) {
      return "For API configuration, please ensure you have the correct API keys set up in your environment variables. I can guide you through the setup process. Which API are you having trouble with?";
    } else {
      return "Thank you for your message. I'm here to help with YoBot platform questions, scheduling, automation, voice generation, and support tickets. Could you provide more details about what you need assistance with?";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className={`bg-slate-800 border-blue-400/50 shadow-2xl shadow-blue-400/20 transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
      }`}>
        <CardHeader className="pb-2 border-b border-blue-400/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center text-lg">
              <MessageCircle className="w-5 h-5 mr-2 text-blue-400" />
              YoBot Live Support
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-blue-400 hover:bg-blue-400/20 h-8 w-8 p-0"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
                className="text-blue-400 hover:bg-blue-400/20 h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[calc(600px-80px)]">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] ${
                    msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      msg.sender === 'user' 
                        ? 'bg-blue-600' 
                        : 'bg-purple-600'
                    }`}>
                      {msg.sender === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className={`rounded-lg p-3 ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-100 border border-slate-600'
                    }`}>
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-slate-700 border border-slate-600 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-blue-400/30 p-4">
              <div className="flex space-x-2">
                <textarea
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  className="flex-1 resize-none bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 max-h-20"
                  rows={1}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}