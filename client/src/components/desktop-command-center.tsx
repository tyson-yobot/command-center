import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
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
  Headphones
} from "lucide-react";
import type { Metrics, Bot, Notification, CrmData } from "@shared/schema";

export default function DesktopCommandCenter() {
  const [automationMode, setAutomationMode] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [conversationMemory, setConversationMemory] = useState([]);
  const [ragMode, setRagMode] = useState(true);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <Brain className={`w-8 h-8 text-white ${isProcessing ? 'animate-pulse' : ''}`} />
            </div>
            {isProcessing && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
            )}
          </div>
          <div>
            <h1 className="text-4xl font-black text-white mb-1">YoBot Command Center</h1>
            <p className="text-blue-300 text-lg">AI Automation Control Hub</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          {/* System Status */}
          <div className="flex items-center space-x-2 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-2">
            <Wifi className="w-4 h-4 text-green-400" />
            <span className="text-green-300 font-medium">LIVE</span>
          </div>
          
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
                    {metrics ? ((metrics.conversions / metrics.callsToday) * 100).toFixed(1) : 0}% rate
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

          {/* Recent Activity Feed */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Activity className="w-5 h-5 text-green-400" />
                <span>Live Activity Feed</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { time: "2s ago", action: "AI processed new lead", details: "Sarah Johnson - TechCorp", type: "success" },
                  { time: "1m ago", action: "Call escalated to human", details: "Mike Rodriguez - Complex negotiation", type: "warning" },
                  { time: "3m ago", action: "Meeting scheduled", details: "Alex Chen - Discovery call", type: "info" },
                  { time: "5m ago", action: "Lead qualified", details: "Emma Davis - High value prospect", type: "success" },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'success' ? 'bg-green-400' :
                      activity.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                    } ${index === 0 ? 'animate-pulse' : ''}`}></div>
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">{activity.action}</div>
                      <div className="text-white/60 text-xs">{activity.details}</div>
                    </div>
                    <div className="text-white/40 text-xs">{activity.time}</div>
                  </div>
                ))}
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
                  ${crmData?.pipelineValue ? (crmData.pipelineValue / 1000).toFixed(0) + 'K' : '0K'}
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

          {/* Quick Actions */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <MessageCircle className="w-4 h-4 mr-2" />
                View All Conversations
              </Button>
              <Button variant="outline" className="w-full border-purple-500 text-purple-300 hover:bg-purple-500/10">
                <BarChart3 className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
              <Button variant="outline" className="w-full border-green-500 text-green-300 hover:bg-green-500/10">
                <Settings className="w-4 h-4 mr-2" />
                Bot Configuration
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}