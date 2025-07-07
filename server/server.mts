import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { createEventAdapter } from '@slack/events-api';

import actionsRouter from './modules/actionsRouter.js';
import airtableRouter from './modules/airtableRouter.js';

// ---------------------------------------------------------------------
//  YoBot® server – production‑ready Express API
// ---------------------------------------------------------------------

dotenv.config();

const slackSigningSecret = process.env.SLACK_SIGNING_SECRET || '';
const slackEvents = createEventAdapter(slackSigningSecret);

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// --- Middleware ------------------------------------------------------
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('tiny'));

// --- Routes ----------------------------------------------------------
app.get('/healthz', (req: Request, res: Response): void => {
  res.json({ status: 'ok' });
});

app.use('/api/actions', actionsRouter);
app.use('/api/airtable', airtableRouter);
app.use('/api/slack', slackEvents.expressMiddleware());

// --- 404 Handler -----------------------------------------------------
app.use((req: Request, res: Response): void => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
  });
});

// --- Error Handler ---------------------------------------------------
app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

// --- Boot ------------------------------------------------------------
app.listen(PORT, (): void => {
  console.log(`✅ YoBot® server running at http://localhost:${PORT}`);
});
