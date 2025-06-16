import type { Express } from "express";
import { knowledgeStorage } from "./storage";
import { insertKnowledgeItemSchema } from "@shared/schema";
import { z } from "zod";

export function registerKnowledgeRoutes(app: Express) {
  // Get all knowledge items
  app.get('/api/knowledge/items', async (req, res) => {
    try {
      const items = await knowledgeStorage.getKnowledgeItems();
      res.json({
        success: true,
        data: items,
        count: items.length
      });
    } catch (error) {
      console.error('Knowledge items fetch error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch knowledge items'
      });
    }
  });

  // Create new knowledge item
  app.post('/api/knowledge/items', async (req, res) => {
    try {
      const validatedData = insertKnowledgeItemSchema.parse(req.body);
      const newItem = await knowledgeStorage.createKnowledgeItem(validatedData);
      
      res.status(201).json({
        success: true,
        data: newItem
      });
    } catch (error) {
      console.error('Knowledge item creation error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof z.ZodError ? 'Invalid data format' : 'Failed to create knowledge item'
      });
    }
  });

  // Update knowledge item
  app.patch('/api/knowledge/items/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedItem = await knowledgeStorage.updateKnowledgeItem(id, updates);
      
      if (!updatedItem) {
        return res.status(404).json({
          success: false,
          error: 'Knowledge item not found'
        });
      }

      res.json({
        success: true,
        data: updatedItem
      });
    } catch (error) {
      console.error('Knowledge item update error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update knowledge item'
      });
    }
  });

  // Delete knowledge item
  app.delete('/api/knowledge/items/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await knowledgeStorage.deleteKnowledgeItem(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Knowledge item not found'
        });
      }

      res.json({
        success: true,
        message: 'Knowledge item deleted successfully'
      });
    } catch (error) {
      console.error('Knowledge item deletion error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete knowledge item'
      });
    }
  });

  // Get knowledge statistics
  app.get('/api/knowledge/stats', async (req, res) => {
    try {
      const stats = await knowledgeStorage.getKnowledgeStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Knowledge stats fetch error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch knowledge statistics'
      });
    }
  });
}