import "dotenv/config";               // Loads .env in dev – Render injects vars
import express from "express";
import http from "http";

import { setupVite, serveStatic, log } from "./vite";
import airtableRouter from "./modules/airtable/airtableRouter";
import actionsRouter from "./modules/actionsRouter";

const NODE_ENV = process.env.NODE_ENV ?? "development";
const PORT = Number(process.env.PORT ?? 3000);

const app = express();
app.use(express.json());

// -----------------------
// Mount API Routers
// -----------------------
app.use("/api/airtable", airtableRouter);
app.use("/api/actions", actionsRouter);

const server = http.createServer(app);

async function startServer() {
  try {
    if (NODE_ENV === "development") {
      await setupVite(app, server);
      log("⚡ Vite middleware active (DEV)");
    } else {
      serveStatic(app);
      log("📦 Serving bundled files (PROD)");
    }

    server.listen(PORT, () => {
      log(`🚀 YoBot® Command Center listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    log(`❌ Startup error: ${(err as Error).message}`, "startup");
    process.exit(1);
  }
}

startServer();
