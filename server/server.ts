console.log("Starting basic test...");

import express, { Request, Response, NextFunction } from "express";
console.log("Express imported successfully");

import 'dotenv/config';
console.log("Dotenv imported successfully");

import helmet from "helmet";
console.log("Helmet imported successfully");

import cors from "cors";
console.log("Cors imported successfully");

import morgan from "morgan";
console.log("Morgan imported successfully");

import { createEventAdapter } from "@slack/events-api";
console.log("Slack Events API imported successfully");

// Advanced imports with error handling
let airtableRouter: any;
let loggerWebhookRouter: any;
let featureRegistry: any;
let runFunction: any;

try {
  airtableRouter = require("./modules/airtable/airtableRouter");
  console.log("Airtable router imported successfully");
} catch (error) {
  console.warn("⚠️  Could not load airtableRouter:", error);
  airtableRouter = express.Router();
}

try {
  loggerWebhookRouter = require("./routes/loggerWebhookRouter");
  console.log("Logger webhook router imported successfully");
} catch (error) {
  console.warn("⚠️  Could not load loggerWebhookRouter:", error);
  loggerWebhookRouter = express.Router();
}

try {
  featureRegistry = require("./feature-registry").featureRegistry;
  console.log("Feature registry imported successfully");
} catch (error) {
  console.warn("⚠️  Could not load featureRegistry:", error);
  featureRegistry = { status: "disabled" };
}

try {
  runFunction = require("../backend/utils/airtable/function_runner").runFunction;
  console.log("Function runner imported successfully");
} catch (error) {
  console.warn("⚠️  Could not load runFunction:", error);
  runFunction = async () => {};
}

console.log("All imports successful, creating advanced server...");

async function main() {
  try {
    console.log("🚀 Starting advanced server...");

    // Slack Events Setup
    const slackSigningSecret = process.env.SLACK_SIGNING_SECRET || "";
    const slackEventsAdapter = createEventAdapter(slackSigningSecret);

    slackEventsAdapter.on("app_mention", async (event: any) => {
      console.log("🤖 Mentioned in Slack:", event.text);
      await runFunction("onSlackMention", event);
    });

    slackEventsAdapter.on("error", (error: Error) => {
      console.error("❌ Slack Event Error:", error);
    });

    // Express App Setup
    const app = express();
    const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

    // Add middleware
    app.use(helmet());
    app.use(cors());
    app.use(express.json({ limit: "2mb" }));
    app.use(morgan("tiny"));

    // Basic Routes
    app.get("/", (req: Request, res: Response) => {
      res.json({ message: "Advanced server is working!" });
    });

    // ✅ Behavior tuning endpoint (full automation)
app.post("/api/behavior-tuning", async (req: Request, res: Response) => {
  try {
    const result = await runFunction("updateBotBehavior");
    res.status(200).json({ success: true, result });
  } catch (err: any) {
    console.error("❌ updateBotBehavior failed:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

    app.get("/healthz", (req: Request, res: Response) => {
      res.json({ status: "ok", timestamp: new Date().toISOString() });
    });

    // API Routes
    app.get("/api/feature-status", (req: Request, res: Response) => {
      res.json(featureRegistry);
    });

    app.use("/api/airtable", airtableRouter);
    app.use("/api/logger", loggerWebhookRouter);
    app.use("/api/slack", (req: Request, res: Response, next: NextFunction) => {
      return slackEventsAdapter.expressMiddleware()(req as any, res as any, next);
    });

    // 404 handler
    app.use((req: Request, res: Response) => {
      res.status(404).json({
        error: "Endpoint not found",
        path: req.originalUrl,
      });
    });

    // Global error handler
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error("❌ Uncaught server error:", err);
      res.status(500).json({ error: err.message });
    });

    app.listen(PORT, () => {
      console.log(`🚀 Advanced server running on port ${PORT}`);
      console.log(`📋 Available endpoints:`);
      console.log(`   GET  /              - Main route`);
      console.log(`   GET  /healthz       - Health check`);
      console.log(`   GET  /api/feature-status - Feature status`);
      console.log(`   POST /api/airtable  - Airtable operations`);
      console.log(`   POST /api/logger    - Webhook logging`);
      console.log(`   POST /api/slack     - Slack events`);
    });
  } catch (error) {
    console.error("❌ Server startup error:", error);
    console.error("❌ Error details:", (error as Error).message);
    console.error("❌ Stack trace:", (error as Error).stack);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ Unhandled error in main:", error);
  process.exit(1);
});