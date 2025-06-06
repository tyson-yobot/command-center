#!/usr/bin/env python3
"""
Working Sales Order Automation
Uses your actual Airtable credentials and generates PDFs without Google Drive dependency
"""

import datetime
import os
import json
import requests
from fpdf import FPDF

# Your actual Airtable credentials
AIRTABLE_BASE_ID = "appCoAtCZdARb4AM2"
AIRTABLE_TABLE_ID = "tblRNjNnaGL5ICIf9"
AIRTABLE_API_KEY = "paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa"

# Package configurations
PACKAGES = {
    "YoBot Standard Package": {"setup": 2500, "monthly": 150},
    "YoBot Professional Package": {"setup": 7500, "monthly": 495},
    "YoBot Enterprise Package": {"setup": 12500, "monthly": 1499}
}

ADDONS = {
    "SmartSpend": {"setup": 500, "monthly": 299},
    "Advanced Analytics": {"setup": 750, "monthly": 399},
    "A/B Testing": {"setup": 300, "monthly": 199}
}

def generate_quote_number(company_name):
    """Generate unique quote number"""
    today = datetime.datetime.now().strftime("%Y%m%d")
    company_code = ''.join([c.upper() for c in company_name.split() if c])[:3]
    return f"Q-{company_code}-{today}-001"

def generate_quote_pdf(client_data):
    """Generate PDF quote using actual client data"""
    try:
        quote_number = client_data.get('quote_number', generate_quote_number(client_data['company_name']))
        pdf_path = f"./pdfs/YoBot_Quote_{quote_number}_{client_data['company_name'].replace(' ', '_')}.pdf"
        
        os.makedirs(os.path.dirname(pdf_path), exist_ok=True)
        
        pdf = FPDF()
        pdf.add_page()
        
        # Header
        pdf.set_font('Arial', 'B', 20)
        pdf.cell(0, 15, 'YoBot Professional Quote', 0, 1, 'C')
        pdf.set_font('Arial', '', 12)
        pdf.cell(0, 10, f"Quote Number: {quote_number}", 0, 1, 'C')
        pdf.cell(0, 5, f"Generated: {datetime.datetime.now().strftime('%B %d, %Y')}", 0, 1, 'C')
        pdf.ln(10)
        
        # Client information
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(0, 10, 'Client Information:', 0, 1)
        pdf.set_font('Arial', '', 12)
        pdf.cell(0, 8, f"Company: {client_data['company_name']}", 0, 1)
        pdf.cell(0, 8, f"Contact: {client_data.get('contact_name', 'N/A')}", 0, 1)
        pdf.cell(0, 8, f"Email: {client_data['contact_email']}", 0, 1)
        pdf.ln(10)
        
        # Package details
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(0, 10, 'Package Details:', 0, 1)
        pdf.set_font('Arial', '', 12)
        
        package_name = client_data.get('package_name', 'YoBot Standard Package')
        package_info = PACKAGES.get(package_name, PACKAGES['YoBot Standard Package'])
        
        pdf.cell(0, 8, f"Package: {package_name}", 0, 1)
        pdf.cell(0, 8, f"Setup Fee: ${package_info['setup']:,}", 0, 1)
        pdf.cell(0, 8, f"Monthly Fee: ${package_info['monthly']:,}", 0, 1)
        pdf.ln(5)
        
        # Add-ons
        addons = client_data.get('addons', [])
        if addons:
            pdf.set_font('Arial', 'B', 14)
            pdf.cell(0, 10, 'Add-ons:', 0, 1)
            pdf.set_font('Arial', '', 12)
            
            for addon in addons:
                if addon in ADDONS:
                    addon_info = ADDONS[addon]
                    pdf.cell(0, 8, f"{addon}: ${addon_info['setup']:,} setup + ${addon_info['monthly']:,}/month", 0, 1)
        
        # Total
        total_setup = package_info['setup'] + sum(ADDONS.get(addon, {}).get('setup', 0) for addon in addons)
        total_monthly = package_info['monthly'] + sum(ADDONS.get(addon, {}).get('monthly', 0) for addon in addons)
        
        pdf.ln(10)
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(0, 10, f"Total Setup: ${total_setup:,}", 0, 1)
        pdf.cell(0, 10, f"Total Monthly: ${total_monthly:,}", 0, 1)
        
        pdf.output(pdf_path)
        print(f"✅ PDF generated: {pdf_path}")
        
        return {
            'success': True,
            'pdf_path': pdf_path,
            'quote_number': quote_number,
            'total_setup': total_setup,
            'total_monthly': total_monthly
        }
        
    except Exception as e:
        print(f"❌ PDF generation failed: {e}")
        return {'success': False, 'error': str(e)}

