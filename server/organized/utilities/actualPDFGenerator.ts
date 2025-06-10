import * as PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export interface SalesOrderData {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  packageName: string;
  total: number;
  quoteNumber: string;
}

export async function generateActualPDF(orderData: SalesOrderData): Promise<{ success: boolean; filePath?: string; error?: string }> {
  try {
    const fileName = `YoBot_Quote_${orderData.quoteNumber}_${orderData.companyName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    const pdfsDir = path.join(process.cwd(), 'pdfs');
    
    // Ensure pdfs directory exists
    if (!fs.existsSync(pdfsDir)) {
      fs.mkdirSync(pdfsDir, { recursive: true });
    }
    
    const filePath = path.join(pdfsDir, fileName);
    
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
    doc.text(`Company: ${orderData.companyName}`);
    doc.text(`Contact: ${orderData.contactName}`);
    doc.text(`Email: ${orderData.email}`);
    if (orderData.phone) {
      doc.text(`Phone: ${orderData.phone}`);
    }
    doc.moveDown(2);

    // Service Details
    doc.fontSize(16).font('Helvetica-Bold').text('Service Package:', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica');
    doc.text(`Package: ${orderData.packageName}`);
    doc.moveDown(1);

    // Pricing Information
    doc.fontSize(16).font('Helvetica-Bold').text('Investment Details:', { underline: true });
    doc.moveDown(0.5);
    
    const tableTop = doc.y;
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('Description', 50, tableTop);
    doc.text('Amount', 400, tableTop, { width: 100, align: 'right' });
    
    // Line under headers
    doc.moveTo(50, tableTop + 20).lineTo(500, tableTop + 20).stroke();
    
    // Package pricing
    doc.font('Helvetica');
    let currentY = tableTop + 30;
    
    doc.text('Setup & Implementation', 50, currentY);
    doc.text('$2,500', 400, currentY, { width: 100, align: 'right' });
    currentY += 20;
    
    doc.text('Monthly Service Fee', 50, currentY);
    doc.text('$150', 400, currentY, { width: 100, align: 'right' });
    currentY += 20;
    
    doc.text('First Year Total', 50, currentY);
    doc.text('$4,300', 400, currentY, { width: 100, align: 'right' });
    currentY += 30;
    
    // Total line
    doc.moveTo(300, currentY - 10).lineTo(500, currentY - 10).stroke();
    doc.font('Helvetica-Bold');
    doc.text('Total Investment', 50, currentY);
    doc.text(`$${orderData.total.toLocaleString()}`, 400, currentY, { width: 100, align: 'right' });
    
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
    doc.text(`Quote Number: ${orderData.quoteNumber}`);

    // Footer
    doc.fontSize(10).font('Helvetica');
    doc.text('YoBot® - Transforming Business Communication Through AI', 50, doc.page.height - 100, { align: 'center' });
    doc.text('Contact: sales@yobot.bot | Phone: (555) 123-4567', { align: 'center' });

    doc.end();

    // Wait for PDF generation to complete
    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    console.log(`✅ PDF generated successfully: ${fileName}`);
    
    return {
      success: true,
      filePath
    };

  } catch (error: any) {
    console.error('PDF generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}