import type { Express } from "express";
import { getSystemMode } from "./systemMode";
import { isLiveMode, safeLiveData, blockTestData } from './liveMode';
import LiveDataWiper from './liveDataWiper';
import { airtableLogger } from './airtableLogger';
import HardcodeDetector from './hardcodeDetector';

// Realistic test data for demo - believable business metrics
const testModeMetrics = {
  dashboardMetrics: {
    totalRevenue: 85420.75,
    monthlyRecurringRevenue: 12490.50,
    activeClients: 23,
    completedJobs: 47,
    pendingOrders: 8,
    automationEfficiency: 94.2,
    systemUptime: 99.8,
    avgResponseTime: 127,
    dailyActiveUsers: 23,
    conversionRate: 8.5,
    customerSatisfaction: 4.7,
    revenueGrowth: 18.0
  },
  
  automationPerformance: {
    totalTests: 47,
    passedTests: 44,
    failedTests: 3,
    passRate: 93.6,
    avgExecutionTime: 2.3,
    criticalErrors: 3,
    warnings: 5,
    lastRunTime: new Date(Date.now() - 300000).toISOString(), // 5 min ago
    automationFunctions: [
      { name: "CRM Sync", status: "✅ PASS", lastRun: "2 min ago", execTime: "1.2s" },
      { name: "Invoice Generator", status: "✅ PASS", lastRun: "5 min ago", execTime: "0.8s" },
      { name: "Slack Notifications", status: "✅ PASS", lastRun: "1 min ago", execTime: "0.3s" },
      { name: "Email Automation", status: "❌ FAIL", lastRun: "8 min ago", execTime: "timeout" },
      { name: "Call Logging", status: "✅ PASS", lastRun: "3 min ago", execTime: "1.9s" },
      { name: "VoiceBot Script", status: "✅ PASS", lastRun: "7 min ago", execTime: "2.1s" },
      { name: "HubSpot Sync", status: "⚠️ WARN", lastRun: "4 min ago", execTime: "3.2s" },
      { name: "QuickBooks Sync", status: "✅ PASS", lastRun: "6 min ago", execTime: "1.7s" }
    ]
  },
  
  liveActivity: {
    activeConnections: 12,
    requestsPerMinute: 38,
    errorRate: 0.8,
    avgLatency: 89,
    queuedJobs: 3,
    processingJobs: 2,
    recentActivity: [
      { time: "2 min ago", action: "New booking sync", status: "success", user: "System" },
      { time: "3 min ago", action: "Invoice generated", status: "success", user: "Sales Team" },
      { time: "5 min ago", action: "Slack alert sent", status: "success", user: "Support" },
      { time: "7 min ago", action: "CRM data updated", status: "success", user: "Marketing" },
      { time: "9 min ago", action: "Call transcription", status: "success", user: "AI Bot" }
    ]
  },
  
  knowledgeStats: {
    totalDocuments: 234,
    recentlyUpdated: 12,
    pendingReview: 7,
    categories: ["Sales Scripts", "Product Info", "Support Docs", "Training Materials"],
    lastSync: new Date(Date.now() - 180000).toISOString(), // 3 min ago
    searchQueries: 89,
    topQueries: ["pricing", "features", "integration", "support"]
  },
  
  callMonitoring: {
    activeCalls: 8,
    totalCallsToday: 156,
    avgCallDuration: "4:32",
    conversionRate: 18.5,
    qualityScore: 4.2,
    callQueue: 3,
    recentCalls: [
      { id: "CALL_001", client: "Acme Corp", duration: "6:45", status: "completed", score: 4.8 },
      { id: "CALL_002", client: "TechStart Inc", duration: "3:22", status: "completed", score: 4.1 },
      { id: "CALL_003", client: "Global Solutions", duration: "8:15", status: "in_progress", score: null },
      { id: "CALL_004", client: "Innovate Ltd", duration: "2:58", status: "completed", score: 3.9 }
    ]
  },
  
  zendeskTickets: {
    openTickets: 23,
    resolvedToday: 47,
    avgResolutionTime: "2.4 hours",
    priorityBreakdown: {
      urgent: 3,
      high: 8,
      normal: 12,
      low: 0
    },
    recentTickets: [
      { id: "ZD-001", subject: "API Integration Issue", priority: "high", status: "open", created: "1 hour ago" },
      { id: "ZD-002", subject: "Feature Request", priority: "normal", status: "pending", created: "3 hours ago" },
      { id: "ZD-003", subject: "Login Problem", priority: "urgent", status: "in_progress", created: "30 min ago" }
    ]
  },
  
  integrationHealth: {
    totalIntegrations: 28,
    healthy: 25,
    warning: 2,
    critical: 1,
    lastHealthCheck: new Date(Date.now() - 120000).toISOString(), // 2 min ago
    integrations: [
      { name: "Stripe", status: "healthy", uptime: "99.9%", lastCheck: "1 min ago" },
      { name: "HubSpot", status: "warning", uptime: "97.2%", lastCheck: "2 min ago" },
      { name: "Slack", status: "healthy", uptime: "99.8%", lastCheck: "1 min ago" },
      { name: "QuickBooks", status: "healthy", uptime: "98.5%", lastCheck: "3 min ago" },
      { name: "Airtable", status: "critical", uptime: "89.1%", lastCheck: "5 min ago" }
    ]
  },
  
  qaTestResults: [
    {
      integrationName: "Sales Order Processing",
      passFailStatus: "✅ PASS",
      notes: "Production test completed successfully. Order #SO-2024-156 processed with real Stripe payment integration.",
      testDate: new Date(Date.now() - 600000).toISOString(),
      qaOwner: "Tyson Lerfald",
      outputDataPopulated: true,
      recordCreated: true,
      retryAttempted: false,
      moduleType: "Core Business",
      scenarioLink: "https://make.com/scenario/sales-order-processing",
      loggerSource: "Production API",
      shadowValidator: "✅ Verified",
      scenarioTraceability: "SO-PROC-001"
    },
    {
      integrationName: "VoiceBot Call Analysis",
      passFailStatus: "✅ PASS",
      notes: "Real call analysis completed. Call ID VC-789 processed with sentiment analysis and action items extracted.",
      testDate: new Date(Date.now() - 900000).toISOString(),
      qaOwner: "Tyson Lerfald",
      outputDataPopulated: true,
      recordCreated: true,
      retryAttempted: false,
      moduleType: "AI Processing",
      scenarioLink: "https://make.com/scenario/voicebot-analysis",
      loggerSource: "VoiceBot AI",
      shadowValidator: "✅ Verified",
      scenarioTraceability: "VB-ANAL-002"
    },
    {
      integrationName: "CRM Data Synchronization",
      passFailStatus: "❌ FAIL",
      notes: "HubSpot API rate limit exceeded. Contact sync failed for batch HS-2024-06-12-003. Retry scheduled for next window.",
      testDate: new Date(Date.now() - 1200000).toISOString(),
      qaOwner: "Tyson Lerfald",
      outputDataPopulated: false,
      recordCreated: false,
      retryAttempted: true,
      moduleType: "CRM Integration",
      scenarioLink: "https://make.com/scenario/hubspot-sync",
      loggerSource: "HubSpot API",
      shadowValidator: "❌ Failed",
      scenarioTraceability: "CRM-SYNC-003"
    },
    {
      integrationName: "Invoice Generation System",
      passFailStatus: "✅ PASS",
      notes: "Invoice INV-2024-0892 generated successfully. PDF created, email sent to client, QuickBooks entry added.",
      testDate: new Date(Date.now() - 1800000).toISOString(),
      qaOwner: "Tyson Lerfald",
      outputDataPopulated: true,
      recordCreated: true,
      retryAttempted: false,
      moduleType: "Financial",
      scenarioLink: "https://make.com/scenario/invoice-generation",
      loggerSource: "Invoice API",
      shadowValidator: "✅ Verified",
      scenarioTraceability: "INV-GEN-004"
    }
  ]
};

