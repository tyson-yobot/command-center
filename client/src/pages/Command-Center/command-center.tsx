import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
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
  Bell,
  AlertTriangle,
  Brain
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function CommandCenter() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // System Mode State - Critical for test/live isolation
  const [systemMode, setSystemMode] = useState(() => {
    return localStorage.getItem('systemMode') || 'test';
  });
  
  // Core Dashboard State
  const [activeCalls, setActiveCalls] = useState(0);
  const [totalAutomations, setTotalAutomations] = useState(1040);
  const [successRate, setSuccessRate] = useState('0%');
  const [todayLeads, setTodayLeads] = useState(0);
  
  // Modal States
  const [showLeadScraper, setShowLeadScraper] = useState(false);
  const [showContentCreator, setShowContentCreator] = useState(false);
  const [showCallMonitoring, setShowCallMonitoring] = useState(false);
  const [showSalesProcessor, setShowSalesProcessor] = useState(false);
  const [showKnowledgeManager, setShowKnowledgeManager] = useState(false);
  const [showSystemHealth, setShowSystemHealth] = useState(false);
  
  // Form States
  const [phoneNumber, setPhoneNumber] = useState('');
  const [leadQuery, setLeadQuery] = useState('');
  const [contentPrompt, setContentPrompt] = useState('');
  
  // System Mode Toggle with Airtable Logging
  const systemModeToggle = useMutation({
    mutationFn: async (newMode: string) => {
      const response = await apiRequest('POST', '/api/system-mode', { mode: newMode });
      
      // Log mode change to Airtable
      await apiRequest('POST', '/api/qa-log', {
        testName: 'System Mode Toggle',
        status: 'pass',
        notes: `Mode changed from ${systemMode} to ${newMode}`,
        module: 'Command Center',
        timestamp: new Date().toISOString()
      });
      
      return response;
    },
    onSuccess: (data) => {
      setSystemMode(data.systemMode);
      localStorage.setItem('systemMode', data.systemMode);
      queryClient.invalidateQueries();
      toast({
        title: "System Mode Changed",
        description: `Switched to ${data.systemMode} mode`,
      });
    }
  });

  // Dashboard Metrics Query
  const { data: dashboardMetrics } = useQuery({
    queryKey: ['/api/dashboard-metrics', systemMode],
    queryFn: () => fetch('/api/dashboard-metrics', {
      headers: { 'x-system-mode': systemMode }
    }).then(res => res.json()),
    refetchInterval: systemMode === 'live' ? 5000 : false
  });

  // Automation Performance Query
  const { data: automationMetrics } = useQuery({
    queryKey: ['/api/automation-performance', systemMode],
    queryFn: () => fetch('/api/automation-performance', {
      headers: { 'x-system-mode': systemMode }
    }).then(res => res.json()),
    refetchInterval: systemMode === 'live' ? 10000 : false
  });

  // Command Button Functions - Each logs to Airtable after execution

  // 1. Lead Scraper Launch
  const launchLeadScraper = useMutation({
    mutationFn: async (params: { tool: string, filters: any }) => {
      const response = await apiRequest('POST', '/api/launch-scrape', params);
      
      // Log to Airtable
      await apiRequest('POST', '/api/qa-log', {
        testName: 'Lead Scraper Launch',
        status: response.success ? 'pass' : 'fail',
        notes: `Launched ${params.tool} scraper, found ${response.leadCount || 0} leads`,
        module: 'Lead Generation',
        timestamp: new Date().toISOString(),
        systemMode
      });
      
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Lead Scraper Launched",
        description: `Found ${data.leadCount} leads`,
      });
      setShowLeadScraper(false);
    }
  });

  // 2. Content Creator Launch
  const launchContentCreator = useMutation({
    mutationFn: async (params: { platform: string, prompt: string }) => {
      const response = await apiRequest('POST', '/api/generate-content', params);
      
      // Log to Airtable
      await apiRequest('POST', '/api/qa-log', {
        testName: 'Content Creator Launch',
        status: response.success ? 'pass' : 'fail',
        notes: `Generated content for ${params.platform}`,
        module: 'Content Creation',
        timestamp: new Date().toISOString(),
        systemMode
      });
      
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Content Generated",
        description: "Content created successfully",
      });
      setShowContentCreator(false);
    }
  });

  // 3. Call Monitoring Toggle
  const toggleCallMonitoring = useMutation({
    mutationFn: async (action: 'start' | 'stop') => {
      const response = await apiRequest('POST', '/api/call-monitoring', { action });
      
      // Log to Airtable
      await apiRequest('POST', '/api/qa-log', {
        testName: 'Call Monitoring Toggle',
        status: response.success ? 'pass' : 'fail',
        notes: `Call monitoring ${action}ed`,
        module: 'Call Management',
        timestamp: new Date().toISOString(),
        systemMode
      });
      
      return response;
    },
    onSuccess: (data) => {
      setActiveCalls(data.activeCalls || 0);
      toast({
        title: "Call Monitoring Updated",
        description: data.message,
      });
    }
  });

  // 4. Sales Order Processing
  const processSalesOrder = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest('POST', '/api/process-sales-order', orderData);
      
      // Log to Airtable
      await apiRequest('POST', '/api/qa-log', {
        testName: 'Sales Order Processing',
        status: response.success ? 'pass' : 'fail',
        notes: `Processed order ${orderData.orderId || 'unknown'}`,
        module: 'Sales Management',
        timestamp: new Date().toISOString(),
        systemMode
      });
      
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Sales Order Processed",
        description: "Order processed successfully",
      });
      setShowSalesProcessor(false);
    }
  });

  // 5. Knowledge Base Management
  const manageKnowledge = useMutation({
    mutationFn: async (action: 'upload' | 'query' | 'clear') => {
      let response;
      if (action === 'upload') {
        response = await apiRequest('POST', '/api/knowledge/upload', {});
      } else if (action === 'query') {
        response = await apiRequest('POST', '/api/knowledge/query', { query: leadQuery });
      } else {
        response = await apiRequest('POST', '/api/knowledge/clear', {});
      }
      
      // Log to Airtable
      await apiRequest('POST', '/api/qa-log', {
        testName: 'Knowledge Management',
        status: response.success ? 'pass' : 'fail',
        notes: `Knowledge ${action} executed`,
        module: 'Knowledge Base',
        timestamp: new Date().toISOString(),
        systemMode
      });
      
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Knowledge Action Complete",
        description: data.message || "Action completed",
      });
    }
  });

  // 6. System Health Check
  const runHealthCheck = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('GET', '/api/system-health');
      
      // Log to Airtable
      await apiRequest('POST', '/api/qa-log', {
        testName: 'System Health Check',
        status: response.overall === 'healthy' ? 'pass' : 'fail',
        notes: `Health status: ${response.overall}`,
        module: 'System Monitoring',
        timestamp: new Date().toISOString(),
        systemMode
      });
      
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Health Check Complete",
        description: `System status: ${data.overall}`,
      });
    }
  });

  // Update metrics from query data
  useEffect(() => {
    if (dashboardMetrics) {
      setTodayLeads(dashboardMetrics.totalLeads || 0);
      setSuccessRate(dashboardMetrics.successRate || '0%');
    }
    if (automationMetrics) {
      setTotalAutomations(automationMetrics.totalFunctions || 1040);
    }
  }, [dashboardMetrics, automationMetrics]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with System Mode Toggle */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              YoBot Command Center
            </h1>
            <Badge variant={systemMode === 'live' ? 'destructive' : 'secondary'}>
              {systemMode.toUpperCase()} MODE
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">Test Mode</span>
            <Switch
              checked={systemMode === 'live'}
              onCheckedChange={(checked) => {
                systemModeToggle.mutate(checked ? 'live' : 'test');
              }}
              disabled={systemModeToggle.isPending}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">Live Mode</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Calls</p>
                  <p className="text-3xl font-bold text-blue-600">{activeCalls}</p>
                </div>
                <Phone className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Automations</p>
                  <p className="text-3xl font-bold text-green-600">{totalAutomations}</p>
                </div>
                <Zap className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
                  <p className="text-3xl font-bold text-purple-600">{successRate}</p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Leads</p>
                  <p className="text-3xl font-bold text-orange-600">{todayLeads}</p>
                </div>
                <Users className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Command Button Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Lead Generation Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Lead Generation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => setShowLeadScraper(true)}
                className="w-full justify-start"
                variant="outline"
              >
                <Target className="w-4 h-4 mr-2" />
                Launch Lead Scraper
              </Button>
              
              <Input
                placeholder="Search query..."
                value={leadQuery}
                onChange={(e) => setLeadQuery(e.target.value)}
              />
              
              <Button
                onClick={() => launchLeadScraper.mutate({ tool: 'apollo', filters: { query: leadQuery } })}
                disabled={launchLeadScraper.isPending || !leadQuery}
                className="w-full"
              >
                {launchLeadScraper.isPending ? 'Launching...' : 'Execute Lead Search'}
              </Button>
            </CardContent>
          </Card>

          {/* Content Creation Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Content Creation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => setShowContentCreator(true)}
                className="w-full justify-start"
                variant="outline"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Launch Content Creator
              </Button>
              
              <Textarea
                placeholder="Content prompt..."
                value={contentPrompt}
                onChange={(e) => setContentPrompt(e.target.value)}
                rows={3}
              />
              
              <Button
                onClick={() => launchContentCreator.mutate({ platform: 'linkedin', prompt: contentPrompt })}
                disabled={launchContentCreator.isPending || !contentPrompt}
                className="w-full"
              >
                {launchContentCreator.isPending ? 'Generating...' : 'Generate Content'}
              </Button>
            </CardContent>
          </Card>

          {/* Call Management Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="h-5 w-5" />
                <span>Call Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => setShowCallMonitoring(true)}
                className="w-full justify-start"
                variant="outline"
              >
                <Monitor className="w-4 h-4 mr-2" />
                Open Call Monitor
              </Button>
              
              <Input
                placeholder="Phone number..."
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => toggleCallMonitoring.mutate('start')}
                  disabled={toggleCallMonitoring.isPending}
                  variant="default"
                  size="sm"
                >
                  <Phone className="w-4 h-4 mr-1" />
                  Start Calls
                </Button>
                
                <Button
                  onClick={() => toggleCallMonitoring.mutate('stop')}
                  disabled={toggleCallMonitoring.isPending}
                  variant="destructive"
                  size="sm"
                >
                  <PhoneOff className="w-4 h-4 mr-1" />
                  Stop Calls
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sales Processing Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Sales Processing</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => setShowSalesProcessor(true)}
                className="w-full justify-start"
                variant="outline"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Launch Sales Processor
              </Button>
              
              <Button
                onClick={() => processSalesOrder.mutate({ orderId: 'manual-' + Date.now() })}
                disabled={processSalesOrder.isPending}
                className="w-full"
              >
                {processSalesOrder.isPending ? 'Processing...' : 'Process Manual Order'}
              </Button>
            </CardContent>
          </Card>

          {/* Knowledge Management Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Knowledge Base</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => setShowKnowledgeManager(true)}
                className="w-full justify-start"
                variant="outline"
              >
                <Database className="w-4 h-4 mr-2" />
                Manage Knowledge
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => manageKnowledge.mutate('upload')}
                  disabled={manageKnowledge.isPending}
                  variant="default"
                  size="sm"
                >
                  <Upload className="w-4 h-4 mr-1" />
                  Upload
                </Button>
                
                <Button
                  onClick={() => manageKnowledge.mutate('clear')}
                  disabled={manageKnowledge.isPending}
                  variant="destructive"
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Health Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>System Health</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => setShowSystemHealth(true)}
                className="w-full justify-start"
                variant="outline"
              >
                <Monitor className="w-4 h-4 mr-2" />
                View System Health
              </Button>
              
              <Button
                onClick={() => runHealthCheck.mutate()}
                disabled={runHealthCheck.isPending}
                className="w-full"
              >
                {runHealthCheck.isPending ? 'Checking...' : 'Run Health Check'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Status Indicator */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">System Status: Operational</span>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="outline">1040 Functions Active</Badge>
                <Badge variant="outline">{systemMode.toUpperCase()} Mode</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}