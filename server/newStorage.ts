import { 
  users, 
  bots, 
  conversations, 
  notifications, 
  metrics, 
  crmData,
  scannedContacts,
  knowledgeBase,
  clientCompanies,
  type User, 
  type Bot, 
  type Conversation, 
  type Notification, 
  type Metrics, 
  type CrmData,
  type ScannedContact,
  type KnowledgeBase,
  type ClientCompany,
  type InsertUser, 
  type InsertBot, 
  type InsertConversation, 
  type InsertNotification, 
  type InsertMetrics, 
  type InsertCrmData,
  type InsertScannedContact,
  type InsertKnowledgeBase,
  type InsertClientCompany
} from "@shared/schema";
import { db } from "./db";
import { eq, like, and, or } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  
  getClientCompany(id: string): Promise<ClientCompany | undefined>;
  createClientCompany(company: InsertClientCompany): Promise<ClientCompany>;
  updateClientCompany(id: string, updates: Partial<InsertClientCompany>): Promise<ClientCompany>;
  getClientsByCompany(clientId: string): Promise<User[]>;
  
  getBot(id: number): Promise<Bot | undefined>;
  updateBot(id: number, updates: Partial<InsertBot>): Promise<Bot>;
  createBot(bot: InsertBot): Promise<Bot>;
  
  getConversations(): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  
  getNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  updateNotification(id: number, updates: Partial<Notification>): Promise<Notification>;
  
  getMetrics(botId: number): Promise<Metrics | undefined>;
  createMetrics(metrics: InsertMetrics): Promise<Metrics>;
  
  getCrmData(userId: number): Promise<CrmData | undefined>;
  updateCrmData(userId: number, updates: Partial<InsertCrmData>): Promise<CrmData>;
  
  getScannedContacts(userId: number): Promise<ScannedContact[]>;
  createScannedContact(contact: InsertScannedContact): Promise<ScannedContact>;
  
  // Knowledge Base methods
  getKnowledgeBase(userId: number): Promise<KnowledgeBase[]>;
  getKnowledgeBaseById(id: number): Promise<KnowledgeBase | undefined>;
  createKnowledgeBase(knowledge: InsertKnowledgeBase): Promise<KnowledgeBase>;
  updateKnowledgeBase(id: number, updates: Partial<KnowledgeBase>): Promise<KnowledgeBase>;
  deleteKnowledgeBase(id: number): Promise<void>;
  searchKnowledgeBase(userId: number, query: string, tags?: string[]): Promise<KnowledgeBase[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async getClientCompany(id: string): Promise<ClientCompany | undefined> {
    const [company] = await db.select().from(clientCompanies).where(eq(clientCompanies.id, id));
    return company || undefined;
  }

  async createClientCompany(company: InsertClientCompany): Promise<ClientCompany> {
    const [newCompany] = await db.insert(clientCompanies).values(company).returning();
    return newCompany;
  }

  async updateClientCompany(id: string, updates: Partial<InsertClientCompany>): Promise<ClientCompany> {
    const [company] = await db.update(clientCompanies).set(updates).where(eq(clientCompanies.id, id)).returning();
    return company;
  }

  async getClientsByCompany(clientId: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.clientId, clientId));
  }

  async getBot(id: number): Promise<Bot | undefined> {
    const [bot] = await db.select().from(bots).where(eq(bots.id, id));
    return bot || undefined;
  }

  async updateBot(id: number, updates: Partial<InsertBot>): Promise<Bot> {
    const [bot] = await db.update(bots).set(updates).where(eq(bots.id, id)).returning();
    return bot;
  }

  async createBot(bot: InsertBot): Promise<Bot> {
    const [newBot] = await db.insert(bots).values(bot).returning();
    return newBot;
  }

  async getConversations(): Promise<Conversation[]> {
    return await db.select().from(conversations);
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [newConversation] = await db.insert(conversations).values(conversation).returning();
    return newConversation;
  }

  async getNotifications(userId: number): Promise<Notification[]> {
    return await db.select().from(notifications).where(eq(notifications.userId, userId));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async updateNotification(id: number, updates: Partial<Notification>): Promise<Notification> {
    const [notification] = await db.update(notifications).set(updates).where(eq(notifications.id, id)).returning();
    return notification;
  }

  async getMetrics(botId: number): Promise<Metrics | undefined> {
    const [metric] = await db.select().from(metrics).where(eq(metrics.botId, botId));
    return metric || undefined;
  }

  async createMetrics(metric: InsertMetrics): Promise<Metrics> {
    const [newMetrics] = await db.insert(metrics).values(metric).returning();
    return newMetrics;
  }

  async getCrmData(userId: number): Promise<CrmData | undefined> {
    const [crm] = await db.select().from(crmData).where(eq(crmData.userId, userId));
    return crm || undefined;
  }

  async updateCrmData(userId: number, updates: Partial<InsertCrmData>): Promise<CrmData> {
    const [crm] = await db.update(crmData).set(updates).where(eq(crmData.userId, userId)).returning();
    return crm;
  }

  async getScannedContacts(userId: number): Promise<ScannedContact[]> {
    return await db.select().from(scannedContacts).where(eq(scannedContacts.userId, userId));
  }

  async createScannedContact(contact: InsertScannedContact): Promise<ScannedContact> {
    const [newContact] = await db.insert(scannedContacts).values(contact).returning();
    return newContact;
  }

  // Knowledge Base methods
  async getKnowledgeBase(userId: number): Promise<KnowledgeBase[]> {
    return await db.select().from(knowledgeBase).where(eq(knowledgeBase.userId, userId));
  }

  async getKnowledgeBaseById(id: number): Promise<KnowledgeBase | undefined> {
    const [knowledge] = await db.select().from(knowledgeBase).where(eq(knowledgeBase.id, id));
    return knowledge || undefined;
  }

  async createKnowledgeBase(knowledge: InsertKnowledgeBase): Promise<KnowledgeBase> {
    const [newKnowledge] = await db.insert(knowledgeBase).values(knowledge).returning();
    return newKnowledge;
  }

  async updateKnowledgeBase(id: number, updates: Partial<KnowledgeBase>): Promise<KnowledgeBase> {
    const [knowledge] = await db.update(knowledgeBase).set(updates).where(eq(knowledgeBase.id, id)).returning();
    return knowledge;
  }

  async deleteKnowledgeBase(id: number): Promise<void> {
    await db.delete(knowledgeBase).where(eq(knowledgeBase.id, id));
  }

  async searchKnowledgeBase(userId: number, query: string, tags?: string[]): Promise<KnowledgeBase[]> {
    const conditions = [eq(knowledgeBase.userId, userId)];
    
    if (query) {
      conditions.push(
        or(
          like(knowledgeBase.name, `%${query}%`),
          like(knowledgeBase.content, `%${query}%`)
        )!
      );
    }
    
    return await db.select().from(knowledgeBase).where(and(...conditions));
  }
}

