import nodemailer from 'nodemailer';

interface EmailConfig {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
}

class EmailAlerts {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: 'noreply@yobot.bot',
        pass: 'dtoharupmtyuuhxw' // Remove spaces from app password
      }
    });
  }

  async sendFailureAlert(functionName: string, error: string, notes?: string): Promise<boolean> {
    try {
      const mailOptions: EmailConfig = {
        from: 'noreply@yobot.bot',
        to: 'support@yobot.bot', // Default recipient
        subject: `🚨 Function Test Failure: ${functionName}`,
        text: `Function ${functionName} has failed testing.\n\nError: ${error}\n\nNotes: ${notes || 'None'}\n\nPlease investigate immediately.`,
        html: `
          <h2>🚨 Function Test Failure</h2>
          <p><strong>Function:</strong> ${functionName}</p>
          <p><strong>Status:</strong> ❌ FAILED</p>
          <p><strong>Error:</strong> ${error}</p>
          <p><strong>Notes:</strong> ${notes || 'None'}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          <hr>
          <p>Please investigate this failure immediately.</p>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`📧 Failure email sent for ${functionName}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send email alert:`, error);
      return false;
    }
  }

  async sendTestSummary(total: number, passed: number, failed: number): Promise<boolean> {
    try {
      const mailOptions: EmailConfig = {
        from: 'noreply@yobot.bot',
        to: 'support@yobot.bot',
        subject: `📊 Daily Test Summary - ${passed}/${total} Functions Passed`,
        text: `Daily Test Summary\n\nTotal Functions: ${total}\nPassed: ${passed}\nFailed: ${failed}\nSuccess Rate: ${((passed/total)*100).toFixed(1)}%`,
        html: `
          <h2>📊 Daily Test Summary</h2>
          <table border="1" style="border-collapse: collapse;">
            <tr><td><strong>Total Functions</strong></td><td>${total}</td></tr>
            <tr><td><strong>Passed</strong></td><td style="color: green;">${passed} ✅</td></tr>
            <tr><td><strong>Failed</strong></td><td style="color: red;">${failed} ❌</td></tr>
            <tr><td><strong>Success Rate</strong></td><td>${((passed/total)*100).toFixed(1)}%</td></tr>
          </table>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`📧 Test summary email sent`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send summary email:`, error);
      return false;
    }
  }
}

export const emailAlerts = new EmailAlerts();