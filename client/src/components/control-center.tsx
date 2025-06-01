import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Bot as BotIcon,
  Brain,
  Headphones,
  Shield,
  Settings,
  Power,
  AlertTriangle,
  Lock,
  Zap,
  Database,
  Wifi,
  Activity,
  Bell,
  RotateCcw
} from "lucide-react";
import robotHeadPath from "@assets/A_flat_vector_illustration_features_a_robot_face_i.png";

export default function ControlCenter() {
  const [botSystemEnabled, setBotSystemEnabled] = useState(true);
  const [ragEnabled, setRagEnabled] = useState(true);
  const [voiceProcessing, setVoiceProcessing] = useState(true);
  const [automationMode, setAutomationMode] = useState(true);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [showConfirmShutdown, setShowConfirmShutdown] = useState(false);

  const handleEmergencyShutdown = () => {
    if (showConfirmShutdown) {
      // Execute emergency shutdown
      setBotSystemEnabled(false);
      setRagEnabled(false);
      setVoiceProcessing(false);
      setAutomationMode(false);
      setEmergencyMode(true);
      setShowConfirmShutdown(false);
    } else {
      setShowConfirmShutdown(true);
      setTimeout(() => setShowConfirmShutdown(false), 5000);
    }
  };

  const handleSystemRestart = () => {
    setBotSystemEnabled(true);
    setRagEnabled(true);
    setVoiceProcessing(true);
    setAutomationMode(true);
    setEmergencyMode(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-white mb-1 flex items-center">
            <img 
              src={robotHeadPath} 
              alt="YoBot" 
              className="w-12 h-12 mr-2 inline-block"
              style={{ marginTop: '-4px' }}
            />
            YoBot Control Center
          </h1>
          <p className="text-blue-300 text-lg">System Administration & Controls</p>
        </div>
        
        <div className="flex items-center space-x-6">
          {/* System Status */}
          <div className={`flex items-center space-x-2 ${emergencyMode ? 'bg-red-500/20 border-red-500/30' : 'bg-green-500/20 border-green-500/30'} rounded-full px-4 py-2 border`}>
            <Wifi className={`w-4 h-4 ${emergencyMode ? 'text-red-400' : 'text-green-400'}`} />
            <span className={`${emergencyMode ? 'text-red-300' : 'text-green-300'} font-medium`}>
              {emergencyMode ? 'EMERGENCY' : 'OPERATIONAL'}
            </span>
          </div>
          
          {/* Admin Badge */}
          <Badge className="bg-purple-600 text-white px-4 py-2">
            <Lock className="w-4 h-4 mr-2" />
            Admin Access
          </Badge>
        </div>
      </div>

      {/* Emergency Alert */}
      {emergencyMode && (
        <Card className="bg-red-600/90 backdrop-blur-sm border border-red-400/30 mb-8">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-white" />
                <div>
                  <h3 className="text-white font-bold">🚨 EMERGENCY MODE ACTIVE</h3>
                  <p className="text-red-100 text-sm">All systems have been shut down for safety</p>
                </div>
              </div>
              <Button 
                onClick={handleSystemRestart}
                className="bg-white/20 hover:bg-white/30 text-white"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Restart Systems
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main System Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Bot System Control */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <BotIcon className="w-5 h-5 text-blue-400" />
              <span>Bot System</span>
              <Badge className={`${botSystemEnabled ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                {botSystemEnabled ? 'ACTIVE' : 'OFFLINE'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Master Power</span>
                <Switch 
                  checked={botSystemEnabled && !emergencyMode} 
                  onCheckedChange={setBotSystemEnabled}
                  disabled={emergencyMode}
                  className="data-[state=checked]:bg-green-500"
                />
              </div>
              <div className="text-xs text-slate-400">
                {botSystemEnabled ? 'All bot instances are operational' : 'All bots are shutdown'}
              </div>
              <div className="pt-2 border-t border-white/10">
                <div className="text-sm text-white mb-2">Active Instances: {botSystemEnabled ? '12' : '0'}</div>
                <div className="text-xs text-slate-400">Last restart: 2 hours ago</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RAG Knowledge System */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <span>Knowledge RAG</span>
              <Badge className={`${ragEnabled ? 'bg-purple-500/20 text-purple-300' : 'bg-gray-500/20 text-gray-300'}`}>
                {ragEnabled ? 'ENABLED' : 'DISABLED'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">RAG Processing</span>
                <Switch 
                  checked={ragEnabled && !emergencyMode} 
                  onCheckedChange={setRagEnabled}
                  disabled={emergencyMode}
                  className="data-[state=checked]:bg-purple-500"
                />
              </div>
              <div className="text-xs text-slate-400">
                {ragEnabled ? 'AI knowledge retrieval active' : 'Knowledge system offline'}
              </div>
              <div className="pt-2 border-t border-white/10">
                <div className="text-sm text-white mb-2">Vector Store: {ragEnabled ? 'Connected' : 'Offline'}</div>
                <div className="text-xs text-slate-400">Documents indexed: 2,847</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Voice Processing Engine */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Headphones className="w-5 h-5 text-green-400" />
              <span>Voice Engine</span>
              <Badge className={`${voiceProcessing ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}`}>
                {voiceProcessing ? 'PROCESSING' : 'PAUSED'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Voice Calls</span>
                <Switch 
                  checked={voiceProcessing && !emergencyMode} 
                  onCheckedChange={setVoiceProcessing}
                  disabled={emergencyMode}
                  className="data-[state=checked]:bg-green-500"
                />
              </div>
              <div className="text-xs text-slate-400">
                {voiceProcessing ? 'Processing incoming calls' : 'Voice calls disabled'}
              </div>
              <div className="pt-2 border-t border-white/10">
                <div className="text-sm text-white mb-2">Queue: {voiceProcessing ? '3 pending' : 'Empty'}</div>
                <div className="text-xs text-slate-400">Response time: 1.2s avg</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Automation Controls */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span>Automation</span>
              <Badge className={`${automationMode ? 'bg-yellow-500/20 text-yellow-300' : 'bg-gray-500/20 text-gray-300'}`}>
                {automationMode ? 'AUTO' : 'MANUAL'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Auto Mode</span>
                <Switch 
                  checked={automationMode && !emergencyMode} 
                  onCheckedChange={setAutomationMode}
                  disabled={emergencyMode}
                  className="data-[state=checked]:bg-yellow-500"
                />
              </div>
              <div className="text-xs text-slate-400">
                {automationMode ? 'Workflows run automatically' : 'Manual approval required'}
              </div>
              <div className="pt-2 border-t border-white/10">
                <div className="text-sm text-white mb-2">Active Workflows: {automationMode ? '8' : '0'}</div>
                <div className="text-xs text-slate-400">Success rate: 94.2%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Control */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Database className="w-5 h-5 text-blue-400" />
              <span>Database</span>
              <Badge className="bg-green-500/20 text-green-300">
                CONNECTED
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Read/Write</span>
                <Switch 
                  checked={true} 
                  disabled={true}
                  className="data-[state=checked]:bg-blue-500"
                />
              </div>
              <div className="text-xs text-slate-400">
                Database operations are active
              </div>
              <div className="pt-2 border-t border-white/10">
                <div className="text-sm text-white mb-2">Connections: 4/10</div>
                <div className="text-xs text-slate-400">Latency: 12ms</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Monitoring */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Shield className="w-5 h-5 text-purple-400" />
              <span>Security</span>
              <Badge className="bg-green-500/20 text-green-300">
                SECURE
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Auth Required</span>
                <Switch 
                  checked={true} 
                  disabled={true}
                  className="data-[state=checked]:bg-purple-500"
                />
              </div>
              <div className="text-xs text-slate-400">
                All endpoints protected
              </div>
              <div className="pt-2 border-t border-white/10">
                <div className="text-sm text-white mb-2">Failed attempts: 0</div>
                <div className="text-xs text-slate-400">Last audit: 1 day ago</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Controls */}
      <Card className="bg-red-900/20 backdrop-blur-sm border border-red-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span>Emergency Controls</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-bold mb-1">System Emergency Shutdown</h3>
              <p className="text-red-200 text-sm">Immediately stops all bot operations, voice processing, and automation</p>
            </div>
            <div className="flex items-center space-x-4">
              {showConfirmShutdown ? (
                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={handleEmergencyShutdown}
                    className="bg-red-600 hover:bg-red-700 text-white animate-pulse"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    CONFIRM SHUTDOWN
                  </Button>
                  <Button 
                    onClick={() => setShowConfirmShutdown(false)}
                    variant="outline"
                    className="text-slate-400 border-slate-600"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => setShowConfirmShutdown(true)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Emergency Shutdown
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}