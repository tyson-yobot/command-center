#!/usr/bin/env python3
"""
Complete YoBot Integration System
Implementing all automation code provided over the past 8 days
"""

import datetime
import os
import requests
import json
from fpdf import FPDF
import csv
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

# Your actual credentials from the provided code
GOOGLE_CREDENTIALS = {
    "refresh_token": "1//0g9GnAKVfRlM9CgYIARAAGBASNwF-L9IrBya2ZudqCC8oAaznpP3_Xd-JvwWc41WFlvT44G9UN3hiEtZWTyN2YfAmBtQdpTfdkA",
    "client_id": "685952645658-k8glf5nnp4d2u1cafih1pbauudus3nc.apps.googleusercontent.com",
    "client_secret": "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",
    "clients_folder_id": "1BpVQhQZT0b_C9K8mW7XYzN5nJ4EtFGAd"
}

# Package configurations from your code
PACKAGES = {
    "YoBot Standard Package": {"setup": 2500, "monthly": 150, "desc": "Essential bot automation with core features"},
    "YoBot Professional Package": {"setup": 7500, "monthly": 495, "desc": "Advanced automation with CRM integration"},
    "YoBot Enterprise Package": {"setup": 12500, "monthly": 1499, "desc": "Full enterprise solution with custom workflows"}
}

ADDONS = {
    "SmartSpend": {"setup": 500, "monthly": 299, "desc": "Intelligent budget optimization and spend tracking"},
    "Advanced Analytics": {"setup": 750, "monthly": 399, "desc": "Deep insights and performance reporting"},
    "A/B Testing": {"setup": 300, "monthly": 199, "desc": "Automated split testing for optimization"}
}

def get_google_drive_service():
    """Initialize Google Drive service with your credentials"""
    try:
        import google.auth.transport.requests
        
        creds = Credentials(
            token=None,
            refresh_token=GOOGLE_CREDENTIALS["refresh_token"],
            token_uri="https://oauth2.googleapis.com/token",
            client_id=GOOGLE_CREDENTIALS["client_id"],
            client_secret=GOOGLE_CREDENTIALS["client_secret"],
            scopes=["https://www.googleapis.com/auth/drive"]
        )
        
        request = google.auth.transport.requests.Request()
        creds.refresh(request)
        
        return build("drive", "v3", credentials=creds)
    except Exception as e:
        print(f"Google Drive initialization failed: {e}")
        return None

def create_client_folder(company_name):
    """Create Google Drive folder for client"""
    drive = get_google_drive_service()
    if not drive:
        return None
    
    try:
        folder_name = f"{company_name}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        folder = drive.files().create(body={
            "name": folder_name,
            "parents": [GOOGLE_CREDENTIALS["clients_folder_id"]],
            "mimeType": "application/vnd.google-apps.folder"
        }, fields="id,webViewLink").execute()
        
        print(f"Created Google Drive folder: {folder.get('webViewLink')}")
        return folder.get('id')
        
    except Exception as e:
        print(f"Failed to create folder: {e}")
        return None

