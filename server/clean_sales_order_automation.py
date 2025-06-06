#!/usr/bin/env python3
"""
Clean Sales Order Automation
Your exact code for PDF generation and processing
"""

import os
from fpdf import FPDF
from datetime import datetime
import requests
import json

# Your actual Airtable credentials (clean)
AIRTABLE_BASE_ID = "appCoAtCZdARb4AM2"
AIRTABLE_TABLE_ID = "tblRNjNnaGL5ICIf9"
AIRTABLE_API_KEY = "paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa"

def generate_sales_order_pdf(form_data):
    """Generate PDF using your exact latest code with table format"""
    
    # Calculations from your exact code
    today = datetime.now()
    quote_id = f"Q-{today.strftime('%Y%m%d')}-001"
    quote_date = today.strftime('%Y-%m-%d')
    folder_name = "./pdfs"
    pdf_name = f"{form_data['Company Name']} - {quote_id}.pdf"
    
    # Totals - your exact calculation
    subtotal = form_data["Bot Package"]["Setup"] + sum(a["Setup"] for a in form_data["Add-Ons"])
    tax = round(subtotal * 0.063, 2)
    total = round(subtotal + tax, 2)
    deposit_due = round(total * 0.5, 2)
    
    # PDF Creation - your exact code
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    
    # Header
    pdf.cell(200, 10, "YoBot, Inc.", ln=1)
    pdf.cell(200, 10, "https://yobot.bot", ln=1)
    pdf.cell(200, 10, f"Date: {quote_date}", ln=1)
    pdf.cell(200, 10, f"Quote #: {quote_id}", ln=1)
    pdf.ln(5)
    
    # Client Info
    pdf.cell(200, 10, "Client Information", ln=1)
    pdf.cell(200, 8, f"Client Name: {form_data['Company Name']}", ln=1)
    pdf.cell(200, 8, f"Contact: {form_data['Contact Name']}", ln=1)
    pdf.cell(200, 8, f"Email: {form_data['Email']}", ln=1)
    pdf.cell(200, 8, f"Phone: {form_data['Phone']}", ln=1)
    pdf.ln(5)
    
    # Table Header
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(100, 10, "Item Description", 1)
    pdf.cell(40, 10, "Quantity", 1)
    pdf.cell(40, 10, "Price", 1)
    pdf.ln()
    
    # Bot Package
    pdf.set_font("Arial", '', 11)
    pdf.cell(100, 10, f"{form_data['Bot Package']['Name']} - {form_data['Bot Package']['Description']}", 1)
    pdf.cell(40, 10, "1", 1)
    pdf.cell(40, 10, f"${form_data['Bot Package']['Setup']:.2f}", 1)
    pdf.ln()
    pdf.cell(100, 10, f"{form_data['Bot Package']['Name']} Monthly Service Fee", 1)
    pdf.cell(40, 10, "1", 1)
    pdf.cell(40, 10, f"${form_data['Bot Package']['Monthly']:.2f}", 1)
    pdf.ln()
    
    # Add-ons
    for addon in form_data["Add-Ons"]:
        pdf.cell(100, 10, f"{addon['Name']} Setup Fee - {addon['Description']}", 1)
        pdf.cell(40, 10, "1", 1)
        pdf.cell(40, 10, f"${addon['Setup']:.2f}", 1)
        pdf.ln()
        pdf.cell(100, 10, f"{addon['Name']} Monthly Add-On Fee", 1)
        pdf.cell(40, 10, "1", 1)
        pdf.cell(40, 10, f"${addon['Monthly']:.2f}", 1)
        pdf.ln()
    
    # Totals
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(180, 10, f"Subtotal: ${subtotal:.2f}", ln=1)
    pdf.cell(180, 10, f"Tax (6.3%): ${tax:.2f}", ln=1)
    pdf.cell(180, 10, f"Total: ${total:.2f}", ln=1)
    pdf.cell(180, 10, f"50% Payment Received - ${deposit_due:.2f}", ln=1)
    
    # Footer Terms
    pdf.set_font("Arial", '', 10)
    pdf.ln(10)
    pdf.cell(200, 8, "**Terms & Conditions**", ln=1)
    pdf.multi_cell(200, 6, "- Payment due within 30 days of invoice date.\n- Late payments subject to a 1.5% monthly late fee.\n- Please contact us with any questions regarding this quote.")
    
    # Output PDF
    os.makedirs(folder_name, exist_ok=True)
    full_pdf_path = os.path.join(folder_name, pdf_name)
    pdf.output(full_pdf_path)
    print(f"✅ PDF created at: {full_pdf_path}")
    
    return {
        'success': True,
        'pdf_path': full_pdf_path,
        'quote_id': quote_id,
        'subtotal': subtotal,
        'tax': tax,
        'total': total,
        'deposit_due': deposit_due,
        'company_name': form_data['Company Name']
    }

