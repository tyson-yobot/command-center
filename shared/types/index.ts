export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface AirtableRecord<T = Record<string, any>> {
  id: string;
  fields: T;
  createdTime?: string;
}

export interface KnowledgeBaseRecord {
  id: string;
  title: string;
  content: string;
  type: 'pdf' | 'docx' | 'txt';
  uploadedAt: string;
  tags?: string[];
}

export type FeatureKey = 
  | 'knowledge-base'
  | 'users'
  | 'analytics'
  | 'notifications'
  | 'tasks'
  | 'projects';

export const FEATURE_CONFIG: Record<FeatureKey, {
  baseId: string;
  tableName: string;
  description: string;
}> = {
  'knowledge-base': {
    baseId: process.env.AIRTABLE_BASE_ID || '',
    tableName: 'Knowledge Base',
    description: 'Document management and knowledge base'
  },
  'users': {
    baseId: process.env.AIRTABLE_BASE_ID || '',
    tableName: 'Users',
    description: 'User management'
  },
  'analytics': {
    baseId: process.env.AIRTABLE_BASE_ID || '',
    tableName: 'Analytics',
    description: 'Analytics and reporting'
  },
  'notifications': {
    baseId: process.env.AIRTABLE_BASE_ID || '',
    tableName: 'Notifications',
    description: 'Notification management'
  },
  'tasks': {
    baseId: process.env.AIRTABLE_BASE_ID || '',
    tableName: 'Tasks',
    description: 'Task management'
  },
  'projects': {
    baseId: process.env.AIRTABLE_BASE_ID || '',
    tableName: 'Projects',
    description: 'Project management'
  }
};