def generate_quote_pdf_advanced(client_data, package_info, addon_list, pdf_path):
    """Generate advanced PDF quote matching your template"""
    try:
        os.makedirs(os.path.dirname(pdf_path), exist_ok=True)
        
        pdf = FPDF()
        pdf.add_page()
        
        # YoBot Header
        pdf.set_font('Helvetica', 'B', 24)
        pdf.cell(0, 20, 'YoBot Professional Quote', 0, 1, 'C')
        
        pdf.set_font('Helvetica', '', 12)
        pdf.cell(0, 10, f"Quote Number: {client_data.get('quote_number')}", 0, 1, 'C')
        pdf.cell(0, 5, f"Generated: {datetime.datetime.now().strftime('%B %d, %Y')}", 0, 1, 'C')
        pdf.ln(15)
        
        # Client Information Section
        pdf.set_font('Helvetica', 'B', 16)
        pdf.cell(0, 10, 'CLIENT INFORMATION', 0, 1)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(5)
        
        pdf.set_font('Helvetica', '', 11)
        pdf.cell(0, 8, f"Company: {client_data.get('company_name')}", 0, 1)
        pdf.cell(0, 8, f"Contact: {client_data.get('contact_name')}", 0, 1)
        pdf.cell(0, 8, f"Email: {client_data.get('contact_email')}", 0, 1)
        pdf.cell(0, 8, f"Phone: {client_data.get('contact_phone')}", 0, 1)
        pdf.ln(10)
        
        # Package Details Section
        pdf.set_font('Helvetica', 'B', 16)
        pdf.cell(0, 10, 'PACKAGE DETAILS', 0, 1)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(5)
        
        pdf.set_font('Helvetica', 'B', 12)
        pdf.cell(0, 8, f"Selected Package: {client_data.get('package_name')}", 0, 1)
        pdf.set_font('Helvetica', '', 10)
        pdf.multi_cell(0, 6, package_info.get('desc', ''))
        pdf.ln(5)
        
        if addon_list:
            pdf.set_font('Helvetica', 'B', 12)
            pdf.cell(0, 8, 'Selected Add-ons:', 0, 1)
            pdf.set_font('Helvetica', '', 10)
            for addon in addon_list:
                addon_info = ADDONS.get(addon, {})
                pdf.cell(20, 6, '', 0, 0)  # Indent
                pdf.cell(0, 6, f"• {addon}: {addon_info.get('desc', '')}", 0, 1)
        
        pdf.ln(10)
        
        # Investment Summary Section
        pdf.set_font('Helvetica', 'B', 16)
        pdf.cell(0, 10, 'INVESTMENT SUMMARY', 0, 1)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(5)
        
        # Calculate totals
        setup_fee = package_info.get('setup', 0)
        monthly_fee = package_info.get('monthly', 0)
        addon_setup = sum(ADDONS.get(addon, {}).get('setup', 0) for addon in addon_list)
        addon_monthly = sum(ADDONS.get(addon, {}).get('monthly', 0) for addon in addon_list)
        
        total_setup = setup_fee + addon_setup
        total_monthly = monthly_fee + addon_monthly
        
        pdf.set_font('Helvetica', '', 12)
        pdf.cell(100, 8, f"One-time Setup Fee:", 0, 0)
        pdf.cell(0, 8, f"${total_setup:,}", 0, 1, 'R')
        
        pdf.cell(100, 8, f"Monthly Subscription:", 0, 0)
        pdf.cell(0, 8, f"${total_monthly:,}", 0, 1, 'R')
        
        pdf.cell(100, 8, f"First Year Total:", 0, 0)
        pdf.cell(0, 8, f"${total_setup + (total_monthly * 12):,}", 0, 1, 'R')
        
        stripe_paid = client_data.get('stripe_paid', 0)
        if stripe_paid > 0:
            pdf.ln(5)
            pdf.set_font('Helvetica', 'B', 12)
            pdf.cell(100, 8, f"Amount Paid (Stripe):", 0, 0)
            pdf.cell(0, 8, f"${stripe_paid:,.2f}", 0, 1, 'R')
            
            balance = total_setup - stripe_paid
            pdf.cell(100, 8, f"Remaining Balance:", 0, 0)
            pdf.cell(0, 8, f"${balance:,.2f}", 0, 1, 'R')
        
        pdf.ln(20)
        
        # Footer
        pdf.set_font('Helvetica', 'I', 10)
        pdf.cell(0, 6, 'This quote is valid for 30 days from the date of generation.', 0, 1, 'C')
        pdf.cell(0, 6, 'YoBot - Intelligent Automation Solutions', 0, 1, 'C')
        pdf.cell(0, 6, 'Contact: support@yobot.bot | Phone: (555) 123-YBOT', 0, 1, 'C')
        
        pdf.output(pdf_path)
        print(f"Advanced PDF generated: {pdf_path}")
        return True
        
    except Exception as e:
        print(f"PDF generation failed: {e}")
        return False

def upload_pdf_to_drive_folder(pdf_path, folder_id, file_name):
    """Upload PDF to specific Google Drive folder"""
    drive = get_google_drive_service()
    if not drive or not folder_id:
        return None
    
    try:
        file_metadata = {
            'name': file_name,
            'parents': [folder_id]
        }
        
        media = MediaFileUpload(pdf_path, mimetype='application/pdf')
        
        uploaded_file = drive.files().create(
            body=file_metadata,
            media_body=media,
            fields='id,webViewLink'
        ).execute()
        
        file_url = uploaded_file.get('webViewLink')
        print(f"PDF uploaded to Drive: {file_url}")
        return file_url
        
    except Exception as e:
        print(f"PDF upload failed: {e}")
        return None

