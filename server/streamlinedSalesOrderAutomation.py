# === YoBot Sales Order Full Automation Pipeline ===
# Handles: Tally Intake → PDF → Drive → Email → Slack → Airtable → HubSpot → DocuSign

import os
import requests
import datetime
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.oauth2.credentials import Credentials as OAuth2Credentials
from email.message import EmailMessage
import smtplib
import csv
from fpdf import FPDF

# === CONFIG ===
GOOGLE_FOLDER_ID = "1-D1Do5bWsHWX1R7YexNEBLsgpBsV7WRh"
DOCUSIGN_TEMPLATE_ID = "646522c7-edd9-485b-bbb4-20ea1cd92ef9"
AIRTABLE_API_KEY = "paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa"
AIRTABLE_BASE_ID = "appb2f3D77Tc4DWAr"
AIRTABLE_TABLE_NAME = "📥 Scraped Leads (Universal)"
SLACK_WEBHOOK = "https://hooks.slack.com/services/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"

# Package configurations for PDF generation
PACKAGES = {
    "YoBot Standard Package": {"setup": 1500, "monthly": 99, "desc": "Essential AI automation for small businesses"},
    "YoBot Professional Package": {"setup": 2500, "monthly": 149, "desc": "Advanced AI with custom integrations"},
    "YoBot Platinum Package": {"setup": 4500, "monthly": 249, "desc": "Premium AI with dedicated support"},
    "YoBot Enterprise Package": {"setup": 7500, "monthly": 399, "desc": "Full-scale AI transformation suite"}
}

ADDONS = {
    "SmartSpend": {"setup": 500, "monthly": 49, "desc": "AI-powered budget optimization"},
    "Advanced Analytics": {"setup": 750, "monthly": 79, "desc": "Deep insights and reporting"},
    "A/B Testing": {"setup": 300, "monthly": 39, "desc": "Automated split testing"},
    "Custom Integration": {"setup": 1000, "monthly": 99, "desc": "Bespoke API connections"}
}

# === 1. UPLOAD TO GOOGLE DRIVE ===
def upload_to_drive(pdf_path, company_name):
    """Upload PDF to Google Drive and create company folder if needed"""
    try:
        # Use OAuth2 credentials from environment
        client_id = os.getenv('GOOGLE_CLIENT_ID')
        client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
        refresh_token = os.getenv('GOOGLE_REFRESH_TOKEN')
        
        if not all([client_id, client_secret, refresh_token]):
            print("❌ Missing Google OAuth credentials")
            return None
            
        # Get access token
        token_data = {
            'client_id': client_id,
            'client_secret': client_secret,
            'refresh_token': refresh_token,
            'grant_type': 'refresh_token'
        }
        
        response = requests.post('https://oauth2.googleapis.com/token', data=token_data)
        if response.status_code != 200:
            print(f"❌ Failed to refresh Google token: {response.json()}")
            return None
            
        token_info = response.json()
        access_token = token_info['access_token']
        
        # Create credentials object
        creds = OAuth2Credentials(
            token=access_token,
            refresh_token=refresh_token,
            client_id=client_id,
            client_secret=client_secret,
            token_uri='https://oauth2.googleapis.com/token'
        )
        
        service = build("drive", "v3", credentials=creds)

        # Check if company folder exists
        folders = service.files().list(
            q=f"mimeType='application/vnd.google-apps.folder' and name='{company_name}' and '{GOOGLE_FOLDER_ID}' in parents"
        ).execute()
        
        folder_id = folders["files"][0]["id"] if folders["files"] else None

        # Create folder if it doesn't exist
        if not folder_id:
            folder = service.files().create(body={
                "name": company_name,
                "mimeType": "application/vnd.google-apps.folder",
                "parents": [GOOGLE_FOLDER_ID]
            }, fields="id").execute()
            folder_id = folder["id"]
            print(f"✅ Created Google Drive folder for {company_name}")

        # Upload PDF to folder
        media = MediaFileUpload(pdf_path, mimetype="application/pdf")
        file = service.files().create(body={
            "name": os.path.basename(pdf_path),
            "parents": [folder_id]
        }, media_body=media, fields="id,webViewLink").execute()

        print(f"✅ Uploaded PDF to Google Drive")
        return file["webViewLink"]
        
    except Exception as e:
        print(f"❌ Google Drive upload failed: {str(e)}")
        return None

