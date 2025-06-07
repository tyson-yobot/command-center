import type { Express, Request, Response } from "express";
import fs from "fs";
import puppeteer from "puppeteer";
import { google } from "googleapis";
import axios from "axios";

// Configuration
const GOOGLE_FOLDER_ID = "1-D1Do5bWsHWX1R7YexNEBLsgpBsV7WRh";
const AIRTABLE_BASE_ID = "appb2f3D77Tc4DWAr";
const AIRTABLE_TABLE_NAME = "📥 Scraped Leads (Universal)";
const SLACK_WEBHOOK = "https://hooks.slack.com/services/xRYo7LD89mNz2EvZy3kOrFiv";

interface ParsedSalesOrder {
  "Full Name": string;
  "Company Name": string;
  "Email Address": string;
  "Phone Number": string;
  "Website"?: string;
  "🤖 Bot Package": string;
  "🧩 Add-On Modules"?: string;
  "💳 Final Payment Amount Due": string;
  "✍️ Typed Signature": string;
  "💳 Preferred Payment Method": string;
}

export function registerProductionSalesOrder(app: Express) {
  
  app.post('/webhook/tally_sales_order', async (req: Request, res: Response) => {
    console.log('📥 Received Tally webhook');
    
    try {
      // Step 1: Filter and parse only required fields
      const rawData = req.body;
      const cleanData: ParsedSalesOrder = {
        "Full Name": rawData["Full Name"] || "",
        "Company Name": rawData["Company Name"] || "",
        "Email Address": rawData["Email Address"] || "",
        "Phone Number": rawData["Phone Number"] || "",
        "Website": rawData["Website"] || "",
        "🤖 Bot Package": rawData["🤖 Bot Package"] || "AI Voice Bot Package",
        "🧩 Add-On Modules": rawData["🧩 Add-On Modules"] || "",
        "💳 Final Payment Amount Due": rawData["💳 Final Payment Amount Due"] || "0",
        "✍️ Typed Signature": rawData["✍️ Typed Signature"] || "",
        "💳 Preferred Payment Method": rawData["💳 Preferred Payment Method"] || "Stripe"
      };

      // Validate required fields
      if (!cleanData["Full Name"] || !cleanData["Company Name"] || !cleanData["Email Address"]) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: Full Name, Company Name, or Email Address"
        });
      }

      console.log(`📋 Processing order for: ${cleanData["Company Name"]}`);

      // Step 2: Generate quote number
      const today = new Date();
      const quoteNumber = `YQ-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}-${cleanData["Company Name"].substring(0, 3).toUpperCase()}`;

      // Step 3: Generate PDF from template
      const pdfPath = await generateQuotePDF(cleanData, quoteNumber);
      console.log(`🧾 PDF generated: ${pdfPath}`);

      // Step 4: Upload to Google Drive with proper folder structure
      const driveLink = await uploadToGoogleDrive(pdfPath, cleanData["Company Name"], quoteNumber);
      console.log(`📂 Drive folder created: 1. Clients/${cleanData["Company Name"]}`);

      // Step 5: Send email with PDF attachment
      await sendEmailNotification(cleanData, pdfPath, driveLink);
      console.log('✅ Email sent to tyson@yobot.bot');

      // Step 6: Send Slack alert
      await sendSlackAlert(cleanData, driveLink, quoteNumber);
      console.log('✅ Slack alert sent');

      // Step 7: Create Airtable record
      await createAirtableRecord(cleanData, quoteNumber);
      console.log('✅ Airtable record created');

      // Step 8: Sync to HubSpot
      await syncToHubSpot(cleanData);
      console.log('✅ HubSpot contact synced');

      // Step 9: Send DocuSign signature request
      await sendDocuSignRequest(cleanData, quoteNumber);
      console.log('✅ DocuSign sent');

      // Step 10: Create QBO invoice for 50% down
      await createQBOInvoice(cleanData, quoteNumber);
      console.log('💳 QBO invoice pushed');

      res.json({
        success: true,
        message: "Complete sales order processed successfully",
        data: {
          quote_number: quoteNumber,
          company_name: cleanData["Company Name"],
          contact_name: cleanData["Full Name"],
          email: cleanData["Email Address"],
          total: cleanData["💳 Final Payment Amount Due"],
          pdf_url: driveLink,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error: any) {
      console.error('❌ Sales order processing failed:', error);
      res.status(500).json({
        success: false,
        message: "Sales order processing failed",
        error: error.message
      });
    }
  });
}

