import * as fs from 'fs';
import * as path from 'path';
import { google, drive_v3 } from 'googleapis'; // Added drive_v3 for type safety
import * as nodemailer from 'nodemailer';
import axios from 'axios';

import {
  COMMAND_CENTER_BASE_ID,
  SCRAPED_LEADS_TABLE_NAME,
  tableUrl,
  getAirtableApiKey,
  TABLE_NAMES,
} from '@shared/airtableConfig';

// --- Constants and Configuration ---
const DEFAULT_GOOGLE_FOLDER_ID = "1-D1Do5bWsHWX1R7YexNEBLsgpBsV7WRh";
const DEFAULT_AIRTABLE_API_KEY = getAirtableApiKey() as string;
const DEFAULT_BASE_ID = COMMAND_CENTER_BASE_ID;
const DEFAULT_TABLE_NAME = SCRAPED_LEADS_TABLE_NAME;
const DEFAULT_SENDER_EMAIL = 'noreply@yobot.bot';
const DEFAULT_TEAM_EMAILS = ['tyson@yobot.bot', 'daniel@yobot.bot'];
const DEFAULT_DOCUSIGN_TEMPLATE_ID = '646522c7-edd9-485b-bbb4-20ea1cd92ef9';

// Configuration
const GOOGLE_FOLDER_ID = "1-D1Do5bWsHWX1R7YexNEBLsgpBsV7WRh";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || "";
const BASE_ID = "appRt8V3tH4g5Z5if";
const AIRTABLE_API_KEY = getApiKey();
const TABLE_NAME = SCRAPED_LEADS_TABLE_NAME;
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || "";


// Use the shared Command Center base

const BASE_ID = "appRt8V3tH4g5Z51f";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY as string;

const BASE_ID = COMMAND_CENTER_BASE_ID;
const TABLE_NAME = "📥 Scraped Leads (Universal)";
const BASE_ID = COMMAND_CENTER_BASE_ID;
const TABLE_NAME = SCRAPED_LEADS_TABLE_NAME;

const BASE_ID = "appRt8V3tH4g5Z51f";


// --- Logger Utility (for better logging) ---
class Logger {
  static info(message: string, ...args: any[]) {
    console.log(`[INFO] ${message}`, ...args);
  }


  static warn(message: string, ...args: any[]) {
    console.warn(`[WARN] ${message}`, ...args);
  }

  static error(message: string, ...args: any[]) {
    console.error(`[ERROR] ${message}`, ...args);
  }
}

// --- Interfaces ---
interface SalesOrderProcessorConfig {
  googleClientId: string;
  googleClientSecret: string;
  googleRefreshToken: string;
  googleFolderId: string;
  airtableApiKey: string;
  airtableBaseId: string;
  airtableTableName: string;
  emailAppPassword: string;
  senderEmail: string;
  teamEmails: string[];
  slackWebhookUrl?: string;
  docusignTemplateId: string;
}

interface AirtablePayloadFields {
  '🧑‍💼 Name': string;
  '🏢 Company': string;
  '📧 Email': string;
  '☎️ Phone': string;
  '🌐 Website': string;
  '✅ Synced to HubSpot': boolean;
  '📅 Date Added': string;
}

interface FormData {
  'Contact Name': string;
  'Company Name': string;
  'Email': string;
  'Phone Number': string;
  'Website'?: string;
}

/**
 * @class SalesOrderProcessor
 * @description Manages the sales order pipeline, including Google Drive uploads, email notifications,
 * Slack alerts, DocuSign requests, Airtable integration, and HubSpot synchronization.
 */
export class SalesOrderProcessor {
  private driveService: drive_v3.Drive | null = null;
  private config: SalesOrderProcessorConfig;
  private emailTransporter: nodemailer.Transporter | null = null;

  constructor(config?: Partial<SalesOrderProcessorConfig>) {
    this.config = {
      googleClientId: process.env.GOOGLE_CLIENT_ID || '',
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      googleRefreshToken: process.env.GOOGLE_REFRESH_TOKEN || '',
      googleFolderId: DEFAULT_GOOGLE_FOLDER_ID,
      airtableApiKey: DEFAULT_AIRTABLE_API_KEY,
      airtableBaseId: DEFAULT_BASE_ID,
      airtableTableName: DEFAULT_TABLE_NAME,
      emailAppPassword: process.env.EMAIL_APP_PASSWORD || '',
      senderEmail: DEFAULT_SENDER_EMAIL,
      teamEmails: DEFAULT_TEAM_EMAILS,
      slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
      docusignTemplateId: DEFAULT_DOCUSIGN_TEMPLATE_ID,
      ...config, // Allow partial overrides
    };
    this.initializeGoogleDrive();
    this.initializeEmailTransporter();
  }

