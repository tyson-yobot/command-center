import type { Express, Request, Response } from "express";

// Central automation function registry
const AUTOMATION_FUNCTIONS = {
  // Core Automation Functions (1-40)
  "New Booking Sync": {
    id: 1,
    endpoint: "/api/automation-batch-1/function-1",
    category: "Core",
    description: "Syncs new calendar bookings to CRM"
  },
  "New Support Ticket": {
    id: 2,
    endpoint: "/api/automation-batch-1/function-2", 
    category: "Core",
    description: "Creates and routes support tickets"
  },
  "Manual Follow-up": {
    id: 3,
    endpoint: "/api/automation-batch-1/function-3",
    category: "Core", 
    description: "Triggers manual follow-up sequences"
  },
  "Start Pipeline Calls": {
    id: 4,
    endpoint: "/api/automation-batch-1/function-4",
    category: "Voice",
    description: "Initiates automated call pipeline"
  },
  "Stop Pipeline Calls": {
    id: 5,
    endpoint: "/api/automation-batch-1/function-5",
    category: "Voice",
    description: "Stops all pipeline calls"
  },
  "Initiate Voice Call": {
    id: 6,
    endpoint: "/api/automation-batch-1/function-6",
    category: "Voice",
    description: "Places individual voice calls"
  },
  "Send SMS": {
    id: 7,
    endpoint: "/api/automation-batch-1/function-7",
    category: "Communication",
    description: "Sends SMS notifications"
  },
  "Run Lead Scrape": {
    id: 8,
    endpoint: "/api/scraping/apollo",
    category: "Lead Generation",
    description: "Executes Apollo lead scraping"
  },
  "Export Data": {
    id: 9,
    endpoint: "/api/automation-batch-1/function-9",
    category: "Data",
    description: "Exports system data to CSV"
  },
  "Critical Escalation": {
    id: 10,
    endpoint: "/api/automation-batch-1/function-10",
    category: "Support",
    description: "Escalates critical issues"
  },

  // Sales Order Processing
  "Process Sales Order": {
    id: 11,
    endpoint: "/webhook/tally_sales_order",
    category: "Sales",
    description: "Complete sales order with Stripe/QB integration"
  },

  // Lead Scraping Functions (12-50)
  "Apollo Lead Search": {
    id: 12,
    endpoint: "/api/scraping/apollo",
    category: "Lead Generation",
    description: "Apollo professional lead scraping"
  },
  "PhantomBuster Scrape": {
    id: 13,
    endpoint: "/api/scraping/phantombuster",
    category: "Lead Generation", 
    description: "PhantomBuster LinkedIn scraping"
  },
  "Apify Google Maps": {
    id: 14,
    endpoint: "/api/scraping/apify",
    category: "Lead Generation",
    description: "Apify Google Maps business scraping"
  },

  // Content Creation Functions (51-100)
  "Generate Blog Post": {
    id: 51,
    endpoint: "/api/content/generate-blog",
    category: "Content",
    description: "AI-powered blog post generation"
  },
  "Create Social Media": {
    id: 52,
    endpoint: "/api/content/social-media",
    category: "Content",
    description: "Social media content creation"
  },
  "Video Script Generation": {
    id: 53,
    endpoint: "/api/content/video-script",
    category: "Content",
    description: "Video script generation"
  },

  // Voice & Communication Functions (101-200)
  "Voice Message Generation": {
    id: 101,
    endpoint: "/api/elevenlabs/generate",
    category: "Voice",
    description: "Generate AI voice messages"
  },
  "Call Monitoring": {
    id: 102,
    endpoint: "/api/voice/monitor-calls",
    category: "Voice",
    description: "Real-time call monitoring"
  },

  // Automation Batch Functions (201-1040)
  "Intake Form Validator": {
    id: 201,
    endpoint: "/api/automation-batch-21/function-201",
    category: "Validation",
    description: "Validates intake form submissions"
  },
  "QA Failure Alert": {
    id: 202,
    endpoint: "/api/automation-batch-21/function-202",
    category: "Quality",
    description: "Alerts on QA failures"
  },
  "Live Error Push": {
    id: 203,
    endpoint: "/api/automation-batch-21/function-203",
    category: "Monitoring",
    description: "Pushes live error notifications"
  },
  "Customer Reconciliation": {
    id: 204,
    endpoint: "/api/automation-batch-21/function-204",
    category: "Finance",
    description: "Reconciles customer accounts"
  },
  "Full API Health Check": {
    id: 205,
    endpoint: "/api/automation-batch-21/function-205",
    category: "Monitoring",
    description: "Comprehensive API health monitoring"
  }
};

