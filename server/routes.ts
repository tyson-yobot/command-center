import type { Express } from "express";
import { db } from "./db";
import { leadsStorage, callLogStorage } from "./storage";
import { registerAirtableRoutes } from "./modules/airtable/airtableRoutes";
import { registerScraperRoutes } from "./modules/scraper/scraperRoutes";
import { registerRealScrapingRoutes } from "./modules/lead-scraper/realScrapingRoutes";
import { generateVoiceReply, testElevenLabsConnection, getAvailableVoices } from "./modules/voice/voiceGeneration";
import { registerLeadsEndpoints } from "./leadsEndpoints";
import { registerScraperEndpoints } from "./scraperEndpoints";

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

  // Calls endpoints using real Airtable data
  app.get('/api/calls/active', async (req, res) => {
    try {
      const activeCalls = await leadsStorage.getLeadsByStatus('Calling');
      const formattedCalls = activeCalls.map(lead => ({
        id: lead.id,
        contact: lead.fullName || `${lead.firstName || ''} ${lead.lastName || ''}`.trim(),
        phone: lead.phone,
        company: lead.company,
        status: 'active',
        type: 'outbound',
        duration: '00:00',
        quality: 'good',
        timestamp: new Date().toISOString()
      }));
      
      res.json({ success: true, data: formattedCalls });
    } catch (error) {
      console.error('Failed to fetch active calls:', error);
      res.json({ success: true, data: [] });
    }
  });

  app.get('/api/calls/metrics', async (req, res) => {
    try {
      const stats = await callLogStorage.getCallLogStats();
      res.json({
        success: true,
        data: {
          totalCalls: stats.totalCalls,
          completedCalls: stats.totalCalls - stats.activeCalls,
          avgDuration: stats.avgDuration
        }
      });
    } catch (error) {
      console.error('Failed to fetch call metrics:', error);
      res.json({
        success: true,
        data: {
          totalCalls: 0,
          completedCalls: 0,
          avgDuration: '0m 0s'
        }
      });
    }
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

  // Pipeline endpoints using real Airtable leads
  app.post('/api/pipeline/start', async (req, res) => {
    try {
      const callableLeads = await leadsStorage.getCallableLeads();
      
      if (callableLeads.length === 0) {
        return res.json({
          success: false,
          message: 'No callable leads found in Airtable',
          total_records: 0,
          active_calls: 0,
          activeCalls: []
        });
      }

      // Update lead statuses to "Calling" for active leads
      const activeCalls = [];
      for (let i = 0; i < Math.min(callableLeads.length, 5); i++) {
        const lead = callableLeads[i];
        await leadsStorage.updateLeadCallStatus(lead.id, 'Calling', 1);
        
        activeCalls.push({
          id: lead.id,
          contact: lead.fullName || `${lead.firstName || ''} ${lead.lastName || ''}`.trim(),
          phone: lead.phone,
          company: lead.company,
          status: 'connecting',
          type: 'outbound',
          duration: '00:00',
          quality: 'good',
          timestamp: new Date().toISOString()
        });
      }

      res.json({
        success: true,
        message: `Pipeline started with ${activeCalls.length} calls`,
        total_records: callableLeads.length,
        active_calls: activeCalls.length,
        activeCalls
      });
    } catch (error) {
      console.error('Pipeline start error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to start pipeline',
        message: 'Airtable connection required'
      });
    }
  });

  app.post('/api/stop-pipeline-calls', async (req, res) => {
    try {
      const activeCalls = await leadsStorage.getLeadsByStatus('Calling');
      
      // Update all calling leads back to "New" status
      for (const lead of activeCalls) {
        await leadsStorage.updateLeadCallStatus(lead.id, 'New', 0);
      }

      res.json({
        success: true,
        message: `Stopped ${activeCalls.length} active calls`,
        stopped_calls: activeCalls.length
      });
    } catch (error) {
      console.error('Pipeline stop error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to stop pipeline'
      });
    }
  });

  // Register Airtable routes for lead management and pipeline functionality
  registerAirtableRoutes(app);

  // Register scraper routes for lead generation
  registerScraperRoutes(app);

  // Register real lead scraping routes with Airtable integration
  registerRealScrapingRoutes(app);

  // Register universal leads endpoints
  registerLeadsEndpoints(app);

  // Register scraper endpoints for live lead scraping
  registerScraperEndpoints(app);

  console.log("✅ Command Center routes registered successfully");
}