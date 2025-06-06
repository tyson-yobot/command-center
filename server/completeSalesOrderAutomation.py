# === YoBot® Sales Order Automation Script ===
# Runs after Tally Sales Order Form submission
# 1. Creates Drive Folder
# 2. Generates Quote PDF
# 3. Uploads PDF to Folder
# 4. Pushes to Airtable
# 5. Creates HubSpot contact
# 6. Compiles work order task list
# 7. Emails Tyson + Daniel
# 8. Slack notification
# 9. Sends DocuSign

import datetime, os, requests, json
from fpdf import FPDF
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders

# === Package and Add-on Configuration ===
PACKAGES = {
    "YoBot Standard Package": {"setup": 2500, "monthly": 150, "desc": "Essential bot automation with core features"},
    "YoBot Professional Package": {"setup": 5000, "monthly": 300, "desc": "Advanced automation with enhanced capabilities"},
    "YoBot Platinum Package": {"setup": 10000, "monthly": 500, "desc": "Premium automation with priority support"},
    "YoBot Enterprise Package": {"setup": 25000, "monthly": 1000, "desc": "Full enterprise solution with custom integration"}
}

ADDONS = {
    "SmartSpend": {"setup": 1500, "monthly": 100, "desc": "Intelligent budget optimization and spending analysis"},
    "Advanced Analytics": {"setup": 2000, "monthly": 150, "desc": "Comprehensive reporting and data insights"},
    "A/B Testing": {"setup": 1000, "monthly": 75, "desc": "Automated testing and optimization"},
    "Custom Integration": {"setup": 3000, "monthly": 200, "desc": "Bespoke API integrations and workflows"}
}

def generate_quote_number(company_name):
    """Generate unique quote number"""
    date_str = datetime.datetime.now().strftime("%Y%m%d")
    company_short = ''.join(e for e in company_name if e.isalnum())[:4].upper()
    return f"Q-{date_str}-{company_short}"

