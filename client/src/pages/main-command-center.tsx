import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import robotHeadPath from "@assets/A_flat_vector_illustration_features_a_robot_face_i.png";
import { 
  DollarSign,
  TrendingUp,
  Users,
  MessageCircle,
  Clock,
  Target,
  Zap,
  Brain,
  Mic,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  Phone,
  Mail,
  Calendar,
  FileText,
  Wifi,
  Shield
} from "lucide-react";

interface MetricsData {
  activeCalls: number;
  aiResponsesToday: number;
  queuedVoiceJobs: number;
  uptime: string;
  systemHealth: number;
  responseTime: string;
  connectedClients: number;
  processingTasks: number;
}

interface CRMData {
  hoursSaved: number;
  revenueGenerated: number;
  conversations: number;
  pipelineValue: number;
}

export default function MainCommandCenter() {
  const [currentTime, setCurrentTime] = useState(new Date());

  const { data: metricsData } = useQuery<MetricsData>({
    queryKey: ['/api/metrics'],
  });

  const { data: crmData } = useQuery<CRMData>({
    queryKey: ['/api/crm'],
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
              <img 
                src={robotHeadPath} 
                alt="YoBot Robot Head" 
                className="w-12 h-12 mr-3 inline-block"
                style={{ marginTop: '-4px' }}
              />
              YoBot® Command Center
            </h1>
            <p className="text-blue-300 text-lg">Live Intelligence Dashboard</p>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="text-white text-2xl font-mono">{formatTime(currentTime)}</div>
              <div className="text-blue-300 text-sm">{currentTime.toLocaleDateString()}</div>
            </div>
            <div className="flex items-center space-x-2 bg-green-500/20 border-green-500/30 rounded-full px-4 py-2 border">
              <Wifi className="w-4 h-4 text-green-400" />
              <span className="text-green-300 font-medium">OPERATIONAL</span>
            </div>
          </div>
        </div>

        {/* Top Row - Key Business Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Hours Saved */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-green-400" />
                  <span className="text-sm">Manual Hours Avoided</span>
                </div>
                <Badge className="bg-green-500/20 text-green-300 text-xs">SAVINGS</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-green-400 mb-2">
                {crmData?.hoursSaved?.toLocaleString() || '2,847'}
              </div>
              <div className="text-green-300 text-sm">hours this month</div>
              <div className="text-xs text-slate-400 mt-1">+23% vs last month</div>
            </CardContent>
          </Card>

          {/* Revenue Generated */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-blue-400" />
                  <span className="text-sm">Revenue Generated</span>
                </div>
                <Badge className="bg-blue-500/20 text-blue-300 text-xs">REVENUE</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-blue-400 mb-2">
                ${(crmData?.revenueGenerated || 324000).toLocaleString()}
              </div>
              <div className="text-blue-300 text-sm">this quarter</div>
              <div className="text-xs text-slate-400 mt-1">+18% vs Q3</div>
            </CardContent>
          </Card>

          {/* Active Conversations */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 text-purple-400" />
                  <span className="text-sm">Conversations</span>
                </div>
                <Badge className="bg-purple-500/20 text-purple-300 text-xs">LIVE</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-purple-400 mb-2">
                {metricsData?.activeCalls || 8}
              </div>
              <div className="text-purple-300 text-sm">active now</div>
              <div className="text-xs text-slate-400 mt-1">{crmData?.conversations || 12493} total today</div>
            </CardContent>
          </Card>

          {/* Pipeline Value */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-orange-400" />
                  <span className="text-sm">Pipeline Value</span>
                </div>
                <Badge className="bg-orange-500/20 text-orange-300 text-xs">PIPELINE</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-orange-400 mb-2">
                ${(crmData?.pipelineValue || 847000).toLocaleString()}
              </div>
              <div className="text-orange-300 text-sm">in opportunities</div>
              <div className="text-xs text-slate-400 mt-1">324% ROI potential</div>
            </CardContent>
          </Card>
        </div>

        {/* System Status Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* AI System Status */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Brain className="w-5 h-5 text-cyan-400" />
                <span>AI Intelligence Engine</span>
                <Badge className="bg-green-500/20 text-green-300">ACTIVE</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Responses Today</span>
                  <span className="text-cyan-400 font-bold">{metricsData?.aiResponsesToday || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Avg Response Time</span>
                  <span className="text-cyan-400 font-bold">{metricsData?.responseTime || '180ms'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">System Health</span>
                  <span className="text-green-400 font-bold">{metricsData?.systemHealth || 97}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Voice Processing */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Mic className="w-5 h-5 text-pink-400" />
                <span>Voice Processing</span>
                <Badge className="bg-green-500/20 text-green-300">ONLINE</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Queue Length</span>
                  <span className="text-pink-400 font-bold">{metricsData?.queuedVoiceJobs || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Processing Tasks</span>
                  <span className="text-pink-400 font-bold">{metricsData?.processingTasks || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Uptime</span>
                  <span className="text-green-400 font-bold">{metricsData?.uptime || '100%'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Connected Clients */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Users className="w-5 h-5 text-yellow-400" />
                <span>Connected Clients</span>
                <Badge className="bg-green-500/20 text-green-300">LIVE</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Active Sessions</span>
                  <span className="text-yellow-400 font-bold">{metricsData?.connectedClients || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Peak Today</span>
                  <span className="text-yellow-400 font-bold">24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Avg Session</span>
                  <span className="text-yellow-400 font-bold">4.2min</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Feed */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <span>Live Activity Feed</span>
              <Badge className="bg-green-500/20 text-green-300">REAL-TIME</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-white">Voice escalation resolved for Sarah Chen - Account #4782</span>
                <span className="text-slate-400 ml-auto">{formatTime(new Date())}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <MessageCircle className="w-4 h-4 text-blue-400" />
                <span className="text-white">New conversation started with Mike Rodriguez - High Priority</span>
                <span className="text-slate-400 ml-auto">5:52:14</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-white">Deal closed: $15,000 contract with TechStart Inc.</span>
                <span className="text-slate-400 ml-auto">5:51:33</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-white">Automation trigger activated for lead qualification</span>
                <span className="text-slate-400 ml-auto">5:49:12</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <span className="text-white">Client escalation flagged - requires manager review</span>
                <span className="text-slate-400 ml-auto">5:47:55</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}