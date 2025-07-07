// src/utils/airtableConfig.ts
// Production‑ready, type‑safe Airtable + Slack helpers.
// ───────────────────────────────────────────────────
import Airtable, {
  Base as AirtableBase,
  Table as AirtableTable,
  FieldSet,
  Record as AirtableRecord,
} from "airtable";
import { WebClient } from "@slack/web-api";

/*──────────────── ENV ────────────────*/
const {
  AIRTABLE_API_KEY,
  SLACK_BOT_TOKEN,
  SLACK_ALERTS_CHANNEL = "#general",
} = import.meta.env as ImportMetaEnv;
if (!AIRTABLE_API_KEY) throw new Error("AIRTABLE_API_KEY missing");
if (!SLACK_BOT_TOKEN) throw new Error("SLACK_BOT_TOKEN missing");

/*──────────────── Feature map ────────────────*/
export type FeatureKey =
  | "smartspend"
  | "botalytics"
  | "command-center"
  | "integration-test"
  | "error-fallback"
  | "event-sync"
  | "support-ticket-log"
  | "quote-generator"
  | "invoice-tracking"
  | "support-ticket-summary"
  | "call-log"
  | "qa-review"
  | "call-sentiment"
  | "client-touchpoint"
  | "missed-call";

interface FeatureConfig {
  base: string;
  table: string;
  view?: string;
}

export const airtableConfig: Record<FeatureKey, FeatureConfig> = {
  smartspend: { base: "appCoAtCZdARb4AM2", table: "SmartSpend™ - Slack Logs Table" },
  botalytics: { base: "appe0OSJtB1In1kn5", table: "Botalytics Monthly Log Table" },
  "command-center": { base: "appRt8V3tH4g5Z51f", table: "Command Center - Metrics Tracker Table" },
  "integration-test": { base: "appRt8V3tH4g5Z51f", table: "Integration Test Log Table" },
  "error-fallback": { base: "appCoAtCZdARb4AM2", table: "Error + Fallback Log Table" },
  "event-sync": { base: "appCoAtCZdARb4AM2", table: "Event Sync Log Table" },
  "support-ticket-log": { base: "appCoAtCZdARb4AM2", table: "Support Ticket Log Table" },
  "quote-generator": { base: "appMbVQJ0n3nlR1lN", table: "Quote Generator Logs Table" },
  "invoice-tracking": { base: "appMbVQJ0n3nlR1lN", table: "Invoice Tracking Table" },
  "support-ticket-summary": { base: "appMbVQJ0n3nlR1lN", table: "Support Ticket Summary Table" },
  "call-log": { base: "appe0OSJtB1In1kn5", table: "Voice Call Log Table" },
  "qa-review": { base: "appe0OSJtB1In1kn5", table: "QA Call Review Log Table" },
  "call-sentiment": { base: "appe0OSJtB1In1kn5", table: "Call Sentiment Log Table" },
  "client-touchpoint": { base: "appe0OSJtB1In1kn5", table: "Client Touchpoint Log Table" },
  "missed-call": { base: "appe0OSJtB1In1kn5", table: "Missed Call Log Table" },
};

/*──────────────── Airtable base cache ────────────────*/
const baseCache: Record<string, AirtableBase> = {};
const getBase = (baseId: string): AirtableBase => {
  if (!baseCache[baseId]) {
    baseCache[baseId] = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(baseId);
  }
  return baseCache[baseId];
};

export const getTable = <Schema extends FieldSet = FieldSet>(
  feature: FeatureKey
): AirtableTable<Schema> => {
  const cfg = airtableConfig[feature];
  if (!cfg) throw new Error(`Unknown Airtable feature key → ${feature}`);
  return getBase(cfg.base)<Schema>(cfg.table);
};

/*──────────────── CRUD helpers (typed) ────────────────*/
export const listRecords = async <Schema extends FieldSet = FieldSet>(
  feature: FeatureKey,
  params: Airtable.SelectOptions<Schema> = {}
): Promise<(Schema & { id: string })[]> => {
  const tbl = getTable<Schema>(feature);
  const recs = (await tbl.select(params).all()) as AirtableRecord<Schema>[];
  return recs.map((r) => ({ id: r.id, ...r.fields }));
};

export const createRecord = async <Schema extends FieldSet = FieldSet>(
  feature: FeatureKey,
  fields: Schema
): Promise<string> => {
  const tbl = getTable<Schema>(feature);
  const rec = (await tbl.create(fields as any)) as AirtableRecord<Schema>;
  return rec.id;
};

export const updateRecord = async <Schema extends FieldSet = FieldSet>(
  feature: FeatureKey,
  id: string,
  fields: Partial<Schema>
): Promise<void> => {
  const tbl = getTable<Schema>(feature);
  await tbl.update(id, fields as any);
};

export const deleteRecord = async (
  feature: FeatureKey,
  id: string
): Promise<void> => {
  const tbl = getTable(feature);
  await tbl.destroy(id);
};

/*──────────────── Slack helpers ────────────────*/
const slack = new WebClient(SLACK_BOT_TOKEN);

export const slackNotify = async (
  message: string,
  channel: string = SLACK_ALERTS_CHANNEL
): Promise<void> => {
  await slack.chat.postMessage({ channel, text: message });
};

export const logError = async (
  source: FeatureKey,
  error: Error | string,
  context: Record<string, any> = {}
): Promise<void> => {
  try {
    await createRecord("error-fallback", {
      "🕑 Timestamp": new Date().toISOString(),
      "🔧 Source": source,
      "❌ Error": error instanceof Error ? error.message : error,
      ...context,
    });
  } finally {
    await slackNotify(`🚨 ${source} error → ${error.toString()}`);
  }
};



#vite.config.ts

// -----------------------------------------------------------------------------
// 📦 vite.config.ts — Full YoBot® Build Config (Unshrunk)
// -----------------------------------------------------------------------------

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";
import path from 'path';

// -----------------------------------------------------------------------------

export default defineConfig({
  plugins: [
    react(),

    tsconfigPaths(), // ✅ Auto resolves tsconfig.json path aliases (e.g. @/lib/utils)

    // 🧩 Add other plugins below when needed (SVG loader, ESLint, etc.)
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "../shared"),
      "@assets": path.resolve(__dirname, "../attached_assets"),
    },
  },

  root: path.resolve(__dirname), // 🔁 Project root (where index.html lives)

  build: {
    outDir: path.resolve(__dirname, "../dist/public"),
    emptyOutDir: true,
  },
});