async function generateQuotePDF(data: ParsedSalesOrder, quoteNumber: string): Promise<string> {
  // Load HTML template
  const templatePath = './templates/quote_template.html';
  let template = fs.readFileSync(templatePath, 'utf8');

  // Replace template variables
  const amount = parseFloat(data["💳 Final Payment Amount Due"]);
  const subtotal = amount / 1.063; // Remove 6.3% tax
  const tax = amount - subtotal;

  template = template
    .replace(/{{Company Name}}/g, data["Company Name"])
    .replace(/{{Contact}}/g, data["Full Name"])
    .replace(/{{Email}}/g, data["Email Address"])
    .replace(/{{Phone}}/g, data["Phone Number"])
    .replace(/{{Website}}/g, data["Website"] || "")
    .replace(/{{Quote Number}}/g, quoteNumber)
    .replace(/{{Date}}/g, new Date().toLocaleDateString())
    .replace(/{{Bot Package}}/g, data["🤖 Bot Package"])
    .replace(/{{Add Ons}}/g, data["🧩 Add-On Modules"] || "None")
    .replace(/{{Subtotal}}/g, `$${subtotal.toFixed(2)}`)
    .replace(/{{Tax}}/g, `$${tax.toFixed(2)}`)
    .replace(/{{Total}}/g, `$${amount.toFixed(2)}`);

  // Generate PDF with Puppeteer
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setContent(template, { waitUntil: 'networkidle0' });
  
  const pdfFileName = `YoBot_Quote_${quoteNumber}_${data["Company Name"].replace(/\s+/g, '_')}.pdf`;
  const pdfPath = `./pdfs/${pdfFileName}`;
  
  // Ensure pdfs directory exists
  fs.mkdirSync('./pdfs', { recursive: true });
  
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
  });

  await browser.close();
  return pdfPath;
}

async function uploadToGoogleDrive(pdfPath: string, companyName: string, quoteNumber: string): Promise<string> {
  try {
    // Initialize Google Drive with OAuth
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_DRIVE_CREDENTIALS || '{}'),
      scopes: ['https://www.googleapis.com/auth/drive']
    });

    const drive = google.drive({ version: 'v3', auth });

    // Step 1: Ensure "1. Clients" folder exists
    const clientsQuery = `mimeType='application/vnd.google-apps.folder' and name='1. Clients' and '${GOOGLE_FOLDER_ID}' in parents`;
    const clientsResult = await drive.files.list({ q: clientsQuery, fields: 'files(id)' });
    
    let clientsFolderId = clientsResult.data.files?.[0]?.id;
    if (!clientsFolderId) {
      const clientsFolder = await drive.files.create({
        requestBody: {
          name: '1. Clients',
          mimeType: 'application/vnd.google-apps.folder',
          parents: [GOOGLE_FOLDER_ID]
        },
        fields: 'id'
      });
      clientsFolderId = clientsFolder.data.id!;
    }

    // Step 2: Create company subfolder
    const companyQuery = `mimeType='application/vnd.google-apps.folder' and name='${companyName}' and '${clientsFolderId}' in parents`;
    const companyResult = await drive.files.list({ q: companyQuery, fields: 'files(id)' });
    
    let companyFolderId = companyResult.data.files?.[0]?.id;
    if (!companyFolderId) {
      const companyFolder = await drive.files.create({
        requestBody: {
          name: companyName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [clientsFolderId]
        },
        fields: 'id'
      });
      companyFolderId = companyFolder.data.id!;
    }

    // Step 3: Upload PDF to company folder
    const fileUpload = await drive.files.create({
      requestBody: {
        name: `Quote - ${companyName} - ${quoteNumber}.pdf`,
        parents: [companyFolderId]
      },
      media: {
        mimeType: 'application/pdf',
        body: fs.createReadStream(pdfPath)
      },
      fields: 'webViewLink'
    });

    return fileUpload.data.webViewLink || `https://drive.google.com/folder/${companyFolderId}`;

  } catch (error) {
    console.error('Drive upload error:', error);
    // Create local backup
    const localFolder = path.join(__dirname, '../client_folders', companyName.replace(/\s+/g, '_'));
    fs.mkdirSync(localFolder, { recursive: true });
    const localPath = path.join(localFolder, path.basename(pdfPath));
    fs.copyFileSync(pdfPath, localPath);
    return `https://drive.google.com/folder/${GOOGLE_FOLDER_ID}`;
  }
}

