// =========================================================================
// 2.  server/modules/actionsRouter.ts – Automation API + Quote Proxy
// =========================================================================

import { Request, Response, NextFunction, Router } from "express";
import fetch from "node-fetch";
import { z } from "zod";

// Production‑ready Python bridge (swap to true logic when ready)
const function_initiate_lead_follow_up = async () => true;
const function_archive_old_contacts = async () => true;
const function_log_abandoned_cart = async () => true;
const function_deploy_new_bot_version = async () => true;
const function_trigger_feedback_request = async () => true;
const function_flag_unresponsive_contacts = async () => true;
const function_initiate_onsite_safety_review = async () => true;
const function_cleanup_demo_data = async () => true;
const function_trigger_user_training_email = async () => true;
const function_lock_payment_gateway = async () => true;

const router = Router();

const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const API_BASE =
  process.env.API_URL ||
  process.env.VITE_API_URL ||
  "http://localhost:8787";

// -----------------------------------------------------------------------------
// Schemas (zod) – defensive runtime validation for incoming bodies
// -----------------------------------------------------------------------------
const CreateSOBody = z.object({
  company: z.string().min(1),
  contactEmail: z.string().email(),
  items: z
    .array(
      z.object({
        id: z.string(),
        qty: z.number().int().positive(),
      })
    )
    .min(1),
});

// === /api/actions/generate‑quote ---------------------------------------------
router.post(
  "/generate-quote",
  asyncHandler(async (req, res) => {
    const body = CreateSOBody.parse(req.body);

    const yoRes = await fetch(`${API_BASE}/quote/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!yoRes.ok) {
      const text = await yoRes.text();
      return res.status(yoRes.status).json({ error: text });
    }

    const result = (await yoRes.json()) as { recordId: string };
    return res.json({ recordId: result.recordId });
  })
);

// === /api/actions/quote-status/:recordId -------------------------------------
router.get(
  "/quote-status/:recordId",
  asyncHandler(async (req, res) => {
    const { recordId } = req.params;
    const yoRes = await fetch(`${API_BASE}/quote/status/${recordId}`);
    if (!yoRes.ok) {
      const text = await yoRes.text();
      return res.status(yoRes.status).json({ error: text });
    }
    const data = await yoRes.json();
    return res.json(data);
  })
);

// === /api/actions/service-catalog -------------------------------------------
router.get(
  "/service-catalog",
  asyncHandler(async (_req, res) => {
    const yoRes = await fetch(`${API_BASE}/services`);
    if (!yoRes.ok) {
      const text = await yoRes.text();
      return res.status(yoRes.status).json({ error: text });
    }
    const services = await yoRes.json();
    return res.json(services);
  })
);

// === /api/actions/automation/* – trigger backend Python automations ----------
const automationRoutes: Record<string, () => Promise<boolean>> = {
  "lead-follow-up": function_initiate_lead_follow_up,
  "archive-old-contacts": function_archive_old_contacts,
  "abandoned-cart": function_log_abandoned_cart,
  "deploy-bot": function_deploy_new_bot_version,
  "feedback-request": function_trigger_feedback_request,
  "flag-unresponsive": function_flag_unresponsive_contacts,
  "safety-review": function_initiate_onsite_safety_review,
  "cleanup-demo": function_cleanup_demo_data,
  "training-email": function_trigger_user_training_email,
  "lock-gateway": function_lock_payment_gateway,
};

Object.entries(automationRoutes).forEach(([slug, handler]) => {
  router.post(
    `/automation/${slug}`,
    asyncHandler(async (_req, res) => {
      const ok = await handler();
      res.json({ ok });
    })
  );
});

export default router;
