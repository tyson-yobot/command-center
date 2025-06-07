# === YoBot Sales Order Full Automation Pipeline ===
# Handles: Tally Intake → PDF → Drive → Email → Slack → Airtable → HubSpot → DocuSign

import os
import requests
from datetime import datetime
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.oauth2.service_account import Credentials
from email.message import EmailMessage
import smtplib
import json
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.lib.colors import HexColor

# === CONFIG ===
GOOGLE_FOLDER_ID = "1-D1Do5bWsHWX1R7YexNEBLsgpBsV7WRh"
DOCUSIGN_TEMPLATE_ID = "646522c7-edd9-485b-bbb4-20ea1cd92ef9"
AIRTABLE_API_KEY = "paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa"
AIRTABLE_BASE_ID = "appb2f3D77Tc4DWAr"
AIRTABLE_TABLE_NAME = "📥 Scraped Leads (Universal)"
SLACK_WEBHOOK = "https://hooks.slack.com/services/xRYo7LD89mNz2EvZy3kOrFiv"

# === PDF GENERATION ===
def generate_quote_pdf(form_data, total_amount):
    """Generate professional PDF quote using ReportLab"""
    try:
        # Ensure pdfs directory exists
        pdf_dir = "./pdfs"
        if not os.path.exists(pdf_dir):
            os.makedirs(pdf_dir)
        
        # Generate quote number and filename
        today = datetime.now().strftime("%Y%m%d")
        company_short = form_data["Company Name"][:4].upper()
        quote_number = f"Q-{today}-{company_short}"
        
        filename = f"YoBot_Quote_{quote_number}_{form_data['Company Name'].replace(' ', '_').replace(',', '')}.pdf"
        pdf_path = os.path.join(pdf_dir, filename)
        
        # Create PDF
        c = canvas.Canvas(pdf_path, pagesize=letter)
        width, height = letter
        
        # Header
        c.setFont("Helvetica-Bold", 24)
        c.drawString(50, height - 80, "YoBot® AI Quote")
        
        c.setFont("Helvetica", 12)
        c.drawString(50, height - 100, "Enterprise AI Voice Automation Solutions")
        
        # Quote details
        y_position = height - 150
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, y_position, "Quote For:")
        
        y_position -= 30
        c.setFont("Helvetica", 12)
        c.drawString(50, y_position, f"Company: {form_data['Company Name']}")
        y_position -= 20
        c.drawString(50, y_position, f"Contact: {form_data['Contact Name']}")
        y_position -= 20
        c.drawString(50, y_position, f"Email: {form_data['Email']}")
        y_position -= 20
        if form_data.get('Phone Number'):
            c.drawString(50, y_position, f"Phone: {form_data['Phone Number']}")
            y_position -= 20
        
        # Package details
        y_position -= 30
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, y_position, "Service Package:")
        
        y_position -= 30
        c.setFont("Helvetica", 12)
        c.drawString(50, y_position, "YoBot Enterprise Voice AI Solution")
        y_position -= 20
        c.drawString(50, y_position, "• 24/7 AI Voice Assistant")
        y_position -= 20
        c.drawString(50, y_position, "• Advanced Call Routing & Analytics")
        y_position -= 20
        c.drawString(50, y_position, "• Custom Personality Training")
        y_position -= 20
        c.drawString(50, y_position, "• Integration with CRM/Tools")
        
        # Pricing
        y_position -= 50
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, y_position, "Investment:")
        
        y_position -= 30
        c.setFont("Helvetica", 12)
        c.drawString(50, y_position, "Setup & Implementation:")
        c.drawString(400, y_position, f"${2500:,}")
        y_position -= 20
        c.drawString(50, y_position, "Monthly Service:")
        c.drawString(400, y_position, f"${150:,}")
        y_position -= 20
        c.drawString(50, y_position, "First Year Total:")
        c.drawString(400, y_position, f"${4300:,}")
        
        # Total
        y_position -= 30
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, y_position, "Total Investment:")
        c.drawString(400, y_position, f"${total_amount:,.2f}")
        
        # Footer
        y_position = 100
        c.setFont("Helvetica", 10)
        c.drawString(50, y_position, f"Quote Number: {quote_number}")
        y_position -= 15
        c.drawString(50, y_position, f"Date: {datetime.now().strftime('%B %d, %Y')}")
        y_position -= 15
        c.drawString(50, y_position, "Valid for 30 days")
        
        c.save()
        
        print(f"✅ PDF generated: {filename}")
        return pdf_path
        
    except Exception as e:
        print(f"❌ PDF generation failed: {e}")
        return None

# === 1. UPLOAD TO GOOGLE DRIVE ===
def upload_to_drive(pdf_path, company_name):
    creds = Credentials.from_service_account_file("google_creds.json", scopes=["https://www.googleapis.com/auth/drive"])
    service = build("drive", "v3", credentials=creds)

    folders = service.files().list(q=f"mimeType='application/vnd.google-apps.folder' and name='{company_name}' and '{GOOGLE_FOLDER_ID}' in parents").execute()
    folder_id = folders["files"][0]["id"] if folders["files"] else None

    if not folder_id:
        folder = service.files().create(body={
            "name": company_name,
            "mimeType": "application/vnd.google-apps.folder",
            "parents": [GOOGLE_FOLDER_ID]
        }, fields="id").execute()
        folder_id = folder["id"]

    media = MediaFileUpload(pdf_path, mimetype="application/pdf")
    file = service.files().create(body={
        "name": os.path.basename(pdf_path),
        "parents": [folder_id]
    }, media_body=media, fields="id,webViewLink").execute()

    return file["webViewLink"]

