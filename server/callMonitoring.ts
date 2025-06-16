/**
 * Call Monitoring System with Real Data Connections
 * Handles call simulation, monitoring, and live metrics
 */
import express from 'express';
import { airtableLive } from './airtableLiveIntegration';
import { createAuditEntry } from './auditEscalation';

interface CallSession {
  id: string;
  startTime: string;
  endTime?: string;
  duration: number;
  status: 'active' | 'completed' | 'failed';
  phoneNumber: string;
  clientName: string;
  outcome: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

interface MonitoringService {
  name: string;
  status: 'ACTIVE' | 'RESTARTING' | 'IDLE';
  lastPing: string;
  uptime: number;
}

let activeCallSessions: CallSession[] = [];
let monitoringServices: MonitoringService[] = [
  { name: 'monitoring', status: 'ACTIVE', lastPing: new Date().toISOString(), uptime: 3600 },
  { name: 'recording', status: 'ACTIVE', lastPing: new Date().toISOString(), uptime: 3600 }
];

export function registerCallMonitoring(app: express.Application) {
  // Simulate test call
  app.post('/api/calls/simulate', async (req, res) => {
    try {
      const { phoneNumber, clientName, duration = 120 } = req.body;
      
      const callSession = await simulateCall(phoneNumber, clientName, duration);
      
      res.json({
        success: true,
        data: callSession,
        message: 'Call simulation started successfully'
      });
    } catch (error) {
      console.error('Call simulation failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to start call simulation'
      });
    }
  });

  // Get call monitoring metrics
  app.get('/api/calls/metrics', async (req, res) => {
    try {
      const metrics = await getCallMetrics();
      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      console.error('Failed to fetch call metrics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch call metrics'
      });
    }
  });

  // Get active call sessions
  app.get('/api/calls/active', async (req, res) => {
    try {
      const activeCalls = activeCallSessions.filter(call => call.status === 'active');
      res.json({
        success: true,
        data: activeCalls
      });
    } catch (error) {
      console.error('Failed to fetch active calls:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch active calls'
      });
    }
  });

  // Service control endpoints
  app.post('/api/services/:serviceName/:action', async (req, res) => {
    try {
      const { serviceName, action } = req.params;
      const result = await handleServiceAction(serviceName, action);
      
      res.json({
        success: true,
        data: result,
        message: `Service ${serviceName} ${action} completed`
      });
    } catch (error) {
      console.error('Service action failed:', error);
      res.status(500).json({
        success: false,
        error: 'Service action failed'
      });
    }
  });

  // Get service status
  app.get('/api/services/status', async (req, res) => {
    try {
      const services = await getServiceStatus();
      res.json({
        success: true,
        data: services
      });
    } catch (error) {
      console.error('Failed to fetch service status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch service status'
      });
    }
  });

  // Get call history from Airtable
  app.get('/api/calls/history', async (req, res) => {
    try {
      const { limit = 50 } = req.query;
      const callHistory = await getCallHistory(Number(limit));
      
      res.json({
        success: true,
        data: callHistory
      });
    } catch (error) {
      console.error('Failed to fetch call history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch call history'
      });
    }
  });
}

async function simulateCall(phoneNumber: string, clientName: string, duration: number): Promise<CallSession> {
  const callSession: CallSession = {
    id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    startTime: new Date().toISOString(),
    duration: 0,
    status: 'active',
    phoneNumber: phoneNumber || '+1-555-0199',
    clientName: clientName || 'Test Client',
    outcome: 'In Progress',
    sentiment: 'neutral'
  };

  activeCallSessions.push(callSession);

  // Log call start to audit system
  await createAuditEntry(
    'Call Simulation Started',
    'call-monitoring',
    'low',
    `Started call simulation to ${callSession.phoneNumber} for ${callSession.clientName}`
  );

  // Simulate call progression
  setTimeout(async () => {
    const sessionIndex = activeCallSessions.findIndex(call => call.id === callSession.id);
    if (sessionIndex !== -1) {
      activeCallSessions[sessionIndex] = {
        ...activeCallSessions[sessionIndex],
        endTime: new Date().toISOString(),
        duration: duration,
        status: 'completed',
        outcome: 'Successful Contact',
        sentiment: 'positive'
      };

      // Log to Airtable
      await logCallToAirtable(activeCallSessions[sessionIndex]);
      
      // Log completion to audit
      await createAuditEntry(
        'Call Simulation Completed',
        'call-monitoring',
        'low',
        `Call completed successfully - Duration: ${duration}s, Outcome: Successful Contact`
      );
    }
  }, 5000); // Complete after 5 seconds for demo

  return callSession;
}

