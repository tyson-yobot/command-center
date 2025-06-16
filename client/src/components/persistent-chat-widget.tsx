import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isTyping?: boolean;
}

interface RAGResponse {
  reply: string;
  confidence: number;
  sources: string[];
  escalationNeeded: boolean;
}

export function PersistentChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize with welcome message
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        content: "Hi! I'm your YoBot support assistant. I can help you with questions about your automation setup, troubleshooting, and system features. How can I assist you today?",
        sender: 'bot',
        timestamp: new Date()
      }]);
    }
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: ChatMessage = {
      id: 'typing',
      content: 'Searching knowledge base...',
      sender: 'bot',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      // Query RAG knowledge system first
      const ragResponse = await fetch('/api/chat/rag-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: inputMessage,
          context: 'yobot_support'
        })
      });

      let botReply = '';
      let escalationNeeded = false;

      if (ragResponse.ok) {
        const ragData: RAGResponse = await ragResponse.json();
        botReply = ragData.reply;
        escalationNeeded = ragData.escalationNeeded;

        // If confidence is low or escalation needed, create Zendesk ticket
        if (ragData.confidence < 0.7 || escalationNeeded) {
          await createZendeskTicket(inputMessage, ragData.reply);
          botReply += "\n\nI've also created a support ticket for you. Our team will follow up shortly for more detailed assistance.";
        }
      } else {
        // Fallback to basic response and create ticket
        botReply = "I'm having trouble accessing our knowledge base right now. Let me create a support ticket for you so our team can assist directly.";
        await createZendeskTicket(inputMessage, "RAG system unavailable");
      }

      // Remove typing indicator and add actual response
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== 'typing');
        return [...filtered, {
          id: (Date.now() + 1).toString(),
          content: botReply,
          sender: 'bot',
          timestamp: new Date()
        }];
      });

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== 'typing');
        return [...filtered, {
          id: (Date.now() + 1).toString(),
          content: "I'm experiencing technical difficulties. I've logged your question and our support team will reach out to you directly.",
          sender: 'bot',
          timestamp: new Date()
        }];
      });
      
      // Create ticket as fallback
      await createZendeskTicket(inputMessage, "Chat widget error - manual follow-up needed");
    } finally {
      setIsLoading(false);
    }
  };

  const createZendeskTicket = async (userQuery: string, ragResponse: string) => {
    try {
      await fetch('/api/zendesk/create-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: `YoBot Support: ${userQuery.substring(0, 50)}...`,
          description: `User Query: ${userQuery}\n\nRAG Response: ${ragResponse}\n\nSource: Chat Widget\nTimestamp: ${new Date().toISOString()}`,
          priority: 'normal',
          tags: ['chat_widget', 'rag_assisted']
        })
      });
    } catch (error) {
      console.error('Failed to create Zendesk ticket:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <>
      {/* Chat Widget Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={toggleChat}
            className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg relative"
          >
            <MessageCircle className="w-6 h-6 text-white" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[450px] h-[500px] flex flex-col">
          <Card className="h-full bg-slate-900/95 backdrop-blur-sm border border-blue-500/30 shadow-2xl">
            {/* Header */}
            <CardHeader className="pb-3 bg-blue-600 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <Bot className="w-5 h-5 mr-2" />
                  YoBot Support
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMinimize}
                    className="text-white hover:bg-blue-700 p-1"
                  >
                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleChat}
                    className="text-white hover:bg-blue-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center text-blue-100 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Connected to RAG Knowledge System
              </div>
            </CardHeader>

            {!isMinimized && (
              <>
                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-800/50">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : message.isTyping
                            ? 'bg-gray-600 text-gray-300 animate-pulse'
                            : 'bg-gray-700 text-white'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {message.sender === 'bot' && (
                            <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          )}
                          {message.sender === 'user' && (
                            <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <span className="text-xs opacity-70 mt-1 block">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Input */}
                <div className="p-4 border-t border-gray-600 bg-slate-900">
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about YoBot features, troubleshooting..."
                      className="flex-1 bg-slate-800 border-gray-600 text-white placeholder-gray-400"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={isLoading || !inputMessage.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Powered by YoBot RAG Knowledge + Zendesk Integration
                  </p>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </>
  );
}