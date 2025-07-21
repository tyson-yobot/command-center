import type { Express } from "express";

const logger = {
  info: console.log,
  error: console.error
};

let systemMode = 'live';

export function registerRoutes(app: Express): void {
  
  // System mode endpoints
  app.get('/api/system-mode', (req, res) => {
    res.json({ 
      success: true, 
      systemMode, 
      timestamp: new Date().toISOString() 
    });
  });

  app.post('/api/system-mode', (req, res) => {
    const { mode } = req.body;
    if (mode === 'live' || mode === 'test') {
      systemMode = mode;
      res.json({ success: true, systemMode });
    } else {
      res.status(400).json({ error: 'Invalid mode' });
    }
  });

  // Dashboard metrics
  app.get('/api/dashboard-metrics', (req, res) => {
    res.json({
      success: true,
      data: {},
      mode: systemMode,
      message: "Live data - Airtable integration required"
    });
  });

  // Live activity
  app.get('/api/live-activity', (req, res) => {
    res.json({
      success: true,
      data: {},
      mode: systemMode,
      message: "Live data - API integration required"
    });
  });

  // System health
  app.get('/api/system-health', (req, res) => {
    res.json({
      success: true,
      message: "System health status operational"
    });
  });

  // Automation performance
  app.get('/api/automation-performance', (req, res) => {
    res.json({
      success: true,
      data: {},
      mode: systemMode,
      message: "Live data - API integration required"
    });
  });

  // Knowledge stats
  app.get('/api/knowledge/stats', (req, res) => {
    res.json({
      success: true,
      data: {
        totalDocuments: 4,
        lastUpdated: new Date().toISOString()
      }
    });
  });

  // Knowledge documents
  app.get('/api/knowledge/documents', (req, res) => {
    res.json({
      success: true,
      data: []
    });
  });

  // Voice endpoints (simplified)
  app.get('/api/voice/personas', (req, res) => {
    res.json({ success: true, data: [] });
  });

  app.post('/api/voice/generate', (req, res) => {
    res.json({ success: false, error: 'Voice generation not configured' });
  });

  app.post('/api/voice/test', (req, res) => {
    res.json({ success: false, message: 'Voice service not configured' });
  });

  // Calls endpoints (simplified)
  app.get('/api/calls/active', (req, res) => {
    res.json({ success: true, data: [] });
  });

  app.get('/api/calls/metrics', (req, res) => {
    res.json({
      success: true,
      data: {
        totalCalls: 0,
        completedCalls: 0,
        avgDuration: '0m 0s'
      }
    });
  });

  // Audit endpoints
  app.get('/api/audit/log', (req, res) => {
    res.json({ success: true, data: [] });
  });

  app.get('/api/audit/health', (req, res) => {
    res.status(200).send('OK');
  });

  // Memory activity
  app.get('/api/memory/activity', (req, res) => {
    res.json({ success: true, data: [] });
  });

  // Pipeline endpoints (simplified)
  app.post('/api/pipeline/start', (req, res) => {
    res.json({
      success: true,
      message: 'Pipeline started (demo mode)',
      total_records: 0,
      active_calls: 0,
      activeCalls: []
    });
  });

  app.post('/api/stop-pipeline-calls', (req, res) => {
    res.json({
      success: true,
      message: 'Pipeline stopped (demo mode)',
      stopped_calls: 0
    });
  });

  logger.info("✅ Command Center routes registered successfully");
}

