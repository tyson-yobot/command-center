import { useState } from "react";
import robotHeadImage from '@/assets/images/A_flat_vector_illustration_features_a_robot_face_i_1749714890077.png';
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
  Crown,
  CheckCircle,
  AlertTriangle,
  Package,
  Lock,
  Unlock,
  Search,
  Filter,
  Building,
  Zap,
  Clock,
  AlertCircle,
  Wifi,
  WifiOff,
  Bot,
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
    systemDiagnostics: { category: 'Runtime Control', name: 'Run System Diagnostics', visibleTo: ['admin'] },
    
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

  // Package tier configurations based on YoBot pricing matrix
  const packageConfigurations = {
    starter: {
      // Starter Package: Botalytics ROI Dashboard ✔️, AI Chatbot (SMS + Email) ✔️
      // Core features from pricing matrix
      realtimeMetrics: true,      // Botalytics ROI Dashboard ✔️
      performanceTracking: true,  // Botalytics ROI Dashboard ✔️ 
      usageAnalytics: true,       // Botalytics ROI Dashboard ✔️
      emailAutomation: true,      // AI Chatbot (SMS + Email) ✔️
      twilioSms: true,           // AI Chatbot (SMS + Email) ✔️
      airtableLogging: true,     // Basic CRM Logging (mentioned in description)
      
      // Everything else disabled for Starter
      voiceBotCore: false,       // VoiceBot - Pro+
      hubspotSync: false,        // CRM Integration - Pro+
      calendarBooking: false,    // Booking Tool - Pro+
      stripePayments: false,     // Payment Integration - Enterprise+
      quickbooks: false,         // QuickBooks - Enterprise+
      leadScoring: false,        // Lead Scoring - Enterprise+
      followupTasks: false,      // Smart Follow-Up - Enterprise+
      quoteGenerator: false,     // AI Quote Generation - Pro+
      missedCallResponder: false, // Live Transfer Routing - Pro+
      slackNotifications: false,  // Slack/Email/CRM Notifications - Enterprise+
      businessCardOcr: false,    // A/B Script Testing - Pro+
      contactEnrichment: false,  // Custom Branded Persona - Pro+
      smartWorkflows: false,     // 24/7 Customer Engagement - Pro+
      systemDiagnostics: true
    },
    pro: {
      // Pro Package: All Starter + VoiceBot ✔️, CRM Integration ✔️, Booking Tool ✔️, 
      // AI Quote Generation ✔️, Live Transfer Routing ✔️, A/B Script Testing ✔️, 
      // Custom Branded Persona ✔️, 24/7 Customer Engagement ✔️, ChatGPT Booster ✔️
      
      // All Starter features
      realtimeMetrics: true,      // Botalytics ROI Dashboard ✔️
      performanceTracking: true,  // Botalytics ROI Dashboard ✔️
      usageAnalytics: true,       // Botalytics ROI Dashboard ✔️
      emailAutomation: true,      // AI Chatbot (SMS + Email) ✔️
      twilioSms: true,           // AI Chatbot (SMS + Email) ✔️
      airtableLogging: true,     // Basic CRM Logging
      
      // Pro additions from pricing matrix
      voiceBotCore: true,        // VoiceBot (Inbound + Outbound) ✔️
      hubspotSync: true,         // CRM Integration ✔️
      calendarBooking: true,     // Booking Tool (Calendar Integration) ✔️
      quoteGenerator: true,      // AI Quote Generation ✔️
      missedCallResponder: true, // Live Transfer Routing ✔️
      businessCardOcr: true,     // A/B Script Testing ✔️
      contactEnrichment: true,   // Custom Branded Persona ✔️
      smartWorkflows: true,      // 24/7 Customer Engagement Engine ✔️
      pdfGeneration: true,       // ChatGPT Booster ✔️
      
      // Still disabled in Pro
      stripePayments: false,     // Payment Integration - Enterprise+
      quickbooks: false,         // QuickBooks - Enterprise+
      leadScoring: false,        // Lead Scoring - Enterprise+
      followupTasks: false,      // Smart Follow-Up - Enterprise+
      slackNotifications: false, // Slack/Email/CRM Notifications - Enterprise+
      systemDiagnostics: true
    },
    enterprise: {
      // Enterprise Package: All Pro + Payment Integration ✔️, QuickBooks Online Integration ✔️,
      // Google Ads/Facebook Funnel Integration ✔️, Lead Scoring + Smart Follow-Up ✔️,
      // Slack/Email/CRM Notifications ✔️, Customer Journey Orchestration ✔️, SmartSpend™ Dashboard ✔️,
      // Lead Generation & Scraping Tools ✔️, Advanced Data Integration Hub ✔️, Automated Content Generation Studio ✔️
      
      // All Pro features
      realtimeMetrics: true,      // Botalytics ROI Dashboard ✔️
      performanceTracking: true,  // Botalytics ROI Dashboard ✔️
      usageAnalytics: true,       // Botalytics ROI Dashboard ✔️
      emailAutomation: true,      // AI Chatbot (SMS + Email) ✔️
      twilioSms: true,           // AI Chatbot (SMS + Email) ✔️
      airtableLogging: true,     // Basic CRM Logging
      voiceBotCore: true,        // VoiceBot (Inbound + Outbound) ✔️
      hubspotSync: true,         // CRM Integration ✔️
      calendarBooking: true,     // Booking Tool (Calendar Integration) ✔️
      quoteGenerator: true,      // AI Quote Generation ✔️
      missedCallResponder: true, // Live Transfer Routing ✔️
      businessCardOcr: true,     // A/B Script Testing ✔️
      contactEnrichment: true,   // Custom Branded Persona ✔️
      smartWorkflows: true,      // 24/7 Customer Engagement Engine ✔️
      pdfGeneration: true,       // ChatGPT Booster ✔️
      
      // Enterprise additions from pricing matrix
      stripePayments: true,      // Payment Integration ✔️
      quickbooks: true,          // QuickBooks Online Integration ✔️
      googleCalendar: true,      // Google Ads/Facebook Funnel Integration ✔️
      leadScoring: true,         // Lead Scoring + Smart Follow-Up ✔️
      followupTasks: true,       // Lead Scoring + Smart Follow-Up ✔️
      slackNotifications: true,  // Slack/Email/CRM Notifications ✔️
      documentGeneration: true,  // Customer Journey Orchestration ✔️
      errorMonitoring: true,     // SmartSpend™ Dashboard ✔️
      apifyGoogleMapsScraping: true,  // Lead Generation & Scraping Tools ✔️
      apolloLeadGeneration: true,     // Lead Generation & Scraping Tools ✔️
      launchPhantombuster: true,      // Lead Generation & Scraping Tools ✔️
      pdfProcessor: true,        // Advanced Data Integration Hub ✔️
      ndaGenerator: true,        // Automated Content Generation Studio ✔️
      systemDiagnostics: true
    },
    platinum: {
      // Platinum Package: All Enterprise + White Label Mode ✔️, Predictive Analytics Engine ✔️,
      // Competitive Intelligence Radar (Optional in Enterprise, ✔️ in Platinum)
      
      // All Enterprise features
      realtimeMetrics: true,      // Botalytics ROI Dashboard ✔️
      performanceTracking: true,  // Botalytics ROI Dashboard ✔️
      usageAnalytics: true,       // Botalytics ROI Dashboard ✔️
      emailAutomation: true,      // AI Chatbot (SMS + Email) ✔️
      twilioSms: true,           // AI Chatbot (SMS + Email) ✔️
      airtableLogging: true,     // Basic CRM Logging
      voiceBotCore: true,        // VoiceBot (Inbound + Outbound) ✔️
      hubspotSync: true,         // CRM Integration ✔️
      calendarBooking: true,     // Booking Tool (Calendar Integration) ✔️
      quoteGenerator: true,      // AI Quote Generation ✔️
      missedCallResponder: true, // Live Transfer Routing ✔️
      businessCardOcr: true,     // A/B Script Testing ✔️
      contactEnrichment: true,   // Custom Branded Persona ✔️
      smartWorkflows: true,      // 24/7 Customer Engagement Engine ✔️
      pdfGeneration: true,       // ChatGPT Booster ✔️
      stripePayments: true,      // Payment Integration ✔️
      quickbooks: true,          // QuickBooks Online Integration ✔️
      googleCalendar: true,      // Google Ads/Facebook Funnel Integration ✔️
      leadScoring: true,         // Lead Scoring + Smart Follow-Up ✔️
      followupTasks: true,       // Lead Scoring + Smart Follow-Up ✔️
      slackNotifications: true,  // Slack/Email/CRM Notifications ✔️
      documentGeneration: true,  // Customer Journey Orchestration ✔️
      errorMonitoring: true,     // SmartSpend™ Dashboard ✔️
      apifyGoogleMapsScraping: true,  // Lead Generation & Scraping Tools ✔️
      apolloLeadGeneration: true,     // Lead Generation & Scraping Tools ✔️
      launchPhantombuster: true,      // Lead Generation & Scraping Tools ✔️
      pdfProcessor: true,        // Advanced Data Integration Hub ✔️
      ndaGenerator: true,        // Automated Content Generation Studio ✔️
      
      // Platinum exclusive features from pricing matrix
      fileStorage: true,         // White Label Mode ✔️
      backupSystem: true,        // Predictive Analytics Engine ✔️
      webhookMonitoring: true,   // Competitive Intelligence Radar ✔️
      systemDiagnostics: true
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
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
              <img 
                src="/attached_assets/A_flat_vector_illustration_features_a_robot_face_i_1750002410783.png" 
                alt="YoBot Robot Head" 
                className="w-16 h-16 rounded-xl"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="w-16 h-16 bg-red-600 rounded-xl flex items-center justify-center" style={{ display: 'none' }}>
                <Lock className="w-8 h-8 text-white" />
              </div>
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
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center">
            <img 
              src={robotHeadImage} 
              alt="YoBot Robot Head" 
              className="w-14 h-14 mr-0 -mt-3"
              onError={(e) => {
                console.log('Image failed to load, showing Bot icon fallback');
                (e.target as HTMLImageElement).style.display = 'none';
                const botIcon = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                if (botIcon) botIcon.style.display = 'block';
              }}
            />
            <Bot className="w-14 h-14 mr-1 -mt-2 text-blue-400" style={{ display: 'none' }} />
            YoBot<sup className="text-lg">®</sup>&nbsp;Control Center
          </h1>
          <p className="text-blue-300">Manage automation modules and integrations</p>
        </div>
        
        <div className="flex items-center justify-center mb-4">
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
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
                <option value="platinum">Platinum</option>
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
        
        <div className="flex items-center space-x-3">
          <Badge className="bg-green-500/20 text-white border-green-500/30 px-3 py-1 h-8 flex items-center">
            {filteredModules.filter(([key, value]) => value).length} Active Modules
          </Badge>
          <Badge className="bg-yellow-500/20 text-white border-yellow-500/30 px-3 py-1 h-8 flex items-center">
            {filteredModules.filter(([key, value]) => !value).length} Disabled
          </Badge>
          <Badge className="bg-blue-500/20 text-white border-blue-500/30 px-3 py-1 h-8 flex items-center">
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)} View
          </Badge>
          {searchQuery && (
            <Badge className="bg-purple-500/20 text-white border-purple-500/30 px-3 py-1 h-8 flex items-center">
              Filtered: {filteredModules.length} results
            </Badge>
          )}
          <Badge className="bg-red-500/20 text-white border-red-500/30 animate-pulse px-3 py-1 h-8 flex items-center">
            Emergency Controls Available
          </Badge>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-500 h-8 px-4">
            Apply Changes
          </Button>
          <Button 
            onClick={() => setShowActionLog(true)}
            className="bg-slate-600 hover:bg-slate-700 text-white border-2 border-slate-500 flex items-center space-x-2 h-8 px-4"
          >
            <ScrollText className="w-4 h-4" />
            <span>Logs</span>
          </Button>
        </div>
      </div>

      {/* Core Package Presets */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2 border border-blue-500 p-3 rounded bg-blue-500/10">
          <Package className="w-5 h-5 text-blue-400" />
          <span>Core Packages - Preset Toggle Groups</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Starter Bot */}
          <Card className="bg-blue-900/40 backdrop-blur-sm border-2 border-blue-500 hover:border-blue-400 transition-colors cursor-pointer shadow-lg shadow-blue-500/20"
                onClick={() => applyPackageSettings('starter')}>
            <CardContent className="p-4 text-center">
              <Settings className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">Starter Bot</h3>
              <p className="text-white/60 text-xs">Basic AI & Dashboard</p>
            </CardContent>
          </Card>

          {/* Pro Bot */}
          <Card className="bg-purple-900/40 backdrop-blur-sm border-2 border-purple-500 hover:border-purple-400 transition-colors cursor-pointer shadow-lg shadow-purple-500/20"
                onClick={() => applyPackageSettings('pro')}>
            <CardContent className="p-4 text-center">
              <Brain className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">Pro Bot</h3>
              <p className="text-white/60 text-xs">Voice + Integrations</p>
            </CardContent>
          </Card>

          {/* Enterprise Bot */}
          <Card className="bg-green-900/40 backdrop-blur-sm border-2 border-green-500 hover:border-green-400 transition-colors cursor-pointer shadow-lg shadow-green-500/20"
                onClick={() => applyPackageSettings('enterprise')}>
            <CardContent className="p-4 text-center">
              <Building className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">Enterprise Bot</h3>
              <p className="text-white/60 text-xs">Advanced Features</p>
            </CardContent>
          </Card>

          {/* Platinum Bot */}
          <Card className="bg-gray-300/90 backdrop-blur-sm border-2 border-gray-400 hover:border-gray-300 transition-colors cursor-pointer shadow-lg shadow-gray-400/20"
                onClick={() => applyPackageSettings('platinum')}>
            <CardContent className="p-4 text-center">
              <Zap className="w-8 h-8 text-gray-700 mx-auto mb-2" />
              <h3 className="text-black font-semibold mb-1">Platinum Bot</h3>
              <p className="text-gray-700 text-xs">Complete Suite</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add-On Modules */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2 border border-blue-500 p-3 rounded bg-blue-500/10">
          <Settings className="w-5 h-5 text-blue-400" />
          <span>Add-On Modules - Individual Toggles</span>
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {/* Core Package Features */}
          <Card className="bg-white/5 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base flex items-center space-x-2">
                <Settings className="w-6 h-6 text-blue-400" />
                <span className="text-white font-semibold">Core Package Features</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 ${getStatusColor(moduleStates.errorMonitoring)} rounded-full`}></div>
                  <span className="text-white text-sm font-medium border border-blue-400 px-2 py-1 rounded bg-slate-600/60">Basic AI Chat</span>
                  {getStatusIcon(moduleStates.errorMonitoring)}
                </div>
                <Switch 
                  checked={moduleStates.errorMonitoring} 
                  onCheckedChange={() => toggleModule('errorMonitoring')}
                  className="control-center-switch"
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 ${getStatusColor(moduleStates.quickbooks)} rounded-full`}></div>
                  <span className="text-white text-sm font-medium border border-blue-400 px-2 py-1 rounded bg-slate-600/60">SMS Automation</span>
                  {getStatusIcon(moduleStates.quickbooks)}
                </div>
                <Switch 
                  checked={moduleStates.quickbooks} 
                  onCheckedChange={() => toggleModule('quickbooks')}
                  className="control-center-switch"
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 ${getStatusColor(moduleStates.systemDiagnostics)} rounded-full`}></div>
                  <span className="text-white text-sm font-medium border border-blue-400 px-2 py-1 rounded bg-slate-600/60">Email Automation</span>
                  {getStatusIcon(moduleStates.systemDiagnostics)}
                </div>
                <Switch 
                  checked={moduleStates.systemDiagnostics} 
                  onCheckedChange={() => toggleModule('systemDiagnostics')}
                  className="control-center-switch"
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 ${getStatusColor(moduleStates.realtimeMetrics)} rounded-full`}></div>
                  <span className="text-white text-sm border border-blue-400 px-2 py-1 rounded bg-slate-600/60">CRM Basic Integration</span>
                  {getStatusIcon(moduleStates.realtimeMetrics)}
                </div>
                <Switch 
                  checked={moduleStates.realtimeMetrics} 
                  onCheckedChange={() => toggleModule('realtimeMetrics')}
                  className="control-center-switch"
                />
              </div>
            </CardContent>
          </Card>

          {/* 🔧 Professional Add-Ons */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base flex items-center space-x-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span>Professional Add-Ons</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 ${getStatusColor(moduleStates.pdfGeneration)} rounded-full`}></div>
                  <span className="text-white text-sm border border-purple-400 px-2 py-1 rounded bg-slate-600/60">Voice Call Pipeline</span>
                  {getStatusIcon(moduleStates.pdfGeneration)}
                </div>
                <Switch 
                  checked={moduleStates.pdfGeneration} 
                  onCheckedChange={() => toggleModule('pdfGeneration')}
                  className="control-center-switch"
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 ${getStatusColor(moduleStates.businessCardOcr)} rounded-full`}></div>
                  <span className="text-white text-sm border border-purple-400 px-2 py-1 rounded bg-slate-600/60">Advanced Integrations</span>
                  {getStatusIcon(moduleStates.businessCardOcr)}
                </div>
                <Switch 
                  checked={moduleStates.businessCardOcr} 
                  onCheckedChange={() => toggleModule('businessCardOcr')}
                  className="control-center-switch"
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 ${getStatusColor(moduleStates.contactEnrichment)} rounded-full`}></div>
                  <span className="text-white text-sm border border-purple-400 px-2 py-1 rounded bg-slate-600/60">Calendar Booking System</span>
                  {getStatusIcon(moduleStates.contactEnrichment)}
                </div>
                <Switch 
                  checked={moduleStates.contactEnrichment} 
                  onCheckedChange={() => toggleModule('contactEnrichment')}
                  className="control-center-switch"
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 ${getStatusColor(moduleStates.ndaGenerator)} rounded-full`}></div>
                  <span className="text-white text-sm border border-purple-400 px-2 py-1 rounded bg-slate-600/60">Advanced Reporting Suite</span>
                  {getStatusIcon(moduleStates.ndaGenerator)}
                </div>
                <Switch 
                  checked={moduleStates.ndaGenerator} 
                  onCheckedChange={() => toggleModule('ndaGenerator')}
                  className="control-center-switch"
                />
              </div>
            </CardContent>
          </Card>

          {/* 🏢 Enterprise Features */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base flex items-center space-x-2">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span>Enterprise Features</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 ${getStatusColor(moduleStates.smartWorkflows)} rounded-full`}></div>
                  <span className="text-white text-sm border border-green-400 px-2 py-1 rounded bg-slate-600/60">Lead Scoring Engine</span>
                  {getStatusIcon(moduleStates.smartWorkflows)}
                </div>
                <Switch 
                  checked={moduleStates.smartWorkflows} 
                  onCheckedChange={() => toggleModule('smartWorkflows')}
                  className="control-center-switch"
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 ${getStatusColor(moduleStates.documentGeneration)} rounded-full`}></div>
                  <span className="text-white text-sm border border-green-400 px-2 py-1 rounded bg-slate-600/60">Multi-Channel Analytics</span>
                  {getStatusIcon(moduleStates.documentGeneration)}
                </div>
                <Switch 
                  checked={moduleStates.documentGeneration} 
                  onCheckedChange={() => toggleModule('documentGeneration')}
                  className="control-center-switch"
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 ${getStatusColor(moduleStates.voiceBotCore)} rounded-full`}></div>
                  <span className="text-white text-sm border border-green-400 px-2 py-1 rounded bg-slate-600/60">Custom Workflow Builder</span>
                  {getStatusIcon(moduleStates.voiceBotCore)}
                </div>
                <Switch 
                  checked={moduleStates.voiceBotCore} 
                  onCheckedChange={() => toggleModule('voiceBotCore')}
                  className="control-center-switch"
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 ${getStatusColor(moduleStates.webhookMonitoring)} rounded-full`}></div>
                  <span className="text-white text-sm border border-green-400 px-2 py-1 rounded bg-slate-600/60">Competitive Intelligence Radar</span>
                  {getStatusIcon(moduleStates.webhookMonitoring)}
                </div>
                <Switch 
                  checked={moduleStates.webhookMonitoring} 
                  onCheckedChange={() => toggleModule('webhookMonitoring')}
                  className="control-center-switch"
                />
              </div>
            </CardContent>
          </Card>

          {/* 📢 Communication & Conversion */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-green-400" />
                <span>Communication & Conversion</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 ${getStatusColor(moduleStates.slackNotifications)} rounded-full`}></div>
                  <span className="text-white text-sm border border-gray-400 px-2 py-1 rounded bg-slate-600/60">Slack Notifications</span>
                  {getStatusIcon(moduleStates.slackNotifications)}
                </div>
                <Switch 
                  checked={moduleStates.slackNotifications} 
                  onCheckedChange={() => toggleModule('slackNotifications')}
                  className="control-center-switch"
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 ${getStatusColor(moduleStates.quoteGenerator)} rounded-full`}></div>
                  <span className="text-white text-sm border border-gray-400 px-2 py-1 rounded bg-slate-600/60">Smart Quoting Engine</span>
                  {getStatusIcon(moduleStates.quoteGenerator)}
                </div>
                <Switch 
                  checked={moduleStates.quoteGenerator} 
                  onCheckedChange={() => toggleModule('quoteGenerator')}
                  className="control-center-switch"
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 ${getStatusColor(moduleStates.missedCallResponder)} rounded-full`}></div>
                  <span className="text-white text-sm border border-gray-400 px-2 py-1 rounded bg-slate-600/60">Live Transfer Routing</span>
                  {getStatusIcon(moduleStates.missedCallResponder)}
                </div>
                <Switch 
                  checked={moduleStates.missedCallResponder} 
                  onCheckedChange={() => toggleModule('missedCallResponder')}
                  className="control-center-switch"
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 ${getStatusColor(moduleStates.calendarBooking)} rounded-full`}></div>
                  <span className="text-white text-sm border border-gray-400 px-2 py-1 rounded bg-slate-600/60">Booking Tool Setup</span>
                  {getStatusIcon(moduleStates.calendarBooking)}
                </div>
                <Switch 
                  checked={moduleStates.calendarBooking} 
                  onCheckedChange={() => toggleModule('calendarBooking')}
                  className="control-center-switch"
                />
              </div>
            </CardContent>
          </Card>

          {/* 📡 Lead & Data Tools */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base flex items-center space-x-2">
                <Target className="w-4 h-4 text-orange-400" />
                <span>Lead & Data Tools</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-900/20 rounded-lg hover:bg-blue-800/30 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 ${getStatusColor(moduleStates.apifyGoogleMapsScraping)} rounded-full`}></div>
                  <span className="text-white text-sm">Lead Generation & Scraping Tools</span>
                  {getStatusIcon(moduleStates.apifyGoogleMapsScraping)}
                </div>
                <Switch 
                  checked={moduleStates.apifyGoogleMapsScraping} 
                  onCheckedChange={() => toggleModule('apifyGoogleMapsScraping')}
                  className="control-center-switch"
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-900/20 rounded-lg hover:bg-blue-800/30 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 ${getStatusColor(moduleStates.pdfProcessor)} rounded-full`}></div>
                  <span className="text-white text-sm">Advanced Data Integration Hub</span>
                  {getStatusIcon(moduleStates.pdfProcessor)}
                </div>
                <Switch 
                  checked={moduleStates.pdfProcessor} 
                  onCheckedChange={() => toggleModule('pdfProcessor')}
                  className="control-center-switch"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ⚙️ Runtime Control */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2 border border-blue-500 p-3 rounded bg-blue-500/10">
          <Settings className="w-5 h-5 text-blue-400" />
          <span>Runtime Control</span>
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base flex items-center space-x-2">
                <Activity className="w-4 h-4 text-red-400" />
                <span>System Diagnostics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => handleSystemDiagnostics()}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                Run System Diagnostics
              </Button>
              <p className="text-white/60 text-xs text-center">
                Toggle-aware execution: {currentSystemMode === 'test' ? 'Test Mode' : 'Live Mode'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  // Helper function for system diagnostics
  const handleSystemDiagnostics = () => {
    const route = currentSystemMode === 'test' ? '/test' : '/';
    window.open(route, '_blank');
  };

}
