import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Rocket, 
  Server, 
  TrendingUp, 
  AlertTriangle, 
  Play, 
  Square, 
  RotateCcw,
  Settings,
  DollarSign,
  Zap,
  Target,
  Activity
} from 'lucide-react';

interface BotDeployment {
  id: string;
  name: string;
  status: 'deploying' | 'active' | 'failed' | 'stopped';
  region: string;
  cpu: number;
  memory: number;
  callsPerHour: number;
  revenue: number;
  uptime: string;
  lastDeployed: string;
}

interface AutoScalingConfig {
  minBots: number;
  maxBots: number;
  cpuThreshold: number;
  memoryThreshold: number;
  scaleUpCooldown: number;
  scaleDownCooldown: number;
}

export default function DeploymentControl() {
  const [deployments, setDeployments] = useState<BotDeployment[]>([
    {
      id: 'bot-001',
      name: 'Sales Assistant Pro',
      status: 'active',
      region: 'US-East',
      cpu: 75,
      memory: 82,
      callsPerHour: 45,
      revenue: 2850,
      uptime: '99.9%',
      lastDeployed: '2 hours ago'
    },
    {
      id: 'bot-002', 
      name: 'Lead Qualifier Elite',
      status: 'active',
      region: 'US-West',
      cpu: 68,
      memory: 71,
      callsPerHour: 38,
      revenue: 2340,
      uptime: '99.7%',
      lastDeployed: '45 mins ago'
    },
    {
      id: 'bot-003',
      name: 'Support Bot Ultra',
      status: 'deploying',
      region: 'EU-Central',
      cpu: 0,
      memory: 0,
      callsPerHour: 0,
      revenue: 0,
      uptime: '0%',
      lastDeployed: 'Deploying...'
    }
  ]);

  const [scalingConfig, setScalingConfig] = useState<AutoScalingConfig>({
    minBots: 3,
    maxBots: 50,
    cpuThreshold: 80,
    memoryThreshold: 85,
    scaleUpCooldown: 300,
    scaleDownCooldown: 600
  });

  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [isDeploying, setIsDeploying] = useState(false);

  // Simulate deployment progress
  useEffect(() => {
    if (isDeploying) {
      const interval = setInterval(() => {
        setDeploymentProgress(prev => {
          if (prev >= 100) {
            setIsDeploying(false);
            return 0;
          }
          return prev + 10;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isDeploying]);

  const handleMassDeployment = () => {
    setIsDeploying(true);
    setDeploymentProgress(0);
  };

  const getTotalMetrics = () => {
    const active = deployments.filter(d => d.status === 'active');
    return {
      totalBots: deployments.length,
      activeBots: active.length,
      totalCalls: active.reduce((sum, bot) => sum + bot.callsPerHour, 0),
      totalRevenue: active.reduce((sum, bot) => sum + bot.revenue, 0),
      avgCpu: active.reduce((sum, bot) => sum + bot.cpu, 0) / active.length || 0,
      avgMemory: active.reduce((sum, bot) => sum + bot.memory, 0) / active.length || 0
    };
  };

  const metrics = getTotalMetrics();

  return (
    <div className="space-y-6">
      {/* Deployment Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Bots</p>
                <p className="text-2xl font-bold">{metrics.activeBots}</p>
              </div>
              <Server className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Calls/Hour</p>
                <p className="text-2xl font-bold">{metrics.totalCalls}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Revenue/Day</p>
                <p className="text-2xl font-bold">${metrics.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg CPU</p>
                <p className="text-2xl font-bold">{metrics.avgCpu.toFixed(1)}%</p>
              </div>
              <Zap className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mass Deployment Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Mass Deployment Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button 
                onClick={handleMassDeployment}
                disabled={isDeploying}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <Rocket className="h-4 w-4 mr-2" />
                Deploy 10 Bots
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configure Templates
              </Button>
              <Button variant="outline">
                <Target className="h-4 w-4 mr-2" />
                Load Test
              </Button>
            </div>

            {isDeploying && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Deployment Progress</span>
                  <span>{deploymentProgress}%</span>
                </div>
                <Progress value={deploymentProgress} className="h-2" />
                <p className="text-sm text-gray-600">
                  Deploying to regions: US-East, US-West, EU-Central, APAC...
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Auto-Scaling Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Auto-Scaling Engine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Min Bots</label>
              <div className="flex items-center mt-1">
                <span className="text-2xl font-bold text-green-600">{scalingConfig.minBots}</span>
                <span className="text-sm text-gray-500 ml-2">Always running</span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Max Bots</label>
              <div className="flex items-center mt-1">
                <span className="text-2xl font-bold text-red-600">{scalingConfig.maxBots}</span>
                <span className="text-sm text-gray-500 ml-2">Scale limit</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">CPU Trigger</label>
              <div className="flex items-center mt-1">
                <span className="text-2xl font-bold text-orange-600">{scalingConfig.cpuThreshold}%</span>
                <span className="text-sm text-gray-500 ml-2">Scale up</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">Auto-scaling Active</span>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              System will auto-deploy 3 new bots when CPU exceeds 80% for 5+ minutes
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bot Fleet Management */}
      <Card>
        <CardHeader>
          <CardTitle>Bot Fleet Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deployments.map((bot) => (
              <div key={bot.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Badge 
                    variant={bot.status === 'active' ? 'default' : 
                            bot.status === 'deploying' ? 'secondary' : 
                            bot.status === 'failed' ? 'destructive' : 'outline'}
                  >
                    {bot.status}
                  </Badge>
                  
                  <div>
                    <h4 className="font-medium">{bot.name}</h4>
                    <p className="text-sm text-gray-600">{bot.region} • {bot.lastDeployed}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">CPU</p>
                    <p className="font-medium">{bot.cpu}%</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Calls/hr</p>
                    <p className="font-medium">{bot.callsPerHour}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Revenue</p>
                    <p className="font-medium">${bot.revenue}</p>
                  </div>

                  <div className="flex gap-1">
                    <Button size="sm" variant="outline">
                      <Play className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Square className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <Button variant="outline">
              <Play className="h-4 w-4 mr-2" />
              Start All
            </Button>
            <Button variant="outline">
              <Square className="h-4 w-4 mr-2" />
              Stop All
            </Button>
            <Button variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Restart All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}