import express from 'express';
import { testLogger, TestResult } from './testLogger';
import { emailAlerts } from './emailAlerts';

const router = express.Router();

// Test a single function and log result
router.post('/test-function', async (req, res) => {
  try {
    const { functionName, passed, notes, executionTime, error } = req.body;
    
    const testResult: TestResult = {
      functionName,
      passed: passed === true,
      notes,
      executionTime,
      error
    };

    const logged = await testLogger.logTestResult(testResult);
    
    if (logged) {
      res.json({ 
        success: true, 
        message: `Test result logged for ${functionName}`,
        result: testResult 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to log test result' 
      });
    }
  } catch (error) {
    console.error('Error in test-function endpoint:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Get test statistics
router.get('/test-stats', async (req, res) => {
  try {
    const stats = await testLogger.getTestStats();
    res.json({ 
      success: true, 
      data: stats 
    });
  } catch (error) {
    console.error('Error in test-stats endpoint:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get test stats' 
    });
  }
});

// Send test summary email
router.post('/send-summary', async (req, res) => {
  try {
    const stats = await testLogger.getTestStats();
    const sent = await emailAlerts.sendTestSummary(stats.total, stats.passed, stats.failed);
    
    if (sent) {
      res.json({ 
        success: true, 
        message: 'Test summary email sent',
        stats 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to send summary email' 
      });
    }
  } catch (error) {
    console.error('Error in send-summary endpoint:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Run a quick test of the logging system
router.post('/test-logging', async (req, res) => {
  try {
    const testResult: TestResult = {
      functionName: 'Test Logger Validation',
      passed: true,
      notes: 'System test - logging infrastructure verification',
      executionTime: 50
    };

    const logged = await testLogger.logTestResult(testResult);
    
    res.json({ 
      success: true, 
      message: 'Logging system test completed',
      logged,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in test-logging endpoint:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Logging system test failed' 
    });
  }
});

export { router as testRoutes };