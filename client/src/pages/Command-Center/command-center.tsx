import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mic, FileText, Gauge, Zap, Bot, Phone, Settings, 
  AlertTriangle, CheckCircle, TrendingUp, Users,
  Play, Square, RefreshCw, Download, Upload,
  BarChart3, Calendar, Clock, Activity
} from 'lucide-react';

interface SystemMode {
  mode: 'test' | 'live';
  timestamp: string;
}

interface DashboardMetrics {
  activeCalls?: number;
  totalCalls?: number;
  conversionRate?: number;
  newLeads?: number;
  conversions?: number;
  escalations?: number;
  automatedTasks?: number;
  hoursSaved?: number;
  efficiency?: number;
}

const CommandCenter = () => {
  const [currentSystemMode, setCurrentSystemMode] = useState<'test' | 'live'>('live');
  const [selectedDay, setSelectedDay] = useState(0);

  // Fetch system mode
  const { data: systemModeData } = useQuery({
    queryKey: ['/api/system-mode'],
    refetchInterval: 5000,
  });

  // Fetch dashboard metrics
  const { data: metrics } = useQuery<DashboardMetrics>({
    queryKey: ['/api/dashboard-metrics'],
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (systemModeData?.systemMode) {
      setCurrentSystemMode(systemModeData.systemMode);
    }
  }, [systemModeData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-6 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              YoBot Command Center
            </h1>
            <p className="text-slate-300 mt-2">Enterprise Automation Dashboard</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant={currentSystemMode === 'live' ? 'default' : 'secondary'} className="px-4 py-2">
              {currentSystemMode === 'live' ? 'LIVE MODE' : 'TEST MODE'}
            </Badge>
            <div className="text-sm text-slate-400">
              {new Date().toLocaleString()}
            </div>
          </div>
        </div>

        {/* Quick Action Launchpad */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-400" />
            Quick Action Launchpad
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Button 
              className="h-24 flex flex-col items-center justify-center space-y-2 bg-emerald-600 hover:bg-emerald-700 text-white border-none"
              onClick={() => console.log('Start Pipeline')}
            >
              <Play className="w-6 h-6" />
              <span className="text-sm font-medium">Start Pipeline</span>
            </Button>
            <Button 
              className="h-24 flex flex-col items-center justify-center space-y-2 bg-violet-600 hover:bg-violet-700 text-white border-none"
              onClick={() => console.log('Generate Report')}
            >
              <BarChart3 className="w-6 h-6" />
              <span className="text-sm font-medium">Generate Report</span>
            </Button>
            <Button 
              className="h-24 flex flex-col items-center justify-center space-y-2 bg-amber-600 hover:bg-amber-700 text-white border-none"
              onClick={() => console.log('Voice Command')}
            >
              <Mic className="w-6 h-6" />
              <span className="text-sm font-medium">Voice Command</span>
            </Button>
            <Button 
              className="h-24 flex flex-col items-center justify-center space-y-2 bg-slate-600 hover:bg-slate-700 text-white border-none"
              onClick={() => console.log('System Check')}
            >
              <Activity className="w-6 h-6" />
              <span className="text-sm font-medium">System Check</span>
            </Button>
            <Button 
              className="h-24 flex flex-col items-center justify-center space-y-2 bg-slate-600 hover:bg-slate-700 text-white border-none"
              onClick={() => console.log('Export Data')}
            >
              <Download className="w-6 h-6" />
              <span className="text-sm font-medium">Export Data</span>
            </Button>
            <Button 
              className="h-24 flex flex-col items-center justify-center space-y-2 bg-slate-600 hover:bg-slate-700 text-white border-none"
              onClick={() => console.log('Settings')}
            >
              <Settings className="w-6 h-6" />
              <span className="text-sm font-medium">Settings</span>
            </Button>
          </div>
        </div>

        {/* Analytics Dashboard - Clean 2x3 Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Voice Analytics */}
          <Card className="bg-white/10 backdrop-blur-sm border border-blue-400">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Mic className="w-5 h-5 mr-2 text-red-400" />
                Voice Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Calls Today:</span>
                  <span className="text-white font-bold">{currentSystemMode === 'test' ? '23' : (metrics?.activeCalls || '--')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Avg Duration:</span>
                  <span className="text-cyan-400 font-bold">{currentSystemMode === 'test' ? '7:42' : '--'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Conversion Rate:</span>
                  <span className="text-green-400 font-bold">{currentSystemMode === 'test' ? '15.2%' : '--'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Audit Log */}
          <Card className="bg-white/10 backdrop-blur-sm border border-blue-400">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FileText className="w-5 h-5 mr-2 text-orange-400" />
                System Audit Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentSystemMode === 'test' ? (
                  <>
                    <div className="text-xs text-green-400">14:32 - Admin login successful</div>
                    <div className="text-xs text-blue-400">14:28 - Automation rule updated</div>
                    <div className="text-xs text-cyan-400">14:15 - Bot training completed</div>
                    <div className="text-xs text-purple-400">14:02 - CRM sync executed</div>
                  </>
                ) : (
                  <div className="text-xs text-slate-400">No recent audit events</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-white/10 backdrop-blur-sm border border-blue-400">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Gauge className="w-5 h-5 mr-2 text-cyan-400" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">New Leads:</span>
                  <span className="text-green-400 font-bold">{currentSystemMode === 'test' ? '17' : '--'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Conversions:</span>
                  <span className="text-blue-400 font-bold">{currentSystemMode === 'test' ? '4' : '--'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Escalations:</span>
                  <span className="text-yellow-400 font-bold">{currentSystemMode === 'test' ? '2' : '--'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Automation Engine */}
          <Card className="bg-white/10 backdrop-blur-sm border border-blue-400">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                AI Automation Engine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Tasks Automated:</span>
                  <span className="text-cyan-400 font-bold">{currentSystemMode === 'test' ? '127' : '--'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Hours Saved:</span>
                  <span className="text-green-400 font-bold">{currentSystemMode === 'test' ? '34.2' : '--'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Efficiency:</span>
                  <span className="text-purple-400 font-bold">{currentSystemMode === 'test' ? '89.7%' : '--'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="bg-white/10 backdrop-blur-sm border border-blue-400">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">NPS Score:</span>
                  <span className="text-green-400 font-bold">{currentSystemMode === 'test' ? '8.7' : '--'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Satisfaction:</span>
                  <span className="text-slate-400 font-bold">--</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className="bg-white/10 backdrop-blur-sm border border-blue-400">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Success Rate:</span>
                  <span className="text-slate-400 font-bold">--</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Response Time:</span>
                  <span className="text-slate-400 font-bold">--</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Uptime:</span>
                  <span className="text-slate-400 font-bold">--</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>




      </div>
    </div>
  );
};

export default CommandCenter;