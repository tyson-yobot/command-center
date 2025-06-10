import { spawn } from 'child_process';
import { Express } from 'express';
import fs from 'fs';
import path from 'path';

interface AutomationResult {
  functionName: string;
  success: boolean;
  output: string;
  executionTime: number;
  timestamp: string;
}

interface AutomationMetrics {
  totalFunctions: number;
  activeFunctions: number;
  passedFunctions: number;
  failedFunctions: number;
  successRate: string;
  lastRunTime: string;
}

export class RealAutomationRunner {
  private static results: AutomationResult[] = [];
  private static lastRunMetrics: AutomationMetrics | null = null;

  static async runAutomationFunction(functionName: string): Promise<AutomationResult> {
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const pythonScript = `
import sys
sys.path.append('.')
from function_library import *
from integration_logger import log_integration_test_to_airtable

# Map function names to actual functions
function_map = {
    'Log To CRM': function_log_to_crm,
    'Create Invoice': function_create_invoice,
    'Send Slack Notification': function_send_slack_notification,
    'Send Email Receipt': function_send_email_receipt,
    'Record Call Log': function_record_call_log,
    'Score Call': function_score_call,
    'Run Voicebot Script': function_run_voicebot_script,
    'Sync To SmartSpend': function_sync_to_smartspend,
    'Generate ROI Snapshot': function_generate_roi_snapshot,
    'Trigger Quote PDF': function_trigger_quote_pdf,
    'Sync To HubSpot': function_sync_to_hubspot,
    'Sync To QuickBooks': function_sync_to_quickbooks,
    'Log Voice Sentiment': function_log_voice_sentiment,
    'Store Transcription': function_store_transcription,
    'Send SMS Alert': function_send_sms_alert,
    'Candidate Screening': function_candidate_screening,
    'Background Checks': function_background_checks,
    'Reference Verification': function_reference_verification,
    'Onboarding Automation': function_onboarding_automation,
    'Document Management': function_document_management,
    'Policy Distribution': function_policy_distribution,
    'Compliance Training': function_compliance_training
}

function_name = "${functionName}"
if function_name in function_map:
    try:
        result = function_map[function_name]()
        log_integration_test_to_airtable(function_name, result, f"Web interface execution via API")
        print(f"SUCCESS:{result}")
    except Exception as e:
        log_integration_test_to_airtable(function_name, False, f"Web interface error: {str(e)}")
        print(f"ERROR:{str(e)}")
else:
    print(f"ERROR:Function {function_name} not found")
`;

      const pythonProcess = spawn('python3', ['-c', pythonScript], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      pythonProcess.on('close', (code) => {
        const executionTime = Date.now() - startTime;
        const success = output.includes('SUCCESS:') && code === 0;
        
        const result: AutomationResult = {
          functionName,
          success,
          output: success ? output.replace('SUCCESS:', '').trim() : (errorOutput || output),
          executionTime,
          timestamp: new Date().toISOString()
        };

        this.results.push(result);
        
        // Keep only last 100 results
        if (this.results.length > 100) {
          this.results = this.results.slice(-100);
        }

        resolve(result);
      });
    });
  }

  static async runAllFunctions(): Promise<AutomationMetrics> {
    const functionNames = [
      'Log To CRM', 'Create Invoice', 'Send Slack Notification', 'Send Email Receipt',
      'Record Call Log', 'Score Call', 'Run Voicebot Script', 'Sync To SmartSpend',
      'Generate ROI Snapshot', 'Trigger Quote PDF', 'Sync To HubSpot', 'Sync To QuickBooks',
      'Log Voice Sentiment', 'Store Transcription', 'Send SMS Alert', 'Candidate Screening',
      'Background Checks', 'Reference Verification', 'Onboarding Automation', 'Document Management',
      'Policy Distribution', 'Compliance Training'
    ];

    const startTime = Date.now();
    const results = await Promise.all(
      functionNames.map(name => this.runAutomationFunction(name))
    );

    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => r.success === false).length;
    const successRate = ((passed / results.length) * 100).toFixed(1);

    this.lastRunMetrics = {
      totalFunctions: functionNames.length,
      activeFunctions: functionNames.length,
      passedFunctions: passed,
      failedFunctions: failed,
      successRate: `${successRate}%`,
      lastRunTime: new Date().toISOString()
    };

    return this.lastRunMetrics;
  }

  static getMetrics(): AutomationMetrics {
    if (!this.lastRunMetrics) {
      return {
        totalFunctions: 22,
        activeFunctions: 0,
        passedFunctions: 0,
        failedFunctions: 0,
        successRate: '0%',
        lastRunTime: 'Never'
      };
    }
    return this.lastRunMetrics;
  }

  static getRecentResults(limit: number = 10): AutomationResult[] {
    return this.results.slice(-limit);
  }
}

export function registerRealAutomationEndpoints(app: Express) {
  
  // Run a single automation function
  app.post('/api/automation/run/:functionName', async (req, res) => {
    try {
      const { functionName } = req.params;
      const result = await RealAutomationRunner.runAutomationFunction(functionName);
      
      res.json({
        success: true,
        result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Run all automation functions
  app.post('/api/automation/run-all', async (req, res) => {
    try {
      const metrics = await RealAutomationRunner.runAllFunctions();
      
      res.json({
        success: true,
        metrics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get current automation metrics
  app.get('/api/automation/metrics', (req, res) => {
    const metrics = RealAutomationRunner.getMetrics();
    const recentResults = RealAutomationRunner.getRecentResults();
    
    res.json({
      success: true,
      metrics,
      recentResults
    });
  });

  // Get recent automation results
  app.get('/api/automation/results', (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const results = RealAutomationRunner.getRecentResults(limit);
    
    res.json({
      success: true,
      results
    });
  });
}