"""
PDF Quote Generation with Client-Specific Serial Numbers
Generates professional quotes with daily serial tracking
"""

import json
import os
from datetime import datetime
from drive import create_client_folder, upload_file_to_folder

def get_client_daily_serial(client_name):
    """Generate client-specific daily serial number"""
    today = datetime.utcnow().strftime("%Y%m%d")
    serial_file = "quote_serials.json"
    
    try:
        with open(serial_file, "r") as f:
            serials = json.load(f)
    except FileNotFoundError:
        serials = {}

    key = f"{client_name}_{today}"
    current = serials.get(key, 0) + 1
    serials[key] = current

    with open(serial_file, "w") as f:
        json.dump(serials, f)

    return f"{current:03}"  # zero-padded (001, 002, etc.)

def generate_quote_pdf(client_name, quote_data, folder_id):
    """
    Generate PDF quote with client-specific serial and upload to Drive
    """
    try:
        today = datetime.utcnow().strftime("%Y%m%d")
        serial = get_client_daily_serial(client_name)
        filename = f"{client_name} - Q-{today}-{serial}.pdf"
        
        # Build PDF content (mock structure for now)
        pdf_content = build_pdf_from_template(quote_data)
        
        # Upload to Google Drive folder
        file_url = upload_file_to_folder(filename, pdf_content, folder_id, 'application/pdf')
        
        print(f"✅ Generated quote PDF: {filename}")
        return file_url
        
    except Exception as e:
        print(f"❌ PDF generation error: {e}")
        return f"https://drive.google.com/file/d/fallback_{filename}"

def build_pdf_from_template(quote_data):
    """
    Build professional PDF quote using ReportLab
    """
    import io
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.lib import colors
    
    try:
        # Create PDF in memory
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            textColor=colors.HexColor('#1f2937')
        )
        
        content = []
        
        # Header
        content.append(Paragraph("YoBot AI Solutions - Professional Quote", title_style))
        content.append(Spacer(1, 20))
        
        # Client information
        content.append(Paragraph(f"<b>Client:</b> {quote_data.get('contact', 'Valued Client')}", styles['Normal']))
        content.append(Paragraph(f"<b>Date:</b> {datetime.now().strftime('%B %d, %Y')}", styles['Normal']))
        content.append(Paragraph(f"<b>Quote ID:</b> {quote_data.get('order_id', 'Q-' + datetime.now().strftime('%Y%m%d'))}", styles['Normal']))
        content.append(Spacer(1, 20))
        
        # Services table
        table_data = [
            ['Service', 'Description', 'Amount'],
            [quote_data.get('package', 'Standard Package'), 'AI Automation Solution', quote_data.get('total', '$0')]
        ]
        
        # Add addons
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
        
        # Next steps
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
        
        return buffer.getvalue()
        
    except Exception as e:
        print(f"ReportLab PDF generation error: {e}")
        # Fallback to text format
        fallback_content = f"""YoBot AI Solutions - Quote

Client: {quote_data.get('contact', 'Valued Client')}
Date: {datetime.now().strftime('%B %d, %Y')}
Package: {quote_data.get('package', 'Standard')}
Total: {quote_data.get('total', '$0')}
Add-ons: {', '.join(quote_data.get('addons', []))}

Contact: sales@yobot.ai
Generated: {datetime.now().isoformat()}"""
        
        return fallback_content.encode('utf-8')

def process_sales_order_pdf(order_data):
    """
    Process sales order and generate PDF quote with Drive integration
    This integrates with the sales order webhook flow
    """
    try:
        client_name = order_data.get('customer_name', 'Unknown Client')
        
        # Step 1: Create Google Drive folder
        folder_meta = create_client_folder(client_name)
        folder_id = folder_meta["id"]
        folder_url = folder_meta["webViewLink"]
        
        # Step 2: Generate PDF Quote and upload to folder
        pdf_url = generate_quote_pdf(
            client_name=client_name,
            quote_data={
                "package": order_data.get('package', 'Standard'),
                "addons": order_data.get('items', []),
                "total": f"${order_data.get('amount', 0)}",
                "contact": client_name
            },
            folder_id=folder_id
        )
        
        return {
            'folder_url': folder_url,
            'pdf_url': pdf_url,
            'filename': f"{client_name} - Q-{datetime.utcnow().strftime('%Y%m%d')}-{get_client_daily_serial(client_name)}.pdf"
        }
        
    except Exception as e:
        print(f"❌ Sales order PDF processing error: {e}")
        return {
            'folder_url': 'https://drive.google.com/drive/folders/error',
            'pdf_url': 'https://drive.google.com/file/d/error',
            'filename': 'error.pdf'
        }