// Initialize with sample data for demo
export const storage = new DatabaseStorage();

// Add sample knowledge base data
async function initializeKnowledgeBase() {
  try {
    const existingKnowledge = await storage.getKnowledgeBase(1);
    if (existingKnowledge.length === 0) {
      const sampleKnowledge = [
        {
          userId: 1,
          name: "Refund Policy Guidelines",
          content: "All refunds must be processed within 30 days of purchase. For digital products, refunds are only available if the product has technical issues. Enterprise clients have extended 60-day refund windows.",
          triggerConditions: {
            textContains: ["refund", "return", "money back"],
            eventType: ["support_ticket", "chat"],
            intent: ["refund_request", "billing_issue"]
          },
          tags: ["RefundPolicy", "Billing", "CustomerService"],
          source: "manual",
          createdBy: "admin",
          confidence: 95,
          status: "enabled" as const,
          roleVisibility: ["support", "admin", "manager"],
          overrideBehavior: "append" as const,
          priority: 90
        },
        {
          userId: 1,
          name: "Voice Escalation Protocol",
          content: "When a customer requests to speak with a human, immediately escalate to the next available agent. Use warm transfer language: 'I understand you'd like to speak with one of our specialists. Let me connect you right now.'",
          triggerConditions: {
            textContains: ["speak to human", "real person", "agent", "representative"],
            eventType: ["voice_call", "chat"],
            intent: ["escalation_request"]
          },
          tags: ["Escalation", "VoiceBot", "CustomerService"],
          source: "manual",
          createdBy: "admin",
          confidence: 100,
          status: "enabled" as const,
          roleVisibility: ["support", "admin"],
          overrideBehavior: "replace" as const,
          priority: 100
        },
        {
          userId: 1,
          name: "HIPAA Compliance Response",
          content: "For healthcare-related inquiries, always mention: 'We are HIPAA compliant and your protected health information is secure with us. All data is encrypted and stored according to federal regulations.'",
          triggerConditions: {
            textContains: ["health", "medical", "HIPAA", "privacy", "PHI"],
            eventType: ["support_ticket", "chat", "email"],
            intent: ["compliance_question", "privacy_concern"]
          },
          tags: ["HIPAA", "Compliance", "Healthcare", "Privacy"],
          source: "manual",
          createdBy: "admin",
          confidence: 100,
          status: "enabled" as const,
          roleVisibility: ["support", "admin", "manager"],
          overrideBehavior: "append" as const,
          priority: 95
        }
      ];

      for (const knowledge of sampleKnowledge) {
        await storage.createKnowledgeBase(knowledge);
      }
    }
  } catch (error) {
    console.log("Knowledge base already initialized or error occurred:", error);
  }
}

// Initialize on startup
initializeKnowledgeBase();