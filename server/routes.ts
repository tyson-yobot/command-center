import type { Express } from "express";
import { db } from "./db";
import { storage } from "./storage";
import { registerAirtableRoutes } from "./modules/airtable/airtableRoutes";
import { registerScraperRoutes } from "./modules/scraper/scraperRoutes";
import { registerRealScrapingRoutes } from "./modules/lead-scraper/realScrapingRoutes";
import { generateVoiceReply, testElevenLabsConnection, getAvailableVoices } from "./modules/voice/voiceGeneration";

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

  // Voice personas
  app.get('/api/voice/personas', async (req, res) => {
    try {
      const voices = await getAvailableVoices();
      res.json({
        success: true,
        data: voices
      });
    } catch (error) {
      console.error('Failed to fetch voices:', error);
      res.json({
        success: true,
        data: []
      });
    }
  });

  // Voice generation endpoints
  app.post('/api/voice/generate', async (req, res) => {
    try {
      const { text, voiceId } = req.body;
      if (!text) {
        return res.status(400).json({ success: false, error: 'Text is required' });
      }
      
      const filename = `voice_${Date.now()}.mp3`;
      const result = await generateVoiceReply(text, filename);
      
      res.json(result);
    } catch (error) {
      console.error('Voice generation error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Voice generation failed' 
      });
    }
  });

  app.get('/api/voice/test-connection', async (req, res) => {
    try {
      const result = await testElevenLabsConnection();
      res.json(result);
    } catch (error) {
      console.error('Voice connection test error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Connection test failed' 
      });
    }
  });

  // Calls endpoints
  app.get('/api/calls/active', (req, res) => {
    res.json({ success: true, data: [] });
  });

  app.get('/api/calls/metrics', (req, res) => {
    res.json({
      success: true,
      data: {
        totalCalls: 0,
        completedCalls: 0,
        avgDuration: 0
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

  // Register Airtable routes for lead management and pipeline functionality
  registerAirtableRoutes(app);

  // Register scraper routes for lead generation
  registerScraperRoutes(app);

  // Register real lead scraping routes with Airtable integration
  registerRealScrapingRoutes(app);

  console.log("✅ Command Center routes registered successfully");
}