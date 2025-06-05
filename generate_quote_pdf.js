#!/usr/bin/env node
/**
 * Simple PDF generation wrapper for sales orders
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function generateQuotePDF(orderData) {
  try {
    const clientName = orderData.customer_name || "Unknown Client";
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `${clientName.replace(/\s+/g, '_')}_Quote_${timestamp}.pdf`;
    const outputPath = `./pdfs/${filename}`;

    // Ensure pdfs directory exists
    if (!fs.existsSync('./pdfs')) {
      fs.mkdirSync('./pdfs', { recursive: true });
    }

    // Prepare quote data for Python script
    const quoteData = {
      package: orderData.package || "Standard",
      addons: Array.isArray(orderData.items) ? orderData.items : [orderData.items || "YoBot Pro"],
      total: `$${orderData.amount || 0}`,
      contact: clientName,
      order_id: orderData.order_id
    };

    // Python script for PDF generation
    const pythonScript = `
import sys
import os
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from datetime import datetime
import json

# Quote data
quote_data = json.loads('${JSON.stringify(quoteData).replace(/'/g, "\\'")}')

# Create PDF
buffer = BytesIO()
doc = SimpleDocTemplate(buffer, pagesize=letter)
styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    'CustomTitle',
    parent=styles['Heading1'],
    fontSize=24,
    spaceAfter=30,
    textColor=colors.HexColor('#1f2937')
)

content = []
content.append(Paragraph("YoBot AI Solutions - Professional Quote", title_style))
content.append(Spacer(1, 20))

content.append(Paragraph(f"<b>Client:</b> {quote_data.get('contact', 'Valued Client')}", styles['Normal']))
content.append(Paragraph(f"<b>Date:</b> {datetime.now().strftime('%B %d, %Y')}", styles['Normal']))
content.append(Paragraph(f"<b>Quote ID:</b> {quote_data.get('order_id', 'Q-' + datetime.now().strftime('%Y%m%d'))}", styles['Normal']))
content.append(Spacer(1, 20))

table_data = [
    ['Service', 'Description', 'Amount'],
    [quote_data.get('package', 'Standard Package'), 'AI Automation Solution', quote_data.get('total', '$0')]
]

addons = quote_data.get('addons', [])
if addons:
    for addon in addons:
        if isinstance(addon, str):
            table_data.append([addon, 'Premium Feature', 'Included'])

quote_table = Table(table_data, colWidths=[2*inch, 3*inch, 1*inch])
quote_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f3f4f6')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, 0), 12),
    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 1, colors.black)
]))

content.append(quote_table)
content.append(Spacer(1, 30))

content.append(Paragraph("<b>Implementation Timeline:</b>", styles['Heading2']))
content.append(Paragraph("• Setup and configuration: 1-2 business days", styles['Normal']))
content.append(Paragraph("• Training and integration: 3-5 business days", styles['Normal']))
content.append(Paragraph("• Testing and optimization: 2-3 business days", styles['Normal']))
content.append(Spacer(1, 20))

content.append(Paragraph("<b>Contact Information:</b>", styles['Heading2']))
content.append(Paragraph("YoBot Sales Team", styles['Normal']))
content.append(Paragraph("Email: sales@yobot.ai", styles['Normal']))
content.append(Paragraph("Phone: (555) 123-4567", styles['Normal']))

doc.build(content)
buffer.seek(0)

# Write to file
with open('${outputPath}', 'wb') as f:
    f.write(buffer.getvalue())

print("SUCCESS")
    `;

    // Execute Python script
    execSync(`python3 -c "${pythonScript}"`, { 
      cwd: process.cwd(),
      stdio: 'pipe'
    });

    // Verify PDF was created
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      return {
        success: true,
        filename: filename,
        filepath: outputPath,
        size: stats.size,
        download_url: `/pdfs/${filename}`
      };
    } else {
      return {
        success: false,
        error: "PDF file not created"
      };
    }

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// If called directly from command line
if (require.main === module) {
  const orderData = JSON.parse(process.argv[2] || '{}');
  const result = generateQuotePDF(orderData);
  console.log(JSON.stringify(result));
}

module.exports = { generateQuotePDF };