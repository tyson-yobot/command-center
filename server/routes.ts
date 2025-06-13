import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { registerProductionSalesOrder } from "./productionSalesOrder";
import { registerLiveFunctionValidation } from "./liveFunctionValidator";
import { registerBatch22 } from "./automationBatch22";
import { registerBatch23 } from "./automationBatch23";
import { registerBatch24 } from "./automationBatch24";
import { registerBatch25 } from "./automationBatch25";
import { registerBatch26 } from "./automationBatch26";
import { registerBatch27 } from "./automationBatch27";
import { registerBatch28 } from "./automationBatch28";
import { registerBatch29 } from "./automationBatch29";
import { registerBatch30 } from "./automationBatch30";
import { registerRealScrapingRoutes } from "./realScrapingRoutes";
import { registerRealSalesOrderRoutes } from "./realSalesOrderRoutes";
import { registerRealAutomationEndpoints } from "./realAutomationRunner";
import { registerScrapingEndpoints } from "./scrapingApiEndpoints";
import { registerContentCreatorEndpoints } from "./contentCreatorEndpoints";
import { registerDashboardEndpoints } from "./dashboardEndpoints";
import { registerCoreAutomationEndpoints } from "./coreAutomationEndpoints";
import { registerAutomationEndpoints, executeAutomationFunction } from "./automationHandler";
import { registerCentralAutomationDispatcher } from "./centralAutomationDispatcher";
import { registerCommandCenterRoutes } from "./commandCenterRoutes";
import { registerQAValidationRoutes } from "./qaValidationSystem";
import { registerContentCreatorRoutes } from "./contentCreatorRoutes";
import { registerMailchimpRoutes } from "./mailchimpRoutes";
import { registerPublerRoutes } from "./publerIntegration";
import { configManager } from "./controlCenterConfig";
import { automationTester } from "./automationTester";
import { registerZendeskRoutes } from "./zendeskIntegration";
import { getSystemMode, setSystemMode } from "./systemMode";
import { isLiveMode, safeLiveData, blockTestData, validateLiveData } from "./liveMode";
import { knowledgeStorage, callLogStorage } from "./storage";
import LiveDataCleaner from "./liveDataCleaner";
import { liveKnowledgePurge } from "./liveKnowledgePurge";
import OpenAI from "openai";
import { generateSocialMediaPost, generateEmailCampaign, postToSocialMedia, sendEmailCampaign } from './contentCreator';
import * as ElevenLabs from './elevenlabs';
import HardcodeDetector from './hardcodeDetector';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System mode state - now managed by centralized systemMode module
let systemMode: 'test' | 'live' = 'live';

// Export getter function for system mode - uses centralized module
export function getSystemModeLocal(): 'test' | 'live' {
  return systemMode;
}

// Data store interfaces
interface ContactData {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  location: string;
  score: number;
  linkedinUrl: string;
  source: any;
}

interface DocumentData {
  documentId: string;
  fileName: any;
  fileSize: any;
  fileType: any;
  category: any;
  extractedText: string;
  keyTerms: string[];
}

interface KnowledgeData {
  id: any;
  title: any;
  excerpt: string;
  relevanceScore: number;
  source: string;
  lastModified: any;
  keyTerms: any;
  categories: any;
  wordCount: any;
}

interface AutomationData {
  id: string;
  type: string;
  status: string;
  result: any;
  timestamp: string;
}

// Live data storage - only authenticated sources
const liveContacts: ContactData[] = [];
const liveDocuments: DocumentData[] = [];
const liveKnowledge: KnowledgeData[] = [];
const liveAutomations: AutomationData[] = [];

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

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
    if (mode === 'test' || mode === 'live') {
      setSystemMode(mode);
      systemMode = mode;
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

  // Register all modules
  registerProductionSalesOrder(app);
  registerLiveFunctionValidation(app);
  registerBatch22(app);
  registerBatch23(app);
  registerBatch24(app);
  registerBatch25(app);
  registerBatch26(app);
  registerBatch27(app);
  registerBatch28(app);
  registerBatch29(app);
  registerBatch30(app);
  registerRealScrapingRoutes(app);
  registerRealSalesOrderRoutes(app);
  registerRealAutomationEndpoints(app);
  registerScrapingEndpoints(app);
  registerContentCreatorEndpoints(app);
  registerDashboardEndpoints(app);
  registerCoreAutomationEndpoints(app);
  registerAutomationEndpoints(app);
  registerCentralAutomationDispatcher(app);
  registerCommandCenterRoutes(app);
  registerQAValidationRoutes(app);
  registerContentCreatorRoutes(app);
  registerMailchimpRoutes(app);
  registerPublerRoutes(app);
  registerZendeskRoutes(app);

  return httpServer;
}