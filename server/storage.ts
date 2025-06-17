import { db } from "./db";
import { knowledgeItems, callLogs, type KnowledgeItem, type InsertKnowledgeItem, type CallLog, type InsertCallLog } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

export interface IKnowledgeStorage {
  getKnowledgeItems(): Promise<KnowledgeItem[]>;
  createKnowledgeItem(item: InsertKnowledgeItem): Promise<KnowledgeItem>;
  updateKnowledgeItem(id: number, updates: Partial<InsertKnowledgeItem>): Promise<KnowledgeItem | undefined>;
  deleteKnowledgeItem(id: number): Promise<boolean>;
  getKnowledgeStats(): Promise<{ totalDocuments: number; totalMemories: number; categories: string[] }>;
}

export interface ICallLogStorage {
  getCallLogs(): Promise<CallLog[]>;
  createCallLog(log: InsertCallLog): Promise<CallLog>;
  getCallLogsByStatus(status: string): Promise<CallLog[]>;
  getCallLogStats(): Promise<{ totalCalls: number; activeCalls: number; avgDuration: string }>;
}

export class DatabaseKnowledgeStorage implements IKnowledgeStorage {
  async getKnowledgeItems(): Promise<KnowledgeItem[]> {
    return await db.select().from(knowledgeItems).where(eq(knowledgeItems.isActive, true)).orderBy(desc(knowledgeItems.createdAt));
  }

  async createKnowledgeItem(item: InsertKnowledgeItem): Promise<KnowledgeItem> {
    const [created] = await db.insert(knowledgeItems).values({
      ...item,
      updatedAt: new Date()
    }).returning();
    return created;
  }

  async updateKnowledgeItem(id: number, updates: Partial<InsertKnowledgeItem>): Promise<KnowledgeItem | undefined> {
    const [updated] = await db.update(knowledgeItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(knowledgeItems.id, id))
      .returning();
    return updated;
  }

  async deleteKnowledgeItem(id: number): Promise<boolean> {
    const result = await db.update(knowledgeItems)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(knowledgeItems.id, id));
    return result.rowCount > 0;
  }

  async getKnowledgeStats(): Promise<{ totalDocuments: number; totalMemories: number; categories: string[] }> {
    const items = await this.getKnowledgeItems();
    const documents = items.filter(item => item.type === 'document').length;
    const memories = items.filter(item => item.type === 'memory').length;
    const categories = [...new Set(items.map(item => item.category))];
    
    return {
      totalDocuments: documents,
      totalMemories: memories,
      categories
    };
  }
}

export class DatabaseCallLogStorage implements ICallLogStorage {
  async getCallLogs(): Promise<CallLog[]> {
    return await db.select().from(callLogs).orderBy(desc(callLogs.timestamp));
  }

  async createCallLog(log: InsertCallLog): Promise<CallLog> {
    const [created] = await db.insert(callLogs).values(log).returning();
    return created;
  }

  async getCallLogsByStatus(status: string): Promise<CallLog[]> {
    return await db.select().from(callLogs).where(eq(callLogs.status, status));
  }

  async getCallLogStats(): Promise<{ totalCalls: number; activeCalls: number; avgDuration: string }> {
    const allLogs = await this.getCallLogs();
    const activeLogs = await this.getCallLogsByStatus('active');
    
    // Calculate average duration from completed calls
    const completedLogs = allLogs.filter(log => log.duration && log.status === 'completed');
    const totalMinutes = completedLogs.reduce((sum, log) => {
      if (!log.duration) return sum;
      const [minutes, seconds] = log.duration.split(':').map(Number);
      return sum + minutes + (seconds / 60);
    }, 0);
    
    const avgMinutes = completedLogs.length > 0 ? Math.round(totalMinutes / completedLogs.length) : 0;
    const avgDuration = `${avgMinutes}m ${Math.round((totalMinutes / completedLogs.length - avgMinutes) * 60)}s`;
    
    return {
      totalCalls: allLogs.length,
      activeCalls: activeLogs.length,
      avgDuration: completedLogs.length > 0 ? avgDuration : '0m 0s'
    };
  }
}

// Test mode data - comprehensive realistic hardcoded data
const testKnowledgeItems: KnowledgeItem[] = [
  {
    id: 1,
    title: "YoBot Product Overview",
    content: "YoBot is an enterprise-grade AI voice automation platform that handles customer interactions, lead qualification, and sales processes through intelligent voice bots.",
    category: "product",
    type: "document",
    tags: ["product", "overview", "sales"],
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-06-10')
  },
  {
    id: 2,
    title: "Pricing Structure",
    content: "Standard Plan: $299/month for up to 1000 calls. Premium Plan: $599/month for up to 5000 calls. Enterprise Plan: Custom pricing for unlimited calls with dedicated support.",
    category: "pricing",
    type: "document",
    tags: ["pricing", "plans", "billing"],
    isActive: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-06-01')
  },
  {
    id: 3,
    title: "Integration Capabilities",
    content: "YoBot integrates with HubSpot, Salesforce, Slack, Twilio, Airtable, and 50+ other platforms through webhooks and REST APIs.",
    category: "integrations",
    type: "document", 
    tags: ["integrations", "api", "platforms"],
    isActive: true,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-05-20')
  },
  {
    id: 4,
    title: "Call Handling Protocols",
    content: "All calls are answered within 2 rings. Bot introduces itself as YoBot assistant. Escalation to human occurs when customer explicitly requests or sentiment drops below 3/10.",
    category: "protocols",
    type: "memory",
    tags: ["calls", "protocols", "escalation"],
    isActive: true,
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date('2024-06-05')
  },
  {
    id: 5,
    title: "Client Success Stories",
    content: "TechCorp Solutions increased lead conversion by 340% using YoBot. Global Dynamics reduced response time from 4 hours to 30 seconds. Innovation Labs automated 85% of customer inquiries.",
    category: "success-stories",
    type: "document",
    tags: ["success", "clients", "results"],
    isActive: true,
    createdAt: new Date('2024-05-01'),
    updatedAt: new Date('2024-06-08')
  }
];

