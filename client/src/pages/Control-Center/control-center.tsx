import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Settings, 
  Database, 
  Brain, 
  FileText, 
  BarChart3, 
  Network, 
  Mic, 
  Calendar, 
  Target, 
  Eye, 
  Shield,
  Power,
  Bell,
  MessageSquare,
  Activity,
  CheckCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Search,
  Filter,
  Clock,
  AlertCircle,
  Wifi,
  WifiOff,
  ScrollText
} from "lucide-react";

export default function SystemControls() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [adminPassword, setAdminPassword] = useState("YoBot2025!"); // Default password
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [userRole, setUserRole] = useState<'admin' | 'client' | 'support'>('admin');
  const [selectedPackage, setSelectedPackage] = useState<'starter' | 'pro' | 'enterprise' | 'platinum'>('pro');
  const [showPackageBuilder, setShowPackageBuilder] = useState(false);
  const [billingMode, setBillingMode] = useState<'subscription' | 'usage' | 'trial'>('subscription');
  const [showActionLog, setShowActionLog] = useState(false);
  
  // System mode state
  const [currentSystemMode, setCurrentSystemMode] = useState<'test' | 'live'>(() => {
    return (localStorage.getItem('systemMode') as 'test' | 'live') || 'live';
  });
  
  // Module status tracking (live, warning, failed)
  const [moduleStatus, setModuleStatus] = useState<Record<string, 'live' | 'warning' | 'failed'>>({
    voiceBotCore: 'live',
    callRouting: 'live',
    emergencyEscalation: 'warning',
    slackNotifications: 'live',
    hubspotSync: 'failed',
    airtableLogging: 'live',
    leadScoring: 'live',
    contactEnrichment: 'warning',
    smartWorkflows: 'live',
    emailAutomation: 'live',
    followupTasks: 'live',
    pdfGeneration: 'failed',
    quoteGenerator: 'live',
    calendarBooking: 'live',
    ndaGenerator: 'live',
    businessCardOcr: 'live',
    realtimeMetrics: 'live',
    performanceTracking: 'live',
    usageAnalytics: 'live',
    errorMonitoring: 'warning',
    googleCalendar: 'live',
    stripePayments: 'live',
    quickbooks: 'failed',
    twilioSms: 'live',
    missedCallResponder: 'live',
    inboundCallWebhook: 'live',
    callCompletionTracking: 'live',
    documentGeneration: 'live',
    pdfProcessor: 'warning',
    fileStorage: 'live',
    backupSystem: 'live',
    webhookMonitoring: 'live',
    emergencyStop: 'live',
    scenarioControl: 'live',
    rateLimiting: 'live',
    dataEncryption: 'live',
    gdprCompliance: 'live',
    accessLogging: 'live',
    auditTrail: 'live',
    
    // Advanced Automation Functions
    apifyGoogleMapsScraping: 'live',
    apolloLeadGeneration: 'live',
    voiceTranscription: 'live',
    pipelineCalls: 'live',
    smsAutomation: 'live',
    aiFollowup: 'live',
    commandCenterDispatcher: 'live',
    webhookInboundSMS: 'live',
    triggerVoiceCall: 'live',
    logCommandCenterEvent: 'live',
    launchPhantombuster: 'live',
    webhookCalendly: 'live',
    voicebotSocket: 'live',
    retryCallbackScheduler: 'live',
    triggerPipelineCalls: 'live'
  });

  // Action log for troubleshooting
  const [actionLog, setActionLog] = useState([
    {
      id: 1,
      timestamp: new Date(Date.now() - 300000).toISOString(),
      module: 'HubSpot Sync',
      action: 'Toggle OFF',
      status: 'Failed',
      details: 'API key expired - contact sync failed'
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 180000).toISOString(),
      module: 'PDF Generation',
      action: 'Generate Quote',
      status: 'Error',
      details: 'Puppeteer timeout after 30s'
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 120000).toISOString(),
      module: 'Emergency Escalation',
      action: 'Toggle ON',
      status: 'Warning',
      details: 'SMS delivery delayed by 15s'
    },
    {
      id: 4,
      timestamp: new Date(Date.now() - 60000).toISOString(),
      module: 'QuickBooks',
      action: 'Sync Contact',
      status: 'Failed',
      details: 'OAuth token refresh failed'
    },
    {
      id: 5,
      timestamp: new Date(Date.now() - 30000).toISOString(),
      module: 'VoiceBot Core',
      action: 'Process Call',
      status: 'Success',
      details: 'Call routed to Mike Rodriguez'
    }
  ]);

  const [moduleStates, setModuleStates] = useState({
    // Voice & Communication
    voiceBotCore: true,
    callRouting: true,
    emergencyEscalation: true,
    slackNotifications: true,
    
    // CRM & Data
    hubspotSync: true,
    airtableLogging: true,
    leadScoring: true,
    contactEnrichment: false,
    
    // Automation & AI
    smartWorkflows: true,
    emailAutomation: true,
    followupTasks: true,
    pdfGeneration: false,
    
    // Business Tools
    quoteGenerator: true,
    calendarBooking: false,
    ndaGenerator: false,
    businessCardOcr: true,
    
    // Analytics & Monitoring
    realtimeMetrics: true,
    performanceTracking: true,
    usageAnalytics: false,
    errorMonitoring: true,
    diagnosticsEngine: true,

    // Integrations
    googleCalendar: false,
    stripePayments: false,
    quickbooks: false,
    twilioSms: true,
    missedCallResponder: true,
    inboundCallWebhook: true,
    callCompletionTracking: true,
    
    // File Management
    documentGeneration: true,
    pdfProcessor: true,
    fileStorage: true,
    backupSystem: true,
    
    // Webhook Management
    webhookMonitoring: true,
    emergencyStop: true,
    scenarioControl: true,
    rateLimiting: true,
    systemDiagnostics: true,
    
    // Security & Compliance
    dataEncryption: true,
    gdprCompliance: false,
    accessLogging: true,
    auditTrail: true,
    
    // Advanced Automation Functions
    apifyGoogleMapsScraping: true,
    apolloLeadGeneration: true,
    voiceTranscription: true,
    pipelineCalls: true,
    smsAutomation: true,
    aiFollowup: true,
    commandCenterDispatcher: true,
    webhookInboundSMS: true,
    triggerVoiceCall: true,
    logCommandCenterEvent: true,
    launchPhantombuster: true,
    webhookCalendly: true,
    voicebotSocket: true,
    retryCallbackScheduler: true,
    triggerPipelineCalls: true
  });

  const handleLogin = () => {
    if (password === adminPassword) {
      setIsAuthenticated(true);
      setAuthError("");
      setPassword("");
    } else {
      setAuthError("Invalid password. Access denied.");
      setPassword("");
    }
  };

  const handlePasswordUpdate = () => {
    if (newPassword.length >= 8) {
      setAdminPassword(newPassword);
      setNewPassword("");
      setShowPasswordSetup(false);
      // Store in localStorage for persistence
      localStorage.setItem("yobot_admin_password", newPassword);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword("");
    setAuthError("");
  };

  const toggleModule = async (module: string) => {
    const newState = !moduleStates[module];
    
    // Optimistically update UI
    setModuleStates(prev => ({
      ...prev,
      [module]: newState
    }));

    try {
      const response = await fetch('/api/control-center/toggle-module', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          module,
          enabled: newState,
          userRole
        }),
      });

      if (!response.ok) {
        // Revert on failure
        setModuleStates(prev => ({
          ...prev,
          [module]: !newState
        }));
        console.error('Failed to toggle module:', module);
      }
    } catch (error) {
      // Revert on error
      setModuleStates(prev => ({
        ...prev,
        [module]: !newState
      }));
      console.error('Error toggling module:', error);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-400" : "bg-gray-400";
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertTriangle className="w-4 h-4 text-gray-500" />;
  };

  // Get live status indicator
  const getStatusIndicator = (moduleKey: string) => {
    const status = moduleStatus[moduleKey] || 'live';
    switch (status) {
      case 'live':
        return <Wifi className="w-3 h-3 text-green-400" title="Active & Working" />;
      case 'warning':
        return <Clock className="w-3 h-3 text-yellow-400 animate-pulse" title="Enabled but Warning" />;
      case 'failed':
        return <WifiOff className="w-3 h-3 text-red-400" title="Failed/Disconnected" />;
      default:
        return <Wifi className="w-3 h-3 text-green-400" />;
    }
  };

  // Get status details for tooltip
  const getStatusDetails = (moduleKey: string) => {
    const status = moduleStatus[moduleKey] || 'live';
    const recentLog = actionLog.find(log => log.module.toLowerCase().includes(moduleKey.toLowerCase()));
    
    switch (status) {
      case 'live':
        return `✅ Active & Working${recentLog ? `\nLast action: ${recentLog.details}` : ''}`;
      case 'warning':
        return `⚠️ Enabled but Warning${recentLog ? `\nIssue: ${recentLog.details}` : ''}`;
      case 'failed':
        return `❌ Failed/Disconnected${recentLog ? `\nError: ${recentLog.details}` : ''}`;
      default:
        return 'Status unknown';
    }
  };

  // Module metadata with RBAC permissions
  const moduleMetadata = {
    // Voice & Communication
    voiceBotCore: { category: 'Voice & Communication', name: 'VoiceBot Core', visibleTo: ['admin', 'client'] },
    callRouting: { category: 'Voice & Communication', name: 'Call Routing', visibleTo: ['admin', 'client'] },
    emergencyEscalation: { category: 'Voice & Communication', name: 'Emergency Escalation', visibleTo: ['admin', 'support'] },
    slackNotifications: { category: 'Voice & Communication', name: 'Slack Notifications', visibleTo: ['admin', 'support'] },
    diagnosticsEngine: {
    category: 'Analytics & Monitoring',
    name: 'Run Diagnostics Engine',
    visibleTo: ['admin']
},

    // CRM & Data
    hubspotSync: { category: 'CRM & Data', name: 'HubSpot Sync', visibleTo: ['admin', 'client'] },
    airtableLogging: { category: 'CRM & Data', name: 'Airtable Logging', visibleTo: ['admin'] },
    leadScoring: { category: 'CRM & Data', name: 'Lead Scoring', visibleTo: ['admin', 'client'] },
    contactEnrichment: { category: 'CRM & Data', name: 'Contact Enrichment', visibleTo: ['admin', 'client'] },
    
    // Automation & AI
    smartWorkflows: { category: 'Automation & AI', name: 'Smart Workflows', visibleTo: ['admin', 'client'] },
    emailAutomation: { category: 'Automation & AI', name: 'Email Automation', visibleTo: ['admin', 'client'] },
    followupTasks: { category: 'Automation & AI', name: 'Follow-up Tasks', visibleTo: ['admin', 'client'] },
    pdfGeneration: { category: 'Automation & AI', name: 'PDF Generation', visibleTo: ['admin', 'client'] },
    
    // Business Tools
    quoteGenerator: { category: 'Business Tools', name: 'Quote Generator', visibleTo: ['admin', 'client'] },
    calendarBooking: { category: 'Business Tools', name: 'Calendar Booking', visibleTo: ['admin', 'client'] },
    ndaGenerator: { category: 'Business Tools', name: 'NDA Generator', visibleTo: ['admin'] },
    businessCardOcr: { category: 'Business Tools', name: 'Business Card OCR', visibleTo: ['admin', 'client'] },
    
    // Analytics & Monitoring
    realtimeMetrics: { category: 'Analytics & Monitoring', name: 'Real-time Metrics', visibleTo: ['admin', 'support'] },
    performanceTracking: { category: 'Analytics & Monitoring', name: 'Performance Tracking', visibleTo: ['admin'] },
    usageAnalytics: { category: 'Analytics & Monitoring', name: 'Usage Analytics', visibleTo: ['admin'] },
    errorMonitoring: { category: 'Analytics & Monitoring', name: 'Error Monitoring', visibleTo: ['admin', 'support'] },
    
    // Integrations
    googleCalendar: { category: 'Integrations', name: 'Google Calendar', visibleTo: ['admin', 'client'] },
    stripePayments: { category: 'Integrations', name: 'Stripe Payments', visibleTo: ['admin'] },
    quickbooks: { category: 'Integrations', name: 'QuickBooks', visibleTo: ['admin'] },
    twilioSms: { category: 'Integrations', name: 'Twilio SMS', visibleTo: ['admin', 'support'] },
    missedCallResponder: { category: 'Voice & Communication', name: 'Missed Call Responder', visibleTo: ['admin', 'support'] },
    inboundCallWebhook: { category: 'Voice & Communication', name: 'Inbound Call Webhook', visibleTo: ['admin', 'support'] },
    callCompletionTracking: { category: 'Voice & Communication', name: 'Call Completion Tracking', visibleTo: ['admin', 'support'] },
    
    // File Management
    documentGeneration: { category: 'File Management', name: 'Document Generation', visibleTo: ['admin', 'client'] },
    pdfProcessor: { category: 'File Management', name: 'PDF Processor', visibleTo: ['admin'] },
    fileStorage: { category: 'File Management', name: 'File Storage', visibleTo: ['admin', 'support'] },
    backupSystem: { category: 'File Management', name: 'Backup System', visibleTo: ['admin'] },
    
    // Webhook Management
    webhookMonitoring: { category: 'Webhook Management', name: 'Webhook Monitoring', visibleTo: ['admin'] },
    emergencyStop: { category: 'Webhook Management', name: 'EMERGENCY STOP', visibleTo: ['admin', 'support'] },
    scenarioControl: { category: 'Webhook Management', name: 'Scenario Control', visibleTo: ['admin'] },
    rateLimiting: { category: 'Webhook Management', name: 'Rate Limiting', visibleTo: ['admin'] },
    systemDiagnostics: { category: 'Webhook Management', name: 'Run System Diagnostics', visibleTo: ['admin'] },
    
    // Security & Compliance
    dataEncryption: { category: 'Security & Compliance', name: 'Data Encryption', visibleTo: ['admin'] },
    gdprCompliance: { category: 'Security & Compliance', name: 'GDPR Compliance', visibleTo: ['admin'] },
    accessLogging: { category: 'Security & Compliance', name: 'Access Logging', visibleTo: ['admin'] },
    auditTrail: { category: 'Security & Compliance', name: 'Audit Trail', visibleTo: ['admin'] },
    
    // Advanced Automation Functions
    apifyGoogleMapsScraping: { category: 'Lead Generation', name: 'Apify Google Maps Scraping', visibleTo: ['admin', 'client'] },
    apolloLeadGeneration: { category: 'Lead Generation', name: 'Apollo Lead Generation', visibleTo: ['admin', 'client'] },
    voiceTranscription: { category: 'Voice & Communication', name: 'Voice Transcription', visibleTo: ['admin', 'client'] },
    pipelineCalls: { category: 'Voice & Communication', name: 'Pipeline Calls', visibleTo: ['admin', 'support'] },
    smsAutomation: { category: 'Voice & Communication', name: 'SMS Automation', visibleTo: ['admin', 'support'] },
    aiFollowup: { category: 'Automation & AI', name: 'AI Follow-up System', visibleTo: ['admin', 'client'] },
    commandCenterDispatcher: { category: 'Automation & AI', name: 'Command Center Dispatcher', visibleTo: ['admin'] },
    webhookInboundSMS: { category: 'Webhook Management', name: 'Webhook Inbound SMS', visibleTo: ['admin', 'support'] },
    triggerVoiceCall: { category: 'Voice & Communication', name: 'Trigger Voice Call', visibleTo: ['admin', 'support'] },
    logCommandCenterEvent: { category: 'Analytics & Monitoring', name: 'Log Command Center Event', visibleTo: ['admin'] },
    launchPhantombuster: { category: 'Lead Generation', name: 'Launch PhantomBuster', visibleTo: ['admin', 'client'] },
    webhookCalendly: { category: 'Integrations', name: 'Webhook Calendly', visibleTo: ['admin', 'client'] },
    voicebotSocket: { category: 'Voice & Communication', name: 'VoiceBot Socket', visibleTo: ['admin', 'support'] },
    retryCallbackScheduler: { category: 'Voice & Communication', name: 'Retry Callback Scheduler', visibleTo: ['admin', 'support'] },
    triggerPipelineCalls: { category: 'Voice & Communication', name: 'Trigger Pipeline Calls', visibleTo: ['admin', 'support'] }
  };

  // Filter modules based on search and role permissions
  const filteredModules = Object.entries(moduleStates).filter(([key, _]) => {
    const metadata = moduleMetadata[key as keyof typeof moduleMetadata];
    if (!metadata) return false;
    
    // Check role permissions
    if (!metadata.visibleTo.includes(userRole)) return false;
    
    // Check search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        metadata.name.toLowerCase().includes(searchLower) ||
        metadata.category.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const isModuleVisible = (moduleKey: string) => {
    const metadata = moduleMetadata[moduleKey as keyof typeof moduleMetadata];
    return metadata && metadata.visibleTo.includes(userRole);
  };

  // Package tier configurations based on YoBot price sheet
  const packageConfigurations = {
    starter: {
      // Starter ($499/mo): AI Chatbot, SMS/Email Flows, Basic CRM Logging, Simple Integrations
      voiceBotCore: false,
      callRouting: false,
      emergencyEscalation: true,
      slackNotifications: false,
      hubspotSync: true,
      airtableLogging: true,
      leadScoring: false,
      contactEnrichment: false,
      smartWorkflows: true,
      emailAutomation: true,
      followupTasks: true,
      diagnosticsEngine: true,
      missedCallResponder: true,  
      pdfGeneration: false,
      quoteGenerator: false,
      calendarBooking: false,
      ndaGenerator: false,
      businessCardOcr: true,
      realtimeMetrics: true,
      performanceTracking: false,
      usageAnalytics: false,
      errorMonitoring: true,
      googleCalendar: false,
      stripePayments: false,
      quickbooks: false,
      twilioSms: true,
      documentGeneration: false,
      pdfProcessor: false,
      fileStorage: true,
      backupSystem: false,
      webhookMonitoring: false,
      emergencyStop: true,
      scenarioControl: false,
      rateLimiting: true,
      dataEncryption: true,
      gdprCompliance: false,
      accessLogging: false,
      auditTrail: false
    },
    pro: {
      // Pro: All Starter + VoiceBot, Calendar Tools, Smart Follow-Ups, AI Quote Generation
      voiceBotCore: true,
      callRouting: true,
      emergencyEscalation: true,
      slackNotifications: false,
      hubspotSync: true,
      airtableLogging: true,
      leadScoring: false,
      contactEnrichment: true,
      smartWorkflows: true,
      emailAutomation: true,
      followupTasks: true,
      pdfGeneration: true,
      quoteGenerator: true,
      calendarBooking: true,
      ndaGenerator: false,
      businessCardOcr: true,
      realtimeMetrics: true,
      performanceTracking: true,
      usageAnalytics: false,
      errorMonitoring: true,
      googleCalendar: true,
      stripePayments: false,
      quickbooks: false,
      twilioSms: true
    },
    enterprise: {
      // Enterprise: All Pro + Lead Scoring, Performance Dashboards, Multi-Platform Sync, Payment Integration
      voiceBotCore: true,
      callRouting: true,
      emergencyEscalation: true,
      slackNotifications: true,
      hubspotSync: true,
      airtableLogging: true,
      leadScoring: true,
      contactEnrichment: true,
      smartWorkflows: true,
      emailAutomation: true,
      followupTasks: true,
      pdfGeneration: true,
      quoteGenerator: true,
      calendarBooking: true,
      ndaGenerator: true,
      businessCardOcr: true,
      realtimeMetrics: true,
      performanceTracking: true,
      usageAnalytics: true,
      errorMonitoring: true,
      googleCalendar: true,
      stripePayments: true,
      quickbooks: true,
      twilioSms: true
    },
    platinum: {
      // Platinum: Everything + White Label, Advanced Analytics, Unlimited Workflows
      voiceBotCore: true,
      callRouting: true,
      emergencyEscalation: true,
      slackNotifications: true,
      hubspotSync: true,
      airtableLogging: true,
      leadScoring: true,
      contactEnrichment: true,
      smartWorkflows: true,
      emailAutomation: true,
      followupTasks: true,
      pdfGeneration: true,
      quoteGenerator: true,
      calendarBooking: true,
      ndaGenerator: true,
      businessCardOcr: true,
      realtimeMetrics: true,
      performanceTracking: true,
      usageAnalytics: true,
      errorMonitoring: true,
      googleCalendar: true,
      stripePayments: true,
      quickbooks: true,
      twilioSms: true,
      documentGeneration: true,
      pdfProcessor: true,
      fileStorage: true,
      backupSystem: true,
      webhookMonitoring: true,
      emergencyStop: true,
      scenarioControl: true,
      rateLimiting: true,
      dataEncryption: true,
      gdprCompliance: true,
      accessLogging: true,
      auditTrail: true
    }
  };

  const applyPackageSettings = (packageType: 'starter' | 'pro' | 'enterprise' | 'platinum') => {
    const config = packageConfigurations[packageType];
    setModuleStates(prevStates => ({
      ...prevStates,
      ...config
    }));
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm border border-white/20">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-black text-white">RESTRICTED ACCESS</CardTitle>
            <p className="text-red-300 text-sm font-medium">System Control Panel</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white font-semibold">Admin Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="bg-white/10 border-white/20 text-white placeholder-white/50"
                placeholder="Enter admin password"
              />
            </div>
            
            {authError && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-300 text-sm font-medium">{authError}</p>
              </div>
            )}
            
            <Button 
              onClick={handleLogin}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              <Unlock className="w-4 h-4 mr-2" />
              Authenticate
            </Button>
            
            <div className="pt-4 border-t border-white/20">
              <Button 
                variant="outline"
                onClick={() => setShowPasswordSetup(!showPasswordSetup)}
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                <Settings className="w-4 h-4 mr-2" />
                Change Password
              </Button>
              
              {showPasswordSetup && (
                <div className="mt-4 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-white font-semibold">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder-white/50"
                      placeholder="Minimum 8 characters"
                    />
                  </div>
                  <Button 
                    onClick={handlePasswordUpdate}
                    disabled={newPassword.length < 8}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Update Password
                  </Button>
                </div>
              )}
            </div>
            
            <div className="text-center pt-4">
              <p className="text-white/60 text-xs">Default: YoBot2025!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">System Control Panel</h1>
              <p className="text-blue-300">Manage automation modules and integrations</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Emergency Stop - Prominent Position */}
            <div className="bg-red-500/20 border-2 border-red-500/50 rounded-lg p-3 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-300 font-bold text-sm">EMERGENCY STOP</span>
                <Switch 
                  checked={moduleStates.emergencyStop} 
                  onCheckedChange={() => toggleModule('emergencyStop')}
                  className="data-[state=checked]:bg-red-600"
                />
              </div>
            </div>

            {/* Package Tier Selector */}
            <div className="flex items-center space-x-2">
              <Label className="text-white text-sm">Package:</Label>
              <select 
                value={selectedPackage}
                onChange={(e) => {
                  const newPackage = e.target.value as 'starter' | 'pro' | 'enterprise' | 'platinum';
                  setSelectedPackage(newPackage);
                  applyPackageSettings(newPackage);
                }}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm"
              >
                <option value="starter">Starter - $499/mo</option>
                <option value="pro">Pro - $999/mo</option>
                <option value="enterprise">Enterprise - $1,499/mo</option>
                <option value="platinum">Platinum - $1,999/mo</option>
              </select>
            </div>

            {/* Role Selector */}
            <div className="flex items-center space-x-2">
              <Label className="text-white text-sm">Role:</Label>
              <select 
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as 'admin' | 'client' | 'support')}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm"
              >
                <option value="admin">Admin</option>
                <option value="client">Client</option>
                <option value="support">Support</option>
              </select>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
              <Input
                type="text"
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-white/10 border-white/20 text-white placeholder-white/50"
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
            {filteredModules.filter(([key, value]) => value).length} Active Modules
          </Badge>
          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
            {filteredModules.filter(([key, value]) => !value).length} Disabled
          </Badge>
          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)} View
          </Badge>
          {searchQuery && (
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              Filtered: {filteredModules.length} results
            </Badge>
          )}
          <Badge className="bg-red-500/20 text-red-300 border-red-500/30 animate-pulse">
            Emergency Controls Available
          </Badge>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Apply Changes
          </Button>
          <Button 
            onClick={() => setShowActionLog(true)}
            className="bg-slate-600 hover:bg-slate-700 text-white flex items-center space-x-2"
          >
            <ScrollText className="w-4 h-4" />
            <span>Logs</span>
          </Button>
        </div>
      </div>

      {/* Control Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Voice & Communication */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center space-x-2">
              <Mic className="w-4 h-4 text-blue-400" />
              <span>Voice & Communication</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isModuleVisible('voiceBotCore') && (
              <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 ${getStatusColor(moduleStates.voiceBotCore)} rounded-full`}></div>
                  <span className="text-white text-sm">VoiceBot Core</span>
                  {getStatusIcon(moduleStates.voiceBotCore)}
                  <div title={getStatusDetails('voiceBotCore')}>
                    {getStatusIndicator('voiceBotCore')}
                  </div>
                </div>
                <Switch 
                  checked={moduleStates.voiceBotCore} 
                  onCheckedChange={() => toggleModule('voiceBotCore')}
                />
              </div>
            )}
            
            {isModuleVisible('callRouting') && (
              <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 ${getStatusColor(moduleStates.callRouting)} rounded-full`}></div>
                  <span className="text-white text-sm">Call Routing</span>
                  {getStatusIcon(moduleStates.callRouting)}
                </div>
                <Switch 
                  checked={moduleStates.callRouting} 
                  onCheckedChange={() => toggleModule('callRouting')}
                />
              </div>
            )}
            
            {isModuleVisible('emergencyEscalation') && (
              <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 ${getStatusColor(moduleStates.emergencyEscalation)} rounded-full`}></div>
                  <span className="text-white text-sm">Emergency Escalation</span>
                  {getStatusIcon(moduleStates.emergencyEscalation)}
                  {!moduleMetadata.emergencyEscalation.visibleTo.includes('client') && (
                    <Lock className="w-3 h-3 text-yellow-400" />
                  )}
                </div>
                <Switch 
                  checked={moduleStates.emergencyEscalation} 
                  onCheckedChange={() => toggleModule('emergencyEscalation')}
                />
              </div>
            )}
            
            {isModuleVisible('slackNotifications') && (
              <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 ${getStatusColor(moduleStates.slackNotifications)} rounded-full`}></div>
                  <span className="text-white text-sm">Slack Notifications</span>
                  {getStatusIcon(moduleStates.slackNotifications)}
                  {!moduleMetadata.slackNotifications.visibleTo.includes('client') && (
                    <Lock className="w-3 h-3 text-yellow-400" />
                  )}
                </div>
                <Switch 
                  checked={moduleStates.slackNotifications} 
                  onCheckedChange={() => toggleModule('slackNotifications')}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* CRM & Data */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center space-x-2">
              <Database className="w-4 h-4 text-green-400" />
              <span>CRM & Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.hubspotSync)} rounded-full`}></div>
                <span className="text-white text-sm">HubSpot Sync</span>
                {getStatusIcon(moduleStates.hubspotSync)}
              </div>
              <Switch 
                checked={moduleStates.hubspotSync} 
                onCheckedChange={() => toggleModule('hubspotSync')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.airtableLogging)} rounded-full`}></div>
                <span className="text-white text-sm">Airtable Logging</span>
                {getStatusIcon(moduleStates.airtableLogging)}
              </div>
              <Switch 
                checked={moduleStates.airtableLogging} 
                onCheckedChange={() => toggleModule('airtableLogging')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.leadScoring)} rounded-full`}></div>
                <span className="text-white text-sm">Lead Scoring</span>
                {getStatusIcon(moduleStates.leadScoring)}
              </div>
              <Switch 
                checked={moduleStates.leadScoring} 
                onCheckedChange={() => toggleModule('leadScoring')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.contactEnrichment)} rounded-full`}></div>
                <span className="text-white text-sm">Contact Enrichment</span>
                {getStatusIcon(moduleStates.contactEnrichment)}
              </div>
              <Switch 
                checked={moduleStates.contactEnrichment} 
                onCheckedChange={() => toggleModule('contactEnrichment')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Automation & AI */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center space-x-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <span>Automation & AI</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.smartWorkflows)} rounded-full`}></div>
                <span className="text-white text-sm">Smart Workflows</span>
                {getStatusIcon(moduleStates.smartWorkflows)}
              </div>
              <Switch 
                checked={moduleStates.smartWorkflows} 
                onCheckedChange={() => toggleModule('smartWorkflows')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.emailAutomation)} rounded-full`}></div>
                <span className="text-white text-sm">Email Automation</span>
                {getStatusIcon(moduleStates.emailAutomation)}
              </div>
              <Switch 
                checked={moduleStates.emailAutomation} 
                onCheckedChange={() => toggleModule('emailAutomation')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.followupTasks)} rounded-full`}></div>
                <span className="text-white text-sm">Follow-up Tasks</span>
                {getStatusIcon(moduleStates.followupTasks)}
              </div>
              <Switch 
                checked={moduleStates.followupTasks} 
                onCheckedChange={() => toggleModule('followupTasks')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.pdfGeneration)} rounded-full`}></div>
                <span className="text-white text-sm">PDF Generation</span>
                {getStatusIcon(moduleStates.pdfGeneration)}
              </div>
              <Switch 
                checked={moduleStates.pdfGeneration} 
                onCheckedChange={() => toggleModule('pdfGeneration')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Tools */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center space-x-2">
              <FileText className="w-4 h-4 text-yellow-400" />
              <span>Business Tools</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.quoteGenerator)} rounded-full`}></div>
                <span className="text-white text-sm">Quote Generator</span>
                {getStatusIcon(moduleStates.quoteGenerator)}
              </div>
              <Switch 
                checked={moduleStates.quoteGenerator} 
                onCheckedChange={() => toggleModule('quoteGenerator')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.calendarBooking)} rounded-full`}></div>
                <span className="text-white text-sm">Calendar Booking</span>
                {getStatusIcon(moduleStates.calendarBooking)}
              </div>
              <Switch 
                checked={moduleStates.calendarBooking} 
                onCheckedChange={() => toggleModule('calendarBooking')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.ndaGenerator)} rounded-full`}></div>
                <span className="text-white text-sm">NDA Generator</span>
                {getStatusIcon(moduleStates.ndaGenerator)}
              </div>
              <Switch 
                checked={moduleStates.ndaGenerator} 
                onCheckedChange={() => toggleModule('ndaGenerator')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.businessCardOcr)} rounded-full`}></div>
                <span className="text-white text-sm">Business Card OCR</span>
                {getStatusIcon(moduleStates.businessCardOcr)}
              </div>
              <Switch 
                checked={moduleStates.businessCardOcr} 
                onCheckedChange={() => toggleModule('businessCardOcr')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Analytics & Monitoring */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Analytics & Monitoring</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.realtimeMetrics)} rounded-full`}></div>
                <span className="text-white text-sm">Real-time Metrics</span>
                {getStatusIcon(moduleStates.realtimeMetrics)}
              </div>
              <Switch 
                checked={moduleStates.realtimeMetrics} 
                onCheckedChange={() => toggleModule('realtimeMetrics')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.performanceTracking)} rounded-full`}></div>
                <span className="text-white text-sm">Performance Tracking</span>
                {getStatusIcon(moduleStates.performanceTracking)}
              </div>
              <Switch 
                checked={moduleStates.performanceTracking} 
                onCheckedChange={() => toggleModule('performanceTracking')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.usageAnalytics)} rounded-full`}></div>
                <span className="text-white text-sm">Usage Analytics</span>
                {getStatusIcon(moduleStates.usageAnalytics)}
              </div>
              <Switch 
                checked={moduleStates.usageAnalytics} 
                onCheckedChange={() => toggleModule('usageAnalytics')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.errorMonitoring)} rounded-full`}></div>
                <span className="text-white text-sm">Error Monitoring</span>
                {getStatusIcon(moduleStates.errorMonitoring)}
              </div>
              <Switch 
                checked={moduleStates.errorMonitoring} 
                onCheckedChange={() => toggleModule('errorMonitoring')}
              />
            </div>
            

          </CardContent>
        </Card>

        {/* Integrations */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center space-x-2">
              <Network className="w-4 h-4 text-orange-400" />
              <span>Integrations</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.googleCalendar)} rounded-full`}></div>
                <span className="text-white text-sm">Google Calendar</span>
                {getStatusIcon(moduleStates.googleCalendar)}
              </div>
              <Switch 
                checked={moduleStates.googleCalendar} 
                onCheckedChange={() => toggleModule('googleCalendar')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.stripePayments)} rounded-full`}></div>
                <span className="text-white text-sm">Stripe Payments</span>
                {getStatusIcon(moduleStates.stripePayments)}
              </div>
              <Switch 
                checked={moduleStates.stripePayments} 
                onCheckedChange={() => toggleModule('stripePayments')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.quickbooks)} rounded-full`}></div>
                <span className="text-white text-sm">QuickBooks</span>
                {getStatusIcon(moduleStates.quickbooks)}
              </div>
              <Switch 
                checked={moduleStates.quickbooks} 
                onCheckedChange={() => toggleModule('quickbooks')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.twilioSms)} rounded-full`}></div>
                <span className="text-white text-sm">Twilio SMS</span>
                {getStatusIcon(moduleStates.twilioSms)}
              </div>
              <Switch 
                checked={moduleStates.twilioSms} 
                onCheckedChange={() => toggleModule('twilioSms')}
              />
            </div>
          </CardContent>
        </Card>

        {/* File Management */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center space-x-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>File Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.documentGeneration)} rounded-full`}></div>
                <span className="text-white text-sm">Document Generation</span>
                {getStatusIcon(moduleStates.documentGeneration)}
              </div>
              <Switch 
                checked={moduleStates.documentGeneration} 
                onCheckedChange={() => toggleModule('documentGeneration')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.pdfProcessor)} rounded-full`}></div>
                <span className="text-white text-sm">PDF Processor</span>
                {getStatusIcon(moduleStates.pdfProcessor)}
              </div>
              <Switch 
                checked={moduleStates.pdfProcessor} 
                onCheckedChange={() => toggleModule('pdfProcessor')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.fileStorage)} rounded-full`}></div>
                <span className="text-white text-sm">File Storage</span>
                {getStatusIcon(moduleStates.fileStorage)}
              </div>
              <Switch 
                checked={moduleStates.fileStorage} 
                onCheckedChange={() => toggleModule('fileStorage')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.backupSystem)} rounded-full`}></div>
                <span className="text-white text-sm">Backup System</span>
                {getStatusIcon(moduleStates.backupSystem)}
              </div>
              <Switch 
                checked={moduleStates.backupSystem} 
                onCheckedChange={() => toggleModule('backupSystem')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Webhook Management */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center space-x-2">
              <Activity className="w-4 h-4 text-red-400" />
              <span>Webhook Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.webhookMonitoring)} rounded-full`}></div>
                <span className="text-white text-sm">Webhook Monitoring</span>
                {getStatusIcon(moduleStates.webhookMonitoring)}
                <div title={getStatusDetails('webhookMonitoring')}>
                  {getStatusIndicator('webhookMonitoring')}
                </div>
              </div>
              <Switch 
                checked={moduleStates.webhookMonitoring} 
                onCheckedChange={() => toggleModule('webhookMonitoring')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.scenarioControl)} rounded-full`}></div>
                <span className="text-white text-sm">Scenario Control</span>
                {getStatusIcon(moduleStates.scenarioControl)}
              </div>
              <Switch 
                checked={moduleStates.scenarioControl} 
                onCheckedChange={() => toggleModule('scenarioControl')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.rateLimiting)} rounded-full`}></div>
                <span className="text-white text-sm">Rate Limiting</span>
                {getStatusIcon(moduleStates.rateLimiting)}
              </div>
              <Switch 
                checked={moduleStates.rateLimiting} 
                onCheckedChange={() => toggleModule('rateLimiting')}
              />
            </div>

            {/* Run System Diagnostics - Single Consolidated Tile */}
            {isModuleVisible('systemDiagnostics') && (
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 ${getStatusColor(true)} rounded-full`}></div>
                    <div>
                      <span className="text-white text-sm font-medium">Run System Diagnostics</span>
                      <p className="text-slate-400 text-xs">
                        Triggers full diagnostics based on system mode ({currentSystemMode.toUpperCase()})
                      </p>
                    </div>
                    <Settings className="w-4 h-4 text-blue-400" />
                  </div>
                  <Button
                    onClick={async () => {
                      try {
                        const endpoint = currentSystemMode === 'test' ? '/test' : '/';
                        
                        setActionLog(prev => [...prev, {
                          id: Date.now(),
                          timestamp: new Date().toISOString(),
                          module: 'System Diagnostics',
                          action: `${currentSystemMode.toUpperCase()} Mode Diagnostics`,
                          status: 'Processing',
                          details: `Running ${currentSystemMode} diagnostics via ${endpoint}`
                        }]);

                        const response = await fetch(endpoint, {
                          method: 'GET'
                        });

                        if (response.ok) {
                          setActionLog(prev => [...prev, {
                            id: Date.now() + 1,
                            timestamp: new Date().toISOString(),
                            module: 'System Diagnostics',
                            action: `${currentSystemMode.toUpperCase()} Mode`,
                            status: 'Success',
                            details: `${currentSystemMode} diagnostics completed - results logged to Airtable`
                          }]);
                        } else {
                          throw new Error(`HTTP ${response.status}`);
                        }
                      } catch (error) {
                        setActionLog(prev => [...prev, {
                          id: Date.now() + 2,
                          timestamp: new Date().toISOString(),
                          module: 'System Diagnostics',
                          action: 'Diagnostics Execution',
                          status: 'Failed',
                          details: `Failed to execute ${currentSystemMode} diagnostics: ${error.message}`
                        }]);
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
                  >
                    Run Diagnostics
                  </Button>
                </div>
              </div>
            )}
            

          </CardContent>
        </Card>

        {/* Security & Compliance */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center space-x-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Security & Compliance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.dataEncryption)} rounded-full`}></div>
                <span className="text-white text-sm">Data Encryption</span>
                {getStatusIcon(moduleStates.dataEncryption)}
              </div>
              <Switch 
                checked={moduleStates.dataEncryption} 
                onCheckedChange={() => toggleModule('dataEncryption')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.gdprCompliance)} rounded-full`}></div>
                <span className="text-white text-sm">GDPR Compliance</span>
                {getStatusIcon(moduleStates.gdprCompliance)}
              </div>
              <Switch 
                checked={moduleStates.gdprCompliance} 
                onCheckedChange={() => toggleModule('gdprCompliance')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.accessLogging)} rounded-full`}></div>
                <span className="text-white text-sm">Access Logging</span>
                {getStatusIcon(moduleStates.accessLogging)}
              </div>
              <Switch 
                checked={moduleStates.accessLogging} 
                onCheckedChange={() => toggleModule('accessLogging')}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${getStatusColor(moduleStates.auditTrail)} rounded-full`}></div>
                <span className="text-white text-sm">Audit Trail</span>
                {getStatusIcon(moduleStates.auditTrail)}
              </div>
              <Switch 
                checked={moduleStates.auditTrail} 
                onCheckedChange={() => toggleModule('auditTrail')}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Actions */}
      <div className="mt-8 flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-white text-sm">System Status: Operational</span>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
            Reset All
          </Button>
          <Button 
            onClick={handleLogout}
            variant="outline" 
            className="border-red-500/30 text-red-300 hover:bg-red-500/10"
          >
            <Lock className="w-4 h-4 mr-2" />
            Logout
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Save Configuration
          </Button>
        </div>
      </div>

      {/* Action Log Modal */}
      <Dialog open={showActionLog} onOpenChange={setShowActionLog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center space-x-2">
              <ScrollText className="w-5 h-5" />
              <span>System Action Log</span>
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Real-time module activity and troubleshooting details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Filter Controls */}
            <div className="flex items-center space-x-4 p-4 bg-slate-800/50 rounded-lg">
              <Label className="text-white text-sm">Filter:</Label>
              <Button size="sm" variant="outline" className="text-xs border-slate-600 text-white hover:bg-slate-700">All</Button>
              <Button size="sm" variant="outline" className="text-xs border-red-600 text-red-300 hover:bg-red-900/20">Errors Only</Button>
              <Button size="sm" variant="outline" className="text-xs border-yellow-600 text-yellow-300 hover:bg-yellow-900/20">Warnings</Button>
              <Button size="sm" variant="outline" className="text-xs border-slate-600 text-white hover:bg-slate-700">Last 24h</Button>
            </div>

            {/* Log Entries */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {actionLog.map((log) => (
                <div 
                  key={log.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    log.status === 'Failed' || log.status === 'Error' 
                      ? 'bg-red-900/20 border-red-500' 
                      : log.status === 'Warning'
                      ? 'bg-yellow-900/20 border-yellow-500'
                      : 'bg-green-900/20 border-green-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-white font-medium text-sm">{log.module}</span>
                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                        {log.action}
                      </Badge>
                      <Badge 
                        className={`text-xs ${
                          log.status === 'Failed' || log.status === 'Error'
                            ? 'bg-red-500/20 text-red-300 border-red-500/30'
                            : log.status === 'Warning'
                            ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                            : 'bg-green-500/20 text-green-300 border-green-500/30'
                        }`}
                      >
                        {log.status}
                      </Badge>
                    </div>
                    <span className="text-slate-400 text-xs">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm mt-1">{log.details}</p>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end space-x-2 pt-4 border-t border-slate-700">
              <Button 
                variant="outline" 
                size="sm"
                className="border-slate-600 text-white hover:bg-slate-700"
                onClick={() => setActionLog([])}
              >
                Clear Log
              </Button>
              <Button 
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setShowActionLog(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>



      {/* Critical System Management Section - Live Mode Only */}
      <Card className="bg-red-900/60 backdrop-blur-sm border border-red-500/30 mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>Critical System Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center text-slate-400 py-8">
            Live Mode - All test controls removed
            <br />
            System operating in production environment
          </div>
        </CardContent>
      </Card>
    </div>
  );
}