import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Users, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { useLiveMode } from '@/hooks/useLiveMode';

interface TicketData {
  tickets: Array<{
    id: string;
    subject: string;
    status: string;
    priority: string;
    created: string;
  }>;
  total: number;
  pending: number;
  open: number;
}

export function ZendeskChatWidget() {
  const [isConnected, setIsConnected] = useState(true);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentSystemMode } = useLiveMode();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/zendesk/tickets');
      if (response.ok) {
        const data = await response.json();
        setTicketData(data);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenChat = async () => {
    try {
      const response = await fetch('/api/zendesk/open-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        console.log('YoBot chat opened successfully');
        // Open chat interface or show success message
        alert('Live chat session started. Our support team will assist you shortly.');
      }
    } catch (error) {
      console.error('Failed to open chat:', error);
      alert('Chat service temporarily unavailable. Please try creating a ticket instead.');
    }
  };

  const handleViewTickets = async () => {
    try {
      const response = await fetch('/api/zendesk/tickets');
      if (response.ok) {
        const data = await response.json();
        console.log('Support tickets:', data);
        // Show tickets in modal or navigate to tickets page
        const ticketList = data.tickets?.map(t => `#${t.id}: ${t.subject} (${t.status})`).join('\n') || 'No tickets found';
        alert(`Your Support Tickets:\n\n${ticketList}`);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      alert('Unable to load tickets. Please try again later.');
    }
  };

  const handleCreateTicket = async () => {
    try {
      const subject = prompt('Enter ticket subject:', 'YoBot Support Request');
      const description = prompt('Describe your issue:', 'Issue reported from Command Center');
      
      if (!subject || !description) return;
      
      const response = await fetch('/api/zendesk/create-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          description,
          priority: 'normal'
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Support ticket created successfully');
        alert(`Support ticket created successfully!\nTicket ID: ${result.ticket?.id || 'Generated'}\nOur team will respond shortly.`);
        await fetchTickets(); // Refresh ticket data
      }
    } catch (error) {
      console.error('Failed to create ticket:', error);
      alert('Failed to create ticket. Please try again or contact support directly.');
    }
  };

  return (
    <Card className="bg-blue-900/60 backdrop-blur-sm border border-blue-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          YoBot Support
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge 
              variant={isConnected ? "default" : "secondary"} 
              className={isConnected ? "bg-green-600 text-white" : "bg-red-600 text-white"}
            >
              {isConnected ? (
                <span className="flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </span>
              ) : (
                <span className="flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Disconnected
                </span>
              )}
            </Badge>
            <div className="flex items-center text-white text-sm">
              <Users className="w-4 h-4 mr-1" />
              <span>{loading ? "..." : currentSystemMode === 'test' ? '7' : (ticketData?.total || 0)} Total Tickets</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-slate-800/50 rounded p-2">
              <div className="flex items-center text-orange-300">
                <Clock className="w-4 h-4 mr-1" />
                <span>Pending</span>
              </div>
              <div className="text-white font-semibold">
                {loading ? "..." : currentSystemMode === 'test' ? '3' : (ticketData?.pending || 0)} tickets
              </div>
            </div>
            <div className="bg-slate-800/50 rounded p-2">
              <div className="flex items-center text-green-300">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span>Response Time</span>
              </div>
              <div className="text-white font-semibold">&lt; 2 mins</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <Button
              onClick={handleOpenChat}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-start p-3"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              <span>Open Live Chat</span>
            </Button>
            
            <Button
              onClick={handleViewTickets}
              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-start p-3"
            >
              <Users className="w-4 h-4 mr-2" />
              <span>View All Tickets</span>
            </Button>
            
            <Button
              onClick={handleCreateTicket}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-start p-3"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              <span>Create New Ticket</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}