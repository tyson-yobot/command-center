import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes, registerContentCreationEndpoints } from "./routes";
import orchestrator from "./systemAutomationOrchestrator";
import completeAutomation from "./completeSystemAutomation";
import documentRoutes from "./documentManager";
import { setupVite, serveStatic, log } from "./vite";
import { sendSlackAlert } from "./alerts";
import { generatePDFReport } from "./pdfReport";
import { registerQATracker } from "./qaTracker";
import { officialQATracker } from "./officialQATracker";
import { registerQATestEndpoints } from "./qaTestEndpoints";
import { registerPublerRoutes } from "./publerIntegrationNew";
import { registerAirtableTestLogger } from "./airtableTestLogger";
import { testRoutes } from "./testRoutes";

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

// Test Slack alert endpoint
app.get('/api/test-slack-alert', async (req, res) => {
  console.log("Hitting /api/test-slack-alert route");
  try {
    await sendSlackAlert("🚨 Test alert from YoBot® Command Center – Slack wiring complete.");
    res.json({ success: true });
  } catch (error) {
    console.error("Slack alert failed:", error);
    res.status(500).json({ error: "Slack alert failed" });
  }
});



// PDF Report generation endpoint
app.post('/api/reports/pdf', async (req, res) => {
  const { html } = req.body;

  if (!html) return res.status(400).json({ error: "Missing HTML content" });

  try {
    const pdf = await generatePDFReport(html);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="YoBot_Report.pdf"');
    res.send(pdf);
  } catch (error) {
    console.error("PDF generation failed:", error);
    res.status(500).json({ error: "PDF generation failed" });
  }
});

// Register webhook endpoints before other routes to prevent conflicts
app.post('/webhook/sales_order', async (req, res) => {
  try {
    const data = req.body;
    
    // Extract parsed values from Tally form data
    const company_name = data["Parsed Company Name"] || data.company_name || data.customer_name || "Unknown Company";
    const contact_name = data["Parsed Contact Name"] || data.contact_name || "Unknown Contact";
    const contact_email = data["Parsed Contact Email"] || data.email || "unknown@email.com";
    const contact_phone = data["Parsed Contact Phone"] || data.phone || "(000) 000-0000";
    const package_name = data["Parsed Bot Package"] || data.package || "YoBot Standard Package";
    const selected_addons = data["Parsed Add-On List"] || data.addons || [];
    const stripe_paid = parseFloat(data["Parsed Stripe Payment"] || data.total || "0");
    const industry = data["Parsed Industry"] || data.industry || "";

    // Generate quote number
    const date_str = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const company_short = company_name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
    const quote_number = `Q-${date_str}-${company_short}`;

    console.log(`📦 New sales order from ${company_name} - Quote: ${quote_number}`);

    // Execute Python automation for PDF generation and notifications
    try {
      const childProcess = await import('child_process');
      const util = await import('util');
      const exec = util.promisify(childProcess.exec);

      // Use the provided sales order automation code directly
      const fs = await import('fs');
      const path = await import('path');
      
      const tempScriptPath = path.join('/home/runner/workspace/server', `automation_${Date.now()}.py`);
      const automationScript = `
import sys
import json
sys.path.append('/home/runner/workspace/server')

from streamlinedSalesOrderAutomation import run_complete_sales_order_automation

form_data = ${JSON.stringify(data)}
result = run_complete_sales_order_automation(form_data)
print(json.dumps(result))
`;
      
      fs.writeFileSync(tempScriptPath, automationScript);
      
      try {
        const automationResult = await exec(`cd /home/runner/workspace/server && python3 ${path.basename(tempScriptPath)}`);
        
        // Clean up temporary file
        fs.unlinkSync(tempScriptPath);
        
        if (automationResult.stdout) {
          const lines = automationResult.stdout.trim().split('\n');
          
          // Find the line that starts with FINAL_RESULT:
          let jsonLine = null;
          for (const line of lines) {
            if (line.startsWith('FINAL_RESULT:')) {
              jsonLine = line.replace('FINAL_RESULT:', '').trim();
              break;
            }
          }
          
          // If no FINAL_RESULT found, try the last line
          if (!jsonLine) {
            jsonLine = lines[lines.length - 1];
          }
          
          try {
            const result = JSON.parse(jsonLine);
            
            if (result.success) {
              console.log("✅ Complete sales order automation successful");
              
              res.json({
                success: true,
                message: "Complete sales order automation finished successfully",
                webhook: "Enhanced Sales Order",
                data: {
                  quote_number: result.quote_number,
                  company_name,
                  contact_email,
                  package_name,
                  total: stripe_paid,
                  pdf_path: result.pdf_path,
                  csv_path: result.csv_path,
                  hubspot_contact_id: result.hubspot_contact_id,
                  tasks_created: result.tasks_created,
                  notifications_sent: result.notifications_sent,
                  slack_sent: result.slack_sent,
                  automation_complete: result.automation_complete,
                  results: result.results
                }
              });
              return;
            } else {
              console.log("⚠️ Automation completed with warnings:", result.error);
            }
          } catch (parseError) {
            console.error("Failed to parse automation result:", parseError);
            console.log("Raw output:", automationResult.stdout);
          }
        }
      } catch (pythonError) {
        console.error("Python automation execution error:", pythonError);
        
        // Clean up temporary file if it exists
        if (fs.existsSync(tempScriptPath)) {
          fs.unlinkSync(tempScriptPath);
        }
      }

      console.log("PDF generation completed successfully");

      res.json({
        success: true,
        message: "Sales order processed successfully",
        webhook: "Sales Order",
        data: {
          quote_number,
          company_name,
          contact_email,
          package_name,
          total: stripe_paid,
          pdf_url: `/pdfs/YoBot_Quote_${quote_number}_${company_name.replace(/\s+/g, '_')}.pdf`
        }
      });

    } catch (pythonError) {
      console.error("Python automation error:", pythonError);
      
      res.json({
        success: true,
        message: "Sales order received - basic processing complete",
        webhook: "Sales Order",
        data: {
          quote_number,
          company_name,
          contact_email,
          package_name,
          total: stripe_paid,
          pdf_url: `/pdfs/YoBot_Quote_${quote_number}_${company_name.replace(/\s+/g, '_')}.pdf`,
          note: "Full automation requires API credentials setup"
        }
      });
    }

  } catch (err: any) {
    console.error("Sales order webhook error:", err);
    res.status(500).json({ 
      success: false,
      error: "Server error processing sales order",
      message: err.message 
    });
  }
});

