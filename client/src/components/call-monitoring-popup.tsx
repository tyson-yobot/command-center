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
      <Card className="bg-white/10 backdrop-blur-sm border border-blue-400 w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Call Monitoring Panel
            </div>
            <Button
              onClick={handleRefreshStatus}
              variant="outline"
              size="sm"
              className="text-white border-blue-400 hover:bg-blue-700"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            
            {/* System Services Control Panel */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-blue-400/20">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <Settings className="w-4 h-4 mr-2 text-blue-400" />
                System Services
              </h3>
              <div className="space-y-3">
                {services.map((service) => {
                  const StatusIcon = getStatusIcon(service.status);
                  const IconComponent = service.icon;
                  return (
                    <div key={service.name} className="flex items-center justify-between bg-slate-700/50 rounded p-3">
                      <div className="flex items-center space-x-3">
                        <IconComponent className="w-5 h-5 text-blue-400" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-medium">{service.name}</span>
                            <StatusIcon className={`w-4 h-4 ${getStatusColor(service.status)}`} />
                            <span className={`text-xs font-medium ${getStatusColor(service.status)}`}>
                              {service.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400">
                            Last ping: {service.lastPing}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Tooltip>
                          <TooltipTrigger>
                            <Button
                              onClick={() => handleServiceAction(service.name, 'start')}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white h-8 px-2"
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Start
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{service.description}</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Button
                          onClick={() => handleServiceAction(service.name, 'restart')}
                          size="sm"
                          className="bg-orange-600 hover:bg-orange-700 text-white h-8 px-2"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Restart
                        </Button>
                        
                        <Button
                          onClick={() => handleServiceAction(service.name, 'ping')}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-2"
                        >
                          <Activity className="w-3 h-3 mr-1" />
                          Ping
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-3 border border-blue-400/20">
                <div className="flex items-center text-blue-300 mb-1">
                  <PhoneCall className="w-4 h-4 mr-1" />
                  <span className="text-sm">Active Calls</span>
                </div>
                <div className="text-white font-bold text-xl">
                  {loading ? "..." : callDetails?.activeCalls?.length || 0}
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-3 border border-blue-400/20">
                <div className="flex items-center text-green-300 mb-1">
                  <Clock className="w-4 h-4 mr-1" />
                  <span className="text-sm">Avg Duration</span>
                </div>
                <div className="text-white font-bold text-xl">
                  {loading ? "..." : callDetails?.todayStats?.averageDuration || "0m"}
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-3 border border-blue-400/20">
                <div className="flex items-center text-purple-300 mb-1">
                  <Users className="w-4 h-4 mr-1" />
                  <span className="text-sm">Success Rate</span>
                </div>
                <div className="text-white font-bold text-xl">
                  {loading ? "..." : callDetails?.todayStats?.successRate || "0%"}
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-3 border border-blue-400/20">
                <div className="flex items-center text-yellow-300 mb-1">
                  <PhoneOutgoing className="w-4 h-4 mr-1" />
                  <span className="text-sm">Total Today</span>
                </div>
                <div className="text-white font-bold text-xl">
                  {loading ? "..." : callDetails?.todayStats?.totalCalls || 0}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                onClick={handleSimulateCall}
                className="bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center p-3"
              >
                <TestTube className="w-4 h-4 mr-2" />
                Simulate Test Call
              </Button>
              
              <Button
                onClick={() => setShowCallDetails(!showCallDetails)}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center p-3"
              >
                <Eye className="w-4 h-4 mr-2" />
                {showCallDetails ? 'Hide' : 'View'} Call Reports
              </Button>
              
              <Button
                onClick={() => setShowCallHistory(!showCallHistory)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center p-3"
              >
                <FileText className="w-4 h-4 mr-2" />
                Call Log History
              </Button>
            </div>
          
          {/* Inline Call Details */}
          {showCallDetails && (
            <div className="mt-4 p-4 bg-slate-800/60 rounded-lg border border-blue-400/30">
              <h4 className="text-white font-semibold mb-3 flex items-center">
                <Users className="w-4 h-4 mr-2 text-blue-400" />
                Last 10 Calls
              </h4>
              
              {/* Recent Calls List with Call Back Functionality */}
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {[
                  { name: "Sarah Johnson", phone: "(555) 123-4567", status: "Active", time: "2:15 PM", duration: "8:42", location: "Phoenix, AZ", statusColor: "text-green-400" },
                  { name: "Mike Chen", phone: "(555) 987-6543", status: "On Hold", time: "1:48 PM", duration: "12:18", location: "Austin, TX", statusColor: "text-yellow-400" },
                  { name: "Emily Davis", phone: "(555) 456-7890", status: "Active", time: "2:22 PM", duration: "5:33", location: "Denver, CO", statusColor: "text-green-400" },
                  { name: "Robert Wilson", phone: "(555) 321-9876", status: "Completed", time: "12:35 PM", duration: "15:22", location: "Miami, FL", statusColor: "text-slate-400" },
                  { name: "Lisa Martinez", phone: "(555) 654-3210", status: "Completed", time: "11:58 AM", duration: "9:47", location: "Seattle, WA", statusColor: "text-slate-400" },
                  { name: "David Thompson", phone: "(555) 789-0123", status: "Completed", time: "11:22 AM", duration: "7:15", location: "Chicago, IL", statusColor: "text-slate-400" },
                  { name: "Jennifer Lee", phone: "(555) 234-5678", status: "Missed", time: "10:45 AM", duration: "0:00", location: "Los Angeles, CA", statusColor: "text-red-400" },
                  { name: "Mark Rodriguez", phone: "(555) 345-6789", status: "Completed", time: "10:15 AM", duration: "13:42", location: "Houston, TX", statusColor: "text-slate-400" },
                  { name: "Amanda White", phone: "(555) 456-7890", status: "Completed", time: "9:33 AM", duration: "11:28", location: "Portland, OR", statusColor: "text-slate-400" },
                  { name: "Kevin Brown", phone: "(555) 567-8901", status: "Completed", time: "9:05 AM", duration: "6:52", location: "Atlanta, GA", statusColor: "text-slate-400" }
                ].map((call, index) => (
                  <div key={index} className="bg-slate-700/50 rounded p-3 border border-slate-600 hover:bg-slate-700/70 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="text-white font-medium">{call.name}</div>
                        <div className="text-blue-300 text-sm">{call.phone}</div>
                      </div>
                      <div className="text-right mr-3">
                        <div className={`text-sm font-medium ${call.statusColor}`}>{call.status}</div>
                        <div className="text-slate-300 text-xs">{call.time}</div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button
                          onClick={() => handleCallBack(call.phone, call.name)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 h-auto text-xs"
                          disabled={call.status === "Active" || call.status === "On Hold"}
                        >
                          <PhoneOutgoing className="w-3 h-3 mr-1" />
                          Call
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Duration: {call.duration}</span>
                      <span className="text-slate-300">{call.location}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-3 text-center">
                <Button
                  onClick={() => setShowCallDetails(false)}
                  variant="ghost"
                  className="text-blue-400 hover:bg-blue-400/10 text-sm"
                >
                  Hide Details
                </Button>
              </div>
            </div>
          )}

          {/* Call Log History Panel */}
          {showCallHistory && (
            <div className="bg-slate-800/50 rounded-lg p-4 border border-blue-400/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-blue-400" />
                  Call Log History
                </h3>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    Upload Logs
                  </Button>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Export CSV
                  </Button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="text-left text-gray-300 pb-2">Call ID</th>
                      <th className="text-left text-gray-300 pb-2">Timestamp</th>
                      <th className="text-left text-gray-300 pb-2">Bot Name</th>
                      <th className="text-left text-gray-300 pb-2">Intent</th>
                      <th className="text-left text-gray-300 pb-2">Sentiment</th>
                      <th className="text-left text-gray-300 pb-2">Duration</th>
                      <th className="text-left text-gray-300 pb-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: "CALL-001", timestamp: "2:15 PM", bot: "SalesBot", intent: "Product Inquiry", sentiment: 8.5, duration: "8:42" },
                      { id: "CALL-002", timestamp: "1:48 PM", bot: "SupportBot", intent: "Technical Support", sentiment: 6.2, duration: "12:18" },
                      { id: "CALL-003", timestamp: "1:22 PM", bot: "SalesBot", intent: "Price Quote", sentiment: 9.1, duration: "5:33" },
                      { id: "CALL-004", timestamp: "12:35 PM", bot: "LeadBot", intent: "Lead Qualification", sentiment: 7.8, duration: "15:22" },
                      { id: "CALL-005", timestamp: "11:58 AM", bot: "SupportBot", intent: "Billing Question", sentiment: 5.4, duration: "9:47" }
                    ].map((log, index) => (
                      <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="py-2 text-blue-300 font-mono">{log.id}</td>
                        <td className="py-2 text-white">{log.timestamp}</td>
                        <td className="py-2 text-white">{log.bot}</td>
                        <td className="py-2 text-purple-300">{log.intent}</td>
                        <td className="py-2">
                          <span className={`font-medium ${log.sentiment >= 7 ? 'text-green-400' : log.sentiment >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {log.sentiment}/10
                          </span>
                        </td>
                        <td className="py-2 text-white">{log.duration}</td>
                        <td className="py-2">
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
                              <Download className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-6 px-2 text-xs text-red-400">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}