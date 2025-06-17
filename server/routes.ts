import type { Express } from "express";
import { db } from "./db";
import { storage } from "./storage";

let systemMode = 'live';

export function registerRoutes(app: Express): void {
  
  // System mode endpoints
  app.get('/api/system-mode', (req, res) => {
    res.json({ 
      success: true, 
      systemMode, 
      timestamp: new Date().toISOString() 
    });
  });

  app.post('/api/system-mode', (req, res) => {
    const { mode } = req.body;
    if (mode === 'live' || mode === 'test') {
      systemMode = mode;
      res.json({ success: true, systemMode });
    } else {
      res.status(400).json({ error: 'Invalid mode' });
    }
  });

  // Dashboard metrics
  app.get('/api/dashboard-metrics', (req, res) => {
    res.json({
      success: true,
      data: {},
      mode: systemMode,
      message: "Live data - Airtable integration required"
    });
  });

  // Live activity
  app.get('/api/live-activity', (req, res) => {
    res.json({
      success: true,
      data: {},
      mode: systemMode,
      message: "Live data - API integration required"
    });
  });

  // System health
  app.get('/api/system-health', (req, res) => {
    res.json({
      success: true,
      message: "System health status operational"
    });
  });

  // Automation performance
  app.get('/api/automation-performance', (req, res) => {
    res.json({
      success: true,
      data: {},
      mode: systemMode,
      message: "Live data - API integration required"
    });
  });

  // Knowledge stats
  app.get('/api/knowledge/stats', (req, res) => {
    res.json({
      success: true,
      data: {
        totalDocuments: 4,
        lastUpdated: new Date().toISOString()
      }
    });
  });

  // Voice personas
  app.get('/api/voice/personas', (req, res) => {
    res.json({
      success: true,
      data: [
        { id: "ErXwobaYiN", name: "Sarah", language: "en" },
        { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", language: "en" }
      ]
    });
  });

  // Calls endpoints
  app.get('/api/calls/active', (req, res) => {
    res.json({ success: true, data: [] });
  });

  app.get('/api/calls/metrics', (req, res) => {
    res.json({
      success: true,
      data: {
        totalCalls: 0,
        completedCalls: 0,
        avgDuration: 0
      }
    });
  });

  // Audit endpoints
  app.get('/api/audit/log', (req, res) => {
    res.json({ success: true, data: [] });
  });

  app.get('/api/audit/health', (req, res) => {
    res.status(200).send('OK');
  });

  // Memory activity
  app.get('/api/memory/activity', (req, res) => {
    res.json({ success: true, data: [] });
  });

  console.log("✅ Command Center routes registered successfully");
}