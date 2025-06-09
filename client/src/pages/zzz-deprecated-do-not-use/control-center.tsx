import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Settings, Activity, AlertTriangle, Power, Zap, 
  Monitor, Server, Database, Wifi, Shield
} from 'lucide-react';

export default function ControlCenter() {
  const { toast } = useToast();
  
  // System states
  const [automationEngine, setAutomationEngine] = useState(true);
  const [voicePipeline, setVoicePipeline] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [leadScraping, setLeadScraping] = useState(true);
  const [aiContent, setAiContent] = useState(true);
  const [crmSync, setCrmSync] = useState(true);
  const [systemHealth, setSystemHealth] = useState(true);
  const [isTestMode, setIsTestMode] = useState(false);

  const handleVoicePipelineToggle = async (enabled: boolean) => {
    setVoicePipeline(enabled);
    
    try {
      const endpoint = enabled ? '/api/calls/start-pipeline' : '/api/calls/stop-pipeline';
      const response = await apiRequest('POST', endpoint, {
        mode: isTestMode ? 'test' : 'live'
      });
      
      if (response.ok) {
        toast({
          title: enabled ? "Voice Pipeline Started" : "Voice Pipeline Stopped",
          description: `Pipeline is now ${enabled ? 'active' : 'inactive'}`,
        });
      }
    } catch (error) {
      setVoicePipeline(!enabled);
      toast({
        title: "Pipeline Error",
        description: "Failed to toggle voice pipeline",
        variant: "destructive"
      });
    }
  };

  const handleEmergencyStop = async () => {
    setVoicePipeline(false);
    
    try {
      await apiRequest('POST', '/api/calls/stop-pipeline');
      toast({
        title: "Emergency Stop Activated",
        description: "All voice operations halted immediately",
        variant: "destructive"
      });
    } catch (error) {
      toast({
        title: "Emergency Stop Error",
        description: "Failed to execute emergency stop",
        variant: "destructive"
      });
    }
  };

  const handleSystemRestart = async () => {
    try {
      await apiRequest('POST', '/api/system/restart');
      toast({
        title: "System Restart Initiated",
        description: "All automation systems restarting",
      });
    } catch (error) {
      toast({
        title: "Restart Error",
        description: "Failed to restart systems",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-6 h-6 bg-red-500 rounded-full animate-pulse"></div>
            <h1 className="text-5xl font-bold text-red-400">
              🚨 CONTROL CENTER 🚨
            </h1>
            <div className="w-6 h-6 bg-red-500 rounded-full animate-pulse"></div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch checked={isTestMode} onCheckedChange={setIsTestMode} />
              <span className="text-white font-bold">
                {isTestMode ? 'TEST MODE' : 'LIVE MODE'}
              </span>
            </div>
            <Badge className={isTestMode ? "bg-yellow-600" : "bg-red-600"}>
              {isTestMode ? 'TESTING' : 'LIVE PRODUCTION'}
            </Badge>
          </div>
        </div>

        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-red-900/50 border-red-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-300 text-sm font-bold">SYSTEM STATUS</p>
                  <p className="text-3xl font-bold text-red-400">OPERATIONAL</p>
                </div>
                <Activity className="w-12 h-12 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-900/50 border-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-300 text-sm font-bold">AUTOMATION</p>
                  <p className="text-3xl font-bold text-green-400">40 ACTIVE</p>
                </div>
                <Zap className="w-12 h-12 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/50 border-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 text-sm font-bold">UPTIME</p>
                  <p className="text-3xl font-bold text-blue-400">99.8%</p>
                </div>
                <Monitor className="w-12 h-12 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-900/50 border-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300 text-sm font-bold">SECURITY</p>
                  <p className="text-3xl font-bold text-purple-400">SECURE</p>
                </div>
                <Shield className="w-12 h-12 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Control Panel */}
        <Card className="bg-slate-800/80 border-red-500/50 mb-8">
          <CardHeader className="border-b border-red-500/30">
            <CardTitle className="text-2xl text-red-400 flex items-center space-x-3">
              <Settings className="w-8 h-8" />
              <span>SYSTEM CONTROL PANEL</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Automation Engine */}
              <div className="bg-red-900/30 border-2 border-red-500/50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Power className="w-6 h-6 text-red-400" />
                    <span className="text-red-300 font-bold">AUTOMATION ENGINE</span>
                  </div>
                  <Switch 
                    checked={automationEngine} 
                    onCheckedChange={setAutomationEngine}
                    className="data-[state=checked]:bg-red-600"
                  />
                </div>
                <div className="text-sm text-red-200">
                  Status: <span className="font-bold">{automationEngine ? 'ACTIVE' : 'DISABLED'}</span>
                </div>
                <div className="text-xs text-red-300 mt-2">40 Functions Running</div>
              </div>

              {/* Voice Pipeline */}
              <div className="bg-blue-900/30 border-2 border-blue-500/50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Wifi className="w-6 h-6 text-blue-400" />
                    <span className="text-blue-300 font-bold">VOICE PIPELINE</span>
                  </div>
                  <Switch 
                    checked={voicePipeline} 
                    onCheckedChange={handleVoicePipelineToggle}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
                <div className="text-sm text-blue-200">
                  Status: <span className="font-bold">{voicePipeline ? 'RUNNING' : 'STANDBY'}</span>
                </div>
                <div className="text-xs text-blue-300 mt-2">
                  {voicePipeline ? 'Active Calls: 0' : 'Ready to Start'}
                </div>
              </div>

              {/* Email Alerts */}
              <div className="bg-green-900/30 border-2 border-green-500/50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-6 h-6 text-green-400" />
                    <span className="text-green-300 font-bold">EMAIL ALERTS</span>
                  </div>
                  <Switch 
                    checked={emailAlerts} 
                    onCheckedChange={setEmailAlerts}
                    className="data-[state=checked]:bg-green-600"
                  />
                </div>
                <div className="text-sm text-green-200">
                  Status: <span className="font-bold">{emailAlerts ? 'ENABLED' : 'DISABLED'}</span>
                </div>
                <div className="text-xs text-green-300 mt-2">Notifications Active</div>
              </div>

              {/* SMS Alerts */}
              <div className="bg-purple-900/30 border-2 border-purple-500/50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Server className="w-6 h-6 text-purple-400" />
                    <span className="text-purple-300 font-bold">SMS ALERTS</span>
                  </div>
                  <Switch 
                    checked={smsAlerts} 
                    onCheckedChange={setSmsAlerts}
                    className="data-[state=checked]:bg-purple-600"
                  />
                </div>
                <div className="text-sm text-purple-200">
                  Status: <span className="font-bold">{smsAlerts ? 'ENABLED' : 'DISABLED'}</span>
                </div>
                <div className="text-xs text-purple-300 mt-2">SMS Gateway Ready</div>
              </div>

              {/* Lead Scraping */}
              <div className="bg-yellow-900/30 border-2 border-yellow-500/50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Database className="w-6 h-6 text-yellow-400" />
                    <span className="text-yellow-300 font-bold">LEAD SCRAPING</span>
                  </div>
                  <Switch 
                    checked={leadScraping} 
                    onCheckedChange={setLeadScraping}
                    className="data-[state=checked]:bg-yellow-600"
                  />
                </div>
                <div className="text-sm text-yellow-200">
                  Status: <span className="font-bold">{leadScraping ? 'ACTIVE' : 'PAUSED'}</span>
                </div>
                <div className="text-xs text-yellow-300 mt-2">Scraping APIs Online</div>
              </div>

              {/* AI Content */}
              <div className="bg-cyan-900/30 border-2 border-cyan-500/50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-6 h-6 text-cyan-400" />
                    <span className="text-cyan-300 font-bold">AI CONTENT</span>
                  </div>
                  <Switch 
                    checked={aiContent} 
                    onCheckedChange={setAiContent}
                    className="data-[state=checked]:bg-cyan-600"
                  />
                </div>
                <div className="text-sm text-cyan-200">
                  Status: <span className="font-bold">{aiContent ? 'GENERATING' : 'PAUSED'}</span>
                </div>
                <div className="text-xs text-cyan-300 mt-2">OpenAI Connected</div>
              </div>

              {/* CRM Sync */}
              <div className="bg-indigo-900/30 border-2 border-indigo-500/50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Monitor className="w-6 h-6 text-indigo-400" />
                    <span className="text-indigo-300 font-bold">CRM SYNC</span>
                  </div>
                  <Switch 
                    checked={crmSync} 
                    onCheckedChange={setCrmSync}
                    className="data-[state=checked]:bg-indigo-600"
                  />
                </div>
                <div className="text-sm text-indigo-200">
                  Status: <span className="font-bold">{crmSync ? 'SYNCING' : 'PAUSED'}</span>
                </div>
                <div className="text-xs text-indigo-300 mt-2">Airtable Connected</div>
              </div>

              {/* System Health */}
              <div className="bg-emerald-900/30 border-2 border-emerald-500/50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-6 h-6 text-emerald-400" />
                    <span className="text-emerald-300 font-bold">SYSTEM HEALTH</span>
                  </div>
                  <Switch 
                    checked={systemHealth} 
                    onCheckedChange={setSystemHealth}
                    className="data-[state=checked]:bg-emerald-600"
                  />
                </div>
                <div className="text-sm text-emerald-200">
                  Status: <span className="font-bold">{systemHealth ? 'MONITORING' : 'DISABLED'}</span>
                </div>
                <div className="text-xs text-emerald-300 mt-2">All Systems Green</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Controls */}
        <Card className="bg-red-900/50 border-red-500">
          <CardHeader>
            <CardTitle className="text-2xl text-red-400 flex items-center space-x-3">
              <AlertTriangle className="w-8 h-8" />
              <span>🚨 EMERGENCY CONTROLS 🚨</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-300 font-bold text-lg">Critical System Controls</p>
                <p className="text-red-200 text-sm">Use these controls only in emergency situations</p>
              </div>
              <div className="flex space-x-4">
                <Button 
                  variant="destructive" 
                  size="lg"
                  onClick={handleEmergencyStop}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                  🛑 EMERGENCY STOP
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleSystemRestart}
                  className="border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black font-bold"
                >
                  🔄 SYSTEM RESTART
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}