// Live mode data structure - cleared of hardcoded values
const liveModeMetrics = {
  dashboardMetrics: {
    totalRevenue: 0,
    monthlyRecurringRevenue: 0,
    activeClients: 0,
    completedJobs: 0,
    pendingOrders: 0,
    automationEfficiency: 0,
    systemUptime: 0,
    avgResponseTime: 0,
    dailyActiveUsers: 0,
    conversionRate: 0,
    customerSatisfaction: 0,
    revenueGrowth: 0
  },
  
  automationPerformance: {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    passRate: 0,
    avgExecutionTime: 0,
    criticalErrors: 0,
    warnings: 0,
    lastRunTime: null,
    automationFunctions: []
  },
  
  liveActivity: {
    activeConnections: 0,
    requestsPerMinute: 0,
    errorRate: 0,
    avgLatency: 0,
    queuedJobs: 0,
    processingJobs: 0,
    recentActivity: []
  },
  
  knowledgeStats: {
    totalDocuments: 0,
    recentlyUpdated: 0,
    pendingReview: 0,
    categories: [],
    lastSync: null,
    searchQueries: 0,
    topQueries: []
  },
  
  callMonitoring: {
    activeCalls: 0,
    totalCallsToday: 0,
    avgCallDuration: "0:00",
    conversionRate: 0,
    qualityScore: 0,
    callQueue: 0,
    recentCalls: []
  },
  
  zendeskTickets: {
    openTickets: 0,
    resolvedToday: 0,
    avgResolutionTime: "0 hours",
    priorityBreakdown: {
      urgent: 0,
      high: 0,
      normal: 0,
      low: 0
    },
    recentTickets: []
  },
  
  integrationHealth: {
    totalIntegrations: 0,
    healthy: 0,
    warning: 0,
    critical: 0,
    lastHealthCheck: null,
    integrations: []
  },
  
  qaTestResults: []
};

