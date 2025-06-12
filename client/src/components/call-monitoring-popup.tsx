import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { 
  Phone, PhoneCall, Activity, Users, Clock, Play, Square, PhoneOutgoing,
  RefreshCw, Settings, TestTube, Upload, Download, Eye, Trash2,
  AlertCircle, CheckCircle, Zap, Headphones, FileText
} from 'lucide-react';

interface CallDetails {
  activeCalls: Array<{
    id: string;
    client: string;
    duration: string;
    status: string;
    botName?: string;
    intent?: string;
    sentiment?: number;
    transcript?: string;
  }>;
  todayStats: {
    totalCalls: number;
    averageDuration: string;
    successRate: string;
    conversionRate: string;
  };
  recentCalls: Array<{
    time: string;
    client: string;
    outcome: string;
    duration: string;
    callId?: string;
    botName?: string;
    intent?: string;
    sentiment?: number;
  }>;
}

interface Service {
  name: string;
  status: 'active' | 'idle' | 'offline';
  description: string;
  lastPing?: string;
  icon: React.ComponentType<any>;
}

export function CallMonitoringPopup() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [callDetails, setCallDetails] = useState<CallDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCallDetails, setShowCallDetails] = useState(false);
  const [showCallHistory, setShowCallHistory] = useState(false);
  const [services, setServices] = useState<Service[]>([
    {
      name: 'Monitoring Service',
      status: 'idle',
      description: 'Real-time monitoring of bot calls. If inactive, live sessions will not be tracked.',
      lastPing: new Date().toLocaleTimeString(),
      icon: Activity
    },
    {
      name: 'Recording Service', 
      status: 'idle',
      description: 'Audio recording and transcription service for call analysis.',
      lastPing: new Date().toLocaleTimeString(),
      icon: Headphones
    },
    {
      name: 'Analytics Service',
      status: 'idle', 
      description: 'Real-time analytics processing for sentiment and intent analysis.',
      lastPing: new Date().toLocaleTimeString(),
      icon: Zap
    }
  ]);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchCallDetails();
    // Check initial monitoring state
    checkMonitoringStatus();
  }, []);

  const checkMonitoringStatus = async () => {
    try {
      const response = await fetch('/api/call-monitoring/status');
      if (response.ok) {
        const data = await response.json();
        setIsMonitoring(data.isMonitoring || false);
      }
    } catch (error) {
      console.error('Failed to check monitoring status:', error);
      setIsMonitoring(false);
    }
  };

  const handleServiceAction = async (serviceName: string, action: 'start' | 'restart' | 'ping') => {
    try {
      const response = await fetch('/api/call-monitoring/service-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: serviceName, action })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update service status
        setServices(prev => prev.map(service => 
          service.name === serviceName 
            ? { 
                ...service, 
                status: action === 'start' || action === 'restart' ? 'active' : service.status,
                lastPing: new Date().toLocaleTimeString()
              }
            : service
        ));

        toast({
          title: "Service Action Complete",
          description: `${serviceName} ${action} completed successfully`,
        });
      }
    } catch (error) {
      console.error(`Failed to ${action} ${serviceName}:`, error);
      toast({
        title: "Service Action Failed",
        description: `Failed to ${action} ${serviceName}. Please try again.`,
        variant: "destructive"
      });
    }
  };

  const handleSimulateCall = async () => {
    try {
      const response = await fetch('/api/call-monitoring/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'test-call' })
      });

      if (response.ok) {
        await fetchCallDetails(); // Refresh data
        toast({
          title: "Test Call Simulated",
          description: "Generated fake call data for testing purposes",
        });
      }
    } catch (error) {
      console.error('Failed to simulate call:', error);
      toast({
        title: "Simulation Failed",
        description: "Failed to generate test call data",
        variant: "destructive"
      });
    }
  };

  const handleRefreshStatus = async () => {
    setLoading(true);
    await Promise.all([fetchCallDetails(), checkMonitoringStatus()]);
    
    // Update service ping times
    setServices(prev => prev.map(service => ({
      ...service,
      lastPing: new Date().toLocaleTimeString()
    })));
    
    setLoading(false);
    toast({
      title: "Status Refreshed",
      description: "All service statuses have been updated",
    });
  };

  const getStatusColor = (status: Service['status']) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'idle': return 'text-yellow-400';
      case 'offline': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: Service['status']) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'idle': return AlertCircle;
      case 'offline': return AlertCircle;
      default: return AlertCircle;
    }
  };

  const fetchCallDetails = async () => {
    try {
      const response = await fetch('/api/call-monitoring/details');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCallDetails(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch call details:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggleMonitoring = async () => {
    try {
      const action = isMonitoring ? 'stop' : 'start';
      const response = await fetch('/api/call-monitoring/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      
      if (response.ok) {
        const result = await response.json();
        setIsMonitoring(!isMonitoring);
        await fetchCallDetails(); // Refresh data
        
        // Show success message
        alert(`Call monitoring ${action}ed successfully!\n${result.message || ''}`);
      }
    } catch (error) {
      console.error('Failed to toggle monitoring:', error);
      alert('Failed to toggle call monitoring. Please try again.');
    }
  };

  const handleViewDetails = async () => {
    setLoading(true);
    await fetchCallDetails();
    setShowCallDetails(!showCallDetails);
    setLoading(false);
  };

  const handleCallBack = async (phoneNumber: string, name: string) => {
    try {
      const response = await fetch('/api/call-monitoring/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, name })
      });
      
      if (response.ok) {
        alert(`Initiating call back to ${name} at ${phoneNumber}`);
        // Refresh call details after callback
        await fetchCallDetails();
      } else {
        alert('Failed to initiate callback. Please try again.');
      }
    } catch (error) {
      console.error('Failed to initiate callback:', error);
      alert('Failed to initiate callback. Please try again.');
    }
  };

  return (
    <TooltipProvider>
      <Card className="bg-slate-800/80 backdrop-blur-sm border border-blue-500/50 w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Phone className="w-5 h-5 mr-2 text-blue-400" />
            Call Monitoring Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-3">
              <Button 
                onClick={handleRefreshStatus}
                className="bg-green-600 hover:bg-green-700 text-white border border-green-500"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                View Call Records
              </Button>
              <Button 
                onClick={() => {}}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Call Analytics
              </Button>
            </div>
            
            {/* Active Calls List */}
            <div className="bg-slate-700/40 rounded-lg p-4 border border-blue-400/30">
              <h4 className="text-white font-medium mb-3">📞 Active Call Sessions</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {callDetails?.activeCalls?.length > 0 ? callDetails.activeCalls.map((call: any, index: number) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-800/60 rounded border border-blue-400/30"
                  >
                    <div className="flex-1">
                      <div className="text-white font-medium">{call.client || 'Unknown Caller'}</div>
                      <div className="text-slate-400 text-sm flex items-center space-x-2">
                        <span>{call.duration || '0:00'}</span>
                        <span>•</span>
                        <span>{call.status || 'Active'}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-600/30 text-green-400">
                        ✅ Live
                      </span>
                      <Button
                        onClick={() => {}}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1"
                      >
                        🔍 Monitor
                      </Button>
                    </div>
                  </div>
                )) : (
                  <div className="text-slate-400 text-center py-4">
                    No active calls in session
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}