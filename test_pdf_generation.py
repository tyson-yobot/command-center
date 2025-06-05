#!/usr/bin/env python3
"""
Test PDF generation with ReportLab
"""

import os
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from datetime import datetime

def generate_test_quote():
    # Test data
    quote_data = {
        "package": "Pro",
        "addons": ["SmartSpend", "A/B Script Testing"],
        "total": "$9,648",
        "contact": "NovaFlow Solutions",
        "order_id": "ORD-TEST-2024"
    }
    
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
    
    content.append(Paragraph(f"<b>Client:</b> {quote_data['contact']}", styles['Normal']))
    content.append(Paragraph(f"<b>Date:</b> {datetime.now().strftime('%B %d, %Y')}", styles['Normal']))
    content.append(Paragraph(f"<b>Quote ID:</b> {quote_data['order_id']}", styles['Normal']))
    content.append(Spacer(1, 20))
    
    table_data = [
        ['Service', 'Description', 'Amount'],
        [quote_data['package'], 'AI Automation Solution', quote_data['total']]
    ]
    
    for addon in quote_data['addons']:
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
    
    # Ensure pdfs directory exists
    os.makedirs('./pdfs', exist_ok=True)
    
    # Write to file
    filename = f"NovaFlow_Solutions_Quote_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    filepath = f"./pdfs/{filename}"
    
    with open(filepath, 'wb') as f:
        f.write(buffer.getvalue())
    
    print(f"PDF generated successfully: {filename}")
    print(f"File size: {len(buffer.getvalue())} bytes")
    return filepath

if __name__ == "__main__":
    generate_test_quote()