def log_to_clean_airtable(order_data, pdf_result):
    """Log to Airtable with clean credentials"""
    url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{AIRTABLE_TABLE_ID}"
    headers = {
        "Authorization": f"Bearer {AIRTABLE_API_KEY}",
        "Content-Type": "application/json"
    }
    
    record_data = {
        "fields": {
            "🧩 Integration Name": f"Sales Order: {order_data.get('company_name', 'Unknown')}",
            "📝 Notes / Debug": f"Quote: {pdf_result.get('quote_number')} | Company: {order_data.get('company_name')} | Monthly: ${pdf_result.get('total_monthly', 0)} | Deposit: ${pdf_result.get('deposit_due', 0)} | PDF: {pdf_result.get('pdf_path')}",
            "📅 Test Date": datetime.now().strftime("%Y-%m-%d"),
            "👤 QA Owner": order_data.get('contact_email', 'system@yobot.bot'),
            "⚙️ Module Type": "Sales Order Processing"
        }
    }
    
    try:
        response = requests.post(url, headers=headers, json=record_data)
        if response.status_code == 200:
            print(f"✅ Order logged to Airtable")
            return {'success': True, 'record_id': response.json().get('id')}
        else:
            print(f"❌ Airtable logging failed: {response.status_code}")
            return {'success': False, 'error': f"Status {response.status_code}"}
    except Exception as e:
        print(f"❌ Airtable error: {e}")
        return {'success': False, 'error': str(e)}

def process_sales_order_clean(order_data):
    """Process sales order with your exact structure"""
    try:
        # Convert input data to your exact form_data structure
        form_data = {
            "Contact Name": order_data.get('contact_name', order_data.get('name', 'Unknown Contact')),
            "Company Name": order_data.get('company_name', order_data.get('customer_name', 'Unknown Company')),
            "Phone": order_data.get('phone', '555-000-0000'),
            "Email": order_data.get('email', 'unknown@example.com'),
            "Bot Package": {
                "Name": "Enterprise Bot",
                "Setup": 12500,
                "Monthly": 1499,
                "Description": "All Pro + Lead Scoring, Quoting Engine, Performance Dashboards, Multi-Platform Sync"
            },
            "Add-Ons": [
                {
                    "Name": "SmartSpend Dashboard",
                    "Setup": 499,
                    "Monthly": 49,
                    "Description": "Track expenses, budget, and ROI directly inside your bot system"
                },
                {
                    "Name": "Live Transfer Routing",
                    "Setup": 399,
                    "Monthly": 39,
                    "Description": "Send leads directly to sales reps"
                }
            ]
        }
        
        # Map package based on input
        package_input = order_data.get('package', 'Enterprise')
        if 'Professional' in package_input:
            form_data["Bot Package"] = {
                "Name": "Professional Bot",
                "Setup": 7500,
                "Monthly": 495,
                "Description": "Advanced Features + Custom Personality + API Access"
            }
        elif 'Standard' in package_input:
            form_data["Bot Package"] = {
                "Name": "Standard Bot", 
                "Setup": 2500,
                "Monthly": 150,
                "Description": "Core Voice Bot + Basic Features"
            }
        
        # Generate PDF using your exact function
        pdf_result = generate_sales_order_pdf(form_data)
        
        # Log to Airtable
        airtable_result = log_to_clean_airtable(order_data, pdf_result)
        
        return {
            'success': True,
            'quote_id': pdf_result['quote_id'],
            'company_name': form_data['Company Name'],
            'pdf_path': pdf_result['pdf_path'],
            'total': pdf_result['total'],
            'deposit_due': pdf_result['deposit_due'],
            'airtable_logged': airtable_result['success'],
            'processing_complete': True
        }
        
    except Exception as e:
        print(f"❌ Sales order processing failed: {e}")
        return {
            'success': False,
            'error': str(e)
        }

if __name__ == "__main__":
    # Test with your exact sample data structure
    test_order = {
        "company_name": "Acme Robotics",
        "contact_name": "John Smith",
        "phone": "555-123-4567",
        "email": "john@acmerobotics.com",
        "package": "Enterprise"
    }
    
    result = process_sales_order_clean(test_order)
    print(f"\nCLEAN PROCESSING RESULT:")
    print(json.dumps(result, indent=2))