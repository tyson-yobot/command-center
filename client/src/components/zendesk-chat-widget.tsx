import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ZendeskChatWidgetProps {
  zendeskDomain?: string;
}

export function ZendeskChatWidget({ zendeskDomain }: ZendeskChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hello! How can I help you today?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: currentMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = currentMessage;
    setCurrentMessage('');
    setIsTyping(true);

    try {
      const aiResponse = await fetch('/api/ai/chat-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          context: messages.slice(-5).map(m => ({ 
            role: m.isUser ? 'user' : 'assistant', 
            content: m.text 
          }))
        })
      });

      const aiResult = await aiResponse.json();

      setTimeout(() => {
        const botResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: aiResult.success && aiResult.response ? aiResult.response : 
                'I can help you with YoBot platform questions, troubleshooting, and feature guidance. What specific issue are you experiencing?',
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botResponse]);
        setIsTyping(false);

        // Create support ticket for complex issues
        if (messageToSend.toLowerCase().includes('error') || 
            messageToSend.toLowerCase().includes('not working') ||
            messageToSend.toLowerCase().includes('broken')) {
          fetch('/api/support/ticket', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subject: `Support Request: ${messageToSend.substring(0, 50)}...`,
              description: `User message: ${messageToSend}\n\nAI Response: ${aiResult.response || 'No AI response'}`,
              priority: 'high',
              clientName: 'Dashboard User',
              email: 'dashboard@yobot.com'
            })
          }).catch(err => console.error('Failed to create support ticket:', err));
        }
      }, 1000);
    } catch (error) {
      setTimeout(() => {
        const errorResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: 'I can assist with YoBot automation features, lead management, voice AI, and technical troubleshooting. What would you like help with?',
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorResponse]);
        setIsTyping(false);
      }, 1500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-600 transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-80 h-96'
      }`}>
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">Live Support</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20 p-1"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 p-4 h-64 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-3 flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg ${
                      message.isUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start mb-3">
                  <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-gray-900 placeholder-gray-500"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim() || isTyping}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}