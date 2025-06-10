import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, User, Clock, ArrowRight } from 'lucide-react';

interface ZendeskTicket {
  id: string;
  subject: string;
  customer: string;
  status: 'new' | 'open' | 'pending' | 'solved';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created: string;
  lastUpdate: string;
  messages: number;
}

export default function ZendeskChatWidget() {
  const [tickets, setTickets] = useState<ZendeskTicket[]>([
    {
      id: 'ZD-001',
      subject: 'Integration not working',
      customer: 'John Smith',
      status: 'open',
      priority: 'high',
      created: '2 hours ago',
      lastUpdate: '15 min ago',
      messages: 3
    },
    {
      id: 'ZD-002', 
      subject: 'Account setup assistance',
      customer: 'Sarah Johnson',
      status: 'new',
      priority: 'normal',
      created: '30 min ago',
      lastUpdate: '30 min ago',
      messages: 1
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'open': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'solved': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 border-red-200';
      case 'high': return 'text-orange-600 border-orange-200';
      case 'normal': return 'text-blue-600 border-blue-200';
      case 'low': return 'text-gray-600 border-gray-200';
      default: return 'text-gray-600 border-gray-200';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="w-5 h-5" />
          Zendesk Support Queue
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tickets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No active tickets
          </div>
        ) : (
          <>
            {tickets.map((ticket) => (
              <div key={ticket.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(ticket.status)}`} />
                    <span className="font-medium text-sm">{ticket.subject}</span>
                  </div>
                  <Badge variant="outline" className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {ticket.customer}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {ticket.lastUpdate}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {ticket.messages} msgs
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">#{ticket.id}</span>
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                    View <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="pt-2 border-t">
              <Button variant="outline" size="sm" className="w-full">
                View All Tickets
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}