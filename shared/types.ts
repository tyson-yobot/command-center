/**
 * Production Types for Command Center Automation System
 * Centralized type definitions for full-stack type safety
 */

// Core feature modules in the automation system
export type FeatureKey = 
  | 'knowledge-base'
  | 'user-management'
  | 'analytics'
  | 'notifications'
  | 'calendar'
  | 'tasks'
  | 'workflows'
  | 'integrations'
  | 'reporting'
  | 'ai-assistant';

// Airtable configuration mapping
export interface AirtableFeatureConfig {
  baseId: string;
  tableName: string;
  primaryField: string;
  description: string;
}

export const FEATURE_CONFIG: Record<FeatureKey, AirtableFeatureConfig> = {
  'knowledge-base': {
    baseId: process.env.AIRTABLE_KNOWLEDGE_BASE_ID || '',
    tableName: '📚 Knowledge Sources Table',
    primaryField: '🧠 Title',
    description: 'Document and knowledge management system'
  },
  'user-management': {
    baseId: process.env.AIRTABLE_USERS_BASE_ID || '',
    tableName: '👥 Users Table',
    primaryField: 'Name',
    description: 'User accounts and permissions'
  },
  'analytics': {
    baseId: process.env.AIRTABLE_ANALYTICS_BASE_ID || '',
    tableName: '📊 Analytics Table',
    primaryField: 'Metric Name',
    description: 'System metrics and performance data'
  },
  'notifications': {
    baseId: process.env.AIRTABLE_NOTIFICATIONS_BASE_ID || '',
    tableName: '🔔 Notifications Table',
    primaryField: 'Message',
    description: 'System notifications and alerts'
  },
  'calendar': {
    baseId: process.env.AIRTABLE_CALENDAR_BASE_ID || '',
    tableName: '📅 Calendar Table',
    primaryField: 'Event Name',
    description: 'Calendar events and scheduling'
  },
  'tasks': {
    baseId: process.env.AIRTABLE_TASKS_BASE_ID || '',
    tableName: '✅ Tasks Table',
    primaryField: 'Task Name',
    description: 'Task management and tracking'
  },
  'workflows': {
    baseId: process.env.AIRTABLE_WORKFLOWS_BASE_ID || '',
    tableName: '🔄 Workflows Table',
    primaryField: 'Workflow Name',
    description: 'Automation workflows and processes'
  },
  'integrations': {
    baseId: process.env.AIRTABLE_INTEGRATIONS_BASE_ID || '',
    tableName: '🔗 Integrations Table',
    primaryField: 'Integration Name',
    description: 'Third-party integrations and APIs'
  },
  'reporting': {
    baseId: process.env.AIRTABLE_REPORTING_BASE_ID || '',
    tableName: '📋 Reports Table',
    primaryField: 'Report Name',
    description: 'System reports and dashboards'
  },
  'ai-assistant': {
    baseId: process.env.AIRTABLE_AI_BASE_ID || '',
    tableName: '🤖 AI Assistant Table',
    primaryField: 'Conversation ID',
    description: 'AI assistant interactions and context'
  }
};

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface AirtableRecord<T = any> {
  id: string;
  fields: T;
  createdTime?: string;
}

export interface PaginatedResponse<T> {
  records: T[];
  offset?: string;
  hasMore: boolean;
  totalCount?: number;
}

// Knowledge Base specific types
export interface KnowledgeBaseRecord {
  '🧠 Title': string;
  '📄 Content': string;
  '🔗 Source URL': string;
  '📎 File Attachment'?: Array<{ url: string }>;
  '🏷️ Tags': string[];
  '🧩 Vector ID': string;
  '⏱️ Last Ingested': string;
  '🔁 Needs Reindexing?': boolean;
}

export interface IngestionLogRecord {
  '🧾 Document Title': string;
  '🔍 Result': 'Success' | 'Error';
  '📅 Run Timestamp': string;
  '🔧 Triggered By': string;
  '📄 Error Details': string;
}