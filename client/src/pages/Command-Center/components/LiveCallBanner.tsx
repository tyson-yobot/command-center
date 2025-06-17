import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff, Users, Clock, Activity, Volume2, Mic, MicOff } from 'lucide-react';

interface LiveCall {
  id: string;
  type: 'outbound' | 'inbound';
  contact: string;
  duration: number;
  status: 'connecting' | 'active' | 'on_hold' | 'ending';
  quality: 'excellent' | 'good' | 'poor';
}

interface LiveCallBannerProps {
  isVisible: boolean;
  activeCalls: LiveCall[];
  onEndCall: (callId: string) => void;
  onMuteCall: (callId: string) => void;
}

export function LiveCallBanner({ isVisible, activeCalls, onEndCall, onMuteCall }: LiveCallBannerProps) {
  const [callDurations, setCallDurations] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    if (!activeCalls || activeCalls.length === 0) return;

    const interval = setInterval(() => {
      setCallDurations(prev => {
        const updated = { ...prev };
        activeCalls.forEach(call => {
          if (call.status === 'active') {
            updated[call.id] = (updated[call.id] || call.duration) + 1;
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeCalls]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'connecting': return 'bg-yellow-500';
      case 'active': return 'bg-green-500';
      case 'on_hold': return 'bg-orange-500';
      case 'ending': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'excellent': return <Activity className="w-3 h-3 text-green-400" />;
      case 'good': return <Activity className="w-3 h-3 text-yellow-400" />;
      case 'poor': return <Activity className="w-3 h-3 text-red-400" />;
      default: return <Activity className="w-3 h-3 text-gray-400" />;
    }
  };

  if (!isVisible || activeCalls.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-16 left-0 right-0 z-50 mx-4">
      <Card className="bg-slate-900/95 backdrop-blur-sm border border-green-400 shadow-lg">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-medium text-sm">
                  🟢 Live Now ({activeCalls.length} call{activeCalls.length !== 1 ? 's' : ''} running)
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="border-green-400 text-green-400 text-xs">
                <Users className="w-3 h-3 mr-1" />
                Voice Pipeline Active
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeCalls.map(call => (
              <div key={call.id} className="bg-slate-800/50 rounded-lg p-3 border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(call.status)}`}></div>
                    <span className="text-white text-sm font-medium truncate max-w-32">
                      {call.contact}
                    </span>
                  </div>
                  
                  <Badge className={`text-xs px-2 py-0.5 ${
                    call.type === 'outbound' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {call.type === 'outbound' ? '📞 Out' : '📱 In'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1 text-xs text-slate-300">
                    <Clock className="w-3 h-3" />
                    <span>{formatDuration(callDurations[call.id] || call.duration)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {getQualityIcon(call.quality)}
                    <span className="text-xs text-slate-400 capitalize">{call.quality}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs border-slate-600 hover:bg-slate-700"
                    onClick={() => onMuteCall(call.id)}
                  >
                    <MicOff className="w-3 h-3" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs border-red-600 text-red-400 hover:bg-red-600/20"
                    onClick={() => onEndCall(call.id)}
                  >
                    <PhoneOff className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Pipeline Stats */}
          <div className="mt-3 pt-3 border-t border-slate-600">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center space-x-4">
                <span>Active Calls: {activeCalls.filter(c => c.status === 'active').length}</span>
                <span>Connecting: {activeCalls.filter(c => c.status === 'connecting').length}</span>
                <span>On Hold: {activeCalls.filter(c => c.status === 'on_hold').length}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Activity className="w-3 h-3 text-green-400" />
                <span className="text-green-400">Pipeline Running</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}