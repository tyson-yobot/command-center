import { Request, Response } from 'express';
import { 
  logCommandCenterMetrics, 
  logIntegrationTest, 
  logLeadIntake, 
  logCallSentiment,
  logEscalation,
  logMissedCall,
  logABTest,
  logSlackAlert as logSlackAlertAirtable,
  logFallback,
  logBotHealth,
  logCRMContact,
  logSupportTicket,
  logQuoteGeneration,
  logErrorFallback,
  logEventSync,
  logSupportTicketOps,
  logClientROI,
  logSmartSpendIntake,
  testAirtableConnection
} from "./airtableIntegrations";

// Comprehensive system test endpoint
export async function runComprehensiveSystemTest(req: Request, res: Response) {
  const testResults = {
    timestamp: new Date().toISOString(),
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    integrations: {} as Record<string, any>,
    summary: ''
  };

  // Test 1: Command Center Metrics
  try {
    testResults.totalTests++;
    await logCommandCenterMetrics({
      timestamp: new Date().toISOString(),
      activeCalls: 8,
      aiResponses: 47,
      queuedJobs: 2,
      systemHealth: 97,
      responseTime: "180ms",
      connectedClients: 1,
      processingTasks: 3
    });
    testResults.passedTests++;
    testResults.integrations.commandCenterMetrics = { status: 'PASSED', table: 'Command Center - Metrics Tracker Table' };
  } catch (error: any) {
    testResults.failedTests++;
    testResults.integrations.commandCenterMetrics = { status: 'FAILED', error: error.message };
  }

  // Test 2: Lead Intake
  try {
    testResults.totalTests++;
    await logLeadIntake({
      leadName: "John Doe",
      email: "john.doe@example.com",
      phone: "+1-555-0123",
      company: "Example Corp",
      source: "Phantombuster LinkedIn Scraper",
      status: "New Lead",
      timestamp: new Date().toISOString()
    });
    testResults.passedTests++;
    testResults.integrations.leadIntake = { status: 'PASSED', table: 'Leads - Intake Table' };
  } catch (error: any) {
    testResults.failedTests++;
    testResults.integrations.leadIntake = { status: 'FAILED', error: error.message };
  }

  // Test 3: Call Sentiment Logging
  try {
    testResults.totalTests++;
    await logCallSentiment({
      callId: "call_001",
      clientName: "Test Client",
      sentiment: "Positive",
      confidence: 0.87,
      timestamp: new Date().toISOString(),
      transcript: "Customer was very satisfied with the service"
    });
    testResults.passedTests++;
    testResults.integrations.callSentiment = { status: 'PASSED', table: 'Call Sentiment Log Table' };
  } catch (error: any) {
    testResults.failedTests++;
    testResults.integrations.callSentiment = { status: 'FAILED', error: error.message };
  }

  // Test 4: Escalation Tracking
  try {
    testResults.totalTests++;
    await logEscalation({
      ticketId: "ESC_001",
      clientName: "Test Client",
      escalationType: "Technical Issue",
      priority: "High",
      timestamp: new Date().toISOString(),
      reason: "Customer unable to access dashboard"
    });
    testResults.passedTests++;
    testResults.integrations.escalationTracker = { status: 'PASSED', table: 'Escalation Tracker Table' };
  } catch (error: any) {
    testResults.failedTests++;
    testResults.integrations.escalationTracker = { status: 'FAILED', error: error.message };
  }

  // Test 5: Missed Call Logging
  try {
    testResults.totalTests++;
    await logMissedCall({
      callerName: "Jane Smith",
      phoneNumber: "+1-555-0456",
      timestamp: new Date().toISOString(),
      duration: 30,
      clientId: "client_001"
    });
    testResults.passedTests++;
    testResults.integrations.missedCallLog = { status: 'PASSED', table: 'Missed Call Log Table' };
  } catch (error: any) {
    testResults.failedTests++;
    testResults.integrations.missedCallLog = { status: 'FAILED', error: error.message };
  }

  // Test 6: A/B Testing
  try {
    testResults.totalTests++;
    await logABTest({
      testName: "Voice Response Variant A vs B",
      variant: "Variant A",
      clientId: "client_001",
      result: "Higher engagement",
      timestamp: new Date().toISOString(),
      metrics: "25% increase in conversion"
    });
    testResults.passedTests++;
    testResults.integrations.abTestLog = { status: 'PASSED', table: 'A/B Test Log Table' };
  } catch (error: any) {
    testResults.failedTests++;
    testResults.integrations.abTestLog = { status: 'FAILED', error: error.message };
  }

  // Test 7: Bot Health Monitoring
  try {
    testResults.totalTests++;
    await logBotHealth({
      clientId: "client_001",
      status: "Healthy",
      uptime: "99.9%",
      lastPing: new Date().toISOString(),
      errorCount: 0,
      timestamp: new Date().toISOString()
    });
    testResults.passedTests++;
    testResults.integrations.botHealthMonitor = { status: 'PASSED', table: 'Bot Health Monitor Table' };
  } catch (error: any) {
    testResults.failedTests++;
    testResults.integrations.botHealthMonitor = { status: 'FAILED', error: error.message };
  }

  // Test 8: CRM Contact Logging
  try {
    testResults.totalTests++;
    await logCRMContact({
      contactName: "Sarah Johnson",
      email: "sarah@techcorp.com",
      phone: "+1-555-0789",
      company: "TechCorp Industries",
      source: "LinkedIn Outreach",
      status: "Qualified Lead",
      timestamp: new Date().toISOString()
    });
    testResults.passedTests++;
    testResults.integrations.crmContacts = { status: 'PASSED', table: 'CRM Contacts Table' };
  } catch (error: any) {
    testResults.failedTests++;
    testResults.integrations.crmContacts = { status: 'FAILED', error: error.message };
  }

  // Test 9: Support Ticket Logging
  try {
    testResults.totalTests++;
    await logSupportTicket({
      ticketId: "SUP_001",
      clientName: "Test Client",
      subject: "Integration assistance needed",
      priority: "Medium",
      status: "Open",
      timestamp: new Date().toISOString(),
      assignedTo: "Support Team"
    });
    testResults.passedTests++;
    testResults.integrations.supportTicketSummary = { status: 'PASSED', table: 'Support Ticket Summary Table' };
  } catch (error: any) {
    testResults.failedTests++;
    testResults.integrations.supportTicketSummary = { status: 'FAILED', error: error.message };
  }

  // Test 10: ROI Calculation
  try {
    testResults.totalTests++;
    await logClientROI({
      clientName: "Test Client",
      monthlySpend: 5000,
      monthlySavings: 15000,
      roiPercentage: 300,
      timestamp: new Date().toISOString(),
      calculationDetails: "Automated response handling saves 40 hours/month"
    });
    testResults.passedTests++;
    testResults.integrations.clientROI = { status: 'PASSED', table: 'Client ROI Results Table' };
  } catch (error: any) {
    testResults.failedTests++;
    testResults.integrations.clientROI = { status: 'FAILED', error: error.message };
  }

  // Calculate summary
  const passRate = Math.round((testResults.passedTests / testResults.totalTests) * 100);
  testResults.summary = `${testResults.passedTests}/${testResults.totalTests} integrations tested successfully (${passRate}% pass rate)`;

  res.json({
    success: true,
    message: "Comprehensive system test completed",
    results: testResults,
    nextSteps: testResults.failedTests > 0 ? 
      "Some integrations require Airtable API credentials to function" : 
      "All integrations ready for production use"
  });
}

