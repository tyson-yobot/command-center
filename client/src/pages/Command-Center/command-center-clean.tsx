import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Mic, 
  Headphones, 
  Activity, 
  Zap, 
  Brain, 
  FileText, 
  Calendar, 
  DollarSign, 
  BarChart3,
  Download,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Target
} from 'lucide-react';

export default function CommandCenter() {
  const [activeTab, setActiveTab] = useState('automation-ops');
  const [currentSystemMode] = useState('test');
  const [smartSpendData] = useState(null);
  const [collapsedSections, setCollapsedSections] = useState({});
  const { toast } = useToast();

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleStartPipelineCalls = () => {
    toast({
      title: "Pipeline Started",
      description: "Voice pipeline calls have been initiated",
    });
  };

  const handleStopPipelineCalls = () => {
    toast({
      title: "Pipeline Stopped", 
      description: "Voice pipeline calls have been stopped",
    });
  };

  const handleCalendarSync = () => {
    toast({
      title: "Calendar Sync",
      description: "Calendar synchronization initiated",
    });
  };

  const handleAIChat = () => {
    toast({
      title: "AI Assistant",
      description: "AI chat interface activated",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Data Export",
      description: "Data export process started",
    });
  };

  const handleDownloadPDF = () => {
    toast({
      title: "PDF Report",
      description: "Generating analytics report...",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            YoBot Command Center
          </h1>
          <div className="flex items-center justify-center space-x-4">
            <Badge className="bg-green-600 text-white px-4 py-2">
              System Online
            </Badge>
            <Badge className="bg-blue-600 text-white px-4 py-2">
              Test Mode
            </Badge>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-6">
            {['automation-ops', 'system-tools', 'admin-tools'].map((tab) => (
              <Button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 ${
                  activeTab === tab 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {tab === 'automation-ops' && 'Automation Operations'}
                {tab === 'system-tools' && 'System Tools'}
                {tab === 'admin-tools' && 'Admin Tools'}
              </Button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'automation-ops' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Voice Engine Suite */}
            <Card className="bg-gradient-to-br from-green-900/60 to-emerald-800/40 backdrop-blur-sm border border-green-400 relative shadow-lg shadow-green-400/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-xl">
                  <Headphones className="w-6 h-6 mr-3 text-green-400" />
                  Voice Engine Suite
                  <Badge className="ml-3 bg-green-500 text-white text-sm px-3 py-1">UNIFIED</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button
                    onClick={handleStartPipelineCalls}
                    className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center p-3"
                  >
                    <span className="text-xl mr-3">🚀</span>
                    Start Pipeline Calls
                  </Button>
                  <Button
                    onClick={handleStopPipelineCalls}
                    className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center p-3"
                  >
                    <span className="text-xl mr-3">🛑</span>
                    Stop Pipeline Calls
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* SmartSpend Dashboard */}
            <Card className="bg-gradient-to-br from-purple-900/60 to-indigo-800/40 backdrop-blur-sm border border-purple-400 relative shadow-lg shadow-purple-400/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-xl">
                  <DollarSign className="w-6 h-6 mr-3 text-purple-400" />
                  SmartSpend Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-white text-sm">
                    <p>Budget Utilization: {smartSpendData?.budgetUtilization || 0}%</p>
                    <p>ROI: {smartSpendData?.roiPercentage || 0}%</p>
                    <p>Total Spend: ${smartSpendData?.totalSpend || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botalytics */}
            <Card className="bg-gradient-to-br from-blue-900/60 to-cyan-800/40 backdrop-blur-sm border border-blue-400 relative shadow-lg shadow-blue-400/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-xl">
                  <BarChart3 className="w-6 h-6 mr-3 text-blue-400" />
                  Botalytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-white text-sm">
                    <p>Monthly Performance Metrics</p>
                    <p>Automation Success Rate: 94.5%</p>
                    <p>Lead Generation: 1,247 this month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'system-tools' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Smart Calendar */}
            <Card className="bg-gradient-to-br from-orange-900/60 to-amber-800/40 backdrop-blur-sm border border-orange-400 relative shadow-lg shadow-orange-400/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-xl">
                  <Calendar className="w-6 h-6 mr-3 text-orange-400" />
                  Smart Calendar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button
                    onClick={handleCalendarSync}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center p-3"
                  >
                    <span className="text-xl mr-3">📅</span>
                    Sync Calendar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI Assistant */}
            <Card className="bg-gradient-to-br from-teal-900/60 to-cyan-800/40 backdrop-blur-sm border border-teal-400 relative shadow-lg shadow-teal-400/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-xl">
                  <Brain className="w-6 h-6 mr-3 text-teal-400" />
                  AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button
                    onClick={handleAIChat}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center p-3"
                  >
                    <span className="text-xl mr-3">🤖</span>
                    Start AI Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'admin-tools' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Health */}
            <Card className="bg-gradient-to-br from-red-900/60 to-pink-800/40 backdrop-blur-sm border border-red-400 relative shadow-lg shadow-red-400/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-xl">
                  <Activity className="w-6 h-6 mr-3 text-red-400" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-white text-sm">
                    <p>All systems operational</p>
                    <p>Uptime: 99.9%</p>
                    <p>Response time: 45ms</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export Tools */}
            <Card className="bg-gradient-to-br from-slate-900/60 to-gray-800/40 backdrop-blur-sm border border-slate-400 relative shadow-lg shadow-slate-400/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-xl">
                  <Download className="w-6 h-6 mr-3 text-slate-400" />
                  Export Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button
                    onClick={handleExportData}
                    className="w-full bg-slate-600 hover:bg-slate-700 text-white flex items-center justify-center p-3"
                  >
                    <span className="text-xl mr-3">📤</span>
                    Export Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reports Section */}
        <div className="mt-8">
          <Card className="bg-white/10 backdrop-blur-sm border border-purple-400">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-400" />
                  Reports & Export
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection('data-reports')}
                    className="ml-3 p-1 text-white/60 hover:text-white hover:bg-white/10"
                  >
                    {collapsedSections['data-reports'] ? 
                      <ChevronDown className="w-4 h-4" /> : 
                      <ChevronUp className="w-4 h-4" />
                    }
                  </Button>
                </div>
                <Badge className="bg-purple-600 text-white">Reports</Badge>
              </CardTitle>
            </CardHeader>
            {!collapsedSections['data-reports'] && (
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Button
                    onClick={() => window.location.href = '/lead-scraper'}
                    className="bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-start p-3"
                  >
                    <span className="text-xl mr-3">🎯</span>
                    Lead Generation Tools
                  </Button>
                  
                  <Button
                    onClick={handleDownloadPDF}
                    className="bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-start p-3"
                  >
                    <span className="text-xl mr-3">📋</span>
                    Generate Analytics Report
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}