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
    Build PDF content from quote template
    In production, this would use a proper PDF library
    """
    # Mock PDF content structure
    pdf_template = f"""
    QUOTE DOCUMENT
    
    Package: {quote_data.get('package', 'Standard')}
    Add-ons: {', '.join(quote_data.get('addons', []))}
    Total: {quote_data.get('total', '$0')}
    Contact: {quote_data.get('contact', 'Client')}
    
    Generated: {datetime.now().isoformat()}
    """
    
    return pdf_template.encode('utf-8')

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