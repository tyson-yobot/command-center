import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { z } from "zod";
import { insertBotSchema, insertNotificationSchema, insertMetricsSchema, insertCrmDataSchema, insertScannedContactSchema } from "@shared/schema";
import { createWorker } from 'tesseract.js';

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws' 
  });

  // Store connected WebSocket clients
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Client connected to WebSocket');

    ws.on('close', () => {
      clients.delete(ws);
      console.log('Client disconnected from WebSocket');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });

    // Send initial connection confirmation
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'connected', message: 'WebSocket connected' }));
    }
  });

  // Broadcast to all connected clients
  const broadcast = (data: any) => {
    const message = JSON.stringify(data);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };

  // Bot endpoints
  app.get('/api/bot', async (req, res) => {
    try {
      const bot = await storage.getBot(1); // Assuming single bot for now
      res.json(bot);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch bot data' });
    }
  });

  app.patch('/api/bot', async (req, res) => {
    try {
      const updates = insertBotSchema.partial().parse(req.body);
      const bot = await storage.updateBot(1, updates);
      
      // Broadcast bot status change
      broadcast({
        type: 'bot_status_change',
        status: bot.status,
        data: bot
      });
      
      res.json(bot);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid bot data', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to update bot' });
      }
    }
  });

  // Metrics endpoints
  app.get('/api/metrics', async (req, res) => {
    try {
      const metrics = await storage.getMetrics(1);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch metrics' });
    }
  });

  app.post('/api/metrics', async (req, res) => {
    try {
      const metricsData = insertMetricsSchema.parse(req.body);
      const metrics = await storage.createMetrics(metricsData);
      
      // Broadcast metrics update
      broadcast({
        type: 'metrics_update',
        data: metrics
      });
      
      res.json(metrics);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid metrics data', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to create metrics' });
      }
    }
  });

  // Conversations endpoints
  app.get('/api/conversations', async (req, res) => {
    try {
      const conversations = await storage.getConversations();
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  });

  // Notifications endpoints
  app.get('/api/notifications', async (req, res) => {
    try {
      const notifications = await storage.getNotifications(1);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  app.patch('/api/notifications/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = { isRead: req.body.isRead };
      const notification = await storage.updateNotification(id, updates);
      res.json(notification);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update notification' });
    }
  });

  app.post('/api/notifications', async (req, res) => {
    try {
      const notificationData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(notificationData);
      
      // Broadcast new notification
      broadcast({
        type: 'notification',
        title: notification.title,
        message: notification.message,
        data: notification
      });
      
      res.json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid notification data', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to create notification' });
      }
    }
  });

  // CRM endpoints
  app.get('/api/crm', async (req, res) => {
    try {
      const crmData = await storage.getCrmData(1);
      res.json(crmData);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch CRM data' });
    }
  });

  // Simulate real-time updates
  setInterval(() => {
    // Simulate metrics updates every 30 seconds
    const randomMetric = Math.floor(Math.random() * 10);
    broadcast({
      type: 'metrics_update',
      data: {
        callsToday: 247 + randomMetric,
        conversions: 89 + Math.floor(randomMetric / 2),
        newLeads: 156 + randomMetric,
        failedCalls: 12 + Math.floor(randomMetric / 5)
      }
    });
  }, 30000);

  // Business Card Scanner endpoints
  app.get("/api/scanned-contacts", async (req, res) => {
    try {
      const userId = 1; // Default user for demo
      const contacts = await storage.getScannedContacts(userId);
      res.json(contacts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Extract text from business card image using OCR
  const extractContactInfo = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const result: any = {
      firstName: null,
      lastName: null,
      company: null,
      title: null,
      email: null,
      phone: null,
      website: null
    };

    // Extract email using regex
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      result.email = emailMatch[0];
    }

    // Extract phone using regex (various formats)
    const phoneMatch = text.match(/(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+\d{1,3}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/);
    if (phoneMatch) {
      result.phone = phoneMatch[0];
    }

    // Extract website using regex
    const websiteMatch = text.match(/(www\.|https?:\/\/)?[\w\-_]+(\.[\w\-_]+)+[\/\w\-_.,@?^=%&:/~+#]*/i);
    if (websiteMatch) {
      result.website = websiteMatch[0].startsWith('http') ? websiteMatch[0] : `https://${websiteMatch[0]}`;
    }

    // Extract name (assume first meaningful line with capital letters)
    const namePattern = /^[A-Z][a-z]+ [A-Z][a-z]+/;
    for (const line of lines) {
      if (namePattern.test(line.trim())) {
        const nameParts = line.trim().split(' ');
        result.firstName = nameParts[0];
        result.lastName = nameParts.slice(1).join(' ');
        break;
      }
    }

    // Extract company (look for common business indicators)
    const businessWords = ['LLC', 'Inc', 'Corp', 'Company', 'Ltd', 'Group', 'Associates', 'Partners'];
    for (const line of lines) {
      if (businessWords.some(word => line.includes(word))) {
        result.company = line.trim();
        break;
      }
    }

    // Extract title (look for common job titles)
    const titleWords = ['CEO', 'President', 'Director', 'Manager', 'VP', 'Vice President', 'Executive', 'Senior', 'Lead', 'Head', 'Chief'];
    for (const line of lines) {
      if (titleWords.some(word => line.toLowerCase().includes(word.toLowerCase()))) {
        result.title = line.trim();
        break;
      }
    }

    return result;
  };

  app.post("/api/scan-business-card", async (req, res) => {
    try {
      const { imageData } = req.body;
      
      if (!imageData) {
        return res.status(400).json({ error: "Image data is required" });
      }

      // Initialize Tesseract worker
      const worker = await createWorker('eng');
      
      // Convert base64 to buffer for OCR processing
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Perform OCR
      const { data: { text } } = await worker.recognize(buffer);
      await worker.terminate();

      // Extract contact information from OCR text
      const contactInfo = extractContactInfo(text);

      // Save to storage
      const scannedContact = await storage.createScannedContact({
        userId: 1, // Default user for demo
        ...contactInfo,
        rawText: text,
        source: "card_scan",
        status: "pending"
      });

      // Send to Make webhook
      const webhookUrl = "https://hook.us2.make.com/zotpeemkmmftah364aownf3gt94a5v8g";
      if (webhookUrl) {
        try {
          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              source: "card_scan",
              first_name: contactInfo.firstName,
              last_name: contactInfo.lastName,
              company: contactInfo.company,
              title: contactInfo.title,
              email: contactInfo.email,
              phone: contactInfo.phone,
              website: contactInfo.website
            })
          });

          if (response.ok) {
            // Update status to processed
            await storage.updateScannedContact(scannedContact.id, { status: "processed" });
          }
        } catch (webhookError) {
          console.error('Webhook error:', webhookError);
          // Don't fail the request if webhook fails
        }
      }

      // Broadcast new contact to connected clients
      broadcast({
        type: 'new_scanned_contact',
        data: scannedContact
      });

      res.json({
        success: true,
        contact: scannedContact,
        extractedText: text
      });

    } catch (error: any) {
      console.error('OCR Error:', error);
      res.status(500).json({ error: "Failed to process business card" });
    }
  });

  return httpServer;
}
