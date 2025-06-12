import type { Express } from "express";
import { executeLiveAutomation, AUTOMATION_FUNCTIONS } from "./liveAutomationWrappers";

export function registerLiveAutomationEndpoints(app: Express) {
  
  // Execute any automation function with live logging
  app.post("/api/automation/execute/:functionName", async (req, res) => {
    try {
      const { functionName } = req.params;
      
      if (!AUTOMATION_FUNCTIONS.includes(functionName)) {
        return res.status(400).json({
          success: false,
          error: `Unknown automation function: ${functionName}`
        });
      }

      const result = await executeLiveAutomation(functionName);
      
      if (result.success) {
        res.json({
          success: true,
          message: `Automation ${functionName} executed successfully`,
          recordId: result.recordId,
          airtableLogged: true
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error || 'Automation execution failed'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Automation execution failed: ${error}`
      });
    }
  });

  // Batch execute multiple automation functions
  app.post("/api/automation/batch-execute", async (req, res) => {
    try {
      const { functions } = req.body;
      
      if (!Array.isArray(functions)) {
        return res.status(400).json({
          success: false,
          error: "Functions must be an array"
        });
      }

      const results = [];
      
      for (const functionName of functions) {
        if (AUTOMATION_FUNCTIONS.includes(functionName)) {
          const result = await executeLiveAutomation(functionName);
          results.push({
            function: functionName,
            success: result.success,
            recordId: result.recordId,
            error: result.error
          });
        } else {
          results.push({
            function: functionName,
            success: false,
            error: `Unknown function: ${functionName}`
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      
      res.json({
        success: true,
        message: `Executed ${successCount}/${results.length} automation functions`,
        results,
        totalExecuted: successCount,
        totalFailed: results.length - successCount
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Batch execution failed: ${error}`
      });
    }
  });

  // Get available automation functions
  app.get("/api/automation/functions", (req, res) => {
    res.json({
      success: true,
      functions: AUTOMATION_FUNCTIONS,
      totalFunctions: AUTOMATION_FUNCTIONS.length
    });
  });

  // Test all automation functions (live logging enabled)
  app.post("/api/automation/test-all", async (req, res) => {
    try {
      const results = [];
      
      for (const functionName of AUTOMATION_FUNCTIONS) {
        const result = await executeLiveAutomation(functionName);
        results.push({
          function: functionName,
          success: result.success,
          recordId: result.recordId,
          error: result.error
        });
      }

      const successCount = results.filter(r => r.success).length;
      
      res.json({
        success: true,
        message: `Live test completed: ${successCount}/${AUTOMATION_FUNCTIONS.length} functions passed`,
        results,
        totalExecuted: successCount,
        totalFailed: AUTOMATION_FUNCTIONS.length - successCount,
        liveLoggingEnabled: true
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Live test failed: ${error}`
      });
    }
  });

  // Execute core business automation functions
  app.post("/api/automation/core/:category", async (req, res) => {
    try {
      const { category } = req.params;
      
      const categoryFunctions = {
        'sales': ['log_to_crm', 'create_invoice', 'sync_to_hubspot', 'sync_to_quickbooks'],
        'communication': ['send_slack_notification', 'send_email_receipt', 'send_sms_alert'],
        'voice': ['record_call_log', 'score_call', 'run_voicebot_script', 'log_voice_sentiment', 'store_transcription'],
        'analytics': ['sync_to_smartspend', 'generate_roi_snapshot', 'gpt_summary'],
        'hr': ['candidate_screening', 'background_checks', 'reference_verification', 'onboarding_automation'],
        'compliance': ['document_management', 'policy_distribution', 'compliance_training', 'generate_compliance_pdf'],
        'operations': ['safety_monitoring', 'incident_reporting', 'emergency_response', 'inventory_sync'],
        'productivity': ['trigger_quote_pdf', 'calendar_booking', 'upload_to_drive', 'stripe_payment']
      };

      const functions = categoryFunctions[category];
      if (!functions) {
        return res.status(400).json({
          success: false,
          error: `Unknown category: ${category}`,
          availableCategories: Object.keys(categoryFunctions)
        });
      }

      const results = [];
      
      for (const functionName of functions) {
        const result = await executeLiveAutomation(functionName);
        results.push({
          function: functionName,
          success: result.success,
          recordId: result.recordId,
          error: result.error
        });
      }

      const successCount = results.filter(r => r.success).length;
      
      res.json({
        success: true,
        message: `${category} automation completed: ${successCount}/${functions.length} functions executed`,
        category,
        results,
        totalExecuted: successCount,
        totalFailed: functions.length - successCount,
        liveLoggingEnabled: true
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Category automation failed: ${error}`
      });
    }
  });
}