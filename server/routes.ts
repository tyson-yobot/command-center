import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertBotSchema, insertNotificationSchema, insertMetricsSchema, insertCrmDataSchema, insertScannedContactSchema } from "@shared/schema";
import { createWorker } from 'tesseract.js';
import { sendSlackAlert } from "./alerts";
import { generatePDFReport } from "./pdfReport";
import { sendSMSAlert, sendEmergencyEscalation } from "./sms";
import { pushToCRM, contactExistsInHubSpot, notifySlack, createFollowUpTask, tagContactSource, enrollInWorkflow, createDealForContact, exportToGoogleSheet, enrichContactWithClearbit, enrichContactWithApollo, sendSlackScanAlert, logToSupabase, triggerQuotePDF, addToCalendar, pushToStripe, sendNDAEmail, autoTagContactType, sendVoicebotWebhookResponse, syncToQuickBooks, alertSlackFailure, sendHubSpotFallback, pushToQuoteDashboard, scheduleFollowUpTask, logEventToAirtable, triggerToneVariant, generateFallbackAudio, triggerPDFReceipt, handleStripeRetry, logToneMatch, logVoiceTranscript, assignCRMOwner, logVoiceEscalationEvent, dispatchCallSummary, pushToMetricsTracker, logCRMVoiceMatch, updateContractStatus, logIntentAndEntities, pushCommandSuggestions, logScenarioLoop, logABScriptTest, sendWebhookResponse, sendErrorSlackAlert, pushToProposalDashboard, assignLeadScore, logToSmartSpend, markContactComplete } from "./hubspotCRM";
import { postToAirtable, logDealCreated, logVoiceEscalation, logBusinessCardScan, logSyncError, runRetryQueue } from "./airtableSync";
import { requireRole } from "./roles";
import { calendarRouter } from "./calendar";
import aiChatRouter from "./aiChat";
import ragUploadRouter from "./ragUpload";
import ragSearchRouter from "./ragSearch";
import formToVoiceRouter from "./formToVoice";
import hubspotAuthRouter from "./hubspotAuth";
import voiceControlRouter from "./voiceControl";
import { setupWebSocket, broadcastUpdate } from "./websocket";
import pdfQuoteRouter from "./pdfQuote";
import speakRouter from "./speak";
import airtableRouter from "./airtable";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Enhanced WebSocket server with Socket.IO for real-time updates
  setupWebSocket(httpServer);

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
    broadcastUpdate({
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

      // Enhanced CRM integration with duplicate prevention and notifications
      try {
        // Check if contact already exists in HubSpot
        const exists = contactInfo.email ? await contactExistsInHubSpot(contactInfo.email) : false;
        
        if (!exists) {
          // Auto-tag contact type based on email domain
          const contactType = await autoTagContactType(contactInfo);
          
          // Enrich contact data with Apollo first
          try {
            await enrichContactWithApollo(contactInfo);
          } catch (error) {
            await logSyncError(contactInfo, `Apollo enrichment failed: ${error.message}`);
          }
          
          // Then enrich with Clearbit for additional data
          try {
            await enrichContactWithClearbit(contactInfo);
          } catch (error) {
            await logSyncError(contactInfo, `Clearbit enrichment failed: ${error.message}`);
          }
          
          await pushToCRM(contactInfo);
          console.log('✅ Contact pushed to HubSpot CRM successfully');
          
          // Send Slack notification to team
          try {
            await notifySlack(contactInfo);
          } catch (error) {
            await logSyncError(contactInfo, `Slack notification failed: ${error.message}`);
          }
          
          // Create follow-up task in HubSpot
          try {
            await createFollowUpTask(contactInfo);
          } catch (error) {
            await logSyncError(contactInfo, `Follow-up task creation failed: ${error.message}`);
          }
          
          // Tag contact with source attribution
          try {
            await tagContactSource(contactInfo);
          } catch (error) {
            await logSyncError(contactInfo, `Contact tagging failed: ${error.message}`);
          }
          
          // Enroll contact in automated workflow
          try {
            await enrollInWorkflow(contactInfo);
          } catch (error) {
            await logSyncError(contactInfo, `Workflow enrollment failed: ${error.message}`);
          }
          
          // Create deal in HubSpot pipeline
          try {
            await createDealForContact(contactInfo);
          } catch (error) {
            await logSyncError(contactInfo, `Deal creation failed: ${error.message}`);
          }
          
          // Export to Google Sheets as backup
          try {
            await exportToGoogleSheet(contactInfo);
          } catch (error) {
            await logSyncError(contactInfo, `Google Sheets export failed: ${error.message}`);
          }
          
          // Log deal creation to Airtable
          try {
            await logDealCreated(contactInfo);
          } catch (error) {
            await logSyncError(contactInfo, `Airtable deal logging failed: ${error.message}`);
          }
          
          // Log business card scan to Airtable
          try {
            await logBusinessCardScan(contactInfo);
          } catch (error) {
            await logSyncError(contactInfo, `Airtable scan logging failed: ${error.message}`);
          }
          
          // Send enhanced Slack scan alert
          try {
            await sendSlackScanAlert(contactInfo);
          } catch (error) {
            await logSyncError(contactInfo, `Slack scan alert failed: ${error.message}`);
          }
          
          // Log to Supabase for long-term database storage
          try {
            await logToSupabase(contactInfo, '📇 Business Card Scan');
          } catch (error) {
            await logSyncError(contactInfo, `Supabase logging failed: ${error.message}`);
          }
          
          // Add follow-up calendar event
          try {
            await addToCalendar(contactInfo);
          } catch (error) {
            await logSyncError(contactInfo, `Calendar event creation failed: ${error.message}`);
          }

          // Trigger PDF quote generation if contact qualifies
          try {
            await triggerQuotePDF(contactInfo);
          } catch (error) {
            await logSyncError(contactInfo, `PDF quote trigger failed: ${error.message}`);
          }

          // Send NDA email to qualified enterprise contacts
          try {
            await sendNDAEmail(contactInfo);
          } catch (error) {
            await logSyncError(contactInfo, `NDA email failed: ${error.message}`);
          }

          // Trigger Stripe billing flow for qualified enterprise contacts
          try {
            await pushToStripe(contactInfo);
          } catch (error) {
            await logSyncError(contactInfo, `Stripe billing flow failed: ${error.message}`);
          }

          // Sync to QuickBooks for B2B/Gov contacts
          try {
            await syncToQuickBooks(contactInfo);
          } catch (error) {
            await logSyncError(contactInfo, `QuickBooks sync failed: ${error.message}`);
          }

          // Push to Airtable Quote Dashboard
          try {
            await pushToQuoteDashboard(contactInfo);
          } catch (error) {
            await logSyncError(contactInfo, `Quote dashboard push failed: ${error.message}`);
            await sendErrorSlackAlert(contactInfo, 'Quote Dashboard', error);
          }

          // Push to Proposal Dashboard
          try {
            await pushToProposalDashboard(contactInfo);
          } catch (error) {
            await logSyncError(contactInfo, `Proposal dashboard push failed: ${error.message}`);
            await sendErrorSlackAlert(contactInfo, 'Proposal Dashboard', error);
          }

          // Schedule follow-up task in calendar
          try {
            await scheduleFollowUpTask(contactInfo);
          } catch (error) {
            await logSyncError(contactInfo, `Follow-up task scheduling failed: ${error.message}`);
            await sendErrorSlackAlert(contactInfo, 'Task Scheduler', error);
          }

          // Final event logging to Airtable
          try {
            await logEventToAirtable(contactInfo);
          } catch (error) {
            await logSyncError(contactInfo, `Final event logging failed: ${error.message}`);
            await sendErrorSlackAlert(contactInfo, 'Event Logger', error);
          }

          // Log to SmartSpend ROI tracker with lead scoring
          try {
            await logToSmartSpend(contactInfo);
          } catch (error) {
            await logSyncError(contactInfo, `SmartSpend ROI logging failed: ${error.message}`);
            await sendErrorSlackAlert(contactInfo, 'SmartSpend ROI', error);
          }

          // Mark contact as complete in tracking system
          try {
            await markContactComplete(contactInfo);
          } catch (error) {
            await logSyncError(contactInfo, `Contact completion marking failed: ${error.message}`);
            await sendErrorSlackAlert(contactInfo, 'Completion Tracker', error);
          }
          
          // Update status to processed since CRM push succeeded
          await storage.updateScannedContact(scannedContact.id, { status: "processed" });
          
          // Generate VoiceBot webhook response
          const voicebotResponse = await sendVoicebotWebhookResponse(contactInfo, 'success');
          
          res.json({
            success: true,
            extractedText: text,
            contact: contactInfo,
            voicebot_response: voicebotResponse,
            status: "Contact processed and added to CRM workflow"
          });
          return;
        } else {
          console.log('⚠️ Contact already exists in HubSpot. Skipping duplicate.');
          // Still mark as processed since we handled it appropriately
          await storage.updateScannedContact(scannedContact.id, { status: "processed" });
          
          // Generate VoiceBot response for existing contact
          const voicebotResponse = await sendVoicebotWebhookResponse(contactInfo, 'duplicate');
          
          res.json({
            success: true,
            extractedText: text,
            contact: contactInfo,
            voicebot_response: voicebotResponse,
            status: "Contact already exists in CRM"
          });
          return;
        }
      } catch (crmError) {
        console.error('❌ CRM push failed:', crmError);
        await logSyncError(contactInfo, `HubSpot CRM push failed: ${crmError.message}`);
        await sendErrorSlackAlert(contactInfo, 'HubSpot CRM', crmError);
        
        // Trigger fallback webhook for CRM failures
        try {
          await sendHubSpotFallback(contactInfo);
        } catch (fallbackError) {
          console.error('Fallback webhook also failed:', fallbackError.message);
          await sendErrorSlackAlert(contactInfo, 'HubSpot Fallback', fallbackError);
        }
        
        // Keep status as pending if CRM push fails - contact won't be lost
        
        // Generate error response for VoiceBot
        const voicebotResponse = await sendVoicebotWebhookResponse(contactInfo, 'error');
        
        res.json({
          success: false,
          extractedText: text,
          contact: contactInfo,
          voicebot_response: voicebotResponse,
          error: "CRM processing failed - contact saved for retry"
        });
        return;
      }

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

  // Emergency SMS/Slack Alert endpoint
  app.post("/api/alerts/emergency", async (req, res) => {
    try {
      const { type, message, severity } = req.body;
      
      const alertMessage = `🚨 YoBot Emergency Alert: ${message}`;
      
      // Send both Slack and SMS for maximum reliability
      const promises = [
        sendSlackAlert(alertMessage),
        sendEmergencyEscalation(type || 'system', message)
      ];
      
      const results = await Promise.allSettled(promises);
      
      res.json({
        success: true,
        slack: results[0].status === 'fulfilled',
        sms: results[1].status === 'fulfilled',
        message: 'Emergency alerts sent successfully'
      });

    } catch (error: any) {
      console.error('Emergency alert failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // PDF Report Generation endpoint
  app.post("/api/reports/pdf", async (req, res) => {
    try {
      const { html } = req.body;
      
      if (!html) {
        return res.status(400).json({ error: "HTML content is required" });
      }

      const pdfBuffer = await generatePDFReport(html);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="YoBot_Report.pdf"');
      res.send(pdfBuffer);

    } catch (error: any) {
      console.error('PDF generation failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // VoiceBot Trigger Webhook - Routes high-value voice events to backend ops
  app.post('/api/voice-trigger', async (req, res) => {
    try {
      const { user_id, intent, sentiment, confidence, source } = req.body;
      
      console.log(`[🎙️ VOICEBOT] Trigger received from ${user_id} — ${intent} (${sentiment})`);
      
      if (intent === 'cancel' && confidence >= 0.85) {
        // Critical escalation for cancel intent
        await sendEmergencyEscalation('call', {
          userId: user_id,
          reason: 'Customer expressed cancellation intent',
          confidence: confidence,
          source: source
        });
        
        // Send Slack alert
        await sendSlackAlert(`🚨 URGENT: Customer ${user_id} expressed cancellation intent (${confidence}% confidence)`);
        
        // Log to Airtable for tracking
        await logVoiceEscalation({ user_id, intent, sentiment, confidence, source });
      } 
      else if (sentiment === 'negative') {
        // Ops review for negative sentiment
        await sendSlackAlert(`⚠️ Negative sentiment detected for user ${user_id} - requires ops review`);
        
        // Log to Airtable for tracking
        await logVoiceEscalation({ user_id, intent, sentiment, confidence, source });
        
        // Log for follow-up
        await storage.createNotification({
          userId: parseInt(user_id) || 1,
          type: 'voice_escalation',
          title: 'Negative Sentiment Alert',
          message: `Voice interaction showed negative sentiment - source: ${source}`,
          priority: 'high',
          read: false
        });
      } 
      else if (intent === 'silent') {
        // Log warning for dead air
        console.log(`⚠️ Dead air detected for user ${user_id} - source: ${source}`);
        
        await storage.createNotification({
          userId: parseInt(user_id) || 1,
          type: 'system_warning',
          title: 'Dead Air Detected',
          message: `Extended silence in voice interaction - may need technical review`,
          priority: 'medium',
          read: false
        });
      }
      
      res.status(200).json({ status: 'trigger_processed', intent, sentiment });
    } catch (error) {
      console.error('Voice trigger processing error:', error);
      res.status(500).json({ error: 'Failed to process voice trigger' });
    }
  });

  // Admin-only route for super metrics
  app.get('/api/admin-stats', requireRole(['admin', 'dev']), async (req, res) => {
    res.json({ 
      secret: "🔥 Super metrics only admins see",
      totalUsers: 1247,
      revenue: "$156,789",
      systemLoad: "23%",
      uptime: "99.97%"
    });
  });

  // Test HubSpot CRM connection
  app.get("/api/test-crm", async (req, res) => {
    try {
      if (!process.env.HUBSPOT_API_KEY) {
        return res.status(400).json({ 
          error: "HubSpot API key not configured",
          message: "Please set HUBSPOT_API_KEY environment variable"
        });
      }

      // Test with sample contact data
      const testContact = {
        firstName: "Test",
        lastName: "Contact",
        email: "test@example.com",
        company: "Test Company"
      };

      await pushToCRM(testContact);
      
      res.json({
        success: true,
        message: "HubSpot CRM connection successful",
        testContact
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: "CRM connection failed",
        message: error.message 
      });
    }
  });

  // Retry queue endpoint for processing failed syncs
  app.post('/api/retry-queue', async (req, res) => {
    try {
      await runRetryQueue();
      res.json({ 
        success: true, 
        message: 'Retry queue processed successfully' 
      });
    } catch (error) {
      console.error('Retry queue processing failed:', error);
      res.status(500).json({ error: 'Failed to process retry queue' });
    }
  });

  // Debug route to check current user role
  app.get('/api/me', (req, res) => {
    res.json({ user: req.user || null });
  });

  // Google Calendar integration
  app.use('/api/calendar', calendarRouter);

  // AI Chat integration
  app.use('/api/ai', aiChatRouter);

  // RAG Knowledge Base integration
  app.use('/api/rag', ragUploadRouter);
  app.use('/api/rag', ragSearchRouter);

  // Form-to-Voice automation integration
  app.use('/api/form', formToVoiceRouter);

  // HubSpot CRM integration
  app.use('/api/hubspot', hubspotAuthRouter);

  // Voice Control integration
  app.use('/api/voice', voiceControlRouter);

  // PDF Quote generation
  app.use('/api/pdf', pdfQuoteRouter);

  // ElevenLabs text-to-speech
  app.use('/api/speak', speakRouter);

  // Airtable integration
  app.use('/api/airtable', airtableRouter);

  // Middleware to simulate logged-in admin user for demo
  app.use((req, res, next) => {
    if (!req.user) {
      req.user = { id: 1, role: 'admin', username: 'admin' };
    }
    next();
  });

  return httpServer;
}
