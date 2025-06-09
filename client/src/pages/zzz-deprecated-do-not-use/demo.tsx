import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Phone, 
  Users, 
  DollarSign,
  Activity,
  Play,
  Pause,
  RefreshCw,
  Eye
} from 'lucide-react';

export default function DemoMode() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [demoMetrics, setDemoMetrics] = useState({
    calls: 0,
    conversions: 0,
    leads: 0,
    pipeline: 0
  });

  // Demo animation - simulates real activity
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setDemoMetrics(prev => ({
        calls: Math.min(prev.calls + Math.floor(Math.random() * 3), 47),
        conversions: Math.min(prev.conversions + (Math.random() > 0.7 ? 1 : 0), 12),
        leads: Math.min(prev.leads + (Math.random() > 0.8 ? 1 : 0), 18),
        pipeline: Math.min(prev.pipeline + Math.floor(Math.random() * 2500), 125000)
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const resetDemo = () => {
    setDemoMetrics({ calls: 0, conversions: 0, leads: 0, pipeline: 0 });
    setIsPlaying(false);
  };

  const demoActivities = [
    { time: 'Live', action: 'New lead captured from inbound call', company: 'Prospect Corp', value: '$15,000' },
    { time: '2 min ago', action: 'Meeting scheduled automatically', company: 'TechStart Inc', value: '$8,500' },
    { time: '5 min ago', action: 'Quote generated and sent', company: 'Global Solutions', value: '$22,000' },
    { time: '8 min ago', action: 'Follow-up call completed', company: 'Innovate LLC', value: '$12,500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Demo Controls Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                YoBot® Live Demo Environment
              </h1>
              <p className="text-slate-300">Interactive sandbox for showcasing AI automation capabilities</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`${isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
              >
                {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isPlaying ? 'Pause Demo' : 'Start Demo'}
              </Button>
              <Button onClick={resetDemo} className="bg-slate-600 hover:bg-slate-700 text-white">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Demo Status Bar */}
        <div className="mb-6 p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
              <span className="text-white font-medium">
                Demo Status: {isPlaying ? 'Live Simulation Running' : 'Paused'}
              </span>
            </div>
            <Badge className="bg-blue-600 text-white">
              <Eye className="w-3 h-3 mr-1" />
              Demo Mode
            </Badge>
          </div>
        </div>

        {/* Live Demo Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center space-x-2 text-sm">
                <Phone className="w-4 h-4 text-green-400" />
                <span>Calls Handled Today</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{demoMetrics.calls}</div>
              <div className="text-green-400 text-xs flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{Math.floor(demoMetrics.calls * 0.3)} from yesterday
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center space-x-2 text-sm">
                <Activity className="w-4 h-4 text-blue-400" />
                <span>Conversions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{demoMetrics.conversions}</div>
              <div className="text-blue-400 text-xs">
                {demoMetrics.calls > 0 ? Math.round((demoMetrics.conversions / demoMetrics.calls) * 100) : 0}% conversion rate
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center space-x-2 text-sm">
                <Users className="w-4 h-4 text-purple-400" />
                <span>New Leads</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{demoMetrics.leads}</div>
              <div className="text-purple-400 text-xs">
                Qualified prospects captured
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center space-x-2 text-sm">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span>Pipeline Value</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ${demoMetrics.pipeline.toLocaleString()}
              </div>
              <div className="text-green-400 text-xs">Active opportunities</div>
            </CardContent>
          </Card>
        </div>

        {/* Demo Features Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white">ROI Impact Simulation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <div className="text-green-400 text-2xl font-bold">
                    {Math.floor(demoMetrics.calls * 2.7)}
                  </div>
                  <div className="text-slate-300 text-sm">Hours Saved</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <div className="text-blue-400 text-2xl font-bold">
                    ${Math.floor(demoMetrics.pipeline * 0.12).toLocaleString()}
                  </div>
                  <div className="text-slate-300 text-sm">Revenue Captured</div>
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-300 text-sm">Monthly Cost Savings</span>
                  <span className="text-green-400 font-bold">
                    ${Math.floor(demoMetrics.calls * 85).toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-green-400 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min((demoMetrics.calls / 47) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Live Activity Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {demoActivities.slice(0, isPlaying ? 4 : 2).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${index === 0 && isPlaying ? 'bg-green-400 animate-pulse' : 'bg-blue-400'}`}></div>
                      <div>
                        <div className="text-white text-sm">{activity.action}</div>
                        <div className="text-slate-400 text-xs">{activity.company}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 text-sm font-bold">{activity.value}</div>
                      <div className="text-slate-400 text-xs">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Demo Instructions */}
        <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Demo Instructions for Prospects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">1</span>
                </div>
                <h3 className="text-white font-medium mb-2">Start Simulation</h3>
                <p className="text-slate-300 text-sm">Click "Start Demo" to begin the live simulation of your YoBot automation in action</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">2</span>
                </div>
                <h3 className="text-white font-medium mb-2">Watch Metrics</h3>
                <p className="text-slate-300 text-sm">Observe real-time updates to calls, conversions, and pipeline value as your bot works</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">3</span>
                </div>
                <h3 className="text-white font-medium mb-2">See ROI Impact</h3>
                <p className="text-slate-300 text-sm">Track hours saved and revenue captured to understand your automation's business value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}