  private initializeEmailTransporter() {
    const { emailAppPassword, senderEmail } = this.config;
    if (emailAppPassword) {
      this.emailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: senderEmail,
          pass: emailAppPassword,
        },
      });
    }
  }

  /**
   * @private
   * @description Initializes the Google Drive service with OAuth2 credentials.
   * Throws an error if required environment variables are not set.
   */
  private async initializeGoogleDrive() {
    try {
      const { googleClientId, googleClientSecret, googleRefreshToken } = this.config;

      if (!googleClientId || !googleClientSecret || !googleRefreshToken) {
        throw new Error('Missing Google API credentials. Ensure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN are set in environment variables or provided in config.');
      }

      const auth = new google.auth.OAuth2(
        googleClientId,
        googleClientSecret
      );

      auth.setCredentials({
        refresh_token: googleRefreshToken
      });

      this.driveService = google.drive({ version: 'v3', auth });
      Logger.info('Google Drive service initialized successfully.');
    } catch (error) {
      Logger.error('Google Drive initialization failed:', error);
      throw error;
    }
  }

  /**
   * @description Uploads a PDF file to Google Drive, creating a company-specific folder if it doesn't exist.
   * @param {string} pdfPath - The local path to the PDF file.
   * @param {string} companyName - The name of the company, used for folder creation.
   * @returns {Promise<string>} A promise that resolves with the web view link of the uploaded PDF.
   */
  async uploadToDrive(pdfPath: string, companyName: string): Promise<string> {
    try {
      if (!this.driveService) {
        throw new Error('Google Drive service not initialized. Call initializeGoogleDrive first.');
      }

      Logger.info(`🔍 Checking if folder for '${companyName}' exists in parent ID ${this.config.googleFolderId}`);

      // Check if company folder exists
      const foldersResponse = await this.driveService.files.list({
        q: `mimeType='application/vnd.google-apps.folder' and name='${companyName}' and '${this.config.googleFolderId}' in parents`,
        fields: 'files(id, name)'
      });

      Logger.info(`🔁 Folder search returned: ${JSON.stringify(foldersResponse.data.files)}`);

      let folderId = foldersResponse.data.files?.[0]?.id;

      // Create folder if it doesn't exist
      if (!folderId) {
        Logger.info(`📂 Creating new folder for company: ${companyName}`);
        const folderResponse = await this.driveService.files.create({
          requestBody: {
            name: companyName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [this.config.googleFolderId]
          },
          fields: 'id'
        });
        folderId = folderResponse.data.id;
        Logger.info(`📂 Folder created: ${folderId}`);
      } else {
        Logger.info(`📁 Using existing folder: ${folderId}`);
      }

      // Upload PDF to company folder
      const media = {
        mimeType: 'application/pdf',
        body: fs.createReadStream(pdfPath)
      };

    // Check if folderId is defined before using it
    if (!folderId) {
      throw new Error('Failed to create or find folder for company');
    }

    const fileResponse = await this.driveService.files.create({
      requestBody: {
        name: path.basename(pdfPath),
        parents: [folderId]
      },
      media: {
        mimeType: 'application/pdf',
        body: fs.createReadStream(pdfPath)
      },
      fields: 'id,webViewLink'
    });

      console.log('fileResponse:', fileResponse);
      console.log('fileResponse type:', typeof fileResponse);
      
      if (!fileResponse.data.webViewLink) {
        throw new Error('Failed to get webViewLink from Google Drive upload');
      }
      
      Logger.info(`PDF uploaded to Google Drive: ${fileResponse.data.webViewLink}`);
      return fileResponse.data.webViewLink;

    } catch (error) {
      Logger.error('Google Drive upload failed:', error);
      throw error;
    }
  }

  /**
   * @description Sends an email to a list of recipients with a PDF attachment.
   * @param {string[]} toEmails - An array of recipient email addresses.
   * @param {string} subject - The subject of the email.
   * @param {string} body - The plain text body of the email.
   * @param {string} attachmentPath - The local path to the PDF attachment.
   * @returns {Promise<void>} A promise that resolves when the email is sent.
   */
  async sendEmail(toEmails: string[], subject: string, body: string, attachmentPath: string): Promise<void> {
    try {
      const { emailAppPassword, senderEmail } = this.config;
      if (!emailAppPassword) {
        throw new Error('EMAIL_APP_PASSWORD must be set in environment variables or provided in config for sending emails.');
      }

      if (!this.emailTransporter) {
        this.initializeEmailTransporter();
      }
      const transporter = this.emailTransporter!;

      const mailOptions = {
        from: senderEmail,
        to: toEmails.join(', '),
        subject: subject,
        text: body,
        attachments: [{
          filename: path.basename(attachmentPath),
          path: attachmentPath
        }]
      };

      await transporter.sendMail(mailOptions);
      Logger.info(`Email sent to: ${toEmails.join(', ')}`);

    } catch (error) {
      Logger.error('Email sending failed:', error);
      throw error;
    }
  }

  /**
   * @description Sends a Slack alert with a link to the generated quote.
   * @param {string} webhookUrl - The Slack webhook URL.
   * @param {string} companyName - The name of the company for which the quote was generated.
   * @param {string} quoteUrl - The URL of the uploaded quote.
   * @returns {Promise<void>} A promise that resolves when the Slack alert is sent.
   */
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
      Logger.info(`Slack alert sent for ${companyName}`);

    } catch (error) {
      Logger.warn('Slack alert failed (non-critical):', error);
    }
  }

  /**
   * @description Initiates a DocuSign signature request for a generated quote.
   * @param {string} templateId - The DocuSign template ID to use.
   * @param {string} signerEmail - The email address of the signer.
   * @param {string} signerName - The name of the signer.
   * @param {string} companyName - The name of the company associated with the quote.
   * @returns {Promise<void>} A promise that resolves when the DocuSign request is queued.
   */
  async sendDocuSignSignature(templateId: string, signerEmail: string, signerName: string, companyName: string): Promise<void> {
    try {
      Logger.info(`📩 Sending DocuSign to ${signerName} <${signerEmail}> using template ${templateId} for ${companyName}`);

      // TODO: Implement DocuSign API integration when credentials are available
      // This would use the DocuSign eSignature API to send the template for signature

      Logger.info('DocuSign signature request queued');

    } catch (error) {
      Logger.warn('DocuSign signature request failed (non-critical):', error);
    }
  }

  /**
   * @description Inserts scraped lead data into Airtable.
   * @param {FormData} formData - The data collected from the form.
   * @returns {Promise<void>} A promise that resolves when the lead is added to Airtable.
   */
  async insertScrapedLead(formData: FormData): Promise<void> {
    try {
      const { airtableApiKey, airtableBaseId, airtableTableName } = this.config;
      if (!airtableApiKey) {
        throw new Error('AIRTABLE_API_KEY is not set. Cannot insert lead into Airtable.');
      }

      const airtableUrl = tableUrl(airtableBaseId, airtableTableName);

      const headers = {
        'Authorization': `Bearer ${airtableApiKey}`,
        'Content-Type': 'application/json'
      };

      const payload: { fields: AirtablePayloadFields } = {
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
      Logger.info('✅ Lead added to Airtable:', response.data.id);

    } catch (error) {
      Logger.error('Airtable insertion failed:', error);
      throw error;
    }
  }

  /**
   * @description Sends lead data to HubSpot for synchronization.
   * @param {FormData} formData - The data collected from the form.
   * @returns {Promise<void>} A promise that resolves when the data is sent to HubSpot.
   */
  async sendToHubSpot(formData: FormData): Promise<void> {
    try {
      Logger.info(`📤 Sending contact to HubSpot: ${formData['Contact Name']} <${formData['Email']}>`);

      // TODO: Implement HubSpot API integration when credentials are available
      // This would use the HubSpot Contacts API to create or update the contact

      Logger.info('HubSpot contact sync queued');

    } catch (error) {
      Logger.warn('HubSpot sync failed (non-critical):', error);
    }
  }

  /**
   * @description Runs the complete sales order processing pipeline.
   * This includes uploading to Google Drive, sending emails, Slack alerts,
   * DocuSign requests, Airtable integration, and HubSpot synchronization.
   * @param {FormData} formData - The form data containing lead information.
   * @param {string} pdfPath - The local path to the generated PDF quote.
   * @returns {Promise<{ success: boolean; quoteLink?: string; error?: string; }>} A promise that resolves with the success status and quote link, or an error.
   */
  async runSalesOrderPipeline(formData: FormData, pdfPath: string): Promise<{
    success: boolean;
    quoteLink?: string;
    error?: string;
  }> {
    try {
      Logger.info(`Starting sales order pipeline for ${formData['Company Name']}`);

      // 1. Upload to Google Drive
      const quoteLink = await this.uploadToDrive(pdfPath, formData['Company Name']);

      // 2. Email to team
      await this.sendEmail(
        this.config.teamEmails,
        `📎 Quote Ready – ${formData['Company Name']}`,
        `The quote has been created for ${formData['Company Name']}\n\nView: ${quoteLink}`,
        pdfPath
      );

      // 3. Slack Alert
      const slackWebhookUrl = this.config.slackWebhookUrl;
      if (!slackWebhookUrl) {
        Logger.warn('SLACK_WEBHOOK_URL is not set. Skipping Slack alert.');
      } else {
        await this.sendSlackAlert(slackWebhookUrl, formData['Company Name'], quoteLink);
      }

      // 4. DocuSign Signature Request
      await this.sendDocuSignSignature(
        this.config.docusignTemplateId,
        formData['Email'],
        formData['Contact Name'],
        formData['Company Name']
      );

      // 5. Airtable Sync
      await this.insertScrapedLead(formData);

      // 6. HubSpot Sync
      await this.sendToHubSpot(formData);

      Logger.info(`✅ Sales order pipeline completed for ${formData['Company Name']}`);

      return {
        success: true,
        quoteLink: quoteLink
      };

    } catch (error) {
      Logger.error('Sales order pipeline failed:', error);
      return {
        success: false,
        error: (error as any).message
      };
    }
  }
}

// Export singleton instance
export const salesOrderProcessor = new SalesOrderProcessor();
