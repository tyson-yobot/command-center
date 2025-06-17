/**
 * Command Center Button Actions
 * Connects all buttons to the correct Airtable base (appRt8V3tH4g5Z51f)
 * Implements comprehensive logging per requirements
 */

interface ButtonActionParams {
  triggeredBy?: string;
  sessionId?: string;
  voiceTriggered?: boolean;
  additionalData?: Record<string, any>;
}

export class CommandCenterActions {
  private static defaultUser = 'Command Center User';

  // Voice Command: "Show dashboard" -> Toggle to 'Full Ops View'
  static async showDashboard(params: ButtonActionParams = {}) {
    try {
      const response = await fetch('/api/dashboard/toggle/view?mode=full_ops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_dashboard_view',
          mode: 'full_ops',
          triggeredBy: params.triggeredBy || this.defaultUser,
          voiceTriggered: params.voiceTriggered || false
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Dashboard toggle failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Voice Command: "Generate report" -> Open 'Generate Analytics Report' modal
  static async generateReport(params: ButtonActionParams = {}) {
    try {
      const response = await fetch('/api/open/modal/analyticsReport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'open_analytics_modal',
          triggeredBy: params.triggeredBy || this.defaultUser,
          voiceTriggered: params.voiceTriggered || false
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Analytics report modal failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Voice Command: "Start automation" -> Start automation engine (Live mode only)
  static async startAutomation(params: ButtonActionParams = {}) {
    try {
      const response = await fetch('/api/automation/run/full?mode=current', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start_automation_engine',
          triggeredBy: params.triggeredBy || this.defaultUser,
          voiceTriggered: params.voiceTriggered || false,
          requiresLiveMode: true
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Automation start failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Voice Command: "Check system status" -> Ping all modules and return health summary
  static async checkSystemStatus(params: ButtonActionParams = {}) {
    try {
      const response = await fetch('/api/system/status/summary', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return await response.json();
    } catch (error) {
      console.error('System status check failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Voice Command: "Call my top prospect" -> Trigger voice call to highest-rated lead
  static async callTopProspect(params: ButtonActionParams = {}) {
    try {
      const response = await fetch('/api/voice/call/topRated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'call_top_prospect',
          triggeredBy: params.triggeredBy || this.defaultUser,
          voiceTriggered: params.voiceTriggered || false,
          crmScoringRequired: true
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Top prospect call failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Voice Command: "Schedule follow-up" -> Trigger Follow-Up Automation
  static async scheduleFollowUp(params: ButtonActionParams = {}) {
    try {
      const response = await fetch('/api/followup/trigger/now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'schedule_followup',
          triggeredBy: params.triggeredBy || this.defaultUser,
          voiceTriggered: params.voiceTriggered || false,
          logToAirtable: true,
          logToHubSpot: true
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Follow-up scheduling failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Voice Command: "Start voice" -> Start Voice Listening
  static async startVoiceListening(params: ButtonActionParams = {}) {
    try {
      const response = await fetch('/api/voice/listen/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'activate_voice_listening',
          triggeredBy: params.triggeredBy || this.defaultUser,
          showIndicator: true
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Voice listening activation failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Voice Command: "End pipeline calls" -> Stop all pipeline calls in progress
  static async endPipelineCalls(params: ButtonActionParams = {}) {
    try {
      const response = await fetch('/api/voice/pipeline/stopAll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'stop_pipeline_calls',
          triggeredBy: params.triggeredBy || this.defaultUser,
          voiceTriggered: params.voiceTriggered || false,
          resetCallQueue: true,
          markStatusIdle: true
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Pipeline calls stop failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Voice Command: "Export dashboard" -> Generate and download PDF report
  static async exportDashboard(params: ButtonActionParams = {}) {
    try {
      const response = await fetch('/api/report/dashboard/export?type=pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'export_dashboard_pdf',
          triggeredBy: params.triggeredBy || this.defaultUser,
          voiceTriggered: params.voiceTriggered || false,
          confirmationRequired: true
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Dashboard export failed:', error);
      return { success: false, error: error.message };
    }
  }

  // LEGACY: Quick Action Launchpad
  static async scheduleBooking(params: ButtonActionParams = {}) {
    try {
      const response = await fetch('/api/command-center/schedule-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          triggeredBy: params.triggeredBy || this.defaultUser,
          voiceTriggered: params.voiceTriggered || false,
          ...params.additionalData
        })
      });
      
      const result = await response.json();
      return { success: response.ok, data: result };
    } catch (error) {
      console.error('Schedule booking error:', error);
      return { success: false, error: error.message };
    }
  }

  static async submitTicket(params: ButtonActionParams = {}) {
    try {
      const response = await fetch('/api/command-center/submit-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          triggeredBy: params.triggeredBy || this.defaultUser,
          voiceTriggered: params.voiceTriggered || false,
          ...params.additionalData
        })
      });
      
      const result = await response.json();
      return { success: response.ok, data: result };
    } catch (error) {
      console.error('Submit ticket error:', error);
      return { success: false, error: error.message };
    }
  }

  static async followUpTrigger(params: ButtonActionParams = {}) {
    try {
      const response = await fetch('/api/command-center/follow-up-trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          triggeredBy: params.triggeredBy || this.defaultUser,
          voiceTriggered: params.voiceTriggered || false,
          ...params.additionalData
        })
      });
      
      const result = await response.json();
      return { success: response.ok, data: result };
    } catch (error) {
      console.error('Follow-up trigger error:', error);
      return { success: false, error: error.message };
    }
  }

  static async startVoice(params: ButtonActionParams = {}) {
    try {
      const response = await fetch('/api/command-center/start-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          triggeredBy: params.triggeredBy || this.defaultUser,
          sessionId: params.sessionId || `session_${Date.now()}`,
          ...params.additionalData
        })
      });
      
      const result = await response.json();
      return { success: response.ok, data: result };
    } catch (error) {
      console.error('Start voice error:', error);
      return { success: false, error: error.message };
    }
  }

  static async manualCallStart(params: ButtonActionParams = {}) {
    try {
      const response = await fetch('/api/command-center/manual-call-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          triggeredBy: params.triggeredBy || this.defaultUser,
          voiceTriggered: params.voiceTriggered || false,
          ...params.additionalData
        })
      });
      
      const result = await response.json();
      return { success: response.ok, data: result };
    } catch (error) {
      console.error('Manual call start error:', error);
      return { success: false, error: error.message };
    }
  }

  static async analyticsReport(params: ButtonActionParams = {}) {
    try {
      const response = await fetch('/api/command-center/analytics-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          triggeredBy: params.triggeredBy || this.defaultUser,
          voiceTriggered: params.voiceTriggered || false,
          ...params.additionalData
        })
      });
      
      const result = await response.json();
      return { success: response.ok, data: result };
    } catch (error) {
      console.error('Analytics report error:', error);
      return { success: false, error: error.message };
    }
  }

  static async startPipeline(params: ButtonActionParams = {}) {
    try {
      const response = await fetch('/api/command-center/start-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          triggeredBy: params.triggeredBy || this.defaultUser,
          voiceTriggered: params.voiceTriggered || false,
          ...params.additionalData
        })
      });
      
      const result = await response.json();
      return { success: response.ok, data: result };
    } catch (error) {
      console.error('Start pipeline error:', error);
      return { success: false, error: error.message };
    }
  }

  static async uploadCalendar(params: ButtonActionParams = {}) {
    try {
      const response = await fetch('/api/command-center/upload-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          triggeredBy: params.triggeredBy || this.defaultUser,
          calendarName: params.additionalData?.calendarName || 'Default Calendar',
          voiceTriggered: params.voiceTriggered || false,
          ...params.additionalData
        })
      });
      
      const result = await response.json();
      return { success: response.ok, data: result };
    } catch (error) {
      console.error('Upload calendar error:', error);
      return { success: false, error: error.message };
    }
  }

  static async quickExport(params: ButtonActionParams = {}) {
    try {
      const response = await fetch('/api/command-center/quick-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          triggeredBy: params.triggeredBy || this.defaultUser,
          fileType: params.additionalData?.fileType || 'PDF',
          voiceTriggered: params.voiceTriggered || false,
          ...params.additionalData
        })
      });
      
      const result = await response.json();
      return { success: response.ok, data: result };
    } catch (error) {
      console.error('Quick export error:', error);
      return { success: false, error: error.message };
    }
  }

  static async multiAction(action: string, params: ButtonActionParams = {}) {
    try {
      const response = await fetch('/api/command-center/multi-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action,
          triggeredBy: params.triggeredBy || this.defaultUser,
          voiceTriggered: params.voiceTriggered || false,
          ...params.additionalData
        })
      });
      
      const result = await response.json();
      return { success: response.ok, data: result };
    } catch (error) {
      console.error(`${action} error:`, error);
      return { success: false, error: error.message };
    }
  }

  // SECTION 2: Voice Engine + Command Center
  static async voicePipeline(action: 'start' | 'end', params: ButtonActionParams = {}) {
    try {
      const response = await fetch('/api/command-center/voice-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action,
          triggeredBy: params.triggeredBy || 'Voice',
          sessionId: params.sessionId || `voice_session_${Date.now()}`,
          voiceTriggered: true,
          ...params.additionalData
        })
      });
      
      const result = await response.json();
      return { success: response.ok, data: result };
    } catch (error) {
      console.error(`Voice pipeline ${action} error:`, error);
      return { success: false, error: error.message };
    }
  }

  static async voicePersonaTest(params: ButtonActionParams = {}) {
    try {
      const response = await fetch('/api/command-center/voice-persona-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          triggeredBy: params.triggeredBy || this.defaultUser,
          selectedVoice: params.additionalData?.selectedVoice || 'Default Voice',
          triggeredFrom: 'Voice Studio',
          voiceTriggered: params.voiceTriggered || false,
          ...params.additionalData
        })
      });
      
      const result = await response.json();
      return { success: response.ok, data: result };
    } catch (error) {
      console.error('Voice persona test error:', error);
      return { success: false, error: error.message };
    }
  }

  // SECTION 3: Core Automation + Manual Triggers
  static async manualFollowUpSMS(params: ButtonActionParams = {}) {
    try {
      const response = await fetch('/api/command-center/manual-followup-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          triggeredBy: params.triggeredBy || this.defaultUser,
          clientId: params.additionalData?.clientId,
          voiceTriggered: params.voiceTriggered || false,
          ...params.additionalData
        })
      });
      
      const result = await response.json();
      return { success: response.ok, data: result };
    } catch (error) {
      console.error('Manual SMS follow-up error:', error);
      return { success: false, error: error.message };
    }
  }

  static async automateSalesFlow(params: ButtonActionParams = {}) {
    try {
      const response = await fetch('/api/command-center/automate-sales-flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          triggeredBy: params.triggeredBy || this.defaultUser,
          workflowId: params.additionalData?.workflowId || `workflow_${Date.now()}`,
          voiceTriggered: params.voiceTriggered || false,
          ...params.additionalData
        })
      });
      
      const result = await response.json();
      return { success: response.ok, data: result };
    } catch (error) {
      console.error('Automate sales flow error:', error);
      return { success: false, error: error.message };
    }
  }

  // SECTION 4: Performance / Exports / System Metrics
  static async exportData(params: ButtonActionParams = {}) {
    try {
      const response = await fetch('/api/command-center/export-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          triggeredBy: params.triggeredBy || this.defaultUser,
          exportType: params.additionalData?.exportType || 'Analytics Report',
          clientContext: params.additionalData?.clientContext,
          voiceTriggered: params.voiceTriggered || false,
          ...params.additionalData
        })
      });
      
      const result = await response.json();
      return { success: response.ok, data: result };
    } catch (error) {
      console.error('Export data error:', error);
      return { success: false, error: error.message };
    }
  }

  // SECTION 5: System Monitoring + Audit Logs
  static async systemMonitoring(action: string, params: ButtonActionParams = {}) {
    try {
      const response = await fetch('/api/command-center/system-monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action,
          triggeredBy: params.triggeredBy || this.defaultUser,
          voiceTriggered: params.voiceTriggered || false,
          ...params.additionalData
        })
      });
      
      const result = await response.json();
      return { success: response.ok, data: result };
    } catch (error) {
      console.error(`System monitoring ${action} error:`, error);
      return { success: false, error: error.message };
    }
  }

  // Health check
  static async healthCheck() {
    try {
      const response = await fetch('/api/command-center/metrics-health');
      const result = await response.json();
      return { success: response.ok, data: result };
    } catch (error) {
      console.error('Health check error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Toast helper for consistent messaging
export const showCommandCenterToast = (message: string, type: 'success' | 'error' = 'success') => {
  // This will be connected to the actual toast system in the component
  console.log(`[${type.toUpperCase()}] ${message}`);
};