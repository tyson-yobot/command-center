// server/index.ts
import express from "express";
import http from "http";
import { setupVite, serveStatic, log } from "./vite";
import airtableRouter from "./modules/airtable/airtable";
app.use("/api/airtable", airtableRouter);


const app = express();
const server = http.createServer(app);

async function startServer() {
  const PORT = process.env.PORT || 3000;

  try {
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
      log("✅ Vite middleware active (DEV mode)");
    } else {
      serveStatic(app);
      log("✅ Serving static files (PROD mode)");
    }

    server.listen(PORT, () => {
      log(`🚀 YoBot® Command Center running at http://localhost:${PORT}`);
    });
  } catch (err) {
    log(`❌ Startup error: ${(err as Error).message}`, "startup");
    process.exit(1);
  }
}

startServer();
