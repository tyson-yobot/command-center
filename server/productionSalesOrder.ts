import type { Express, Request, Response } from "express";
import { spawn } from "child_process";

export function registerProductionSalesOrder(app: Express) {
  console.log("🚀 Registering production sales order webhook");
  
  app.post('/webhook/tally_sales_order', async (req: Request, res: Response) => {
    try {
      console.log("📥 Received Tally webhook");
      
      // Parse mapped fields only
      const cleanData = {
        "Full Name": req.body["Full Name"] || "",
        "Company Name": req.body["Company Name"] || "",
        "Email Address": req.body["Email Address"] || "",
        "Phone Number": req.body["Phone Number"] || "",
        "Website": req.body["Website"] || "",
        "🤖 Bot Package": req.body["🤖 Bot Package"] || "",
        "🧩 Add-On Modules": req.body["🧩 Add-On Modules"] || "",
        "💳 Final Payment Amount Due": req.body["💳 Final Payment Amount Due"] || "",
        "✍️ Typed Signature": req.body["✍️ Typed Signature"] || "",
        "💳 Preferred Payment Method": req.body["💳 Preferred Payment Method"] || ""
      };
      
      console.log(`📋 Processing order for: ${cleanData["Company Name"]}`);
      
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
        if (code === 0) {
          try {
            const result = JSON.parse(output);
            console.log("✅ Python pipeline completed successfully");
            res.json({
              success: true,
              message: "Sales order processed successfully",
              ...result
            });
          } catch (parseError) {
            console.error("❌ Failed to parse Python output:", parseError);
            res.status(500).json({
              success: false,
              message: "Pipeline execution failed",
              error: "Invalid response format"
            });
          }
        } else {
          console.error(`❌ Python pipeline failed with code ${code}:`, errorOutput);
          res.status(500).json({
            success: false,
            message: "Sales order processing failed",
            error: errorOutput || "Python execution failed"
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