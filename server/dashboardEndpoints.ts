import { Express } from 'express';

export function registerDashboardEndpoints(app: Express) {
  
  // Get overall dashboard metrics
  app.get("/api/dashboard-metrics", async (req, res) => {
    try {
      const { getSystemMode } = await import('./systemMode');
      const systemMode = getSystemMode();
      
      if (systemMode === 'test') {
        // DEMO DATA ONLY - Realistic numbers showing actual business challenges
        res.json({
          // Top metrics cards - showing areas needing improvement
          totalLeads: 2847,
          totalCampaigns: 12,
          activeAutomations: 18,
          successRate: 67.3, // Intentionally lower - client needs improvement
          monthlyGrowth: 8.4, // Slower growth - improvement opportunity
          
          // Live Automation Engine metrics - showing clear problems
          automationEngine: {
            status: "Degraded", // Shows issues need attention
            executionsToday: 1829,
            successRate: 63.2, // Lower - clear improvement needed
            avgResponseTime: 2.8, // Higher latency - performance issue
            activeConnections: 23,
            queuedTasks: 14, // Backlog building up
            failedTasks: 23 // Significant failures
          },
          
          // Bot Health Monitor
          botHealth: {
            overall: "Good",
            apiConnections: "Healthy",
            databaseStatus: "Connected", 
            systemLoad: 67,
            memoryUsage: 45,
            activeConnections: 23,
            errorRate: 2.1,
            uptime: "99.7%"
          },
          
          // Revenue Forecast
          revenueForecast: {
            currentMonth: 47200,
            projected: 52800,
            growthRate: 11.8,
            pipeline: 89400,
            closingProbability: 67,
            avgDealSize: 12500
          },
          
          // Client Pulse
          clientPulse: {
            totalClients: 156,
            activeThisWeek: 134,
            satisfactionScore: 8.7,
            supportTickets: 23,
            escalations: 2,
            renewalRate: 94.2
          },
          
          // Ops Metrics
          opsMetrics: {
            systemUptime: 99.7,
            apiCalls: 45892,
            dataProcessed: "2.3TB",
            automationsSaved: 847,
            errorRate: 0.3,
            avgProcessingTime: 1.2
          },
          
          // Workflow Performance
          workflowPerformance: {
            totalWorkflows: 89,
            activeWorkflows: 67,
            completionRate: 92.4,
            avgExecutionTime: 3.2,
            successfulExecutions: 1683,
            failedExecutions: 142,
            pendingExecutions: 34
          },
          
          // Analytics insights
          analytics: {
            conversionRate: 13.2, // Lower - improvement area
            leadQuality: 78.4, // Lower - improvement area  
            campaignROI: 245,
            engagementScore: 67.8,
            customerLifetimeValue: 24800,
            churnRate: 5.2
          },
          
          // SmartSpend metrics
          smartSpend: {
            totalSpend: 28400,
            efficiency: 82.3, // Lower - improvement area
            costPerLead: 47.50,
            roi: 312,
            budgetUtilization: 76.8,
            topPerformingChannels: ["Google Ads", "LinkedIn", "Apollo.io"]
          },
          
          // AI Assistant Insights
          aiInsights: {
            queriesProcessed: 2847,
            accuracyRate: 91.2,
            learningProgress: 78.5,
            knowledgeBase: 15600,
            responseTime: 0.8,
            userSatisfaction: 8.9
          },
          
          // Recent activity feed
          recentActivity: [
            { type: "Lead Captured", details: "Apollo.io sync - 47 leads", timestamp: new Date(Date.now() - 300000).toISOString(), status: "success" },
            { type: "Campaign Launched", details: "Real Estate Outreach Q2", timestamp: new Date(Date.now() - 900000).toISOString(), status: "success" },
            { type: "System Alert", details: "QuickBooks auth timeout", timestamp: new Date(Date.now() - 1200000).toISOString(), status: "warning" },
            { type: "Automation Success", details: "CRM sync completed - 234 records", timestamp: new Date(Date.now() - 1800000).toISOString(), status: "success" },
            { type: "Voice Call", details: "Support call resolved - 8.5/10", timestamp: new Date(Date.now() - 2400000).toISOString(), status: "success" }
          ],
          
          // Platform statistics
          platformStats: {
            apollo: { count: 1234, quality: 91.2, conversionRate: 14.8 },
            apify: { count: 856, quality: 78.4, conversionRate: 11.2 }, // Lower - improvement area
            phantom: { count: 757, quality: 94.1, conversionRate: 16.3 },
            hubspot: { count: 2847, quality: 89.7, conversionRate: 13.9 },
            quickbooks: { count: 567, quality: 92.4, conversionRate: 18.2 }
          }
        });
      } else {
        const { LiveDashboardData } = await import('./liveDashboardData');
        const metrics = await LiveDashboardData.getDashboardOverview();
        res.json(metrics);
      }
    } catch (error) {
      console.error("Dashboard metrics error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch dashboard metrics"
      });
    }
  });

  // Get automation performance
  app.get("/api/automation-performance", async (req, res) => {
    try {
      const { getSystemMode } = await import('./systemMode');
      const systemMode = getSystemMode();
      
      if (systemMode === 'test') {
        // Demo data for presentations - shows mixed performance
        res.json({
          totalFunctions: 47,
          activeFunctions: 35,
          successRate: 74.5, // Intentionally lower - shows improvement opportunity
          executionsToday: 1829,
          avgResponseTime: 1.4, // Slightly high - improvement area
          topPerformingFunctions: [
            { name: "Lead Capture", successRate: 98.2, executions: 456 },
            { name: "Email Automation", successRate: 96.7, executions: 389 },
            { name: "CRM Sync", successRate: 92.1, executions: 234 }
          ],
          underperformingFunctions: [
            { name: "SMS Delivery", successRate: 67.3, executions: 198 },
            { name: "Voice Analysis", successRate: 71.8, executions: 145 }
          ],
          recentExecutions: [
            { function: "Lead Scoring", status: "success", timestamp: new Date(Date.now() - 120000).toISOString() },
            { function: "Pipeline Update", status: "success", timestamp: new Date(Date.now() - 300000).toISOString() },
            { function: "Document Generator", status: "failed", timestamp: new Date(Date.now() - 450000).toISOString() }
          ]
        });
      } else {
        const { LiveDashboardData } = await import('./liveDashboardData');
        const liveMetrics = await LiveDashboardData.getAutomationMetrics();
        res.json(liveMetrics);
      }
    } catch (error) {
      console.error("Automation performance error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch automation performance"
      });
    }
  });

  // Get lead generation analytics
  app.get("/api/lead-analytics", async (req, res) => {
    try {
      const { getSystemMode } = await import('./systemMode');
      const systemMode = getSystemMode();
      
      if (systemMode === 'test') {
        // Demo data for presentations - mixed performance metrics
        res.json({
          totalLeads: 2847,
          qualifiedLeads: 1923,
          conversionRate: 13.2, // Lower than ideal - improvement opportunity
          averageLeadScore: 76.4,
          leadSources: {
            apollo: { count: 1234, quality: 91.2, conversionRate: 15.8 },
            apify: { count: 856, quality: 78.4, conversionRate: 9.7 }, // Lower performance
            phantom: { count: 757, quality: 94.1, conversionRate: 16.3 }
          },
          monthlyTrends: [
            { month: "Jan", leads: 1891, conversions: 247 },
            { month: "Feb", leads: 2156, conversions: 298 },
            { month: "Mar", leads: 2434, conversions: 321 },
            { month: "Apr", leads: 2847, conversions: 376 }
          ],
          topChannels: [
            { channel: "Apollo.io", leads: 1234, cost: 2890, roi: 4.2 },
            { channel: "LinkedIn Outreach", leads: 892, cost: 1560, roi: 3.8 },
            { channel: "Website Forms", leads: 721, cost: 450, roi: 8.1 }
          ]
        });
      } else {
        const { LiveDashboardData } = await import('./liveDashboardData');
        const analytics = await LiveDashboardData.getLeadMetrics();
        res.json(analytics);
      }
    } catch (error) {
      console.error("Lead analytics error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch lead analytics"
      });
    }
  });

  // Get scraper status and history
  app.get("/api/scraper-status", async (req, res) => {
    try {
      const { getSystemMode } = await import('./systemMode');
      const systemMode = getSystemMode();
      
      if (systemMode === 'test') {
        // Demo data for presentations - mixed scraper performance
        res.json({
          success: true,
          scrapers: [
            {
              name: "Apollo.io Contacts",
              status: "active",
              lastRun: new Date(Date.now() - 1800000).toISOString(),
              recordsCollected: 1234,
              successRate: 94.2,
              avgRunTime: "3.2 min"
            },
            {
              name: "LinkedIn Companies",
              status: "paused",
              lastRun: new Date(Date.now() - 7200000).toISOString(),
              recordsCollected: 856,
              successRate: 78.1, // Lower - improvement area
              avgRunTime: "8.7 min"
            },
            {
              name: "Phantom Real Estate",
              status: "active",
              lastRun: new Date(Date.now() - 600000).toISOString(),
              recordsCollected: 642,
              successRate: 91.8,
              avgRunTime: "4.1 min"
            }
          ],
          totalRecords: 2732,
          dailyQuota: 5000,
          quotaUsed: 54.6
        });
      } else {
        res.json({
          success: true,
          message: "Scraper data will populate from live system"
        });
      }
    } catch (error) {
      console.error("Scraper status error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch scraper status"
      });
    }
  });

  // Get system health status
  app.get("/api/system-health", async (req, res) => {
    try {
      const { getSystemMode } = await import('./systemMode');
      const systemMode = getSystemMode();
      
      if (systemMode === 'test') {
        // Demo data for presentations - shows some areas needing attention
        res.json({
          success: true,
          overallHealth: 87.3, // Intentionally lower - improvement opportunity
          services: [
            { name: "API Gateway", status: "healthy", uptime: 99.7, responseTime: 89 },
            { name: "Database", status: "healthy", uptime: 99.9, responseTime: 23 },
            { name: "Redis Cache", status: "warning", uptime: 94.2, responseTime: 156 }, // Lower performance
            { name: "Voice Processing", status: "healthy", uptime: 98.1, responseTime: 234 },
            { name: "Email Service", status: "degraded", uptime: 89.7, responseTime: 892 } // Problem area
          ],
          alerts: [
            { level: "warning", message: "Redis cache experiencing intermittent timeouts", timestamp: new Date(Date.now() - 3600000).toISOString() },
            { level: "critical", message: "Email service response time exceeding SLA", timestamp: new Date(Date.now() - 1800000).toISOString() }
          ],
          metrics: {
            cpuUsage: 68.4,
            memoryUsage: 74.2, // Higher than ideal
            diskUsage: 45.1,
            networkLatency: 127
          }
        });
      } else {
        res.json({
          success: true,
          message: "System health will populate from live monitoring"
        });
      }
    } catch (error) {
      console.error("System health error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch system health"
      });
    }
  });

  // Get workflow status - LIVE DATA ONLY
  app.get("/api/workflow-status", async (req, res) => {
    try {
      // Let the actual workflow system populate data
      res.json({
        success: true,
        message: "Workflow status will populate from live system"
      });
    } catch (error) {
      console.error("Workflow status error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch workflow status"
      });
    }
  });

  // Get revenue forecasting - LIVE DATA ONLY
  app.get("/api/revenue-forecast", async (req, res) => {
    try {
      // Let the actual revenue tracking system populate data
      res.json({
        success: true,
        message: "Revenue forecast will populate from live data"
      });
    } catch (error) {
      console.error("Revenue forecast error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch revenue forecast"
      });
    }
  });

  // Get client metrics - LIVE DATA ONLY
  app.get("/api/client-metrics", async (req, res) => {
    try {
      // Let the actual client tracking system populate data
      res.json({
        success: true,
        message: "Client metrics will populate from live system"
      });
    } catch (error) {
      console.error("Client metrics error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch client metrics"
      });
    }
  });

  // Get integration test results - Shows realistic failure patterns in demo mode
  app.get("/api/integration-test-results", async (req, res) => {
    try {
      const { getSystemMode } = await import('./systemMode');
      const systemMode = getSystemMode();
      
      if (systemMode === 'test') {
        const { demoIntegrationResults } = await import('./demoTestResults');
        
        // Combine both batches and add realistic timestamps
        const allResults = [
          ...demoIntegrationResults.batch1,
          ...demoIntegrationResults.batch2
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        res.json({
          success: true,
          results: allResults,
          summary: demoIntegrationResults.summary,
          totalTests: allResults.length,
          systemMode: 'test',
          lastUpdated: new Date().toISOString(),
          criticalIssues: [
            "QuickBooks authentication timeout - requires manual re-auth",
            "PDF generation service unavailable - 504 gateway timeout", 
            "Twilio webhook delivery failed - carrier blocking",
            "Document generation service timeout - manual intervention required"
          ],
          improvementAreas: [
            "Email service response time elevated (3.2s average)",
            "Voice sentiment analysis API rate limiting",
            "SmartSpend sync validation failures (3 records)",
            "Policy email delivery failures (12 recipients)"
          ]
        });
      } else {
        // Live mode - only real test data from actual logger
        res.json({
          success: true,
          message: "Integration test results will populate from live AI Logger system",
          systemMode: 'live'
        });
      }
    } catch (error) {
      console.error("Integration test results error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch integration test results"
      });
    }
  });

  // Get voice analytics - LIVE DATA ONLY
  app.get("/api/voice-analytics", async (req, res) => {
    try {
      // Let the actual voice system populate data
      res.json({
        success: true,
        message: "Voice analytics will populate from live system"
      });
    } catch (error) {
      console.error("Voice analytics error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch voice analytics"
      });
    }
  });

  // Get calendar data - LIVE DATA ONLY
  app.get("/api/calendar-data", async (req, res) => {
    try {
      // Let the actual calendar system populate data
      res.json({
        success: true,
        message: "Calendar data will populate from live system"
      });
    } catch (error) {
      console.error("Calendar data error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch calendar data"
      });
    }
  });

  // Get live activity feed
  app.get("/api/live-activity", async (req, res) => {
    try {
      const { getSystemMode } = await import('./systemMode');
      const systemMode = getSystemMode();
      
      if (systemMode === 'test') {
        // Demo data for presentations - recent activity with mixed results
        res.json({
          success: true,
          activities: [
            {
              type: "automation_execution",
              title: "CRM Sync Completed",
              description: "Successfully synced 47 leads to HubSpot",
              status: "success",
              timestamp: new Date(Date.now() - 300000).toISOString(),
              metric: "47 records"
            },
            {
              type: "system_alert",
              title: "QuickBooks Connection Failed",
              description: "Authentication timeout - needs attention",
              status: "error",
              timestamp: new Date(Date.now() - 600000).toISOString(),
              metric: "3 retries"
            },
            {
              type: "lead_capture",
              title: "New Apollo.io Leads",
              description: "23 qualified leads from technology sector",
              status: "success",
              timestamp: new Date(Date.now() - 900000).toISOString(),
              metric: "23 leads"
            },
            {
              type: "voice_call",
              title: "Customer Support Call",
              description: "Issue resolved - satisfaction score 8.5/10",
              status: "success",
              timestamp: new Date(Date.now() - 1200000).toISOString(),
              metric: "8.5/10"
            },
            {
              type: "workflow_failure",
              title: "Email Campaign Delivery Issue",
              description: "SMTP timeout affecting 12 subscribers",
              status: "warning",
              timestamp: new Date(Date.now() - 1500000).toISOString(),
              metric: "12 affected"
            },
            {
              type: "sales_order",
              title: "Enterprise Package Sale",
              description: "New client signed - $12,500 annual contract",
              status: "success",
              timestamp: new Date(Date.now() - 1800000).toISOString(),
              metric: "$12,500"
            }
          ],
          totalCount: 6,
          lastUpdated: new Date().toISOString()
        });
      } else {
        res.json({
          success: true,
          message: "Live activity will populate from actual system events"
        });
      }
    } catch (error) {
      console.error("Live activity error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch live activity"
      });
    }
  });

  // Get sentiment analysis
  app.get("/api/sentiment-analysis", async (req, res) => {
    try {
      const { getSystemMode } = await import('./systemMode');
      const systemMode = getSystemMode();
      
      if (systemMode === 'test') {
        // Demo data for presentations - shows sentiment trends
        res.json({
          success: true,
          overallSentiment: 72.3, // Room for improvement
          sentimentBreakdown: {
            positive: 58.7,
            neutral: 27.1,
            negative: 14.2 // Area needing attention
          },
          recentCalls: [
            { id: "call_001", sentiment: 89.2, emotion: "satisfied", timestamp: new Date(Date.now() - 1800000).toISOString() },
            { id: "call_002", sentiment: 45.1, emotion: "frustrated", timestamp: new Date(Date.now() - 3600000).toISOString() },
            { id: "call_003", sentiment: 76.8, emotion: "neutral", timestamp: new Date(Date.now() - 5400000).toISOString() }
          ],
          weeklyTrends: [
            { day: "Mon", positive: 62.1, negative: 12.8 },
            { day: "Tue", positive: 58.9, negative: 15.2 },
            { day: "Wed", positive: 61.4, negative: 13.7 },
            { day: "Thu", positive: 55.3, negative: 18.1 }, // Worse day
            { day: "Fri", positive: 64.2, negative: 11.9 }
          ],
          keyInsights: [
            "Thursday shows consistently lower satisfaction scores",
            "Response time correlates with negative sentiment",
            "Product demo calls have 23% higher satisfaction"
          ]
        });
      } else {
        res.json({
          success: true,
          message: "Sentiment analysis will populate from live data"
        });
      }
    } catch (error) {
      console.error("Sentiment analysis error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch sentiment analysis"
      });
    }
  });

  // Get data sync status
  app.get("/api/data-sync-status", async (req, res) => {
    try {
      const { getSystemMode } = await import('./systemMode');
      const systemMode = getSystemMode();
      
      if (systemMode === 'test') {
        // Demo data for presentations - shows sync issues
        res.json({
          success: true,
          overallStatus: "partial", // Shows room for improvement
          syncConnections: [
            { source: "HubSpot CRM", status: "connected", lastSync: new Date(Date.now() - 900000).toISOString(), recordCount: 15430, errorCount: 0 },
            { source: "QuickBooks", status: "error", lastSync: new Date(Date.now() - 86400000).toISOString(), recordCount: 0, errorCount: 23 }, // Problem area
            { source: "Slack Workspace", status: "connected", lastSync: new Date(Date.now() - 300000).toISOString(), recordCount: 892, errorCount: 2 },
            { source: "Airtable Base", status: "warning", lastSync: new Date(Date.now() - 1800000).toISOString(), recordCount: 3421, errorCount: 7 } // Needs attention
          ],
          syncMetrics: {
            totalRecords: 19743,
            successfulSyncs: 87.2, // Room for improvement
            failedSyncs: 12.8,
            avgSyncTime: 4.7
          },
          recentErrors: [
            { source: "QuickBooks", error: "Authentication expired", timestamp: new Date(Date.now() - 3600000).toISOString() },
            { source: "Airtable", error: "Rate limit exceeded", timestamp: new Date(Date.now() - 7200000).toISOString() }
          ]
        });
      } else {
        res.json({
          success: true,
          message: "Data sync status will populate from live system"
        });
      }
    } catch (error) {
      console.error("Data sync status error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch data sync status"
      });
    }
  });

  // Get zendesk support queue
  app.get("/api/zendesk-queue", async (req, res) => {
    try {
      const { getSystemMode } = await import('./systemMode');
      const systemMode = getSystemMode();
      
      if (systemMode === 'test') {
        // Demo data for presentations - shows support queue with issues
        res.json({
          success: true,
          totalTickets: 47,
          urgentTickets: 8, // Higher than ideal
          avgResponseTime: 4.7, // Hours - improvement opportunity
          ticketsByStatus: {
            new: 12,
            open: 23,
            pending: 8,
            solved: 4
          },
          recentTickets: [
            { id: "ZD-001", subject: "Integration failing", priority: "urgent", created: new Date(Date.now() - 3600000).toISOString(), assignee: "Sarah K." },
            { id: "ZD-002", subject: "Voice bot not responding", priority: "high", created: new Date(Date.now() - 7200000).toISOString(), assignee: "Mike R." },
            { id: "ZD-003", subject: "Lead sync issues", priority: "normal", created: new Date(Date.now() - 10800000).toISOString(), assignee: "Alex M." }
          ],
          agentMetrics: [
            { agent: "Sarah K.", activeTickets: 8, avgResolution: 3.2 },
            { agent: "Mike R.", activeTickets: 12, avgResolution: 5.8 }, // Slower resolution
            { agent: "Alex M.", activeTickets: 6, avgResolution: 2.9 }
          ],
          satisfactionScore: 78.4 // Room for improvement
        });
      } else {
        res.json({
          success: true,
          message: "Zendesk queue will populate from live system"
        });
      }
    } catch (error) {
      console.error("Zendesk queue error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch Zendesk queue"
      });
    }
  });
}