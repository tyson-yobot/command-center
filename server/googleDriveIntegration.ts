import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import * as nodemailer from 'nodemailer';


interface GoogleDriveConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  parentFolderId: string;
}

interface EmailConfig {
  from: string;
  password: string;
}

interface SlackConfig {
  webhookUrl: string;
}

export class GoogleDriveIntegration {
  private driveService: any;
  private emailTransporter: any;
  
  constructor() {
    this.initializeServices();
  }

  private async initializeServices() {
    // Initialize Google Drive
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    this.driveService = google.drive({ version: 'v3', auth: oauth2Client });

    // Initialize email transporter
    this.emailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'noreply@yobot.bot',
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
  }

  async uploadToGoogleDrive(pdfPath: string, companyName: string): Promise<string> {
    try {
      const parentId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID || '1BQf9vZ8KZy4X5Nw2M3P4Q5R6S7T8U9V0';
      
      // Find or create company folder
      const foldersResponse = await this.driveService.files.list({
        q: `mimeType='application/vnd.google-apps.folder' and name='${companyName}' and '${parentId}' in parents`,
        fields: 'files(id, name)'
      });

      let folderId = foldersResponse.data.files?.[0]?.id;

      if (!folderId) {
        // Create company folder
        const folderResponse = await this.driveService.files.create({
          requestBody: {
            name: companyName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentId]
          },
          fields: 'id'
        });
        folderId = folderResponse.data.id;
      }

      // Upload PDF file
      const fileResponse = await this.driveService.files.create({
        requestBody: {
          name: path.basename(pdfPath),
          parents: [folderId]
        },
        media: {
          mimeType: 'application/pdf',
          body: fs.createReadStream(pdfPath)
        },
        fields: 'id, webViewLink'
      });

      return fileResponse.data.webViewLink;
    } catch (error) {
      console.error('Google Drive upload error:', error);
      throw new Error(`Failed to upload to Google Drive: ${error.message}`);
    }
  }

  async sendQuoteEmail(
    recipientEmails: string[], 
    companyName: string, 
    quoteLink: string, 
    attachmentPath: string
  ): Promise<void> {
    try {
      const mailOptions = {
        from: 'noreply@yobot.bot',
        to: recipientEmails.join(', '),
        subject: `📎 Quote Ready – ${companyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">New Quote Generated</h2>
            <p>A new quote has been created for <strong>${companyName}</strong>.</p>
            <p>
              <a href="${quoteLink}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Quote in Google Drive
              </a>
            </p>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              This quote is ready for review and signature.
            </p>
          </div>
        `,
        attachments: [
          {
            filename: path.basename(attachmentPath),
            path: attachmentPath
          }
        ]
      };

      await this.emailTransporter.sendMail(mailOptions);
      console.log(`✅ Quote email sent to: ${recipientEmails.join(', ')}`);
    } catch (error) {
      console.error('Email sending error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendSlackAlert(companyName: string, quoteUrl: string): Promise<void> {
    try {
      const webhookUrl = process.env.SLACK_WEBHOOK_URL;
      if (!webhookUrl) {
        console.log('Slack webhook URL not configured, skipping notification');
        return;
      }

      const message = {
        text: `📩 New Quote Generated for *${companyName}*\n📎 [View Quote](${quoteUrl})\n✅ Ready for signature.`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `📩 *New Quote Generated*\n\nCompany: *${companyName}*\nStatus: Ready for signature`
            }
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'View Quote'
                },
                url: quoteUrl,
                style: 'primary'
              }
            ]
          }
        ]
      };

      const response = await global.fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.status}`);
      }

      console.log(`✅ Slack alert sent for ${companyName}`);
    } catch (error) {
      console.error('Slack alert error:', error);
      throw new Error(`Failed to send Slack alert: ${error.message}`);
    }
  }

  async processQuoteWorkflow(
    pdfPath: string, 
    companyName: string, 
    contactEmail: string,
    internalEmails: string[] = ['tyson@yobot.bot', 'daniel@yobot.bot']
  ): Promise<{ driveLink: string; success: boolean }> {
    try {
      console.log(`🚀 Starting quote workflow for ${companyName}`);

      // 1. Upload to Google Drive
      const driveLink = await this.uploadToGoogleDrive(pdfPath, companyName);
      console.log(`✅ Uploaded to Google Drive: ${driveLink}`);

      // 2. Send internal notification email
      await this.sendQuoteEmail(internalEmails, companyName, driveLink, pdfPath);

      // 3. Send Slack alert
      await this.sendSlackAlert(companyName, driveLink);

      // 4. Optional: Send to client (you can enable this later)
      // await this.sendQuoteEmail([contactEmail], companyName, driveLink, pdfPath);

      console.log(`✅ Quote workflow completed for ${companyName}`);

      return {
        driveLink,
        success: true
      };
    } catch (error) {
      console.error(`❌ Quote workflow failed for ${companyName}:`, error);
      return {
        driveLink: '',
        success: false
      };
    }
  }
}

export const googleDriveIntegration = new GoogleDriveIntegration();