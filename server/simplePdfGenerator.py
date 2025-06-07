#!/usr/bin/env python3
"""
Simple PDF Generator for YoBot Sales Orders
Generates professional quotes without external dependencies
"""

import sys
import json
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors

def create_quote_pdf(data, filename):
    """Generate a professional PDF quote"""
    doc = SimpleDocTemplate(filename, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        alignment=1,  # Center
        textColor=colors.HexColor('#1A73E8')
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        spaceAfter=12,
        textColor=colors.HexColor('#1A73E8')
    )
    
    # Title
    story.append(Paragraph("YoBot Professional Quote", title_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Quote information
    quote_id = f"Q-{int(datetime.now().timestamp())}"
    quote_date = datetime.now().strftime("%B %d, %Y")
    valid_until = datetime.now().strftime("%B %d, %Y")
    
    # Client information section
    story.append(Paragraph("Client Information", heading_style))
    client_data = [
        ["Company:", data.get('company_name', 'N/A')],
        ["Contact:", data.get('contact_name', 'N/A')],
        ["Email:", data.get('email', 'N/A')],
        ["Phone:", data.get('phone', 'N/A')],
        ["Quote ID:", quote_id],
        ["Date:", quote_date],
        ["Valid Until:", valid_until]
    ]
    
    client_table = Table(client_data, colWidths=[1.5*inch, 4*inch])
    client_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f8f9fa')),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#ddd'))
    ]))
    story.append(client_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Package details section
    story.append(Paragraph("Package Details", heading_style))
    package_data = [
        ["Package", "Description", "Setup Fee", "Monthly Fee"],
        [
            data.get('package', 'Professional Package'),
            "Complete AI voice automation solution",
            f"${data.get('one_time_payment', '15,000'):,}",
            f"${data.get('monthly_recurring', '2,500'):,}/month"
        ]
    ]
    
    package_table = Table(package_data, colWidths=[1.5*inch, 2.5*inch, 1*inch, 1*inch])
    package_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1A73E8')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    story.append(package_table)
    story.append(Spacer(1, 0.2*inch))
    
    # Add-ons if any
    addons = data.get('addons', [])
    if addons:
        story.append(Paragraph("Selected Add-Ons", heading_style))
        for addon in addons:
            story.append(Paragraph(f"• {addon}", styles['Normal']))
        story.append(Spacer(1, 0.2*inch))
    
    # Investment summary
    story.append(Paragraph("Investment Summary", heading_style))
    total_setup = data.get('one_time_payment', 15000)
    total_monthly = data.get('monthly_recurring', 2500)
    
    summary_data = [
        ["Total Setup Investment:", f"${total_setup:,}"],
        ["Monthly Service Fee:", f"${total_monthly:,}/month"]
    ]
    
    summary_table = Table(summary_data, colWidths=[3*inch, 2*inch])
    summary_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 14),
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#1A73E8')),
        ('LINEBELOW', (0, 0), (-1, 0), 1, colors.HexColor('#1A73E8'))
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 0.3*inch))
    
    # What's included section
    story.append(Paragraph("What's Included", heading_style))
    included_items = [
        "24/7 AI-powered automation",
        "Real-time performance analytics", 
        "Enterprise-grade security",
        "Dedicated support team",
        "Custom integration setup"
    ]
    for item in included_items:
        story.append(Paragraph(f"✓ {item}", styles['Normal']))
    
    story.append(Spacer(1, 0.4*inch))
    
    # Footer
    footer_text = """
    This quote is valid for 30 days. Terms and conditions apply.<br/>
    YoBot Enterprise Solutions - Transforming Customer Engagement with AI
    """
    story.append(Paragraph(footer_text, styles['Normal']))
    
    # Build the PDF
    doc.build(story)
    return filename

def main():
    """Main function to process input and generate PDF"""
    try:
        # Read JSON input from stdin
        input_data = sys.stdin.read()
        data = json.loads(input_data)
        
        # Generate PDF
        timestamp = int(datetime.now().timestamp())
        filename = f"/tmp/quote_{timestamp}.pdf"
        pdf_path = create_quote_pdf(data, filename)
        
        # Return success response
        response = {
            "status": "success",
            "message": "PDF generated successfully",
            "pdf_path": pdf_path,
            "company": data.get('company_name', 'Unknown'),
            "quote_id": f"Q-{timestamp}"
        }
        
        print(json.dumps(response))
        
    except Exception as e:
        # Return error response
        error_response = {
            "status": "error", 
            "message": f"PDF generation failed: {str(e)}"
        }
        print(json.dumps(error_response))
        sys.exit(1)

if __name__ == "__main__":
    main()