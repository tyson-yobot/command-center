// /modules/actionsRouter.js – YoBot® Automation API gateway
// -----------------------------------------------------------------------------
// All endpoints in this router are called by the front‑end Command Center UI.
// They proxy or orchestrate calls to Airtable, Slack, and first‑party YoBot
// micro‑services so that the browser never needs to know any credentials.
// -----------------------------------------------------------------------------
import express from 'express';
import fetch from 'node-fetch';
import { z } from 'zod';
import {
  function_initiate_lead_follow_up,
  function_archive_old_contacts,
  function_log_abandoned_cart,
  function_deploy_new_bot_version,
  function_trigger_feedback_request,
  function_flag_unresponsive_contacts,
  function_initiate_onsite_safety_review,
  function_cleanup_demo_data,
  function_trigger_user_training_email,
  function_lock_payment_gateway,
} from '../utils/function_library.js';

const router = express.Router();

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------
/**
 * Wrap async route handlers so that re‑thrown errors always reach the global
 * Express error‑handler instead of crashing the process.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Resolve the YoBot® internal API base URL from the environment (Render sets
 * VITE_API_URL in `build` and the plain `API_URL` at runtime in their Docker
 * container). Falls back to localhost for local development.
 */
const API_BASE =
  process.env.API_URL || process.env.VITE_API_URL || 'http://localhost:8787';

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

// -----------------------------------------------------------------------------
// Routes – keep these alphabetically sorted for sanity
// -----------------------------------------------------------------------------

// === /api/actions/generate‑quote ---------------------------------------------
router.post(
  '/generate-quote',
  asyncHandler(async (req, res) => {
    const body = CreateSOBody.parse(req.body);

    const yoRes = await fetch(`${API_BASE}/quote/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!yoRes.ok) {
      const text = await yoRes.text();
      return res.status(yoRes.status).json({ error: text });
    }

    const { recordId } = await yoRes.json();
    return res.json({ recordId });
  })
);

// === /api/actions/quote‑status/:recordId -------------------------------------
router.get(
  '/quote-status/:recordId',
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

// === /api/actions/service‑catalog -------------------------------------------
router.get(
  '/service-catalog',
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

// === /api/actions/automation -------------------------------------------------
// These thin wrappers expose the Python automation functions to the UI.
router.post('/automation/lead-follow-up', asyncHandler(async (_req, res) => {
  const ok = await function_initiate_lead_follow_up();
  res.json({ ok });
}));

router.post('/automation/archive-old-contacts', asyncHandler(async (_req, res) => {
  const ok = await function_archive_old_contacts();
  res.json({ ok });
}));

router.post('/automation/abandoned-cart', asyncHandler(async (_req, res) => {
  const ok = await function_log_abandoned_cart();
  res.json({ ok });
}));

router.post('/automation/deploy-bot', asyncHandler(async (_req, res) => {
  const ok = await function_deploy_new_bot_version();
  res.json({ ok });
}));

router.post('/automation/feedback-request', asyncHandler(async (_req, res) => {
  const ok = await function_trigger_feedback_request();
  res.json({ ok });
}));

router.post('/automation/flag-unresponsive', asyncHandler(async (_req, res) => {
  const ok = await function_flag_unresponsive_contacts();
  res.json({ ok });
}));

router.post('/automation/safety-review', asyncHandler(async (_req, res) => {
  const ok = await function_initiate_onsite_safety_review();
  res.json({ ok });
}));

router.post('/automation/cleanup-demo', asyncHandler(async (_req, res) => {
  const ok = await function_cleanup_demo_data();
  res.json({ ok });
}));

router.post('/automation/training-email', asyncHandler(async (_req, res) => {
  const ok = await function_trigger_user_training_email();
  res.json({ ok });
}));

router.post('/automation/lock-gateway', asyncHandler(async (_req, res) => {
  const ok = await function_lock_payment_gateway();
  res.json({ ok });
}));

// -----------------------------------------------------------------------------
export default router;
