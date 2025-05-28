import { 
  users, 
  bots, 
  conversations, 
  notifications, 
  metrics, 
  crmData,
  scannedContacts,
  type User, 
  type Bot, 
  type Conversation, 
  type Notification, 
  type Metrics, 
  type CrmData,
  type ScannedContact,
  type InsertUser, 
  type InsertBot, 
  type InsertConversation, 
  type InsertNotification, 
  type InsertMetrics, 
  type InsertCrmData,
  type InsertScannedContact
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
  updateScannedContact(id: number, updates: Partial<InsertScannedContact>): Promise<ScannedContact>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private bots: Map<number, Bot>;
  private conversations: Map<number, Conversation>;
  private notifications: Map<number, Notification>;
  private metrics: Map<number, Metrics>;
  private crmData: Map<number, CrmData>;
  private scannedContacts: Map<number, ScannedContact>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.bots = new Map();
    this.conversations = new Map();
    this.notifications = new Map();
    this.metrics = new Map();
    this.crmData = new Map();
    this.scannedContacts = new Map();
    this.currentId = 1;
    this.initializeData();
  }

  private initializeData() {
    // Initialize with sample data
    const defaultBot: Bot = {
      id: 1,
      userId: 1,
      name: "YoBot Assistant",
      status: "active",
      tone: "professional",
      routingMode: "auto-assign",
      createdAt: new Date(),
    };
    this.bots.set(1, defaultBot);

    const defaultMetrics: Metrics = {
      id: 1,
      botId: 1,
      date: new Date(),
      callsToday: 247,
      conversions: 89,
      newLeads: 156,
      failedCalls: 12,
      callsChange: 12,
      conversionsChange: 8,
      leadsChange: 15,
      failedCallsChange: -3,
    };
    this.metrics.set(1, defaultMetrics);

    const defaultCrmData: CrmData = {
      id: 1,
      userId: 1,
      hotLeads: 7,
      followUpsDue: 12,
      pipelineValue: "$847K",
      updatedAt: new Date(),
    };
    this.crmData.set(1, defaultCrmData);

    // Sample conversations
    const sampleConversations: Conversation[] = [
      {
        id: 1,
        botId: 1,
        clientName: "Sarah Johnson",
        clientCompany: "TechCorp Solutions",
        clientAvatar: "SJ",
        lastMessage: "I'm interested in a complete website redesign for our B2B platform...",
        status: "lead_captured",
        duration: "4:32",
        createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      },
      {
        id: 2,
        botId: 1,
        clientName: "Mike Rodriguez",
        clientCompany: "Rodriguez & Associates",
        clientAvatar: "MR",
        lastMessage: "I need to speak with someone about pricing urgently...",
        status: "escalated",
        duration: "2:18",
        createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      },
      {
        id: 3,
        botId: 1,
        clientName: "Alex Chen",
        clientCompany: "StartupXYZ",
        clientAvatar: "AC",
        lastMessage: "Great! I've scheduled the meeting for tomorrow...",
        status: "meeting_booked",
        duration: "6:45",
        createdAt: new Date(Date.now() - 8 * 60 * 1000), // 8 minutes ago
      },
    ];

    sampleConversations.forEach(conv => {
      this.conversations.set(conv.id, conv);
    });

    // Sample notifications
    const sampleNotifications: Notification[] = [
      {
        id: 1,
        userId: 1,
        type: "lead_captured",
        title: "New Lead Captured",
        message: "Sarah Johnson from TechCorp submitted a quote request for $15,000 website redesign",
        isRead: false,
        metadata: { leadValue: 15000, company: "TechCorp" },
        createdAt: new Date(Date.now() - 2 * 60 * 1000),
      },
      {
        id: 2,
        userId: 1,
        type: "call_escalation",
        title: "Call Escalation",
        message: "Bot escalated call from Mike Rodriguez - requires human intervention",
        isRead: false,
        metadata: { urgency: "high", clientId: "mike_rodriguez" },
        createdAt: new Date(Date.now() - 5 * 60 * 1000),
      },
      {
        id: 3,
        userId: 1,
        type: "meeting_booked",
        title: "Meeting Booked",
        message: "Alex Chen scheduled discovery call for tomorrow at 2:00 PM",
        isRead: false,
        metadata: { meetingTime: "2024-01-26T14:00:00Z", clientId: "alex_chen" },
        createdAt: new Date(Date.now() - 8 * 60 * 1000),
      },
    ];

    sampleNotifications.forEach(notif => {
      this.notifications.set(notif.id, notif);
    });

    this.currentId = 10; // Start with ID 10 for new entries
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getBot(id: number): Promise<Bot | undefined> {
    return this.bots.get(id);
  }

  async updateBot(id: number, updates: Partial<InsertBot>): Promise<Bot> {
    const existingBot = this.bots.get(id);
    if (!existingBot) {
      throw new Error(`Bot with id ${id} not found`);
    }
    
    const updatedBot: Bot = { ...existingBot, ...updates };
    this.bots.set(id, updatedBot);
    return updatedBot;
  }

  async createBot(insertBot: InsertBot): Promise<Bot> {
    const id = this.currentId++;
    const bot: Bot = { 
      ...insertBot, 
      id,
      createdAt: new Date()
    };
    this.bots.set(id, bot);
    return bot;
  }

  async getConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = this.currentId++;
    const conversation: Conversation = { 
      ...insertConversation, 
      id,
      createdAt: new Date()
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async getNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.currentId++;
    const notification: Notification = { 
      ...insertNotification, 
      id,
      createdAt: new Date()
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async updateNotification(id: number, updates: Partial<Notification>): Promise<Notification> {
    const existingNotification = this.notifications.get(id);
    if (!existingNotification) {
      throw new Error(`Notification with id ${id} not found`);
    }
    
    const updatedNotification: Notification = { ...existingNotification, ...updates };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  async getMetrics(botId: number): Promise<Metrics | undefined> {
    return Array.from(this.metrics.values())
      .find(metric => metric.botId === botId);
  }

  async createMetrics(insertMetrics: InsertMetrics): Promise<Metrics> {
    const id = this.currentId++;
    const metric: Metrics = { 
      ...insertMetrics, 
      id,
      date: new Date()
    };
    this.metrics.set(id, metric);
    return metric;
  }

  async getCrmData(userId: number): Promise<CrmData | undefined> {
    return Array.from(this.crmData.values())
      .find(crm => crm.userId === userId);
  }

  async updateCrmData(userId: number, updates: Partial<InsertCrmData>): Promise<CrmData> {
    const existingCrmData = Array.from(this.crmData.values())
      .find(crm => crm.userId === userId);
    
    if (!existingCrmData) {
      // Create new CRM data if it doesn't exist
      const id = this.currentId++;
      const newCrmData: CrmData = { 
        ...updates, 
        id,
        userId,
        updatedAt: new Date()
      } as CrmData;
      this.crmData.set(id, newCrmData);
      return newCrmData;
    }
    
    const updatedCrmData: CrmData = { 
      ...existingCrmData, 
      ...updates,
      updatedAt: new Date()
    };
    this.crmData.set(existingCrmData.id, updatedCrmData);
    return updatedCrmData;
  }
}

export const storage = new MemStorage();
