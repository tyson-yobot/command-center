/**
 * System Audit and Escalation Tracking
 * Monitors system events, escalations, and provides audit logs
 */
import express from 'express';
import { airtableLive } from './airtableLiveIntegration';

interface AuditEntry {
  id: string;
  timestamp: string;
  event: string;
  source: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
  resolved: boolean;
}

interface EscalationAlert {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  acknowledged: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export function registerAuditEscalation(app: express.Application) {
  // Get system audit log
  app.get('/api/audit/log', async (req, res) => {
    try {
      const { limit = 50, severity } = req.query;
      const auditLog = await getAuditLog(Number(limit), severity as string);
      
      res.json({
        success: true,
        data: auditLog
      });
    } catch (error) {
      console.error('Failed to fetch audit log:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch audit log'
      });
    }
  });

  // Create audit entry
  app.post('/api/audit/log', async (req, res) => {
    try {
      const { event, source, severity = 'medium', details } = req.body;
      
      if (!event || !source) {
        return res.status(400).json({
          success: false,
          error: 'Event and source are required'
        });
      }

      const auditEntry = await createAuditEntry(event, source, severity, details);
      
      res.json({
        success: true,
        data: auditEntry
      });
    } catch (error) {
      console.error('Failed to create audit entry:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create audit entry'
      });
    }
  });

  // Get escalation alerts
  app.get('/api/escalation/alerts', async (req, res) => {
    try {
      const alerts = await getEscalationAlerts();
      res.json({
        success: true,
        data: alerts
      });
    } catch (error) {
      console.error('Failed to fetch escalation alerts:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch escalation alerts'
      });
    }
  });

  // Acknowledge escalation alert
  app.post('/api/escalation/acknowledge/:alertId', async (req, res) => {
    try {
      const { alertId } = req.params;
      await acknowledgeAlert(alertId);
      
      res.json({
        success: true,
        message: 'Alert acknowledged successfully'
      });
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to acknowledge alert'
      });
    }
  });

  // System health check with audit logging
  app.get('/api/system/health-detailed', async (req, res) => {
    try {
      const healthData = await performSystemHealthCheck();
      
      // Log health check to audit
      await createAuditEntry(
        'System Health Check',
        'health-monitor',
        healthData.status === 'healthy' ? 'low' : 'high',
        `System health: ${healthData.status}, Score: ${healthData.score}%`
      );
      
      res.json({
        success: true,
        data: healthData
      });
    } catch (error) {
      console.error('Health check failed:', error);
      await createAuditEntry(
        'System Health Check Failed',
        'health-monitor',
        'critical',
        `Health check error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      
      res.status(500).json({
        success: false,
        error: 'Health check failed'
      });
    }
  });
}

async function getAuditLog(limit: number, severity?: string): Promise<AuditEntry[]> {
  try {
    // Fetch audit entries from Airtable
    const salesOrders = await airtableLive.getSalesOrders();
    const auditEntries = salesOrders
      .filter(order => order.fields['Bot Package'] === 'Audit Entry')
      .slice(0, limit)
      .map(order => ({
        id: order.id,
        timestamp: order.fields['Order Date'],
        event: order.fields['Client Name'],
        source: order.fields['Add-Ons']?.[0] || 'system',
        severity: (order.fields['Add-Ons']?.[1] || 'medium') as 'low' | 'medium' | 'high' | 'critical',
        details: order.fields['Payment Status'] || '',
        resolved: order.fields['Status'] === 'Resolved'
      }));

    if (severity) {
      return auditEntries.filter(entry => entry.severity === severity);
    }

    return auditEntries;
  } catch (error) {
    console.error('Failed to fetch audit log from Airtable:', error);
    return [];
  }
}

async function createAuditEntry(event: string, source: string, severity: string, details: string): Promise<AuditEntry> {
  const auditEntry: AuditEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    event,
    source,
    severity: severity as 'low' | 'medium' | 'high' | 'critical',
    details,
    resolved: false
  };

  try {
    // Log to Airtable
    await airtableLive.createSalesOrder({
      'Bot Package': 'Audit Entry',
      'Add-Ons': [source, severity],
      'Total': 0,
      'Status': 'Active',
      'Client Email': 'audit@yobot.bot',
      'Client Name': event,
      'Order Date': auditEntry.timestamp,
      'Payment Status': details
    });

    console.log(`Audit entry created: ${event} - ${severity}`);
  } catch (error) {
    console.error('Failed to log audit entry to Airtable:', error);
  }

  return auditEntry;
}

async function getEscalationAlerts(): Promise<EscalationAlert[]> {
  try {
    // Check for system alerts that need escalation
    const alerts: EscalationAlert[] = [];
    
    // Check system performance
    const healthData = await performSystemHealthCheck();
    if (healthData.score < 90) {
      alerts.push({
        id: `alert_${Date.now()}_performance`,
        timestamp: new Date().toISOString(),
        type: 'Performance',
        message: `System performance degraded: ${healthData.score}%`,
        acknowledged: false,
        priority: healthData.score < 70 ? 'urgent' : 'high'
      });
    }

    // Check for recent errors
    const recentErrors = await getRecentErrors();
    if (recentErrors.length > 5) {
      alerts.push({
        id: `alert_${Date.now()}_errors`,
        timestamp: new Date().toISOString(),
        type: 'Error Rate',
        message: `High error rate detected: ${recentErrors.length} errors in last hour`,
        acknowledged: false,
        priority: 'high'
      });
    }

    return alerts;
  } catch (error) {
    console.error('Failed to fetch escalation alerts:', error);
    return [];
  }
}

async function acknowledgeAlert(alertId: string): Promise<void> {
  try {
    // Log alert acknowledgment
    await createAuditEntry(
      'Alert Acknowledged',
      'escalation-system',
      'low',
      `Alert ${alertId} acknowledged by operator`
    );
    
    console.log(`Alert acknowledged: ${alertId}`);
  } catch (error) {
    console.error('Failed to acknowledge alert:', error);
  }
}

async function performSystemHealthCheck(): Promise<any> {
  const checks = [];
  
  try {
    // Check Airtable connectivity
    await airtableLive.healthCheck();
    checks.push({ name: 'Airtable', status: 'healthy', score: 100 });
  } catch (error) {
    checks.push({ name: 'Airtable', status: 'degraded', score: 0 });
  }

  // Check memory usage
  const memUsage = process.memoryUsage();
  const memScore = Math.max(0, 100 - (memUsage.heapUsed / memUsage.heapTotal) * 100);
  checks.push({ 
    name: 'Memory', 
    status: memScore > 80 ? 'healthy' : 'degraded', 
    score: memScore 
  });

  // Check uptime
  const uptimeScore = Math.min(100, (process.uptime() / 3600) * 10); // 10 points per hour, max 100
  checks.push({ 
    name: 'Uptime', 
    status: 'healthy', 
    score: uptimeScore 
  });

  const overallScore = checks.reduce((sum, check) => sum + check.score, 0) / checks.length;
  
  return {
    status: overallScore > 80 ? 'healthy' : overallScore > 60 ? 'degraded' : 'critical',
    score: Math.round(overallScore),
    checks,
    timestamp: new Date().toISOString()
  };
}

async function getRecentErrors(): Promise<any[]> {
  // In a real implementation, this would query error logs
  // For now, return a simulated error count
  return [];
}

// Function removed - no hardcoded data in LIVE MODE

export { createAuditEntry, performSystemHealthCheck };