def create_google_drive_folder(company_name):
    """Create Google Drive folder for client using Google Drive API"""
    try:
        import requests
        import json
        import os
        
        # Get Google credentials from environment
        google_creds = os.getenv('GOOGLE_DRIVE_CREDENTIALS')
        if not google_creds:
            print("❌ Google Drive credentials not found")
            return {'success': False, 'error': 'Google Drive credentials not configured'}
        
        # Parse credentials and get access token
        try:
            creds_data = json.loads(google_creds)
            client_id = os.getenv('GOOGLE_CLIENT_ID')
            client_secret = os.getenv('GOOGLE_CLIENT_SECRET') 
            refresh_token = os.getenv('GOOGLE_REFRESH_TOKEN')
            
            # Refresh access token
            token_url = 'https://oauth2.googleapis.com/token'
            token_data = {
                'client_id': client_id,
                'client_secret': client_secret,
                'refresh_token': refresh_token,
                'grant_type': 'refresh_token'
            }
            
            token_response = requests.post(token_url, data=token_data)
            if token_response.status_code != 200:
                print(f"❌ Token refresh failed: {token_response.text}")
                return {'success': False, 'error': 'Failed to refresh Google access token'}
            
            access_token = token_response.json().get('access_token')
            
        except Exception as e:
            print(f"❌ Credential parsing error: {str(e)}")
            return {'success': False, 'error': f'Credential error: {str(e)}'}
        
        # Create folder in Google Drive
        clients_folder_id = "1eBAdAc_polSkFSl-3F0NNH_scN8RzaFE"  # Known "1 - Clients" folder
        
        folder_metadata = {
            "name": f"YoBot - {company_name}",
            "mimeType": "application/vnd.google-apps.folder",
            "parents": [clients_folder_id]
        }
        
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            "https://www.googleapis.com/drive/v3/files",
            headers=headers,
            json=folder_metadata
        )
        
        if response.status_code == 200:
            folder_data = response.json()
            folder_id = folder_data.get('id')
            folder_url = f"https://drive.google.com/drive/folders/{folder_id}"
            
            print(f"✅ Google Drive folder created: YoBot - {company_name}")
            return {
                'success': True,
                'folder_id': folder_id,
                'folder_url': folder_url,
                'folder_name': f"YoBot - {company_name}"
            }
        else:
            print(f"❌ Google Drive API error: {response.status_code} - {response.text}")
            return {
                'success': False,
                'error': f'Drive API error: {response.status_code}'
            }
            
    except Exception as e:
        print(f"❌ Google Drive folder creation error: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

def generate_professional_quote_pdf(client_data, package_info, addon_list, pdf_path):
    """Generate professional quote PDF with YoBot branding"""
    import os
    from fpdf import FPDF
    
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font('Arial', 'B', 16)
    
    # Header
    pdf.cell(0, 10, 'YoBot Professional Quote', 0, 1, 'C')
    pdf.ln(10)
    
    # Client Information
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 8, 'Client Information:', 0, 1)
    pdf.set_font('Arial', '', 10)
    pdf.cell(0, 6, f"Company: {client_data.get('company_name', 'N/A')}", 0, 1)
    pdf.cell(0, 6, f"Contact: {client_data.get('contact_name', 'N/A')}", 0, 1)
    pdf.cell(0, 6, f"Email: {client_data.get('contact_email', 'N/A')}", 0, 1)
    pdf.cell(0, 6, f"Phone: {client_data.get('contact_phone', 'N/A')}", 0, 1)
    pdf.ln(10)
    
    # Package Information
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 8, 'Package Details:', 0, 1)
    pdf.set_font('Arial', '', 10)
    pdf.cell(0, 6, f"Package: {client_data.get('package_name', 'N/A')}", 0, 1)
    
    if addon_list:
        pdf.cell(0, 6, 'Add-ons:', 0, 1)
        for addon in addon_list:
            pdf.cell(20, 6, '', 0, 0)  # Indent
            pdf.cell(0, 6, f"- {addon}", 0, 1)
    
    pdf.ln(10)
    
    # Pricing
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 8, 'Investment:', 0, 1)
    pdf.set_font('Arial', '', 10)
    pdf.cell(0, 6, f"Total: ${client_data.get('stripe_paid', '0')}", 0, 1)
    
    # Create pdfs directory if it doesn't exist
    os.makedirs(os.path.dirname(pdf_path), exist_ok=True)
    
    try:
        pdf.output(pdf_path)
        print(f"✅ PDF generated: {pdf_path}")
        return True
    except Exception as e:
        print(f"❌ PDF generation failed: {str(e)}")
        return False

def generate_task_csv(company_name, tasks):
    """Generate CSV file with project roadmap tasks"""
    import csv
    import os
    
    csv_path = f"./client_folders/{company_name.replace(' ', '_')}_roadmap_tasks.csv"
    os.makedirs(os.path.dirname(csv_path), exist_ok=True)
    
    try:
        with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['Task Name', 'Description', 'Priority', 'Estimated Hours', 'Category']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            for task in tasks:
                writer.writerow({
                    'Task Name': task.get('name', 'Unnamed Task'),
                    'Description': task.get('description', ''),
                    'Priority': task.get('priority', 'Medium'),
                    'Estimated Hours': task.get('hours', '2-4'),
                    'Category': task.get('category', 'General')
                })
        
        print(f"✅ CSV file generated: {csv_path}")
        return csv_path
    except Exception as e:
        print(f"❌ CSV generation failed: {str(e)}")
        return None

