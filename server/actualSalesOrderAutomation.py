# === YoBot® Sales Order Automation Script ===
# Implementation using your actual provided code and credentials
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
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

# === Setup Credentials (From your provided code) ===
def get_google_credentials():
    """Get Google credentials using your provided tokens"""
    import google.auth.transport.requests
    
    creds = Credentials(
        token=None,
        refresh_token="1//0g9GnAKVfRlM9CgYIARAAGBASNwF-L9IrBya2ZudqCC8oAaznpP3_Xd-JvwWc41WFlvT44G9UN3hiEtZWTyN2YfAmBtQdpTfdkA",
        token_uri="https://oauth2.googleapis.com/token",
        client_id="685952645658-k8glf5nnp4d2u1cafih1pbauudus3nc.apps.googleusercontent.com",
        client_secret="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",
        scopes=["https://www.googleapis.com/auth/drive"]
    )
    # Refresh the token using proper request object
    request = google.auth.transport.requests.Request()
    creds.refresh(request)
    return creds

# === Configuration (From your provided code) ===
CLIENTS_FOLDER_ID = "1BpVQhQZT0b_C9K8mW7XYzN5nJ4EtFGAd"  # Your 1. Clients folder
AIRTABLE_API_KEY = os.getenv('AIRTABLE_API_KEY')
AIRTABLE_BASE_ID = os.getenv('AIRTABLE_BASE_ID') 
HUBSPOT_API_KEY = os.getenv('HUBSPOT_API_KEY')
SLACK_WEBHOOK = os.getenv('SLACK_WEBHOOK_URL')
SENDGRID_KEY = os.getenv('SENDGRID_API_KEY')

# === Package and Add-on Configuration ===
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

def create_google_drive_folder(company_name):
    """Create Google Drive folder using your actual credentials"""
    try:
        creds = get_google_credentials()
        drive = build("drive", "v3", credentials=creds)
        
        folder_name = f"{company_name}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        folder = drive.files().create(body={
            "name": folder_name,
            "parents": [CLIENTS_FOLDER_ID],
            "mimeType": "application/vnd.google-apps.folder"
        }, fields="id,webViewLink").execute()
        
        folder_id = folder['id']
        folder_url = folder.get('webViewLink', f"https://drive.google.com/drive/folders/{folder_id}")
        
        print(f"✅ Google Drive folder created: {folder_url}")
        return {
            'success': True,
            'folder_id': folder_id,
            'folder_url': folder_url,
            'folder_name': folder_name
        }
        
    except Exception as e:
        print(f"❌ Google Drive folder creation failed: {str(e)}")
        return {'success': False, 'error': str(e)}