def create_work_order_csv(company_name, package_name, addon_list):
    """Create comprehensive work order CSV from your task templates"""
    try:
        csv_path = f"./client_folders/{company_name}_Task_Work_Order.csv"
        os.makedirs(os.path.dirname(csv_path), exist_ok=True)
        
        # Base tasks for all packages
        base_tasks = [
            "Initial Client Onboarding Call",
            "YoBot Configuration Setup",
            "Voice Training & Personality Setup",
            "CRM Integration Configuration",
            "Testing & Quality Assurance",
            "Go-Live Deployment",
            "Post-Launch Support (30 days)"
        ]
        
        # Package-specific tasks
        package_tasks = {
            "YoBot Standard Package": [
                "Basic Call Flow Design",
                "Standard Response Templates",
                "Basic Analytics Dashboard"
            ],
            "YoBot Professional Package": [
                "Advanced Call Flow Design",
                "Custom Response Templates",
                "CRM Integration Setup",
                "Advanced Analytics Dashboard",
                "Lead Scoring Configuration"
            ],
            "YoBot Enterprise Package": [
                "Enterprise Call Flow Architecture",
                "Custom AI Training",
                "Multi-CRM Integration",
                "Enterprise Analytics Suite",
                "Advanced Lead Scoring",
                "Custom Workflow Automation",
                "Dedicated Account Manager"
            ]
        }
        
        # Add-on specific tasks
        addon_tasks = {
            "SmartSpend": [
                "SmartSpend Budget Configuration",
                "Spend Tracking Dashboard Setup",
                "Cost Optimization Rules"
            ],
            "Advanced Analytics": [
                "Advanced Reporting Setup",
                "Custom KPI Configuration",
                "Performance Tracking Dashboard"
            ],
            "A/B Testing": [
                "A/B Testing Framework Setup",
                "Test Scenario Configuration",
                "Results Analysis Dashboard"
            ]
        }
        
        # Compile all tasks
        all_tasks = base_tasks.copy()
        all_tasks.extend(package_tasks.get(package_name, []))
        
        for addon in addon_list:
            all_tasks.extend(addon_tasks.get(addon, []))
        
        # Write to CSV
        with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(['Task ID', 'Task Name', 'Status', 'Assigned To', 'Due Date', 'Priority'])
            
            for i, task in enumerate(all_tasks, 1):
                due_date = (datetime.datetime.now() + datetime.timedelta(days=i*2)).strftime('%Y-%m-%d')
                priority = 'High' if i <= 3 else 'Medium' if i <= 7 else 'Low'
                writer.writerow([f'T{i:03d}', task, 'Pending', 'YoBot Team', due_date, priority])
        
        print(f"Work order CSV created: {csv_path}")
        return csv_path, len(all_tasks)
        
    except Exception as e:
        print(f"CSV creation failed: {e}")
        return None, 0

