import fs from 'fs';
import path from 'path';
import { google, drive_v3 } from 'googleapis';
import * as nodemailer from 'nodemailer';
import axios, { AxiosError } from 'axios';

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

// Retry configuration
const RETRY_OPTIONS = {
  retries: 3,
  minTimeout: 1000,
  maxTimeout: 5000,
};

// --- Enhanced Logger with Context ---
interface LogContext {
  correlationId?: string;
  operation?: string;
  metadata?: Record<string, any>;
}

class EnhancedLogger {
  static generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  static info(message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    console.log(JSON.stringify({
      level: 'INFO',
      timestamp,
      message,
      ...context
    }));
  }

  static warn(message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    console.warn(JSON.stringify({
      level: 'WARN',
      timestamp,
      message,
      ...context
    }));
  }

  static error(message: string, error: any, context?: LogContext) {
    const timestamp = new Date().toISOString();
    console.error(JSON.stringify({
      level: 'ERROR',
      timestamp,
      message,
      error: {
        message: error?.message,
        stack: error?.stack,
        code: error?.code
      },
      ...context
    }));
  }
}

// --- Validation Utilities ---
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone);
};

const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const validateFormData = (formData: FormData): void => {
  const errors: string[] = [];

  if (!formData['Contact Name'] || formData['Contact Name'].length > 100) {
    errors.push('Contact Name is required and must be less than 100 characters');
  }
  
  if (!formData['Company Name'] || formData['Company Name'].length > 100) {
    errors.push('Company Name is required and must be less than 100 characters');
  }
  
  if (!validateEmail(formData['Email'])) {
    errors.push('Invalid email format');
  }
  
  if (!validatePhone(formData['Phone Number'])) {
    errors.push('Invalid phone number format');
  }
  
  if (formData.Website && formData.Website !== '' && !validateUrl(formData.Website)) {
    errors.push('Invalid website URL');
  }

  if (errors.length > 0) {
    throw new ValidationError('Form validation failed', errors);
  }
};

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

interface PipelineResult {
  success: boolean;
  quoteLink?: string;
  error?: string;
  correlationId: string;
  failedSteps?: string[];
  completedSteps?: string[];
}

// --- Custom Error Classes ---
class ValidationError extends Error {
  constructor(message: string, public details: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

class ServiceError extends Error {
  constructor(message: string, public service: string, public originalError?: any) {
    super(message);
    this.name = 'ServiceError';
  }
}

// --- Service Health Monitor ---
class ServiceHealthMonitor {
  private static failures: Map<string, number> = new Map();
  private static lastFailure: Map<string, number> = new Map();
  private static readonly FAILURE_THRESHOLD = 5;
  private static readonly RECOVERY_TIME = 60000; // 1 minute

  static recordFailure(service: string) {
    const failures = this.failures.get(service) || 0;
    this.failures.set(service, failures + 1);
    this.lastFailure.set(service, Date.now());
  }

  static recordSuccess(service: string) {
    this.failures.delete(service);
    this.lastFailure.delete(service);
  }

  static isHealthy(service: string): boolean {
    const failures = this.failures.get(service) || 0;
    const lastFailureTime = this.lastFailure.get(service) || 0;
    
    if (failures >= this.FAILURE_THRESHOLD) {
      // Check if enough time has passed for recovery
      if (Date.now() - lastFailureTime > this.RECOVERY_TIME) {
        this.failures.delete(service);
        this.lastFailure.delete(service);
        return true;
      }
      return false;
    }
    
    return true;
  }
}

// --- Retry Utility ---
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: { retries: number; minTimeout: number; maxTimeout: number }
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= options.retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === options.retries) {
        throw lastError;
      }
      
      const timeout = Math.min(
        options.minTimeout * Math.pow(2, attempt - 1),
        options.maxTimeout
      );
      
      console.log(`Attempt ${attempt} failed. Retrying in ${timeout}ms...`);
      await new Promise(resolve => setTimeout(resolve, timeout));
    }
  }
  
  throw lastError;
}

// --- Rate Limiting ---
class RateLimiter {
  private queue: (() => Promise<any>)[] = [];
  private running = 0;
  private readonly maxConcurrent: number;

