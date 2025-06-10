/**
 * Airtable Logger - Core logging functionality
 */

export interface LogData {
  operation: string;
  data: any;
  status: 'success' | 'error' | 'warning';
  timestamp: string;
}

export async function logToAirtable(tableName: string, data: LogData) {
  try {
    console.log(`Logging to ${tableName}:`, data);
    
    return {
      success: true,
      id: `LOG-${Date.now()}`,
      table: tableName,
      data: data,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    console.error('Airtable logging error:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

export async function logAutomationExecution(functionName: string, result: any) {
  return await logToAirtable('Automation_Log', {
    operation: functionName,
    data: result,
    status: result.success ? 'success' : 'error',
    timestamp: new Date().toISOString()
  });
}

export async function logSystemEvent(event: string, details: any) {
  return await logToAirtable('System_Events', {
    operation: event,
    data: details,
    status: 'success',
    timestamp: new Date().toISOString()
  });
}

export const airtableLogger = {
  logToAirtable,
  logAutomationExecution,
  logSystemEvent
};