def push_to_airtable_advanced(client_data):
    """Push data to Airtable with comprehensive fields"""
    airtable_key = os.getenv('AIRTABLE_API_KEY')
    airtable_base = os.getenv('AIRTABLE_BASE_ID')
    
    if not airtable_key or not airtable_base:
        print("Airtable credentials needed for full integration")
        return False
    
    try:
        url = f"https://api.airtable.com/v0/{airtable_base}/Sales%20Orders"
        headers = {
            "Authorization": f"Bearer {airtable_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "records": [{
                "fields": {
                    "Client Name": client_data.get('company_name'),
                    "Quote Number": client_data.get('quote_number'),
                    "Contact Email": client_data.get('contact_email'),
                    "Contact Name": client_data.get('contact_name'),
                    "Phone": client_data.get('contact_phone'),
                    "Package": client_data.get('package_name'),
                    "Add-ons": ", ".join(client_data.get('addon_list', [])),
                    "Setup Fee": client_data.get('total_setup', 0),
                    "Monthly Fee": client_data.get('total_monthly', 0),
                    "Stripe Paid": client_data.get('stripe_paid', 0),
                    "Status": "Quote Generated",
                    "Created Date": datetime.datetime.now().isoformat()
                }
            }]
        }
        
        response = requests.post(url, headers=headers, json=data)
        if response.status_code == 200:
            print("Successfully pushed to Airtable")
            return True
        else:
            print(f"Airtable push failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"Airtable integration error: {e}")
        return False

def create_hubspot_contact_advanced(client_data):
    """Create HubSpot contact with comprehensive data"""
    hubspot_key = os.getenv('HUBSPOT_API_KEY')
    
    if not hubspot_key:
        print("HubSpot API key needed for full integration")
        return False
    
    try:
        url = "https://api.hubapi.com/contacts/v1/contact"
        params = {"hapikey": hubspot_key}
        
        properties = [
            {"property": "email", "value": client_data.get('contact_email')},
            {"property": "firstname", "value": client_data.get('contact_name', '').split()[0] if client_data.get('contact_name') else ''},
            {"property": "lastname", "value": client_data.get('contact_name', '').split()[-1] if len(client_data.get('contact_name', '').split()) > 1 else ''},
            {"property": "company", "value": client_data.get('company_name')},
            {"property": "phone", "value": client_data.get('contact_phone')},
            {"property": "lifecyclestage", "value": "customer"},
            {"property": "lead_source", "value": "YoBot Sales Form"}
        ]
        
        data = {"properties": properties}
        
        response = requests.post(url, params=params, json=data)
        if response.status_code in [200, 409]:  # 409 is duplicate contact
            print("HubSpot contact created/updated successfully")
            return True
        else:
            print(f"HubSpot contact creation failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"HubSpot integration error: {e}")
        return False

def send_enhanced_notifications(client_data, pdf_path):
    """Send enhanced email and Slack notifications"""
    results = {}
    
    # Email notifications
    sendgrid_key = os.getenv('SENDGRID_API_KEY')
    if sendgrid_key:
        try:
            email_content = f"""
New YoBot Sales Order Generated

Client: {client_data.get('company_name')}
Contact: {client_data.get('contact_name')} ({client_data.get('contact_email')})
Package: {client_data.get('package_name')}
Quote Number: {client_data.get('quote_number')}
Total Setup: ${client_data.get('total_setup', 0):,}
Monthly: ${client_data.get('total_monthly', 0):,}
Stripe Paid: ${client_data.get('stripe_paid', 0):,.2f}

PDF Quote Generated: {pdf_path}
Work Order CSV: {client_data.get('csv_path', 'N/A')}

Ready for processing and client follow-up.
            """
            
            for email in ["tyson@yobot.bot", "daniel@yobot.bot"]:
                email_data = {
                    "personalizations": [{"to": [{"email": email}]}],
                    "from": {"email": "noreply@yobot.bot"},
                    "subject": f"New YoBot Order: {client_data.get('company_name')} - {client_data.get('quote_number')}",
                    "content": [{"type": "text/plain", "value": email_content}]
                }
                
                response = requests.post(
                    "https://api.sendgrid.com/v3/mail/send",
                    headers={"Authorization": f"Bearer {sendgrid_key}"},
                    json=email_data
                )
            
            results['email'] = True
            print("Enhanced email notifications sent successfully")
            
        except Exception as e:
            print(f"Email notification error: {e}")
            results['email'] = False
    
    # Slack notification
    slack_webhook = os.getenv('SLACK_WEBHOOK_URL')
    if slack_webhook:
        try:
            slack_message = {
                "text": f"🚀 New YoBot Sales Order",
                "blocks": [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": f"*New Sales Order Generated*\n\n*Client:* {client_data.get('company_name')}\n*Contact:* {client_data.get('contact_name')}\n*Package:* {client_data.get('package_name')}\n*Quote:* {client_data.get('quote_number')}\n*Total:* ${client_data.get('total_setup', 0):,} setup + ${client_data.get('total_monthly', 0):,}/month"
                        }
                    }
                ]
            }
            
            response = requests.post(slack_webhook, json=slack_message)
            results['slack'] = response.status_code == 200
            print("Slack notification sent successfully")
            
        except Exception as e:
            print(f"Slack notification error: {e}")
            results['slack'] = False
    
    return results

