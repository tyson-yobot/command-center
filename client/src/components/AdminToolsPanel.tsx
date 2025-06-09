import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  RefreshCw, 
  TestTube, 
  PlayCircle, 
  Download, 
  Key, 
  AlertTriangle,
  Loader2,
  Shield,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminAction {
  action: string;
  timestamp: string;
  user: string;
  result: 'success' | 'error';
  details?: string;
}

export default function AdminToolsPanel() {
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorSimType, setErrorSimType] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get admin action log
  const { data: actionLog } = useQuery<{ actions: AdminAction[] }>({
    queryKey: ['/api/admin-tools/action-log'],
    enabled: isAuthenticated,
    refetchInterval: 10000,
  });

  // Admin actions mutations
  const restartWorkflowMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin-tools/restart-workflow', {
        method: 'POST',
        headers: {
          'x-admin-password': adminPassword,
          'x-admin-user': 'Command Center'
        }
      });
      if (!response.ok) throw new Error('Failed to restart workflow');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Workflow restart initiated' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin-tools/action-log'] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to restart workflow', variant: 'destructive' });
    }
  });

  // Test injection functions removed - live mode only

  const refreshApiKeysMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin-tools/refresh-api-keys', {
        method: 'POST',
        headers: {
          'x-admin-password': adminPassword,
          'x-admin-user': 'Command Center'
        }
      });
      if (!response.ok) throw new Error('Failed to refresh API keys');
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: 'Success', description: `API validation completed for ${Object.keys(data.results).length} services` });
      queryClient.invalidateQueries({ queryKey: ['/api/admin-tools/action-log'] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to refresh API keys', variant: 'destructive' });
    }
  });

  const triggerErrorSimMutation = useMutation({
    mutationFn: async (errorType: string) => {
      const response = await fetch('/api/admin-tools/trigger-error-sim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword,
          'x-admin-user': 'Command Center'
        },
        body: JSON.stringify({ errorType })
      });
      if (!response.ok) throw new Error('Failed to trigger error simulation');
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: 'Simulation Complete', description: data.simulatedError });
      queryClient.invalidateQueries({ queryKey: ['/api/admin-tools/action-log'] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to run error simulation', variant: 'destructive' });
    }
  });

  const exportLogsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin-tools/export-logs', {
        headers: { 'x-admin-password': adminPassword }
      });
      if (!response.ok) throw new Error('Failed to export logs');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'admin-logs.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Admin logs exported successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to export logs', variant: 'destructive' });
    }
  });

  const authenticate = () => {
    if (adminPassword.length > 0) {
      setIsAuthenticated(true);
      toast({ title: 'Authenticated', description: 'Admin access granted' });
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Admin Tools Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-slate-400 text-sm">Enter admin password to access system controls</p>
            <div className="flex space-x-2">
              <Input
                type="password"
                placeholder="Admin Password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                onKeyPress={(e) => e.key === 'Enter' && authenticate()}
              />
              <Button onClick={authenticate} className="bg-blue-600 hover:bg-blue-700">
                Authenticate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Admin Tools Panel
          </span>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            AUTHENTICATED
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Restart Workflow */}
          <Button
            variant="outline"
            onClick={() => restartWorkflowMutation.mutate()}
            disabled={restartWorkflowMutation.isPending}
            className="h-20 flex-col border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            {restartWorkflowMutation.isPending ? (
              <Loader2 className="w-6 h-6 mb-2 animate-spin" />
            ) : (
              <RefreshCw className="w-6 h-6 mb-2" />
            )}
            <span className="text-sm">Restart Workflow</span>
          </Button>

          {/* Test injection buttons removed - live mode only */}

          {/* Export Logs */}
          <Button
            variant="outline"
            onClick={() => exportLogsMutation.mutate()}
            disabled={exportLogsMutation.isPending}
            className="h-20 flex-col border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            {exportLogsMutation.isPending ? (
              <Loader2 className="w-6 h-6 mb-2 animate-spin" />
            ) : (
              <Download className="w-6 h-6 mb-2" />
            )}
            <span className="text-sm">Export Logs</span>
          </Button>

          {/* Refresh API Keys */}
          <Button
            variant="outline"
            onClick={() => refreshApiKeysMutation.mutate()}
            disabled={refreshApiKeysMutation.isPending}
            className="h-20 flex-col border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            {refreshApiKeysMutation.isPending ? (
              <Loader2 className="w-6 h-6 mb-2 animate-spin" />
            ) : (
              <Key className="w-6 h-6 mb-2" />
            )}
            <span className="text-sm">Refresh API Keys</span>
          </Button>

          {/* Trigger Error Simulation */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="h-20 flex-col border-red-600 text-red-400 hover:bg-red-900/20"
              >
                <AlertTriangle className="w-6 h-6 mb-2" />
                <span className="text-sm">Error Simulation</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Trigger Error Simulation</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={errorSimType} onValueChange={setErrorSimType}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select error type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="voice_failure">Voice Generation Failure</SelectItem>
                    <SelectItem value="crm_sync_error">CRM Sync Error</SelectItem>
                    <SelectItem value="webhook_timeout">Webhook Timeout</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => triggerErrorSimMutation.mutate(errorSimType)}
                  disabled={!errorSimType || triggerErrorSimMutation.isPending}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  {triggerErrorSimMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 mr-2" />
                  )}
                  Trigger Simulation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Recent Admin Actions */}
        {actionLog && actionLog.actions.length > 0 && (
          <div>
            <h4 className="text-white font-medium mb-3">Recent Admin Actions</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {actionLog.actions.slice(0, 10).map((action, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-slate-700/30 rounded border border-slate-600/50"
                >
                  <div className="flex items-center space-x-2">
                    {action.result === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <div>
                      <div className="text-white text-sm">{action.action}</div>
                      <div className="text-slate-400 text-xs">
                        {new Date(action.timestamp).toLocaleTimeString()} by {action.user}
                      </div>
                    </div>
                  </div>
                  <Badge
                    className={
                      action.result === 'success'
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }
                  >
                    {action.result.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}