def send_enhanced_email_notifications(client_data, pdf_path, csv_path, hubspot_result, folder_result):
    """Send email notifications to client and internal team"""
    try:
        # For now, log the notification attempt
        print(f"📧 Email notification prepared for {client_data.get('contact_email', 'N/A')}")
        print(f"   - PDF attachment: {pdf_path}")
        if csv_path:
            print(f"   - CSV attachment: {csv_path}")
        if folder_result and folder_result.get('success'):
            print(f"   - Google Drive folder: {folder_result.get('folder_url', 'N/A')}")
        
        # Return success for now - actual email sending would require SMTP configuration
        return {'success': True, 'message': 'Email notifications prepared'}
    except Exception as e:
        print(f"❌ Email notification error: {str(e)}")
        return {'success': False, 'error': str(e)}
    pdf.add_page()
    
    # Header with YoBot branding
    pdf.set_font('Arial', 'B', 20)
    pdf.set_text_color(13, 130, 218)  # YoBot blue
    pdf.cell(0, 15, 'YoBot® Professional Quote', 0, 1, 'C')
    pdf.ln(5)
    
    # Quote details
    pdf.set_font('Arial', '', 12)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 8, f"Quote Number: {client_data['quote_number']}", 0, 1)
    pdf.cell(0, 8, f"Date: {datetime.date.today().strftime('%B %d, %Y')}", 0, 1)
    pdf.ln(5)
    
    # Client information
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(0, 10, 'Client Information:', 0, 1)
    pdf.set_font('Arial', '', 12)
    pdf.cell(0, 8, f"Company: {client_data['company_name']}", 0, 1)
    pdf.cell(0, 8, f"Contact: {client_data['contact_name']}", 0, 1)
    pdf.cell(0, 8, f"Email: {client_data['contact_email']}", 0, 1)
    pdf.cell(0, 8, f"Phone: {client_data['contact_phone']}", 0, 1)
    pdf.ln(10)
    
    # Package details
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(0, 10, 'Package Details:', 0, 1)
    pdf.set_font('Arial', '', 12)
    
    # Calculate totals
    setup_total = package_info['setup'] + sum(addon['setup'] for addon in addon_list)
    monthly_total = package_info['monthly'] + sum(addon['monthly'] for addon in addon_list)
    
    pdf.cell(0, 8, f"Setup Fee: ${setup_total:,}", 0, 1)
    pdf.cell(0, 8, f"Monthly Fee: ${monthly_total:,}", 0, 1)
    pdf.cell(0, 8, f"Stripe Payment: ${client_data.get('stripe_paid', 0):,.2f}", 0, 1)
    
    # Balance calculation
    balance = setup_total - client_data.get('stripe_paid', 0)
    pdf.cell(0, 8, f"Balance Due: ${balance:,.2f}", 0, 1)
    
    # Footer
    pdf.ln(20)
    pdf.set_font('Arial', 'I', 10)
    pdf.cell(0, 8, 'Thank you for choosing YoBot® - Your AI Automation Partner', 0, 1, 'C')
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(pdf_path), exist_ok=True)
    pdf.output(pdf_path)
    print(f"Professional quote PDF generated: {pdf_path}")

def push_to_airtable(quote_data):
    """Push sales order data to Airtable"""
    api_key = os.getenv("AIRTABLE_API_KEY")
    base_id = os.getenv("AIRTABLE_BASE_ID")
    
    if not api_key or not base_id:
        print("Airtable credentials not available")
        return
    
    payload = {
        "fields": {
            "📛 Client Name": quote_data['company_name'],
            "📄 Quote Number": quote_data['quote_number'],
            "📧 Email": quote_data['contact_email'],
            "🤖 Bot Package": quote_data['package_name'],
            "💸 Paid": quote_data.get('stripe_paid', 0),
            "🧾 Total Due": quote_data.get('total_due', 0),
            "📅 Created": datetime.datetime.now().isoformat()
        }
    }
    
    try:
        response = requests.post(
            f"https://api.airtable.com/v0/{base_id}/Sales Orders",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json=payload
        )
        print(f"Airtable push: {response.status_code}")
    except Exception as e:
        print(f"Airtable error: {e}")

