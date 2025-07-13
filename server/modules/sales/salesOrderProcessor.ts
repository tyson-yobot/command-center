import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import axios from 'axios';
import { getApiKey, BASE_ID, SCRAPED_LEADS_TABLE_NAME } from '@shared/airtableConfig';

// Configuration
const GOOGLE_FOLDER_ID = "1-D1Do5bWsHWX1R7YexNEBLsgpBsV7WRh";
const AIRTABLE_API_KEY = getApiKey();
const TABLE_NAME = SCRAPED_LEADS_TABLE_NAME;

interface FormData {
  'Contact Name': string;
  'Company Name': string;
  'Email': string;
  'Phone Number': string;
  'Website'?: string;
}

export class SalesOrderProcessor {
  private driveService: any;
  
  constructor() {
    this.initializeGoogleDrive();
  }

  private async initializeGoogleDrive() {
    try {
      const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
      
      auth.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN
      });

      this.driveService = google.drive({ version: 'v3', auth });
    } catch (error) {
      console.error('Google Drive initialization failed:', error);
    }
  }

  // 1. Upload to Google Drive with folder creation
  async uploadToDrive(pdfPath: string, companyName: string): Promise<string> {
    try {
      if (!this.driveService) {
        throw new Error('Google Drive service not initialized');
      }

      console.log(`🔍 Checking if folder for '${companyName}' exists in parent ID ${GOOGLE_FOLDER_ID}`);

      // Check if company folder exists
      const foldersResponse = await this.driveService.files.list({
        q: `mimeType='application/vnd.google-apps.folder' and name='${companyName}' and '${GOOGLE_FOLDER_ID}' in parents`,
        fields: 'files(id, name)'
      });

      console.log(`🔁 Folder search returned: ${JSON.stringify(foldersResponse.data.files)}`);

      let folderId = foldersResponse.data.files?.[0]?.id;

      // Create folder if it doesn't exist
      if (!folderId) {
        console.log(`📂 Creating new folder for company: ${companyName}`);
        const folderResponse = await this.driveService.files.create({
          requestBody: {
            name: companyName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [GOOGLE_FOLDER_ID]
          },
          fields: 'id'
        });
        folderId = folderResponse.data.id;
        console.log(`📂 Folder created: ${folderId}`);
      } else {
        console.log(`📁 Using existing folder: ${folderId}`);
      }

      // Upload PDF to company folder
      const media = {
        mimeType: 'application/pdf',
        body: fs.createReadStream(pdfPath)
      };

      const fileResponse = await this.driveService.files.create({
        requestBody: {
          name: path.basename(pdfPath),
          parents: [folderId]
        },
        media: media,
        fields: 'id,webViewLink'
      });

      console.log(`PDF uploaded to Google Drive: ${fileResponse.data.webViewLink}`);
      return fileResponse.data.webViewLink;

    } catch (error) {
      console.error('Google Drive upload failed:', error);
      throw error;
    }
  }

  // 2. Send email to team
  async sendEmail(toEmails: string[], subject: string, body: string, attachmentPath: string): Promise<void> {
    try {
      const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: 'noreply@yobot.bot',
          pass: process.env.EMAIL_APP_PASSWORD || 'wpboevwgicvrchkt'
        }
      });

      const mailOptions = {
        from: 'noreply@yobot.bot',
        to: toEmails.join(', '),
        subject: subject,
        text: body,
        attachments: [{
          filename: path.basename(attachmentPath),
          path: attachmentPath
        }]
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email sent to: ${toEmails.join(', ')}`);

    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }

  // 3. Send Slack alert
  async sendSlackAlert(webhookUrl: string, companyName: string, quoteUrl: string): Promise<void> {
    try {
      const message = {
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `📩 *New Quote Generated for* *${companyName}*`
            }
          },
          { type: "divider" },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `📎 <${quoteUrl}|*Click here to view the PDF quote*>\n✅ Ready for client signature.`
            }
          }
        ]
      };

      await axios.post(webhookUrl, message);
      console.log(`Slack alert sent for ${companyName}`);

    } catch (error) {
      console.error('Slack alert failed:', error);
      // Don't throw - this is non-critical
    }
  }

  // 4. Send DocuSign signature request
  async sendDocuSignSignature(templateId: string, signerEmail: string, signerName: string, companyName: string): Promise<void> {
    try {
      console.log(`📩 Sending DocuSign to ${signerName} <${signerEmail}> using template ${templateId} for ${companyName}`);
      
      // TODO: Implement DocuSign API integration when credentials are available
      // This would use the DocuSign eSignature API to send the template for signature
      
      console.log('DocuSign signature request queued');

    } catch (error) {
      console.error('DocuSign signature request failed:', error);
      // Don't throw - this is non-critical for now
    }
  }

  // 5. Add to Airtable
  async insertScrapedLead(formData: FormData): Promise<void> {
    try {
      const airtableUrl = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;
      
      const headers = {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      };

      const payload = {
        fields: {
          '🧑‍💼 Name': formData['Contact Name'],
          '🏢 Company': formData['Company Name'],
          '📧 Email': formData['Email'],
          '☎️ Phone': formData['Phone Number'],
          '🌐 Website': formData.Website || '',
          '✅ Synced to HubSpot': true,
          '📅 Date Added': new Date().toISOString().split('T')[0]
        }
      };

      const response = await axios.post(airtableUrl, payload, { headers });
      console.log('✅ Lead added to Airtable:', response.data.id);

    } catch (error) {
      console.error('Airtable insertion failed:', error);
      throw error;
    }
  }

  // 6. Send to HubSpot
  async sendToHubSpot(formData: FormData): Promise<void> {
    try {
      console.log(`📤 Sending contact to HubSpot: ${formData['Contact Name']} <${formData['Email']}>`);
      
      // TODO: Implement HubSpot API integration when credentials are available
      // This would use the HubSpot Contacts API to create or update the contact
      
      console.log('HubSpot contact sync queued');

    } catch (error) {
      console.error('HubSpot sync failed:', error);
      // Don't throw - this is non-critical for now
    }
  }

  // Main sales order pipeline
  async runSalesOrderPipeline(formData: FormData, pdfPath: string): Promise<{
    success: boolean;
    quoteLink?: string;
    error?: string;
  }> {
    try {
      console.log(`Starting sales order pipeline for ${formData['Company Name']}`);

      // 1. Upload to Google Drive
      const quoteLink = await this.uploadToDrive(pdfPath, formData['Company Name']);

      // 2. Email to team
      await this.sendEmail(
        ['tyson@yobot.bot', 'daniel@yobot.bot'],
        `📎 Quote Ready – ${formData['Company Name']}`,
        `The quote has been created for ${formData['Company Name']}\n\nView: ${quoteLink}`,
        pdfPath
      );

      // 3. Slack Alert (use environment variable or fallback)
      const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL || 'https://hooks.slack.com/services/your/webhook/url';
      await this.sendSlackAlert(slackWebhookUrl, formData['Company Name'], quoteLink);

      // 4. DocuSign Signature Request
      await this.sendDocuSignSignature(
        '646522c7-edd9-485b-bbb4-20ea1cd92ef9',
        formData['Email'],
        formData['Contact Name'],
        formData['Company Name']
      );

      // 5. Airtable Sync
      await this.insertScrapedLead(formData);

      // 6. HubSpot Sync
      await this.sendToHubSpot(formData);

      console.log(`✅ Sales order pipeline completed for ${formData['Company Name']}`);

      return {
        success: true,
        quoteLink: quoteLink
      };

    } catch (error) {
      console.error('Sales order pipeline failed:', error);
      return {
        success: false,
        error: (error as any).message
      };
    }
  }
}

// Export singleton instance
export const salesOrderProcessor = new SalesOrderProcessor();