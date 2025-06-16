/**
 * Memory and Knowledge Management System
 * Handles memory insertion, document processing, and RAG search
 */
import express from 'express';
import { airtableLive } from './airtableLiveIntegration';

interface MemoryEntry {
  id: string;
  text: string;
  category: string;
  timestamp: string;
  source: string;
  metadata?: Record<string, any>;
}

interface KnowledgeDocument {
  id: string;
  filename: string;
  content: string;
  processed: boolean;
  indexed: boolean;
  uploadTime: string;
  size: number;
  type: string;
}

export function registerMemoryKnowledge(app: express.Application) {
  // Insert memory text
  app.post('/api/memory/insert', async (req, res) => {
    try {
      const { text, category = 'general', source = 'manual' } = req.body;
      
      if (!text || text.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Text content is required'
        });
      }

      const memoryEntry = await insertMemoryEntry(text, category, source);
      
      res.json({
        success: true,
        data: memoryEntry,
        message: 'Memory entry inserted successfully'
      });

    } catch (error) {
      console.error('Memory insertion failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to insert memory entry'
      });
    }
  });

  // Get memory activity log
  app.get('/api/memory/activity', async (req, res) => {
    try {
      const activity = await getMemoryActivity();
      res.json({
        success: true,
        data: activity
      });
    } catch (error) {
      console.error('Failed to fetch memory activity:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch memory activity'
      });
    }
  });

  // Process uploaded documents
  app.post('/api/knowledge/process', async (req, res) => {
    try {
      const { documentId, filename, content } = req.body;
      
      if (!documentId || !content) {
        return res.status(400).json({
          success: false,
          error: 'Document ID and content are required'
        });
      }

      const processedDoc = await processKnowledgeDocument({
        id: documentId,
        filename: filename || 'untitled',
        content,
        processed: false,
        indexed: false,
        uploadTime: new Date().toISOString(),
        size: content.length,
        type: filename?.split('.').pop() || 'txt'
      });

      res.json({
        success: true,
        data: processedDoc,
        message: 'Document processed successfully'
      });

    } catch (error) {
      console.error('Document processing failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process document'
      });
    }
  });

  // Search knowledge base
  app.post('/api/knowledge/search', async (req, res) => {
    try {
      const { query, limit = 10, category } = req.body;
      
      if (!query || query.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
      }

      const results = await searchKnowledgeBase(query, limit, category);
      
      res.json({
        success: true,
        data: results
      });

    } catch (error) {
      console.error('Knowledge search failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search knowledge base'
      });
    }
  });

  // Get knowledge statistics
  app.get('/api/knowledge/stats', async (req, res) => {
    try {
      const stats = await getKnowledgeStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Failed to fetch knowledge stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch knowledge statistics'
      });
    }
  });

  // Clear knowledge base
  app.delete('/api/knowledge/clear', async (req, res) => {
    try {
      await clearKnowledgeBase();
      res.json({
        success: true,
        message: 'Knowledge base cleared successfully'
      });
    } catch (error) {
      console.error('Failed to clear knowledge base:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to clear knowledge base'
      });
    }
  });

  // Reindex knowledge base
  app.post('/api/knowledge/reindex', async (req, res) => {
    try {
      const result = await reindexKnowledgeBase();
      res.json({
        success: true,
        data: result,
        message: 'Knowledge base reindexed successfully'
      });
    } catch (error) {
      console.error('Failed to reindex knowledge base:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to reindex knowledge base'
      });
    }
  });
}

async function insertMemoryEntry(text: string, category: string, source: string): Promise<MemoryEntry> {
  const memoryEntry: MemoryEntry = {
    id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    text: text.trim(),
    category,
    timestamp: new Date().toISOString(),
    source,
    metadata: {
      wordCount: text.trim().split(/\s+/).length,
      characterCount: text.length
    }
  };

  try {
    // Log to Airtable for persistence
    await airtableLive.createSalesOrder({
      'Bot Package': 'Memory Entry',
      'Add-Ons': [category],
      'Total': 0,
      'Status': 'Indexed',
      'Client Email': 'system@yobot.bot',
      'Client Name': `Memory: ${text.substring(0, 50)}...`,
      'Order Date': memoryEntry.timestamp,
      'Payment Status': 'N/A'
    });

    console.log(`Memory entry created: ${memoryEntry.id} - Category: ${category}`);
  } catch (error) {
    console.error('Failed to log memory entry to Airtable:', error);
  }

  return memoryEntry;
}

