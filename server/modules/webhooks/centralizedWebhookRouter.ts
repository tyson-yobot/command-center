/**
 * Centralized Webhook Router
 * Ensures ALL webhooks and automations route ONLY to the main desktop command center
 * Fixes the issue where automations were incorrectly wired to multiple dashboards
 */

import type { Express } from "express";

interface WebhookPayload {
  type: string;
  data: any;
  source: string;
  timestamp: string;
}

export function setupCentralizedWebhookRouter(app: Express) {
  // Central webhook endpoint that routes everything to main desktop command center
  app.post('/webhook/central-router', async (req, res) => {
    try {
      const payload: WebhookPayload = {
        type: req.body.type || 'unknown',
        data: req.body,
        source: req.headers['user-agent'] || 'unknown',
        timestamp: new Date().toISOString()
      };

      // Log to main desktop command center ONLY
      await routeToMainDesktopCommandCenter(payload);
      
      res.json({ 
        status: 'success', 
        message: 'Webhook routed to main desktop command center',
        routed_to: 'main-desktop-command-center'
      });
    } catch (error: any) {
      console.error('Central webhook router error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Stripe webhook - redirect to centralized router
  app.post('/stripe-payment', async (req, res) => {
    console.log('Stripe webhook received, routing to main desktop command center');
    
    try {
      // Route to main desktop command center
      await routeToMainDesktopCommandCenter({
        type: 'stripe_payment',
        data: req.body,
        source: 'stripe',
        timestamp: new Date().toISOString()
      });

      // Send to main desktop dashboard via WebSocket
      const io = (global as any).io;
      if (io) {
        io.emit('webhook_received', {
          type: 'stripe_payment',
          data: req.body,
          timestamp: new Date().toISOString(),
          target_dashboard: 'main-desktop-command-center'
        });
      }

      res.json({ 
        received: true, 
        routed_to: 'main-desktop-command-center',
        webhook_type: 'stripe_payment'
      });
    } catch (error: any) {
      console.error('Stripe webhook routing error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Sales order webhook - redirect to centralized router  
  app.post('/sales-order', async (req, res) => {
    console.log('Sales order webhook received, routing to main desktop command center');
    
    try {
      await routeToMainDesktopCommandCenter({
        type: 'sales_order',
        data: req.body,
        source: 'sales_system',
        timestamp: new Date().toISOString()
      });

      // Send to main desktop dashboard via WebSocket
      const io = (global as any).io;
      if (io) {
        io.emit('webhook_received', {
          type: 'sales_order',
          data: req.body,
          timestamp: new Date().toISOString(),
          target_dashboard: 'main-desktop-command-center'
        });
      }

      res.json({ 
        received: true, 
        routed_to: 'main-desktop-command-center',
        webhook_type: 'sales_order'
      });
    } catch (error: any) {
      console.error('Sales order webhook routing error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Calendly webhook - redirect to centralized router
  app.post('/webhook/calendly', async (req, res) => {
    console.log('Calendly webhook received, routing to main desktop command center');
    
    try {
      await routeToMainDesktopCommandCenter({
        type: 'calendly_event',
        data: req.body,
        source: 'calendly',
        timestamp: new Date().toISOString()
      });

      const io = (global as any).io;
      if (io) {
        io.emit('webhook_received', {
          type: 'calendly_event',
          data: req.body,
          timestamp: new Date().toISOString(),
          target_dashboard: 'main-desktop-command-center'
        });
      }

      res.json({ 
        received: true, 
        routed_to: 'main-desktop-command-center',
        webhook_type: 'calendly_event'
      });
    } catch (error: any) {
      console.error('Calendly webhook routing error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // HubSpot webhook - redirect to centralized router
  app.post('/webhook/hubspot', async (req, res) => {
    console.log('HubSpot webhook received, routing to main desktop command center');
    
    try {
      await routeToMainDesktopCommandCenter({
        type: 'hubspot_contact',
        data: req.body,
        source: 'hubspot',
        timestamp: new Date().toISOString()
      });

      const io = (global as any).io;
      if (io) {
        io.emit('webhook_received', {
          type: 'hubspot_contact',
          data: req.body,
          timestamp: new Date().toISOString(),
          target_dashboard: 'main-desktop-command-center'
        });
      }

      res.json({ 
        received: true, 
        routed_to: 'main-desktop-command-center',
        webhook_type: 'hubspot_contact'
      });
    } catch (error: any) {
      console.error('HubSpot webhook routing error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Block any webhooks trying to route to other dashboards
  app.post('/webhook/control-center*', (req, res) => {
    res.status(403).json({ 
      error: 'Webhooks to control-center are disabled. All webhooks route to main-desktop-command-center only.',
      redirect_to: '/webhook/central-router'
    });
  });

  app.post('/webhook/client-dashboard*', (req, res) => {
    res.status(403).json({ 
      error: 'Webhooks to client-dashboard are disabled. All webhooks route to main-desktop-command-center only.',
      redirect_to: '/webhook/central-router'
    });
  });

  app.post('/webhook/lite*', (req, res) => {
    res.status(403).json({ 
      error: 'Webhooks to lite dashboard are disabled. All webhooks route to main-desktop-command-center only.',
      redirect_to: '/webhook/central-router'
    });
  });

  // Automation trigger endpoint - only routes to main desktop command center
  app.post('/api/automation-trigger', async (req, res) => {
    try {
      const { function_id, payload } = req.body;
      
      // Route to main desktop command center automation system
      await routeToMainDesktopCommandCenter({
        type: 'automation_trigger',
        data: { function_id, payload },
        source: 'automation_system',
        timestamp: new Date().toISOString()
      });

      // Send to main desktop dashboard via WebSocket
      const io = (global as any).io;
      if (io) {
        io.emit('automation_triggered', {
          function_id,
          payload,
          timestamp: new Date().toISOString(),
          target_dashboard: 'main-desktop-command-center'
        });
      }

      res.json({ 
        success: true, 
        function_id,
        routed_to: 'main-desktop-command-center'
      });
    } catch (error: any) {
      console.error('Automation trigger routing error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  console.log('✅ Centralized webhook router configured - all webhooks route to main desktop command center only');
}

async function routeToMainDesktopCommandCenter(payload: WebhookPayload) {
  try {
    // Log to main desktop command center system
    console.log(`[MAIN-DESKTOP-CC] ${payload.type} webhook received from ${payload.source}`);
    
    // Store in centralized webhook log (could be Airtable, database, etc.)
    // This ensures all webhook activity is tracked in one place
    const webhookLog = {
      timestamp: payload.timestamp,
      type: payload.type,
      source: payload.source,
      data: JSON.stringify(payload.data),
      target_dashboard: 'main-desktop-command-center',
      status: 'processed'
    };
    
    // Here you would save to your centralized logging system
    // Example: await storage.createWebhookLog(webhookLog);
    
    return { success: true, logged_to: 'main-desktop-command-center' };
  } catch (error: any) {
    console.error('Error routing to main desktop command center:', error);
    throw error;
  }
}

export { routeToMainDesktopCommandCenter };