// Batch automation mapping for functions 131-1040
const BATCH_MAPPINGS = {
  "Functions 131-140": "/api/automation-batch-14",
  "Functions 141-150": "/api/automation-batch-15", 
  "Functions 151-160": "/api/automation-batch-16",
  "Functions 161-170": "/api/automation-batch-17",
  "Functions 171-180": "/api/automation-batch-18",
  "Functions 181-190": "/api/automation-batch-19",
  "Functions 191-200": "/api/automation-batch-20",
  "Functions 201-210": "/api/automation-batch-21",
  "Functions 211-220": "/api/automation-batch-22",
  "Functions 221-230": "/api/automation-batch-23",
  "Functions 241-250": "/api/automation-batch-24",
  "Functions 251-260": "/api/automation-batch-25",
  "Functions 261-270": "/api/automation-batch-26",
  "Functions 271-280": "/api/automation-batch-27",
  "Functions 281-330": "/api/automation-batch-28",
  "Functions 331-530": "/api/automation-batch-29",
  "Functions 531-1040": "/api/automation-batch-30"
};

export function registerCentralAutomationDispatcher(app: Express) {
  console.log("🎯 Registering Central Automation Dispatcher");
  
  // Main Command Center execution endpoint
  app.post('/api/command-center/execute', async (req: Request, res: Response) => {
    try {
      const { command, category, payload, isTestMode } = req.body;
      
      console.log(`🚀 Command Center Execution: ${command} (${isTestMode ? 'TEST' : 'LIVE'} mode)`);
      
      // Find the automation function
      const automationFunc = AUTOMATION_FUNCTIONS[command as keyof typeof AUTOMATION_FUNCTIONS];
      
      if (!automationFunc) {
        return res.status(404).json({
          success: false,
          error: `Automation function '${command}' not found`,
          availableFunctions: Object.keys(AUTOMATION_FUNCTIONS)
        });
      }
      
      // Execute the automation function
      const startTime = new Date().toISOString();
      const executionId = `cmd_${Date.now()}`;
      
      try {
        // Make internal API call to the automation function
        const response = await fetch(`http://localhost:5000${automationFunc.endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            executionId,
            isTestMode,
            command,
            payload: payload || {},
            triggeredBy: 'command_center',
            timestamp: startTime
          })
        });
        
        const result = await response.json();
        
        // Log execution to metrics
        const execution = {
          id: executionId,
          command,
          category: automationFunc.category,
          status: response.ok ? 'SUCCESS' : 'FAILED',
          startTime,
          endTime: new Date().toISOString(),
          isTestMode,
          result: result
        };
        
        // Log to Airtable if live mode
        if (!isTestMode) {
          await logCommandExecution(execution);
        }
        
        res.json({
          success: response.ok,
          executionId,
          command,
          category: automationFunc.category,
          isTestMode,
          result,
          timestamp: startTime
        });
        
      } catch (executionError) {
        console.error(`❌ Command execution failed: ${executionError}`);
        res.status(500).json({
          success: false,
          error: executionError.message,
          command,
          executionId
        });
      }
      
    } catch (error) {
      console.error('❌ Command Center dispatcher error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
  
  // Get available automation functions
  app.get('/api/command-center/functions', (req: Request, res: Response) => {
    const functions = Object.entries(AUTOMATION_FUNCTIONS).map(([name, config]) => ({
      name,
      id: config.id,
      category: config.category,
      description: config.description,
      endpoint: config.endpoint
    }));
    
    res.json({
      success: true,
      totalFunctions: functions.length,
      functions,
      batchMappings: BATCH_MAPPINGS
    });
  });
  
  // Execute batch automation functions
  app.post('/api/command-center/execute-batch', async (req: Request, res: Response) => {
    try {
      const { batchName, functionIds, isTestMode } = req.body;
      
      console.log(`🔄 Executing batch: ${batchName} with ${functionIds.length} functions`);
      
      const results = [];
      
      for (const functionId of functionIds) {
        try {
          const endpoint = `/api/automation-batch-${Math.ceil(functionId / 10)}/function-${functionId}`;
          
          const response = await fetch(`http://localhost:5000${endpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              functionId,
              isTestMode,
              batchExecution: true,
              timestamp: new Date().toISOString()
            })
          });
          
          const result = await response.json();
          results.push({
            functionId,
            success: response.ok,
            result
          });
          
        } catch (funcError) {
          results.push({
            functionId,
            success: false,
            error: funcError.message
          });
        }
      }
      
      res.json({
        success: true,
        batchName,
        totalFunctions: functionIds.length,
        successCount: results.filter(r => r.success).length,
        results
      });
      
    } catch (error) {
      console.error('❌ Batch execution error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
}

// Helper function to log command executions to Airtable
async function logCommandExecution(execution: any) {
  try {
    const airtableToken = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN;
    const baseId = process.env.AIRTABLE_BASE_ID || 'appMbVQJ0n3nWR11N';
    
    await fetch(`https://api.airtable.com/v0/${baseId}/tblCommandExecution`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${airtableToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          "🎯 Command": execution.command,
          "📂 Category": execution.category,
          "✅ Status": execution.status,
          "🕒 Start Time": execution.startTime,
          "⏰ End Time": execution.endTime,
          "🧪 Test Mode": execution.isTestMode,
          "🆔 Execution ID": execution.id,
          "📊 Result": JSON.stringify(execution.result)
        }
      })
    });
    
  } catch (error) {
    console.error('Failed to log command execution:', error);
  }
}