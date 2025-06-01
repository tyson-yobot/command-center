import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import robotHeadPath from "@assets/A_flat_vector_illustration_features_a_robot_face_i.png";
import { 
  Database,
  Activity,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Wifi,
  Eye,
  Shield,
  RefreshCw,
  ChevronRight,
  Cpu,
  Server,
  TrendingUp,
  Users
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

export default function MainCommandCenter_OLD_BROKEN() {
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
    <div className="min-h-screen bg-[#0F172A] p-6">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <img 
              src={robotHeadPath} 
              alt="YoBot Robot Head" 
              className="w-8 h-8"
            />
            <div>
              <h1 className="text-xl font-semibold text-white">YoBot Command Center</h1>
              <p className="text-blue-400 text-sm">All-in-one Control Hub</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              LIVE
            </Badge>
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              View All
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              Alerts
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              Auto Mode
            </Badge>
          </div>
        </div>

        {/* Master Data Sync Monitor */}
        <Card className="bg-slate-800/50 border-slate-700/50 mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-blue-400" />
                <CardTitle className="text-white">Master Data Sync Monitor</CardTitle>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">REAL-TIME SYNC</Badge>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">LIVE FEED</Badge>
              </div>
              <div className="text-slate-400 text-sm">{formatTime(currentTime)} • Auto-refresh: ON</div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-1">24</div>
                <div className="text-slate-400 text-sm">Airtable</div>
                <div className="text-xs text-green-400">Last sync: 2m</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">47</div>
                <div className="text-slate-400 text-sm">HubSpot</div>
                <div className="text-xs text-blue-400">Last sync: 1m</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-1">12</div>
                <div className="text-slate-400 text-sm">Stripe</div>
                <div className="text-xs text-purple-400">Last sync: 30s</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400 mb-1">
                  <span className="text-red-400">0</span>
                </div>
                <div className="text-slate-400 text-sm">Overwatch</div>
                <div className="text-xs text-red-400 bg-red-500/20 px-2 py-1 rounded">ALERT RAISED</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Bot Instances */}
        <Card className="bg-slate-800/50 border-slate-700/50 mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-green-400" />
                <CardTitle className="text-white">Active Bot Instances</CardTitle>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">ACTIVE</Badge>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">12</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-1">12</div>
                <div className="text-green-400 text-sm">Total Bots Live</div>
                <div className="text-xs text-slate-400">Voice Bot, Form Bot, Qualify Assistant</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">8</div>
                <div className="text-blue-400 text-sm">Full Automation</div>
                <div className="text-xs text-slate-400">24/7 Automated</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-1">4</div>
                <div className="text-yellow-400 text-sm">Missing Integration</div>
                <div className="text-xs text-slate-400">Requires human</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Grid - 4 Cards */}
        <div className="grid grid-cols-4 gap-6">
          {/* Bot Uptime */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm">Bot Uptime</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-2">99.7%</div>
                <Progress value={99.7} className="h-2 mb-2" />
                <div className="text-xs text-slate-400">Status: All systems operational</div>
              </div>
            </CardContent>
          </Card>

          {/* Active Workflows */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm">Active Workflows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-2">47</div>
                <div className="text-xs text-blue-400 mb-1">Follow-up Sequences</div>
                <Progress value={75} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Error Queue */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm">Error Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400 mb-2">2</div>
                <div className="text-xs text-orange-400 mb-1">Pending</div>
                <div className="w-full bg-orange-500/20 h-2 rounded"></div>
              </div>
            </CardContent>
          </Card>

          {/* Processing Queue */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm">Processing Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-2">47</div>
                <div className="text-xs text-purple-400 mb-1">1.7s avg processing</div>
                <Progress value={65} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Health Monitor */}
        <Card className="bg-slate-800/50 border-slate-700/50 mt-6">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              <CardTitle className="text-white">API Health Monitor</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-xs text-slate-400">CRM</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-xs text-slate-400">Email</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-xs text-slate-400">SMS</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-xs text-slate-400">Calendar</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="text-xs text-slate-400">Webhooks</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-xs text-slate-400">Webhooks</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}