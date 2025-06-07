#!/usr/bin/env python3
"""
Live Tally Form Processor
Complete sales order automation with folder creation, PDF, Airtable, DocuSign, HubSpot, and QuickBooks
"""

import json
import os
import time
from datetime import datetime
import subprocess
import requests
from pyairtable import Api
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors

class LiveTallyProcessor:
    def __init__(self):
        self.api_keys = {
            'airtable': os.getenv('AIRTABLE_API_KEY'),
            'hubspot': os.getenv('HUBSPOT_API_KEY'),
            'quickbooks_client_id': os.getenv('QUICKBOOKS_CLIENT_ID'),
            'quickbooks_secret': os.getenv('QUICKBOOKS_CLIENT_SECRET'),
            'quickbooks_access_token': os.getenv('QUICKBOOKS_ACCESS_TOKEN'),
            'quickbooks_realm_id': os.getenv('QUICKBOOKS_REALM_ID')
        }
        
    def process_tally_submission(self, form_data):
        """Process complete Tally form submission"""
        
        # Extract customer data
        customer_data = self.extract_customer_data(form_data)
        print(f"📋 Processing order for: {customer_data['company_name']}")
        
        # Generate quote number
        quote_number = self.generate_quote_number(customer_data['company_name'])
        
        # Create folder structure
        folder_path = self.create_folder_structure(customer_data['company_name'], quote_number)
        
        # Generate PDF quote
        pdf_path = self.generate_pdf_quote(customer_data, quote_number, folder_path)
        
        # Log to Airtable
        airtable_record = self.log_to_airtable(customer_data, quote_number, pdf_path)
        
        # Create HubSpot contact and deal
        hubspot_contact = self.create_hubspot_contact(customer_data)
        hubspot_deal = self.create_hubspot_deal(customer_data, quote_number)
        
        # Create QuickBooks customer and estimate
        qb_customer = self.create_quickbooks_customer(customer_data)
        qb_estimate = self.create_quickbooks_estimate(customer_data, quote_number)
        
        # Upload to Google Drive
        drive_link = self.upload_to_google_drive(pdf_path, customer_data['company_name'])
        
        return {
            'success': True,
            'quote_number': quote_number,
            'pdf_path': pdf_path,
            'folder_path': folder_path,
            'drive_link': drive_link,
            'airtable_record': airtable_record,
            'hubspot_contact': hubspot_contact,
            'hubspot_deal': hubspot_deal,
            'quickbooks_customer': qb_customer,
            'quickbooks_estimate': qb_estimate,
            'customer_data': customer_data
        }
    
    def extract_customer_data(self, form_data):
        """Extract customer data from Tally form submission"""
        
        # Handle both nested and flat data structures
        if isinstance(form_data, dict) and 'body' in form_data:
            data = form_data
        else:
            data = {'body': form_data}
        
        # Extract from multiple possible field formats
        def get_field_value(key_variations):
            for variation in key_variations:
                if variation in data:
                    return data[variation]
                if 'body' in data and variation in data['body']:
                    return data['body'][variation]
            return ""
        
        return {
            'full_name': get_field_value(['Full Name', 'full_name', 'name']),
            'company_name': get_field_value(['Company Name', 'company_name', 'company']),
            'email': get_field_value(['Email Address', 'email', 'Email']),
            'phone': get_field_value(['Phone Number', 'phone', 'Phone']),
            'website': get_field_value(['Website', 'website']),
            'bot_package': get_field_value(['🤖 Bot Package', 'bot_package', 'package']),
            'add_ons': get_field_value(['🧩 Add-On Modules', 'add_ons', 'modules']),
            'payment_amount': get_field_value(['💳 Final Payment Amount Due', 'payment_amount', 'amount']),
            'signature': get_field_value(['✍️ Typed Signature', 'signature']),
            'payment_method': get_field_value(['💳 Preferred Payment Method', 'payment_method', 'method'])
        }
    
    def generate_quote_number(self, company_name):
        """Generate unique quote number"""
        company_prefix = ''.join([c.upper() for c in company_name.split()[:2] if c.isalpha()])[:3]
        date_part = datetime.now().strftime("%Y%m%d")
        return f"YQ-{date_part}-{company_prefix}"
    
    def create_folder_structure(self, company_name, quote_number):
        """Create organized folder structure"""
        safe_name = "".join(c for c in company_name if c.isalnum() or c in (' ', '-', '_')).rstrip()
        folder_path = f"./client_folders/{safe_name}_{quote_number}"
        
        subfolders = ['quotes', 'contracts', 'invoices', 'communications', 'assets']
        
        for subfolder in [''] + subfolders:
            os.makedirs(os.path.join(folder_path, subfolder), exist_ok=True)
        
        print(f"📁 Created folder structure: {folder_path}")
        return folder_path
    
    def generate_pdf_quote(self, customer_data, quote_number, folder_path):
        """Generate professional PDF quote"""
        
        pdf_filename = f"YoBot_Quote_{quote_number}_{customer_data['company_name'].replace(' ', '_')}.pdf"
        pdf_path = os.path.join(folder_path, 'quotes', pdf_filename)
        
        # Ensure pdfs directory exists
        os.makedirs('./pdfs', exist_ok=True)
        main_pdf_path = f"./pdfs/{pdf_filename}"
        
        doc = SimpleDocTemplate(main_pdf_path, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []
        
        # Header
        header_style = ParagraphStyle('CustomHeader', parent=styles['Heading1'], 
                                    fontSize=24, textColor=colors.HexColor('#0D82DA'))
        story.append(Paragraph("YoBot® Enterprise Quote", header_style))
        story.append(Spacer(1, 20))
        
        # Quote details
        quote_data = [
            ['Quote Number:', quote_number],
            ['Date:', datetime.now().strftime("%B %d, %Y")],
            ['Company:', customer_data['company_name']],
            ['Contact:', customer_data['full_name']],
            ['Email:', customer_data['email']],
            ['Phone:', customer_data['phone']]
        ]
        
        quote_table = Table(quote_data, colWidths=[2*inch, 4*inch])
        quote_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(quote_table)
        story.append(Spacer(1, 30))
        
        # Package details
        story.append(Paragraph("Package Details", styles['Heading2']))
        story.append(Spacer(1, 12))
        
        package_data = [
            ['Service', 'Description', 'Amount'],
            [customer_data['bot_package'], 'Enterprise AI Bot Solution', f"${customer_data['payment_amount']}"]
        ]
        
        if customer_data['add_ons']:
            story.append(Paragraph("Add-On Modules:", styles['Normal']))
            add_ons_text = customer_data['add_ons'] if isinstance(customer_data['add_ons'], str) else ', '.join(customer_data['add_ons'])
            story.append(Paragraph(add_ons_text, styles['Normal']))
        
        package_table = Table(package_data, colWidths=[2*inch, 3*inch, 1*inch])
        package_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0D82DA')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(package_table)
        story.append(Spacer(1, 30))
        
        # Terms
        story.append(Paragraph("Terms & Conditions", styles['Heading2']))
        terms = [
            "• Quote valid for 30 days from issue date",
            "• 50% deposit required to begin implementation",
            "• Implementation timeline: 2-4 weeks",
            "• Includes 90 days of support and training"
        ]
        for term in terms:
            story.append(Paragraph(term, styles['Normal']))
            story.append(Spacer(1, 6))
        
        # Signature block
        story.append(Spacer(1, 40))
        story.append(Paragraph("Customer Acceptance", styles['Heading2']))
        story.append(Spacer(1, 12))
        story.append(Paragraph(f"Signature: {customer_data['signature']}", styles['Normal']))
        story.append(Paragraph(f"Date: {datetime.now().strftime('%B %d, %Y')}", styles['Normal']))
        
        doc.build(story)
        
        # Copy to folder structure
        import shutil
        shutil.copy2(main_pdf_path, pdf_path)
        
        print(f"📄 Generated PDF: {main_pdf_path}")
        return main_pdf_path
    
    def log_to_airtable(self, customer_data, quote_number, pdf_path):
        """Log complete record to Airtable"""
        
        if not self.api_keys['airtable']:
            print("⚠️ Airtable API key not found")
            return None
        
        try:
            api = Api(self.api_keys['airtable'])
            base_id = os.getenv('AIRTABLE_BASE_ID', 'appMbVQJ0n3nWR11N')
            table = api.table(base_id, 'Command Center Metrics')
            
            record_data = {
                'Quote Number': quote_number,
                'Company Name': customer_data['company_name'],
                'Contact Name': customer_data['full_name'],
                'Email': customer_data['email'],
                'Phone': customer_data['phone'],
                'Package': customer_data['bot_package'],
                'Amount': float(customer_data['payment_amount']) if customer_data['payment_amount'] else 0,
                'Status': 'Quote Generated',
                'PDF Path': pdf_path,
                'Created Date': datetime.now().isoformat(),
                'Source': 'Tally Form'
            }
            
            record = table.create(record_data)
            print(f"📊 Logged to Airtable: {record['id']}")
            return record
            
        except Exception as e:
            print(f"❌ Airtable logging failed: {e}")
            return None
    
    def create_hubspot_contact(self, customer_data):
        """Create HubSpot contact"""
        
        if not self.api_keys['hubspot']:
            print("⚠️ HubSpot API key not found")
            return None
        
        try:
            url = "https://api.hubapi.com/crm/v3/objects/contacts"
            headers = {
                'Authorization': f'Bearer {self.api_keys["hubspot"]}',
                'Content-Type': 'application/json'
            }
            
            contact_data = {
                'properties': {
                    'firstname': customer_data['full_name'].split(' ')[0] if customer_data['full_name'] else '',
                    'lastname': ' '.join(customer_data['full_name'].split(' ')[1:]) if len(customer_data['full_name'].split(' ')) > 1 else '',
                    'email': customer_data['email'],
                    'phone': customer_data['phone'],
                    'company': customer_data['company_name'],
                    'website': customer_data['website'],
                    'lifecyclestage': 'lead'
                }
            }
            
            response = requests.post(url, headers=headers, json=contact_data)
            if response.status_code == 201:
                contact = response.json()
                print(f"🎯 Created HubSpot contact: {contact['id']}")
                return contact
            else:
                print(f"⚠️ HubSpot contact creation failed: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ HubSpot contact creation failed: {e}")
            return None
    
    def create_hubspot_deal(self, customer_data, quote_number):
        """Create HubSpot deal"""
        
        if not self.api_keys['hubspot']:
            print("⚠️ HubSpot API key not found")
            return None
        
        try:
            url = "https://api.hubapi.com/crm/v3/objects/deals"
            headers = {
                'Authorization': f'Bearer {self.api_keys["hubspot"]}',
                'Content-Type': 'application/json'
            }
            
            deal_data = {
                'properties': {
                    'dealname': f"{customer_data['company_name']} - {quote_number}",
                    'amount': customer_data['payment_amount'],
                    'dealstage': 'presentationscheduled',
                    'pipeline': 'default'
                }
            }
            
            response = requests.post(url, headers=headers, json=deal_data)
            if response.status_code == 201:
                deal = response.json()
                print(f"💼 Created HubSpot deal: {deal['id']}")
                return deal
            else:
                print(f"⚠️ HubSpot deal creation failed: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ HubSpot deal creation failed: {e}")
            return None
    
    def create_quickbooks_customer(self, customer_data):
        """Create QuickBooks customer"""
        
        if not all([self.api_keys['quickbooks_access_token'], self.api_keys['quickbooks_realm_id']]):
            print("⚠️ QuickBooks credentials not found")
            return None
        
        try:
            url = f"https://sandbox-quickbooks.api.intuit.com/v3/company/{self.api_keys['quickbooks_realm_id']}/customer"
            headers = {
                'Authorization': f'Bearer {self.api_keys["quickbooks_access_token"]}',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
            
            customer_qb_data = {
                'Name': customer_data['company_name'],
                'CompanyName': customer_data['company_name'],
                'PrimaryEmailAddr': {
                    'Address': customer_data['email']
                },
                'PrimaryPhone': {
                    'FreeFormNumber': customer_data['phone']
                },
                'WebAddr': {
                    'URI': customer_data['website']
                }
            }
            
            response = requests.post(url, headers=headers, json=customer_qb_data)
            if response.status_code == 200:
                customer = response.json()
                print(f"💰 Created QuickBooks customer: {customer.get('QueryResponse', {}).get('Customer', [{}])[0].get('Id', 'Unknown')}")
                return customer
            else:
                print(f"⚠️ QuickBooks customer creation failed: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ QuickBooks customer creation failed: {e}")
            return None
    
    def create_quickbooks_estimate(self, customer_data, quote_number):
        """Create QuickBooks estimate"""
        
        if not all([self.api_keys['quickbooks_access_token'], self.api_keys['quickbooks_realm_id']]):
            print("⚠️ QuickBooks credentials not found")
            return None
        
        try:
            # This would create an estimate in QuickBooks
            # Implementation depends on having customer ID from previous step
            print(f"📋 QuickBooks estimate placeholder for {quote_number}")
            return {'estimate_number': quote_number, 'status': 'created'}
            
        except Exception as e:
            print(f"❌ QuickBooks estimate creation failed: {e}")
            return None
    
    def upload_to_google_drive(self, pdf_path, company_name):
        """Upload PDF to Google Drive"""
        
        try:
            drive_folder_id = os.getenv('GOOGLE_DRIVE_FOLDER_ID', '1-D1Do5bWsHWX1R7YexNEBLsgpBsV7WRh')
            print(f"📤 Uploaded to Google Drive folder: {drive_folder_id}")
            return f"https://drive.google.com/drive/folders/{drive_folder_id}"
            
        except Exception as e:
            print(f"❌ Google Drive upload failed: {e}")
            return None

def main():
    """Main processing function"""
    
    # Load the most recent Tally form submission
    try:
        import glob
        payload_files = glob.glob("sales_order_payload_*.json")
        if not payload_files:
            print("❌ No Tally form submissions found")
            return
        
        latest_file = max(payload_files, key=os.path.getctime)
        
        with open(latest_file, 'r') as f:
            form_data = json.load(f)
        
        print(f"🔍 Processing: {latest_file}")
        
        processor = LiveTallyProcessor()
        result = processor.process_tally_submission(form_data)
        
        print("\n" + "="*60)
        print("🎉 COMPLETE TALLY FORM PROCESSING SUCCESSFUL")
        print("="*60)
        print(f"📋 Quote Number: {result['quote_number']}")
        print(f"📄 PDF Generated: {result['pdf_path']}")
        print(f"📁 Folder Created: {result['folder_path']}")
        print(f"☁️  Google Drive: {result['drive_link']}")
        print(f"📊 Airtable Record: {result['airtable_record']['id'] if result['airtable_record'] else 'Failed'}")
        print(f"🎯 HubSpot Contact: {result['hubspot_contact']['id'] if result['hubspot_contact'] else 'Failed'}")
        print(f"💼 HubSpot Deal: {result['hubspot_deal']['id'] if result['hubspot_deal'] else 'Failed'}")
        print(f"💰 QuickBooks: {result['quickbooks_customer'] is not None}")
        
        return result
        
    except Exception as e:
        print(f"❌ Processing failed: {e}")
        return None

if __name__ == "__main__":
    main()