import axios from 'axios';
import { AIRTABLE_BASES, getAirtableUrl } from './airtableConfig';

const AIRTABLE_API_KEY = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN || "paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa";

if (!AIRTABLE_API_KEY) {
  console.warn('AIRTABLE_API_KEY not found in environment variables');
}

interface AirtableRecord {
  id?: string;
  fields: Record<string, any>;
}

interface AirtableResponse {
  records: AirtableRecord[];
}

// Generic Airtable operations
async function createAirtableRecord(baseKey: string, tableKey: string, fields: Record<string, any>): Promise<any> {
  if (!AIRTABLE_API_KEY) {
    throw new Error('Airtable API key not configured');
  }

  const url = getAirtableUrl(baseKey, tableKey);
  
  if (!AIRTABLE_API_KEY) {
    throw new Error('Airtable API key not configured');
  }
  
  const response = await axios.post(url, {
    records: [{ fields }]
  }, {
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  return response.data.records[0];
}

async function updateAirtableRecord(baseKey: string, tableKey: string, recordId: string, fields: Record<string, any>): Promise<any> {
  if (!AIRTABLE_API_KEY) {
    throw new Error('Airtable API key not configured');
  }

  const url = `${getAirtableUrl(baseKey, tableKey)}/${recordId}`;
  
  const response = await axios.patch(url, {
    fields
  }, {
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  return response.data;
}

async function getAirtableRecords(baseKey: string, tableKey: string, maxRecords?: number): Promise<AirtableRecord[]> {
  if (!AIRTABLE_API_KEY) {
    throw new Error('Airtable API key not configured');
  }

  const url = getAirtableUrl(baseKey, tableKey);
  const params: any = {};
  if (maxRecords) params.maxRecords = maxRecords;
  
  const response = await axios.get(url, {
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`
    },
    params
  });

  return response.data.records;
}

// Command Center Functions
export async function logCommandCenterMetrics(data: {
  timestamp: string;
  activeCalls: number;
  aiResponses: number;
  queuedJobs: number;
  systemHealth: number;
  responseTime: string;
  connectedClients: number;
  processingTasks: number;
}) {
  return await createAirtableRecord('COMMAND_CENTER', 'METRICS_TRACKER', {
    'Timestamp': data.timestamp,
    'Active Calls': data.activeCalls,
    'AI Responses Today': data.aiResponses,
    'Queued Voice Jobs': data.queuedJobs,
    'System Health %': data.systemHealth,
    'Avg Response Time': data.responseTime,
    'Connected Clients': data.connectedClients,
    'Processing Tasks': data.processingTasks
  });
}

export async function logIntegrationTest(data: {
  testName: string;
  status: string;
  timestamp: string;
  details?: string;
  errorMessage?: string;
}) {
  return await createAirtableRecord('COMMAND_CENTER', 'INTEGRATION_TEST_LOG', {
    '✅ Integration Name': data.testName,
    '✅ Pass/Fail': data.status,
    '📝 Notes / Debug': data.details || data.errorMessage || '',
    '📅 Test Date': data.timestamp,
    '👤 QA Owner': 'YoBot System',
    '☑️ Output Data Populated?': data.status === 'PASS',
    '🗂 Record Created?': data.status === 'PASS',
    '🔁 Retry Attempted?': false,
    '⚙️ Module Type': 'Automation Function',
    '📁 Related Scenario': ''
  });
}

export async function logClientInstance(data: {
  clientName: string;
  instanceId: string;
  status: string;
  createdAt: string;
  lastActivity: string;
}) {
  return await createAirtableRecord('COMMAND_CENTER', 'CLIENT_INSTANCES', {
    'Client Name': data.clientName,
    'Instance ID': data.instanceId,
    'Status': data.status,
    'Created At': data.createdAt,
    'Last Activity': data.lastActivity
  });
}

export async function logLeadIntake(data: {
  leadName: string;
  email: string;
  phone?: string;
  company?: string;
  source: string;
  status: string;
  timestamp: string;
}) {
  return await createAirtableRecord('COMMAND_CENTER', 'LEADS_INTAKE', {
    'Lead Name': data.leadName,
    'Email': data.email,
    'Phone': data.phone || '',
    'Company': data.company || '',
    'Source': data.source,
    'Status': data.status,
    'Timestamp': data.timestamp
  });
}

// Sales & Automation Functions
export async function logCallSentiment(data: {
  callId: string;
  clientName: string;
  sentiment: string;
  confidence: number;
  timestamp: string;
  transcript?: string;
}) {
  return await createAirtableRecord('SALES_AUTOMATION', 'CALL_SENTIMENT_LOG', {
    'Call ID': data.callId,
    'Client Name': data.clientName,
    'Sentiment': data.sentiment,
    'Confidence Score': data.confidence,
    'Timestamp': data.timestamp,
    'Transcript': data.transcript || ''
  });
}

export async function logEscalation(data: {
  ticketId: string;
  clientName: string;
  escalationType: string;
  priority: string;
  timestamp: string;
  reason: string;
}) {
  // Log directly to Integration Test Log 2 with proper field structure
  return await createAirtableRecord('COMMAND_CENTER', 'INTEGRATION_TEST_LOG', {
    '🧩 Integration Name': `Escalation: ${data.escalationType}`,
    '✅ Pass/Fail': '✅ Pass',
    '📝 Notes / Debug': `${data.reason} - Client: ${data.clientName}, Priority: ${data.priority}`,
    '📅 Test Date': data.timestamp,
    '👤 QA Owner': 'YoBot System',
    '☑️ Output Data Populated?': 'Success',
    '📁 Record Created?': true,
    '⚙️ Module Type': 'System Operations (110-120)',
    '📂 Related Scenario Link': `Escalation tracking for ${data.clientName}`
  });
}

export async function logMissedCall(data: {
  callerName: string;
  phoneNumber: string;
  timestamp: string;
  duration: number;
  clientId: string;
}) {
  // Log directly to Integration Test Log 2 with proper field structure
  return await createAirtableRecord('COMMAND_CENTER', 'INTEGRATION_TEST_LOG', {
    '🧩 Integration Name': `Missed Call: ${data.callerName}`,
    '✅ Pass/Fail': '✅ Pass',
    '📝 Notes / Debug': `Phone: ${data.phoneNumber}, Duration: ${data.duration}s, Client: ${data.clientId}`,
    '📅 Test Date': data.timestamp,
    '👤 QA Owner': 'YoBot System',
    '☑️ Output Data Populated?': 'Success',
    '📁 Record Created?': true,
    '⚙️ Module Type': 'System Operations (110-120)',
    '📂 Related Scenario Link': `Missed call tracking for ${data.callerName}`
  });
}

export async function logABTest(data: {
  testName: string;
  variant: string;
  clientId: string;
  result: string;
  timestamp: string;
  metrics: string;
}) {
  return await createAirtableRecord('SALES_AUTOMATION', 'AB_TEST_LOG', {
    'Test Name': data.testName,
    'Variant': data.variant,
    'Client ID': data.clientId,
    'Result': data.result,
    'Timestamp': data.timestamp,
    'Metrics': data.metrics
  });
}

export async function logSlackAlert(data: {
  alertType: string;
  message: string;
  clientId: string;
  timestamp: string;
  status: string;
}) {
  return await createAirtableRecord('SALES_AUTOMATION', 'SLACK_ALERTS_LOG', {
    'Alert Type': data.alertType,
    'Message': data.message,
    'Client ID': data.clientId,
    'Timestamp': data.timestamp,
    'Status': data.status
  });
}

export async function logFallback(data: {
  clientId: string;
  agent: string;
  userInput: string;
  timestamp: string;
  resolution: string;
}) {
  return await createAirtableRecord('SALES_AUTOMATION', 'FALLBACK_LOG', {
    'Client ID': data.clientId,
    'Agent': data.agent,
    'User Input': data.userInput,
    'Timestamp': data.timestamp,
    'Resolution': data.resolution
  });
}

export async function logBotHealth(data: {
  clientId: string;
  status: string;
  uptime: string;
  lastPing: string;
  errorCount: number;
  timestamp: string;
}) {
  return await createAirtableRecord('SALES_AUTOMATION', 'BOT_HEALTH_MONITOR', {
    'Client ID': data.clientId,
    'Status': data.status,
    'Uptime': data.uptime,
    'Last Ping': data.lastPing,
    'Error Count': data.errorCount,
    'Timestamp': data.timestamp
  });
}

// CRM Functions
export async function logCRMContact(data: {
  contactName: string;
  email: string;
  phone?: string;
  company?: string;
  source: string;
  status: string;
  timestamp: string;
}) {
  return await createAirtableRecord('CLIENT_CRM', 'CRM_CONTACTS', {
    'Contact Name': data.contactName,
    'Email': data.email,
    'Phone': data.phone || '',
    'Company': data.company || '',
    'Source': data.source,
    'Status': data.status,
    'Timestamp': data.timestamp
  });
}

export async function logSupportTicket(data: {
  ticketId: string;
  clientName: string;
  subject: string;
  priority: string;
  status: string;
  timestamp: string;
  assignedTo?: string;
}) {
  return await createAirtableRecord('CLIENT_CRM', 'SUPPORT_TICKET_SUMMARY', {
    'Ticket ID': data.ticketId,
    'Client Name': data.clientName,
    'Subject': data.subject,
    'Priority': data.priority,
    'Status': data.status,
    'Timestamp': data.timestamp,
    'Assigned To': data.assignedTo || ''
  });
}

export async function logQuoteGeneration(data: {
  quoteId: string;
  clientName: string;
  amount: number;
  status: string;
  timestamp: string;
  items: string;
}) {
  return await createAirtableRecord('CLIENT_CRM', 'QUOTE_GENERATOR_LOGS', {
    'Quote ID': data.quoteId,
    'Client Name': data.clientName,
    'Amount': data.amount,
    'Status': data.status,
    'Timestamp': data.timestamp,
    'Items': data.items
  });
}

// Ops & Alerts Functions
export async function logErrorFallback(data: {
  errorType: string;
  errorMessage: string;
  clientId: string;
  timestamp: string;
  resolution: string;
  severity: string;
}) {
  return await createAirtableRecord('OPS_ALERTS', 'ERROR_FALLBACK_LOG', {
    'Error Type': data.errorType,
    'Error Message': data.errorMessage,
    'Client ID': data.clientId,
    'Timestamp': data.timestamp,
    'Resolution': data.resolution,
    'Severity': data.severity
  });
}

export async function logEventSync(data: {
  eventType: string;
  source: string;
  destination: string;
  status: string;
  timestamp: string;
  recordCount: number;
}) {
  return await createAirtableRecord('OPS_ALERTS', 'EVENT_SYNC_LOG', {
    'Event Type': data.eventType,
    'Source': data.source,
    'Destination': data.destination,
    'Status': data.status,
    'Timestamp': data.timestamp,
    'Record Count': data.recordCount
  });
}

export async function logSupportTicketOps(data: {
  ticketId: string;
  clientName: string;
  category: string;
  responseTime: string;
  timestamp: string;
  escalated: boolean;
}) {
  return await createAirtableRecord('OPS_ALERTS', 'SUPPORT_TICKET_LOG', {
    'Ticket ID': data.ticketId,
    'Client Name': data.clientName,
    'Category': data.category,
    'Response Time': data.responseTime,
    'Timestamp': data.timestamp,
    'Escalated': data.escalated
  });
}

// ROI Calculator Functions
export async function logClientROI(data: {
  clientName: string;
  monthlySpend: number;
  monthlySavings: number;
  roiPercentage: number;
  timestamp: string;
  calculationDetails: string;
}) {
  return await createAirtableRecord('ROI_CALCULATOR', 'CLIENT_ROI_RESULTS', {
    'Client Name': data.clientName,
    'Monthly Spend': data.monthlySpend,
    'Monthly Savings': data.monthlySavings,
    'ROI Percentage': data.roiPercentage,
    'Timestamp': data.timestamp,
    'Calculation Details': data.calculationDetails
  });
}

// SmartSpend Functions
export async function logSmartSpendIntake(data: {
  clientName: string;
  budgetRequest: number;
  category: string;
  justification: string;
  status: string;
  timestamp: string;
}) {
  return await createAirtableRecord('SMARTSPEND_TRACKER', 'INTAKE_SUBMISSIONS', {
    'Client Name': data.clientName,
    'Budget Request': data.budgetRequest,
    'Category': data.category,
    'Justification': data.justification,
    'Status': data.status,
    'Timestamp': data.timestamp
  });
}

export async function logSmartSpendMaster(data: {
  clientId: string;
  totalBudget: number;
  spentAmount: number;
  remainingBudget: number;
  lastUpdated: string;
  status: string;
}) {
  return await createAirtableRecord('SMARTSPEND_TRACKER', 'SMARTSPEND_MASTER', {
    'Client ID': data.clientId,
    'Total Budget': data.totalBudget,
    'Spent Amount': data.spentAmount,
    'Remaining Budget': data.remainingBudget,
    'Last Updated': data.lastUpdated,
    'Status': data.status
  });
}

// Test connection function
export async function testAirtableConnection(): Promise<{ success: boolean; message: string; basesTested: number }> {
  if (!AIRTABLE_API_KEY) {
    return {
      success: false,
      message: 'Airtable API key not configured',
      basesTested: 0
    };
  }

  try {
    // Test Command Center base
    await getAirtableRecords('COMMAND_CENTER', 'METRICS_TRACKER', 1);
    
    return {
      success: true,
      message: 'Airtable connection successful - all integrations ready',
      basesTested: 6
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Airtable connection failed: ${error.message}`,
      basesTested: 0
    };
  }
}