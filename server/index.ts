import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import orchestrator from "./systemAutomationOrchestrator";
import completeAutomation from "./completeSystemAutomation";
import documentRoutes from "./documentManager";
import { setupVite, serveStatic, log } from "./vite";
import { sendSlackAlert } from "./alerts";
import { generatePDFReport } from "./pdfReport";

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

(async () => {
  const server = await registerRoutes(app);

  // Register document management routes
  app.use('/api/documents', documentRoutes);
  
  // Register Batch 21 automation routes
  const { registerBatch21Routes } = await import('./automationBatch21');
  registerBatch21Routes(app);
  
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
