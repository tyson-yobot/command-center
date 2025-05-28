import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  Power, 
  RefreshCw,
  Zap,
  Database,
  Network,
  Settings,
  Users,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

interface SystemStatus {
  component: string;
  status: 'healthy' | 'warning' | 'critical';
  uptime: string;
  lastChecked: string;
}

interface EmergencyProtocol {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  automated: boolean;
  lastTriggered?: string;
}

export default function EmergencyControl() {
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [isExecutingProtocol, setIsExecutingProtocol] = useState(false);

  const systemStatus: SystemStatus[] = [
    {
      component: 'Bot Fleet',
      status: 'healthy',
      uptime: '99.9%',
      lastChecked: '30s ago'
    },
    {
      component: 'API Gateway',
      status: 'healthy', 
      uptime: '99.8%',
      lastChecked: '15s ago'
    },
    {
      component: 'Database Cluster',
      status: 'warning',
      uptime: '98.2%',
      lastChecked: '45s ago'
    },
    {
      component: 'Load Balancer',
      status: 'healthy',
      uptime: '100%',
      lastChecked: '20s ago'
    },
    {
      component: 'Monitoring System',
      status: 'healthy',
      uptime: '99.7%',
      lastChecked: '10s ago'
    }
  ];

  const emergencyProtocols: EmergencyProtocol[] = [
    {
      id: 'failover',
      name: 'Automatic Failover',
      description: 'Switch to backup systems when primary fails',
      severity: 'critical',
      automated: true,
      lastTriggered: '3 days ago'
    },
    {
      id: 'rate_limit',
      name: 'Emergency Rate Limiting',
      description: 'Throttle API calls to prevent overload',
      severity: 'high',
      automated: true
    },
    {
      id: 'bot_restart',
      name: 'Mass Bot Restart',
      description: 'Restart all bots simultaneously',
      severity: 'medium',
      automated: false
    },
    {
      id: 'disaster_recovery',
      name: 'Disaster Recovery',
      description: 'Full system backup and restore procedures',
      severity: 'critical',
      automated: false
    }
  ];

  const handleEmergencyStop = () => {
    setIsExecutingProtocol(true);
    setEmergencyMode(true);
    setTimeout(() => {
      setIsExecutingProtocol(false);
    }, 3000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Emergency Status Bar */}
      {emergencyMode && (
        <Alert className="border-red-500 bg-red-50 dark:bg-red-900/20">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700 dark:text-red-300">
            <strong>Emergency Mode Active:</strong> All non-essential bots have been stopped. 
            Core systems are operating in safe mode.
          </AlertDescription>
        </Alert>
      )}

      {/* Ultimate Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Ultimate Control Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant={emergencyMode ? "destructive" : "outline"}
              onClick={handleEmergencyStop}
              disabled={isExecutingProtocol}
              className="h-20 flex-col gap-2"
            >
              <Power className="h-6 w-6" />
              {emergencyMode ? 'Exit Emergency' : 'Emergency Stop'}
            </Button>

            <Button 
              variant="outline"
              className="h-20 flex-col gap-2"
            >
              <RefreshCw className="h-6 w-6" />
              Restart All
            </Button>

            <Button 
              variant="outline"
              className="h-20 flex-col gap-2"
            >
              <Database className="h-6 w-6" />
              Backup Now
            </Button>

            <Button 
              variant="outline"
              className="h-20 flex-col gap-2"
            >
              <Network className="h-6 w-6" />
              Failover Test
            </Button>
          </div>

          {isExecutingProtocol && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                <Zap className="h-4 w-4 animate-pulse" />
                <span className="font-medium">Executing Emergency Protocol...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Health Monitor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            Real-Time System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemStatus.map((system, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(system.status)}
                  <div>
                    <h4 className="font-medium">{system.component}</h4>
                    <p className="text-sm text-gray-600">Last checked: {system.lastChecked}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-medium">Uptime: {system.uptime}</p>
                  <Badge 
                    variant={system.status === 'healthy' ? 'default' : 
                            system.status === 'warning' ? 'secondary' : 'destructive'}
                  >
                    {system.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Protocols */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Emergency Protocols & Disaster Recovery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {emergencyProtocols.map((protocol) => (
              <div key={protocol.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Badge variant={getSeverityColor(protocol.severity)}>
                    {protocol.severity}
                  </Badge>
                  
                  <div>
                    <h4 className="font-medium flex items-center gap-2">
                      {protocol.name}
                      {protocol.automated && (
                        <Badge variant="outline" className="text-xs">
                          Auto
                        </Badge>
                      )}
                    </h4>
                    <p className="text-sm text-gray-600">{protocol.description}</p>
                    {protocol.lastTriggered && (
                      <p className="text-xs text-gray-500">Last triggered: {protocol.lastTriggered}</p>
                    )}
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={protocol.automated}
                >
                  {protocol.automated ? 'Automated' : 'Trigger'}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Operations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-600" />
            Bulk Operations & Configuration Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-16 flex-col gap-2">
              <Users className="h-5 w-5" />
              Push Config to All Bots
            </Button>

            <Button variant="outline" className="h-16 flex-col gap-2">
              <Network className="h-5 w-5" />
              Update API Rate Limits
            </Button>

            <Button variant="outline" className="h-16 flex-col gap-2">
              <Shield className="h-5 w-5" />
              Deploy Security Patch
            </Button>

            <Button variant="outline" className="h-16 flex-col gap-2">
              <Database className="h-5 w-5" />
              Sync Database Schema
            </Button>

            <Button variant="outline" className="h-16 flex-col gap-2">
              <Activity className="h-5 w-5" />
              Run Health Checks
            </Button>

            <Button variant="outline" className="h-16 flex-col gap-2">
              <Zap className="h-5 w-5" />
              Performance Optimization
            </Button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Shield className="h-5 w-5" />
              <span className="font-medium">Enterprise Grade Controls</span>
            </div>
            <p className="text-blue-600 dark:text-blue-400 mt-2">
              All operations are logged, audited, and can be rolled back within 24 hours. 
              Critical changes require dual authentication and approval workflows.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}