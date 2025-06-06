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
    """Create Google Drive folder for client using enhanced integration"""
    try:
        from googleDriveIntegration import create_client_folder
        result = create_client_folder(company_name)
        
        if result and result.get('success'):
            print(f"✅ Google Drive folder created: {result['folder_name']}")
            return {
                'success': True,
                'folder_id': result['folder_id'],
                'folder_url': result['folder_url'],
                'folder_name': result['folder_name']
            }
        else:
            print(f"❌ Google Drive folder creation failed: {result.get('error', 'Unknown error')}")
            return {
                'success': False,
                'error': result.get('error', 'Unknown error')
            }
    except Exception as e:
        print(f"❌ Google Drive integration error: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

def generate_professional_quote_pdf(client_data, package_info, addon_list, pdf_path):
    """Generate professional quote PDF with YoBot branding"""
    pdf = FPDF()
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
    folder_id = create_google_drive_folder(company_name)
    
    # 2. Generate professional PDF quote
    pdf_path = f"./pdfs/YoBot_Quote_{quote_number}_{company_name.replace(' ', '_')}.pdf"
    generate_professional_quote_pdf(client_data, package_info, addon_list, pdf_path)
    
    # 3. Push to Airtable
    push_to_airtable(client_data)
    
    # 4. Create HubSpot contact
    create_hubspot_contact(client_data)
    
    # 5. Generate work order CSV with roadmap tasks
    from crmIntegration import build_roadmap_for_client
    roadmap_result = build_roadmap_for_client(client_data.get('bot_package', 'YoBot Standard Package'), client_data.get('selected_addons', []))
    
    csv_path = None
    if roadmap_result.get('success'):
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
        "folder_id": folder_id.get('folder_id') if folder_result else None,
        "folder_url": folder_result.get('folder_url') if folder_result else None,
        "hubspot_contact_id": hubspot_result.get('contact_id') if hubspot_result else None,
        "tasks_created": roadmap_result.get('tasks_count', 0),
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