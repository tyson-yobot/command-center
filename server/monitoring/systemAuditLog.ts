import express from 'express';
import { EventEmitter } from 'events';

const router = express.Router();

interface AuditEvent {
  id: string;
  timestamp: string;
  type: 'voice_call' | 'crm_sync' | 'escalation' | 'webhook' | 'admin_action' | 'error' | 'system';
  module: string;
  action: string;
  user?: string;
  details: string;
  status: 'success' | 'error' | 'warning' | 'info';
  metadata?: any;
}

class SystemAuditLogger extends EventEmitter {
  private events: AuditEvent[] = [];
  private maxEvents = 1000;

  logEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>) {
    const auditEvent: AuditEvent = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...event
    };

    this.events.unshift(auditEvent);
    
    // Keep only the most recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents);
    }

    this.emit('newEvent', auditEvent);
  }

  getEvents(filters?: {
    type?: string;
    module?: string;
    status?: string;
    limit?: number;
    since?: string;
  }): AuditEvent[] {
    let filteredEvents = this.events;

    if (filters) {
      if (filters.type) {
        filteredEvents = filteredEvents.filter(e => e.type === filters.type);
      }
      if (filters.module) {
        filteredEvents = filteredEvents.filter(e => e.module.toLowerCase().includes(filters.module!.toLowerCase()));
      }
      if (filters.status) {
        filteredEvents = filteredEvents.filter(e => e.status === filters.status);
      }
      if (filters.since) {
        const sinceDate = new Date(filters.since);
        filteredEvents = filteredEvents.filter(e => new Date(e.timestamp) >= sinceDate);
      }
    }

    const limit = filters?.limit || 50;
    return filteredEvents.slice(0, limit);
  }

  getEventStats() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentEvents = this.events.filter(e => new Date(e.timestamp) >= oneHourAgo);
    const todayEvents = this.events.filter(e => new Date(e.timestamp) >= oneDayAgo);

    return {
      total: this.events.length,
      lastHour: recentEvents.length,
      today: todayEvents.length,
      errorCount: this.events.filter(e => e.status === 'error').length,
      warningCount: this.events.filter(e => e.status === 'warning').length,
      byType: {
        voice_call: this.events.filter(e => e.type === 'voice_call').length,
        crm_sync: this.events.filter(e => e.type === 'crm_sync').length,
        escalation: this.events.filter(e => e.type === 'escalation').length,
        webhook: this.events.filter(e => e.type === 'webhook').length,
        admin_action: this.events.filter(e => e.type === 'admin_action').length,
        system: this.events.filter(e => e.type === 'system').length
      }
    };
  }
}

const auditLogger = new SystemAuditLogger();

// Log system startup
auditLogger.logEvent({
  type: 'system',
  module: 'Command Center',
  action: 'System Started',
  details: 'YoBot Command Center audit logging initialized',
  status: 'success'
});

// Get audit events with filtering
router.get('/events', (req, res) => {
  try {
    const filters = {
      type: req.query.type as string,
      module: req.query.module as string,
      status: req.query.status as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      since: req.query.since as string
    };

    const events = auditLogger.getEvents(filters);
    const stats = auditLogger.getEventStats();

    res.json({
      success: true,
      events,
      stats,
      filters: Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined)
      )
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve audit events',
      details: error.message
    });
  }
});

// Add new audit event (for external systems)
router.post('/log', (req, res) => {
  try {
    const { type, module, action, user, details, status, metadata } = req.body;

    if (!type || !module || !action || !details || !status) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type, module, action, details, status'
      });
    }

    auditLogger.logEvent({
      type,
      module,
      action,
      user,
      details,
      status,
      metadata
    });

    res.json({
      success: true,
      message: 'Audit event logged successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to log audit event',
      details: error.message
    });
  }
});

// Get audit statistics
router.get('/stats', (req, res) => {
  try {
    const stats = auditLogger.getEventStats();
    res.json({
      success: true,
      stats
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve audit statistics',
      details: error.message
    });
  }
});

// Export audit log
router.get('/export', (req, res) => {
  try {
    const { format = 'json' } = req.query;
    const events = auditLogger.getEvents({ limit: 1000 });

    if (format === 'csv') {
      const csvHeaders = 'Timestamp,Type,Module,Action,User,Details,Status\n';
      const csvData = events.map(event => 
        `${event.timestamp},${event.type},${event.module},"${event.action}","${event.user || ''}","${event.details}",${event.status}`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="audit-log.csv"');
      res.send(csvHeaders + csvData);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="audit-log.json"');
      res.json({
        exportDate: new Date().toISOString(),
        totalEvents: events.length,
        events
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to export audit log',
      details: error.message
    });
  }
});

// WebSocket support for real-time audit updates
export const setupAuditWebSocket = (wss: any) => {
  auditLogger.on('newEvent', (event: AuditEvent) => {
    wss.clients.forEach((client: any) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(JSON.stringify({
          type: 'audit_event',
          data: event
        }));
      }
    });
  });
};

export { auditLogger };
export default router;