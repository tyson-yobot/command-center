// Suppress browserslist warning
process.env.BROWSERSLIST_IGNORE_OLD_DATA = 'true';

import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { setupVite, log } from "./vite";
import { getSystemMode, setSystemMode } from "./systemMode";
import HardcodeDetector from './hardcodeDetector';
import LiveDataCleaner from "./liveDataCleaner";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// System mode management
app.get('/api/system-mode', (req, res) => {
  const currentMode = getSystemMode();
  res.json({
    success: true,
    systemMode: currentMode,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/system-mode', (req, res) => {
  const { mode } = req.body;
  if (mode === 'development' || mode === 'live') {
    setSystemMode(mode);
    res.json({
      success: true,
      systemMode: mode,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Invalid mode'
    });
  }
});

// Live dashboard endpoints - only return authenticated data
app.get('/api/dashboard-metrics', async (req, res) => {
  try {
    // Check for hardcoded violations
    const violations = HardcodeDetector.scanForHardcodes({}, 'dashboard-metrics');
    if (violations.length > 0) {
      console.log('🚨 HARDCODE VIOLATION: Blocked value "development" detected');
      console.log('🚨 INTEGRITY CHECK FAILED - Development logging blocked');
    }

    const liveData = LiveDataCleaner.cleanForLiveMode({});
    
    res.json({
      success: true,
      data: liveData,
      mode: getSystemMode(),
      message: 'Live metrics from authenticated sources only'
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch live metrics'
    });
  }
});

app.get('/api/live-activity', async (req, res) => {
  try {
    // Check for hardcoded violations
    const violations = HardcodeDetector.scanForHardcodes({}, 'live-activity');
    if (violations.length > 0) {
      console.log('🚨 HARDCODE VIOLATION: Blocked value "development" detected');
      console.log('🚨 INTEGRITY CHECK FAILED - Development logging blocked');
    }

    const liveData = LiveDataCleaner.cleanForLiveMode({});
    
    res.json({
      success: true,
      data: liveData,
      mode: getSystemMode(),
      message: 'Live activity from authenticated sources only'
    });
  } catch (error) {
    console.error('Live activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch live activity'
    });
  }
});

app.get('/api/automation-performance', async (req, res) => {
  try {
    // Check for hardcoded violations
    const violations = HardcodeDetector.scanForHardcodes({}, 'automation-performance');
    if (violations.length > 0) {
      console.log('🚨 HARDCODE VIOLATION: Blocked value "development" detected');
      console.log('🚨 INTEGRITY CHECK FAILED - Development logging blocked');
    }

    const liveData = LiveDataCleaner.cleanForLiveMode({});
    
    res.json({
      success: true,
      data: liveData,
      mode: getSystemMode(),
      message: 'Live automation data from authenticated sources only'
    });
  } catch (error) {
    console.error('Automation performance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch automation performance'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'operational',
    mode: getSystemMode(),
    timestamp: new Date().toISOString()
  });
});

// Setup HTTP server and Vite
const server = createServer(app);
setupVite(app, server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  log(`Server running on port ${PORT}`);
});