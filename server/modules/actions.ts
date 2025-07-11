// File: server/modules/actionsRouter.ts
// =============================================================================
//  YoBot® Command Center – Production‑ready Actions Router
//  -------------------------------------------------------
//  • Fully automated, no hard‑codes (reads base URL + token from env)
//  • Centralised Axios instance with timeout + auth header
//  • Lightweight retry (3 attempts, exponential back‑off)
//  • Dynamic route registration from single config map
//  • Typed logger integration (logInfo / logError)
//  • Health endpoint for container probes
// =============================================================================

import express, { Request, Response } from "express";
import axios, { AxiosError } from "axios";
import { logInfo, logError } from "../utils/logger";

// -----------------------------------------------------------------------------
//  Environment / Config
// -----------------------------------------------------------------------------
const YOBOT_API_BASE = process.env.YOBOT_API_BASE ?? "https://api.yobot.bot";
const YOBOT_API_TOKEN = process.env.YOBOT_API_TOKEN ?? ""; // optional – set in Render
const TIMEOUT_MS = Number(process.env.YOBOT_API_TIMEOUT ?? 5000);
const MAX_RETRIES = 3;

// -----------------------------------------------------------------------------
//  Axios helper with auth + timeout
// -----------------------------------------------------------------------------
const api = axios.create({
  baseURL: YOBOT_API_BASE,
  timeout: TIMEOUT_MS,
  headers: YOBOT_API_TOKEN ? { Authorization: `Bearer ${YOBOT_API_TOKEN}` } : {},
});

async function postWithRetry(path: string, label: string): Promise<{ status: number; data: unknown }> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { status, data } = await api.post(path);
      if (status === 200) return { status, data };
      throw new Error(`HTTP ${status}`);
    } catch (err) {
      const msg = (err as AxiosError).message;
      logError("actions", `${label}: attempt ${attempt} failed → ${msg}`);
      if (attempt === MAX_RETRIES) throw err;
      await new Promise(r => setTimeout(r, 300 * attempt)); // back‑off
    }
  }
  throw new Error("Unreachable");
}

// -----------------------------------------------------------------------------
//  Endpoint registry – add new actions here only
// -----------------------------------------------------------------------------
interface ActionDef { path: string; label: string; }
const ACTIONS: Record<string, ActionDef> = {
  "leads-follow-up": { path: "/leads/follow_up", label: "Lead follow‑up" },
  "contacts-archive-old": { path: "/contacts/archive_old", label: "Archive old contacts" },
  "cart-abandoned": { path: "/cart/log_abandoned", label: "Log abandoned cart" },
  "deploy-version": { path: "/deploy/version", label: "Deploy new bot version" },
  "feedback-request": { path: "/feedback/request", label: "Trigger feedback request" },
  "contacts-flag-unresponsive": { path: "/contacts/flag_unresponsive", label: "Flag unresponsive contacts" },
  "safety-onsite-review": { path: "/safety/onsite_review", label: "On‑site safety review" },
  "system-cleanup-demo": { path: "/system/cleanup_demo", label: "Cleanup demo data" },
  "email-training-invite": { path: "/email/training_invite", label: "Send training invite email" },
  "security-lock-gateway": { path: "/security/lock_gateway", label: "Lock payment gateway" },
};

// -----------------------------------------------------------------------------
//  Express Router setup
// -----------------------------------------------------------------------------
const router = express.Router();
router.use(express.json());

Object.entries(ACTIONS).forEach(([slug, { path, label }]) => {
  router.post(`/v1/${slug}`, async (_req: Request, res: Response) => {
    try {
      const { status, data } = await postWithRetry(path, label);
      logInfo("actions", `${label}: ✅`);
      res.status(status).json({ success: true, data });
    } catch (err: unknown) {
      const msg = (err as Error).message;
      logError("actions", `${label}: ❌ ${msg}`);
      res.status(500).json({ success: false, error: msg });
    }
  });
});

// Health check – for Render / Docker probe
router.get("/healthz", (_req: Request, res: Response<{ status: string }>) => {
  res.json({ status: "ok" });
});

export default router;
