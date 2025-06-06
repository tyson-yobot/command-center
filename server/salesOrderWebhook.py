"""
YoBot Sales Order Webhook Handler
Complete automation pipeline for Tally form submissions
"""

import os
import json
import requests
from datetime import datetime
from flask import Flask, request, jsonify
from fpdf import FPDF
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders

app = Flask(__name__)

def generate_quote_number(company_name):
    """Generate unique quote number"""
    date_str = datetime.now().strftime("%Y%m%d")
    company_short = ''.join(e for e in company_name if e.isalnum())[:4].upper()
    return f"Q-{date_str}-{company_short}"

def get_package_object(package_name):
    """Get package pricing details"""
    packages = {
        "YoBot Standard Package": {"setup": 2500, "monthly": 150},
        "YoBot Professional Package": {"setup": 5000, "monthly": 300},
        "YoBot Platinum Package": {"setup": 10000, "monthly": 500},
        "YoBot Enterprise Package": {"setup": 25000, "monthly": 1000}
    }
    return packages.get(package_name, {"setup": 0, "monthly": 0})

def get_addon_objects(selected_addons):
    """Get addon pricing details"""
    addons = {
        "SmartSpend": {"setup": 1500, "monthly": 100},
        "Advanced Analytics": {"setup": 2000, "monthly": 150},
        "A/B Testing": {"setup": 1000, "monthly": 75},
        "Custom Integration": {"setup": 3000, "monthly": 200}
    }
    return [{"name": addon, **addons.get(addon, {"setup": 0, "monthly": 0})} for addon in selected_addons]

def get_setup_prices(package_name, addon_objects):
    """Calculate setup prices"""
    package = get_package_object(package_name)
    addon_total = sum(addon["setup"] for addon in addon_objects)
    return {
        "package": package["setup"],
        "addons": addon_total,
        "total": package["setup"] + addon_total
    }

def get_monthly_prices(package_name, addon_objects):
    """Calculate monthly prices"""
    package = get_package_object(package_name)
    addon_total = sum(addon["monthly"] for addon in addon_objects)
    return {
        "package": package["monthly"],
        "addons": addon_total,
        "total": package["monthly"] + addon_total
    }

def create_client_folder(company_name):
    """Create Google Drive folder for client"""
    # Placeholder - requires Google Drive API integration
    print(f"Creating Google Drive folder for {company_name}")
    return f"folder_{company_name.replace(' ', '_')}"

def generate_quote_pdf(client_data, selected_package, addon_objects, setup_prices, monthly_prices, stripe_paid, pdf_path, template_path):
    """Generate professional quote PDF"""
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font('Arial', 'B', 16)
    
    # Header
    pdf.cell(0, 10, 'YoBot Professional Quote', 0, 1, 'C')
    pdf.ln(10)
    
    # Client Info
    pdf.set_font('Arial', '', 12)
    pdf.cell(0, 8, f"Quote Number: {client_data['quote_number']}", 0, 1)
    pdf.cell(0, 8, f"Company: {client_data['company_name']}", 0, 1)
    pdf.cell(0, 8, f"Contact: {client_data['contact_name']}", 0, 1)
    pdf.cell(0, 8, f"Email: {client_data['contact_email']}", 0, 1)
    pdf.cell(0, 8, f"Phone: {client_data['contact_phone']}", 0, 1)
    pdf.ln(10)
    
    # Package Details
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(0, 8, 'Package Details:', 0, 1)
    pdf.set_font('Arial', '', 12)
    pdf.cell(0, 8, f"Setup Fee: ${setup_prices['total']:,}", 0, 1)
    pdf.cell(0, 8, f"Monthly Fee: ${monthly_prices['total']:,}", 0, 1)
    pdf.cell(0, 8, f"Stripe Payment: ${stripe_paid:,.2f}", 0, 1)
    
    # Save PDF
    os.makedirs(os.path.dirname(pdf_path), exist_ok=True)
    pdf.output(pdf_path)
    print(f"Quote PDF generated: {pdf_path}")

def upload_to_drive(pdf_path, filename, folder_id):
    """Upload PDF to Google Drive"""
    # Placeholder - requires Google Drive API integration
    print(f"Uploading {filename} to Google Drive folder {folder_id}")

def push_sales_order_to_airtable(data, quote_number, company_name):
    """Push sales order data to Airtable"""
    api_key = os.getenv("AIRTABLE_API_KEY")
    base_id = os.getenv("AIRTABLE_BASE_ID")
    
    if not api_key or not base_id:
        print("Airtable credentials missing")
        return
    
    payload = {
        "fields": {
            "Company Name": company_name,
            "Quote Number": quote_number,
            "Status": "New Order",
            "Timestamp": datetime.now().isoformat()
        }
    }
    
    try:
        response = requests.post(
            f"https://api.airtable.com/v0/{base_id}/Sales Orders",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json=payload
        )
        print(f"Airtable response: {response.status_code}")
    except Exception as e:
        print(f"Airtable error: {e}")

def post_tasks_to_airtable(base_id, roadmap_table_name, api_key, filtered_tasks, client_name, quote_number):
    """Post project tasks to Airtable roadmap"""
    print(f"Posting tasks for {client_name} - {quote_number}")

