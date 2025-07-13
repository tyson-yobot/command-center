import type { Express } from "express";
import { db } from "./db";
import { storage, leadsStorage, callLogStorage } from "./storage";
import { registerAirtableRoutes } from "./modules/airtable/airtableRoutes";
import { registerScraperRoutes } from "./modules/scraper/scraperRoutes";
import { registerRealScrapingRoutes } from "./modules/lead-scraper/realScrapingRoutes";
import { generateVoiceReply, testElevenLabsConnection, getAvailableVoices } from "./modules/voice/voiceGeneration";
import { registerLeadsEndpoints } from "./leadsEndpoints";
import pino from "pino";

const logger = pino();

let systemMode = 'live';

/**
 * Registers all API routes and endpoints for the application.
 * @param {Express} app - The Express application instance to register routes on.
 */
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
      res.json({ success: true, data: voices });
    } catch (error) {
      logger.error({ err: error }, 'Failed to fetch voices');
      res.json({ success: false, data: [] });
    }
  });

  // Voice generation endpoints
  app.post('/api/voice/generate', async (req: import("express").Request, res: import("express").Response) => {
    try {
      const { text, voiceId } = req.body;
      if (!text) {
        return res.status(400).json({ success: false, error: 'Text is required' });
      }
      
      // Add a random suffix to the filename to avoid collisions
      const randomSuffix = Math.random().toString(36).substring(2, 10);
      const filename = `voice_${Date.now()}_${randomSuffix}.mp3`;

      // You may want to call generateVoiceReply here and return the result
      const result = await generateVoiceReply(text, voiceId, filename);

      res.json(result);
    } catch (error) {
      logger.error({ err: error }, 'Voice generation error');
      res.status(500).json({ 
        success: false, 
        error: 'Voice generation failed' 
      });
    }
  });

  app.get('/api/voice/test-connection', async (req, res) => {
      logger.error({ err: error }, 'Voice connection test error');
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
      const formattedCalls = activeCalls.map((lead: any): {
        id: string;
        contact: string;
        phone: string;
        company: string;
        status: string;
        type: string;
        duration: string;
        quality: string;
        timestamp: string;
      } => ({
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
      res.json({ success: false, data: [] });
    }
  });

  app.get('/api/calls/metrics', async (req, res) => {
    try {
      const stats = await callLogStorage.getCallLogStats();
      res.json({
        success: false,
        data: {
          totalCalls: 0,
          completedCalls: 0,
          avgDuration: '0m 0s'
        },
        error: 'Failed to fetch call metrics'
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
  import type { Request, Response } from "express";

  app.post('/api/pipeline/start', async (req: Request, res: Response) => {
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

      // Update lead statuses to "Calling" for active leads in parallel
      const leadsToCall = callableLeads.slice(0, 5);
      await Promise.all(
      const activeCalls = [];
      const leadsToCall = callableLeads.slice(0, 5);

      await Promise.all(leadsToCall.map(async (lead) => {
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
      }));
      res.json({
        success: true,
        message: `Pipeline started with ${activeCalls.length} calls`,
        total_records: callableLeads.length,
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
      logger.error({ err: error }, 'Pipeline stop error');
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

  console.log("✅ Command Center routes registered successfully");
}