import { Express, Request, Response } from 'express';
import { airtableService } from './airtableService';

export function registerAirtableRoutes(app: Express): void {
  // Lead Management Routes
  app.post('/api/airtable/leads', async (req: Request, res: Response) => {
    try {
      const lead = await airtableService.createLead(req.body);
      res.json({ success: true, data: lead });
    } catch (error) {
      console.error('Create lead error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/airtable/leads', async (req: Request, res: Response) => {
    try {
      const status = req.query.status as string;
      const leads = await airtableService.getLeads(status);
      res.json({ success: true, data: leads });
    } catch (error) {
      console.error('Get leads error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.patch('/api/airtable/leads/:id/status', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const lead = await airtableService.updateLeadStatus(id, status);
      res.json({ success: true, data: lead });
    } catch (error) {
      console.error('Update lead status error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Booking Routes
  app.post('/api/airtable/bookings', async (req: Request, res: Response) => {
    try {
      const booking = await airtableService.createBooking(req.body);
      res.json({ success: true, data: booking });
    } catch (error) {
      console.error('Create booking error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Support Ticket Routes
  app.post('/api/airtable/support-tickets', async (req: Request, res: Response) => {
    try {
      const ticket = await airtableService.createSupportTicket(req.body);
      res.json({ success: true, data: ticket });
    } catch (error) {
      console.error('Create support ticket error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Pipeline Management Routes
  app.get('/api/airtable/qualified-leads', async (req: Request, res: Response) => {
    try {
      const leads = await airtableService.getQualifiedLeads();
      res.json({ success: true, data: leads });
    } catch (error) {
      console.error('Get qualified leads error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/airtable/start-pipeline', async (req: Request, res: Response) => {
    try {
      const { leadIds } = req.body;
      const result = await airtableService.startPipelineCalls(leadIds);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Start pipeline error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Lead Scraper Routes
  app.post('/api/airtable/scrape-leads', async (req: Request, res: Response) => {
    try {
      const { source, leads } = req.body;
      
      const formattedLeads = leads.map((leadData: any) => ({
        firstName: leadData.firstName || '',
        lastName: leadData.lastName || '',
        email: leadData.email || '',
        phone: leadData.phone || '',
        company: leadData.company || '',
        status: 'New',
        source: source || 'Lead Scraper Tool',
        notes: `Title: ${leadData.title || ''}, Location: ${leadData.location || ''}`,
        title: leadData.title || '',
        location: leadData.location || ''
      }));

      const result = await airtableService.createLeadsBulk(formattedLeads);
      
      res.json({ 
        success: result.success, 
        data: { 
          leadsCreated: result.leadsCreated,
          errors: result.errors
        } 
      });
    } catch (error) {
      console.error('Scrape leads error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Follow-up Management
  app.post('/api/airtable/follow-ups', async (req: Request, res: Response) => {
    try {
      const { leadId, type, scheduledDate, notes } = req.body;
      
      // Update lead with follow-up information
      await airtableService.updateLeadStatus(leadId, 'Follow-up Scheduled');
      
      res.json({ 
        success: true, 
        data: { 
          message: 'Follow-up scheduled successfully',
          leadId,
          type,
          scheduledDate
        } 
      });
    } catch (error) {
      console.error('Schedule follow-up error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
}
