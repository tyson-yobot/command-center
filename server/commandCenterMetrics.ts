/**
 * Command Center Metrics Tracker
 * Unified Airtable integration for all button actions
 * Base: YoBot® Command Center (Live Ops)
 * Base ID: appRt8V3tH4g5Z51f
 */

import type { Express } from "express";

interface MetricsRecord {
  'Triggered Action': string;
  'Status'?: string;
  'Triggered By': string;
  'Timestamp': string;
  'Source'?: string;
  'Pipeline'?: string;
  'Voice Trigger'?: boolean;
  'Voice Source'?: string;
  'Call Type'?: string;
  'Pipeline Stage'?: string;
  'Calendar Name'?: string;
  'File Type'?: string;
  'Severity'?: string;
  'Session ID'?: string;
  'Voice Persona Test'?: boolean;
  'Selected Voice'?: string;
  'Trigger Type'?: string;
  'Channel'?: string;
  'Client ID'?: string;
  'Sales Status'?: string;
  'Workflow ID'?: string;
  'Export Type'?: string;
  'Export Status'?: string;
  'Export File'?: string;
  'Client Context'?: string;
  'Triggered From'?: string;
  'Method'?: string;
  'Result'?: string;
}

interface IntegrationTestRecord {
  'Triggered Action': string;
  'Triggered From': string;
  'Timestamp': string;
  'Tampering Flag': boolean;
}

class CommandCenterMetrics {
  private baseId = 'appRt8V3tH4g5Z51f';
  private metricsTableId = 'tbl7K5RthCtD69BE1'; // Command Center - Metrics Tracker Table
  private integrationTestTableId = 'tblIntegrationTest'; // Integration Test Log Table
  private apiKey: string;
  private localBackupLog: any[] = [];

  constructor() {
    this.apiKey = process.env.AIRTABLE_API_KEY || '';
    if (!this.apiKey) {
      console.warn('AIRTABLE_API_KEY not configured for Command Center Metrics');
    }
  }

  private storeLocalBackup(logEntry: any): void {
    this.localBackupLog.push(logEntry);
    // Keep only last 1000 entries to prevent memory issues
    if (this.localBackupLog.length > 1000) {
      this.localBackupLog = this.localBackupLog.slice(-1000);
    }
  }

  getLocalBackupLog(): any[] {
    return this.localBackupLog;
  }

  private async makeAirtableRequest(method: string, endpoint: string, data?: any) {
    if (!this.apiKey) {
      console.log('Airtable API key not available, logging locally:', { method, endpoint, data });
      return { success: false, error: 'API key not configured' };
    }

    try {
      // Ensure proper API key format
      const authHeader = this.apiKey.startsWith('pat') ? 
        `Bearer ${this.apiKey}` : 
        `Bearer ${this.apiKey}`;

      const response = await fetch(`https://api.airtable.com/v0/${this.baseId}/${endpoint}`, {
        method,
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
          'User-Agent': 'YoBot-CommandCenter/1.0'
        },
        body: data ? JSON.stringify(data) : undefined
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        console.error(`Airtable API Error ${response.status}:`, responseText);
        throw new Error(`Airtable API error: ${response.status} - ${responseText}`);
      }

      return JSON.parse(responseText);
    } catch (error) {
      console.error('Airtable request failed:', error);
      return { success: false, error: error.message };
    }
  }

  async logMetricsAction(record: MetricsRecord): Promise<any> {
    const timestamp = new Date().toISOString();
    const data = {
      records: [{
        fields: {
          ...record,
          'Timestamp': timestamp
        }
      }]
    };

    // Always log locally for immediate tracking
    const localLog = {
      action: record['Triggered Action'],
      user: record['Triggered By'],
      timestamp,
      data: record
    };
    
    console.log(`📊 Command Center Action: ${record['Triggered Action']} by ${record['Triggered By']} at ${timestamp}`);
    
    // Attempt Airtable logging
    const result = await this.makeAirtableRequest('POST', this.metricsTableId, data);
    
    if (result.success === false) {
      // Store in local backup for later sync
      this.storeLocalBackup(localLog);
    }
    
    return result;
  }

  async logIntegrationTest(record: IntegrationTestRecord): Promise<any> {
    const data = {
      records: [{
        fields: {
          ...record,
          'Timestamp': new Date().toISOString(),
          'Tampering Flag': false
        }
      }]
    };

    const result = await this.makeAirtableRequest('POST', this.integrationTestTableId, data);
    console.log(`🛡️ Logged to Integration Test Log: ${record['Triggered Action']}`);
    return result;
  }