// List all available integrations
export function listAllIntegrations(req: Request, res: Response) {
  const integrations = {
    commandCenter: {
      baseId: 'appRt8V3tH4g5Z51f',
      tables: [
        'Command Center - Metrics Tracker Table',
        'Integration QA Tracker Table',
        'Integration Test Log Table',
        'Completed Integration QA Table',
        'Client Instances Table',
        'Leads - Intake Table',
        'Industry Templates Table',
        'Client Intake Table'
      ]
    },
    opsAlerts: {
      baseId: 'appCoAtCZdARb4A4F',
      tables: [
        'SmartSpend - Slack Logs Table',
        'Error + Fallback Log Table',
        'Event Sync Log Table',
        'Support Ticket Log Table'
      ]
    },
    clientCRM: {
      baseId: 'appMbVQJ0n3nWR11N',
      tables: [
        'Client Bookings Table',
        'Team Members Table',
        'Deal Milestones Table',
        'Quote Generator Logs Table',
        'CRM Contacts Table',
        'Rep Assignment Tracker Table',
        'Invoice Tracking Table',
        'Support Ticket Summary Table'
      ]
    },
    salesAutomation: {
      baseId: 'appe05t1B1tn1Kn5',
      tables: [
        'Sales Orders Table',
        'Bot Packages Table',
        'Add-On Modules Table',
        'QA Call Review Table',
        'Call Recording Tracker Table',
        'NLP Keyword Tracker Table',
        'Call Sentiment Log Table',
        'Escalation Tracker Table',
        'Client Touchpoint Log Table',
        'Missed Call Log Table',
        'A/B Test Log Table',
        'Slack Alerts Log Table',
        'Integration Sync Tracker Table',
        'Personality Pack Tracker Table',
        'Voicebot Performance Dashboard Log Table',
        'Fallback Log Table',
        'Bot Health Monitor Table',
        'Revenue Forecast Log Table',
        'Client Pulse Tracker Table',
        'Ops Metrics Log Table',
        'Client Tier View Table',
        'Command Center Wiring Tracker Table',
        'Contract Status Tracker Table',
        'CRM + Voice Audit Log Table',
        'Suggestions Push Log Table',
        'Manual Review Queue Table',
        'Follow-Up Scheduler Log Table',
        'Support Metrics Rollup Table',
        'Support Settings Table',
        'Internal Config Table',
        'Stripe Price Tracker (Live) Table',
        'Stripe Products Table',
        'Compliance Checklist Log Table',
        'Airtable Schema Documentation Table',
        'Tone Response Variant Library Table'
      ]
    },
    roiCalculator: {
      baseId: 'appbFDTqB2WtRNV1H',
      tables: [
        'Client ROI Results Table',
        'Botalytics - ROI'
      ]
    },
    smartSpendTracker: {
      baseId: 'appGtcRZUd0JqnkQS',
      tables: [
        'SmartSpend Master Table',
        'SmartSpend - Budget & ROI Tracker Table',
        'SmartSpend Intake Submissions Table',
        'Imported Table',
        'Dashboard Intake Visual Table'
      ]
    }
  };

  res.json({
    totalBases: 6,
    totalTables: 64,
    integrations,
    endpoints: {
      testConnection: 'GET /api/airtable/test-connection',
      runSystemTest: 'POST /api/airtable/run-system-test',
      logMetrics: 'POST /api/airtable/log-metrics',
      logLeadIntake: 'POST /api/airtable/log-lead-intake',
      logCallSentiment: 'POST /api/airtable/log-call-sentiment',
      logEscalation: 'POST /api/airtable/log-escalation',
      logMissedCall: 'POST /api/airtable/log-missed-call',
      logABTest: 'POST /api/airtable/log-ab-test',
      logBotHealth: 'POST /api/airtable/log-bot-health',
      logCRMContact: 'POST /api/airtable/log-crm-contact',
      logSupportTicket: 'POST /api/airtable/log-support-ticket',
      logQuoteGeneration: 'POST /api/airtable/log-quote-generation',
      logErrorFallback: 'POST /api/airtable/log-error-fallback',
      logEventSync: 'POST /api/airtable/log-event-sync',
      logClientROI: 'POST /api/airtable/log-client-roi',
      logSmartSpendIntake: 'POST /api/airtable/log-smartspend-intake'
    }
  });
}