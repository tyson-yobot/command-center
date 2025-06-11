import { Express } from 'express';

export function registerDashboardEndpoints(app: Express) {
  
  // Get overall dashboard metrics - WITH TEST/LIVE MODE ISOLATION
  app.get("/api/dashboard-metrics", async (req, res) => {
    try {
      const headerMode = req.headers['x-system-mode'] as 'test' | 'live';
      const { getSystemMode } = await import('./systemMode');
      const systemMode = getSystemMode();
      const requestedMode = headerMode || systemMode;
      console.log(`[DEBUG] Dashboard Metrics - Header: ${headerMode}, System Mode: ${systemMode}, Final Mode: ${requestedMode}`);
      
      // Complete isolation: serve test data when test mode is requested
      if (requestedMode === 'test') {
        const { TestModeData } = await import('./testModeData');
        const testOverview = TestModeData.getRealisticDashboardOverview();
        console.log(`[DEBUG] Serving realistic test dashboard data`);
        res.json(testOverview);
        return;
      }
      
      // Serve live data for live mode
      const { LiveDashboardData } = await import('./liveDashboardData');
      const metrics = await LiveDashboardData.getDashboardOverview();
      res.json(metrics);
    } catch (error) {
      console.error("Dashboard metrics error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch dashboard metrics"
      });
    }
  });

  // Get automation performance - WITH TEST/LIVE MODE ISOLATION
  app.get("/api/automation-performance", async (req, res) => {
    try {
      const headerMode = req.headers['x-system-mode'] as 'test' | 'live';
      const systemMode = global.systemMode || 'live';
      const requestedMode = headerMode || systemMode;
      console.log(`[DEBUG] Dashboard Automation Performance - Header: ${headerMode}, System Mode: ${systemMode}, Final Mode: ${requestedMode}`);
      
      // Complete isolation: serve test data when test mode is requested
      if (requestedMode === 'test') {
        const { TestModeData } = await import('./testModeData');
        const testMetrics = await TestModeData.getRealisticAutomationMetrics();
        console.log(`[DEBUG] Serving realistic test data with ${testMetrics.successRate} success rate`);
        res.json(testMetrics);
        return;
      }
      
      // Serve live data for live mode
      const { LiveDashboardData } = await import('./liveDashboardData');
      const liveMetrics = await LiveDashboardData.getAutomationMetrics('live');
      res.json(liveMetrics);
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

  // Get live activity feed - Supports both live and test modes
  app.get("/api/live-activity", async (req, res) => {
    try {
      const systemModeHeader = req.headers['x-system-mode'] as string;
      const { systemMode } = await import('./systemMode');
      const finalMode = systemModeHeader || systemMode;

      // Return test data in test mode
      if (finalMode === 'test') {
        const { TestModeData } = await import('./testModeData');
        return res.json(TestModeData.getRealisticLiveActivity());
      }

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