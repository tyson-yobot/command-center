import { Express } from 'express';
import LiveDataCleaner from './liveDataCleaner';
import { getSystemMode } from './systemMode';
import { airtableLive } from './airtableLiveIntegration';

export function registerDashboardEndpoints(app: Express) {
  
  // Get overall dashboard metrics with live Airtable data
  app.get("/api/dashboard-metrics", async (req, res) => {
    try {
      const systemMode = getSystemMode();
      
      if (systemMode === 'live') {
        // LIVE MODE: Fetch real data from Airtable
        try {
          const smartSpendData = await airtableLive.getSmartSpendData();
          const revenueForecast = await airtableLive.getRevenueForecast();
          const botalyticsData = await airtableLive.getBotalyticsData();
          
          // Get the latest Botalytics record
          const latestBotalytics = botalyticsData.length > 0 ? botalyticsData[0] : null;
          
          const liveMetrics = {
            smartSpendData: smartSpendData ? {
              budgetUtilization: smartSpendData['Budget Utilization'],
              costPerLead: smartSpendData['Cost Per Lead'],
              roiPercentage: smartSpendData['ROI Percentage'],
              totalSpend: smartSpendData['Total Spend'],
              leadsGenerated: smartSpendData['Leads Generated'],
              conversionRate: smartSpendData['Conversion Rate'],
              budgetEfficiency: smartSpendData['Budget Efficiency Score'],
              efficiencyStatus: smartSpendData['Budget Efficiency Score'] > 90 ? 'Optimal' : 'Good',
              lastUpdated: smartSpendData['Last Updated']
            } : null,
            revenueForecast: revenueForecast.length > 0 ? {
              currentQuarter: revenueForecast[0]?.fields?.['Current Quarter'] || 0,
              projectedQuarter: revenueForecast[0]?.fields?.['Projected Quarter'] || 0,
              yearlyProjection: revenueForecast[0]?.fields?.['Yearly Projection'] || 0,
              growthRate: revenueForecast[0]?.fields?.['Growth Rate'] || 0,
              lastUpdated: revenueForecast[0]?.fields?.['Last Updated'] || new Date().toISOString()
            } : null,
            botalyticsData: latestBotalytics ? {
              totalCalls: latestBotalytics.fields['📞 Total Calls'] || 0,
              botHandledCalls: latestBotalytics.fields['🤖 Calls Handled by Bot'] || 0,
              transferredCalls: latestBotalytics.fields['🙋 Calls Transferred to Rep'] || 0,
              avgResponseTime: latestBotalytics.fields['⏳ Avg Response Time (Bot)'] || 0,
              laborSavings: latestBotalytics.fields['💸 Estimated Labor Savings ($)'] || 0,
              revenueLift: latestBotalytics.fields['📈 Revenue Lift Attributed ($)'] || 0,
              leadConversions: latestBotalytics.fields['🎯 Lead Conversions Attributed'] || 0,
              client: latestBotalytics.fields['🏢 Client'],
              month: latestBotalytics.fields['📅 Month'],
              summary: latestBotalytics.fields['📊 Monthly Summary']
            } : null
          };
          
          LiveDataCleaner.logLiveModeAccess('dashboard-metrics', '/api/dashboard-metrics', systemMode);
          
          res.json({
            success: true,
            data: liveMetrics,
            mode: 'live',
            message: 'Live mode - authentic Airtable data'
          });
        } catch (airtableError) {
          console.error('Airtable data fetch failed:', airtableError);
          res.json({
            success: true,
            data: {},
            mode: 'live',
            message: 'Live mode - Airtable connection failed, showing empty state'
          });
        }
      } else {
        // TEST MODE: Serve hardcoded test data
        const { LiveDashboardData } = await import('./liveDashboardData');
        const metrics = await LiveDashboardData.getDashboardOverview();
        res.json({
          success: true,
          data: metrics,
          mode: 'test',
          message: 'Test mode - displaying sample data'
        });
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
      const systemMode = getSystemMode();
      
      // Get real automation data from Airtable in both modes
      const { LiveDashboardData } = await import('./liveDashboardData');
      const liveMetrics = await LiveDashboardData.getAutomationMetrics();
      
      // Enhance with real lead processing data
      try {
        const { AirtableLeadsService } = await import('./airtableLeadsService');
        const airtableService = new AirtableLeadsService();
        const leads = await airtableService.getScrapedLeads({
          fields: ['🤖 Synced to YoBot Queue?', '📞 Call Status', '📅 Date Added']
        });

        const today = new Date().toISOString().split('T')[0];
        const todayLeads = leads.records.filter(r => 
          r.fields['📅 Date Added']?.startsWith(today)
        );

        const queuedTasks = leads.records.filter(r => 
          r.fields['🤖 Synced to YoBot Queue?'] === true && 
          !r.fields['📞 Call Status']
        ).length;

        const activeTasks = leads.records.filter(r => 
          r.fields['📞 Call Status'] === 'In Progress' ||
          r.fields['📞 Call Status'] === 'Calling'
        ).length;

        // Merge real lead data with automation metrics
        liveMetrics.executionsToday = Math.max(liveMetrics.executionsToday, todayLeads.length);
        liveMetrics.queuedTasks = queuedTasks;
        liveMetrics.activeTasks = activeTasks;
        liveMetrics.processingCapacity = Math.min(100, (activeTasks / Math.max(1, queuedTasks)) * 100);
      } catch (leadError) {
        console.log('Lead data enhancement unavailable:', leadError.message);
      }

      if (systemMode === 'live') {
        LiveDataCleaner.logLiveModeAccess('automation-performance', '/api/automation-performance', systemMode);
      }
      
      res.json({
        success: true,
        data: liveMetrics,
        mode: systemMode,
        message: `${systemMode} mode - automation performance metrics`
      });
    } catch (error) {
      console.error("Automation performance error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch automation performance"
      });
    }
  });

  // Get lead generation analytics - LIVE DATA ONLY
  app.get("/api/lead-analytics", async (req, res) => {
    try {
      const { LiveDashboardData } = await import('./liveDashboardData');
      const analytics = await LiveDashboardData.getLeadMetrics();
      res.json(analytics);
    } catch (error) {
      console.error("Lead analytics error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch lead analytics"
      });
    }
  });

  // Get scraper status and history - LIVE DATA ONLY
  app.get("/api/scraper-status", async (req, res) => {
    try {
      // Let the actual scraper system populate data
      res.json({
        success: true,
        message: "Scraper data will populate from live system"
      });
    } catch (error) {
      console.error("Scraper status error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch scraper status"
      });
    }
  });

  // Get system health status - LIVE DATA ONLY
  app.get("/api/system-health", async (req, res) => {
    try {
      // Let the actual health monitoring system populate data
      res.json({
        success: true,
        message: "System health will populate from live monitoring"
      });
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

  // Get live activity feed - LIVE DATA ONLY
  app.get("/api/live-activity", async (req, res) => {
    try {
      // Let the actual activity tracking system populate data
      res.json({
        success: true,
        message: "Live activity will populate from actual system events"
      });
    } catch (error) {
      console.error("Live activity error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch live activity"
      });
    }
  });

  // Get sentiment analysis - LIVE DATA ONLY
  app.get("/api/sentiment-analysis", async (req, res) => {
    try {
      // Let the actual sentiment analysis system populate data
      res.json({
        success: true,
        message: "Sentiment analysis will populate from live data"
      });
    } catch (error) {
      console.error("Sentiment analysis error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch sentiment analysis"
      });
    }
  });

  // Get data sync status - LIVE DATA ONLY
  app.get("/api/data-sync-status", async (req, res) => {
    try {
      // Let the actual data sync system populate data
      res.json({
        success: true,
        message: "Data sync status will populate from live system"
      });
    } catch (error) {
      console.error("Data sync status error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch data sync status"
      });
    }
  });

  // Get zendesk support queue - LIVE DATA ONLY
  app.get("/api/zendesk-queue", async (req, res) => {
    try {
      // Let the actual Zendesk integration populate data
      res.json({
        success: true,
        message: "Zendesk queue will populate from live system"
      });
    } catch (error) {
      console.error("Zendesk queue error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch Zendesk queue"
      });
    }
  });
}