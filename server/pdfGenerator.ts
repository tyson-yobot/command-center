import fs from 'fs';
import puppeteer from 'puppeteer';
import path from 'path';
import axios from 'axios';

// Make webhook URL from environment
const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL || 'https://hook.us2.make.com/q8jd4o7mpku0cddAdd';

/**
 * Notify Make.com webhook with PDF generation data
 */
async function notifyMakeWithPDF(pdfData: Record<string, any>): Promise<void> {
  try {
    const response = await axios.post(MAKE_WEBHOOK_URL, pdfData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Make Webhook Triggered:', response.status);
  } catch (error: any) {
    console.error('❌ Failed to trigger Make:', error.message);
  }
}

/**
 * Replace {{keys}} in the HTML template with real values
 */
function injectData(template: string, data: Record<string, any>): string {
  return template.replace(/{{(.*?)}}/g, (_, key) => data[key.trim()] || '');
}

/**
 * Generate PDF from template and data
 */
export async function generatePDF(type: string, data: Record<string, any>, outputPath: string): Promise<void> {
  const fileMap: Record<string, string> = {
    quote: 'quote.html',
    roi: 'roi-report.html',
  };

  const templatePath = path.join(process.cwd(), 'templates', fileMap[type]);
  
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }

  const templateHtml = fs.readFileSync(templatePath, 'utf-8');
  const html = injectData(templateHtml, data);

  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await page.pdf({ 
      path: outputPath, 
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1cm',
        right: '1cm',
        bottom: '1cm',
        left: '1cm'
      }
    });
  } finally {
    await browser.close();
  }
}

/**
 * Generate quote PDF for client
 */
export async function generateQuotePDF(quoteData: {
  clientName: string;
  botPackage: string;
  addons: string;
  oneTime: string;
  recurring: string;
  date: string;
  version: string;
}): Promise<string> {
  const timestamp = Date.now();
  const quoteId = `Q${timestamp}`;
  const filename = `quote-${quoteData.clientName.replace(/\s+/g, '-')}-${timestamp}.pdf`;
  const outputPath = path.join(process.cwd(), 'static', filename);

  // Ensure static directory exists
  const staticDir = path.join(process.cwd(), 'static');
  if (!fs.existsSync(staticDir)) {
    fs.mkdirSync(staticDir, { recursive: true });
  }

  await generatePDF('quote', quoteData, outputPath);

  // Trigger Make webhook after successful PDF generation
  const webhookPayload = {
    pdf_url: `/static/${filename}`,
    client: quoteData.clientName,
    type: "quote",
    quote_id: quoteId,
    timestamp: new Date().toISOString(),
    package: quoteData.botPackage,
    one_time_price: quoteData.oneTime,
    recurring_price: quoteData.recurring,
    addons: quoteData.addons
  };

  await notifyMakeWithPDF(webhookPayload);

  return outputPath;
}

/**
 * Generate ROI report PDF
 */
export async function generateROIPDF(roiData: {
  clientName: string;
  reportPeriod: string;
  date: string;
  package: string;
  ticketsProcessed: string;
  responseTime: string;
  satisfaction: string;
  costSavings: string;
  roiPercentage: string;
  monthlySavings: string;
  achievement1: string;
  achievement2: string;
  achievement3: string;
}): Promise<string> {
  const timestamp = Date.now();
  const reportId = `ROI${timestamp}`;
  const filename = `roi-report-${roiData.clientName.replace(/\s+/g, '-')}-${timestamp}.pdf`;
  const outputPath = path.join(process.cwd(), 'static', filename);

  // Ensure static directory exists
  const staticDir = path.join(process.cwd(), 'static');
  if (!fs.existsSync(staticDir)) {
    fs.mkdirSync(staticDir, { recursive: true });
  }

  await generatePDF('roi', roiData, outputPath);

  // Trigger Make webhook after successful PDF generation
  const webhookPayload = {
    pdf_url: `/static/${filename}`,
    client: roiData.clientName,
    type: "roi_report",
    report_id: reportId,
    timestamp: new Date().toISOString(),
    package: roiData.package,
    report_period: roiData.reportPeriod,
    tickets_processed: roiData.ticketsProcessed,
    roi_percentage: roiData.roiPercentage,
    monthly_savings: roiData.monthlySavings,
    satisfaction: roiData.satisfaction
  };

  await notifyMakeWithPDF(webhookPayload);

  return outputPath;
}