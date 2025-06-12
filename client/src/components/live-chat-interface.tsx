import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, User, Bot, Phone, Mail, Clock } from 'lucide-react';

interface LiveChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: number;
  sender: 'user' | 'support' | 'system';
  message: string;
  timestamp: string;
  avatar?: string;
}

export function LiveChatInterface({ isOpen, onClose }: LiveChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: 'system',
      message: 'Welcome to YoBot Support! How can we help you today?',
      timestamp: '2:30 PM'
    },
    {
      id: 2,
      sender: 'support',
      message: 'Hi there! I\'m Sarah from the YoBot support team. I see you\'re exploring our Command Center. What questions do you have?',
      timestamp: '2:31 PM'
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const userMessage: ChatMessage = {
        id: messages.length + 1,
        sender: 'user',
        message: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, userMessage]);
      setNewMessage('');
      setIsTyping(true);

      // Simulate support response
      setTimeout(() => {
        const supportMessage: ChatMessage = {
          id: messages.length + 2,
          sender: 'support',
          message: 'Thanks for your question! Let me help you with that. Our team is here to ensure you get the most out of YoBot\'s automation features.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, supportMessage]);
        setIsTyping(false);
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-black border border-gray-600 p-0" style={{ backgroundColor: '#000000' }}>
        <DialogTitle className="sr-only">YoBot Live Chat Support</DialogTitle>
        {/* Chat Header */}
        <div className="p-4 text-white rounded-t-lg" style={{ backgroundColor: '#0d82da' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base">YoBot Support</h3>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Online • Avg response: 2 min</span>
                </div>
              </div>
            </div>
            <Badge className="bg-green-600 text-white">Live Support</Badge>
          </div>
        </div>

        {/* Support Agent Info */}
        <div className="p-3 border-b" style={{ backgroundColor: '#1a1a1a', borderColor: '#333333' }}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#0d82da' }}>
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-white text-sm font-semibold">Sarah Johnson</div>
              <div className="text-xs" style={{ color: '#c3c3c3' }}>Senior Support Specialist</div>
            </div>
            <div className="ml-auto flex space-x-2">
              <Button 
                size="sm" 
                className="text-white font-bold border-none rounded-md px-3 py-1 hover:opacity-90" 
                style={{ backgroundColor: '#0d82da' }}
              >
                <Phone className="w-3 h-3 mr-1" />
                Call
              </Button>
              <Button 
                size="sm" 
                className="text-white font-bold border-none rounded-md px-3 py-1 hover:opacity-90" 
                style={{ backgroundColor: '#0d82da' }}
              >
                <Mail className="w-3 h-3 mr-1" />
                Email
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 max-h-96 overflow-y-auto p-4 space-y-4" style={{ backgroundColor: '#000000' }}>
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className="max-w-xs lg:max-w-md rounded-lg p-3"
                style={{
                  backgroundColor: message.sender === 'user' 
                    ? '#1a1a1a'
                    : message.sender === 'support'
                    ? '#0d82da'
                    : '#22c55e',
                  color: message.sender === 'user' ? '#c3c3c3' : '#ffffff'
                }}
              >
                <div className="flex items-center space-x-2 mb-1">
                  {message.sender === 'support' && (
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                      <User className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {message.sender === 'system' && (
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <span className="text-xs opacity-75">
                    {message.sender === 'user' ? 'You' : message.sender === 'support' ? 'Sarah' : 'System'}
                  </span>
                  <span className="text-xs opacity-50 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {message.timestamp}
                  </span>
                </div>
                <p className="text-sm leading-relaxed">{message.message}</p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="text-white rounded-lg p-3" style={{ backgroundColor: '#0d82da' }}>
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs opacity-75">Sarah is typing...</span>
                </div>
                <div className="flex space-x-1 mt-2">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t" style={{ backgroundColor: '#000000', borderColor: '#333333' }}>
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 border rounded-lg px-3 py-2 text-white text-sm"
              style={{ 
                backgroundColor: '#1a1a1a', 
                borderColor: '#333333',
                color: '#ffffff'
              }}
            />
            <Button 
              onClick={handleSendMessage}
              className="text-white border-none rounded-full px-3 py-2 hover:opacity-90"
              style={{ backgroundColor: '#0d82da' }}
              disabled={!newMessage.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="mt-2 text-xs text-center" style={{ color: '#c3c3c3' }}>
            Powered by YoBot Live Support • End-to-end encrypted
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}