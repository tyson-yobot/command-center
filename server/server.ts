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

let airtableRouter: any;
let loggerWebhookRouter: any;
let featureRegistry: any;
let runFunction: any;

try {
  airtableRouter = (await import("./modules/airtable/airtableRouter")).default;
  console.log("Airtable router imported successfully");
} catch (error) {
  console.warn("⚠️ Could not load airtableRouter:", error);
  airtableRouter = express.Router();
}

try {
  loggerWebhookRouter = (await import("./routes/loggerWebhookRouter")).default;
  console.log("Logger webhook router imported successfully");
} catch (error) {
  console.warn("⚠️ Could not load loggerWebhookRouter:", error);
  loggerWebhookRouter = express.Router();
}

try {
  featureRegistry = (await import("./feature-registry")).featureRegistry;
  console.log("Feature registry imported successfully");
} catch (error) {
  console.warn("⚠️ Could not load featureRegistry:", error);
  featureRegistry = { status: "disabled" };
}

try {
  runFunction = (await import("../backend/utils/airtable/function_runner")).runFunction;
  console.log("Function runner imported successfully");
} catch (error) {
  console.warn("⚠️ Could not load runFunction:", error);
  runFunction = async () => {};
}

console.log("All imports successful, creating advanced server...");

async function main() {
  try {
    console.log("🚀 Starting advanced server...");

    const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
    let slackEventsAdapter: any = null;
    
    if (slackSigningSecret) {
      console.log("🔗 Initializing Slack Events Adapter...");
      slackEventsAdapter = createEventAdapter(slackSigningSecret);

      slackEventsAdapter.on("app_mention", async (event: any) => {
        console.log("🤖 Mentioned in Slack:", event.text);
        await runFunction("onSlackMention", event);
      });

      slackEventsAdapter.on("error", (error: Error) => {
        console.error("❌ Slack Event Error:", error);
      });
    } else {
      console.log("⚠️ No Slack signing secret found, skipping Slack Events Adapter");
    }

    const app = express();
    const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

    app.use(helmet());
    app.use(cors());
    app.use(express.json({ limit: "2mb" }));
    app.use(morgan("tiny"));

    app.get("/", (req: Request, res: Response) => {
      res.json({ message: "Advanced server is working!" });
    });

    app.get("/healthz", (req: Request, res: Response) => {
      res.json({ status: "ok", timestamp: new Date().toISOString() });
    });

    app.get("/api/feature-status", (req: Request, res: Response) => {
      res.json(featureRegistry);
    });

    app.post("/api/behavior-tuning", async (req: Request, res: Response) => {
      try {
        const result = await runFunction("updateBotBehavior");
        res.status(200).json({ success: true, result });
      } catch (err: any) {
        console.error("❌ updateBotBehavior failed:", err.message);
        res.status(500).json({ success: false, error: err.message });
      }
    });

    app.use("/api/airtable", airtableRouter);
    app.use("/api/logger", loggerWebhookRouter);
    app.use("/api/slack", (req: Request, res: Response, next: NextFunction) => {
      if (slackEventsAdapter) {
        return slackEventsAdapter.expressMiddleware()(req as any, res as any, next);
      } else {
        res.status(503).json({ error: "Slack Events Adapter not configured" });
      }
    });

    app.use((req: Request, res: Response) => {
      res.status(404).json({
        error: "Endpoint not found",
        path: req.originalUrl,
      });
    });

    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error("❌ Uncaught server error:", err);
      res.status(500).json({ error: err.message });
    });

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Advanced server running on port ${PORT}`);
      console.log(`🌐 Server accessible at: http://localhost:${PORT}`);
      console.log(`📋 Available endpoints:`);
      console.log(`   GET  /                    - Main route`);
      console.log(`   GET  /healthz             - Health check`);
      console.log(`   GET  /api/feature-status  - Feature status`);
      console.log(`   POST /api/airtable        - Airtable operations`);
      console.log(`   POST /api/logger          - Webhook logging`);
      console.log(`   POST /api/slack           - Slack events`);
    });
  } catch (error) {
    console.error("❌ Server startup error:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ Unhandled error in main:", error);
  process.exit(1);
});
