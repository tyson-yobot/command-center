import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Search, Calendar, User, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string;
  created: string;
  lastUpdate: string;
  description: string;
}

interface TicketsListPopupProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
}

const TicketsListPopup: React.FC<TicketsListPopupProps> = ({ isOpen, onClose, position }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Sample tickets data
  const tickets: Ticket[] = [
    {
      id: 'TKT-001',
      subject: 'Voice generation not working properly',
      status: 'open',
      priority: 'high',
      assignee: 'Sarah Chen',
      created: '2025-01-12',
      lastUpdate: '2 hours ago',
      description: 'ElevenLabs integration fails when generating voice samples'
    },
    {
      id: 'TKT-002',
      subject: 'Dashboard metrics showing zero values',
      status: 'in-progress',
      priority: 'urgent',
      assignee: 'Mike Johnson',
      created: '2025-01-11',
      lastUpdate: '1 hour ago',
      description: 'All dashboard metrics display zero despite active data'
    },
    {
      id: 'TKT-003',
      subject: 'Knowledge base upload timeout',
      status: 'resolved',
      priority: 'medium',
      assignee: 'Alex Rodriguez',
      created: '2025-01-10',
      lastUpdate: '30 minutes ago',
      description: 'Large PDF files timeout during knowledge base upload'
    },
    {
      id: 'TKT-004',
      subject: 'Call monitoring integration setup',
      status: 'open',
      priority: 'low',
      assignee: 'Emma Davis',
      created: '2025-01-09',
      lastUpdate: '4 hours ago',
      description: 'Need assistance configuring call monitoring webhooks'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertTriangle className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'closed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'low':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || ticket.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-white dark:bg-gray-900 shadow-2xl max-h-[80vh] flex flex-col">
        <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center space-x-2">
              <AlertTriangle className="w-6 h-6 text-blue-600" />
              <span>Support Tickets</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                        {ticket.subject}
                      </h3>
                      <Badge variant="outline" className="text-sm font-mono">
                        {ticket.id}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {ticket.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">{ticket.assignee}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">{ticket.created}</span>
                      </div>
                      <span className="text-gray-500">Updated {ticket.lastUpdate}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <Badge className={`${getStatusColor(ticket.status)} flex items-center space-x-1`}>
                      {getStatusIcon(ticket.status)}
                      <span className="capitalize">{ticket.status.replace('-', ' ')}</span>
                    </Badge>
                    <Badge className={`${getPriorityColor(ticket.priority)} capitalize`}>
                      {ticket.priority}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredTickets.length === 0 && (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No tickets found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'No support tickets available at the moment.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketsListPopup;