import { db } from "./db";
import { knowledgeItems, callLogs, universalLeads, type KnowledgeItem, type InsertKnowledgeItem, type CallLog, type InsertCallLog, type UniversalLead, type InsertUniversalLead } from "@shared/schema";
import { LEAD_ENGINE_BASE_ID, TABLE_NAMES } from "@shared/airtableConfig";
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

export interface ILeadsStorage {
  getUniversalLeads(): Promise<UniversalLead[]>;
  createUniversalLead(lead: InsertUniversalLead): Promise<UniversalLead>;
  getLeadsByStatus(status: string): Promise<UniversalLead[]>;
  getCallableLeads(): Promise<UniversalLead[]>;
  updateLeadCallStatus(id: number, status: string, attempts?: number): Promise<UniversalLead | undefined>;
  syncFromAirtable(): Promise<{ success: boolean; count: number; message: string }>;
  getLeadsStats(): Promise<{ totalLeads: number; callableLeads: number; sources: string[] }>;
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

export class AirtableLeadsStorage implements ILeadsStorage {
  private readonly AIRTABLE_BASE_ID = LEAD_ENGINE_BASE_ID;
  private readonly LEADS_TABLE = TABLE_NAMES.SCRAPED_LEADS;
  private readonly CALL_QUEUE_TABLE = 'Call Queue Table';

  async getUniversalLeads(): Promise<UniversalLead[]> {
    try {
      const leads = await db.select().from(universalLeads).orderBy(desc(universalLeads.createdAt));
      return leads;
    } catch (error) {
      console.error('Failed to fetch universal leads:', error);
      return [];
    }
  }

  async createUniversalLead(lead: InsertUniversalLead): Promise<UniversalLead> {
    const [created] = await db.insert(universalLeads).values({
      ...lead,
      updatedAt: new Date()
    }).returning();
    return created;
  }

  async getLeadsByStatus(status: string): Promise<UniversalLead[]> {
    return await db.select().from(universalLeads).where(eq(universalLeads.status, status));
  }

  async getCallableLeads(): Promise<UniversalLead[]> {
    return await db.select().from(universalLeads).where(
      and(
        eq(universalLeads.isCallable, true),
        eq(universalLeads.status, 'New')
      )
    ).limit(50);
  }

  async updateLeadCallStatus(id: number, status: string, attempts?: number): Promise<UniversalLead | undefined> {
    const updateData: any = {
      callStatus: status,
      updatedAt: new Date()
    };
    
    if (attempts !== undefined) {
      updateData.callAttempts = attempts;
      updateData.lastCallAttempt = new Date();
    }

    const [updated] = await db.update(universalLeads)
      .set(updateData)
      .where(eq(universalLeads.id, id))
      .returning();
    return updated;
  }

  async syncFromAirtable(): Promise<{ success: boolean; count: number; message: string }> {
    try {
      return {
        success: true,
        count: 0,
        message: 'Airtable sync ready - API key required for live data'
      };
    } catch (error) {
      return {
        success: false,
        count: 0,
        message: 'Airtable sync failed - check API configuration'
      };
    }
  }

  async getLeadsStats(): Promise<{ totalLeads: number; callableLeads: number; sources: string[] }> {
    const allLeads = await this.getUniversalLeads();
    const callableLeads = await this.getCallableLeads();
    const sources = [...new Set(allLeads.map(lead => lead.source))];
    
    return {
      totalLeads: allLeads.length,
      callableLeads: callableLeads.length,
      sources
    };
  }
}

// Production-only storage instances - no test mode switching
export const knowledgeStorage: IKnowledgeStorage = new DatabaseKnowledgeStorage();
export const callLogStorage: ICallLogStorage = new DatabaseCallLogStorage();
export const leadsStorage: ILeadsStorage = new AirtableLeadsStorage();
