import fs from 'fs';
import path from 'path';

interface QuoteData {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  serviceType: string;
  monthlyFee: number;
  setupFee: number;
  totalFirstMonth: number;
}

export class SimpleQuoteGenerator {
  async generateQuote(data: QuoteData): Promise<{ success: boolean; filePath?: string; quoteId?: string; error?: string }> {
    try {
      const quoteId = `YB-${Date.now().toString().slice(-6)}`;
      const quoteContent = this.createQuoteContent(data, quoteId);
      
      // Create uploads directory
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Generate filename
      const fileName = `YoBot_Quote_${data.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.txt`;
      const filePath = path.join(uploadsDir, fileName);
      
      // Write quote file
      fs.writeFileSync(filePath, quoteContent);
      
      return {
        success: true,
        filePath,
        quoteId
      };
    } catch (error) {
      return {
        success: false,
        error: (error as any).message
      };
    }
  }

  private createQuoteContent(data: QuoteData, quoteId: string): string {
    return `
╔══════════════════════════════════════════════════════════════╗
║                      YoBot® AI Sales Quote                   ║
╚══════════════════════════════════════════════════════════════╝

Quote ID: ${quoteId}
Date: ${new Date().toLocaleDateString()}
Valid Until: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}

CUSTOMER INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Company:     ${data.companyName}
Contact:     ${data.contactName}
Email:       ${data.email}
Phone:       ${data.phone || 'Not provided'}

SERVICE PACKAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Package:     ${data.serviceType}

INVESTMENT BREAKDOWN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Monthly Service Fee:           $${data.monthlyFee.toLocaleString()}
Setup & Onboarding Fee:        $${data.setupFee.toLocaleString()}
─────────────────────────────────────────────────────────────
FIRST MONTH TOTAL:             $${data.totalFirstMonth.toLocaleString()}

WHAT'S INCLUDED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Advanced AI Voice Bot Technology
✓ Natural Language Processing Engine
✓ Real-time Call Analytics & Reporting
✓ CRM Integration (Salesforce, HubSpot, etc.)
✓ Custom Script Development
✓ 24/7 Technical Support
✓ Performance Analytics Dashboard
✓ Lead Qualification & Routing
✓ Automated Follow-up Sequences
✓ Compliance & Security Features

NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Review and approve this quote
2. Schedule implementation call
3. Begin 5-day onboarding process
4. Go live with your AI voice bot

PAYMENT TERMS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Setup fee due upon contract signing
• Monthly service fee billed monthly in advance
• No long-term contracts required
• 30-day money-back guarantee

CONTACT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YoBot® - Transforming Business Communication Through AI
Sales Team: sales@yobot.bot
Phone: (555) 123-4567
Website: www.yobot.bot

Thank you for choosing YoBot® for your AI communication needs!
`;
  }
}