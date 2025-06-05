import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  RefreshCw,
  Download
} from "lucide-react";
import robotHeadPath from "@assets/A_flat_vector_illustration_features_a_robot_face_i.png";
import { apiRequest } from "@/lib/queryClient";
import LeadScrapingPanel from "./lead-scraping-panel";

export default function ControlCenter() {
  // Core Module Toggles
  const [voiceBotEnabled, setVoiceBotEnabled] = useState(true);
  const [callEngineEnabled, setCallEngineEnabled] = useState(true);
  const [smsEngineEnabled, setSmsEngineEnabled] = useState(true);
  const [emailEngineEnabled, setEmailEngineEnabled] = useState(true);
  const [aiEscalationEnabled, setAiEscalationEnabled] = useState(true);
  
  // Smart Dashboard Toggle
  const [smartMetricsEnabled, setSmartMetricsEnabled] = useState(true);
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
  
  // RAG Knowledge Base State
  const [ragQuery, setRagQuery] = useState('');
  const [ragResponse, setRagResponse] = useState('');

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

        {/* Four Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
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
                    <RefreshCw className="w-4 h-4 mr-2" />
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
                    <RefreshCw className="w-4 h-4 mr-2" />
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

            {/* Lead Generation Panel */}
            <LeadScrapingPanel onResults={(results) => {
              console.log('Lead scraping results:', results);
              // Handle results display or further processing
            }} />

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

          {/* Fourth Column - RAG Knowledge Base */}
          <div className="space-y-6">
            {/* Knowledge Query Interface */}
            <Card className="bg-slate-800/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  RAG Knowledge Base
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-purple-400" />
                    <span className="text-white text-sm">🧠 Knowledge System</span>
                  </div>
                  <Switch 
                    checked={ragKnowledgeEnabled} 
                    onCheckedChange={setRagKnowledgeEnabled}
                  />
                </div>
                
                {ragKnowledgeEnabled && (
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Ask the knowledge base anything..."
                      value={ragQuery}
                      onChange={(e) => setRagQuery(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder-white/50"
                      rows={4}
                    />
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={async () => {
                        if (!ragQuery.trim()) return;
                        try {
                          const response = await fetch('/api/rag/query', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ query: ragQuery })
                          });
                          const data = await response.json();
                          setRagResponse(data.enhancedReply || "No response received");
                        } catch (error) {
                          setRagResponse("Error querying knowledge base");
                        }
                      }}
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Query Knowledge Base
                    </Button>
                    {ragResponse && (
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                        <h4 className="text-purple-300 font-medium mb-2">Response:</h4>
                        <p className="text-white text-sm">{ragResponse}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Knowledge Base Status */}
            <Card className="bg-slate-800/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Knowledge Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">Vector Database</span>
                  <Badge className="bg-green-600 text-white">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">Document Index</span>
                  <Badge className="bg-green-600 text-white">Ready</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">Query Processing</span>
                  <Badge className="bg-green-600 text-white">Active</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};