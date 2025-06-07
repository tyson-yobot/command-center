import type { Express } from "express";
import { createServer, type Server } from "http";
import { registerProductionSalesOrder } from "./productionSalesOrder";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register ONLY the production sales order webhook
  registerProductionSalesOrder(app);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}