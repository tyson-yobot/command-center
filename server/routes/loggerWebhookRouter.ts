 
// ========================================================================
// loggerWebhookRouter.ts – Production‑Ready Logger Handler
// Fully Automated · Airtable + Slack Integration · Built to Scale
// ========================================================================

import express, { Request, Response } from 'express';
import { logToAirtable } from '../../backend/utils/airtable/logger.js';
import { postSlackAlert } from '../../client/src/hooks/utils/slackLogger';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    if (!payload || Object.keys(payload).length === 0) {
      return res.status(400).json({ error: 'Missing payload' });
    }

    // Sanitize and validate payload
    const cleanedPayload = Object.fromEntries(
      Object.entries(payload).filter(([_, value]) => value !== null && value !== undefined)
    );

    // Deduplication logic (based on timestamp + source + summary hash if needed)
    const dedupeKey = `${cleanedPayload?.timestamp || ''}_${cleanedPayload?.source || ''}_${cleanedPayload?.summary || ''}`;
    cleanedPayload['🧾 Dedupe Key'] = dedupeKey;

    // Add logger source if missing
    if (!cleanedPayload['🛡️ Logger Source']) {
      cleanedPayload['🛡️ Logger Source'] = 'loggerWebhookRouter';
    }

    // Add timestamp if missing
    if (!cleanedPayload['📅 Timestamp']) {
      cleanedPayload['📅 Timestamp'] = new Date().toISOString();
    }

    const airtableResponse = await logToAirtable(cleanedPayload);

    await postSlackAlert(`📥 Logger Webhook Received:
• Source: ${cleanedPayload['🛡️ Logger Source']}
• Type: ${cleanedPayload['🧪 Log Type'] || 'Unknown'}
• ID: ${airtableResponse?.id || 'n/a'}`);

    res.status(200).json({ message: 'Logger processed', airtableId: airtableResponse?.id });
  } catch (err) {
    console.error('❌ Logger webhook error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
