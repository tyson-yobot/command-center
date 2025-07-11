// ========================================================================
// server.ts – PRODUCTION VERSION
// Fully Wired · Airtable/Slack/Functions Integrated · Built to Scale
// ========================================================================
import * as express from "express";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import * as cors from "cors";
const morgan = require("morgan");
const slackEvents = require("@slack/events-api");
import path from "path";
import { fileURLToPath } from "url";

// Convert import.meta.url to __dirname for ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import airtableRouter from "./modules/airtable/airtableRouter.js";
import loggerWebhookRouter from "./routes/loggerWebhookRouter.js";
import { featureRegistry } from "./feature-registry.js";
import { runFunction } from "../backend/utils/airtable/function_runner.js"; 
async function main() {
  try {
// ── ENV + Slack Setup ─────────────────────────────────────────────
dotenv.config();
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET || "";
const slackEventsAdapter = slackEvents.createEventAdapter(slackSigningSecret);
// ...existing code...

slackEventsAdapter.on("app_mention", async (event: any) => {
  console.log("🤖 Mentioned in Slack:", event.text);
  await runFunction("onSlackMention", event); // New Slack hook
});

slackEventsAdapter.on("error", (error: Error) => {
  console.error("❌ Slack Event Error:", error);
});

// ── Express App ───────────────────────────────────────────────────
const app = (express as any)();
// ...existing code...
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(helmet());
app.use((cors as any)());
app.use((express as any).json({ limit: "2mb" }));
app.use((morgan as any)("tiny"));

// ...existing code...

// ── Routes ────────────────────────────────────────────────────────
app.get("/healthz", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.get("/api/feature-status", (_req: Request, res: Response) => {
  res.json(featureRegistry);
});

app.use("/api/airtable", airtableRouter);
app.use("/api/logger", loggerWebhookRouter);
app.use("/api/slack", (req: Request, res: Response, next: NextFunction) => {
  return slackEventsAdapter.expressMiddleware()(req as any, res as any, next);
});

// ── Start Server ──────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

  } catch (error) {
    console.error("❌ Server startup error:", error);
    process.exit(1);
  }
}

main();

