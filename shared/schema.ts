import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique().notNull(),
  role: text("role").notNull().default("agent"), // admin, dev, support, owner, manager, agent, editor
  clientId: text("client_id"), // null for YoBot internal team, UUID for client companies
  firstName: text("first_name"),
  lastName: text("last_name"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
});

export const bots = pgTable("bots", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  status: text("status").notNull().default("active"), // active, paused, offline
  tone: text("tone").notNull().default("professional"), // professional, friendly, casual, formal
  routingMode: text("routing_mode").notNull().default("auto-assign"),
  hoursSaved: integer("hours_saved").default(0),
  revenueGenerated: integer("revenue_generated").default(0),
  conversations: integer("conversations").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  botId: integer("bot_id").notNull(),
  clientName: text("client_name").notNull(),
  clientCompany: text("client_company"),
  clientAvatar: text("client_avatar").notNull(),
  lastMessage: text("last_message").notNull(),
  status: text("status").notNull(), // lead_captured, escalated, meeting_booked, completed
  duration: text("duration").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // lead_captured, call_escalation, meeting_booked, call_failed
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const metrics = pgTable("metrics", {
  id: serial("id").primaryKey(),
  botId: integer("bot_id").notNull(),
  date: timestamp("date").defaultNow(),
  callsToday: integer("calls_today").default(0),
  conversions: integer("conversions").default(0),
  newLeads: integer("new_leads").default(0),
  failedCalls: integer("failed_calls").default(0),
  callsChange: integer("calls_change").default(0),
  conversionsChange: integer("conversions_change").default(0),
  leadsChange: integer("leads_change").default(0),
  failedCallsChange: integer("failed_calls_change").default(0),
});

export const crmData = pgTable("crm_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  hotLeads: integer("hot_leads").default(0),
  followUpsDue: integer("follow_ups_due").default(0),
  pipelineValue: text("pipeline_value").default("$0"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const clientCompanies = pgTable("client_companies", {
  id: text("id").primaryKey(), // UUID for client identification
  companyName: text("company_name").notNull(),
  domain: text("domain").unique(), // company.com for email domain validation
  industry: text("industry"),
  billingStatus: text("billing_status").default("active"), // active, suspended, trial
  planType: text("plan_type").default("standard"), // trial, standard, premium, enterprise
  createdAt: timestamp("created_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const scannedContacts = pgTable("scanned_contacts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  company: text("company"),
  title: text("title"),
  email: text("email"),
  phone: text("phone"),
  website: text("website"),
  rawText: text("raw_text"), // Store original OCR text for reference
  source: text("source").default("card_scan"),
  status: text("status").default("pending"), // pending, processed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

export const knowledgeBase = pgTable("knowledge_base", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  triggerConditions: jsonb("trigger_conditions"), // Structured logic for when to use
  tags: text("tags").array(), // Multi-tiered metadata tags
  source: text("source").notNull().default("manual"), // manual, scraped, generated, transcript
  sourceUrl: text("source_url"), // Reference URL if applicable
  createdBy: text("created_by").notNull(),
  lastReviewedBy: text("last_reviewed_by"),
  lastReviewedAt: timestamp("last_reviewed_at"),
  confidence: integer("confidence").default(85), // 0-100 confidence score
  status: text("status").notNull().default("enabled"), // enabled, disabled, review_needed
  roleVisibility: text("role_visibility").array(), // Which roles can see this
  overrideBehavior: text("override_behavior").default("append"), // append, replace, conditional
  priority: integer("priority").default(50), // 1-100 priority for retrieval
  usageCount: integer("usage_count").default(0),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const knowledgeUsageLog = pgTable("knowledge_usage_log", {
  id: serial("id").primaryKey(),
  knowledgeId: integer("knowledge_id").notNull(),
  usedBy: text("used_by").notNull(), // "VoiceBot", "ZendeskBot", "ChatBot", etc.
  triggerSource: text("trigger_source").notNull(), // "voice", "chat", "form", "intent_match"
  confidence: integer("confidence").notNull(),
  successful: boolean("successful").default(true), // Did it lead to escalation?
  conversationId: text("conversation_id"), // Link to conversation if available
  usedAt: timestamp("used_at").defaultNow(),
});

export const memoryActivityLog = pgTable("memory_activity_log", {
  id: serial("id").primaryKey(),
  operation: text("operation").notNull(), // "insert", "delete", "edit", "upload"
  itemType: text("item_type").notNull(), // "Manual", "Document" 
  itemName: text("item_name").notNull(),
  category: text("category").notNull().default("general"),
  result: text("result").notNull(), // "Success", "Error"
  errorMessage: text("error_message"),
  itemId: text("item_id"),
  fileSize: integer("file_size"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const documentMetadata = pgTable("document_metadata", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  status: text("status").notNull().default("processing"), // "processing", "indexed", "failed"
  uploadTime: timestamp("upload_time").defaultNow(),
  indexedTime: timestamp("indexed_time"),
  extractedText: text("extracted_text"),
  wordCount: integer("word_count").default(0),
  keyTerms: text("key_terms").array(),
  category: text("category").default("document"),
  sourceType: text("source_type").default("file"), // "file", "text", "manual"
  isActive: boolean("is_active").default(true),
});

export const phantombusterLeads = pgTable("phantombuster_leads", {
  id: serial("id").primaryKey(),
  leadOwner: text("lead_owner").notNull(),
  source: text("source").notNull().default("Phantombuster"),
  campaignId: text("campaign_id"),
  platform: text("platform").notNull(), // LinkedIn, Instagram, etc.
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  company: text("company"),
  website: text("website"),
  title: text("title"),
  location: text("location"),
  status: text("status").default("New"),
  syncedHubspot: boolean("synced_hubspot").default(false),
  syncedYobot: boolean("synced_yobot").default(false),
  score: integer("score").default(0),
  dateAdded: text("date_added"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  role: true,
  clientId: true,
  firstName: true,
  lastName: true,
});

export const insertClientCompanySchema = createInsertSchema(clientCompanies).omit({
  createdAt: true,
});

export const insertBotSchema = createInsertSchema(bots).omit({
  id: true,
  createdAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertMetricsSchema = createInsertSchema(metrics).omit({
  id: true,
  date: true,
});

export const insertCrmDataSchema = createInsertSchema(crmData).omit({
  id: true,
  updatedAt: true,
});

export const insertScannedContactSchema = createInsertSchema(scannedContacts).omit({
  id: true,
  createdAt: true,
});

export const insertKnowledgeBaseSchema = createInsertSchema(knowledgeBase).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  usageCount: true,
  lastUsedAt: true,
});

export const insertPhantombusterLeadSchema = createInsertSchema(phantombusterLeads).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Bot = typeof bots.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Metrics = typeof metrics.$inferSelect;
export type CrmData = typeof crmData.$inferSelect;
export type ClientCompany = typeof clientCompanies.$inferSelect;
export type ScannedContact = typeof scannedContacts.$inferSelect;
export type KnowledgeBase = typeof knowledgeBase.$inferSelect;
export type PhantombusterLead = typeof phantombusterLeads.$inferSelect;
export type InsertBot = z.infer<typeof insertBotSchema>;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type InsertMetrics = z.infer<typeof insertMetricsSchema>;
export type InsertCrmData = z.infer<typeof insertCrmDataSchema>;
export type InsertClientCompany = z.infer<typeof insertClientCompanySchema>;
export type InsertScannedContact = z.infer<typeof insertScannedContactSchema>;
export type InsertKnowledgeBase = z.infer<typeof insertKnowledgeBaseSchema>;
export type InsertPhantombusterLead = z.infer<typeof insertPhantombusterLeadSchema>;
