import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Monitor, Settings, Users, Phone, Bot, 
  TrendingUp, AlertTriangle, CheckCircle,
  Menu, X, Home, Activity
} from 'lucide-react';
import { useModeContext } from '@/App';

export default function Mobile() {
  const { isTestMode, setTestMode } = useModeContext();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'automation', label: 'Automation', icon: Bot },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const automationFunctions = [
    { name: 'Lead Capture', status: 'active', executions: 1247 },
    { name: 'Voice Response', status: 'active', executions: 892 },
    { name: 'CRM Sync', status: 'active', executions: 634 },
    { name: 'Email Automation', status: 'active', executions: 445 },
    { name: 'Data Processing', status: 'warning', executions: 223 },
    { name: 'Report Generation', status: 'active', executions: 189 }
  ];

  const metrics = {
    totalBots: 8,
    activeCalls: 23,
    todayRevenue: 15420,
    systemHealth: 98
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-bold text-white">YoBot®</h1>
            <p className="text-xs text-slate-300">Mobile Command</p>
          </div>
          
          {/* Test/Live Toggle */}
          <div className="flex items-center space-x-2">
            <span className={`text-xs ${isTestMode ? 'text-yellow-400' : 'text-green-400'}`}>
              {isTestMode ? 'TEST' : 'LIVE'}
            </span>
            <button
              onClick={() => setTestMode(!isTestMode)}
              className={`w-10 h-6 rounded-full transition-colors ${
                isTestMode ? 'bg-yellow-600' : 'bg-green-600'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                isTestMode ? 'translate-x-1' : 'translate-x-5'
              }`} />
            </button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/95 backdrop-blur-sm pt-16">
          <div className="p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className="w-full justify-start text-white"
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMenuOpen(false);
                  }}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Quick Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-3">
              <div className="text-xs text-slate-400">Active Bots</div>
              <div className="text-xl font-bold text-white">{metrics.totalBots}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-3">
              <div className="text-xs text-slate-400">Live Calls</div>
              <div className="text-xl font-bold text-white">{metrics.activeCalls}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-3">
              <div className="text-xs text-slate-400">Revenue Today</div>
              <div className="text-lg font-bold text-green-400">${metrics.todayRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-3">
              <div className="text-xs text-slate-400">System Health</div>
              <div className="text-lg font-bold text-green-400">{metrics.systemHealth}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Automation Functions */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg">Core Automation</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {automationFunctions.map((func, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-700/30">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        func.status === 'active' ? 'bg-green-400' :
                        func.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                      }`} />
                      <span className="text-white text-sm">{func.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">{func.executions} runs</div>
                      <Badge variant={func.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {func.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white p-4 h-auto flex-col">
            <Monitor className="w-6 h-6 mb-1" />
            <span className="text-sm">Command Center</span>
          </Button>
          
          <Button className="bg-purple-600 hover:bg-purple-700 text-white p-4 h-auto flex-col">
            <Settings className="w-6 h-6 mb-1" />
            <span className="text-sm">Control Center</span>
          </Button>
          
          <Button className="bg-green-600 hover:bg-green-700 text-white p-4 h-auto flex-col">
            <Users className="w-6 h-6 mb-1" />
            <span className="text-sm">Lead Scraper</span>
          </Button>
          
          <Button className="bg-orange-600 hover:bg-orange-700 text-white p-4 h-auto flex-col">
            <Phone className="w-6 h-6 mb-1" />
            <span className="text-sm">Voice Bot</span>
          </Button>
        </div>

        {/* Recent Activity */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-white">Lead capture completed</span>
                <span className="text-slate-400 ml-auto">2m ago</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-white">API rate limit warning</span>
                <span className="text-slate-400 ml-auto">5m ago</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-white">Revenue milestone reached</span>
                <span className="text-slate-400 ml-auto">12m ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700">
        <div className="grid grid-cols-4 gap-1 p-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className={`flex-col h-12 ${
                  activeTab === item.id ? 'text-blue-400' : 'text-slate-400'
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span className="text-xs">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}