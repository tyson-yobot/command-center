import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { 
  Bot as BotIcon,
  Brain,
  Headphones,
  Shield,
  Settings,
  Power,
  AlertTriangle,
  Lock,
  Zap,
  Database,
  Wifi,
  Activity,
  Bell,
  RotateCcw,
  Target,
  TrendingUp,
  Users,
  PhoneCall,
  MessageSquare,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Mic,
  MicOff
} from "lucide-react";
import robotHeadPath from "@assets/A_flat_vector_illustration_features_a_robot_face_i.png";
import CriticalAlertOverlay from './critical-alert-overlay';

interface Metrics {
  activeCalls: number;
  aiResponsesToday: number;
  queuedVoiceJobs: number;
  uptime: string;
  systemHealth: number;
  responseTime: string;
  connectedClients: number;
  processingTasks: number;
}

interface Bot {
  status: string;
  uptime: string;
  version: string;
  lastUpdate: string;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  timestamp: string;
  isRead: boolean;
}

interface CrmData {
  totalContacts: number;
  newLeads: number;
  pipelineValue: number;
  conversions: number;
  hoursSaved: number;
  revenueGenerated: number;
}

export default function LiteCommandCenter() {
  const [automationMode, setAutomationMode] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [liveMetrics, setLiveMetrics] = useState({ callsToday: 0, conversions: 0, newLeads: 0 });

  // WebSocket connection for live updates
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "metrics_update") {
        setLiveMetrics((prev) => ({ ...prev, ...msg.data }));
      }
    };

    ws.onerror = () => {
      console.log("WebSocket connection failed, using polling fallback");
    };

    return () => ws.close();
  }, []);

  // Real-time data queries
  const { data: metrics } = useQuery<Metrics>({
    queryKey: ["/api/metrics"],
    refetchInterval: 3000,
  });

  const { data: bot } = useQuery<Bot>({
    queryKey: ["/api/bot"],
    refetchInterval: 5000,
  });

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    refetchInterval: 2000,
  });

  const { data: crmData } = useQuery<CrmData>({
    queryKey: ["/api/crm"],
    refetchInterval: 10000,
  });

  // Simulate processing animation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsProcessing(true);
      setTimeout(() => setIsProcessing(false), 1500);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const urgentNotifications = notifications.filter(n => 
    n.type === "call_escalation" && !n.isRead
  );

  const automationHealth = bot?.status === "active" ? 98 : 45;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <CriticalAlertOverlay />
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-white mb-1 flex items-center">
            <img 
              src={robotHeadPath} 
              alt="YoBot" 
              className={`w-12 h-12 mr-2 inline-block ${isProcessing ? 'animate-pulse' : ''}`}
              style={{ marginTop: '-4px' }}
            />
            LITE
            {isProcessing && (
              <div className="absolute ml-8 -mt-2 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
            )}
          </h1>
          <p className="text-blue-300 text-lg">Simplified AI Automation Control</p>
        </div>
        
        <div className="flex items-center space-x-6">
          {/* System Status */}
          <div className="flex items-center space-x-2 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-2">
            <Wifi className="w-4 h-4 text-green-400" />
            <span className="text-green-300 font-medium">LIVE</span>
          </div>
          
          {/* Voice Control Panel */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
              <Headphones className="w-5 h-5 text-purple-400" />
              <span className="text-white font-medium">Voice AI</span>
              <Switch 
                checked={voiceEnabled} 
                onCheckedChange={setVoiceEnabled}
                className="data-[state=checked]:bg-purple-500"
              />
            </div>
            
            <Button
              className={`${voiceActive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} px-4 py-3 rounded-xl`}
              onClick={() => setVoiceActive(!voiceActive)}
              disabled={!voiceEnabled}
            >
              {voiceActive ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            
            {/* Automation Toggle */}
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-medium">Auto Mode</span>
              <Switch 
                checked={automationMode} 
                onCheckedChange={setAutomationMode}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">Active Calls</p>
                <p className="text-3xl font-bold text-white">{metrics?.activeCalls || 0}</p>
              </div>
              <PhoneCall className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">AI Responses Today</p>
                <p className="text-3xl font-bold text-white">{metrics?.aiResponsesToday || 0}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">System Health</p>
                <p className="text-3xl font-bold text-white">{metrics?.systemHealth || 97}%</p>
              </div>
              <Activity className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">Pipeline Value</p>
                <p className="text-3xl font-bold text-white">${Math.floor((crmData?.pipelineValue || 156000) / 1000)}K</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bot Status */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <BotIcon className="w-5 h-5 text-green-400" />
              <span>Bot Status</span>
              <Badge className={`${bot?.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                {bot?.status === 'active' ? 'ACTIVE' : 'OFFLINE'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <div className="text-green-300 text-sm font-medium">Uptime</div>
                <div className="text-white text-xl font-bold">{bot?.uptime || "99.7%"}</div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <div className="text-blue-300 text-sm font-medium">Response Time</div>
                <div className="text-white text-xl font-bold">{metrics?.responseTime || "0.3s"}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CRM Integration */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <span>CRM Status</span>
              <Badge className="bg-cyan-500/20 text-cyan-300">SYNCED</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
                <div className="text-cyan-300 text-sm font-medium">Total Contacts</div>
                <div className="text-white text-xl font-bold">{crmData?.totalContacts || 1247}</div>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <div className="text-green-300 text-sm font-medium">New Leads</div>
                <div className="text-white text-xl font-bold">{crmData?.newLeads || 23}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-400" />
              <span>Recent Activity</span>
              {urgentNotifications.length > 0 && (
                <Badge className="bg-red-500/20 text-red-300">
                  {urgentNotifications.length} Urgent
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.slice(0, 3).map((notification) => (
              <div key={notification.id} className="flex items-center space-x-3 bg-white/5 rounded-lg p-3">
                <div className={`w-2 h-2 rounded-full ${
                  notification.type === 'call_escalation' ? 'bg-red-400' : 
                  notification.type === 'success' ? 'bg-green-400' : 'bg-blue-400'
                }`}></div>
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">{notification.title}</div>
                  <div className="text-white/60 text-xs">{notification.message}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <Settings className="w-4 h-4 mr-2" />
              System Settings
            </Button>
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              View Reports
            </Button>
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              <Brain className="w-4 h-4 mr-2" />
              AI Training
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}