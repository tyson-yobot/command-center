import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Ticket, Clock, User, AlertCircle, CheckCircle, Filter } from 'lucide-react';

interface TicketData {
  id: string;
  subject: string;
  customer: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  assignedTo: string;
  created: string;
  category?: string;
  description?: string;
}

interface TicketsListPopupProps {
  isOpen: boolean;
  onClose: () => void;
  position?: { x: number; y: number };
}

export default function TicketsListPopup({ isOpen, onClose, position }: TicketsListPopupProps) {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<TicketData[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchTickets();
    }
  }, [isOpen]);

  useEffect(() => {
    filterTickets();
  }, [tickets, statusFilter, priorityFilter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/zendesk/tickets');
      const data = await response.json();
      
      if (data.success) {
        // Generate demo tickets for test mode
        const demoTickets: TicketData[] = [
          {
            id: 'TKT-001',
            subject: 'Integration Setup Help',
            customer: 'Sarah Johnson',
            priority: 'High',
            status: 'Open',
            assignedTo: 'Mike Chen',
            created: new Date(Date.now() - 1800000).toISOString(),
            category: 'Technical Support',
            description: 'Need assistance setting up Slack integration with YoBot automation'
          },
          {
            id: 'TKT-002',
            subject: 'API Key Configuration',
            customer: 'David Rodriguez',
            priority: 'Medium',
            status: 'In Progress',
            assignedTo: 'Lisa Wang',
            created: new Date(Date.now() - 3600000).toISOString(),
            category: 'Configuration',
            description: 'Help configuring API keys for ElevenLabs voice generation'
          },
          {
            id: 'TKT-003',
            subject: 'Voice Persona Setup',
            customer: 'Emily Carter',
            priority: 'Low',
            status: 'Resolved',
            assignedTo: 'Alex Kim',
            created: new Date(Date.now() - 7200000).toISOString(),
            category: 'Voice Setup',
            description: 'Assistance with custom voice persona configuration'
          },
          {
            id: 'TKT-004',
            subject: 'Automation Function Error',
            customer: 'Robert Zhang',
            priority: 'High',
            status: 'Open',
            assignedTo: 'Sarah Kumar',
            created: new Date(Date.now() - 5400000).toISOString(),
            category: 'Bug Report',
            description: 'Function 247 automation failing with timeout errors'
          },
          {
            id: 'TKT-005',
            subject: 'Calendar Integration',
            customer: 'Jennifer Lee',
            priority: 'Medium',
            status: 'In Progress',
            assignedTo: 'Tom Wilson',
            created: new Date(Date.now() - 9000000).toISOString(),
            category: 'Integration',
            description: 'Setting up Google Calendar sync for team scheduling'
          }
        ];
        setTickets(demoTickets);
      } else {
        setTickets([]);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const filterTickets = () => {
    let filtered = tickets;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }
    
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
    }
    
    setFilteredTickets(filtered);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-600';
      case 'Medium': return 'bg-yellow-600';
      case 'Low': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-600';
      case 'In Progress': return 'bg-purple-600';
      case 'Resolved': return 'bg-green-600';
      case 'Closed': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open': return <AlertCircle className="w-3 h-3" />;
      case 'In Progress': return <Clock className="w-3 h-3" />;
      case 'Resolved': return <CheckCircle className="w-3 h-3" />;
      case 'Closed': return <CheckCircle className="w-3 h-3" />;
      default: return <Ticket className="w-3 h-3" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  if (!isOpen) return null;

  const popupStyle = position ? {
    position: 'fixed' as const,
    top: Math.min(position.y, window.innerHeight - 500),
    right: Math.min(window.innerWidth - position.x, 20),
    zIndex: 1000
  } : {
    position: 'fixed' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1000
  };

  return (
    <div style={popupStyle}>
      <Card className="bg-slate-800 border-blue-400/50 shadow-2xl shadow-blue-400/20 w-[500px] max-h-[600px]">
        <CardHeader className="pb-3 border-b border-blue-400/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center text-lg">
              <Ticket className="w-5 h-5 mr-2 text-blue-400" />
              All Support Tickets
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="text-blue-400 hover:bg-blue-400/20 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Filters */}
          <div className="flex space-x-3 mt-3">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-blue-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white"
              >
                <option value="all">All Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white"
            >
              <option value="all">All Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="max-h-[450px] overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-slate-400">
                <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-2"></div>
                Loading tickets...
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                <Ticket className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No tickets found matching your filters</p>
              </div>
            ) : (
              <div className="space-y-2 p-3">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="bg-slate-700/60 border border-slate-600/50 rounded-lg p-4 hover:border-blue-400/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-white font-medium text-sm">{ticket.subject}</h3>
                          <Badge className={`${getPriorityColor(ticket.priority)} text-white text-xs px-2 py-1`}>
                            {ticket.priority}
                          </Badge>
                        </div>
                        <p className="text-slate-300 text-xs mb-2">{ticket.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3 text-blue-400" />
                          <span className="text-slate-400">{ticket.customer}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-slate-400">Assigned to:</span>
                          <span className="text-blue-400">{ticket.assignedTo}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Badge className={`${getStatusColor(ticket.status)} text-white text-xs px-2 py-1 flex items-center space-x-1`}>
                          {getStatusIcon(ticket.status)}
                          <span>{ticket.status}</span>
                        </Badge>
                        <span className="text-slate-500">{formatTimeAgo(ticket.created)}</span>
                      </div>
                    </div>
                    
                    {ticket.category && (
                      <div className="mt-2 pt-2 border-t border-slate-600/30">
                        <Badge variant="outline" className="text-xs border-blue-400/50 text-blue-400">
                          {ticket.category}
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}