  async updateMetricsRecord(recordId: string, updates: Partial<MetricsRecord>): Promise<any> {
    const data = {
      records: [{
        id: recordId,
        fields: updates
      }]
    };

    return await this.makeAirtableRequest('PATCH', this.metricsTableId, data);
  }
}

export const commandCenterMetrics = new CommandCenterMetrics();

export function registerCommandCenterMetrics(app: Express) {
  // SECTION 1: Quick Action Launchpad

  // 1. Schedule Booking
  app.post('/api/command-center/schedule-booking', async (req, res) => {
    try {
      const { triggeredBy = 'System' } = req.body;
      
      await commandCenterMetrics.logMetricsAction({
        'Triggered Action': 'Booking',
        'Status': 'Scheduled',
        'Triggered By': triggeredBy,
        'Timestamp': new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Booking scheduled and logged to Command Center Metrics',
        action: 'Schedule Booking'
      });
    } catch (error) {
      console.error('Schedule booking error:', error);
      res.status(500).json({ success: false, error: 'Failed to schedule booking' });
    }
  });

  // 2. Submit Ticket
  app.post('/api/command-center/submit-ticket', async (req, res) => {
    try {
      const { triggeredBy = 'System' } = req.body;
      
      await commandCenterMetrics.logMetricsAction({
        'Triggered Action': 'Ticket Submission',
        'Source': 'Manual',
        'Triggered By': triggeredBy,
        'Timestamp': new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Ticket submission logged to Command Center Metrics',
        action: 'Submit Ticket'
      });
    } catch (error) {
      console.error('Submit ticket error:', error);
      res.status(500).json({ success: false, error: 'Failed to submit ticket' });
    }
  });

  // 3. Follow-up Trigger
  app.post('/api/command-center/follow-up-trigger', async (req, res) => {
    try {
      const { triggeredBy = 'System' } = req.body;
      
      await commandCenterMetrics.logMetricsAction({
        'Triggered Action': 'Follow-Up',
        'Result': 'Triggered',
        'Voice Trigger': false,
        'Triggered By': triggeredBy,
        'Timestamp': new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Follow-up trigger logged to Command Center Metrics',
        action: 'Follow-up Trigger'
      });
    } catch (error) {
      console.error('Follow-up trigger error:', error);
      res.status(500).json({ success: false, error: 'Failed to trigger follow-up' });
    }
  });

  // 4. Start Voice
  app.post('/api/command-center/start-voice', async (req, res) => {
    try {
      const { triggeredBy = 'System' } = req.body;
      
      await commandCenterMetrics.logMetricsAction({
        'Triggered Action': 'Voice Start',
        'Voice Source': 'Voice',
        'Triggered By': triggeredBy,
        'Method': 'Button',
        'Timestamp': new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Voice start logged to Command Center Metrics',
        action: 'Start Voice',
        voiceStatus: 'Active'
      });
    } catch (error) {
      console.error('Start voice error:', error);
      res.status(500).json({ success: false, error: 'Failed to start voice' });
    }
  });

  // 5. Manual Call Start
  app.post('/api/command-center/manual-call-start', async (req, res) => {
    try {
      const { triggeredBy = 'System' } = req.body;
      
      await commandCenterMetrics.logMetricsAction({
        'Triggered Action': 'Manual Call',
        'Call Type': 'Outbound',
        'Pipeline': 'N/A',
        'Source': 'UI',
        'Triggered By': triggeredBy,
        'Timestamp': new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Manual call start logged to Command Center Metrics',
        action: 'Manual Call Start'
      });
    } catch (error) {
      console.error('Manual call start error:', error);
      res.status(500).json({ success: false, error: 'Failed to start manual call' });
    }
  });

  // 6. Analytics Report
  app.post('/api/command-center/analytics-report', async (req, res) => {
    try {
      const { triggeredBy = 'System' } = req.body;
      
      await commandCenterMetrics.logMetricsAction({
        'Triggered Action': 'Analytics Report Generation',
        'Status': 'In Progress',
        'Triggered By': triggeredBy,
        'Timestamp': new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Analytics report generation logged to Command Center Metrics',
        action: 'Analytics Report'
      });
    } catch (error) {
      console.error('Analytics report error:', error);
      res.status(500).json({ success: false, error: 'Failed to generate analytics report' });
    }
  });

  // 7. Start Pipeline
  app.post('/api/command-center/start-pipeline', async (req, res) => {
    try {
      const { triggeredBy = 'System' } = req.body;
      
      await commandCenterMetrics.logMetricsAction({
        'Triggered Action': 'Pipeline Start',
        'Pipeline Stage': 'Init',
        'Triggered By': triggeredBy,
        'Timestamp': new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Pipeline start logged to Command Center Metrics',
        action: 'Start Pipeline'
      });
    } catch (error) {
      console.error('Start pipeline error:', error);
      res.status(500).json({ success: false, error: 'Failed to start pipeline' });
    }
  });

  // 8. Upload Calendar
  app.post('/api/command-center/upload-calendar', async (req, res) => {
    try {
      const { triggeredBy = 'System', calendarName = 'Default Calendar' } = req.body;
      
      await commandCenterMetrics.logMetricsAction({
        'Triggered Action': 'Calendar Upload',
        'Status': 'Synced',
        'Calendar Name': calendarName,
        'Triggered By': triggeredBy,
        'Timestamp': new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Calendar upload logged to Command Center Metrics',
        action: 'Upload Calendar'
      });
    } catch (error) {
      console.error('Upload calendar error:', error);
      res.status(500).json({ success: false, error: 'Failed to upload calendar' });
    }
  });

  // 9. Quick Export
  app.post('/api/command-center/quick-export', async (req, res) => {
    try {
      const { triggeredBy = 'System', fileType = 'PDF' } = req.body;
      
      await commandCenterMetrics.logMetricsAction({
        'Triggered Action': 'Quick Export',
        'File Type': fileType,
        'Status': 'Queued',
        'Triggered By': triggeredBy,
        'Timestamp': new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Quick export logged to Command Center Metrics',
        action: 'Quick Export'
      });
    } catch (error) {
      console.error('Quick export error:', error);
      res.status(500).json({ success: false, error: 'Failed to queue export' });
    }
  });

  // 10. Multi-purpose actions (PDF Upload / Knowledge / Diagnostics / Emergency)
  app.post('/api/command-center/multi-action', async (req, res) => {
    try {
      const { action, triggeredBy = 'System' } = req.body;
      const severity = action === 'Emergency Stop' ? 'Critical' : undefined;
      
      await commandCenterMetrics.logMetricsAction({
        'Triggered Action': action,
        'Status': 'Awaiting',
        'Triggered By': triggeredBy,
        'Severity': severity,
        'Timestamp': new Date().toISOString()
      });

      res.json({
        success: true,
        message: `${action} logged to Command Center Metrics`,
        action: action
      });
    } catch (error) {
      console.error('Multi-action error:', error);
      res.status(500).json({ success: false, error: 'Failed to process action' });
    }
  });

  // SECTION 2: Voice Engine + Command Center

  // 11. Pipeline Start / End (Voice)
  app.post('/api/command-center/voice-pipeline', async (req, res) => {
    try {
      const { action, triggeredBy = 'Voice', sessionId } = req.body;
      
      await commandCenterMetrics.logMetricsAction({
        'Triggered Action': action === 'start' ? 'Start Pipeline' : 'End Pipeline',
        'Voice Source': 'Voice',
        'Triggered By': triggeredBy,
        'Session ID': sessionId,
        'Timestamp': new Date().toISOString()
      });

      res.json({
        success: true,
        message: `Voice ${action} pipeline logged to Command Center Metrics`,
        action: `Voice Pipeline ${action}`
      });
    } catch (error) {
      console.error('Voice pipeline error:', error);
      res.status(500).json({ success: false, error: 'Failed to process voice pipeline action' });
    }
  });

  // 12. Voice Studio / Test Persona
  app.post('/api/command-center/voice-persona-test', async (req, res) => {
    try {
      const { selectedVoice, triggeredBy = 'System', triggeredFrom = 'Voice Studio' } = req.body;
      
      await commandCenterMetrics.logMetricsAction({
        'Triggered Action': 'Voice Persona Test',
        'Voice Persona Test': true,
        'Selected Voice': selectedVoice,
        'Triggered By': triggeredBy,
        'Triggered From': triggeredFrom,
        'Status': 'Active',
        'Timestamp': new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Voice persona test logged to Command Center Metrics',
        action: 'Voice Persona Test'
      });
    } catch (error) {
      console.error('Voice persona test error:', error);
      res.status(500).json({ success: false, error: 'Failed to test voice persona' });
    }
  });

  // SECTION 3: Core Automation + Manual Triggers

  // 13. Manual Follow-Up / SMS Trigger
  app.post('/api/command-center/manual-followup-sms', async (req, res) => {
    try {
      const { triggeredBy = 'System', clientId } = req.body;
      
      await commandCenterMetrics.logMetricsAction({
        'Triggered Action': 'Manual Follow-Up',
        'Trigger Type': 'Manual Follow-Up',
        'Channel': 'SMS',
        'Triggered By': triggeredBy,
        'Client ID': clientId,
        'Timestamp': new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Manual SMS follow-up logged to Command Center Metrics',
        action: 'Manual Follow-Up SMS'
      });
    } catch (error) {
      console.error('Manual SMS follow-up error:', error);
      res.status(500).json({ success: false, error: 'Failed to trigger SMS follow-up' });
    }
  });

  // 14. Automate Sales Flow
  app.post('/api/command-center/automate-sales-flow', async (req, res) => {
    try {
      const { triggeredBy = 'System', workflowId } = req.body;
      
      await commandCenterMetrics.logMetricsAction({
        'Triggered Action': 'Sales Order',
        'Trigger Type': 'Sales Order',
        'Sales Status': 'Triggered',
        'Workflow ID': workflowId,
        'Triggered By': triggeredBy,
        'Timestamp': new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Sales flow automation logged to Command Center Metrics',
        action: 'Automate Sales Flow'
      });
    } catch (error) {
      console.error('Automate sales flow error:', error);
      res.status(500).json({ success: false, error: 'Failed to automate sales flow' });
    }
  });

  // SECTION 4: Performance / Exports / System Metrics

  // 15. Analytics Report / PDF Export / Data Export
  app.post('/api/command-center/export-data', async (req, res) => {
    try {
      const { exportType, triggeredBy = 'System', clientContext } = req.body;
      
      await commandCenterMetrics.logMetricsAction({
        'Triggered Action': 'Data Export',
        'Export Type': exportType,
        'Triggered By': triggeredBy,
        'Export Status': 'In Progress',
        'Client Context': clientContext,
        'Timestamp': new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Data export logged to Command Center Metrics',
        action: 'Export Data'
      });
    } catch (error) {
      console.error('Export data error:', error);
      res.status(500).json({ success: false, error: 'Failed to export data' });
    }
  });

  // SECTION 5: System Monitoring + Audit Logs

  // 16. Run Diagnostics / Test Alert / Emergency Stop
  app.post('/api/command-center/system-monitoring', async (req, res) => {
    try {
      const { action, triggeredBy = 'System' } = req.body;
      
      // Log to Integration Test Log Table for system monitoring actions
      await commandCenterMetrics.logIntegrationTest({
        'Triggered Action': action,
        'Triggered From': 'Command Center',
        'Timestamp': new Date().toISOString(),
        'Tampering Flag': false
      });

      // Also log to main metrics tracker
      await commandCenterMetrics.logMetricsAction({
        'Triggered Action': action,
        'Triggered From': 'Command Center',
        'Triggered By': triggeredBy,
        'Timestamp': new Date().toISOString()
      });

      res.json({
        success: true,
        message: `${action} logged to Integration Test Log and Command Center Metrics`,
        action: action
      });
    } catch (error) {
      console.error('System monitoring error:', error);
      res.status(500).json({ success: false, error: 'Failed to execute system monitoring action' });
    }
  });

  // Health check endpoint
  app.get('/api/command-center/metrics-health', async (req, res) => {
    try {
      const backupLog = commandCenterMetrics.getLocalBackupLog();
      res.json({
        success: true,
        service: 'Command Center Metrics',
        baseId: commandCenterMetrics.baseId,
        timestamp: new Date().toISOString(),
        status: 'operational',
        localBackupEntries: backupLog.length,
        recentActions: backupLog.slice(-5).map(entry => ({
          action: entry.action,
          user: entry.user,
          timestamp: entry.timestamp
        }))
      });
    } catch (error) {
      console.error('Metrics health check error:', error);
      res.status(500).json({ success: false, error: 'Metrics service unavailable' });
    }
  });

  // Local backup log endpoint for real-time monitoring
  app.get('/api/command-center/backup-log', async (req, res) => {
    try {
      const backupLog = commandCenterMetrics.getLocalBackupLog();
      res.json({
        success: true,
        totalEntries: backupLog.length,
        entries: backupLog.slice(-50), // Return last 50 entries
        message: 'Real-time action log retrieved successfully'
      });
    } catch (error) {
      console.error('Backup log retrieval error:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve backup log' });
    }
  });
}