import type { Express } from "express";
import { callLogStorage } from "./storage";
import { insertCallLogSchema } from "@shared/schema";
import { z } from "zod";

export function registerCallLogRoutes(app: Express) {
  // Get all call logs
  app.get('/api/calls/logs', async (req, res) => {
    try {
      const logs = await callLogStorage.getCallLogs();
      res.json({
        success: true,
        data: logs,
        count: logs.length
      });
    } catch (error) {
      console.error('Call logs fetch error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch call logs'
      });
    }
  });

  // Create new call log
  app.post('/api/calls/logs', async (req, res) => {
    try {
      const validatedData = insertCallLogSchema.parse(req.body);
      const newLog = await callLogStorage.createCallLog(validatedData);
      
      res.status(201).json({
        success: true,
        data: newLog
      });
    } catch (error) {
      console.error('Call log creation error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof z.ZodError ? 'Invalid data format' : 'Failed to create call log'
      });
    }
  });

  // Get call logs by status
  app.get('/api/calls/logs/status/:status', async (req, res) => {
    try {
      const { status } = req.params;
      const logs = await callLogStorage.getCallLogsByStatus(status);
      res.json({
        success: true,
        data: logs,
        count: logs.length
      });
    } catch (error) {
      console.error('Call logs by status fetch error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch call logs by status'
      });
    }
  });

  // Get call statistics
  app.get('/api/calls/stats', async (req, res) => {
    try {
      const stats = await callLogStorage.getCallLogStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Call stats fetch error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch call statistics'
      });
    }
  });

  // Update existing endpoint to use database
  app.get('/api/calls/metrics', async (req, res) => {
    try {
      const stats = await callLogStorage.getCallLogStats();
      res.json({
        success: true,
        data: {
          totalCalls: stats.totalCalls,
          activeCalls: stats.activeCalls,
          avgDuration: stats.avgDuration,
          completedCalls: stats.totalCalls - stats.activeCalls,
          successRate: stats.totalCalls > 0 ? Math.round(((stats.totalCalls - stats.activeCalls) / stats.totalCalls) * 100) : 0
        }
      });
    } catch (error) {
      console.error('Call metrics fetch error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch call metrics'
      });
    }
  });

  // Update existing endpoint to use database
  app.get('/api/calls/active', async (req, res) => {
    try {
      const activeLogs = await callLogStorage.getCallLogsByStatus('active');
      res.json({
        success: true,
        data: activeLogs
      });
    } catch (error) {
      console.error('Active calls fetch error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch active calls'
      });
    }
  });
}