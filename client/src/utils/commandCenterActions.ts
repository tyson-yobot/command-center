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

  // SECTION 1: Quick Action Launchpad
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
      // First get qualified leads from Scraped Leads (Universal) table
      const leadsResponse = await fetch('/api/airtable/leads?status=New');
      const leadsData = await leadsResponse.json();
      
      if (!leadsData.success || leadsData.data.length === 0) {
        return { 
          success: false, 
          error: 'No leads available in Scraped Leads (Universal) table. Please run Lead Scraper first.' 
        };
      }
      
      // Start pipeline with available leads
      const leadIds = leadsData.data.slice(0, 10).map((lead: any) => lead.id); // Take first 10 leads
      
      const response = await fetch('/api/airtable/start-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadIds,
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

  static async leadScraper(params: ButtonActionParams = {}) {
    try {
      // Trigger popup modal instead of navigation
      const event = new CustomEvent('openLeadScraperPopup', { 
        detail: { 
          defaultTab: params.additionalData?.defaultTab || 'apollo',
          triggeredBy: params.triggeredBy || this.defaultUser
        } 
      });
      window.dispatchEvent(event);
      return { success: true, data: { message: 'Opening Lead Scraper popup...' } };
    } catch (error) {
      console.error('Lead scraper popup error:', error);
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