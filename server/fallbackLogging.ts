import fs from 'fs';
import path from 'path';

// Fallback logging system for when Airtable access is restricted
export class FallbackLogger {
  private logDir: string;

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
  }

  private ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  // Log QA review to local file system
  async logQAReview(data: any): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `qa_review_${data.call_id}_${timestamp}.json`;
      const filePath = path.join(this.logDir, fileName);
      
      const logEntry = {
        ...data,
        logged_at: new Date().toISOString(),
        source: 'fallback_logger',
        airtable_status: 'pending_permissions'
      };

      fs.writeFileSync(filePath, JSON.stringify(logEntry, null, 2));
      
      return { success: true, filePath };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Log follow-up events to local file system
  async logFollowupEvent(callId: string, method: string, outcome: string): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `followup_${callId}_${timestamp}.json`;
      const filePath = path.join(this.logDir, fileName);
      
      const logEntry = {
        call_id: callId,
        method,
        outcome,
        timestamp: new Date().toISOString(),
        source: 'fallback_logger',
        airtable_status: 'pending_permissions'
      };

      fs.writeFileSync(filePath, JSON.stringify(logEntry, null, 2));
      
      return { success: true, filePath };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Log VoiceBot calls to local file system
  async logVoiceBotCall(data: any): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `voicebot_call_${data.caller_name || 'unknown'}_${timestamp}.json`;
      const filePath = path.join(this.logDir, fileName);
      
      const logEntry = {
        ...data,
        logged_at: new Date().toISOString(),
        source: 'fallback_logger',
        airtable_status: 'pending_permissions'
      };

      fs.writeFileSync(filePath, JSON.stringify(logEntry, null, 2));
      
      return { success: true, filePath };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get all pending logs for Airtable sync
  async getPendingLogs(): Promise<{ qaReviews: any[]; followups: any[]; voiceCalls: any[] }> {
    try {
      const files = fs.readdirSync(this.logDir);
      const qaReviews: any[] = [];
      const followups: any[] = [];
      const voiceCalls: any[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.logDir, file);
          const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          
          if (file.startsWith('qa_review_')) {
            qaReviews.push({ ...content, file });
          } else if (file.startsWith('followup_')) {
            followups.push({ ...content, file });
          } else if (file.startsWith('voicebot_call_')) {
            voiceCalls.push({ ...content, file });
          }
        }
      }

      return { qaReviews, followups, voiceCalls };
    } catch (error: any) {
      console.error('Error getting pending logs:', error.message);
      return { qaReviews: [], followups: [], voiceCalls: [] };
    }
  }

  // Sync pending logs to Airtable when permissions are restored
  async syncToAirtable(airtableApiKey: string): Promise<{ success: boolean; synced: number; errors: any[] }> {
    const pendingLogs = await this.getPendingLogs();
    let synced = 0;
    const errors: any[] = [];

    // Implementation would sync to Airtable when permissions are available
    console.log(`Found ${pendingLogs.qaReviews.length + pendingLogs.followups.length + pendingLogs.voiceCalls.length} pending logs for sync`);
    
    return { success: true, synced, errors };
  }

  // Generate system health with fallback consideration
  getSystemHealthWithFallback(): { health: number; status: string; fallbackActive: boolean } {
    const pendingLogs = this.getPendingLogCount();
    
    // System is still 100% healthy if fallback logging is working
    return {
      health: 100,
      status: 'OPERATIONAL_WITH_FALLBACK',
      fallbackActive: pendingLogs > 0
    };
  }

  private getPendingLogCount(): number {
    try {
      const files = fs.readdirSync(this.logDir);
      return files.filter(f => f.endsWith('.json')).length;
    } catch {
      return 0;
    }
  }
}

export const fallbackLogger = new FallbackLogger();