import express from 'express';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Ensure PDFs directory exists
const pdfDir = path.resolve('./pdfs');
if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, { recursive: true });
}

router.post('/generate', async (req, res) => {
  try {
    const { clientName, botPackage, addOns = [], totalOneTime, totalMonthly } = req.body;

    if (!clientName || !botPackage) {
      return res.status(400).json({ error: 'Client name and bot package are required' });
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: 'Segoe UI', Arial, sans-serif; 
              padding: 40px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              margin: 0;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 15px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 3px solid #1A73E8;
              padding-bottom: 20px;
            }
            h1 { 
              color: #1A73E8; 
              font-size: 28px;
              margin-bottom: 10px;
            }
            .company-tag {
              color: #666;
              font-size: 14px;
              font-weight: 300;
            }
            .section { 
              margin-bottom: 30px;
              padding: 20px;
              background: #f8f9fa;
              border-radius: 8px;
              border-left: 4px solid #1A73E8;
            }
            .client-info {
              background: linear-gradient(135deg, #667eea20, #764ba220);
            }
            .package-info {
              background: linear-gradient(135deg, #f093fb20, #f5576c20);
            }
            .pricing-info {
              background: linear-gradient(135deg, #4facfe20, #00f2fe20);
            }
            .total { 
              font-size: 20px; 
              font-weight: bold;
              color: #1A73E8;
              margin: 10px 0;
            }
            .add-ons ul {
              margin: 10px 0;
              padding-left: 20px;
            }
            .add-ons li {
              margin: 8px 0;
              color: #444;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #888;
              border-top: 1px solid #eee;
              padding-top: 20px;
            }
            .highlight {
              background: #1A73E8;
              color: white;
              padding: 2px 8px;
              border-radius: 4px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🤖 YoBot® Professional Quote</h1>
              <div class="company-tag">Enterprise AI Automation Solutions</div>
            </div>
            
            <div class="section client-info">
              <h3>👤 Client Information</h3>
              <strong>Client:</strong> <span class="highlight">${clientName}</span><br>
              <strong>Quote Date:</strong> ${new Date().toLocaleDateString()}<br>
              <strong>Quote Valid Until:</strong> ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </div>
            
            <div class="section package-info">
              <h3>📦 Selected Package</h3>
              <strong>Package:</strong> <span class="highlight">${botPackage}</span>
              
              ${addOns.length > 0 ? `
                <div class="add-ons">
                  <h4>🔧 Selected Add-Ons:</h4>
                  <ul>${addOns.map((item: string) => `<li>${item}</li>`).join('')}</ul>
                </div>
              ` : ''}
            </div>
            
            <div class="section pricing-info">
              <h3>💰 Investment Summary</h3>
              <div class="total">💳 One-Time Setup: $${totalOneTime?.toLocaleString() || '0'}</div>
              <div class="total">📆 Monthly Service: $${totalMonthly?.toLocaleString() || '0'}/month</div>
              
              <div style="margin-top: 20px; padding: 15px; background: #e8f5e8; border-radius: 8px;">
                <strong>✅ What's Included:</strong>
                <ul style="margin: 10px 0;">
                  <li>24/7 AI-powered automation</li>
                  <li>Real-time performance analytics</li>
                  <li>Enterprise-grade security</li>
                  <li>Dedicated support team</li>
                  <li>Custom integration setup</li>
                </ul>
              </div>
            </div>
            
            <div class="footer">
              <div>Generated by YoBot® Command Center on ${new Date().toLocaleString()}</div>
              <div style="margin-top: 10px;">🚀 Ready to transform your business with AI automation</div>
            </div>
          </div>
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const timestamp = Date.now();
    const filename = `${timestamp}_quote_${clientName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    const pdfPath = path.resolve(pdfDir, filename);
    
    await page.pdf({ 
      path: pdfPath, 
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        bottom: '20px',
        left: '20px',
        right: '20px'
      }
    });

    await browser.close();

    // Set proper headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    const fileStream = fs.createReadStream(pdfPath);
    fileStream.pipe(res);
    
    // Clean up file after sending (optional)
    fileStream.on('end', () => {
      setTimeout(() => {
        fs.unlink(pdfPath, (err) => {
          if (err) console.error('Error cleaning up PDF:', err);
        });
      }, 5000);
    });

  } catch (err: any) {
    console.error('PDF Quote generation failed:', err);
    res.status(500).json({ 
      error: 'Failed to generate quote PDF',
      details: err.message 
    });
  }
});

export default router;