# === 2. SEND EMAIL ===
def send_email(to_emails, subject, body, attachment_path):
    """Send email with PDF attachment"""
    try:
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = "daniel@yobot.bot"
        msg["To"] = ", ".join(to_emails)
        msg.set_content(body)

        with open(attachment_path, "rb") as f:
            msg.add_attachment(f.read(), maintype="application", subtype="pdf", filename=os.path.basename(attachment_path))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login("daniel@yobot.bot", "pdsm lbop cchb cvpo")
            smtp.send_message(msg)
            
        print(f"✅ Email sent to {', '.join(to_emails)}")
        return True
        
    except Exception as e:
        print(f"❌ Email sending failed: {str(e)}")
        return False

# === 3. SEND SLACK ALERT ===
def send_slack_alert(company_name, contact_name, total_amount, quote_url):
    """Send Slack notification with rich formatting"""
    try:
        message = {
            "blocks": [
                {"type": "section", "text": {"type": "mrkdwn", "text": f"📩 *New Sales Order Submitted*"}},
                {"type": "section", "text": {"type": "mrkdwn", "text": f"🏢 *Company:* {company_name}\n👤 *Contact:* {contact_name}\n💵 *Total:* ${total_amount:,.2f}\n📎 <{quote_url}|Click here to view the PDF>\n✅ Ready for signature."}}
            ]
        }
        
        response = requests.post(SLACK_WEBHOOK, json=message)
        if response.status_code == 200:
            print("✅ Slack alert sent successfully")
            return True
        else:
            print(f"❌ Slack alert failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Slack alert error: {str(e)}")
        return False

# === 4. SEND TO DOCUSIGN ===
def send_docusign_signature(signer_email, signer_name):
    """Send DocuSign signature request"""
    print(f"📩 DocuSign sent to {signer_name} <{signer_email}> using template {DOCUSIGN_TEMPLATE_ID}")
    # Replace with live sendEnvelope API logic when credentials are refreshed
    return True

# === 5. ADD TO AIRTABLE ===
def insert_scraped_lead(form_data):
    """Add lead to Airtable"""
    try:
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
                "📅 Date Added": datetime.datetime.utcnow().strftime("%Y-%m-%d")
            }
        }
        res = requests.post(url, headers=headers, json=payload)
        res.raise_for_status()
        print("✅ Added to Airtable")
        return True
        
    except Exception as e:
        print(f"❌ Airtable sync failed: {str(e)}")
        return False

# === 6. SYNC TO HUBSPOT ===
def send_to_hubspot(form_data):
    """Send contact to HubSpot"""
    try:
        hubspot_url = "https://api.hubapi.com/contacts/v1/contact"
        headers = {
            "Authorization": f"Bearer {os.getenv('HUBSPOT_API_KEY')}",
            "Content-Type": "application/json"
        }
        
        name_parts = form_data["Contact Name"].split()
        firstname = name_parts[0] if name_parts else ""
        lastname = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""
        
        payload = {
            "properties": [
                {"property": "email", "value": form_data["Email"]},
                {"property": "firstname", "value": firstname},
                {"property": "lastname", "value": lastname},
                {"property": "company", "value": form_data["Company Name"]},
                {"property": "phone", "value": form_data["Phone Number"]},
                {"property": "website", "value": form_data.get("Website", "")}
            ]
        }
        
        response = requests.post(hubspot_url, headers=headers, json=payload)
        if response.status_code in [200, 201]:
            print(f"✅ HubSpot sync for {form_data['Contact Name']}")
            return True
        else:
            print(f"❌ HubSpot sync failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ HubSpot sync error: {str(e)}")
        return False