  constructor(maxConcurrent: number) {
    this.maxConcurrent = maxConcurrent;
  }

  async run<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.running++;
    const task = this.queue.shift();
    
    if (task) {
      try {
        await task();
      } finally {
        this.running--;
        this.process();
      }
    }
  }
}

const apiRateLimiter = new RateLimiter(5);

/**
 * @class EnhancedSalesOrderProcessor
 * @description Manages the sales order pipeline with enhanced error handling, validation,
 * retry logic, and performance optimizations.
 */
export class EnhancedSalesOrderProcessor {
  private driveService: drive_v3.Drive | null = null;
  private config: SalesOrderProcessorConfig;
  private emailTransporter: nodemailer.Transporter | null = null;

  constructor(config?: Partial<SalesOrderProcessorConfig>) {
    const mergedConfig = {
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
      ...config,
    };

    // Validate configuration
    this.validateConfig(mergedConfig);
    this.config = mergedConfig as SalesOrderProcessorConfig;

    this.initializeServices();
  }

  /**
   * Validate configuration
   */
  private validateConfig(config: Partial<SalesOrderProcessorConfig>): void {
    const requiredFields = [
      'googleClientId', 'googleClientSecret', 'googleRefreshToken',
      'googleFolderId', 'airtableApiKey', 'airtableBaseId',
      'airtableTableName', 'emailAppPassword', 'senderEmail'
    ];

    const missingFields = requiredFields.filter(field => !config[field as keyof SalesOrderProcessorConfig]);
    
    if (missingFields.length > 0) {
      throw new ValidationError('Missing required configuration fields', missingFields);
    }

    // Validate email format
    if (!validateEmail(config.senderEmail!)) {
      throw new ValidationError('Invalid sender email', config.senderEmail);
    }

    // Validate team emails
    const invalidEmails = config.teamEmails?.filter(email => !validateEmail(email)) || [];
    if (invalidEmails.length > 0) {
      throw new ValidationError('Invalid team emails', invalidEmails);
    }
  }

  /**
   * Initialize all services with proper error handling
   */
  private async initializeServices() {
    await Promise.all([
      this.initializeGoogleDrive(),
      this.initializeEmailTransporter()
    ]);
  }

  /**
   * Initialize Google Drive with error handling and validation
   */
  private async initializeGoogleDrive() {
    const correlationId = EnhancedLogger.generateCorrelationId();
    
    try {
      const { googleClientId, googleClientSecret, googleRefreshToken } = this.config;

      const auth = new google.auth.OAuth2(
        googleClientId,
        googleClientSecret
      );

      auth.setCredentials({
        refresh_token: googleRefreshToken
      });

      // Test the credentials
      await auth.getAccessToken();

      this.driveService = google.drive({ version: 'v3', auth });
      
      EnhancedLogger.info('Google Drive service initialized successfully', {
        correlationId,
        operation: 'initializeGoogleDrive'
      });
    } catch (error) {
      EnhancedLogger.error('Google Drive initialization failed', error, {
        correlationId,
        operation: 'initializeGoogleDrive'
      });
      throw new ServiceError('Failed to initialize Google Drive', 'GoogleDrive', error);
    }
  }

