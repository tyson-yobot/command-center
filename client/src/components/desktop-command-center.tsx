import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
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
  Pin,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";
import type { Metrics, Bot, Notification, CrmData } from "@shared/schema";
import robotHeadPath from "@assets/A_flat_vector_illustration_features_a_robot_face_i.png";

export default function DesktopCommandCenter() {
  const [automationMode, setAutomationMode] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceCommand, setVoiceCommand] = useState('');

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <img 
            src={robotHeadPath} 
            alt="YoBot" 
            className={`w-12 h-12 ${isProcessing ? 'animate-pulse' : ''}`}
          />
          <div>
            <h1 className="text-4xl font-black text-white">YoBot® Command Center</h1>
            <p className="text-blue-300 text-lg">Your Complete AI Automation Dashboard</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
            <Wifi className="w-4 h-4 mr-2" />
            Live Data
          </Badge>
          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
            Real-time Insights
          </Badge>
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
            AI Admin Ready
          </Badge>
        </div>
      </div>

      {/* Top Section - Core Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Core Automation */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span>Core Automation</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-lg">
                <span className="text-green-300 text-sm font-medium">Lead Qualification</span>
                <Badge className="bg-green-600 text-white">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-500/20 rounded-lg">
                <span className="text-red-300 text-sm font-medium">Support Tickets</span>
                <Badge className="bg-red-600 text-white">Priority</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-500/20 rounded-lg">
                <span className="text-orange-300 text-sm font-medium">Call Management</span>
                <Badge className="bg-orange-600 text-white">Standard</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-500/20 rounded-lg">
                <span className="text-blue-300 text-sm font-medium">Data Sync</span>
                <Badge className="bg-blue-600 text-white">Running</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Voice & Communication */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Phone className="w-5 h-5 text-green-400" />
              <span>Voice & Communication</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-lg">
                <span className="text-green-300 text-sm font-medium">Voice Service</span>
                <Badge className="bg-green-600 text-white">Online</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-lg">
                <span className="text-blue-300 text-sm font-medium">SMS Gateway</span>
                <Badge className="bg-blue-600 text-white">Ready</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-lg">
                <span className="text-purple-300 text-sm font-medium">Chat Bot</span>
                <Badge className="bg-purple-600 text-white">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data & Reports */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <span>Data & Reports</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-lg">
                <span className="text-green-300 text-sm font-medium">Analytics Engine</span>
                <Badge className="bg-green-600 text-white">Running</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-500/20 rounded-lg">
                <span className="text-orange-300 text-sm font-medium">PDF Reports</span>
                <Badge className="bg-orange-600 text-white">Ready</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-500/20 rounded-lg">
                <span className="text-blue-300 text-sm font-medium">Live Metrics</span>
                <Badge className="bg-blue-600 text-white">Streaming</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Section - Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Bot Health Monitor */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center space-x-2 text-sm">
              <Activity className="w-4 h-4 text-green-400" />
              <span>Bot Health Monitor</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className="text-3xl font-black text-green-400">98%</div>
              <div className="text-green-300 text-xs">System Health</div>
              <Progress value={98} className="h-2" />
              <div className="text-slate-400 text-xs">All systems operational</div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Forecast */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center space-x-2 text-sm">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span>Revenue Forecast</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-black text-green-400">$24,567</div>
              <div className="text-green-300 text-xs">This Month</div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Pipeline</span>
                <span className="text-blue-400">$156K</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Conversion</span>
                <span className="text-green-400">34%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Pulse */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center space-x-2 text-sm">
              <Users className="w-4 h-4 text-blue-400" />
              <span>Client Pulse</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-xs">Active Clients</span>
                <span className="text-blue-400 font-bold">47</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-xs">New This Week</span>
                <span className="text-green-400 font-bold">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-xs">Satisfaction</span>
                <span className="text-green-400 font-bold">94%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ops Metrics */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center space-x-2 text-sm">
              <Monitor className="w-4 h-4 text-purple-400" />
              <span>Ops Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-xs">API Calls</span>
                <span className="text-purple-400 font-bold">1.2K</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-xs">Response Time</span>
                <span className="text-green-400 font-bold">180ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-xs">Uptime</span>
                <span className="text-green-400 font-bold">99.9%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lower Section - Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Workflow Performance */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span>Workflow Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Active Workflows</span>
                <Badge className="bg-green-600 text-white">24</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Tasks Completed</span>
                <Badge className="bg-blue-600 text-white">1,247</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Success Rate</span>
                <Badge className="bg-green-600 text-white">97.4%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Avg Processing</span>
                <Badge className="bg-purple-600 text-white">2.1s</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RoboVet™ */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <span>RoboVet™</span>
              <Badge className="bg-blue-600 text-white text-xs">Premium</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-500/20 rounded-lg">
                <span className="text-blue-300 text-sm">Lead Vip Calls</span>
                <span className="text-blue-400 font-bold">$47.2K</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-lg">
                <span className="text-green-300 text-sm">Lead Quality Score</span>
                <span className="text-green-400 font-bold">94.2%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-500/20 rounded-lg">
                <span className="text-purple-300 text-sm">Gross Sales</span>
                <span className="text-purple-400 font-bold">38.5%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SmartSpend™ */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Brain className="w-5 h-5 text-green-400" />
              <span>SmartSpend™</span>
              <Badge className="bg-green-600 text-white text-xs">Premium</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-3xl font-black text-green-400 mb-2">$127K</div>
                <div className="text-green-300 text-sm">Budget Allocation</div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-800/30 p-2 rounded text-center">
                  <div className="text-blue-400 font-bold">87%</div>
                  <div className="text-slate-400">Cost Per Action</div>
                </div>
                <div className="bg-slate-800/30 p-2 rounded text-center">
                  <div className="text-green-400 font-bold">3.40%</div>
                  <div className="text-slate-400">Payback Period</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section - AI Assistant and System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Assistant Insights */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <span>AI Assistant Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-purple-500/20 rounded-lg">
                <span className="text-purple-300 text-sm">Conversational Score</span>
                <span className="text-purple-400 font-bold">94.8%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-500/20 rounded-lg">
                <span className="text-blue-300 text-sm">Learning Index</span>
                <span className="text-blue-400 font-bold">7.6</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-lg">
                <span className="text-green-300 text-sm">Response Accuracy</span>
                <span className="text-green-400 font-bold">98.7%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-500/20 rounded-lg">
                <span className="text-orange-300 text-sm">Model Pending Approval</span>
                <span className="text-orange-400 font-bold">2</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Status (Read-Only) */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Server className="w-5 h-5 text-green-400" />
              <span>System Status (Read-Only)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-lg">
                <span className="text-green-300 text-sm">System Health</span>
                <span className="text-green-400 font-bold">100%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-500/20 rounded-lg">
                <span className="text-blue-300 text-sm">Database</span>
                <span className="text-blue-400 font-bold">Online</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-500/20 rounded-lg">
                <span className="text-purple-300 text-sm">Memory Usage</span>
                <span className="text-purple-400 font-bold">42.1%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-500/20 rounded-lg">
                <span className="text-yellow-300 text-sm">Active Connections</span>
                <span className="text-yellow-400 font-bold">1.2K</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}