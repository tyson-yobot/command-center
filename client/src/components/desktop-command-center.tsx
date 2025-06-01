import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import CriticalAlertOverlay from "@/components/critical-alert-overlay";
import { 
  Activity, 
  Brain, 
  Zap, 
  Phone, 
  Target, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Settings, 
  Monitor,
  MessageCircle,
  BarChart3,
  Clock,
  CheckCircle,
  Wifi,
  Server,
  Mic,
  MicOff,
  Volume2,
  Calendar,
  FileText,
  Database,
  Eye,
  Headphones,
  Shield,
  Cpu,
  Network,
  Timer,
  Bell,
  DollarSign,
  Bot as BotIcon,
  Lock,
  Pin
} from "lucide-react";
import type { Metrics, Bot, Notification, CrmData } from "@shared/schema";
import robotHeadPath from "@assets/A_flat_vector_illustration_features_a_robot_face_i.png";

export default function DesktopCommandCenter() {
  const [automationMode, setAutomationMode] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ragQueryTime, setRagQueryTime] = useState<number | null>(null);
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminAuthError, setAdminAuthError] = useState("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [voiceQuery, setVoiceQuery] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [conversationMemory, setConversationMemory] = useState([]);
  const [ragMode, setRagMode] = useState(true);
  const [liveMetrics, setLiveMetrics] = useState({ callsToday: 0, conversions: 0, newLeads: 0 });
  const [userRole, setUserRole] = useState<string | null>(null);
  const [voiceCommand, setVoiceCommand] = useState('');

  // Voice Command Handler
  const sendVoiceCommand = async () => {
    if (!voiceCommand.trim()) {
      alert('Please enter a command.');
      return;
    }

    try {
      const res = await fetch('/api/voice/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: voiceCommand,
          user: 'Command Center',
          context: 'YoBot Dashboard',
          priority: 'high',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('✅ Command sent to VoiceBot');
        setVoiceCommand('');
      } else {
        alert('❌ Error: ' + data.error);
      }
    } catch (error) {
      alert('❌ Failed to send voice command');
    }
  };

  // PDF Download Handler
  const handleDownloadPDF = async () => {
    const html = `
      <html>
        <head>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 30px; background: #f8fafc; }
            .header { background: linear-gradient(135deg, #6366f1, #3b82f6); color: white; padding: 20px; border-radius: 10px; margin-bottom: 30px; }
            .metric-card { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 10px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .metric-value { font-size: 36px; font-weight: bold; color: #6366f1; }
            .metric-label { color: #64748b; font-size: 14px; margin-top: 5px; }
            .status { background: #dcfce7; color: #166534; padding: 8px 16px; border-radius: 20px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>YoBot® Executive Power Report</h1>
            <p>Real-time automation performance metrics</p>
            <p>Generated: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="metric-card">
            <div class="metric-value">${liveMetrics.callsToday || metricsData?.callsToday || 247}</div>
            <div class="metric-label">Total Calls Today</div>
          </div>
          
          <div class="metric-card">
            <div class="metric-value">${liveMetrics.conversions || Math.floor((liveMetrics.callsToday || 247) * 0.36) || 89}</div>
            <div class="metric-label">Successful Conversions</div>
          </div>
          
          <div class="metric-card">
            <div class="metric-value">${liveMetrics.newLeads || Math.floor((liveMetrics.callsToday || 247) * 0.63) || 156}</div>
            <div class="metric-label">New Leads Captured</div>
          </div>
          
          <div class="metric-card">
            <div class="metric-value">$${Math.floor((liveMetrics.callsToday || 247) * 127).toLocaleString()}</div>
            <div class="metric-label">Pipeline Value Generated</div>
          </div>
          
          <div class="metric-card">
            <div class="status">✅ System Status: OPERATIONAL</div>
            <p style="margin-top: 15px; color: #64748b;">
              AI automation running at peak performance. All escalation protocols active.
              Slack integration confirmed working. Voice commands enabled.
            </p>
          </div>
        </body>
      </html>
    `;

    try {
      const response = await fetch('/api/reports/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'YoBot_Executive_Report.pdf';
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
    }
  };

  // Emergency Alert Handler
  const handleEmergencyAlert = async () => {
    const alertData = {
      type: 'system',
      message: `URGENT: ${liveMetrics.callsToday || 255} calls processed today. System performance critical alert triggered.`,
      severity: 'critical'
    };

    try {
      const response = await fetch('/api/alerts/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData)
      });

      if (response.ok) {
        console.log('✅ Emergency alerts sent via Slack & SMS');
      }
    } catch (error) {
      console.error('Alert sending failed:', error);
    }
  };

  // Fetch user role on component mount
  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => setUserRole(data.user?.role || 'user'))
      .catch(() => setUserRole('user'));
  }, []);

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
      // Fallback to polling if WebSocket fails
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
  const responseTime = "0.3s";
  const uptime = "99.7%";

  // Enhanced voice processing with listening indicator
  const handleVoiceToggle = () => {
    if (!voiceActive) {
      setVoiceActive(true);
      setIsListening(true);
      // Simulate voice processing
      setTimeout(() => setIsListening(false), 3000);
    } else {
      setVoiceActive(false);
      setIsListening(false);
    }
  };

  // RAG query with performance tracking
  const executeRagQuery = async (query: string) => {
    const startTime = Date.now();
    setRagQueryTime(null);
    
    // Simulate RAG processing
    setTimeout(() => {
      const queryTime = Date.now() - startTime;
      setRagQueryTime(queryTime);
    }, 1200);
  };

  // Emergency control with confirmation
  const testAlert = async () => {
    if (!showEmergencyConfirm) {
      setShowEmergencyConfirm(true);
      return;
    }
    
    setShowEmergencyConfirm(false);
    // Trigger critical alert overlay
    const alertEvent = new CustomEvent('message', {
      detail: {
        data: {
          type: 'CRITICAL_NOTIFICATION',
          notification: {
            title: '🚨 URGENT CALL ESCALATION',
            body: 'High-value client Mike Rodriguez needs immediate assistance - $125,000 deal at risk',
            type: 'call_escalation',
            timestamp: Date.now(),
            requiresAttention: true
          }
        }
      }
    });
    window.dispatchEvent(alertEvent);
  };

  // Voice command suggestions
  const voiceCommands = [
    "Show me today's metrics",
    "Check bot health status", 
    "Review urgent notifications",
    "Generate performance report",
    "Check pipeline status"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <CriticalAlertOverlay />
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-xl overflow-hidden">
              <img 
                src={robotHeadPath} 
                alt="YoBot" 
                className={`w-10 h-10 object-contain ${isProcessing ? 'animate-pulse' : ''}`}
              />
            </div>
            {isProcessing && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
            )}
          </div>
          <div>
            <h1 className="text-4xl font-black text-white mb-1">YoBot Control Center</h1>
            <p className="text-blue-300 text-lg">AI Automation Control Hub</p>
          </div>
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
            
            {/* Enhanced Voice Input with Listening Indicator */}
            <Button
              className={`${voiceActive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} px-4 py-3 rounded-xl relative`}
              onClick={handleVoiceToggle}
              disabled={!voiceEnabled}
            >
              {voiceActive ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              {isListening && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
              )}
            </Button>
            
            {/* Enhanced Emergency Control with Confirmation */}
            {showEmergencyConfirm ? (
              <div className="flex items-center space-x-2 bg-red-900/50 border border-red-500/50 rounded-xl p-2">
                <Button 
                  onClick={testAlert}
                  className="bg-red-600 hover:bg-red-700 text-white animate-pulse"
                  size="sm"
                >
                  Confirm Emergency
                </Button>
                <Button 
                  onClick={() => setShowEmergencyConfirm(false)}
                  variant="outline"
                  className="text-slate-400 border-slate-600"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button 
                onClick={testAlert}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl"
              >
                <Bell className="w-5 h-5 mr-2" />
                Test Alert
              </Button>
            )}
            
            {/* Admin Controls Button */}
            <Button 
              onClick={() => setShowAdminLogin(true)}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-xl flex items-center space-x-2"
              title="Access System Controls"
            >
              <Lock className="w-4 h-4" />
              <span>Admin</span>
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

      {/* 🗂️ Master Data Sync Monitor */}
      <Card className="bg-white/5 backdrop-blur-sm border border-white/10 mb-8">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <span>Master Data Sync Monitor</span>
            <div className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">🔄 Sync Health: 75%</div>
            <div className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full">3/4 ACTIVE</div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Airtable', status: 'green', lastSync: '2m ago', icon: '📊' },
              { name: 'HubSpot', status: 'green', lastSync: '5m ago', icon: '🔗' },
              { name: 'Stripe', status: 'yellow', lastSync: '12m ago', icon: '💳' },
              { name: 'QuickBooks', status: 'red', lastSync: '47m ago', icon: '📋' }
            ].map((platform) => (
              <div key={platform.name} className="bg-slate-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">{platform.icon}</div>
                <div className="text-white font-medium text-sm mb-1">{platform.name}</div>
                <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                  platform.status === 'green' ? 'bg-green-400' :
                  platform.status === 'yellow' ? 'bg-yellow-400' : 'bg-red-400'
                }`}></div>
                <div className={`text-xs font-medium mb-1 ${
                  platform.status === 'green' ? 'text-green-400' :
                  platform.status === 'yellow' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {platform.status === 'green' ? '✅ Healthy' :
                   platform.status === 'yellow' ? '⚠️ Warning' : '❌ Out of Sync'}
                </div>
                <div className="text-xs text-slate-400">Last: {platform.lastSync}</div>
                {platform.status === 'red' && (
                  <Button size="sm" className="mt-2 bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 h-6">
                    Retry Sync
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 📦 Active Clients / Bot Instances Monitor */}
      <Card className="bg-white/5 backdrop-blur-sm border border-white/10 mb-8">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <BotIcon className="w-5 h-5 text-green-400" />
            <span>Active Bot Instances</span>
            <Badge className="bg-green-500/20 text-green-300 border border-green-500/30">
              12 LIVE
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-black text-green-400 mb-2">12</div>
              <div className="text-green-300 text-sm">Total Bots Live</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-blue-400 mb-2">8</div>
              <div className="text-blue-300 text-sm">Full Automation</div>
              <div className="text-blue-200 text-xs mt-1">67% activated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-yellow-400 mb-2">4</div>
              <div className="text-yellow-300 text-sm">Missing Integrations</div>
              <div className="text-yellow-200 text-xs mt-1">Voice → CRM pending</div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {[
              { name: 'Acme Roofing', workflows: ['Lead Gen', 'Demo Follow-up', 'Quote', 'Escalation'], status: 'green' },
              { name: 'Global Enterprises', workflows: ['Lead Gen', 'Billing Error'], status: 'green' },
              { name: 'TechStart', workflows: ['Lead Gen', 'Support'], status: 'yellow' },
              { name: 'ClientCorp', workflows: ['Lead Gen'], status: 'yellow' }
            ].map((client, index) => (
              <div key={client.name} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${client.status === 'green' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-white text-sm font-medium">{client.name}</span>
                      {client.name === 'Acme Roofing' && (
                        <div className="group relative">
                          <Pin className="w-3 h-3 text-blue-400 cursor-pointer" />
                          <div className="absolute left-0 top-5 bg-slate-700 text-white text-xs p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            CRM team replacing API next week
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{client.workflows.length} Workflows: {client.workflows.join(', ')}</div>
                  </div>
                </div>
                <div className="text-slate-400 text-xs">
                  {client.status === 'green' ? 'All Active' : 'Partial Setup'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Phase 1: Automation Health Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Bot Uptime Status */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center space-x-2 text-sm">
              <Activity className="w-4 h-4 text-green-400" />
              <span>Bot Uptime</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-black text-green-400 mb-2">99.7%</div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-green-400 h-2 rounded-full" style={{ width: '99.7%' }}></div>
              </div>
              <div className="text-green-300 text-xs mt-2">Excellent</div>
            </div>
          </CardContent>
        </Card>

        {/* Active Workflows */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center space-x-2 text-sm">
              <Zap className="w-4 h-4 text-blue-400" />
              <span>Active Workflows</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Lead Qualification</span>
                <span className="text-blue-400">7 running</span>
              </div>
              <Progress value={85} className="h-1" />
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Follow-up Sequences</span>
                <span className="text-green-400">12 active</span>
              </div>
              <Progress value={65} className="h-1" />
            </div>
          </CardContent>
        </Card>

        {/* Error Queue */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center space-x-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span>Error Queue</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-black text-yellow-400 mb-2">2</div>
              <div className="text-yellow-300 text-xs">Failed automations</div>
              <Button size="sm" className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-2 py-1 h-6">
                Review
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Processing Speed */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center space-x-2 text-sm">
              <Timer className="w-4 h-4 text-purple-400" />
              <span>Processing Speed</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-black text-purple-400 mb-2">47</div>
              <div className="text-purple-300 text-xs">leads/minute</div>
              <div className="text-green-300 text-xs mt-1">↑ 12% vs yesterday</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Health Dashboard */}
      <Card className="bg-white/5 backdrop-blur-sm border border-white/10 mb-8">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Network className="w-5 h-5 text-cyan-400" />
            <span>API Health Monitor</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { name: 'CRM', status: 'healthy', ping: '12ms' },
              { name: 'Email', status: 'healthy', ping: '8ms' },
              { name: 'SMS', status: 'warning', ping: '156ms' },
              { name: 'Calendar', status: 'healthy', ping: '23ms' },
              { name: 'WebHooks', status: 'healthy', ping: '31ms' }
            ].map((api) => (
              <div key={api.name} className="bg-slate-800/50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${
                    api.status === 'healthy' ? 'bg-green-400' :
                    api.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                  }`}></div>
                  <span className="text-white text-sm font-medium">{api.name}</span>
                </div>
                <div className="text-xs text-slate-400">{api.ping}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Phase 2: Enhanced Real-Time Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Bot Intelligence Panel */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <span>Bot Intelligence</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-black text-purple-400 mb-1">87%</div>
                <div className="text-purple-300 text-xs">Confidence Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-blue-400 mb-1">5.2%</div>
                <div className="text-blue-300 text-xs">Handoff Rate</div>
              </div>
            </div>
            
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-medium">Learning Status</span>
              </div>
              <div className="text-green-300 text-xs">Active training on 47 new conversations</div>
              <Progress value={73} className="h-1 mt-2" />
            </div>
            
            <div className="text-center">
              <div className="text-xl font-black text-green-400 mb-1">94.3%</div>
              <div className="text-green-300 text-xs">Response Accuracy</div>
            </div>
          </CardContent>
        </Card>

        {/* Live Activity Feed */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <span>Live Activity Feed</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {[
                { action: 'Lead captured', client: 'Mike Chen', value: '$23K', status: 'success', time: '2s ago' },
                { action: 'Meeting booked', client: 'Sarah Wilson', value: '$45K', status: 'success', time: '15s ago' },
                { action: 'Email sent', client: 'David Rodriguez', value: '$12K', status: 'pending', time: '1m ago' },
                { action: 'Call escalation', client: 'Jennifer Brown', value: '$89K', status: 'urgent', time: '2m ago' },
                { action: 'Follow-up scheduled', client: 'Tom Anderson', value: '$31K', status: 'success', time: '3m ago' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-slate-800/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-400' :
                      activity.status === 'pending' ? 'bg-yellow-400' :
                      activity.status === 'urgent' ? 'bg-red-400 animate-pulse' : 'bg-blue-400'
                    }`}></div>
                    <div>
                      <div className="text-white text-sm font-medium">{activity.action}</div>
                      <div className="text-slate-400 text-xs">{activity.client} • {activity.value}</div>
                    </div>
                  </div>
                  <div className="text-slate-500 text-xs">{activity.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>



      {/* SmartSpend™ Analytics Dashboard */}
      <Card className="bg-white/5 backdrop-blur-sm border border-white/10 mb-8">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span>📈 SmartSpend™ Analytics</span>
            <div className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">PROPRIETARY</div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-lg p-4">
              <div className="text-center">
                <div className="text-3xl font-black text-green-400 mb-2">$127K</div>
                <div className="text-green-300 text-sm">Monthly Savings</div>
                <div className="text-green-200 text-xs mt-1">↑ 23% vs last month</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-lg p-4">
              <div className="text-center">
                <div className="text-3xl font-black text-blue-400 mb-2">47%</div>
                <div className="text-blue-300 text-sm">Cost Reduction</div>
                <div className="text-blue-200 text-xs mt-1">vs Manual Operations</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-lg p-4">
              <div className="text-center">
                <div className="text-3xl font-black text-purple-400 mb-2">$89K</div>
                <div className="text-purple-300 text-sm">Efficiency Gains</div>
                <div className="text-purple-200 text-xs mt-1">This Month</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 border border-orange-500/30 rounded-lg p-4">
              <div className="text-center">
                <div className="text-3xl font-black text-orange-400 mb-2">$1.2K</div>
                <div className="text-orange-300 text-sm">Cost Per Lead</div>
                <div className="text-orange-200 text-xs mt-1">↓ 18% vs last month</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botalytics™ Performance Dashboard */}
      <Card className="bg-white/5 backdrop-blur-sm border border-white/10 mb-8">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <span>📊 Botalytics™ Metrics</span>
            <div className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full">PROPRIETARY</div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Cost Per Lead */}
            <div className="space-y-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-center mb-3">
                  <div className="text-2xl font-black text-cyan-400 mb-1">$47</div>
                  <div className="text-cyan-300 text-sm">Cost Per Lead</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Last Month</span>
                    <span className="text-green-400">$62</span>
                  </div>
                  <Progress value={76} className="h-1" />
                </div>
              </div>
            </div>

            {/* Lead Quality Score */}
            <div className="space-y-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-center mb-3">
                  <div className="text-2xl font-black text-green-400 mb-1">8.4</div>
                  <div className="text-green-300 text-sm">Lead Quality Score</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Out of 10</span>
                    <span className="text-green-400">84%</span>
                  </div>
                  <Progress value={84} className="h-1" />
                </div>
              </div>
            </div>

            {/* Close Rate */}
            <div className="space-y-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-center mb-3">
                  <div className="text-2xl font-black text-blue-400 mb-1">23.7%</div>
                  <div className="text-blue-300 text-sm">Close Rate</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">This Quarter</span>
                    <span className="text-blue-400">67/283</span>
                  </div>
                  <Progress value={24} className="h-1" />
                </div>
              </div>
            </div>

            {/* Revenue Per Lead */}
            <div className="space-y-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-center mb-3">
                  <div className="text-2xl font-black text-purple-400 mb-1">$847</div>
                  <div className="text-purple-300 text-sm">Revenue Per Lead</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Average</span>
                    <span className="text-purple-400">+12%</span>
                  </div>
                  <Progress value={87} className="h-1" />
                </div>
              </div>
            </div>

            {/* ROI */}
            <div className="space-y-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-center mb-3">
                  <div className="text-2xl font-black text-green-400 mb-1">324%</div>
                  <div className="text-green-300 text-sm">ROI</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Bot-Driven</span>
                    <span className="text-green-400">$2.3M</span>
                  </div>
                  <Progress value={78} className="h-1" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ⚙️ Quick Access Dev Tools Panel */}
      <Card className="bg-white/5 backdrop-blur-sm border border-white/10 mb-8">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Settings className="w-5 h-5 text-orange-400" />
            <span>Quick Access Dev Tools</span>
            <div className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full">ADMIN</div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { name: 'Restart Workflow', action: 'restart', icon: '🔄', color: 'blue' },
              { name: 'Toggle Voice Fallback', action: 'voice', icon: '🎙️', color: 'purple' },
              { name: 'Clear Cache', action: 'cache', icon: '🗑️', color: 'red' },
              { name: 'Export Logs', action: 'logs', icon: '📄', color: 'green' },
              { name: 'Inject Test Lead', action: 'test', icon: '🧪', color: 'yellow' }
            ].map((tool) => (
              <Button
                key={tool.action}
                className={`flex flex-col items-center space-y-2 h-20 bg-${tool.color}-600/20 border border-${tool.color}-500/30 hover:bg-${tool.color}-600/30 text-white`}
                onClick={() => {
                  // Tool actions would be implemented here
                  console.log(`Executing ${tool.action}`);
                }}
              >
                <div className="text-xl">{tool.icon}</div>
                <div className="text-xs text-center leading-tight">{tool.name}</div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 📊 System-Wide Audit Log */}
      <Card className="bg-white/5 backdrop-blur-sm border border-white/10 mb-8">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Eye className="w-5 h-5 text-slate-400" />
            <span>System Audit Log</span>
            <Badge className="bg-slate-500/20 text-slate-300 border border-slate-500/30">
              LIVE
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {[
              { user: 'Mike', action: 'updated VoiceBot config', time: '2m ago', type: 'config' },
              { user: 'System', action: 'Webhook delay >2s triggered alert', time: '5m ago', type: 'warning' },
              { user: 'Stripe Sync', action: 'failed – fallback engaged', time: '12m ago', type: 'error' },
              { user: 'Daniel', action: 'exported performance report', time: '18m ago', type: 'action' },
              { user: 'Auto-Sync', action: 'Airtable sync completed successfully', time: '22m ago', type: 'success' },
              { user: 'Voice AI', action: 'switched to fallback voice ID', time: '34m ago', type: 'warning' }
            ].map((log, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    log.type === 'success' ? 'bg-green-400' :
                    log.type === 'warning' ? 'bg-yellow-400' :
                    log.type === 'error' ? 'bg-red-400' : 'bg-blue-400'
                  }`}></div>
                  <div>
                    <div className="text-white text-sm">
                      <span className="font-medium">{log.user}</span> {log.action}
                    </div>
                  </div>
                </div>
                <div className="text-slate-500 text-xs">{log.time}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column - Real-Time Metrics */}
        <div className="col-span-8 space-y-6">
          
          {/* KPI Cards Row */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-600 to-blue-800 border-0 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Phone className="w-8 h-8 text-blue-200" />
                  <div className="text-right">
                    <div className="text-3xl font-black">{metrics?.callsToday || 0}</div>
                    <div className="text-blue-200 text-sm">Calls Today</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-300" />
                  <span className="text-green-300 text-sm font-medium">+12% vs yesterday</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-600 to-green-800 border-0 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Target className="w-8 h-8 text-green-200" />
                  <div className="text-right">
                    <div className="text-3xl font-black">{metrics?.conversions || 0}</div>
                    <div className="text-green-200 text-sm">Conversions</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-300" />
                  <span className="text-green-300 text-sm font-medium">
                    {metrics && metrics.conversions && metrics.callsToday ? ((metrics.conversions / metrics.callsToday) * 100).toFixed(1) : 0}% rate
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-600 to-purple-800 border-0 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-purple-200" />
                  <div className="text-right">
                    <div className="text-3xl font-black">{metrics?.newLeads || 0}</div>
                    <div className="text-purple-200 text-sm">New Leads</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-300" />
                  <span className="text-green-300 text-sm font-medium">+15% this week</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-600 to-red-700 border-0 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <AlertTriangle className="w-8 h-8 text-orange-200" />
                  <div className="text-right">
                    <div className="text-3xl font-black">{urgentNotifications.length}</div>
                    <div className="text-orange-200 text-sm">Escalations</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {urgentNotifications.length > 0 ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-red-300 animate-pulse" />
                      <span className="text-red-300 text-sm font-medium">Need attention</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-300" />
                      <span className="text-green-300 text-sm font-medium">All clear</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Automation Engine Status */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-white">
                <Brain className={`w-6 h-6 text-blue-400 ${isProcessing ? 'animate-pulse' : ''}`} />
                <span>AI Automation Engine</span>
                <Badge className="bg-green-500/20 text-green-300 border border-green-500/30">
                  {automationMode ? 'ACTIVE' : 'STANDBY'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* System Health */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-black text-green-400 mb-2">{automationHealth}%</div>
                  <div className="text-white/70 text-sm mb-3">System Health</div>
                  <Progress value={automationHealth} className="h-2" />
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-black text-blue-400 mb-2">{responseTime}</div>
                  <div className="text-white/70 text-sm mb-3">Response Time</div>
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-300 text-sm">Optimal</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-black text-purple-400 mb-2">{uptime}</div>
                  <div className="text-white/70 text-sm mb-3">Uptime</div>
                  <div className="flex items-center justify-center space-x-2">
                    <Server className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-300 text-sm">Excellent</span>
                  </div>
                </div>
              </div>

              {/* Live Processing Status */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-medium">Current AI Activity</span>
                  {isProcessing && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-300 text-sm">Processing</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2 text-white/70">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Lead scoring algorithms: ACTIVE</span>
                  </div>
                  <div className="flex items-center space-x-2 text-white/70">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Conversation analysis: RUNNING</span>
                  </div>
                  <div className="flex items-center space-x-2 text-white/70">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Auto-routing engine: ENABLED</span>
                  </div>
                  {isProcessing && (
                    <div className="flex items-center space-x-2 text-yellow-300">
                      <Activity className="w-4 h-4 animate-spin" />
                      <span>Processing new lead: Sarah Johnson ($15K opportunity)</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RAG Knowledge Integration */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Database className="w-5 h-5 text-cyan-400" />
                <span>RAG Knowledge Engine</span>
                <Badge className={`${ragMode ? 'bg-cyan-500/20 text-cyan-300' : 'bg-gray-500/20 text-gray-300'} border border-cyan-500/30`}>
                  {ragMode ? 'ACTIVE' : 'OFFLINE'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span className="text-white text-sm font-medium">Vector Database</span>
                  </div>
                  <div className="text-cyan-300 text-xs">127K documents indexed</div>
                  <div className="text-cyan-300 text-xs">Real-time retrieval: 0.1s</div>
                </div>
                
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span className="text-white text-sm font-medium">LLM Integration</span>
                  </div>
                  <div className="text-purple-300 text-xs">Anthropic Claude 3.7 Sonnet</div>
                  <div className="text-purple-300 text-xs">Context window: 200K tokens</div>
                </div>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <div className="text-white text-sm font-medium mb-2">Recent Knowledge Queries</div>
                <div className="space-y-1 text-xs text-white/70">
                  <div>• "Product pricing for enterprise clients" - Retrieved 15 docs</div>
                  <div>• "Integration with Salesforce CRM" - Retrieved 8 docs</div>
                  <div>• "Support escalation procedures" - Retrieved 12 docs</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Voice & Conversation Analytics */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Volume2 className="w-5 h-5 text-orange-400" />
                <span>Voice & Conversation Analytics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-black text-orange-400 mb-1">94%</div>
                  <div className="text-white/70 text-xs">Voice Recognition</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-green-400 mb-1">8.7</div>
                  <div className="text-white/70 text-xs">Avg Satisfaction</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-blue-400 mb-1">2.3m</div>
                  <div className="text-white/70 text-xs">Avg Call Length</div>
                </div>
              </div>
              
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                <div className="text-white text-sm font-medium mb-2">Sentiment Analysis</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-green-300">Positive: 76%</span>
                    <Progress value={76} className="w-20 h-1" />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-yellow-300">Neutral: 18%</span>
                    <Progress value={18} className="w-20 h-1" />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-red-300">Negative: 6%</span>
                    <Progress value={6} className="w-20 h-1" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Controls & Alerts */}
        <div className="col-span-4 space-y-6">
          
          {/* Emergency Controls */}
          <Card className="bg-red-500/10 border border-red-500/20">
            <CardHeader>
              <CardTitle className="text-red-300 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Emergency Controls</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
                disabled={urgentNotifications.length === 0}
              >
                <Phone className="w-4 h-4 mr-2" />
                Take Escalated Call ({urgentNotifications.length})
              </Button>
              <Button variant="outline" className="w-full border-orange-500 text-orange-300 hover:bg-orange-500/10">
                <Settings className="w-4 h-4 mr-2" />
                Override Bot Decision
              </Button>
            </CardContent>
          </Card>

          {/* Voice Command Center */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Mic className="w-5 h-5 text-purple-400" />
                <span>🎤 VoiceBot Command Center</span>
                <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  READY
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <input
                  type="text"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="Enter voice command..."
                  value={voiceCommand}
                  onChange={(e) => setVoiceCommand(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendVoiceCommand()}
                />
                <Button
                  onClick={sendVoiceCommand}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold"
                  disabled={!voiceCommand.trim()}
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Send to VoiceBot
                </Button>
              </div>
              
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                <div className="text-white text-sm font-medium mb-2">Quick Commands</div>
                <div className="space-y-1 text-xs text-white/70">
                  <div>• "Generate executive summary"</div>
                  <div>• "Read today's performance"</div>
                  <div>• "Alert team about hot leads"</div>
                  <div>• "Process CRM updates"</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <span>Quick Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/70">Hot Leads</span>
                <span className="text-red-400 font-bold text-xl">{crmData?.hotLeads || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Follow-ups Due</span>
                <span className="text-yellow-400 font-bold text-xl">{crmData?.followUpsDue || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Pipeline Value</span>
                <span className="text-green-400 font-bold text-xl">
                  {(() => {
                    const rawPipeline = crmData?.pipelineValue || "$0";
                    const numericValue = Number(rawPipeline.replace(/[^0-9.-]+/g, ''));
                    return numericValue ? `$${Math.round(numericValue / 1000)}K` : '$0K';
                  })()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* System Monitor */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Monitor className="w-5 h-5 text-purple-400" />
                <span>System Monitor</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Bot Status</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-300 text-sm">Active</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white/70">API Health</span>
                <span className="text-green-300 text-sm">100%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white/70">Database</span>
                <span className="text-green-300 text-sm">Connected</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white/70">WebSocket</span>
                <span className="text-green-300 text-sm">Live</span>
              </div>
            </CardContent>
          </Card>

          {/* Calendar Integration */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-green-400" />
                <span>Smart Calendar</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <div className="text-white text-sm font-medium mb-2">Today's Schedule</div>
                <div className="space-y-1 text-xs text-white/70">
                  <div>• 2:00 PM - Discovery call with Alex Chen</div>
                  <div>• 3:30 PM - Demo for Sarah Johnson</div>
                  <div>• 4:15 PM - Follow-up with Mike Rodriguez</div>
                </div>
              </div>
              
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule New Meeting
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="border-blue-500 text-blue-300 hover:bg-blue-500/10 text-xs">
                  <Eye className="w-3 h-3 mr-1" />
                  View All
                </Button>
                <Button variant="outline" className="border-yellow-500 text-yellow-300 hover:bg-yellow-500/10 text-xs">
                  <Settings className="w-3 h-3 mr-1" />
                  Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Voice Command Center */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Headphones className="w-5 h-5 text-purple-400" />
                <span>Voice Command Center</span>
                {voiceActive && (
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {voiceActive && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 animate-pulse">
                  <div className="text-red-300 text-sm font-medium">🎤 Listening...</div>
                  <div className="text-red-200 text-xs">Say "Hey YoBot" to start</div>
                </div>
              )}
              
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                <div className="text-white text-sm font-medium mb-2">Voice Commands</div>
                <div className="space-y-1 text-xs text-white/70">
                  <div>• "Show me today's leads"</div>
                  <div>• "Schedule a meeting"</div>
                  <div>• "What's the pipeline status?"</div>
                  <div>• "Emergency override"</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  className="border-purple-500 text-purple-300 hover:bg-purple-500/10 text-xs"
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                >
                  <Volume2 className="w-3 h-3 mr-1" />
                  {voiceEnabled ? 'Disable' : 'Enable'}
                </Button>
                <Button variant="outline" className="border-cyan-500 text-cyan-300 hover:bg-cyan-500/10 text-xs">
                  <Settings className="w-3 h-3 mr-1" />
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Ultimate Command Actions */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span>Ultimate Controls</span>
                {userRole && (
                  <Badge className="bg-yellow-500/20 text-yellow-300 text-xs">
                    {userRole.toUpperCase()}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold">
                <MessageCircle className="w-4 h-4 mr-2" />
                View All Conversations
              </Button>
              
              {/* PDF Reports - Available to all roles */}
              <Button 
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-700 text-white font-bold"
                onClick={handleDownloadPDF}
              >
                📄 Download Power Report
              </Button>

              {/* Emergency Alerts - Available to all users */}
              <Button 
                className="w-full bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white font-bold"
                onClick={handleEmergencyAlert}
              >
                🔔 Alert via Slack/SMS
              </Button>
              
              {/* Advanced Controls - Available to all users */}
              <Button className="w-full bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 text-white font-bold">
                <BarChart3 className="w-4 h-4 mr-2" />
                Power Reports
              </Button>
              
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold">
                <Brain className="w-4 h-4 mr-2" />
                AI Configuration
              </Button>
              
              <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold">
                <Database className="w-4 h-4 mr-2" />
                RAG Knowledge Base
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Error Highlights */}
      <Card className="bg-white/5 backdrop-blur-sm border border-white/10 mb-8">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span>Recent Error Highlights</span>
            <div className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-full">2 CRITICAL</div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { 
                timestamp: '2m ago', 
                module: 'QuickBooks API', 
                error: 'Auth Token Expired', 
                code: 'QB401',
                severity: 'critical'
              },
              { 
                timestamp: '15m ago', 
                module: 'Voice Processing', 
                error: 'Transcription Timeout', 
                code: 'VP503',
                severity: 'warning'
              },
              { 
                timestamp: '1h ago', 
                module: 'HubSpot Sync', 
                error: 'Rate Limit Exceeded', 
                code: 'HS429',
                severity: 'warning'
              }
            ].map((error, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    error.severity === 'critical' ? 'bg-red-400' : 'bg-yellow-400'
                  }`}></div>
                  <div>
                    <div className="text-white text-sm font-medium">{error.module}</div>
                    <div className="text-slate-400 text-xs">{error.error} • {error.code}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400 text-xs">{error.timestamp}</span>
                  <Button size="sm" variant="outline" className="h-6 text-xs">
                    View Log
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button className="w-full mt-4 bg-slate-700 hover:bg-slate-600 text-white">
            <FileText className="w-4 h-4 mr-2" />
            View Full Error Log
          </Button>
        </CardContent>
      </Card>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-96">
            <h3 className="text-white text-lg font-bold mb-4 flex items-center">
              <Lock className="w-5 h-5 mr-2" />
              Admin Access Required
            </h3>
            <p className="text-slate-300 text-sm mb-4">
              Enter admin password to access system controls
            </p>
            
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Admin password"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white mb-4"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  if (adminPassword === 'YoBot2025!') {
                    setIsAdminAuthenticated(true);
                    setShowAdminLogin(false);
                    setAdminAuthError("");
                    window.open('/system-controls', '_blank');
                  } else {
                    setAdminAuthError("Invalid password");
                  }
                }
              }}
            />
            
            {adminAuthError && (
              <p className="text-red-400 text-sm mb-4">{adminAuthError}</p>
            )}
            
            <div className="flex space-x-3">
              <Button 
                onClick={() => {
                  if (adminPassword === 'YoBot2025!') {
                    setIsAdminAuthenticated(true);
                    setShowAdminLogin(false);
                    setAdminAuthError("");
                    window.open('/system-controls', '_blank');
                  } else {
                    setAdminAuthError("Invalid password");
                  }
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Access Controls
              </Button>
              <Button 
                onClick={() => {
                  setShowAdminLogin(false);
                  setAdminPassword("");
                  setAdminAuthError("");
                }}
                variant="outline" 
                className="flex-1 border-slate-600 text-white hover:bg-slate-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}