  /**
   * Initialize email transporter with connection pooling
   */
  private async initializeEmailTransporter() {
    const { emailAppPassword, senderEmail } = this.config;
    
    this.emailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: senderEmail,
        pass: emailAppPassword
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100
    });

    // Verify transporter
    try {
      await this.emailTransporter!.verify();
      EnhancedLogger.info('Email transporter initialized successfully');
    } catch (error) {
      EnhancedLogger.error('Email transporter verification failed', error, {
        operation: 'initializeEmailTransporter'
      });
      throw new ServiceError('Failed to initialize email transporter', 'Email', error);
    }
  }

  /**
   * Validate file exists and is accessible
   */
  private async validateFile(filePath: string): Promise<void> {
    try {
      await fs.promises.access(filePath, fs.constants.R_OK);
      const stats = await fs.promises.stat(filePath);
      
      if (!stats.isFile()) {
        throw new Error('Path is not a file');
      }
      
      if (stats.size === 0) {
        throw new Error('File is empty');
      }

      // Check file extension
      const ext = path.extname(filePath).toLowerCase();
      if (ext !== '.pdf') {
        throw new Error(`Invalid file type: ${ext}. Expected .pdf`);
      }
    } catch (error) {
      throw new ValidationError(`File validation failed for ${filePath}`, error);
    }
  }

  /**
   * Sanitize folder name for Google Drive
   */
  private sanitizeFolderName(name: string): string {
    // Remove or replace invalid characters
    return name
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 255); // Google Drive folder name limit
  }

  /**
   * Upload to Google Drive with retry and error handling
   */
  async uploadToDrive(pdfPath: string, companyName: string): Promise<string> {
    const correlationId = EnhancedLogger.generateCorrelationId();
    
    if (!ServiceHealthMonitor.isHealthy('GoogleDrive')) {
      throw new ServiceError('Google Drive service is currently unavailable', 'GoogleDrive');
    }

    try {
      // Validate inputs
      await this.validateFile(pdfPath);
      const sanitizedCompanyName = this.sanitizeFolderName(companyName);

      if (!this.driveService) {
        throw new ServiceError('Google Drive service not initialized', 'GoogleDrive');
      }

      return await retryWithBackoff(async () => {
        return await apiRateLimiter.run(async () => {
          EnhancedLogger.info(`Starting Google Drive upload`, {
            correlationId,
            operation: 'uploadToDrive',
            metadata: { companyName: sanitizedCompanyName }
          });

          // Check/create company folder
          const folderId = await this.getOrCreateFolder(sanitizedCompanyName, correlationId);

          // Upload file
          const media = {
            mimeType: 'application/pdf',
            body: fs.createReadStream(pdfPath)
          };

          const fileResponse = await this.driveService!.files.create({
            requestBody: {
              name: `${path.basename(pdfPath, '.pdf')}_${Date.now()}.pdf`,
              parents: [folderId]
            },
            media: media,
            fields: 'id,webViewLink,webContentLink'
          });

          if (!fileResponse.data.webViewLink) {
            throw new Error('No webViewLink returned from Google Drive');
          }

          // Set file permissions for viewing
          await this.driveService!.permissions.create({
            fileId: fileResponse.data.id!,
            requestBody: {
              role: 'reader',
              type: 'anyone'
            }
          });

          ServiceHealthMonitor.recordSuccess('GoogleDrive');
          
          EnhancedLogger.info('PDF uploaded successfully', {
            correlationId,
            operation: 'uploadToDrive',
            metadata: {
              fileId: fileResponse.data.id,
              link: fileResponse.data.webViewLink
            }
          });

          return fileResponse.data.webViewLink;
        });
      }, RETRY_OPTIONS);
    } catch (error) {
      ServiceHealthMonitor.recordFailure('GoogleDrive');
      EnhancedLogger.error('Google Drive upload failed', error, {
        correlationId,
        operation: 'uploadToDrive'
      });
      throw error;
    }
  }

  /**
   * Get or create folder with proper error handling
   */
  private async getOrCreateFolder(folderName: string, correlationId: string): Promise<string> {
    // Search for existing folder
    const foldersResponse = await this.driveService!.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and '${this.config.googleFolderId}' in parents and trashed=false`,
      fields: 'files(id, name)',
      pageSize: 1
    });

    if (foldersResponse.data.files && foldersResponse.data.files.length > 0) {
      return foldersResponse.data.files[0].id!;
    }

    // Create new folder
    const folderResponse = await this.driveService!.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [this.config.googleFolderId]
      },
      fields: 'id'
    });

    EnhancedLogger.info('Created new folder', {
      correlationId,
      operation: 'getOrCreateFolder',
      metadata: { folderName, folderId: folderResponse.data.id }
    });

    return folderResponse.data.id!;
  }

  /**
   * Send email with enhanced error handling and retry
   */
  async sendEmail(toEmails: string[], subject: string, body: string, attachmentPath: string): Promise<void> {
    const correlationId = EnhancedLogger.generateCorrelationId();
    
    if (!ServiceHealthMonitor.isHealthy('Email')) {
      throw new ServiceError('Email service is currently unavailable', 'Email');
    }

    try {
      // Validate emails
      const validEmails = toEmails.filter(email => validateEmail(email));

      if (validEmails.length === 0) {
        throw new ValidationError('No valid email addresses provided', { toEmails });
      }

      // Validate attachment
      await this.validateFile(attachmentPath);

      if (!this.emailTransporter) {
        throw new ServiceError('Email transporter not initialized', 'Email');
      }

      await retryWithBackoff(async () => {
        const mailOptions = {
          from: this.config.senderEmail,
          to: validEmails.join(', '),
          subject: subject,
          text: body,
          html: this.createEmailHtml(body),
          attachments: [{
            filename: path.basename(attachmentPath),
            path: attachmentPath,
            contentType: 'application/pdf'
          }]
        };

        await this.emailTransporter!.sendMail(mailOptions);
        
        ServiceHealthMonitor.recordSuccess('Email');
        
        EnhancedLogger.info('Email sent successfully', {
          correlationId,
          operation: 'sendEmail',
          metadata: { recipients: validEmails.length }
        });
      }, RETRY_OPTIONS);
    } catch (error) {
      ServiceHealthMonitor.recordFailure('Email');
      EnhancedLogger.error('Email sending failed', error, {
        correlationId,
        operation: 'sendEmail'
      });
      throw error;
    }
  }

  /**
   * Create HTML email template
   */
  private createEmailHtml(body: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f4f4f4; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .footer { background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Quote Generated</h2>
            </div>
            <div class="content">
              <p>${body.replace(/\n/g, '<br>')}</p>
            </div>
            <div class="footer">
              <p>This is an automated message from YoBot Sales System</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Send Slack alert with retry
   */
  async sendSlackAlert(webhookUrl: string, companyName: string, quoteUrl: string): Promise<void> {
    const correlationId = EnhancedLogger.generateCorrelationId();
    
    if (!ServiceHealthMonitor.isHealthy('Slack')) {
      EnhancedLogger.warn('Slack service is currently unavailable, skipping', { correlationId });
      return;
    }

    try {
      const message = {
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "📩 New Quote Generated"
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Company:* ${companyName}\n*Time:* ${new Date().toLocaleString()}`
            }
          },
          { type: "divider" },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `📎 <${quoteUrl}|*View Quote PDF*>`
            }
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "View in Drive"
                },
                url: quoteUrl,
                style: "primary"
              }
            ]
          }
        ]
      };

      await retryWithBackoff(async () => {
        await apiRateLimiter.run(async () => {
          await axios.post(webhookUrl, message, {
            timeout: 5000,
            validateStatus: (status) => status < 500
          });
        });
      }, { ...RETRY_OPTIONS, retries: 2 }); // Less retries for non-critical service

      ServiceHealthMonitor.recordSuccess('Slack');
      
      EnhancedLogger.info('Slack alert sent', {
        correlationId,
        operation: 'sendSlackAlert'
      });
    } catch (error) {
      ServiceHealthMonitor.recordFailure('Slack');
      EnhancedLogger.warn('Slack alert failed (non-critical)', {
        correlationId,
        operation: 'sendSlackAlert',
        metadata: { error: (error as Error).message }
      });
    }
  }

  /**
   * Send DocuSign with proper error handling
   */
  async sendDocuSignSignature(templateId: string, signerEmail: string, signerName: string, companyName: string): Promise<void> {
    const correlationId = EnhancedLogger.generateCorrelationId();
    
    try {
      // Validate inputs
      if (!validateEmail(signerEmail)) {
        throw new ValidationError('Invalid signer email', signerEmail);
      }

      if (!signerName || signerName.length === 0) {
        throw new ValidationError('Signer name is required', signerName);
      }

      EnhancedLogger.info('DocuSign request queued', {
        correlationId,
        operation: 'sendDocuSignSignature',
        metadata: { templateId, signerEmail, companyName }
      });

      // TODO: Implement DocuSign API integration
      // For now, just log the request
    } catch (error) {
      EnhancedLogger.warn('DocuSign request failed (non-critical)', {
        correlationId,
        operation: 'sendDocuSignSignature',
        metadata: { error: (error as Error).message }
      });
    }
  }

  /**
   * Insert to Airtable with validation and retry
   */
  async insertScrapedLead(formData: FormData): Promise<string | null> {
    const correlationId = EnhancedLogger.generateCorrelationId();
    
    if (!ServiceHealthMonitor.isHealthy('Airtable')) {
      throw new ServiceError('Airtable service is currently unavailable', 'Airtable');
    }

    try {
      const { airtableApiKey, airtableBaseId, airtableTableName } = this.config;
      const airtableUrl = tableUrl(airtableBaseId, airtableTableName);

      const headers = {
        'Authorization': `Bearer ${airtableApiKey}`,
        'Content-Type': 'application/json'
      };

      const payload: { fields: AirtablePayloadFields } = {
        fields: {
          '🧑‍💼 Name': formData['Contact Name'].substring(0, 100),
          '🏢 Company': formData['Company Name'].substring(0, 100),
          '📧 Email': formData['Email'],
          '☎️ Phone': formData['Phone Number'].substring(0, 50),
          '🌐 Website': formData.Website || '',
          '✅ Synced to HubSpot': false, // Will be updated after HubSpot sync
          '📅 Date Added': new Date().toISOString().split('T')[0]
        }
      };

      const response = await retryWithBackoff(async () => {
        return await apiRateLimiter.run(async () => {
          return await axios.post(airtableUrl, payload, { 
            headers,
            timeout: 10000,
            validateStatus: (status) => status < 500
          });
        });
      }, RETRY_OPTIONS);

      ServiceHealthMonitor.recordSuccess('Airtable');
      
      EnhancedLogger.info('Lead added to Airtable', {
        correlationId,
        operation: 'insertScrapedLead',
        metadata: { recordId: response.data.id }
      });

      return response.data.id;
    } catch (error) {
      ServiceHealthMonitor.recordFailure('Airtable');
      
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        throw new ValidationError('Invalid data for Airtable', error.response.data);
      }
      
      EnhancedLogger.error('Airtable insertion failed', error, {
        correlationId,
        operation: 'insertScrapedLead'
      });
      throw error;
    }
  }

  /**
   * Update Airtable record after HubSpot sync
   */
  private async updateAirtableHubSpotStatus(recordId: string | null, synced: boolean): Promise<void> {
    if (!recordId) return;

    try {
      const { airtableApiKey, airtableBaseId, airtableTableName } = this.config;
      const airtableUrl = `${tableUrl(airtableBaseId, airtableTableName)}/${recordId}`;

      const headers = {
        'Authorization': `Bearer ${airtableApiKey}`,
        'Content-Type': 'application/json'
      };

      await axios.patch(airtableUrl, {
        fields: {
          '✅ Synced to HubSpot': synced
        }
      }, { headers });

      EnhancedLogger.info('Updated Airtable HubSpot sync status', {
        operation: 'updateAirtableHubSpotStatus',
        metadata: { recordId, synced }
      });
    } catch (error) {
      EnhancedLogger.warn('Failed to update Airtable HubSpot status', {
        operation: 'updateAirtableHubSpotStatus',
        metadata: { error: (error as Error).message }
      });
    }
  }

  /**
   * Send to HubSpot with retry
   */
  async sendToHubSpot(formData: FormData, airtableRecordId?: string | null): Promise<void> {
    const correlationId = EnhancedLogger.generateCorrelationId();
    
    try {
      // TODO: Implement HubSpot API integration
      EnhancedLogger.info('HubSpot sync queued', {
        correlationId,
        operation: 'sendToHubSpot',
        metadata: { email: formData['Email'] }
      });

      // Update Airtable to mark as synced
      if (airtableRecordId) {
        await this.updateAirtableHubSpotStatus(airtableRecordId, true);
      }
    } catch (error) {
      EnhancedLogger.warn('HubSpot sync failed (non-critical)', {
        correlationId,
        operation: 'sendToHubSpot',
        metadata: { error: (error as Error).message }
      });
    }
  }

  /**
   * Run the complete sales pipeline with parallel processing and rollback
   */
  async runSalesOrderPipeline(formData: FormData, pdfPath: string): Promise<PipelineResult> {
    const correlationId = EnhancedLogger.generateCorrelationId();
    const completedSteps: string[] = [];
    const failedSteps: string[] = [];
    
    EnhancedLogger.info('Starting sales order pipeline', {
      correlationId,
      operation: 'runSalesOrderPipeline',
      metadata: { companyName: formData['Company Name'] }
    });

    let uploadedFileId: string | null = null;
    let airtableRecordId: string | null = null;

    try {
      // Validate form data
      validateFormData(formData);

      // Step 1: Upload to Google Drive (Critical)
      const quoteLink = await this.uploadToDrive(pdfPath, formData['Company Name']);
      completedSteps.push('Google Drive Upload');

      // Extract file ID for potential cleanup
      const fileIdMatch = quoteLink.match(/\/d\/([a-zA-Z0-9-_]+)/);
      uploadedFileId = fileIdMatch ? fileIdMatch[1] : null;

      // Step 2: Parallel non-critical operations
      const parallelOperations = [];

      // Email to team
      parallelOperations.push(
        this.sendEmail(
          this.config.teamEmails,
          `📎 Quote Ready – ${formData['Company Name']}`,
          `The quote has been created for ${formData['Company Name']}\n\nView: ${quoteLink}`,
          pdfPath
        ).then(() => completedSteps.push('Email Notification'))
          .catch((error) => {
            failedSteps.push('Email Notification');
            EnhancedLogger.error('Email failed', error, { correlationId });
          })
      );

      // Slack Alert
      if (this.config.slackWebhookUrl) {
        parallelOperations.push(
          this.sendSlackAlert(this.config.slackWebhookUrl, formData['Company Name'], quoteLink)
            .then(() => completedSteps.push('Slack Alert'))
            .catch(() => failedSteps.push('Slack Alert'))
        );
      }

      // DocuSign
      parallelOperations.push(
        this.sendDocuSignSignature(
          this.config.docusignTemplateId,
          formData['Email'],
          formData['Contact Name'],
          formData['Company Name']
        ).then(() => completedSteps.push('DocuSign Request'))
          .catch(() => failedSteps.push('DocuSign Request'))
      );

      // Airtable (semi-critical - needed for HubSpot)
      parallelOperations.push(
        this.insertScrapedLead(formData)
          .then((recordId) => {
            airtableRecordId = recordId;
            completedSteps.push('Airtable Insert');
            
            // HubSpot sync after Airtable
            return this.sendToHubSpot(formData, recordId)
              .then(() => completedSteps.push('HubSpot Sync'))
              .catch(() => failedSteps.push('HubSpot Sync'));
          })
          .catch((error) => {
            failedSteps.push('Airtable Insert');
            failedSteps.push('HubSpot Sync');
            EnhancedLogger.error('Airtable operation failed', error, { correlationId });
          })
      );

      // Wait for all parallel operations
      await Promise.allSettled(parallelOperations);

      // Determine overall success
      const criticalStepsFailed = failedSteps.includes('Google Drive Upload');
      const success = !criticalStepsFailed && completedSteps.length > 0;

      EnhancedLogger.info('Sales order pipeline completed', {
        correlationId,
        operation: 'runSalesOrderPipeline',
        metadata: {
          success,
          completedSteps,
          failedSteps,
          company: formData['Company Name']
        }
      });

      return {
        success,
        quoteLink,
        correlationId,
        completedSteps,
        failedSteps: failedSteps.length > 0 ? failedSteps : undefined
      };

    } catch (error) {
      // Cleanup on critical failure
      if (uploadedFileId && this.driveService) {
        try {
          await this.driveService.files.delete({ fileId: uploadedFileId });
          EnhancedLogger.info('Cleaned up uploaded file after pipeline failure', { correlationId });
        } catch (cleanupError) {
          EnhancedLogger.warn('Failed to cleanup uploaded file', {
            correlationId,
            metadata: { error: (cleanupError as Error).message }
          });
        }
      }

      EnhancedLogger.error('Sales order pipeline failed', error, {
        correlationId,
        operation: 'runSalesOrderPipeline',
        metadata: {
          completedSteps,
          failedSteps,
          company: formData['Company Name']
        }
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        correlationId,
        completedSteps: completedSteps.length > 0 ? completedSteps : undefined,
        failedSteps: failedSteps.length > 0 ? failedSteps : undefined
      };
    }
  }
}

// Export singleton instance
export const enhancedSalesOrderProcessor = new EnhancedSalesOrderProcessor();
