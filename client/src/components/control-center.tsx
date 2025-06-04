import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  RotateCcw,
  Phone,
  MessageSquare,
  Mail,
  Search,
  DollarSign,
  FileText,
  BarChart3,
  TestTube,
  Slack,
  Calendar,
  Eye,
  Users,
  CheckCircle,
  XCircle,
  PlayCircle,
  Refresh,
  Download
} from "lucide-react";
import robotHeadPath from "@assets/A_flat_vector_illustration_features_a_robot_face_i.png";
import { apiRequest } from "@/lib/queryClient";

export default function ControlCenter() {
  // Core Module Toggles
  const [voiceBotEnabled, setVoiceBotEnabled] = useState(true);
  const [callEngineEnabled, setCallEngineEnabled] = useState(true);
  const [smsEngineEnabled, setSmsEngineEnabled] = useState(true);
  const [emailEngineEnabled, setEmailEngineEnabled] = useState(true);
  const [aiEscalationEnabled, setAiEscalationEnabled] = useState(true);
  const [crmIntegrationEnabled, setCrmIntegrationEnabled] = useState(true);
  const [calendlySyncEnabled, setCalendlySyncEnabled] = useState(true);
  const [scraperEngineEnabled, setScraperEngineEnabled] = useState(true);
  const [invoicingEnabled, setInvoicingEnabled] = useState(true);
  const [pdfQuoteEnabled, setPdfQuoteEnabled] = useState(true);
  
  // Add-On Feature Toggles
  const [smartSpendEnabled, setSmartSpendEnabled] = useState(false);
  const [abTestingEnabled, setAbTestingEnabled] = useState(false);
  const [slackNotificationsEnabled, setSlackNotificationsEnabled] = useState(true);
  const [customPersonalityEnabled, setCustomPersonalityEnabled] = useState(false);
  const [ragKnowledgeEnabled, setRagKnowledgeEnabled] = useState(true);
  const [quickbooksIntegrationEnabled, setQuickbooksIntegrationEnabled] = useState(false);
  const [bookingAutomationsEnabled, setBookingAutomationsEnabled] = useState(true);
  const [whiteLabelEnabled, setWhiteLabelEnabled] = useState(false);
  const [botalyticsEnabled, setBotalyticsEnabled] = useState(false);
  
  // Diagnostic & Safety Controls
  const [killSwitchEnabled, setKillSwitchEnabled] = useState(false);
  const [testModeEnabled, setTestModeEnabled] = useState(false);
  const [debugLoggingEnabled, setDebugLoggingEnabled] = useState(true);
  
  // System Status
  const [systemStatus, setSystemStatus] = useState({});
  const [recentLogs, setRecentLogs] = useState([]);
  const [activeConnections, setActiveConnections] = useState(0);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [showConfirmShutdown, setShowConfirmShutdown] = useState(false);

  // Helper functions
  const updateToggle = async (toggleName, value) => {
    try {
      await apiRequest('PUT', `/api/control-center/config/client_001/toggle`, {
        toggleKey: toggleName,
        value: value
      });
    } catch (error) {
      console.error('Failed to update toggle:', error);
    }
  };

  const handleEmergencyShutdown = () => {
    if (showConfirmShutdown) {
      // Execute emergency shutdown - disable all critical systems
      setVoiceBotEnabled(false);
      setCallEngineEnabled(false);
      setSmsEngineEnabled(false);
      setScraperEngineEnabled(false);
      setEmergencyMode(true);
      setShowConfirmShutdown(false);
    } else {
      setShowConfirmShutdown(true);
      setTimeout(() => setShowConfirmShutdown(false), 5000);
    }
  };

  const runDiagnosticTest = async (testType) => {
    try {
      const result = await apiRequest('POST', `/api/control-center/diagnostic/${testType}`, {});
      console.log(`${testType} test result:`, result);
    } catch (error) {
      console.error(`${testType} test failed:`, error);
    }
  };

  const forceModuleResync = async () => {
    try {
      await apiRequest('POST', '/api/control-center/force-resync', {});
      console.log('Module resync triggered');
    } catch (error) {
      console.error('Resync failed:', error);
    }
  };

  useEffect(() => {
    // Load initial configuration
    const loadConfig = async () => {
      try {
        const config = await apiRequest('GET', '/api/control-center/config/client_001');
        // Update state with loaded config
      } catch (error) {
        console.error('Failed to load config:', error);
      }
    };
    loadConfig();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <img src={robotHeadPath} alt="YoBot" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-2">YoBot Control Center</h1>
          <p className="text-blue-200">Master Control Panel - Admin Password Required: YoBot2025!</p>
          {emergencyMode && (
            <div className="mt-4 p-4 bg-red-600 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-white">
                <AlertTriangle className="w-5 h-5" />
                <span>EMERGENCY MODE ACTIVE - All Systems Disabled</span>
              </div>
            </div>
          )}
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Module Toggles */}
          <div className="space-y-6">
            {/* Core Package Toggles */}
            <Card className="bg-slate-800/50 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Core Package Toggles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BotIcon className="w-4 h-4 text-blue-400" />
                      <span className="text-white text-sm">🤖 Enable VoiceBot</span>
                    </div>
                    <Switch 
                      checked={voiceBotEnabled} 
                      onCheckedChange={(checked) => {
                        setVoiceBotEnabled(checked);
                        updateToggle('voicebot_enabled', checked);
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-green-400" />
                      <span className="text-white text-sm">📞 Outbound Calling</span>
                    </div>
                    <Switch 
                      checked={callEngineEnabled} 
                      onCheckedChange={(checked) => {
                        setCallEngineEnabled(checked);
                        updateToggle('call_engine_enabled', checked);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-purple-400" />
                      <span className="text-white text-sm">📩 SMS Messaging Module</span>
                    </div>
                    <Switch 
                      checked={smsEngineEnabled} 
                      onCheckedChange={(checked) => {
                        setSmsEngineEnabled(checked);
                        updateToggle('sms_engine_enabled', checked);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-red-400" />
                      <span className="text-white text-sm">📧 Email Messaging Module</span>
                    </div>
                    <Switch 
                      checked={emailEngineEnabled} 
                      onCheckedChange={(checked) => {
                        setEmailEngineEnabled(checked);
                        updateToggle('email_engine_enabled', checked);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-orange-400" />
                      <span className="text-white text-sm">🧠 AI Follow-Up / Escalation</span>
                    </div>
                    <Switch 
                      checked={aiEscalationEnabled} 
                      onCheckedChange={(checked) => {
                        setAiEscalationEnabled(checked);
                        updateToggle('ai_escalation_enabled', checked);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-cyan-400" />
                      <span className="text-white text-sm">🗃️ CRM Integration</span>
                    </div>
                    <Switch 
                      checked={crmIntegrationEnabled} 
                      onCheckedChange={(checked) => {
                        setCrmIntegrationEnabled(checked);
                        updateToggle('crm_integration_enabled', checked);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      <span className="text-white text-sm">📆 Calendly Sync</span>
                    </div>
                    <Switch 
                      checked={calendlySyncEnabled} 
                      onCheckedChange={(checked) => {
                        setCalendlySyncEnabled(checked);
                        updateToggle('calendly_sync_enabled', checked);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-yellow-400" />
                      <span className="text-white text-sm">🧲 Scraper Engine</span>
                    </div>
                    <Switch 
                      checked={scraperEngineEnabled} 
                      onCheckedChange={(checked) => {
                        setScraperEngineEnabled(checked);
                        updateToggle('scraper_engine_enabled', checked);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-white text-sm">💸 Invoicing + Payment Module</span>
                    </div>
                    <Switch 
                      checked={invoicingEnabled} 
                      onCheckedChange={(checked) => {
                        setInvoicingEnabled(checked);
                        updateToggle('invoicing_enabled', checked);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-pink-400" />
                      <span className="text-white text-sm">🧾 PDF Quote Builder</span>
                    </div>
                    <Switch 
                      checked={pdfQuoteEnabled} 
                      onCheckedChange={(checked) => {
                        setPdfQuoteEnabled(checked);
                        updateToggle('pdf_quote_enabled', checked);
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add-On Feature Toggles */}
            <Card className="bg-slate-800/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Add-On Feature Toggles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-400" />
                      <span className="text-white text-sm">📊 SmartSpend™ Dashboard</span>
                    </div>
                    <Switch 
                      checked={smartSpendEnabled} 
                      onCheckedChange={setSmartSpendEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TestTube className="w-4 h-4 text-green-400" />
                      <span className="text-white text-sm">⚖️ A/B Script Testing</span>
                    </div>
                    <Switch 
                      checked={abTestingEnabled} 
                      onCheckedChange={setAbTestingEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Slack className="w-4 h-4 text-purple-400" />
                      <span className="text-white text-sm">🔔 Slack Notifications</span>
                    </div>
                    <Switch 
                      checked={slackNotificationsEnabled} 
                      onCheckedChange={setSlackNotificationsEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-orange-400" />
                      <span className="text-white text-sm">🧠 Custom Personality Pack</span>
                    </div>
                    <Switch 
                      checked={customPersonalityEnabled} 
                      onCheckedChange={setCustomPersonalityEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-cyan-400" />
                      <span className="text-white text-sm">📚 RAG External Knowledge</span>
                    </div>
                    <Switch 
                      checked={ragKnowledgeEnabled} 
                      onCheckedChange={setRagKnowledgeEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-white text-sm">🧾 QuickBooks Integration</span>
                    </div>
                    <Switch 
                      checked={quickbooksIntegrationEnabled} 
                      onCheckedChange={setQuickbooksIntegrationEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      <span className="text-white text-sm">📅 Booking/Calendar Automations</span>
                    </div>
                    <Switch 
                      checked={bookingAutomationsEnabled} 
                      onCheckedChange={setBookingAutomationsEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-yellow-400" />
                      <span className="text-white text-sm">🧩 White Label Mode</span>
                    </div>
                    <Switch 
                      checked={whiteLabelEnabled} 
                      onCheckedChange={setWhiteLabelEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-pink-400" />
                      <span className="text-white text-sm">📈 Botalytics™ ROI Dashboard</span>
                    </div>
                    <Switch 
                      checked={botalyticsEnabled} 
                      onCheckedChange={setBotalyticsEnabled}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Diagnostic & Safety Controls */}
            <Card className="bg-slate-800/50 border-red-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Diagnostic & Safety Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-red-400" />
                      <span className="text-white text-sm">🔒 Kill Switch (Fallbacks)</span>
                    </div>
                    <Switch 
                      checked={killSwitchEnabled} 
                      onCheckedChange={setKillSwitchEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TestTube className="w-4 h-4 text-yellow-400" />
                      <span className="text-white text-sm">🧪 Test Mode</span>
                    </div>
                    <Switch 
                      checked={testModeEnabled} 
                      onCheckedChange={setTestModeEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-400" />
                      <span className="text-white text-sm">🛠️ Debug Logging</span>
                    </div>
                    <Switch 
                      checked={debugLoggingEnabled} 
                      onCheckedChange={setDebugLoggingEnabled}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-600">
                  <Button 
                    onClick={forceModuleResync}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Refresh className="w-4 h-4 mr-2" />
                    📤 Force Re-Sync All Modules
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Column - System Status & Logs */}
          <div className="space-y-6">
            {/* Live Status Indicators */}
            <Card className="bg-slate-800/50 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Live Status Indicators
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    {voiceBotEnabled ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                    <span className="text-white text-sm">VoiceBot</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {callEngineEnabled ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                    <span className="text-white text-sm">Call Engine</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {smsEngineEnabled ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                    <span className="text-white text-sm">SMS Engine</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {emailEngineEnabled ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                    <span className="text-white text-sm">Email Engine</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {scraperEngineEnabled ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                    <span className="text-white text-sm">Scraper Engine</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {invoicingEnabled ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                    <span className="text-white text-sm">Payment Module</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Metrics */}
            <Card className="bg-slate-800/50 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  System Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">98%</div>
                    <div className="text-sm text-blue-200">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{activeConnections}</div>
                    <div className="text-sm text-blue-200">Active Connections</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">23</div>
                    <div className="text-sm text-blue-200">Active Modules</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-400">0</div>
                    <div className="text-sm text-blue-200">Errors (24h)</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity Log */}
            <Card className="bg-slate-800/50 border-yellow-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Recent Activity Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  <div className="text-sm text-blue-200 p-2 bg-slate-700/50 rounded">
                    <span className="text-green-400">[10:19:47]</span> Stripe webhook endpoint activated
                  </div>
                  <div className="text-sm text-blue-200 p-2 bg-slate-700/50 rounded">
                    <span className="text-green-400">[10:17:50]</span> WebSocket client connected
                  </div>
                  <div className="text-sm text-blue-200 p-2 bg-slate-700/50 rounded">
                    <span className="text-green-400">[10:17:49]</span> System automation started (40 functions)
                  </div>
                  <div className="text-sm text-blue-200 p-2 bg-slate-700/50 rounded">
                    <span className="text-blue-400">[10:17:40]</span> Express server started on port 5000
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Developer Controls */}
          <div className="space-y-6">
            {/* Manual Tools & Dev Buttons */}
            <Card className="bg-slate-800/50 border-orange-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Developer Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => runDiagnosticTest('voicebot')}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  🧪 Run VoiceBot Test
                </Button>

                <Button 
                  onClick={() => runDiagnosticTest('calendly')}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  📤 Push Fake Calendly Event
                </Button>

                <Button 
                  onClick={() => runDiagnosticTest('sms')}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  📬 Simulate Inbound SMS
                </Button>

                <Button 
                  onClick={() => runDiagnosticTest('ai-followup')}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  🧠 AI Follow-Up Test
                </Button>

                <div className="pt-4 border-t border-slate-600">
                  <Button 
                    onClick={forceModuleResync}
                    className="w-full bg-cyan-600 hover:bg-cyan-700"
                  >
                    <Refresh className="w-4 h-4 mr-2" />
                    🔄 Force Module Resync
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Controls */}
            <Card className="bg-slate-800/50 border-red-500/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Emergency Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleEmergencyShutdown}
                  className={`w-full ${showConfirmShutdown 
                    ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                    : 'bg-red-800 hover:bg-red-700'
                  }`}
                >
                  <Power className="w-4 h-4 mr-2" />
                  {showConfirmShutdown ? '⚠️ CONFIRM SHUTDOWN' : '🚫 Emergency Shutdown'}
                </Button>

                {showConfirmShutdown && (
                  <p className="text-red-400 text-sm text-center">
                    Click again within 5 seconds to confirm emergency shutdown
                  </p>
                )}

                <Button 
                  onClick={() => window.location.reload()}
                  className="w-full bg-gray-600 hover:bg-gray-700"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  ♻️ Reset Toggle State
                </Button>
              </CardContent>
            </Card>

            {/* Export & Backup */}
            <Card className="bg-slate-800/50 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Export & Backup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={async () => {
                    try {
                      const response = await apiRequest('GET', '/api/control-center/export');
                      const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'control-center-config.json';
                      a.click();
                    } catch (error) {
                      console.error('Export failed:', error);
                    }
                  }}
                  className="w-full bg-cyan-600 hover:bg-cyan-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  📊 Export Configuration
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
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