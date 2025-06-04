import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Volume2,
  Calendar,
  FileText,
  Database,
  Shield,
  DollarSign,
  Bot as BotIcon,
  Play,
  Pause,
  Eye,
  MessageSquare
} from "lucide-react";
import type { Metrics, Bot, Notification, CrmData } from "@shared/schema";
import robotHeadPath from "@assets/A_flat_vector_illustration_features_a_robot_face_i.png";

export default function MainDesktopCommandCenter() {
  const [selectedVoiceCommand, setSelectedVoiceCommand] = useState("");
  const [calendarEntries, setCalendarEntries] = useState([
    { type: "Demo Call", time: "2:30 PM", status: "confirmed" },
    { type: "Follow-up", time: "4:15 PM", status: "pending" },
    { type: "Callback", time: "5:00 PM", status: "scheduled" }
  ]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <img 
            src={robotHeadPath} 
            alt="YoBot" 
            className="w-10 h-10"
          />
          <div>
            <h1 className="text-3xl font-bold text-white">YoBot® Command Center</h1>
            <p className="text-blue-300 text-sm">Your Complete AI Automation Dashboard</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
            <Wifi className="w-3 h-3 mr-1" />
            Live Data
          </Badge>
          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
            Real-time Insights
          </Badge>
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
            AI Admin Ready
          </Badge>
        </div>
      </div>

      {/* Top Section - Core Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Core Automation */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center space-x-2 text-lg">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span>Core Automation</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="p-2 bg-green-500/20 rounded border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <span className="text-green-300 text-sm font-medium">Lead Qualification</span>
                <Badge className="bg-green-600 text-white text-xs">Active</Badge>
              </div>
            </div>
            <div className="p-2 bg-red-500/20 rounded border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <span className="text-red-300 text-sm font-medium">Support Tickets</span>
                <Badge className="bg-red-600 text-white text-xs">Priority</Badge>
              </div>
            </div>
            <div className="p-2 bg-orange-500/20 rounded border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <span className="text-orange-300 text-sm font-medium">Call Management</span>
                <Badge className="bg-orange-600 text-white text-xs">Standard</Badge>
              </div>
            </div>
            <div className="p-2 bg-blue-500/20 rounded border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <span className="text-blue-300 text-sm font-medium">Data Sync</span>
                <Badge className="bg-blue-600 text-white text-xs">Running</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Voice & Communication */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center space-x-2 text-lg">
              <Phone className="w-5 h-5 text-green-400" />
              <span>Voice & Communication</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="p-2 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <span className="text-green-300 text-sm font-medium">Voice Service</span>
                <Badge className="bg-green-600 text-white text-xs">Online</Badge>
              </div>
            </div>
            <div className="p-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <span className="text-blue-300 text-sm font-medium">SMS Gateway</span>
                <Badge className="bg-blue-600 text-white text-xs">Ready</Badge>
              </div>
            </div>
            <div className="p-2 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <span className="text-purple-300 text-sm font-medium">Chat Bot</span>
                <Badge className="bg-purple-600 text-white text-xs">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data & Reports */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center space-x-2 text-lg">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <span>Data & Reports</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="p-2 bg-green-500/20 rounded border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <span className="text-green-300 text-sm font-medium">Analytics Engine</span>
                <Badge className="bg-green-600 text-white text-xs">Running</Badge>
              </div>
            </div>
            <div className="p-2 bg-orange-500/20 rounded border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <span className="text-orange-300 text-sm font-medium">PDF Reports</span>
                <Badge className="bg-orange-600 text-white text-xs">Ready</Badge>
              </div>
            </div>
            <div className="p-2 bg-blue-500/20 rounded border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <span className="text-blue-300 text-sm font-medium">Live Metrics</span>
                <Badge className="bg-blue-600 text-white text-xs">Streaming</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        {/* Bot Health Monitor */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center space-x-2 text-sm">
              <Activity className="w-4 h-4 text-green-400" />
              <span>Bot Health Monitor</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-green-400">98%</div>
              <div className="text-green-300 text-xs">System Health</div>
              <Progress value={98} className="h-1" />
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Uptime</span>
                  <span className="text-green-400">99.7%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">CPU</span>
                  <span className="text-blue-400">45%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Memory</span>
                  <span className="text-yellow-400">67%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Forecast */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center space-x-2 text-sm">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span>Revenue Forecast</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-400">$24,567</div>
              <div className="text-green-300 text-xs">This Month</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Pipeline</span>
                  <span className="text-blue-400">$156K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Conversion</span>
                  <span className="text-green-400">34%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Growth</span>
                  <span className="text-purple-400">+12%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Pulse */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center space-x-2 text-sm">
              <Users className="w-4 h-4 text-blue-400" />
              <span>Client Pulse</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">47</div>
                <div className="text-blue-300 text-xs">Active Clients</div>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">New This Week</span>
                  <span className="text-green-400 font-bold">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Satisfaction</span>
                  <span className="text-green-400 font-bold">94%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Churn Risk</span>
                  <span className="text-red-400 font-bold">2</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ops Metrics */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center space-x-2 text-sm">
              <Monitor className="w-4 h-4 text-purple-400" />
              <span>Ops Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">99.9%</div>
                <div className="text-purple-300 text-xs">Uptime</div>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">API Calls</span>
                  <span className="text-purple-400 font-bold">1.2K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Response Time</span>
                  <span className="text-green-400 font-bold">180ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Errors</span>
                  <span className="text-red-400 font-bold">0.1%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Voice Commands */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center space-x-2">
              <Mic className="w-5 h-5 text-purple-400" />
              <span>Voice Commands</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { command: "Show me today's leads", status: "ready" },
              { command: "Call top prospect", status: "ready" },
              { command: "Schedule follow-up", status: "ready" }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer">
                <span className="text-slate-300 text-sm">{item.command}</span>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1 h-7">
                  <Play className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Smart Calendar */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              <span>Smart Calendar</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {calendarEntries.map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">{entry.type}</div>
                  <div className="text-slate-400 text-xs">{entry.time}</div>
                </div>
                <Badge className={`text-xs ${
                  entry.status === 'confirmed' ? 'bg-green-600' : 
                  entry.status === 'pending' ? 'bg-yellow-600' : 'bg-blue-600'
                } text-white`}>
                  {entry.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Live Activity Feed */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-400" />
              <span>Live Activity Feed</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { action: "New lead captured", time: "2 min ago", type: "success" },
              { action: "Meeting scheduled", time: "5 min ago", type: "info" },
              { action: "Bot response queued", time: "8 min ago", type: "warning" }
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-2 bg-slate-800/30 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'success' ? 'bg-green-400' :
                  activity.type === 'info' ? 'bg-blue-400' : 'bg-yellow-400'
                }`}></div>
                <div className="flex-1">
                  <div className="text-white text-sm">{activity.action}</div>
                  <div className="text-slate-400 text-xs">{activity.time}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}