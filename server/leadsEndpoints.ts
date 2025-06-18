import { Express, Request, Response } from 'express';
import { leadsStorage } from './storage';
import { insertUniversalLeadSchema } from '@shared/schema';
import { z } from 'zod';

export function registerLeadsEndpoints(app: Express) {
  // Get universal leads
  app.get('/api/leads/universal', async (req: Request, res: Response) => {
    try {
      const leads = await leadsStorage.getUniversalLeads();
      res.json({ success: true, data: leads });
    } catch (error) {
      console.error('Failed to fetch universal leads:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch leads',
        mode: 'live',
        message: 'Live data - Airtable integration required'
      });
    }
  });

  // Get callable leads for pipeline
  app.get('/api/leads/callable', async (req: Request, res: Response) => {
    try {
      const leads = await leadsStorage.getCallableLeads();
      res.json({ success: true, data: leads });
    } catch (error) {
      console.error('Failed to fetch callable leads:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch callable leads',
        mode: 'live',
        message: 'Live data - Airtable integration required'
      });
    }
  });

  // Get leads by status
  app.get('/api/leads/status/:status', async (req: Request, res: Response) => {
    try {
      const { status } = req.params;
      const leads = await leadsStorage.getLeadsByStatus(status);
      res.json({ success: true, data: leads });
    } catch (error) {
      console.error('Failed to fetch leads by status:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch leads by status',
        mode: 'live',
        message: 'Live data - Airtable integration required'
      });
    }
  });

  // Create new lead
  app.post('/api/leads/universal', async (req: Request, res: Response) => {
    try {
      const validatedData = insertUniversalLeadSchema.parse(req.body);
      const lead = await leadsStorage.createUniversalLead(validatedData);
      res.json({ success: true, data: lead });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          error: 'Invalid lead data', 
          details: error.errors 
        });
      } else {
        console.error('Failed to create lead:', error);
        res.status(500).json({ 
          success: false, 
          error: 'Failed to create lead',
          mode: 'live',
          message: 'Live data - Airtable integration required'
        });
      }
    }
  });

  // Update lead call status
  app.patch('/api/leads/:id/call-status', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, attempts } = req.body;
      
      const lead = await leadsStorage.updateLeadCallStatus(
        parseInt(id), 
        status, 
        attempts
      );
      
      if (!lead) {
        return res.status(404).json({ 
          success: false, 
          error: 'Lead not found' 
        });
      }
      
      res.json({ success: true, data: lead });
    } catch (error) {
      console.error('Failed to update lead call status:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to update lead call status',
        mode: 'live',
        message: 'Live data - Airtable integration required'
      });
    }
  });

  // Sync from Airtable
  app.post('/api/leads/sync-airtable', async (req: Request, res: Response) => {
    try {
      const result = await leadsStorage.syncFromAirtable();
      res.json(result);
    } catch (error) {
      console.error('Failed to sync from Airtable:', error);
      res.status(500).json({ 
        success: false, 
        count: 0,
        message: 'Airtable sync failed - API key required'
      });
    }
  });

  // Get leads statistics
  app.get('/api/leads/stats', async (req: Request, res: Response) => {
    try {
      const stats = await leadsStorage.getLeadsStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Failed to fetch leads stats:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch leads statistics',
        mode: 'live',
        message: 'Live data - Airtable integration required'
      });
    }
  });

  // Scraper webhook endpoints for Apollo, Apify, PhantomBuster
  app.post('/api/leads/apollo-webhook', async (req: Request, res: Response) => {
    try {
      const { leads, sessionId } = req.body;
      
      // Process Apollo leads and save to universal leads table
      const savedLeads = [];
      for (const apolloLead of leads) {
        const universalLead = {
          source: 'apollo',
          sourceId: apolloLead.id,
          fullName: `${apolloLead.first_name || ''} ${apolloLead.last_name || ''}`.trim(),
          firstName: apolloLead.first_name,
          lastName: apolloLead.last_name,
          email: apolloLead.email,
          phone: apolloLead.phone,
          company: apolloLead.company_name,
          title: apolloLead.title,
          location: apolloLead.location,
          status: 'New'
        };
        
        const saved = await leadsStorage.createUniversalLead(universalLead);
        savedLeads.push(saved);
      }
      
      res.json({ 
        success: true, 
        count: savedLeads.length,
        message: 'Apollo leads processed and saved',
        sessionId 
      });
    } catch (error) {
      console.error('Apollo webhook error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to process Apollo leads' 
      });
    }
  });

  app.post('/api/leads/apify-webhook', async (req: Request, res: Response) => {
    try {
      const { leads, sessionId } = req.body;
      
      // Process Apify leads and save to universal leads table
      const savedLeads = [];
      for (const apifyLead of leads) {
        const universalLead = {
          source: 'apify',
          sourceId: apifyLead.id,
          fullName: apifyLead.name,
          email: apifyLead.email,
          phone: apifyLead.phone,
          company: apifyLead.company,
          website: apifyLead.website,
          location: apifyLead.location,
          status: 'New'
        };
        
        const saved = await leadsStorage.createUniversalLead(universalLead);
        savedLeads.push(saved);
      }
      
      res.json({ 
        success: true, 
        count: savedLeads.length,
        message: 'Apify leads processed and saved',
        sessionId 
      });
    } catch (error) {
      console.error('Apify webhook error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to process Apify leads' 
      });
    }
  });

  app.post('/api/leads/phantombuster-webhook', async (req: Request, res: Response) => {
    try {
      const { leads, sessionId } = req.body;
      
      // Process PhantomBuster leads and save to universal leads table
      const savedLeads = [];
      for (const phantomLead of leads) {
        const universalLead = {
          source: 'phantombuster',
          sourceId: phantomLead.id,
          fullName: phantomLead.fullName,
          firstName: phantomLead.firstName,
          lastName: phantomLead.lastName,
          email: phantomLead.email,
          phone: phantomLead.phone,
          company: phantomLead.company,
          title: phantomLead.title,
          location: phantomLead.location,
          platform: phantomLead.platform,
          linkedinUrl: phantomLead.profileUrl,
          status: 'New'
        };
        
        const saved = await leadsStorage.createUniversalLead(universalLead);
        savedLeads.push(saved);
      }
      
      res.json({ 
        success: true, 
        count: savedLeads.length,
        message: 'PhantomBuster leads processed and saved',
        sessionId 
      });
    } catch (error) {
      console.error('PhantomBuster webhook error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to process PhantomBuster leads' 
      });
    }
  });
}