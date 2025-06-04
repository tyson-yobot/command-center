import { useState } from 'react';
import { Search, MessageSquare, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Conversation {
  id: string;
  client: string;
  topic: string;
  timestamp: string;
  status: string;
  priority: 'high' | 'medium' | 'low';
  messages: number;
}

const mockConversations: Conversation[] = [
  {
    id: 'conv-001',
    client: 'Acme Corp',
    topic: 'Lead qualification - $125K opportunity',
    timestamp: '2m ago',
    status: 'Active',
    priority: 'high',
    messages: 12
  },
  {
    id: 'conv-002',
    client: 'TechStart Solutions',
    topic: 'Demo follow-up and pricing discussion',
    timestamp: '15m ago',
    status: 'Awaiting Response',
    priority: 'medium',
    messages: 8
  },
  {
    id: 'conv-003',
    client: 'Innovate LLC',
    topic: 'Support ticket - integration issues',
    timestamp: '1h ago',
    status: 'In Progress',
    priority: 'high',
    messages: 24
  },
  {
    id: 'conv-004',
    client: 'Global Enterprises',
    topic: 'Onboarding process and training',
    timestamp: '3h ago',
    status: 'Completed',
    priority: 'low',
    messages: 15
  }
];

export default function ConversationSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [conversations] = useState<Conversation[]>(mockConversations);

  const filteredConversations = conversations.filter(conv =>
    conv.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      case 'low': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'Awaiting Response': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'In Progress': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Completed': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center text-lg">
          <MessageSquare className="w-5 h-5 mr-3 text-blue-400" />
          Recent Conversations
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search conversations by client or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
          />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className="bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <User className="w-4 h-4 text-blue-400" />
                    <span className="text-white font-medium text-sm">{conversation.client}</span>
                    <Badge className={getPriorityColor(conversation.priority)}>
                      {conversation.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{conversation.topic}</p>
                  <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-400">{conversation.timestamp}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-400">{conversation.messages} messages</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <Badge className={getStatusColor(conversation.status)}>
                    {conversation.status}
                  </Badge>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                    View
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filteredConversations.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-400">No conversations found matching your search.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}