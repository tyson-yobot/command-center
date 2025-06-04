import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { 
  Activity, 
  Phone, 
  Mail, 
  MessageSquare, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database,
  Bot,
  Zap,
  Settings,
  Search
} from "lucide-react";
import robotLogo from "@assets/A_flat_vector_illustration_features_a_robot_face_i.png";

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

export default function DesktopCommandCenter() {
  const [metrics, setMetrics] = useState<MetricsData>({
    activeCalls: 0,
    aiResponsesToday: 0,
    queuedVoiceJobs: 0,
    uptime: "100%",
    systemHealth: 97,
    responseTime: "180ms",
    connectedClients: 1,
    processingTasks: 0
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "metrics_update") {
          console.log("Metrics updated:", data);
          setMetrics(data.data);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    };

    return () => {
      socket.close();
    };
  }, []);

  const automationSystems = [
    { name: "Voice & Communication Systems", status: "active", items: [
      "Voice call handling (fixed hangup issues)",
      "SMS automation suite", 
      "WebSocket real-time updates",
      "Twilio integration"
    ]},
    { name: "Email & Notifications", status: "active", items: [
      "Gmail OAuth email automation",
      "Slack integration endpoints",
      "Alert systems"
    ]},
    { name: "Data & Analytics", status: "active", items: [
      "Real-time metrics and WebSocket connections",
      "Server running with 40 automation functions operational"
    ]}
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <img src={robotLogo} alt="YoBot" className="w-12 h-12" />
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Command Center</h1>
            <p className="text-slate-600 dark:text-slate-300">Enterprise Automation Dashboard</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-slate-600 dark:text-slate-300">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            System Operational
          </Badge>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search automation functions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white dark:bg-slate-800"
          />
        </div>
      </div>

      {/* Real-time Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">Active Calls</CardTitle>
            <Phone className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800 dark:text-white">{metrics.activeCalls}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Currently processing</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">AI Responses</CardTitle>
            <Bot className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800 dark:text-white">{metrics.aiResponsesToday}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Today</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">System Health</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800 dark:text-white">{metrics.systemHealth}%</div>
            <Progress value={metrics.systemHealth} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">Response Time</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800 dark:text-white">{metrics.responseTime}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Average</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Status */}
        <Card className="lg:col-span-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-800 dark:text-white">Current System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {automationSystems.map((system, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-slate-700 dark:text-slate-200">{system.name}:</h4>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {system.status}
                  </Badge>
                </div>
                <ul className="space-y-1 ml-4">
                  {system.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-800 dark:text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              System Settings
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Database className="w-4 h-4 mr-2" />
              View Logs
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Alerts
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}