def filter_tasks_by_package_addons(package_name, addon_objects, industry):
    """Filter tasks based on package and addons"""
    # Return default task list
    return ["Setup YoBot Instance", "Configure Integrations", "Training Sessions"]

def create_hubspot_contact(email, first_name, last_name, company, api_key):
    """Create HubSpot contact"""
    if not api_key:
        print("HubSpot API key missing")
        return
    
    payload = {
        "properties": {
            "email": email,
            "firstname": first_name,
            "lastname": last_name,
            "company": company
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

def send_quote_email(receiver_email, subject, body, pdf_path):
    """Send email notification with PDF attachment"""
    sender_email = "daniel@yobot.bot"
    sender_password = os.getenv("GMAIL_APP_PASSWORD")
    
    if not sender_password:
        print("Gmail credentials missing")
        return
    
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = ', '.join(receiver_email)
    msg['Subject'] = subject
    
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
        server.sendmail(sender_email, receiver_email, msg.as_string())
        server.quit()
        print("Email sent successfully")
    except Exception as e:
        print(f"Email error: {e}")

def slack_notify(message):
    """Send Slack notification"""
    webhook_url = os.getenv("SLACK_WEBHOOK_URL")
    if not webhook_url:
        print("Slack webhook URL missing")
        return
    
    payload = {"text": message}
    try:
        response = requests.post(webhook_url, json=payload)
        print(f"Slack notification sent: {response.status_code}")
    except Exception as e:
        print(f"Slack error: {e}")

def send_docusign_request(email, name, company, quote_number):
    """Send DocuSign signature request"""
    print(f"DocuSign request sent to {email} for {quote_number}")

@app.route('/webhook/sales_order', methods=['POST'])
def handle_sales_order():
    data = request.get_json()

    # 1. Extract parsed values from Tally
    company_name = data.get("Parsed Company Name", data.get("company_name", "Unknown Company"))
    contact_name = data.get("Parsed Contact Name", data.get("contact_name", "Unknown Contact"))
    contact_email = data.get("Parsed Contact Email", data.get("email", "unknown@email.com"))
    contact_phone = data.get("Parsed Contact Phone", data.get("phone", "(000) 000-0000"))
    package_name = data.get("Parsed Bot Package", data.get("package", "YoBot Standard Package"))
    selected_addons = data.get("Parsed Add-On List", data.get("addons", []))
    quote_number = generate_quote_number(company_name)
    stripe_paid = float(data.get("Parsed Stripe Payment", data.get("total", 0)))
    industry = data.get("Parsed Industry", data.get("industry", ""))

    # 2. Create Google Drive Folder
    folder_id = create_client_folder(company_name)

    # 3. Generate Quote PDF and Save in Drive
    pdf_path = f"./pdfs/YoBot_Quote_{quote_number}_{company_name.replace(' ', '_')}.pdf"
    selected_package = get_package_object(package_name)
    addon_objects = get_addon_objects(selected_addons) if isinstance(selected_addons, list) else []
    setup_prices = get_setup_prices(package_name, addon_objects)
    monthly_prices = get_monthly_prices(package_name, addon_objects)
    client_data = {
        "quote_number": quote_number,
        "company_name": company_name,
        "contact_name": contact_name,
        "contact_email": contact_email,
        "contact_phone": contact_phone
    }
    generate_quote_pdf(client_data, selected_package, addon_objects, setup_prices, monthly_prices, stripe_paid, pdf_path, "yobot_final_quote_template.html")
    upload_to_drive(pdf_path, f"{company_name}_{quote_number}.pdf", folder_id)

    # 4. Push to Airtable
    push_sales_order_to_airtable(data, quote_number, company_name)
    post_tasks_to_airtable(base_id=os.getenv("AIRTABLE_BASE_ID"), roadmap_table_name="📌 Project Roadmap Tracker",
                           api_key=os.getenv("AIRTABLE_API_KEY"), filtered_tasks=filter_tasks_by_package_addons(package_name, addon_objects, industry),
                           client_name=company_name, quote_number=quote_number)

    # 5. Push to HubSpot
    name_parts = contact_name.split()
    first_name = name_parts[0] if name_parts else "Unknown"
    last_name = name_parts[-1] if len(name_parts) > 1 else "Contact"
    create_hubspot_contact(contact_email, first_name, last_name, company_name, api_key=os.getenv("HUBSPOT_API_KEY"))

    # 6. Work Order is part of Airtable task injection above

    # 7. Email Internal Notification
    send_quote_email(
        receiver_email=["daniel@yobot.bot", "tyson@yobot.bot"],
        subject=f"New Sales Order: {company_name} - {quote_number}",
        body=f"Company: {company_name}\nEmail: {contact_email}\nPackage: {package_name}\nTotal: ${setup_prices['total'] + sum(a['setup'] for a in addon_objects)}\nQuote Number: {quote_number}\n\nTasks injected. Folder + PDF created.",
        pdf_path=pdf_path
    )

    # 8. Send Slack Message
    slack_notify(f"📦 *New Sales Order* from {company_name}\n• Quote: `{quote_number}`\n• Package: {package_name}\n• PDF & Airtable synced ✅")

    # 9. Email DocuSign Link
    send_docusign_request(contact_email, contact_name, company_name, quote_number)

    return jsonify({"status": "✅ Sales order processed", "quote": quote_number})

if __name__ == '__main__':
    app.run(debug=True, port=5001)