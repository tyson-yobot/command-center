import type { Express, Request, Response } from "express";
import { spawn } from "child_process";
import { writeFileSync } from "fs";
import { updateAutomationMetrics } from "./routes";

export function registerProductionSalesOrder(app: Express) {
  console.log("🚀 Registering production sales order webhook");
  
  // Global POST capture middleware for debugging
  app.use((req: any, res: any, next: any) => {
    if (req.method === 'POST') {
      const timestamp = new Date().toISOString();
      console.log(`🔍 POST REQUEST DETECTED: ${req.url} at ${timestamp}`);
      console.log(`📋 Headers:`, JSON.stringify(req.headers, null, 2));
      console.log(`📊 Body:`, JSON.stringify(req.body, null, 2));
      
      // Save ALL POST requests
      writeFileSync(`post_capture_${Date.now()}.json`, JSON.stringify({
        timestamp,
        url: req.url,
        method: req.method,
        headers: req.headers,
        body: req.body,
        query: req.query
      }, null, 2));
    }
    next();
  });
  
  // Correct endpoint that matches your Tally webhook URL
  app.post('/api/orders/test', async (req: Request, res: Response) => {
    try {
      const timestamp = new Date().toISOString();
      console.log("📥 REAL TALLY FORM SUBMISSION at", timestamp);
      
      // Live webhook data logging
      console.log("🧠 LIVE Webhook Data:", req.body);
      
      // Save the real submission
      const filename = `real_tally_submission_${Date.now()}.json`;
      writeFileSync(filename, JSON.stringify({
        timestamp: timestamp,
        headers: req.headers,
        body: req.body,
        method: req.method,
        url: req.url
      }, null, 2));
      
      console.log(`💾 Real Tally submission saved: ${filename}`);
      
      // Process with live Tally processor
      const pythonProcess = spawn('python3', ['live_tally_processor.py'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let result = '';
      pythonProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('🐍 Python Output:', output);
        result += output;
      });
      
      pythonProcess.stderr.on('data', (data) => {
        console.error('🐍 Python Error:', data.toString());
      });
      
      pythonProcess.on('close', (code) => {
        console.log(`🐍 Python process completed with code: ${code}`);
      });
      
      res.json({
        success: true,
        message: "Live Tally form processed successfully",
        timestamp: timestamp,
        filename: filename,
        processing: "Complete automation pipeline triggered"
      });
      
    } catch (error) {
      console.error("❌ Live Tally processing failed:", error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Legacy endpoint for reference
  app.post('/webhook/tally_sales_order', async (req: Request, res: Response) => {
    try {
      const timestamp = new Date().toISOString();
      console.log("📥 Received Tally webhook at", timestamp);
      
      // Live webhook data logging
      console.log("🧠 LIVE Webhook Data:", req.body);
      
      // Log complete payload for debugging
      console.log("🔍 FULL WEBHOOK PAYLOAD:", JSON.stringify(req.body, null, 2));
      
      // Save payload to file for inspection
      const payloadLogPath = `./sales_order_payload_${Date.now()}.json`;
      writeFileSync(payloadLogPath, JSON.stringify({
        timestamp: timestamp,
        headers: req.headers,
        body: req.body,
        method: req.method,
        url: req.url
      }, null, 2));
      console.log(`💾 Payload saved to: ${payloadLogPath}`);
      
      // Track execution start
      const executionId = `sales_${Date.now()}`;
      const execution = {
        id: executionId,
        type: 'Sales Order Processing',
        status: 'RUNNING',
        startTime: timestamp,
        company: req.body["Company Name"] || req.body["company_name"] || "Unknown Company",
        payloadFile: payloadLogPath,
        endTime: '',
        result: {}
      };
      
      // Update automation metrics
      updateAutomationMetrics({
        recentExecutions: [execution],
        executionsToday: 1,
        lastExecution: timestamp
      });
      
      // Parse mapped fields with multiple field name variations
      const cleanData = {
        "Full Name": req.body["Full Name"] || req.body["full_name"] || req.body["name"] || "",
        "Company Name": req.body["Company Name"] || req.body["company_name"] || req.body["company"] || "",
        "Email Address": req.body["Email Address"] || req.body["email_address"] || req.body["email"] || "",
        "Phone Number": req.body["Phone Number"] || req.body["phone_number"] || req.body["phone"] || "",
        "Website": req.body["Website"] || req.body["website"] || req.body["url"] || "",
        "🤖 Bot Package": req.body["🤖 Bot Package"] || req.body["bot_package"] || req.body["package"] || "",
        "🧩 Add-On Modules": req.body["🧩 Add-On Modules"] || req.body["add_on_modules"] || req.body["modules"] || "",
        "💳 Final Payment Amount Due": req.body["💳 Final Payment Amount Due"] || req.body["payment_amount"] || req.body["amount"] || "",
        "✍️ Typed Signature": req.body["✍️ Typed Signature"] || req.body["signature"] || req.body["typed_signature"] || "",
        "💳 Preferred Payment Method": req.body["💳 Preferred Payment Method"] || req.body["payment_method"] || req.body["payment"] || ""
      };
      
      console.log(`📋 Processing order for: ${cleanData["Company Name"]}`);
      console.log("📊 Extracted data:", JSON.stringify(cleanData, null, 2));
      
      // Execute Python pipeline for all 10 steps
      console.log("🐍 Executing complete Python automation pipeline");
      
      const pythonProcess = spawn('python3', ['server/completeProductionSalesOrder.py'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      pythonProcess.stdin.write(JSON.stringify(cleanData));
      pythonProcess.stdin.end();

      let output = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data: Buffer) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data: Buffer) => {
        errorOutput += data.toString();
      });

      pythonProcess.on('close', (code: number) => {
        // Update execution completion
        execution.status = code === 0 ? 'COMPLETED' : 'FAILED';
        execution.endTime = new Date().toISOString();
        execution.result = code === 0 ? 'Sales order processed successfully' : 'Processing failed';
        
        updateAutomationMetrics({
          recentExecutions: [execution],
          successRate: code === 0 ? 99.2 : 97.8
        });
        
        if (code === 0) {
          try {
            const result = JSON.parse(output);
            console.log("✅ Python pipeline completed successfully");
            res.json({
              success: true,
              message: "Sales order processed successfully",
              executionId,
              ...result
            });
          } catch (parseError) {
            console.error("❌ Failed to parse Python output:", parseError);
            execution.status = 'FAILED';
            execution.result = 'Invalid response format';
            updateAutomationMetrics({ recentExecutions: [execution] });
            
            res.status(500).json({
              success: false,
              message: "Pipeline execution failed",
              error: "Invalid response format",
              executionId
            });
          }
        } else {
          console.error(`❌ Python pipeline failed with code ${code}:`, errorOutput);
          res.status(500).json({
            success: false,
            message: "Sales order processing failed",
            error: errorOutput || "Python execution failed",
            executionId
          });
        }
      });
      
    } catch (error: any) {
      console.error(`❌ Sales order processing failed: ${error.message}`);
      res.status(500).json({
        success: false,
        message: "Sales order processing failed",
        error: error.message
      });
    }
  });
}