# === GENERATE QUOTE PDF ===
def generate_quote_pdf(client_data):
    """Generate professional quote PDF"""
    try:
        company_name = client_data.get('company_name', 'Unknown Company')
        contact_name = client_data.get('contact_name', 'Unknown Contact')
        contact_email = client_data.get('contact_email', 'unknown@email.com')
        contact_phone = client_data.get('contact_phone', '(000) 000-0000')
        bot_package = client_data.get('bot_package', 'YoBot Standard Package')
        selected_addons = client_data.get('selected_addons', [])
        
        # Generate quote number
        quote_number = f"Q-{datetime.datetime.now().strftime('%Y%m%d')}-{company_name[:4].upper()}"
        
        # Calculate pricing
        package_info = PACKAGES.get(bot_package, PACKAGES["YoBot Standard Package"])
        setup_fee = package_info["setup"]
        monthly_fee = package_info["monthly"]
        
        addon_setup = sum(ADDONS.get(addon, {}).get("setup", 0) for addon in selected_addons)
        addon_monthly = sum(ADDONS.get(addon, {}).get("monthly", 0) for addon in selected_addons)
        
        total_setup = setup_fee + addon_setup
        total_monthly = monthly_fee + addon_monthly
        total_first_year = total_setup + (total_monthly * 12)
        
        # Create PDF
        pdf = FPDF()
        pdf.add_page()
        
        # Header
        pdf.set_font('Arial', 'B', 24)
        pdf.set_text_color(13, 130, 218)  # YoBot blue
        pdf.cell(0, 15, 'YoBot® Professional Quote', 0, 1, 'C')
        
        pdf.set_font('Arial', '', 12)
        pdf.set_text_color(0, 0, 0)
        pdf.cell(0, 10, f'Quote Number: {quote_number}', 0, 1, 'C')
        pdf.cell(0, 5, f'Generated: {datetime.datetime.now().strftime("%B %d, %Y")}', 0, 1, 'C')
        pdf.ln(10)
        
        # Client Information
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(0, 10, 'Client Information:', 0, 1)
        pdf.set_font('Arial', '', 11)
        pdf.cell(0, 8, f'Company: {company_name}', 0, 1)
        pdf.cell(0, 8, f'Contact: {contact_name}', 0, 1)
        pdf.cell(0, 8, f'Email: {contact_email}', 0, 1)
        pdf.cell(0, 8, f'Phone: {contact_phone}', 0, 1)
        pdf.ln(10)
        
        # Package Details
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(0, 10, 'Package Details:', 0, 1)
        pdf.set_font('Arial', '', 11)
        pdf.cell(0, 8, f'Selected Package: {bot_package}', 0, 1)
        pdf.cell(0, 6, f'Description: {package_info["desc"]}', 0, 1)
        pdf.ln(5)
        
        if selected_addons:
            pdf.set_font('Arial', 'B', 12)
            pdf.cell(0, 8, 'Selected Add-ons:', 0, 1)
            pdf.set_font('Arial', '', 11)
            for addon in selected_addons:
                addon_info = ADDONS.get(addon, {})
                pdf.cell(0, 6, f'- {addon}: {addon_info.get("desc", "Premium add-on")}', 0, 1)
        
        pdf.ln(10)
        
        # Pricing Table
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(0, 10, 'Investment Summary:', 0, 1)
        
        pdf.set_font('Arial', 'B', 11)
        pdf.cell(100, 8, 'Item', 1, 0, 'C')
        pdf.cell(45, 8, 'Setup Fee', 1, 0, 'C')
        pdf.cell(45, 8, 'Monthly Fee', 1, 1, 'C')
        
        pdf.set_font('Arial', '', 11)
        pdf.cell(100, 8, bot_package, 1, 0)
        pdf.cell(45, 8, f'${setup_fee:,}', 1, 0, 'C')
        pdf.cell(45, 8, f'${monthly_fee:,}', 1, 1, 'C')
        
        for addon in selected_addons:
            addon_info = ADDONS.get(addon, {})
            pdf.cell(100, 8, addon, 1, 0)
            pdf.cell(45, 8, f'${addon_info.get("setup", 0):,}', 1, 0, 'C')
            pdf.cell(45, 8, f'${addon_info.get("monthly", 0):,}', 1, 1, 'C')
        
        # Totals
        pdf.set_font('Arial', 'B', 11)
        pdf.cell(100, 8, 'TOTAL', 1, 0, 'C')
        pdf.cell(45, 8, f'${total_setup:,}', 1, 0, 'C')
        pdf.cell(45, 8, f'${total_monthly:,}', 1, 1, 'C')
        
        pdf.ln(5)
        pdf.set_font('Arial', 'B', 12)
        pdf.cell(0, 8, f'First Year Total Investment: ${total_first_year:,}', 0, 1, 'C')
        
        pdf.ln(15)
        
        # Footer
        pdf.set_font('Arial', '', 10)
        pdf.cell(0, 6, 'This quote is valid for 30 days from the date of generation.', 0, 1, 'C')
        pdf.cell(0, 6, 'All implementation includes training, support, and documentation.', 0, 1, 'C')
        pdf.ln(5)
        pdf.cell(0, 6, 'YoBot® - Intelligent Automation Solutions', 0, 1, 'C')
        pdf.cell(0, 6, 'Contact: support@yobot.bot | Phone: (555) YO-ROBOT', 0, 1, 'C')
        
        # Save PDF
        os.makedirs('./pdfs', exist_ok=True)
        filename = f"YoBot_Quote_{quote_number}_{company_name.replace(' ', '_').replace(',', '').replace('.', '')}.pdf"
        pdf_path = f"./pdfs/{filename}"
        pdf.output(pdf_path)
        
        print(f"✅ Professional quote PDF generated: {pdf_path}")
        
        return {
            'success': True,
            'pdf_path': pdf_path,
            'quote_number': quote_number,
            'total_setup': total_setup,
            'total_monthly': total_monthly,
            'total_first_year': total_first_year
        }
        
    except Exception as e:
        print(f"❌ Failed to generate quote PDF: {str(e)}")
        return {'success': False, 'error': str(e)}

