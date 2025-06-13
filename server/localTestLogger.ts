import { Express } from 'express';
import fs from 'fs/promises';
import path from 'path';

interface LocalTestLogEntry {
  id: string;
  integrationName: string;
  passFail: 'PASS' | 'FAIL';
  notes: string;
  testDate: string;
  qaOwner: string;
  outputDataPopulated: boolean;
  recordCreated: boolean;
  retryAttempted: boolean;
  moduleType: string;
  relatedScenario: string;
  errorDetails?: string;
  timestamp: string;
}

class LocalTestLogger {
  private logFile = 'system_automation_log.json';
  private testLogs: LocalTestLogEntry[] = [];

  constructor() {
    this.loadExistingLogs();
  }

  private async loadExistingLogs() {
    try {
      const data = await fs.readFile(this.logFile, 'utf-8');
      this.testLogs = JSON.parse(data).testLogs || [];
      console.log(`📊 Loaded ${this.testLogs.length} existing test logs`);
    } catch (error) {
      this.testLogs = [];
      console.log('📊 Starting fresh test log system');
    }
  }

  private async saveLogs() {
    try {
      const logData = {
        lastUpdated: new Date().toISOString(),
        totalTests: this.testLogs.length,
        passCount: this.testLogs.filter(log => log.passFail === 'PASS').length,
        failCount: this.testLogs.filter(log => log.passFail === 'FAIL').length,
        testLogs: this.testLogs
      };

      await fs.writeFile(this.logFile, JSON.stringify(logData, null, 2));
      return true;
    } catch (error) {
      console.error('Failed to save test logs:', error);
      return false;
    }
  }

  async logTest(testData: Omit<LocalTestLogEntry, 'id' | 'timestamp'>): Promise<boolean> {
    try {
      const logEntry: LocalTestLogEntry = {
        ...testData,
        id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString()
      };

      this.testLogs.push(logEntry);
      
      const saved = await this.saveLogs();
      
      if (saved) {
        console.log(`✅ Test logged: ${testData.integrationName} - ${testData.passFail}`);
        console.log(`📝 Notes: ${testData.notes}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Test logging error:', error);
      return false;
    }
  }

  async logSuccess(integrationName: string, moduleType: string, notes: string, relatedScenario: string = ''): Promise<boolean> {
    return this.logTest({
      integrationName,
      passFail: 'PASS',
      notes,
      testDate: new Date().toISOString(),
      qaOwner: 'YoBot System',
      outputDataPopulated: true,
      recordCreated: true,
      retryAttempted: false,
      moduleType,
      relatedScenario
    });
  }

  async logFailure(integrationName: string, moduleType: string, errorDetails: string, relatedScenario: string = ''): Promise<boolean> {
    return this.logTest({
      integrationName,
      passFail: 'FAIL',
      notes: `Integration failed: ${errorDetails}`,
      testDate: new Date().toISOString(),
      qaOwner: 'YoBot System',
      outputDataPopulated: false,
      recordCreated: false,
      retryAttempted: false,
      moduleType,
      relatedScenario,
      errorDetails
    });
  }

  getTestHistory(): LocalTestLogEntry[] {
    return this.testLogs.slice().reverse(); // Most recent first
  }

  getTestStats() {
    const total = this.testLogs.length;
    const passed = this.testLogs.filter(log => log.passFail === 'PASS').length;
    const failed = this.testLogs.filter(log => log.passFail === 'FAIL').length;
    
    return {
      total,
      passed,
      failed,
      successRate: total > 0 ? ((passed / total) * 100).toFixed(1) + '%' : '0%',
      lastTest: this.testLogs.length > 0 ? this.testLogs[this.testLogs.length - 1] : null
    };
  }
}

export const localTestLogger = new LocalTestLogger();

export function registerLocalTestLoggerRoutes(app: Express) {
  // Log a test manually
  app.post('/api/test-log', async (req, res) => {
    try {
      const testData = req.body;
      const success = await localTestLogger.logTest(testData);
      
      res.json({
        success,
        message: success ? 'Test logged successfully' : 'Failed to log test',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Get test history
  app.get('/api/test-log', async (req, res) => {
    try {
      const history = localTestLogger.getTestHistory();
      const stats = localTestLogger.getTestStats();
      
      res.json({
        success: true,
        stats,
        history: history.slice(0, 50), // Return last 50 tests
        totalLogs: history.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get test statistics
  app.get('/api/test-stats', async (req, res) => {
    try {
      const stats = localTestLogger.getTestStats();
      
      res.json({
        success: true,
        ...stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
}