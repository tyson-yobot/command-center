import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  TrendingDown, 
  AlertTriangle, 
  Activity, 
  Clock,
  Zap,
  Target,
  Map,
  RefreshCw,
  Download
} from 'lucide-react';

interface PredictiveAlert {
  id: number;
  botId: string;
  prediction: string;
  probability: number;
  timeToFailure: string;
  criticalMetrics: string[];
  recommendedAction: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface RegionLoad {
  region: string;
  activeBots: number;
  load: number;
  avgResponseTime: number;
  status: 'optimal' | 'high' | 'critical';
}

export default function PredictiveMonitoring() {
  const [predictiveAlerts, setPredictiveAlerts] = useState<PredictiveAlert[]>([
    {
      id: 1,
      botId: 'bot-us-west-007',
      prediction: 'Memory leak detected - likely failure in 28 minutes',
      probability: 87,
      timeToFailure: '28 mins',
      criticalMetrics: ['Memory: 94%', 'Response lag: +45%', 'Error rate: 12%'],
      recommendedAction: 'Restart bot immediately',
      severity: 'critical'
    },
    {
      id: 2,
      botId: 'bot-eu-central-012',
      prediction: 'API rate limit approaching - degraded performance expected',
      probability: 72,
      timeToFailure: '15 mins',
      criticalMetrics: ['API calls: 89% of limit', 'Queue backlog: 340'],
      recommendedAction: 'Enable rate limiting',
      severity: 'high'
    }
  ]);

  const [regionLoads, setRegionLoads] = useState<RegionLoad[]>([
    {
      region: 'US-East',
      activeBots: 12,
      load: 68,
      avgResponseTime: 0.24,
      status: 'optimal'
    },
    {
      region: 'US-West',
      activeBots: 8,
      load: 89,
      avgResponseTime: 0.45,
      status: 'high'
    },
    {
      region: 'EU-Central',
      activeBots: 6,
      load: 95,
      avgResponseTime: 0.67,
      status: 'critical'
    },
    {
      region: 'APAC',
      activeBots: 4,
      load: 45,
      avgResponseTime: 0.18,
      status: 'optimal'
    }
  ]);

  const handleSlackAlert = (alertId: number) => {
    // This would integrate with your Slack API
    console.log(`🔔 Sending Slack alert for prediction ${alertId}`);
  };

  const handlePDFExport = () => {
    // This would generate a power report PDF
    console.log('📄 Generating Power Report PDF...');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-600';
      case 'high': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Predictive Failure Detection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Predictive Failure Detection
            {predictiveAlerts.length > 0 && (
              <Badge variant="destructive">
                {predictiveAlerts.length} Predictions
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {predictiveAlerts.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-600">All Systems Stable</h3>
              <p className="text-sm text-gray-600">
                AI monitoring shows no predicted failures in the next 60 minutes
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {predictiveAlerts.map((alert) => (
                <Alert key={alert.id} className="border-orange-500 bg-orange-50 dark:bg-orange-900/20">
                  <div className="flex items-start justify-between w-full">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="h-4 w-4 text-orange-600" />
                        <h4 className="font-semibold text-orange-800 dark:text-orange-200">
                          Bot ID: {alert.botId}
                        </h4>
                        <Badge variant={getSeverityColor(alert.severity)} className="text-xs">
                          {alert.probability}% probability
                        </Badge>
                      </div>
                      
                      <AlertDescription className="text-orange-700 dark:text-orange-300 mb-3">
                        {alert.prediction}
                      </AlertDescription>
                      
                      {/* Time to Failure */}
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-3 w-3 text-orange-600" />
                          <span className="text-sm font-medium">Time to failure: {alert.timeToFailure}</span>
                        </div>
                        <Progress value={alert.probability} className="h-2" />
                      </div>
                      
                      {/* Critical Metrics */}
                      <div className="mb-3">
                        <p className="text-xs text-orange-600 dark:text-orange-400 mb-1">
                          Critical metrics:
                        </p>
                        <div className="flex gap-1 flex-wrap">
                          {alert.criticalMetrics.map((metric, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {metric}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                        Recommended: {alert.recommendedAction}
                      </p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 ml-4">
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white font-bold"
                        onClick={() => handleSlackAlert(alert.id)}
                      >
                        🔔 Alert via Slack
                      </Button>
                      
                      <Button size="sm" variant="outline">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Restart Bot
                      </Button>
                      
                      <Button size="sm" variant="outline">
                        <Zap className="h-3 w-3 mr-1" />
                        Auto-Fix
                      </Button>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Load Distribution Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5 text-blue-600" />
            Global Load Distribution Map
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {regionLoads.map((region) => (
              <div key={region.region} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{region.region}</h4>
                  <Badge 
                    variant={region.status === 'optimal' ? 'default' : 
                            region.status === 'high' ? 'secondary' : 'destructive'}
                  >
                    {region.status}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Active Bots:</span>
                    <span className="font-medium">{region.activeBots}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Load:</span>
                    <span className={`font-medium ${getStatusColor(region.status)}`}>
                      {region.load}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Response Time:</span>
                    <span className="font-medium">{region.avgResponseTime}s</span>
                  </div>
                  
                  <Progress value={region.load} className="h-2 mt-2" />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Activity className="h-5 w-5" />
              <span className="font-medium">Global Performance Summary</span>
            </div>
            <p className="text-blue-600 dark:text-blue-400 mt-2 text-sm">
              30 total bots across 4 regions • Average load: 74% • 
              EU-Central showing high load - consider auto-scaling
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Ultimate Controls with PDF Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Ultimate Controls & Reporting
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Button
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-700 text-white font-bold h-16 flex-col gap-2"
              onClick={handlePDFExport}
            >
              <Download className="h-5 w-5" />
              📄 Download Power Report
            </Button>
            
            <Button variant="outline" className="h-16 flex-col gap-2">
              <RefreshCw className="h-5 w-5" />
              Mass Restart All
            </Button>
            
            <Button variant="outline" className="h-16 flex-col gap-2">
              <Zap className="h-5 w-5" />
              API Rate Limiting
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <Brain className="h-5 w-5" />
              <span className="font-medium">AI-Powered Enterprise Controls</span>
            </div>
            <p className="text-green-600 dark:text-green-400 mt-2 text-sm">
              Predictive monitoring active • Slack/SMS alerts configured • 
              PDF reports include ROI analysis, performance benchmarks, and cost optimization
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}