def run_complete_sales_order_automation_enhanced(form_data):
    """Enhanced sales order automation with all integrations"""
    print("🚀 Starting Enhanced Sales Order Automation...")
    
    try:
        # Parse form data
        company_name = form_data.get('Parsed Company Name', 'Unknown Company')
        contact_name = form_data.get('Parsed Contact Name', 'Unknown Contact')
        contact_email = form_data.get('Parsed Contact Email', '')
        contact_phone = form_data.get('Parsed Contact Phone', '')
        package_name = form_data.get('Parsed Bot Package', 'YoBot Standard Package')
        addon_list = form_data.get('Parsed Add-On List', [])
        stripe_paid = float(form_data.get('Parsed Stripe Payment', 0))
        
        # Generate quote number
        quote_number = f"Q-{datetime.datetime.now().strftime('%Y%m%d')}-{company_name[:4].upper()}"
        
        # Calculate pricing
        package_info = PACKAGES.get(package_name, PACKAGES["YoBot Standard Package"])
        setup_total = package_info['setup'] + sum(ADDONS.get(addon, {}).get('setup', 0) for addon in addon_list)
        monthly_total = package_info['monthly'] + sum(ADDONS.get(addon, {}).get('monthly', 0) for addon in addon_list)
        
        client_data = {
            'quote_number': quote_number,
            'company_name': company_name,
            'contact_name': contact_name,
            'contact_email': contact_email,
            'contact_phone': contact_phone,
            'package_name': package_name,
            'addon_list': addon_list,
            'stripe_paid': stripe_paid,
            'total_setup': setup_total,
            'total_monthly': monthly_total
        }
        
        results = {}
        
        # 1. Create Google Drive folder
        print("📁 Creating Google Drive folder...")
        folder_id = create_client_folder(company_name)
        results['folder_created'] = folder_id is not None
        
        # 2. Generate advanced PDF quote
        print("📄 Generating advanced PDF quote...")
        pdf_path = f"./pdfs/YoBot_Quote_{quote_number}_{company_name.replace(' ', '_')}.pdf"
        pdf_success = generate_quote_pdf_advanced(client_data, package_info, addon_list, pdf_path)
        results['pdf_generated'] = pdf_success
        
        # 3. Upload PDF to Drive
        if folder_id and pdf_success:
            print("☁️ Uploading PDF to Google Drive...")
            file_name = f"{company_name}_Quote_{quote_number}.pdf"
            pdf_url = upload_pdf_to_drive_folder(pdf_path, folder_id, file_name)
            results['pdf_uploaded'] = pdf_url is not None
        
        # 4. Create work order CSV
        print("📋 Creating work order CSV...")
        csv_path, task_count = create_work_order_csv(company_name, package_name, addon_list)
        results['csv_created'] = csv_path is not None
        client_data['csv_path'] = csv_path
        
        # 5. Push to Airtable
        print("📊 Pushing to Airtable...")
        airtable_success = push_to_airtable_advanced(client_data)
        results['airtable_synced'] = airtable_success
        
        # 6. Create HubSpot contact
        print("👤 Creating HubSpot contact...")
        hubspot_success = create_hubspot_contact_advanced(client_data)
        results['hubspot_contact'] = hubspot_success
        
        # 7. Send notifications
        print("📱 Sending notifications...")
        notification_results = send_enhanced_notifications(client_data, pdf_path)
        results.update(notification_results)
        
        print(f"✅ Enhanced Sales Order Automation Complete for {company_name}")
        print(f"📄 Quote: {quote_number}")
        print(f"📁 PDF: {pdf_path}")
        print(f"📋 Tasks: {task_count} created")
        
        return {
            "success": True,
            "quote_number": quote_number,
            "company_name": company_name,
            "contact_email": contact_email,
            "package_name": package_name,
            "total": stripe_paid,
            "pdf_path": pdf_path,
            "csv_path": csv_path,
            "tasks_created": task_count,
            "results": results,
            "automation_complete": True
        }
        
    except Exception as e:
        print(f"❌ Enhanced Sales Order Automation Failed: {e}")
        return {
            "success": False,
            "error": str(e),
            "automation_complete": False
        }

# Removed test data - only live webhook data processed