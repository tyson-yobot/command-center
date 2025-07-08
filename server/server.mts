// ========================================================================
// server.mts – PRODUCTION VERSION
// Fully Wired · Airtable/Slack/Functions Integrated · Built to Scale
// ========================================================================

import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { createEventAdapter } from "@slack/events-api";
import path from "path";
import { fileURLToPath } from "url";

// Convert import.meta.url to __dirname for ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import airtableRouter from "./modules/airtable/airtableRouter.js";
import loggerWebhookRouter from "./routes/loggerWebhookRouter.js";
import { featureRegistry } from "./feature-registry.js";
import { runFunction } from "../backend/utils/airtable/function_runner.js";
import { runFunction } from "../backend/utils/airtable/function_runner.js"; // 🔁 Fully integrated runner

// ── ENV + Slack Setup ─────────────────────────────────────────────
dotenv.config();
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET || "";
const slackEvents = createEventAdapter(slackSigningSecret);

slackEvents.on("app_mention", async (event) => {
  console.log("🤖 Mentioned in Slack:", event.text);
  await runFunction("onSlackMention", event); // New Slack hook
});

slackEvents.on("error", (error) => {
  console.error("❌ Slack Event Error:", error);
});

// ── Express App ───────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(morgan("tiny"));

// ── Routes ────────────────────────────────────────────────────────
app.get("/healthz", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.get("/api/feature-status", (_req: Request, res: Response) => {
  res.json(featureRegistry);
});

app.use("/api/airtable", airtableRouter);
app.use("/api/logger", loggerWebhookRouter);
app.use("/api/slack", (req, res, next) => slackEvents.expressMiddleware()(req as any, res as any, next));

// ── 404 Handler ───────────────────────────────────────────────────
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.originalUrl,
  });
});

// ── Global Error Handler ──────────────────────────────────────────
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error("❌ Uncaught server error:", err);
  res.status(500).json({ error: err.message });
});

// ── Start Server ──────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ YoBot® server running at http://localhost:${PORT}`);
});