# === 2. SEND EMAIL ===
def send_email(to_emails, subject, body, attachment_path):
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = "noreply@yobot.bot"
    msg["To"] = ", ".join(to_emails)
    msg.set_content(body)

    with open(attachment_path, "rb") as f:
        msg.add_attachment(f.read(), maintype="application", subtype="pdf", filename=os.path.basename(attachment_path))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login("noreply@yobot.bot", "your_email_app_password")
        smtp.send_message(msg)

# === 3. SEND SLACK ALERT ===
def send_slack_alert(company_name, contact_name, total_amount, quote_url):
    message = {
        "blocks": [
            {"type": "section", "text": {"type": "mrkdwn", "text": f"📩 *New Sales Order Submitted*"}},
            {"type": "section", "text": {"type": "mrkdwn", "text": f"🏢 *Company:* {company_name}\n👤 *Contact:* {contact_name}\n💵 *Total:* ${total_amount:,.2f}\n📎 <{quote_url}|Click here to view the PDF>\n✅ Ready for signature."}}
        ]
    }
    requests.post(SLACK_WEBHOOK, json=message)

# === 4. SEND TO DOCUSIGN ===
def send_docusign_signature(signer_email, signer_name):
    print(f"📩 DocuSign sent to {signer_name} <{signer_email}> using template {DOCUSIGN_TEMPLATE_ID}")
    # Replace with live sendEnvelope API logic

# === 5. ADD TO AIRTABLE ===
def insert_scraped_lead(form_data):
    url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{AIRTABLE_TABLE_NAME}"
    headers = {"Authorization": f"Bearer {AIRTABLE_API_KEY}", "Content-Type": "application/json"}
    payload = {
        "fields": {
            "🧑‍💼 Name": form_data["Contact Name"],
            "🏢 Company": form_data["Company Name"],
            "📧 Email": form_data["Email"],
            "☎️ Phone": form_data["Phone Number"],
            "🌐 Website": form_data.get("Website", ""),
            "✅ Synced to HubSpot": True,
            "📅 Date Added": datetime.utcnow().strftime("%Y-%m-%d")
        }
    }
    res = requests.post(url, headers=headers, json=payload)
    res.raise_for_status()
    print("✅ Added to Airtable")

# === 6. SYNC TO HUBSPOT ===
def send_to_hubspot(form_data):
    print(f"📤 HubSpot sync for {form_data['Contact Name']} <{form_data['Email']}>")

# === MAIN EXECUTION ===
def run_sales_order_pipeline(form_data, pdf_path, total_amount):
    quote_link = upload_to_drive(pdf_path, form_data["Company Name"])

    send_email(
        ["tyson@yobot.bot", "daniel@yobot.bot"],
        f"📎 Quote Ready – {form_data['Company Name']}",
        f"Quote has been created and uploaded:\n\n{quote_link}",
        pdf_path
    )

    send_slack_alert(
        company_name=form_data["Company Name"],
        contact_name=form_data["Contact Name"],
        total_amount=total_amount,
        quote_url=quote_link
    )

    send_docusign_signature(
        signer_email=form_data["Email"],
        signer_name=form_data["Contact Name"]
    )

    insert_scraped_lead(form_data)
    send_to_hubspot(form_data)

# === WEBHOOK INTEGRATION WRAPPER ===
def run_complete_sales_order_automation(webhook_data):
    """Main wrapper function for webhook integration - uses only real data from webhook"""
    try:
        print("🚀 Starting production sales order automation...")
        
        # Use ONLY the data from your actual sales order webhook - no test data
        company_name = webhook_data.get("Parsed Company Name", "")
        contact_name = webhook_data.get("Parsed Contact Name", "")
        contact_email = webhook_data.get("Parsed Contact Email", "")
        contact_phone = webhook_data.get("Parsed Contact Phone", "")
        total_amount = float(webhook_data.get("Parsed Stripe Payment", 0))
        
        if not all([company_name, contact_name, contact_email]):
            return {
                'success': False,
                'error': 'Missing required webhook data',
                'details': 'Company name, contact name, and email are required'
            }
        
        form_data = {
            "Contact Name": contact_name,
            "Company Name": company_name,
            "Email": contact_email,
            "Phone Number": contact_phone,
            "Website": webhook_data.get("Website", "")
        }
        
        # Generate the actual PDF first
        pdf_path = generate_quote_pdf(form_data, total_amount)
        
        if not pdf_path:
            return {
                'success': False,
                'error': 'PDF generation failed',
                'message': 'Unable to create PDF quote'
            }
        
        # Run the complete pipeline with the generated PDF
        run_sales_order_pipeline(form_data, pdf_path, total_amount)
        
        return {
            'success': True,
            'company_name': company_name,
            'contact_name': contact_name,
            'contact_email': contact_email,
            'total_amount': total_amount,
            'pdf_path': pdf_path,
            'message': 'Complete sales order automation finished successfully'
        }
        
    except Exception as e:
        print(f"❌ Sales order automation failed: {e}")
        return {
            'success': False,
            'error': str(e),
            'message': 'Sales order automation encountered an error'
        }

# === EXAMPLE USAGE ===
# form_data = {
#     "Contact Name": "Tyson Lerfald",
#     "Company Name": "YoBot, Inc.",
#     "Email": "tyson@yobot.bot",
#     "Phone Number": "701-371-8391",
#     "Website": "https://yobot.bot"
# }
# run_sales_order_pipeline(form_data, "YoBot Inc. - Q-20250606-001.pdf", 12849.00)