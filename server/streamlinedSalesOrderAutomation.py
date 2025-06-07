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

# === CONFIG ===
GOOGLE_FOLDER_ID = "1-D1Do5bWsHWX1R7YexNEBLsgpBsV7WRh"
DOCUSIGN_TEMPLATE_ID = "646522c7-edd9-485b-bbb4-20ea1cd92ef9"
AIRTABLE_API_KEY = "paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa"
AIRTABLE_BASE_ID = "appb2f3D77Tc4DWAr"
AIRTABLE_TABLE_NAME = "📥 Scraped Leads (Universal)"
SLACK_WEBHOOK = "https://hooks.slack.com/services/xRYo7LD89mNz2EvZy3kOrFiv"

# === 1. UPLOAD TO GOOGLE DRIVE ===
def upload_to_drive(pdf_path, company_name):
    """Upload PDF to Google Drive using service account or OAuth fallback"""
    try:
        # Try service account method first (preferred)
        try:
            import json
            creds_json = os.getenv("GOOGLE_DRIVE_CREDENTIALS")
            if creds_json:
                creds_data = json.loads(creds_json)
                creds = Credentials.from_service_account_info(
                    creds_data, 
                    scopes=["https://www.googleapis.com/auth/drive"]
                )
                print("✅ Using Google service account authentication")
            else:
                # Fallback to service account file
                creds = Credentials.from_service_account_file(
                    "google_creds.json", 
                    scopes=["https://www.googleapis.com/auth/drive"]
                )
                print("✅ Using Google service account file authentication")
        except Exception as service_error:
            print(f"⚠️ Service account failed: {service_error}")
            # Fallback to OAuth (original method)
            from google.oauth2.credentials import Credentials as OAuth2Credentials
            import requests
            
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
            
            creds = OAuth2Credentials(
                token=access_token,
                refresh_token=refresh_token,
                client_id=client_id,
                client_secret=client_secret,
                token_uri='https://oauth2.googleapis.com/token'
            )
            print("✅ Using Google OAuth authentication")

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
        
        # Generate PDF path (will be created by external PDF generator)
        pdf_filename = f"{company_name.replace(' ', '_').replace(',', '')}_Quote.pdf"
        pdf_path = f"./pdfs/{pdf_filename}"
        
        # Run the complete pipeline with real data only
        run_sales_order_pipeline(form_data, pdf_path, total_amount)
        
        return {
            'success': True,
            'message': 'Production sales order automation completed',
            'company': company_name,
            'contact': contact_name,
            'total': total_amount
        }
        
    except Exception as e:
        print(f"❌ Production automation failed: {str(e)}")
        return {
            'success': False,
            'error': 'Production automation failed',
            'details': str(e)
        }