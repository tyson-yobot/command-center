import Airtable from 'airtable';

// Configure Airtable
const airtable = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
});

// ---------------- Type definitions ----------------
export interface AirtableRecord<T = Record<string, any>> {
  id: string;
  fields: T;
  createdTime?: string;
}

<<<<<<< HEAD
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// ---------------- Core Airtable functions ----------------
export async function createRecord(
  baseId: string,
  tableName: string,
  fields: Record<string, any>
): Promise<AirtableRecord> {
  const base = airtable.base(baseId);
  const record = await base(tableName).create(fields);
  
  return {
    id: record.id,
    fields: record.fields,
    createdTime: record.get('createdTime') as string
  };
}

export async function getTable(
  baseId: string,
  tableName: string,
  options?: {
    view?: string;
    formula?: string;
    maxRecords?: number;
  }
): Promise<AirtableRecord[]> {
  const base = airtable.base(baseId);
  const records = await base(tableName).select({
    view: options?.view,
    filterByFormula: options?.formula,
    maxRecords: options?.maxRecords
  }).all();
  
  return records.map(record => ({
    id: record.id,
    fields: record.fields,
    createdTime: record.get('createdTime') as string
  }));
}

export async function getRecord(
  baseId: string,
  tableName: string,
  recordId: string
): Promise<AirtableRecord> {
  const base = airtable.base(baseId);
  const record = await base(tableName).find(recordId);
  
  return {
    id: record.id,
    fields: record.fields,
    createdTime: record.get('createdTime') as string
  };
}

export async function updateRecord(
  baseId: string,
  tableName: string,
  recordId: string,
  fields: Record<string, any>
): Promise<AirtableRecord> {
  const base = airtable.base(baseId);
  const record = await base(tableName).update(recordId, fields);
  
  return {
    id: record.id,
    fields: record.fields,
    createdTime: record.get('createdTime') as string
  };
}

export async function deleteRecord(
  baseId: string,
  tableName: string,
  recordId: string
): Promise<void> {
  const base = airtable.base(baseId);
  await base(tableName).destroy(recordId);
}

export function createApiResponse<T>(
  success: boolean,
  data?: T,
  error?: string
): ApiResponse<T> {
  return {
    success,
    data,
    error,
    timestamp: new Date().toISOString()
  };
}

export function logOperation(operation: string, details: any): void {
  console.log(`[Airtable] ${operation}:`, details);
}
=======
// Helper function to get base ID
export function getBaseId(baseKey: string): string {
  const bases = AIRTABLE_BASES as any;
  const base = bases[baseKey];
  if (!base) throw new Error(`Base ${baseKey} not found`);
  return base.baseId;
}
>>>>>>> origin/codex/add-newline-at-eof-for-specified-files
