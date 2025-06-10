import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Bot, 
  Phone, 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  Activity,
  Zap,
  MessageSquare,
  Headphones,
  Calendar,
  Database,
  Target,
  Cpu,
  Monitor
} from 'lucide-react';

export default function CommandCenter() {
  const [isLiveMode, setIsLiveMode] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">YoBot® Command Center</h1>
            <p className="text-blue-200">Your Complete AI Automation Dashboard</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-white">System Mode:</span>
          <Switch 
            checked={isLiveMode}
            onCheckedChange={setIsLiveMode}
          />
          <Badge variant={isLiveMode ? "destructive" : "secondary"}>
            {isLiveMode ? "LIVE" : "TEST"}
          </Badge>
          <div className="flex space-x-2">
            <Button size="sm" className="bg-green-600 hover:bg-green-700">Live Voice Calls</Button>
            <Button size="sm" variant="outline" className="text-white border-white">View</Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">AI Assistant</Button>
            <Button size="sm" className="bg-orange-600 hover:bg-orange-700">SMS</Button>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">Coach Bot</Button>
            <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">Google Meet</Button>
            <Button size="sm" className="bg-red-600 hover:bg-red-700 animate-pulse">Emergency</Button>
            <Button size="sm" className="bg-gray-600 hover:bg-gray-700">BI Power Insights</Button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Core Automation */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Core Automation</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white justify-start">
              <Bot className="w-4 h-4 mr-2" />
              New Booking Lead
            </Button>
            <Button className="w-full bg-green-500 hover:bg-green-600 text-white justify-start">
              <Phone className="w-4 h-4 mr-2" />
              SMS Campaign Trigger
            </Button>
            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white justify-start">
              <MessageSquare className="w-4 h-4 mr-2" />
              Missed Call Follow-up
            </Button>
            <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white justify-start">
              <Calendar className="w-4 h-4 mr-2" />
              Appointment Confirmation
            </Button>
            <Button className="w-full bg-red-500 hover:bg-red-600 text-white justify-start">
              <Target className="w-4 h-4 mr-2" />
              Lead Scoring
            </Button>
            <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white justify-start">
              <Database className="w-4 h-4 mr-2" />
              Data Sync
            </Button>
          </CardContent>
        </Card>

        {/* Voice & Communication */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Headphones className="w-5 h-5" />
              <span>Voice & Communication</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full bg-green-500 hover:bg-green-600 text-white justify-start">
              <Phone className="w-4 h-4 mr-2" />
              Active Voice Calls
            </Button>
            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white justify-start">
              <MessageSquare className="w-4 h-4 mr-2" />
              SMS Analytics
            </Button>
            <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white justify-start">
              <Bot className="w-4 h-4 mr-2" />
              VoiceBot Status
            </Button>
            <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white justify-start">
              <Activity className="w-4 h-4 mr-2" />
              Call Recording
            </Button>
            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white justify-start">
              <Cpu className="w-4 h-4 mr-2" />
              System Monitoring
            </Button>
          </CardContent>
        </Card>

        {/* Data & Reports */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Data & Reports</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Real-time Reports
            </Button>
            <Button className="w-full bg-red-500 hover:bg-red-600 text-white justify-start">
              <TrendingUp className="w-4 h-4 mr-2" />
              Performance Analytics
            </Button>
            <Button className="w-full bg-green-500 hover:bg-green-600 text-white justify-start">
              <Users className="w-4 h-4 mr-2" />
              Client Insights
            </Button>
            <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white justify-start">
              <DollarSign className="w-4 h-4 mr-2" />
              Revenue Tracking
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Status Cards Row */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4">
            <div className="text-white">
              <div className="text-sm opacity-75">Active Calls</div>
              <div className="text-2xl font-bold">12</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4">
            <div className="text-white">
              <div className="text-sm opacity-75">AI Responses</div>
              <div className="text-2xl font-bold">247</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4">
            <div className="text-white">
              <div className="text-sm opacity-75">New Leads</div>
              <div className="text-2xl font-bold">89</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4">
            <div className="text-white">
              <div className="text-sm opacity-75">Success Rate</div>
              <div className="text-2xl font-bold">94.2%</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Automation Engine */}
      <Card className="bg-green-900/50 backdrop-blur-sm border-green-500/30 mb-6">
        <CardHeader>
          <CardTitle className="text-green-300 flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>🟢 Live Automation Engine</span>
            <Badge className="bg-green-500 text-white">ACTIVE 24/7</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-green-200">
            <div>
              <div className="text-sm">System Status</div>
              <div className="font-bold">99.7%</div>
              <div className="text-xs">Uptime</div>
            </div>
            <div>
              <div className="text-sm">Recent Executions</div>
              <div className="font-bold">1,247</div>
              <div className="text-xs">Today</div>
            </div>
            <div>
              <div className="text-sm">Success Rate</div>
              <div className="font-bold">100%</div>
              <div className="text-xs">Last 24h</div>
            </div>
            <div>
              <div className="text-sm">1,340 Execution Queue</div>
              <div className="font-bold">Active</div>
              <div className="text-xs">Processing live automation workflows</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Row */}
      <div className="grid grid-cols-4 gap-6">
        {/* Bot Health Monitor */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-sm">🤖 Bot Health Monitor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-white">
            <div className="flex justify-between">
              <span>VoiceBot Status</span>
              <span className="text-green-400">100%</span>
            </div>
            <div className="flex justify-between">
              <span>Response Time</span>
              <span>0.3s</span>
            </div>
            <div className="flex justify-between">
              <span>Memory Usage</span>
              <span>67%</span>
            </div>
            <div className="flex justify-between">
              <span>Active Calls</span>
              <span>12/50</span>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Forecast */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-sm">📊 Revenue Forecast</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-white">
            <div className="flex justify-between">
              <span>Monthly Goal</span>
              <span>$125K</span>
            </div>
            <div className="flex justify-between">
              <span>Current Month</span>
              <span>$89K</span>
            </div>
            <div className="flex justify-between">
              <span>Projected</span>
              <span>$134K</span>
            </div>
            <div className="text-green-400 text-center">↗️ +7.2% vs forecast</div>
          </CardContent>
        </Card>

        {/* Client Pulse */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-sm">👥 Client Pulse</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-white">
            <div className="flex justify-between">
              <span>Active Clients</span>
              <span>247</span>
            </div>
            <div className="flex justify-between">
              <span>New This Month</span>
              <span>23</span>
            </div>
            <div className="flex justify-between">
              <span>Churn Rate</span>
              <span>2.1%</span>
            </div>
            <div className="flex justify-between">
              <span>Net Collection Rate</span>
              <span>97% range</span>
            </div>
          </CardContent>
        </Card>

        {/* Ops Metrics */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-sm">⚡ Ops Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-white">
            <div className="flex justify-between">
              <span>Response Rate</span>
              <span>97.3%</span>
            </div>
            <div className="flex justify-between">
              <span>Avg Call Duration</span>
              <span>3m 47s</span>
            </div>
            <div className="flex justify-between">
              <span>AI Processing Load</span>
              <span>23%</span>
            </div>
            <div className="flex justify-between">
              <span>Daily Automations</span>
              <span>2,847 Events</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Bottom Sections */}
      <div className="grid grid-cols-3 gap-6 mt-6">
        {/* Workflow Performance */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-sm">📈 Workflow Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-white">
            <div className="flex justify-between">
              <span>Tasks Completed</span>
              <span>4,823</span>
            </div>
            <div className="flex justify-between">
              <span>Success Rate</span>
              <span>99.2%</span>
            </div>
            <div className="flex justify-between">
              <span>Avg Completion Time</span>
              <span>8.1 min</span>
            </div>
          </CardContent>
        </Card>

        {/* BotAnalytics™ */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-sm">🔍 BotAnalytics™</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-white">
            <div className="flex justify-between">
              <span>Conflict Level</span>
              <span className="text-red-400">⚠️ 23.2%</span>
            </div>
            <div className="flex justify-between">
              <span>Call Quality Score</span>
              <span>84.7%</span>
            </div>
            <div className="flex justify-between">
              <span>Close Rate</span>
              <span>79.4%</span>
            </div>
          </CardContent>
        </Card>

        {/* SmartSpend™ */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-sm">💰 SmartSpend™</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-white">
            <div className="flex justify-between">
              <span>Budget Utilization</span>
              <span>67%</span>
            </div>
            <div className="flex justify-between">
              <span>Cost per Lead Total</span>
              <span>$4.23</span>
            </div>
            <div className="flex justify-between">
              <span>Platform Period</span>
              <span>23 days</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}