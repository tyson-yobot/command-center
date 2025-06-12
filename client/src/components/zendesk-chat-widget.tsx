import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Users, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react';

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
    <Card className="bg-slate-800/80 backdrop-blur-sm border border-purple-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <MessageCircle className="w-5 h-5 mr-2 text-purple-400" />
          YoBot Support
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-3">
            <Button 
              onClick={handleOpenChat}
              className="bg-green-600 hover:bg-green-700 text-white border border-green-500"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Start Live Chat
            </Button>
            <Button 
              onClick={handleCreateTicket}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Ticket
            </Button>
          </div>
          
          {/* Support Status */}
          <div className="bg-slate-700/40 rounded-lg p-4 border border-purple-400/30">
            <h4 className="text-white font-medium mb-3">🎧 Support Status</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded border border-purple-400/30">
                <div className="flex-1">
                  <div className="text-white font-medium">Team Availability</div>
                  <div className="text-slate-400 text-sm flex items-center space-x-2">
                    <span>Online</span>
                    <span>•</span>
                    <span>Avg response: 2 min</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}