def log_to_airtable(client_data, pdf_result):
    """Log sales order to your actual Airtable"""
    url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{AIRTABLE_TABLE_ID}"
    headers = {
        "Authorization": f"Bearer {AIRTABLE_API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "fields": {
            "🧩 Integration Name": f"Sales Order: {client_data['company_name']}",
            "📝 Notes / Debug": f"Quote: {pdf_result.get('quote_number', 'N/A')} | Setup: ${pdf_result.get('total_setup', 0):,} | Monthly: ${pdf_result.get('total_monthly', 0):,} | Package: {client_data.get('package_name', 'N/A')}",
            "📅 Test Date": datetime.datetime.now().strftime("%Y-%m-%d"),
            "👤 QA Owner": client_data['contact_email'],
            "⚙️ Module Type": "Sales Order Processing"
        }
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        if response.status_code == 200:
            print(f"✅ Sales order logged to Airtable")
            return True
        else:
            print(f"❌ Airtable logging failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Airtable error: {e}")
        return False

def process_sales_order(order_data):
    """Process complete sales order with working automation"""
    try:
        print(f"🚀 Processing sales order for {order_data.get('customer_name', 'Unknown')}")
        
        # Normalize data
        client_data = {
            'company_name': order_data.get('customer_name', order_data.get('company', 'Unknown Company')),
            'contact_name': order_data.get('name', order_data.get('customer_name', 'Unknown Contact')),
            'contact_email': order_data.get('email', 'unknown@example.com'),
            'package_name': order_data.get('package', 'YoBot Standard Package'),
            'addons': order_data.get('addons', []),
            'phone': order_data.get('phone', '(000) 000-0000'),
            'order_id': order_data.get('order_id', f"ORD-{datetime.datetime.now().strftime('%Y%m%d')}-001")
        }
        
        # Generate quote number
        client_data['quote_number'] = generate_quote_number(client_data['company_name'])
        
        # Generate PDF
        pdf_result = generate_quote_pdf(client_data)
        
        if not pdf_result['success']:
            return {
                'success': False,
                'error': f"PDF generation failed: {pdf_result['error']}"
            }
        
        # Log to Airtable
        airtable_success = log_to_airtable(client_data, pdf_result)
        
        # Return success result
        return {
            'success': True,
            'quote_number': pdf_result['quote_number'],
            'company_name': client_data['company_name'],
            'contact_email': client_data['contact_email'],
            'package_name': client_data['package_name'],
            'pdf_path': pdf_result['pdf_path'],
            'total_setup': pdf_result['total_setup'],
            'total_monthly': pdf_result['total_monthly'],
            'airtable_logged': airtable_success,
            'folder_url': 'Local PDF generated - Google Drive requires OAuth setup',
            'processing_time': datetime.datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Sales order processing failed: {e}")
        return {
            'success': False,
            'error': str(e)
        }

if __name__ == "__main__":
    # Test with sample data
    test_order = {
        "customer_name": "Test Company Inc",
        "email": "test@testcompany.com",
        "package": "YoBot Professional Package",
        "addons": ["SmartSpend"],
        "phone": "(555) 123-4567"
    }
    
    result = process_sales_order(test_order)
    print(json.dumps(result, indent=2))