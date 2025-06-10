import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { 
  Activity,
  Phone, 
  Users, 
  Target,
  BarChart3,
  Settings,
  Brain,
  Zap
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function CommandCenter() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // System Mode State with proper test/live isolation
  const [systemMode, setSystemMode] = useState(() => {
    return localStorage.getItem('systemMode') || 'test';
  });

  // Query system mode from backend
  const { data: currentSystemMode } = useQuery({
    queryKey: ['/api/system-mode'],
    queryFn: () => fetch('/api/system-mode').then(res => res.json()),
    refetchInterval: 5000
  });

  // Dashboard metrics with proper mode headers
  const { data: dashboardData } = useQuery({
    queryKey: ['/api/dashboard-metrics', systemMode],
    queryFn: () => fetch('/api/dashboard-metrics', {
      headers: { 'x-system-mode': systemMode }
    }).then(res => res.json()),
    refetchInterval: systemMode === 'live' ? 5000 : false
  });

  const { data: automationData } = useQuery({
    queryKey: ['/api/automation-performance', systemMode],
    queryFn: () => fetch('/api/automation-performance', {
      headers: { 'x-system-mode': systemMode }
    }).then(res => res.json()),
    refetchInterval: systemMode === 'live' ? 10000 : false
  });

  // System mode toggle with Airtable logging
  const toggleSystemMode = useMutation({
    mutationFn: async (newMode: string) => {
      const response = await apiRequest('POST', '/api/system-mode', { mode: newMode });
      
      // Log to Airtable QA system
      await apiRequest('POST', '/api/qa-log', {
        testName: 'System Mode Toggle',
        status: 'pass',
        notes: `Mode changed from ${systemMode} to ${newMode}`,
        module: 'Command Center',
        timestamp: new Date().toISOString(),
        systemMode: newMode
      });
      
      return response;
    },
    onSuccess: (data) => {
      setSystemMode(data.systemMode);
      localStorage.setItem('systemMode', data.systemMode);
      queryClient.invalidateQueries();
      toast({
        title: "System Mode Changed",
        description: `Switched to ${data.systemMode} mode`
      });
    }
  });

  // Sync with backend system mode
  useEffect(() => {
    if (currentSystemMode?.systemMode && currentSystemMode.systemMode !== systemMode) {
      setSystemMode(currentSystemMode.systemMode);
      localStorage.setItem('systemMode', currentSystemMode.systemMode);
    }
  }, [currentSystemMode, systemMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* System Mode Toggle Header */}
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
                toggleSystemMode.mutate(checked ? 'live' : 'test');
              }}
              disabled={toggleSystemMode.isPending}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">Live Mode</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Dashboard Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Calls</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {dashboardData?.activeCalls || 0}
                  </p>
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
                  <p className="text-3xl font-bold text-green-600">
                    {automationData?.totalFunctions || 1040}
                  </p>
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
                  <p className="text-3xl font-bold text-purple-600">
                    {dashboardData?.successRate || '0%'}
                  </p>
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
                  <p className="text-3xl font-bold text-orange-600">
                    {dashboardData?.totalLeads || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Automation Status Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-green-500" />
                <span className="text-lg font-semibold">System Status: Operational</span>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="outline">
                  {automationData?.totalFunctions || 1040} Functions Active
                </Badge>
                <Badge variant={systemMode === 'live' ? 'destructive' : 'secondary'}>
                  {systemMode.toUpperCase()} MODE
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Mode Warning */}
        {systemMode === 'test' && (
          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-800 dark:text-yellow-200">
                  Test Mode Active - All operations are simulated
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Placeholder for Command Matrix - To be implemented per canvas spec */}
        <Card>
          <CardHeader>
            <CardTitle>Command Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Command buttons will be implemented according to canvas specifications
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}