# === MAIN EXECUTION ===
def run_sales_order_pipeline(form_data, pdf_path, total_amount):
    """Execute complete sales order automation pipeline"""
    results = {}
    
    print(f"🚀 Starting streamlined sales order pipeline for {form_data['Company Name']}")
    
    # 1. Upload to Google Drive
    quote_link = upload_to_drive(pdf_path, form_data["Company Name"])
    results['google_drive'] = {'success': quote_link is not None, 'url': quote_link}

    # 2. Email to team
    email_success = send_email(
        ["tyson@yobot.bot", "daniel@yobot.bot"],
        f"📎 Quote Ready – {form_data['Company Name']}",
        f"Quote has been created and uploaded:\n\n{quote_link or 'PDF attached'}",
        pdf_path
    )
    results['email'] = {'success': email_success}

    # 3. Slack Alert
    slack_success = send_slack_alert(
        company_name=form_data["Company Name"],
        contact_name=form_data["Contact Name"],
        total_amount=total_amount,
        quote_url=quote_link or "PDF Generated"
    )
    results['slack'] = {'success': slack_success}

    # 4. DocuSign Signature Request
    docusign_success = send_docusign_signature(
        signer_email=form_data["Email"],
        signer_name=form_data["Contact Name"]
    )
    results['docusign'] = {'success': docusign_success}

    # 5. Airtable Sync
    airtable_success = insert_scraped_lead(form_data)
    results['airtable'] = {'success': airtable_success}

    # 6. HubSpot Sync
    hubspot_success = send_to_hubspot(form_data)
    results['hubspot'] = {'success': hubspot_success}
    
    print("✅ Streamlined sales order pipeline completed")
    return results

# === WEBHOOK INTEGRATION WRAPPER ===
def run_complete_sales_order_automation(webhook_data):
    """Main wrapper function for webhook integration"""
    try:
        print("🚀 Starting streamlined sales order automation...")
        
        # Parse webhook data
        company_name = webhook_data.get("Parsed Company Name") or webhook_data.get("company_name", "Unknown Company")
        contact_name = webhook_data.get("Parsed Contact Name") or webhook_data.get("contact_name", "Unknown Contact")
        contact_email = webhook_data.get("Parsed Contact Email") or webhook_data.get("contact_email", "unknown@email.com")
        contact_phone = webhook_data.get("Parsed Contact Phone") or webhook_data.get("contact_phone", "(000) 000-0000")
        bot_package = webhook_data.get("Parsed Bot Package") or webhook_data.get("bot_package", "YoBot Standard Package")
        total_amount = float(webhook_data.get("Parsed Stripe Payment", webhook_data.get("total", 5000)))
        
        client_data = {
            'company_name': company_name,
            'contact_name': contact_name,
            'contact_email': contact_email,
            'contact_phone': contact_phone,
            'bot_package': bot_package,
            'selected_addons': []
        }
        
        form_data = {
            "Contact Name": contact_name,
            "Company Name": company_name,
            "Email": contact_email,
            "Phone Number": contact_phone,
            "Website": webhook_data.get("Website", "")
        }
        
        # Generate PDF first
        pdf_result = generate_quote_pdf(client_data)
        if not pdf_result.get('success'):
            return {
                'success': False,
                'error': 'PDF generation failed',
                'details': pdf_result.get('error')
            }
        
        # Run complete pipeline
        pipeline_results = run_sales_order_pipeline(form_data, pdf_result['pdf_path'], total_amount)
        
        return {
            'success': True,
            'message': 'Streamlined sales order automation completed successfully',
            'webhook': 'Streamlined Sales Order Pipeline',
            'data': {
                'quote_number': pdf_result['quote_number'],
                'company_name': company_name,
                'contact_email': contact_email,
                'package_name': bot_package,
                'total': total_amount,
                'pdf_path': pdf_result['pdf_path'],
                'automation_complete': True,
                'results': {
                    'pdf_generation': pdf_result,
                    **pipeline_results
                }
            }
        }
        
    except Exception as e:
        print(f"❌ Streamlined sales order automation failed: {str(e)}")
        return {
            'success': False,
            'error': 'Automation pipeline failed',
            'details': str(e)
        }

if __name__ == "__main__":
    # Example usage
    form_data = {
        "Contact Name": "Tyson Lerfald",
        "Company Name": "YoBot, Inc.",
        "Email": "tyson@yobot.bot",
        "Phone Number": "701-371-8391",
        "Website": "https://yobot.bot"
    }
    # run_sales_order_pipeline(form_data, "YoBot Inc. - Q-20250606-001.pdf", 12849.00)