async function logCallToAirtable(callSession: CallSession): Promise<void> {
  try {
    await airtableLive.createSalesOrder({
      'Bot Package': 'Voice Call Log',
      'Add-Ons': [callSession.outcome, callSession.sentiment],
      'Total': callSession.duration,
      'Status': callSession.status,
      'Client Email': `${callSession.phoneNumber}@call.log`,
      'Client Name': callSession.clientName,
      'Order Date': callSession.startTime,
      'Payment Status': `Duration: ${callSession.duration}s`
    });

    console.log(`Call logged to Airtable: ${callSession.id}`);
  } catch (error) {
    console.error('Failed to log call to Airtable:', error);
  }
}

async function getCallMetrics(): Promise<any> {
  try {
    // Get call data from Airtable
    const salesOrders = await airtableLive.getSalesOrders();
    const callLogs = salesOrders.filter(order => 
      order.fields['Bot Package'] === 'Voice Call Log'
    );

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const todayCalls = callLogs.filter(call => {
      const callDate = new Date(call.fields['Order Date']);
      return callDate >= todayStart;
    });

    const completedCalls = callLogs.filter(call => 
      call.fields['Status'] === 'completed'
    );

    const totalDuration = callLogs.reduce((sum, call) => {
      return sum + (call.fields['Total'] || 0);
    }, 0);

    const averageDuration = callLogs.length > 0 ? totalDuration / callLogs.length : 0;
    const successRate = callLogs.length > 0 ? (completedCalls.length / callLogs.length) * 100 : 0;

    return {
      totalCalls: callLogs.length,
      callsToday: todayCalls.length,
      activeCalls: activeCallSessions.filter(call => call.status === 'active').length,
      averageDuration: Math.round(averageDuration),
      successRate: Math.round(successRate),
      totalDuration: Math.round(totalDuration),
      lastCall: callLogs.length > 0 ? callLogs[0].fields['Order Date'] : null
    };
  } catch (error) {
    console.error('Failed to calculate call metrics:', error);
    return {
      totalCalls: 0,
      callsToday: 0,
      activeCalls: 0,
      averageDuration: 0,
      successRate: 0,
      totalDuration: 0,
      lastCall: null
    };
  }
}

async function handleServiceAction(serviceName: string, action: string): Promise<any> {
  const service = monitoringServices.find(s => s.name === serviceName);
  
  if (!service) {
    throw new Error(`Service ${serviceName} not found`);
  }

  switch (action) {
    case 'start':
      service.status = 'ACTIVE';
      service.lastPing = new Date().toISOString();
      break;
    case 'restart':
      service.status = 'RESTARTING';
      setTimeout(() => {
        service.status = 'ACTIVE';
        service.lastPing = new Date().toISOString();
      }, 2000);
      break;
    case 'ping':
      service.lastPing = new Date().toISOString();
      break;
    default:
      throw new Error(`Unknown action: ${action}`);
  }

  // Log service action
  await createAuditEntry(
    `Service ${serviceName} ${action}`,
    'service-control',
    'low',
    `Service action performed: ${serviceName} - ${action}`
  );

  return {
    serviceName,
    action,
    status: service.status,
    lastPing: service.lastPing
  };
}

async function getServiceStatus(): Promise<MonitoringService[]> {
  return monitoringServices.map(service => ({
    ...service,
    uptime: Math.floor(Date.now() / 1000) - service.uptime
  }));
}

async function getCallHistory(limit: number): Promise<any[]> {
  try {
    const salesOrders = await airtableLive.getSalesOrders();
    const callHistory = salesOrders
      .filter(order => order.fields['Bot Package'] === 'Voice Call Log')
      .slice(0, limit)
      .map(call => ({
        id: call.id,
        clientName: call.fields['Client Name'],
        phoneNumber: call.fields['Client Email']?.replace('@call.log', ''),
        startTime: call.fields['Order Date'],
        duration: call.fields['Total'] || 0,
        outcome: call.fields['Add-Ons']?.[0] || 'Unknown',
        sentiment: call.fields['Add-Ons']?.[1] || 'neutral',
        status: call.fields['Status']
      }));

    return callHistory;
  } catch (error) {
    console.error('Failed to fetch call history from Airtable:', error);
    return [];
  }
}

export { simulateCall, getCallMetrics, handleServiceAction };