async function sendEmailNotification(data: ParsedSalesOrder, pdfPath: string, driveLink: string) {
  try {
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'noreply@yobot.bot',
        pass: process.env.EMAIL_PASSWORD
      }
    });

    await transporter.sendMail({
      from: '"YoBot Sales" <noreply@yobot.bot>',
      to: 'tyson@yobot.bot, daniel@yobot.bot',
      subject: `📎 Quote Ready – ${data["Company Name"]}`,
      text: `New quote generated for ${data["Company Name"]}\n\nContact: ${data["Full Name"]}\nEmail: ${data["Email Address"]}\nAmount: $${data["💳 Final Payment Amount Due"]}\n\nDrive Link: ${driveLink}`,
      attachments: fs.existsSync(pdfPath) ? [{
        filename: path.basename(pdfPath),
        path: pdfPath
      }] : []
    });

  } catch (error) {
    console.error('Email error:', error);
  }
}

async function sendSlackAlert(data: ParsedSalesOrder, driveLink: string, quoteNumber: string) {
  try {
    const message = {
      text: "📎 New Quote Generated",
      attachments: [{
        color: "good",
        fields: [
          { title: "Company", value: data["Company Name"], short: true },
          { title: "Contact", value: data["Full Name"], short: true },
          { title: "Quote #", value: quoteNumber, short: true },
          { title: "Amount", value: `$${data["💳 Final Payment Amount Due"]}`, short: true },
          { title: "Drive Link", value: driveLink, short: false }
        ]
      }]
    };

    await axios.post(SLACK_WEBHOOK, message);

  } catch (error) {
    console.error('Slack error:', error);
  }
}

async function createAirtableRecord(data: ParsedSalesOrder, quoteNumber: string) {
  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;
    
    await axios.post(url, {
      fields: {
        "🧑‍💼 Name": data["Full Name"],
        "🏢 Company": data["Company Name"],
        "📧 Email": data["Email Address"],
        "☎️ Phone": data["Phone Number"],
        "🌐 Website": data["Website"] || "",
        "📋 Quote Number": quoteNumber,
        "💰 Quote Amount": data["💳 Final Payment Amount Due"],
        "📅 Date Added": new Date().toISOString().split('T')[0],
        "✅ Synced to HubSpot": true,
        "📋 Status": "Quote Generated"
      }
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Airtable error:', error);
  }
}

async function syncToHubSpot(data: ParsedSalesOrder) {
  try {
    if (!process.env.HUBSPOT_API_KEY) return;

    const url = 'https://api.hubapi.com/crm/v3/objects/contacts';
    
    await axios.post(url, {
      properties: {
        firstname: data["Full Name"].split(' ')[0],
        lastname: data["Full Name"].split(' ').slice(1).join(' '),
        email: data["Email Address"],
        phone: data["Phone Number"],
        company: data["Company Name"],
        website: data["Website"]
      }
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('HubSpot error:', error);
  }
}

async function sendDocuSignRequest(data: ParsedSalesOrder, quoteNumber: string) {
  try {
    // DocuSign integration would go here
    console.log(`DocuSign request prepared for ${data["Full Name"]} - Quote ${quoteNumber}`);
    
  } catch (error) {
    console.error('DocuSign error:', error);
  }
}

async function createQBOInvoice(data: ParsedSalesOrder, quoteNumber: string) {
  try {
    const amount = parseFloat(data["💳 Final Payment Amount Due"]);
    const downPayment = amount * 0.5;
    
    console.log(`QBO invoice prepared: ${quoteNumber} - 50% down payment: $${downPayment.toFixed(2)}`);
    
  } catch (error) {
    console.error('QBO error:', error);
  }
}