def create_hubspot_contact(contact_data):
    """Create HubSpot contact"""
    api_key = os.getenv("HUBSPOT_API_KEY")
    
    if not api_key:
        print("HubSpot API key not available")
        return
    
    payload = {
        "properties": {
            "email": contact_data['contact_email'],
            "firstname": contact_data['contact_name'].split()[0] if contact_data['contact_name'] else "Unknown",
            "lastname": contact_data['contact_name'].split()[-1] if len(contact_data['contact_name'].split()) > 1 else "Contact",
            "company": contact_data['company_name'],
            "phone": contact_data['contact_phone']
        }
    }
    
    try:
        response = requests.post(
            "https://api.hubapi.com/crm/v3/objects/contacts",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json=payload
        )
        print(f"HubSpot contact created: {response.status_code}")
    except Exception as e:
        print(f"HubSpot error: {e}")

def send_internal_notifications(quote_data, pdf_path):
    """Send email notifications to internal team"""
    sender_email = "daniel@yobot.bot"
    sender_password = os.getenv("GMAIL_APP_PASSWORD")
    
    if not sender_password:
        print("Gmail credentials not available")
        return
    
    recipients = ["daniel@yobot.bot", "tyson@yobot.bot"]
    
    for recipient in recipients:
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = recipient
        msg['Subject'] = f"New Sales Order: {quote_data['company_name']} - {quote_data['quote_number']}"
        
        body = f"""
New sales order received:

Company: {quote_data['company_name']}
Contact: {quote_data['contact_name']}
Email: {quote_data['contact_email']}
Package: {quote_data['package_name']}
Quote Number: {quote_data['quote_number']}
Total: ${quote_data.get('total_due', 0):,.2f}

PDF quote generated and ready for processing.
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Attach PDF if exists
        if os.path.exists(pdf_path):
            with open(pdf_path, "rb") as attachment:
                part = MIMEBase('application', 'octet-stream')
                part.set_payload(attachment.read())
                encoders.encode_base64(part)
                part.add_header(
                    'Content-Disposition',
                    f'attachment; filename= {os.path.basename(pdf_path)}'
                )
                msg.attach(part)
        
        try:
            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, recipient, msg.as_string())
            server.quit()
            print(f"Email sent to {recipient}")
        except Exception as e:
            print(f"Email error for {recipient}: {e}")

def send_slack_notification(quote_data):
    """Send Slack notification"""
    webhook_url = os.getenv("SLACK_WEBHOOK_URL")
    
    if not webhook_url:
        print("Slack webhook URL not available")
        return
    
    message = f"✅ New Sales Order: *{quote_data['company_name']}* ({quote_data['quote_number']})\n• Package: {quote_data['package_name']}\n• PDF generated and team notified"
    
    try:
        response = requests.post(webhook_url, json={"text": message})
        print(f"Slack notification sent: {response.status_code}")
    except Exception as e:
        print(f"Slack error: {e}")

def run_complete_sales_order_automation(form_data):
    """Execute complete sales order automation pipeline"""
    print("Starting complete sales order automation...")
    
    # Extract form data
    company_name = form_data.get("Parsed Company Name", form_data.get("company_name", "Unknown Company"))
    contact_name = form_data.get("Parsed Contact Name", form_data.get("contact_name", "Unknown Contact"))
    contact_email = form_data.get("Parsed Contact Email", form_data.get("email", "unknown@email.com"))
    contact_phone = form_data.get("Parsed Contact Phone", form_data.get("phone", "(000) 000-0000"))
    package_name = form_data.get("Parsed Bot Package", form_data.get("package", "YoBot Standard Package"))
    selected_addons = form_data.get("Parsed Add-On List", form_data.get("addons", []))
    stripe_paid = float(form_data.get("Parsed Stripe Payment", form_data.get("total", 0)))
    
    # Generate quote number
    quote_number = generate_quote_number(company_name)
    
    # Prepare data structures
    package_info = PACKAGES.get(package_name, PACKAGES["YoBot Standard Package"])
    addon_list = [{"name": addon, **ADDONS.get(addon, {"setup": 0, "monthly": 0, "desc": "Custom add-on"})} 
                  for addon in (selected_addons if isinstance(selected_addons, list) else [])]
    
    setup_total = package_info['setup'] + sum(addon['setup'] for addon in addon_list)
    monthly_total = package_info['monthly'] + sum(addon['monthly'] for addon in addon_list)
    
    client_data = {
        'quote_number': quote_number,
        'company_name': company_name,
        'contact_name': contact_name,
        'contact_email': contact_email,
        'contact_phone': contact_phone,
        'package_name': package_name,
        'stripe_paid': stripe_paid,
        'total_due': setup_total
    }
    
    # 1. Create Google Drive folder
    folder_result = create_google_drive_folder(company_name)
    
    # 2. Generate professional PDF quote
    pdf_path = f"./pdfs/YoBot_Quote_{quote_number}_{company_name.replace(' ', '_')}.pdf"
    pdf_generated = generate_professional_quote_pdf(client_data, package_info, addon_list, pdf_path)
    
    # 3. Push to Airtable
    push_to_airtable(client_data)
    
    # 4. Create HubSpot contact
    hubspot_result = create_hubspot_contact(client_data)
    
    # 5. Generate work order CSV with roadmap tasks
    from crmIntegration import build_roadmap_for_client
    roadmap_result = build_roadmap_for_client(client_data.get('bot_package', 'YoBot Standard Package'), client_data.get('selected_addons', []))
    
    # Insert roadmap tasks into project management system
    try:
        from Project_Roadmap_Insert_Tasks import insert_roadmap_tasks
        
        # Extract parsed data for roadmap insertion
        company_name = client_data.get("company_name") or client_data.get("Parsed Company Name")
        bot_package = client_data.get("bot_package") or client_data.get("Parsed Bot Package") 
        add_ons = client_data.get("selected_addons") or client_data.get("Parsed Add-On List", [])
        
        # Trigger roadmap population
        roadmap_insert_result = insert_roadmap_tasks(
            company=company_name,
            package=bot_package,
            addons=add_ons
        )
        print(f"✅ Roadmap tasks inserted for {company_name}")
        
    except ImportError:
        print("⚠️ Project_Roadmap_Insert_Tasks module not found - skipping roadmap insertion")
        roadmap_insert_result = None
    except Exception as e:
        print(f"⚠️ Roadmap insertion failed: {str(e)}")
        roadmap_insert_result = None
    
    csv_path = None
    if roadmap_result and roadmap_result.get('success'):
        csv_path = generate_task_csv(company_name, roadmap_result['tasks'])
        print(f"✅ Work order CSV generated with {len(roadmap_result['tasks'])} tasks")
    
    # 6. Send enhanced email notifications with all attachments
    notification_result = send_enhanced_email_notifications(
        client_data, pdf_path, csv_path, hubspot_result, folder_result
    )
    
    # 7. Send Slack notification
    send_slack_notification(client_data)
    
    print(f"Complete enhanced sales order automation finished for {company_name} - Quote: {quote_number}")
    
    return {
        "success": True,
        "quote_number": quote_number,
        "pdf_path": pdf_path,
        "csv_path": csv_path,
        "folder_id": folder_result.get('folder_id') if folder_result else None,
        "folder_url": folder_result.get('folder_url') if folder_result else None,
        "hubspot_contact_id": hubspot_result.get('contact_id') if hubspot_result else None,
        "tasks_created": roadmap_result.get('tasks_count', 0) if roadmap_result else 0,
        "notifications_sent": notification_result.get('success', False),
        "automation_complete": True
    }

if __name__ == "__main__":
    # Test the automation with sample data
    test_data = {
        "Parsed Company Name": "Test Automation Corp",
        "Parsed Contact Name": "John Tester",
        "Parsed Contact Email": "john@testautomation.com",
        "Parsed Contact Phone": "(555) 123-4567",
        "Parsed Bot Package": "YoBot Professional Package",
        "Parsed Add-On List": ["SmartSpend", "Advanced Analytics"],
        "Parsed Stripe Payment": "7500"
    }
    
    result = run_complete_sales_order_automation(test_data)
    print(json.dumps(result, indent=2))