import fs from 'fs';
import path from 'path';

interface KnowledgeDocument {
  id: string;
  filename: string;
  content: string;
  uploadedAt: string;
  size: number;
}

interface MemoryEntry {
  id: string;
  text: string;
  category: string;
  priority: string;
  timestamp: string;
  source: string;
}

class KnowledgeStorage {
  private knowledgeDir = path.join(process.cwd(), 'knowledge_data');
  private memoryDir = path.join(process.cwd(), 'memory_data');
  private documentsFile = path.join(this.knowledgeDir, 'documents.json');
  private memoryFile = path.join(this.memoryDir, 'entries.json');

  constructor() {
    this.ensureDirectories();
  }

  private ensureDirectories() {
    [this.knowledgeDir, this.memoryDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // Initialize files if they don't exist
    if (!fs.existsSync(this.documentsFile)) {
      fs.writeFileSync(this.documentsFile, JSON.stringify([]));
    }
    if (!fs.existsSync(this.memoryFile)) {
      fs.writeFileSync(this.memoryFile, JSON.stringify([]));
    }
  }

  // Knowledge Base Methods
  async saveDocument(document: KnowledgeDocument): Promise<void> {
    const documents = this.getDocuments();
    const existingIndex = documents.findIndex(doc => doc.id === document.id);
    
    if (existingIndex >= 0) {
      documents[existingIndex] = document;
    } else {
      documents.push(document);
    }
    
    fs.writeFileSync(this.documentsFile, JSON.stringify(documents, null, 2));
  }

  getDocuments(): KnowledgeDocument[] {
    try {
      const data = fs.readFileSync(this.documentsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading documents:', error);
      return [];
    }
  }

  async deleteDocument(id: string): Promise<boolean> {
    const documents = this.getDocuments();
    const filteredDocs = documents.filter(doc => doc.id !== id);
    
    if (filteredDocs.length !== documents.length) {
      fs.writeFileSync(this.documentsFile, JSON.stringify(filteredDocs, null, 2));
      return true;
    }
    return false;
  }

  async clearAllDocuments(): Promise<void> {
    fs.writeFileSync(this.documentsFile, JSON.stringify([]));
  }

  getDocumentStats(): { total: number; totalSize: number } {
    const documents = this.getDocuments();
    return {
      total: documents.length,
      totalSize: documents.reduce((sum, doc) => sum + doc.size, 0)
    };
  }

  // Memory System Methods
  async saveMemoryEntry(entry: MemoryEntry): Promise<void> {
    const entries = this.getMemoryEntries();
    const existingIndex = entries.findIndex(e => e.id === entry.id);
    
    if (existingIndex >= 0) {
      entries[existingIndex] = entry;
    } else {
      entries.push(entry);
    }
    
    fs.writeFileSync(this.memoryFile, JSON.stringify(entries, null, 2));
  }

  getMemoryEntries(): MemoryEntry[] {
    try {
      const data = fs.readFileSync(this.memoryFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading memory entries:', error);
      return [];
    }
  }

  async deleteMemoryEntry(id: string): Promise<boolean> {
    const entries = this.getMemoryEntries();
    const filteredEntries = entries.filter(entry => entry.id !== id);
    
    if (filteredEntries.length !== entries.length) {
      fs.writeFileSync(this.memoryFile, JSON.stringify(filteredEntries, null, 2));
      return true;
    }
    return false;
  }

  async clearAllMemory(): Promise<void> {
    fs.writeFileSync(this.memoryFile, JSON.stringify([]));
  }

  getMemoryStats(): { total: number; categories: Record<string, number> } {
    const entries = this.getMemoryEntries();
    const categories: Record<string, number> = {};
    
    entries.forEach(entry => {
      categories[entry.category] = (categories[entry.category] || 0) + 1;
    });
    
    return {
      total: entries.length,
      categories
    };
  }
}

export const knowledgeStorage = new KnowledgeStorage();
