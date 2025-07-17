import * as PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';

export interface QuoteData {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  serviceType: string;
  monthlyFee: number;
  setupFee: number;
  totalFirstMonth: number;
}

export class PDFGenerator {
  private driveService: any;

  constructor() {
    this.initializeGoogleDrive();
  }

  private async initializeGoogleDrive() {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    this.driveService = google.drive({ version: 'v3', auth: oauth2Client });
  }

  async generateQuotePDF(quoteData: QuoteData): Promise<{ success: boolean; filePath?: string; driveLink?: string; error?: string }> {
    try {
      const fileName = `YoBot_Quote_${quoteData.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
      const filePath = path.join(process.cwd(), 'pdfs', fileName);

      // Ensure pdfs directory exists
      const pdfsDir = path.dirname(filePath);
      if (!fs.existsSync(pdfsDir)) {
        fs.mkdirSync(pdfsDir, { recursive: true });
      }

      // Create PDF document
      const doc = new (PDFDocument as any)({ margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Add YoBot header
      doc.fontSize(24).font('Helvetica-Bold').text('YoBot® AI Sales Quote', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica').text('Enterprise AI Automation Solutions', { align: 'center' });
      doc.moveDown(2);

      // Company Information
      doc.fontSize(16).font('Helvetica-Bold').text('Quote For:', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica');
      doc.text(`Company: ${quoteData.companyName}`);
      doc.text(`Contact: ${quoteData.contactName}`);
      doc.text(`Email: ${quoteData.email}`);
      if (quoteData.phone) {
        doc.text(`Phone: ${quoteData.phone}`);
      }
      doc.moveDown(2);

      // Service Details
      doc.fontSize(16).font('Helvetica-Bold').text('Service Package:', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica');
      doc.text(`Package: ${quoteData.serviceType}`);
      doc.moveDown(1);

      // Pricing Table
      doc.fontSize(16).font('Helvetica-Bold').text('Investment Details:', { underline: true });
      doc.moveDown(0.5);
      
      // Table headers
      const tableTop = doc.y;
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('Description', 50, tableTop);
      doc.text('Amount', 400, tableTop, { width: 100, align: 'right' });
      
      // Line under headers
      doc.moveTo(50, tableTop + 20).lineTo(500, tableTop + 20).stroke();
      
      // Table content
      doc.font('Helvetica');
      let currentY = tableTop + 30;
      
      doc.text('Monthly Service Fee', 50, currentY);
      doc.text(`$${quoteData.monthlyFee.toLocaleString()}`, 400, currentY, { width: 100, align: 'right' });
      currentY += 20;
      
      doc.text('Setup & Onboarding Fee', 50, currentY);
      doc.text(`$${quoteData.setupFee.toLocaleString()}`, 400, currentY, { width: 100, align: 'right' });
      currentY += 30;
      
      // Total line
      doc.moveTo(300, currentY - 10).lineTo(500, currentY - 10).stroke();
      doc.font('Helvetica-Bold');
      doc.text('First Month Total', 50, currentY);
      doc.text(`$${quoteData.totalFirstMonth.toLocaleString()}`, 400, currentY, { width: 100, align: 'right' });
      
      doc.moveDown(3);

      // Terms and Conditions
      doc.fontSize(14).font('Helvetica-Bold').text('Terms & Conditions:', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica');
      doc.text('• Monthly fees are billed in advance on the same date each month');
      doc.text('• Setup fee is a one-time charge due upon contract signing');
      doc.text('• 30-day notice required for cancellation');
      doc.text('• All services include 24/7 technical support and monitoring');
      doc.text('• Quote valid for 30 days from issue date');
      
      doc.moveDown(2);
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text(`Quote Date: ${new Date().toLocaleDateString()}`);
      doc.text('Quote ID: YB-' + Date.now().toString().slice(-6));

      // Footer
      doc.fontSize(10).font('Helvetica');
      doc.text('YoBot® - Transforming Business Communication Through AI', 50, doc.page.height - 100, { align: 'center' });
      doc.text(`Contact: ${process.env.CONTACT_EMAIL || "sales@yobot.bot"} | Phone: ${process.env.CONTACT_PHONE || "(555) 123-4567"}`, { align: "center" });

      doc.end();

      // Wait for PDF generation to complete
      await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });

      // Upload to Google Drive with your specific folder ID
      const driveLink = await this.uploadToGoogleDrive(filePath, fileName, quoteData.companyName);

      return {
        success: true,
        filePath,
        driveLink
      };

    } catch (error) {
      console.error('PDF generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  private async uploadToGoogleDrive(filePath: string, fileName: string, companyName: string): Promise<string> {
    try {
      // Your specific Google Drive folder ID
      const parentFolderId = '1-D1Do5bWsHWX1R7YexNEBLsgpBsV7WRh';
      
      // Check if company folder exists, create if not
      const foldersResponse = await this.driveService.files.list({
        q: `mimeType='application/vnd.google-apps.folder' and name='${companyName}' and '${parentFolderId}' in parents`,
        fields: 'files(id, name)'
      });

      let companyFolderId = foldersResponse.data.files?.[0]?.id;

      if (!companyFolderId) {
        // Create company folder
        const folderResponse = await this.driveService.files.create({
          requestBody: {
            name: companyName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentFolderId]
          },
          fields: 'id'
        });
        companyFolderId = folderResponse.data.id;
      }

      // Upload PDF to company folder
      const fileResponse = await this.driveService.files.create({
        requestBody: {
          name: fileName,
          parents: [companyFolderId]
        },
        media: {
          mimeType: 'application/pdf',
          body: fs.createReadStream(filePath)
        },
        fields: 'id, webViewLink'
      });

      return fileResponse.data.webViewLink;
    } catch (error) {
      console.error('Google Drive upload error:', error);
      throw new Error(`Failed to upload to Google Drive: ${error.message}`);
    }
  }
}
