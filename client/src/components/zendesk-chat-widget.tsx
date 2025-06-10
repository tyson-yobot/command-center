import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export function ZendeskChatWidget() {
  const [isConnected, setIsConnected] = useState(true);
  const [activeChats, setActiveChats] = useState(2);
  const [pendingTickets, setPendingTickets] = useState(5);
  
  const handleOpenChat = async () => {
    try {
      const response = await fetch('/api/zendesk/open-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        console.log('Zendesk chat opened successfully');
      }
    } catch (error) {
      console.error('Failed to open Zendesk chat:', error);
    }
  };

  const handleViewTickets = async () => {
    try {
      const response = await fetch('/api/zendesk/tickets');
      if (response.ok) {
        const data = await response.json();
        console.log('Zendesk tickets:', data);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    }
  };

  const handleCreateTicket = async () => {
    try {
      const response = await fetch('/api/zendesk/create-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'New Support Request',
          description: 'Support ticket created from Command Center',
          priority: 'normal'
        })
      });
      if (response.ok) {
        console.log('Zendesk ticket created successfully');
        setPendingTickets(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to create ticket:', error);
    }
  };

  return (
    <Card className="bg-blue-900/60 backdrop-blur-sm border border-blue-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          Zendesk Support
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
              <span>{activeChats} Active Chats</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-slate-800/50 rounded p-2">
              <div className="flex items-center text-orange-300">
                <Clock className="w-4 h-4 mr-1" />
                <span>Pending</span>
              </div>
              <div className="text-white font-semibold">{pendingTickets} tickets</div>
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