const testCallLogs: CallLog[] = [
  {
    id: 1,
    callId: "CALL-2025-001",
    timestamp: new Date(),
    botName: "SalesBot",
    clientName: "Sarah Johnson",
    phoneNumber: "(555) 123-4567",
    intent: "Product Inquiry",
    sentiment: 8,
    duration: "8:42",
    status: "completed",
    transcript: "Customer inquired about enterprise pricing and integration capabilities.",
    createdAt: new Date()
  },
  {
    id: 2,
    callId: "CALL-2025-002",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    botName: "SupportBot", 
    clientName: "Mike Chen",
    phoneNumber: "(555) 987-6543",
    intent: "Technical Support",
    sentiment: 6,
    duration: "12:18",
    status: "active",
    transcript: "Customer experiencing integration issues with HubSpot connector.",
    createdAt: new Date()
  },
  {
    id: 3,
    callId: "CALL-2025-003",
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    botName: "LeadBot",
    clientName: "Emily Davis", 
    phoneNumber: "(555) 456-7890",
    intent: "Lead Qualification",
    sentiment: 9,
    duration: "5:33",
    status: "completed",
    transcript: "High-quality lead - enterprise prospect with 500+ employees.",
    createdAt: new Date()
  }
];

export class TestKnowledgeStorage implements IKnowledgeStorage {
  private items: KnowledgeItem[] = [];

  async getKnowledgeItems(): Promise<KnowledgeItem[]> {
    return [];
  }

  async createKnowledgeItem(item: InsertKnowledgeItem): Promise<KnowledgeItem> {
    const newItem: KnowledgeItem = {
      id: Math.max(...this.items.map(i => i.id)) + 1,
      ...item,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.items.push(newItem);
    return newItem;
  }

  async updateKnowledgeItem(id: number, updates: Partial<InsertKnowledgeItem>): Promise<KnowledgeItem | undefined> {
    const index = this.items.findIndex(item => item.id === id);
    if (index === -1) return undefined;
    
    this.items[index] = { ...this.items[index], ...updates, updatedAt: new Date() };
    return this.items[index];
  }

  async deleteKnowledgeItem(id: number): Promise<boolean> {
    const index = this.items.findIndex(item => item.id === id);
    if (index === -1) return false;
    
    this.items[index].isActive = false;
    this.items[index].updatedAt = new Date();
    return true;
  }

  async getKnowledgeStats(): Promise<{ totalDocuments: number; totalMemories: number; categories: string[] }> {
    const activeItems = this.items.filter(item => item.isActive);
    return {
      totalDocuments: activeItems.filter(item => item.type === 'document').length,
      totalMemories: activeItems.filter(item => item.type === 'memory').length,
      categories: [...new Set(activeItems.map(item => item.category))]
    };
  }
}

export class TestCallLogStorage implements ICallLogStorage {
  private logs: CallLog[] = [...testCallLogs];

  async getCallLogs(): Promise<CallLog[]> {
    return this.logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createCallLog(log: InsertCallLog): Promise<CallLog> {
    const newLog: CallLog = {
      id: Math.max(...this.logs.map(l => l.id)) + 1,
      ...log,
      createdAt: new Date()
    };
    this.logs.push(newLog);
    return newLog;
  }

  async getCallLogsByStatus(status: string): Promise<CallLog[]> {
    return this.logs.filter(log => log.status === status);
  }

  async getCallLogStats(): Promise<{ totalCalls: number; activeCalls: number; avgDuration: string }> {
    const activeLogs = this.logs.filter(log => log.status === 'active');
    return {
      totalCalls: this.logs.length,
      activeCalls: activeLogs.length,
      avgDuration: "9m 18s"
    };
  }
}

// Export storage instances based on environment
function getSystemMode(): 'test' | 'live' {
  return (process.env.SYSTEM_MODE || 'live') as 'test' | 'live';
}

export const knowledgeStorage: IKnowledgeStorage = getSystemMode() === 'test' 
  ? new TestKnowledgeStorage() 
  : new DatabaseKnowledgeStorage();

export const callLogStorage: ICallLogStorage = getSystemMode() === 'test'
  ? new TestCallLogStorage()
  : new DatabaseCallLogStorage();