import type { Express } from "express";

// In-memory storage for QA test logs
const qaTestLogs: Array<{
  id: string;
  integrationName: string;
  passFail: boolean;
  notes: string;
  qaOwner: string;
  moduleType: string;
  scenarioLink: string;
  outputDataPopulated: boolean;
  recordCreated: boolean;
  retryAttempted: boolean;
  timestamp: string;
}> = [];

// QA Status Tracker for Integration Testing
export function registerQATracker(app: Express) {
  
  // Log integration test results
  app.post('/api/qa-tracker/log-test', async (req, res) => {
    try {
      const {
        integrationName,
        passFail,
        notes,
        qaOwner,
        moduleType,
        scenarioLink,
        outputDataPopulated,
        recordCreated,
        retryAttempted
      } = req.body;

      // Store test result locally for reliable tracking
      const testId = `qa_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const testResult = {
        id: testId,
        integrationName: integrationName || "Unknown Integration",
        passFail: Boolean(passFail),
        notes: notes || "",
        qaOwner: qaOwner || "YoBot System",
        moduleType: moduleType || "API",
        scenarioLink: scenarioLink || "",
        outputDataPopulated: Boolean(outputDataPopulated),
        recordCreated: Boolean(recordCreated),
        retryAttempted: Boolean(retryAttempted),
        timestamp: new Date().toISOString()
      };

      qaTestLogs.push(testResult);

      // Log to console for monitoring
      console.log(`📋 QA Test Logged: ${integrationName} - ${passFail ? 'PASS' : 'FAIL'}`);

      res.json({
        success: true,
        message: "Integration test logged successfully",
        testId: testResult.id,
        data: testResult
      });

    } catch (error) {
      console.error('QA tracker error:', error);
      res.status(500).json({
        success: false,
        error: "Failed to log test result",
        details: error.message
      });
    }
  });

  // Get integration test status summary
  app.get('/api/qa-tracker/status', async (req, res) => {
    try {
      const passCount = qaTestLogs.filter(log => log.passFail).length;
      const failCount = qaTestLogs.filter(log => !log.passFail).length;
      const totalTests = qaTestLogs.length;
      
      const summary = {
        totalTests,
        passCount,
        failCount,
        passRate: totalTests > 0 ? Math.round((passCount / totalTests) * 100) : 0,
        recentTests: qaTestLogs.slice(-10).reverse(),
        moduleBreakdown: qaTestLogs.reduce((acc, log) => {
          acc[log.moduleType] = (acc[log.moduleType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };

      res.json({
        success: true,
        data: summary
      });

    } catch (error) {
      console.error('QA status error:', error);
      res.status(500).json({
        success: false,
        error: "Failed to get QA status"
      });
    }
  });

  // Get detailed test logs with filtering
  app.get('/api/qa-tracker/logs', async (req, res) => {
    try {
      const { moduleType, passFail, limit = 50 } = req.query;
      
      let filteredLogs = [...qaTestLogs];
      
      if (moduleType) {
        filteredLogs = filteredLogs.filter(log => log.moduleType === moduleType);
      }
      
      if (passFail !== undefined) {
        filteredLogs = filteredLogs.filter(log => log.passFail === (passFail === 'true'));
      }
      
      const limitNum = parseInt(limit as string);
      const logs = filteredLogs.slice(-limitNum).reverse();

      res.json({
        success: true,
        data: {
          logs,
          total: filteredLogs.length,
          filters: { moduleType, passFail, limit }
        }
      });

    } catch (error) {
      console.error('QA logs error:', error);
      res.status(500).json({
        success: false,
        error: "Failed to get QA logs"
      });
    }
  });

  // Clear all test logs (for system reset)
  app.delete('/api/qa-tracker/clear', async (req, res) => {
    try {
      const clearedCount = qaTestLogs.length;
      qaTestLogs.length = 0;
      
      console.log(`🧹 Cleared ${clearedCount} QA test logs`);
      
      res.json({
        success: true,
        message: `Cleared ${clearedCount} test logs`,
        clearedCount
      });

    } catch (error) {
      console.error('QA clear error:', error);
      res.status(500).json({
        success: false,
        error: "Failed to clear QA logs"
      });
    }
  });

  console.log('✅ QA Tracker system initialized');
}

// Export for use in other modules
export async function logAutomationTest(functionId: number, functionName: string, success: boolean, notes: string = "") {
  const testResult = {
    id: `auto_${Date.now()}_${functionId}`,
    integrationName: `Function ${functionId}: ${functionName}`,
    passFail: success,
    notes: notes || (success ? "Automation executed successfully" : "Automation failed"),
    qaOwner: "YoBot Automation System",
    moduleType: "Automation Function",
    scenarioLink: "",
    outputDataPopulated: success,
    recordCreated: success,
    retryAttempted: false,
    timestamp: new Date().toISOString()
  };

  qaTestLogs.push(testResult);
  console.log(`🤖 Auto-logged: Function ${functionId} - ${success ? 'PASS' : 'FAIL'}`);
  
  return testResult;
}