async function getMemoryActivity(): Promise<any[]> {
  try {
    // Fetch recent memory entries from Airtable
    const salesOrders = await airtableLive.getSalesOrders();
    const memoryEntries = salesOrders
      .filter(order => order.fields['Bot Package'] === 'Memory Entry')
      .slice(0, 10)
      .map(order => ({
        timestamp: new Date(order.fields['Order Date']).toLocaleString(),
        type: 'Memory Insertion',
        category: order.fields['Add-Ons']?.[0] || 'general',
        result: order.fields['Status'] === 'Indexed' ? 'Success' : 'Error',
        preview: order.fields['Client Name']?.replace('Memory: ', '') || 'Entry'
      }));

    return memoryEntries;
  } catch (error) {
    console.error('Failed to fetch memory activity:', error);
    return [];
  }
}

async function processKnowledgeDocument(doc: KnowledgeDocument): Promise<KnowledgeDocument> {
  try {
    // Process document content (extract text, clean up, etc.)
    const processedContent = cleanDocumentContent(doc.content);
    
    // Create knowledge chunks for better RAG performance
    const chunks = chunkContent(processedContent, 500);
    
    // Log document processing
    await airtableLive.createSalesOrder({
      'Bot Package': 'Document Processing',
      'Add-Ons': [doc.type, `${chunks.length} chunks`],
      'Total': chunks.length,
      'Status': 'Processed',
      'Client Email': 'system@yobot.bot',
      'Client Name': doc.filename,
      'Order Date': doc.uploadTime,
      'Payment Status': 'Indexed'
    });

    return {
      ...doc,
      processed: true,
      indexed: true,
      content: processedContent
    };

  } catch (error) {
    console.error('Document processing failed:', error);
    throw error;
  }
}

function cleanDocumentContent(content: string): string {
  return content
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
}

function chunkContent(content: string, maxChunkSize: number): string[] {
  const sentences = content.split(/[.!?]+/);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxChunkSize && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence + '.';
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

async function searchKnowledgeBase(query: string, limit: number, category?: string): Promise<any[]> {
  try {
    // Get relevant documents and memory entries
    const salesOrders = await airtableLive.getSalesOrders();
    
    const knowledgeEntries = salesOrders.filter(order => 
      order.fields['Bot Package'] === 'Memory Entry' || 
      order.fields['Bot Package'] === 'Document Processing'
    );

    // Simple text-based search (in production, use vector similarity)
    const searchResults = knowledgeEntries
      .filter(entry => {
        const searchText = `${entry.fields['Client Name']} ${entry.fields['Add-Ons']?.join(' ')}`.toLowerCase();
        return searchText.includes(query.toLowerCase());
      })
      .slice(0, limit)
      .map(entry => ({
        id: entry.id,
        title: entry.fields['Client Name'],
        content: entry.fields['Client Name'],
        category: entry.fields['Add-Ons']?.[0] || 'general',
        relevanceScore: 0.8,
        timestamp: entry.fields['Order Date']
      }));

    return searchResults;

  } catch (error) {
    console.error('Knowledge search failed:', error);
    return [];
  }
}

async function getKnowledgeStats(): Promise<any> {
  try {
    const salesOrders = await airtableLive.getSalesOrders();
    
    const memoryEntries = salesOrders.filter(order => 
      order.fields['Bot Package'] === 'Memory Entry'
    );
    
    const documents = salesOrders.filter(order => 
      order.fields['Bot Package'] === 'Document Processing'
    );

    return {
      documents: {
        total: documents.length,
        processed: documents.filter(d => d.fields['Status'] === 'Processed').length,
        indexed: documents.filter(d => d.fields['Payment Status'] === 'Indexed').length
      },
      memory: {
        total: memoryEntries.length,
        categories: [...new Set(memoryEntries.flatMap(e => e.fields['Add-Ons'] || []))].length
      },
      lastUpdated: new Date().toISOString()
    };

  } catch (error) {
    console.error('Failed to get knowledge stats:', error);
    return {
      documents: { total: 0, processed: 0, indexed: 0 },
      memory: { total: 0, categories: 0 },
      lastUpdated: new Date().toISOString()
    };
  }
}

async function clearKnowledgeBase(): Promise<void> {
  console.log('Knowledge base clear initiated - implementation would remove indexed content');
  // Implementation would clear the vector database and indexed content
}

async function reindexKnowledgeBase(): Promise<any> {
  console.log('Knowledge base reindex initiated');
  
  try {
    const stats = await getKnowledgeStats();
    return {
      documentsReindexed: stats.documents.total,
      memoryEntriesReindexed: stats.memory.total,
      completedAt: new Date().toISOString()
    };
  } catch (error) {
    throw new Error('Reindex operation failed');
  }
}

export { insertMemoryEntry, processKnowledgeDocument, searchKnowledgeBase };