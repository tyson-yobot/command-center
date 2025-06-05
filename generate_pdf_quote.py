#!/usr/bin/env python3
"""
Dynamic PDF Quote Generator
Generates professional PDF quotes with custom data
"""

import sys
import os
import json
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from datetime import datetime

def generate_quote_pdf(order_data):
    """Generate a professional PDF quote"""
    try:
        # Extract data
        customer_name = order_data.get('customer_name', 'Valued Client')
        package = order_data.get('package', 'Standard')
        items = order_data.get('items', [])
        amount = order_data.get('amount', 0)
        order_id = order_data.get('order_id', f"Q-{datetime.now().strftime('%Y%m%d')}")
        
        # Create filename
        safe_name = customer_name.replace(' ', '_').replace('/', '_')
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{safe_name}_Quote_{timestamp}.pdf"
        filepath = f"./pdfs/{filename}"
        
        # Ensure pdfs directory exists
        os.makedirs('./pdfs', exist_ok=True)
        
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
        
        content.append(Paragraph(f"<b>Client:</b> {customer_name}", styles['Normal']))
        content.append(Paragraph(f"<b>Date:</b> {datetime.now().strftime('%B %d, %Y')}", styles['Normal']))
        content.append(Paragraph(f"<b>Quote ID:</b> {order_id}", styles['Normal']))
        content.append(Spacer(1, 20))
        
        # Build table data
        table_data = [
            ['Service', 'Description', 'Amount'],
            [package, 'AI Automation Solution', f"${amount:,}"]
        ]
        
        # Add items/addons
        if items:
            for item in items:
                if isinstance(item, str):
                    table_data.append([item, 'Premium Feature', 'Included'])
        
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
        
        # Build PDF
        doc.build(content)
        buffer.seek(0)
        
        # Write to file
        with open(filepath, 'wb') as f:
            f.write(buffer.getvalue())
        
        # Get file size
        file_size = os.path.getsize(filepath)
        
        return {
            'success': True,
            'filename': filename,
            'filepath': filepath,
            'size': file_size,
            'download_url': f'/pdfs/{filename}'
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Get order data from command line argument
        order_data = json.loads(sys.argv[1])
    else:
        # Default test data
        order_data = {
            'customer_name': 'Test Client',
            'package': 'Standard',
            'items': ['Feature A', 'Feature B'],
            'amount': 5000,
            'order_id': 'TEST-001'
        }
    
    result = generate_quote_pdf(order_data)
    print(json.dumps(result))