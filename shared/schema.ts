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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Bot = typeof bots.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Metrics = typeof metrics.$inferSelect;
export type CrmData = typeof crmData.$inferSelect;
export type ClientCompany = typeof clientCompanies.$inferSelect;
export type ScannedContact = typeof scannedContacts.$inferSelect;
export type InsertBot = z.infer<typeof insertBotSchema>;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type InsertMetrics = z.infer<typeof insertMetricsSchema>;
export type InsertCrmData = z.infer<typeof insertCrmDataSchema>;
export type InsertClientCompany = z.infer<typeof insertClientCompanySchema>;
export type InsertScannedContact = z.infer<typeof insertScannedContactSchema>;
