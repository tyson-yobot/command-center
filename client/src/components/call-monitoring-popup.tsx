import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, PhoneOff, Clock, User, MapPin } from 'lucide-react';

interface CallData {
  id: string;
  caller: string;
  number: string;
  duration: string;
  status: 'active' | 'ringing' | 'on-hold' | 'ended';
  location?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

interface CallMonitoringPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CallMonitoringPopup({ isOpen, onClose }: CallMonitoringPopupProps) {
  const [activeCalls, setActiveCalls] = useState<CallData[]>([
    {
      id: '1',
      caller: 'John Smith',
      number: '+1 (555) 123-4567',
      duration: '02:34',
      status: 'active',
      location: 'New York, NY',
      sentiment: 'positive'
    },
    {
      id: '2',
      caller: 'Sarah Johnson', 
      number: '+1 (555) 987-6543',
      duration: '00:45',
      status: 'ringing',
      location: 'Los Angeles, CA',
      sentiment: 'neutral'
    }
  ]);

  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setActiveCalls(prev => prev.map(call => {
          if (call.status === 'active') {
            const [minutes, seconds] = call.duration.split(':').map(Number);
            const totalSeconds = minutes * 60 + seconds + 1;
            const newMinutes = Math.floor(totalSeconds / 60);
            const newSeconds = totalSeconds % 60;
            return {
              ...call,
              duration: `${newMinutes.toString().padStart(2, '0')}:${newSeconds.toString().padStart(2, '0')}`
            };
          }
          return call;
        }));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'ringing': return 'bg-yellow-500';
      case 'on-hold': return 'bg-orange-500';
      case 'ended': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'neutral': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Active Call Monitoring
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
          {activeCalls.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No active calls at the moment
            </div>
          ) : (
            activeCalls.map((call) => (
              <div key={call.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(call.status)} animate-pulse`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{call.caller}</span>
                      </div>
                      <div className="text-sm text-gray-600">{call.number}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className={getSentimentColor(call.sentiment)}>
                    {call.sentiment}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {call.duration}
                    </div>
                    {call.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {call.location}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {call.status === 'active' && (
                      <Button size="sm" variant="outline">
                        <PhoneOff className="w-4 h-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      Monitor
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}