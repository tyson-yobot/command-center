import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Phone, 
  PhoneOff,
  Users, 
  DollarSign,
  Clock,
  CheckCircle,
  Activity,
  MessageSquare,
  Target,
  BarChart3,
  Settings,
  Monitor,
  FileText,
  Search,
  Mail,
  Database,
  Upload,
  RefreshCw,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function CommandCenter() {
  // System mode state - strict test/live isolation
  const [currentSystemMode, setCurrentSystemMode] = useState(() => {
    return localStorage.getItem('systemMode') || 'live';
  });
  
  const { toast } = useToast();
  
  // Core metrics queries with proper mode isolation
  const { data: metrics } = useQuery({ 
    queryKey: ['/api/dashboard-metrics', currentSystemMode],
    queryFn: () => fetch('/api/dashboard-metrics', {
      headers: { 'x-system-mode': currentSystemMode }
    }).then(res => res.json())
  });
  
  const { data: automationPerformance } = useQuery({ 
    queryKey: ['/api/automation-performance', currentSystemMode],
    queryFn: () => fetch('/api/automation-performance', {
      headers: { 'x-system-mode': currentSystemMode }
    }).then(res => res.json())
  });

  // System mode toggle with complete isolation
  const toggleSystemMode = async () => {
    try {
      const newMode = currentSystemMode === 'live' ? 'test' : 'live';
      
      const response = await apiRequest('POST', '/api/system-mode', {
        mode: newMode
      });
      
      if (response.success) {
        setCurrentSystemMode(response.systemMode);
        localStorage.setItem('systemMode', response.systemMode);
        
        // Log mode change to Airtable QA
        await logToAirtableQA('System Mode Toggle', {
          oldMode: currentSystemMode,
          newMode: response.systemMode,
          timestamp: new Date().toISOString()
        });
        
        toast({
          title: "System Mode Changed",
          description: `Switched to ${response.systemMode} mode`,
        });
        
        // Force refresh to ensure clean state
        setTimeout(() => window.location.reload(), 500);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle system mode",
        variant: "destructive"
      });
    }
  };

  // Airtable QA logging function
  const logToAirtableQA = async (testName: string, data: any) => {
    try {
      await apiRequest('POST', '/api/qa-log', {
        testName,
        data,
        systemMode: currentSystemMode,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('QA logging failed:', error);
    }
  };

  // Button action handlers with backend wiring
  const handleLeadScraping = async () => {
    try {
      await logToAirtableQA('Lead Scraping Initiated', { action: 'launch_scraper' });
      const response = await apiRequest('POST', '/api/launch-scrape', {
        tool: 'apollo',
        testMode: currentSystemMode === 'test'
      });
      toast({
        title: "Lead Scraping Started",
        description: `Scraping ${response.leadCount || 0} leads`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start lead scraping",
        variant: "destructive"
      });
    }
  };

  const handleContentCreation = async () => {
    try {
      await logToAirtableQA('Content Creation Initiated', { action: 'create_content' });
      const response = await apiRequest('POST', '/api/test-content-publish', {
        content: {
          platform: 'linkedin',
          headline: 'Test Content',
          body: 'Test content creation from Command Center'
        },
        testMode: currentSystemMode === 'test'
      });
      toast({
        title: "Content Created",
        description: "Content sent for review"
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to create content",
        variant: "destructive"
      });
    }
  };

  const handleAutomationTest = async () => {
    try {
      await logToAirtableQA('Automation Test Initiated', { action: 'test_automation' });
      const response = await apiRequest('POST', '/api/automation/new-booking-sync', {
        clientName: 'Test Client',
        testMode: currentSystemMode === 'test'
      });
      toast({
        title: "Automation Tested",
        description: "Booking sync automation executed"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to test automation",
        variant: "destructive"
      });
    }
  };

  const handleSystemHealthCheck = async () => {
    try {
      await logToAirtableQA('System Health Check', { action: 'health_check' });
      const response = await fetch('/api/system-health');
      const health = await response.json();
      toast({
        title: "System Health",
        description: `Overall status: ${health.overall || 'Unknown'}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check system health",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">YoBot Command Center</h1>
              <p className="text-slate-300">Enterprise Automation Control Panel</p>
            </div>
          </div>
          
          {/* System Mode Toggle */}
          <div className="flex items-center space-x-4 bg-slate-800 rounded-lg p-4">
            <span className="text-white font-medium">System Mode:</span>
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${currentSystemMode === 'live' ? 'text-green-400' : 'text-slate-400'}`}>
                LIVE
              </span>
              <Switch
                checked={currentSystemMode === 'test'}
                onCheckedChange={toggleSystemMode}
                className="data-[state=checked]:bg-orange-500"
              />
              <span className={`text-sm ${currentSystemMode === 'test' ? 'text-orange-400' : 'text-slate-400'}`}>
                TEST
              </span>
            </div>
            <Badge 
              variant={currentSystemMode === 'live' ? 'default' : 'secondary'}
              className={currentSystemMode === 'live' ? 'bg-green-600' : 'bg-orange-600'}
            >
              {currentSystemMode.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Core Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Leads</p>
                  <p className="text-2xl font-bold text-white">
                    {currentSystemMode === 'live' ? (metrics?.totalLeads || 0) : 0}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Automations</p>
                  <p className="text-2xl font-bold text-white">
                    {currentSystemMode === 'live' ? (automationPerformance?.totalFunctions || 1040) : 0}
                  </p>
                </div>
                <Zap className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Success Rate</p>
                  <p className="text-2xl font-bold text-white">
                    {currentSystemMode === 'live' ? (automationPerformance?.successRate || '0%') : '0%'}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">System Status</p>
                  <p className="text-2xl font-bold text-green-400">ONLINE</p>
                </div>
                <Activity className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Command Button Matrix - Primary Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Lead Generation */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Lead Generation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={handleLeadScraping}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={currentSystemMode === 'test'}
              >
                <Search className="w-4 h-4 mr-2" />
                Launch Lead Scraper
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-slate-600 text-slate-300"
                disabled
              >
                <FileText className="w-4 h-4 mr-2" />
                View Lead Reports
              </Button>
            </CardContent>
          </Card>

          {/* Content Creation */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Content Creation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={handleContentCreation}
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={currentSystemMode === 'test'}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Create Content
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-slate-600 text-slate-300"
                disabled
              >
                <Upload className="w-4 h-4 mr-2" />
                Schedule Posts
              </Button>
            </CardContent>
          </Card>

          {/* Automation Management */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Automation Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={handleAutomationTest}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={currentSystemMode === 'test'}
              >
                <Zap className="w-4 h-4 mr-2" />
                Test Automation
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-slate-600 text-slate-300"
                disabled
              >
                <Settings className="w-4 h-4 mr-2" />
                Configure Rules
              </Button>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Monitor className="w-5 h-5 mr-2" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={handleSystemHealthCheck}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                <Monitor className="w-4 h-4 mr-2" />
                Health Check
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-slate-600 text-slate-300"
                disabled
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                View Alerts
              </Button>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full border-slate-600 text-slate-300"
                disabled
              >
                <Database className="w-4 h-4 mr-2" />
                Sync CRM
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-slate-600 text-slate-300"
                disabled
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Backup Data
              </Button>
            </CardContent>
          </Card>

          {/* Communication */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Communication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full border-slate-600 text-slate-300"
                disabled
              >
                <Phone className="w-4 h-4 mr-2" />
                Voice Calls
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-slate-600 text-slate-300"
                disabled
              >
                <Mail className="w-4 h-4 mr-2" />
                Email Campaigns
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Test Mode Warning */}
        {currentSystemMode === 'test' && (
          <Card className="bg-orange-900 border-orange-700 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-orange-400" />
                <div>
                  <h3 className="text-orange-100 font-semibold">Test Mode Active</h3>
                  <p className="text-orange-200 text-sm">
                    All automation functions are disabled. No real data will be processed.
                    Toggle to LIVE mode to access full functionality.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Live Mode Active Functions */}
        {currentSystemMode === 'live' && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Active System Functions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {automationPerformance?.totalFunctions || 1040}
                  </div>
                  <div className="text-slate-400 text-sm">Total Functions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {automationPerformance?.activeFunctions || 0}
                  </div>
                  <div className="text-slate-400 text-sm">Active Functions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {automationPerformance?.executionsToday || 0}
                  </div>
                  <div className="text-slate-400 text-sm">Executions Today</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}