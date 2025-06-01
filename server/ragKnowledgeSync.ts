import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { storage } from './newStorage';
import type { InsertKnowledgeBase } from '@shared/schema';

interface SyncResult {
  filename: string;
  status: 'ingested' | 'skipped' | 'error';
  timestamp: string;
  error?: string;
}

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const SYNC_LOG_TABLE = "📊 Command Center · Metrics Tracker";
const DOCS_FOLDER = path.join(process.cwd(), 'docs');
const INGESTED_FILES_LOG = path.join(process.cwd(), 'ingested_files.json');

/**
 * Extract text content from various file types
 */
function extractText(filepath: string): string {
  const ext = path.extname(filepath).toLowerCase();
  
  try {
    if (ext === '.txt' || ext === '.md') {
      return fs.readFileSync(filepath, 'utf-8');
    } else if (ext === '.json') {
      const jsonData = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
      return JSON.stringify(jsonData, null, 2);
    }
    // For other file types, return basic file info
    return `File: ${path.basename(filepath)} (${ext} format)`;
  } catch (error) {
    throw new Error(`Failed to extract text from ${filepath}: ${error}`);
  }
}

/**
 * Check if file has already been ingested
 */
function getIngestedFiles(): Set<string> {
  try {
    if (fs.existsSync(INGESTED_FILES_LOG)) {
      const data = JSON.parse(fs.readFileSync(INGESTED_FILES_LOG, 'utf-8'));
      return new Set(data.files || []);
    }
  } catch (error) {
    console.error('Error reading ingested files log:', error);
  }
  return new Set();
}

/**
 * Mark file as ingested
 */
function markFileAsIngested(filename: string): void {
  try {
    const ingestedFiles = Array.from(getIngestedFiles());
    ingestedFiles.push(filename);
    
    fs.writeFileSync(INGESTED_FILES_LOG, JSON.stringify({
      files: ingestedFiles,
      lastSync: new Date().toISOString()
    }), 'utf-8');
  } catch (error) {
    console.error('Error updating ingested files log:', error);
  }
}

/**
 * Log sync result to Airtable
 */
async function logSyncResult(result: SyncResult): Promise<void> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    return;
  }

  try {
    await axios.post(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${SYNC_LOG_TABLE}`,
      {
        fields: {
          "📁 Source": "RAG Knowledge Sync",
          "📄 Ticket ID": `sync_${Date.now()}`,
          "🕒 Timestamp": result.timestamp,
          "📣 Action": `File ${result.status}: ${result.filename}`,
          "⚠️ Result": result.status === 'error' ? 'Failed' : 'Success'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Failed to log sync result to Airtable:', error);
  }
}

/**
 * Sync all new files in docs folder to RAG system
 */
export async function syncKnowledgeBase(): Promise<{ results: SyncResult[]; summary: { total: number; ingested: number; skipped: number; errors: number } }> {
  const results: SyncResult[] = [];
  
  // Ensure docs folder exists
  if (!fs.existsSync(DOCS_FOLDER)) {
    fs.mkdirSync(DOCS_FOLDER, { recursive: true });
    console.log('Created docs folder at:', DOCS_FOLDER);
  }

  const ingestedFiles = getIngestedFiles();
  const files = fs.readdirSync(DOCS_FOLDER);
  
  for (const filename of files) {
    const filepath = path.join(DOCS_FOLDER, filename);
    const stat = fs.statSync(filepath);
    
    // Skip directories and already ingested files
    if (stat.isDirectory() || ingestedFiles.has(filename)) {
      results.push({
        filename,
        status: 'skipped',
        timestamp: new Date().toISOString()
      });
      continue;
    }

    try {
      // Extract text content
      const text = extractText(filepath);
      
      if (text.trim().length === 0) {
        results.push({
          filename,
          status: 'skipped',
          timestamp: new Date().toISOString(),
          error: 'Empty file'
        });
        continue;
      }

      // Ingest into RAG system via storage
      await storage.createKnowledgeBase({
        userId: 1, // Default user for demo
        name: filename,
        content: text,
        source: 'Knowledge Sync',
        sourceUrl: filepath,
        createdBy: 'system',
        confidence: 85,
        status: 'enabled',
        roleVisibility: ['all'],
        overrideBehavior: 'append',
        priority: 70,
        triggerConditions: {
          textContains: [],
          eventType: ['chat', 'support_ticket'],
          intent: []
        },
        tags: [path.extname(filename).replace('.', '')]
      });

      // Mark as ingested
      markFileAsIngested(filename);
      
      const result: SyncResult = {
        filename,
        status: 'ingested',
        timestamp: new Date().toISOString()
      };
      
      results.push(result);
      await logSyncResult(result);
      
      console.log(`✅ Ingested: ${filename}`);
      
    } catch (error: any) {
      const result: SyncResult = {
        filename,
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message
      };
      
      results.push(result);
      await logSyncResult(result);
      
      console.error(`❌ Failed to ingest ${filename}:`, error.message);
    }
  }

  // Generate summary
  const summary = {
    total: results.length,
    ingested: results.filter(r => r.status === 'ingested').length,
    skipped: results.filter(r => r.status === 'skipped').length,
    errors: results.filter(r => r.status === 'error').length
  };

  console.log(`📊 Knowledge sync complete: ${summary.ingested} ingested, ${summary.skipped} skipped, ${summary.errors} errors`);
  
  return { results, summary };
}

/**
 * Force re-sync of all files (ignoring ingested files log)
 */
export async function forceResyncKnowledgeBase(): Promise<{ results: SyncResult[]; summary: { total: number; ingested: number; skipped: number; errors: number } }> {
  // Clear ingested files log
  if (fs.existsSync(INGESTED_FILES_LOG)) {
    fs.unlinkSync(INGESTED_FILES_LOG);
  }
  
  return await syncKnowledgeBase();
}