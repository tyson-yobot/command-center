// Suppress browserslist warning
process.env.BROWSERSLIST_IGNORE_OLD_DATA = 'true';

import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      console.log(
        `${new Date().toLocaleTimeString()} [express] ${req.method} ${path} ${res.statusCode} in ${duration}ms`,
        res.statusCode < 400
          ? capturedJsonResponse
            ? `:: ${JSON.stringify(capturedJsonResponse).substring(0, 80)}...`
            : ""
          : "",
      );
    }
  });

  next();
});

(async () => {
  // Register all API routes
  registerRoutes(app);
  
  // Create HTTP server
  const server = createServer(app);
  
  // Setup Vite for development
  await setupVite(app, server);
  
  serveStatic(app);

  const PORT = 5000;
  server.listen(PORT, "0.0.0.0", () => {
    log(`serving on port ${PORT}`);
  });
})();