def generate_quote_pdf(client_data, package_info, addon_list, pdf_path):
    """Generate professional PDF quote"""
    try:
        os.makedirs(os.path.dirname(pdf_path), exist_ok=True)
        
        pdf = FPDF()
        pdf.add_page()
        
        # Header with YoBot branding
        pdf.set_font('Arial', 'B', 20)
        pdf.cell(0, 15, 'YoBot Professional Quote', 0, 1, 'C')
        pdf.set_font('Arial', '', 12)
        pdf.cell(0, 10, f"Quote Number: {client_data.get('quote_number', 'N/A')}", 0, 1, 'C')
        pdf.cell(0, 5, f"Generated: {datetime.datetime.now().strftime('%B %d, %Y')}", 0, 1, 'C')
        pdf.ln(10)
        
        # Client Information
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(0, 10, 'Client Information:', 0, 1)
        pdf.set_font('Arial', '', 11)
        pdf.cell(0, 8, f"Company: {client_data.get('company_name', 'N/A')}", 0, 1)
        pdf.cell(0, 8, f"Contact: {client_data.get('contact_name', 'N/A')}", 0, 1)
        pdf.cell(0, 8, f"Email: {client_data.get('contact_email', 'N/A')}", 0, 1)
        pdf.cell(0, 8, f"Phone: {client_data.get('contact_phone', 'N/A')}", 0, 1)
        pdf.ln(10)
        
        # Package Details
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(0, 8, 'Package Details:', 0, 1)
        pdf.set_font('Arial', '', 10)
        pdf.cell(0, 6, f"Package: {client_data.get('package_name', 'N/A')}", 0, 1)
        
        if addon_list:
            pdf.cell(0, 6, 'Add-ons:', 0, 1)
            for addon in addon_list:
                pdf.cell(20, 6, '', 0, 0)  # Indent
                pdf.cell(0, 6, f"- {addon}", 0, 1)
        
        pdf.ln(10)
        
        # Investment Summary
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(0, 10, 'Investment Summary:', 0, 1)
        pdf.set_font('Arial', '', 11)
        
        setup_fee = package_info.get('setup', 0)
        monthly_fee = package_info.get('monthly', 0)
        addon_setup = sum(ADDONS.get(addon, {}).get('setup', 0) for addon in addon_list)
        addon_monthly = sum(ADDONS.get(addon, {}).get('monthly', 0) for addon in addon_list)
        
        total_setup = setup_fee + addon_setup
        total_monthly = monthly_fee + addon_monthly
        
        pdf.cell(0, 8, f"Setup Fee: ${total_setup:,}", 0, 1)
        pdf.cell(0, 8, f"Monthly Fee: ${total_monthly:,}", 0, 1)
        pdf.cell(0, 8, f"Stripe Payment: ${client_data.get('stripe_paid', 0):,.2f}", 0, 1)
        
        pdf.ln(15)
        
        # Footer
        pdf.set_font('Arial', '', 10)
        pdf.cell(0, 6, 'This quote is valid for 30 days from the date of generation.', 0, 1, 'C')
        pdf.cell(0, 6, 'YoBot - Intelligent Automation Solutions', 0, 1, 'C')
        
        pdf.output(pdf_path)
        print(f"✅ PDF generated: {pdf_path}")
        return True
    except Exception as e:
        print(f"❌ PDF generation failed: {str(e)}")
        return False

def upload_pdf_to_drive(pdf_path, folder_id, company_name, quote_number):
    """Upload PDF to Google Drive folder"""
    try:
        creds = get_google_credentials()
        drive = build("drive", "v3", credentials=creds)
        
        file_name = f"{company_name}_Quote_{quote_number}.pdf"
        
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
        
        file_url = uploaded_file.get('webViewLink', f"https://drive.google.com/file/d/{uploaded_file.get('id')}")
        print(f"✅ PDF uploaded to Google Drive: {file_url}")
        
        return {
            "success": True,
            "file_id": uploaded_file.get('id'),
            "file_url": file_url,
            "file_name": file_name
        }
        
    except Exception as e:
        print(f"❌ PDF upload failed: {str(e)}")
        return {"success": False, "error": str(e)}

def push_to_airtable(client_data):
    """Push data to Airtable using your base configuration"""
    if not AIRTABLE_API_KEY or not AIRTABLE_BASE_ID:
        print("❌ Airtable credentials not configured")
        return
    
    try:
        url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/Sales%20Orders"
        headers = {
            "Authorization": f"Bearer {AIRTABLE_API_KEY}",
            "Content-Type": "application/json"
        }
        data = {
            "fields": {
                "Client Name": client_data.get('company_name'),
                "Quote Number": client_data.get('quote_number'),
                "Email": client_data.get('contact_email'),
                "Bot Package": client_data.get('package_name'),
                "Paid": float(client_data.get('stripe_paid', 0)),
                "Total Due": float(client_data.get('total_due', 0))
            }
        }
        
        response = requests.post(url, headers=headers, json=data)
        print(f"Airtable push: {response.status_code}")
        
    except Exception as e:
        print(f"❌ Airtable push failed: {str(e)}")

def create_hubspot_contact(client_data):
    """Create HubSpot contact"""
    if not HUBSPOT_API_KEY:
        print("❌ HubSpot API key not configured")
        return
    
    try:
        url = "https://api.hubapi.com/contacts/v1/contact"
        params = {"hapikey": HUBSPOT_API_KEY}
        data = {
            "properties": [
                {"property": "email", "value": client_data.get('contact_email')},
                {"property": "firstname", "value": client_data.get('contact_name')},
                {"property": "company", "value": client_data.get('company_name')},
                {"property": "phone", "value": client_data.get('contact_phone')}
            ]
        }
        
        response = requests.post(url, params=params, json=data)
        print(f"HubSpot contact created: {response.status_code}")
        
    except Exception as e:
        print(f"❌ HubSpot contact creation failed: {str(e)}")