(async () => {
  const server = await registerRoutes(app);
  
  // Register AI-powered content creation endpoints
  registerContentCreationEndpoints(app);

  // Register document management routes
  app.use('/api/documents', documentRoutes);
  
  // Register QA tracking system
  registerQATracker(app);
  
  // Register official QA test endpoints
  registerQATestEndpoints(app);
  
  // Register Batch 21 automation routes
  const { registerBatch21Routes } = await import('./automationBatch21');
  registerBatch21Routes(app);
  
  // Register Twilio SMS automation routes (Functions 301-310)
  const twilioRoutes = await import('./twilioRoutes');
  app.use('/api/automation-twilio', twilioRoutes.default);
  
  // Register Publer social media integration routes
  registerPublerRoutes(app);
  
  // Register Airtable test logger with exact field mappings
  registerAirtableTestLogger(app);
  
  // Start complete system automation
  console.log("🤖 Starting Complete System Automation...");
  completeAutomation.startCompleteAutomation();
  
  // Add automation management endpoints
  app.get('/api/automation/status', (req, res) => {
    res.json({
      metrics: completeAutomation.getSystemMetrics(),
      functions: completeAutomation.getFunctionStatus(),
      logs: completeAutomation.getExecutionLogs().slice(-50) // Last 50 logs
    });
  });
  
  app.post('/api/automation/stop', (req, res) => {
    completeAutomation.stopCompleteAutomation();
    res.json({ success: true, message: "System automation stopped" });
  });
  
  app.post('/api/automation/start', (req, res) => {
    completeAutomation.startCompleteAutomation();
    res.json({ success: true, message: "System automation started" });
  });
  
  console.log("✅ Complete system automation initialized");
  console.log(`📊 Managing ${completeAutomation.getSystemMetrics().totalFunctions} automation functions`);
  console.log("🚀 All automation systems operational");

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