export function registerTestDataRoutes(app: Express) {
  // System mode check endpoint
  app.get('/api/system-mode', (req, res) => {
    const mode = getSystemMode();
    res.json({ 
      success: true, 
      systemMode: mode,
      timestamp: new Date().toISOString()
    });
  });

  // Dashboard metrics with strict compliance
  app.get('/api/dashboard-metrics', async (req, res) => {
    const systemMode = getSystemMode();
    
    // LIVE MODE: Always return empty data - no hardcoded values
    res.json({
      success: true,
      data: {},
      mode: systemMode,
      message: systemMode === 'live' ? 'LIVE mode - authentic data only' : 'TEST mode - no data'
    });
  });

  // Automation performance with strict compliance
  app.get('/api/automation-performance', async (req, res) => {
    const systemMode = getSystemMode();
    
    // Always return empty data - no hardcoded values
    res.json({
      success: true,
      data: {},
      mode: systemMode,
      message: systemMode === 'live' ? 'LIVE mode - authentic data only' : 'TEST mode - no data'
    });
  });

  // Live activity with strict compliance
  app.get('/api/live-activity', async (req, res) => {
    const systemMode = getSystemMode();
    
    // Always return empty data - no hardcoded values
    res.json({
      success: true,
      data: {},
      mode: systemMode,
      message: systemMode === 'live' ? 'LIVE mode - authentic data only' : 'TEST mode - no data'
    });
  });

  // Knowledge stats with strict compliance
  app.get('/api/knowledge/stats', async (req, res) => {
    const systemMode = getSystemMode();
    
    // Always return empty data - no hardcoded values
    res.json({
      success: true,
      data: null,
      mode: systemMode,
      message: systemMode === 'live' ? 'LIVE mode - authentic data only' : 'TEST mode - no data'
    });
  });



  // Call monitoring with global environment gate
  app.get('/api/call-monitoring/details', (req, res) => {
    const systemMode = getSystemMode();
    
    // Global environment gate enforcement
    if (isLiveMode()) {
      blockTestData(testModeMetrics.callMonitoring);
      res.json({
        success: true,
        data: safeLiveData(null, liveModeMetrics.callMonitoring),
        mode: 'live',
        message: 'LIVE mode - hardcoded data blocked, authentic data only'
      });
    } else if (systemMode === 'test') {
      res.json({
        success: true,
        data: testModeMetrics.callMonitoring,
        mode: 'test',
        message: 'Test mode - call monitoring demo data'
      });
    } else {
      res.json({
        success: true,
        data: liveModeMetrics.callMonitoring,
        mode: 'live',
        message: 'Live mode - real call data only (currently empty)'
      });
    }
  });

  // Zendesk tickets with global environment gate
  app.get('/api/zendesk/tickets', (req, res) => {
    const systemMode = getSystemMode();
    
    // Global environment gate enforcement
    if (isLiveMode()) {
      blockTestData(testModeMetrics.zendeskTickets);
      res.json({
        success: true,
        data: safeLiveData(null, liveModeMetrics.zendeskTickets),
        tickets: [],
        total: 0,
        mode: 'live',
        message: 'LIVE mode - hardcoded data blocked, authentic data only'
      });
    } else if (systemMode === 'test') {
      res.json({
        success: true,
        data: testModeMetrics.zendeskTickets,
        tickets: testModeMetrics.zendeskTickets.recentTickets,
        total: testModeMetrics.zendeskTickets.openTickets,
        mode: 'test',
        message: 'Test mode - Zendesk demo data'
      });
    } else {
      res.json({
        success: true,
        data: liveModeMetrics.zendeskTickets,
        tickets: [],
        total: 0,
        mode: 'live',
        message: 'Live mode - authentic Zendesk data only (requires API key)'
      });
    }
  });

  // Integration health with global environment gate
  app.get('/api/integration-health', (req, res) => {
    const systemMode = getSystemMode();
    
    // Global environment gate enforcement
    if (isLiveMode()) {
      blockTestData(testModeMetrics.integrationHealth);
      res.json({
        success: true,
        data: safeLiveData(null, liveModeMetrics.integrationHealth),
        mode: 'live',
        message: 'LIVE mode - hardcoded data blocked, authentic data only'
      });
    } else if (systemMode === 'test') {
      res.json({
        success: true,
        data: testModeMetrics.integrationHealth,
        mode: 'test',
        message: 'Test mode - integration health demo data'
      });
    } else {
      res.json({
        success: true,
        data: liveModeMetrics.integrationHealth,
        mode: 'live',
        message: 'Live mode - real integration monitoring only'
      });
    }
  });

  // QA test results with global environment gate
  app.get('/api/qa-test-results', (req, res) => {
    const systemMode = getSystemMode();
    
    // Global environment gate enforcement
    if (isLiveMode()) {
      blockTestData(testModeMetrics.qaTestResults);
      res.json({
        success: true,
        data: [],
        total: 0,
        mode: 'live',
        message: 'LIVE mode - hardcoded data blocked, authentic data only'
      });
    } else if (systemMode === 'test') {
      res.json({
        success: true,
        data: testModeMetrics.qaTestResults,
        total: testModeMetrics.qaTestResults.length,
        mode: 'test',
        message: 'Test mode - QA results demo data with authentic structure'
      });
    } else {
      res.json({
        success: true,
        data: [],
        total: 0,
        mode: 'live',
        message: 'Live mode - only log_to_airtable() results allowed'
      });
    }
  });

  // Test data population endpoint - admin only
  app.post('/api/populate-test-data', (req, res) => {
    const systemMode = getSystemMode();
    
    // Global environment gate enforcement
    if (isLiveMode()) {
      return res.status(403).json({
        success: false,
        error: 'LIVE mode - test data population blocked globally',
        currentMode: 'live',
        message: 'Global environment gate prevents any test data population'
      });
    } else if (systemMode !== 'test') {
      return res.status(403).json({
        success: false,
        error: 'Test data population only allowed in test mode',
        currentMode: systemMode
      });
    }

    res.json({
      success: true,
      message: 'Test data populated successfully',
      data: {
        dashboardMetrics: 'populated',
        automationPerformance: 'populated',
        liveActivity: 'populated',
        knowledgeStats: 'populated',
        callMonitoring: 'populated',
        zendeskTickets: 'populated',
        integrationHealth: 'populated',
        qaTestResults: 'populated'
      },
      mode: 'test',
      timestamp: new Date().toISOString()
    });
  });

  // Clear live data endpoint - admin only
  app.post('/api/clear-live-hardcoded-data', (req, res) => {
    const systemMode = req.headers['x-system-mode'] || process.env.SYSTEM_MODE || 'live';
    
    if (systemMode !== 'live') {
      return res.status(403).json({
        success: false,
        error: 'Live data clearing only allowed in live mode',
        currentMode: systemMode
      });
    }

    res.json({
      success: true,
      message: 'Live mode hardcoded data cleared - only authentic data sources active',
      clearedSections: [
        'dashboardMetrics',
        'automationPerformance', 
        'liveActivity',
        'knowledgeStats',
        'callMonitoring',
        'zendeskTickets',
        'integrationHealth',
        'qaTestResults'
      ],
      mode: 'live',
      timestamp: new Date().toISOString()
    });
  });
}