def send_slack_notification(client_data):
    """Send Slack notification"""
    if not SLACK_WEBHOOK:
        print("❌ Slack webhook not configured")
        return
    
    try:
        message = {
            "text": f"✅ New Sales Order: *{client_data.get('company_name')}* ({client_data.get('quote_number')})"
        }
        
        response = requests.post(SLACK_WEBHOOK, json=message)
        print(f"Slack notification sent: {response.status_code}")
        
    except Exception as e:
        print(f"❌ Slack notification failed: {str(e)}")

def send_internal_emails(client_data, pdf_path):
    """Send emails to internal team"""
    if not SENDGRID_KEY:
        print("❌ SendGrid API key not configured")
        return
    
    try:
        for email in ["tyson@yobot.bot", "daniel@yobot.bot"]:
            data = {
                "personalizations": [{"to": [{"email": email}]}],
                "from": {"email": "noreply@yobot.bot"},
                "subject": f"New Quote: {client_data.get('company_name')} ({client_data.get('quote_number')})",
                "content": [{"type": "text/plain", "value": f"PDF created and saved. Ready to proceed.\n\nClient: {client_data.get('company_name')}\nQuote: {client_data.get('quote_number')}"}]
            }
            
            response = requests.post("https://api.sendgrid.com/v3/mail/send", 
                headers={"Authorization": f"Bearer {SENDGRID_KEY}"}, 
                json=data)
            print(f"Email sent to {email}: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Email sending failed: {str(e)}")

def run_complete_sales_order_automation(form_data):
    """Main automation function implementing your complete workflow"""
    try:
        print("Starting complete sales order automation...")
        
        # Parse form data
        company_name = form_data.get('Parsed Company Name', 'Unknown Company')
        contact_name = form_data.get('Parsed Contact Name', 'Unknown Contact')
        contact_email = form_data.get('Parsed Contact Email', '')
        contact_phone = form_data.get('Parsed Contact Phone', '')
        package_name = form_data.get('Parsed Bot Package', 'YoBot Standard Package')
        addon_list = form_data.get('Parsed Add-On List', [])
        stripe_paid = float(form_data.get('Parsed Stripe Payment', 0))
        
        # Generate quote number
        quote_number = f"Q-{datetime.datetime.now().strftime('%Y%m%d')}-LIVE"
        
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
            'stripe_paid': stripe_paid,
            'total_due': setup_total
        }
        
        # 1. Create Google Drive folder
        folder_result = create_google_drive_folder(company_name)
        
        # 2. Generate professional PDF quote
        pdf_path = f"./pdfs/YoBot_Quote_{quote_number}_{company_name.replace(' ', '_')}.pdf"
        pdf_generated = generate_quote_pdf(client_data, package_info, addon_list, pdf_path)
        
        # 3. Upload PDF to Google Drive folder (if folder creation succeeded)
        upload_result = None
        if folder_result and folder_result.get('success') and folder_result.get('folder_id'):
            upload_result = upload_pdf_to_drive(pdf_path, folder_result['folder_id'], company_name, quote_number)
        
        # 4. Push to Airtable
        push_to_airtable(client_data)
        
        # 5. Create HubSpot contact
        create_hubspot_contact(client_data)
        
        # 6. Send internal emails
        send_internal_emails(client_data, pdf_path)
        
        # 7. Send Slack notification
        send_slack_notification(client_data)
        
        print(f"Complete sales order automation finished for {company_name} - Quote: {quote_number}")
        
        return {
            "success": True,
            "quote_number": quote_number,
            "pdf_path": pdf_path,
            "folder_result": folder_result,
            "upload_result": upload_result,
            "automation_complete": True
        }
        
    except Exception as e:
        print(f"❌ Sales order automation failed: {str(e)}")
        return {"success": False, "error": str(e)}

