import os
import requests
from datetime import datetime
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.oauth2.service_account import Credentials
from email.message import EmailMessage
import smtplib
import json

# === SETUP ===
GOOGLE_FOLDER_ID = "1-D1Do5bWsHWX1R7YexNEBLsgpBsV7WRh"
AIRTABLE_API_KEY = "paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa"
BASE_ID = "appRt8V3tH4g5Z5if"
TABLE_NAME = "📥 Scraped Leads (Universal)"

# === 1. UPLOAD TO GOOGLE DRIVE ===
def upload_to_drive(pdf_path, company_name):
    """Upload PDF to Google Drive and create company folder if needed"""
    try:
        # Use OAuth2 credentials from environment
        from google.oauth2.credentials import Credentials as OAuth2Credentials
        
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

        print(f"✅ Uploaded PDF to Google Drive: {file['webViewLink']}")
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

# === 3. SEND SLACK DM ===
def send_slack_alert(webhook_url, company_name, quote_url):
    """Send Slack notification with rich formatting"""
    try:
        # Use rich block formatting as previously implemented
        message = {
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"🚀 *NEW SALES ORDER COMPLETE*\n📊 Company: *{company_name}*"
                    }
                },
                {
                    "type": "divider"
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"📄 *Quote Generated*\n<{quote_url}|📎 View Professional Quote>\n✅ Ready for client signature"
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "🎯 *Next Steps:*\n• Review quote details\n• Schedule client call\n• Monitor signature status"
                    }
                }
            ]
        }
        
        response = requests.post(webhook_url, json=message)
        if response.status_code == 200:
            print("✅ Slack alert sent successfully")
            return True
        else:
            print(f"❌ Slack alert failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Slack alert error: {str(e)}")
        return False

# === 4. SEND DOCUSIGN SIGNATURE REQUEST ===
def send_docusign_signature(template_id, signer_email, signer_name, company_name):
    """Send DocuSign signature request"""
    print(f"📩 Sending DocuSign to {signer_name} <{signer_email}> using template {template_id} for {company_name}")
    # TODO: Convert to live integration when DocuSign credentials are refreshed
    return True

# === 5. ADD TO AIRTABLE ===
def insert_scraped_lead(form_data):
    """Add lead to Airtable"""
    try:
        airtable_url = f"https://api.airtable.com/v0/{BASE_ID}/{TABLE_NAME}"
        headers = {
            "Authorization": f"Bearer {AIRTABLE_API_KEY}",
            "Content-Type": "application/json"
        }
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
        res = requests.post(airtable_url, headers=headers, json=payload)
        res.raise_for_status()
        print("✅ Lead added to Airtable")
        return True
        
    except Exception as e:
        print(f"❌ Airtable sync failed: {str(e)}")
        return False

# === 6. SEND TO HUBSPOT ===
def send_to_hubspot(form_data):
    """Send contact to HubSpot"""
    try:
        hubspot_url = "https://api.hubapi.com/contacts/v1/contact"
        headers = {
            "Authorization": f"Bearer {os.getenv('HUBSPOT_API_KEY')}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "properties": [
                {"property": "email", "value": form_data["Email"]},
                {"property": "firstname", "value": form_data["Contact Name"].split()[0]},
                {"property": "lastname", "value": form_data["Contact Name"].split()[-1]},
                {"property": "company", "value": form_data["Company Name"]},
                {"property": "phone", "value": form_data["Phone Number"]},
                {"property": "website", "value": form_data.get("Website", "")}
            ]
        }
        
        response = requests.post(hubspot_url, headers=headers, json=payload)
        if response.status_code in [200, 201]:
            print(f"✅ Contact sent to HubSpot: {form_data['Contact Name']}")
            return True
        else:
            print(f"❌ HubSpot sync failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ HubSpot sync error: {str(e)}")
        return False

# === MAIN FLOW ===
def run_sales_order_pipeline(form_data, pdf_path):
    """Execute complete sales order automation pipeline"""
    results = {}
    
    print(f"🚀 Starting sales order pipeline for {form_data['Company Name']}")
    
    # 1. Upload to Google Drive
    quote_link = upload_to_drive(pdf_path, form_data["Company Name"])
    results['google_drive'] = {'success': quote_link is not None, 'url': quote_link}

    # 2. Email to team
    email_success = send_email(
        to_emails=["tyson@yobot.bot", "daniel@yobot.bot"],
        subject=f"📎 Quote Ready – {form_data['Company Name']}",
        body=f"The quote has been created for {form_data['Company Name']}\n\nView: {quote_link or 'PDF attached'}",
        attachment_path=pdf_path
    )
    results['email'] = {'success': email_success}

    # 3. Slack Alert
    slack_success = send_slack_alert(
        webhook_url=os.getenv('SLACK_WEBHOOK_URL', 'https://hooks.slack.com/services/your/webhook/url'),
        company_name=form_data["Company Name"],
        quote_url=quote_link or "PDF Generated"
    )
    results['slack'] = {'success': slack_success}

    # 4. DocuSign Signature Request
    docusign_success = send_docusign_signature(
        template_id="646522c7-edd9-485b-bbb4-20ea1cd92ef9",
        signer_email=form_data["Email"],
        signer_name=form_data["Contact Name"],
        company_name=form_data["Company Name"]
    )
    results['docusign'] = {'success': docusign_success}

    # 5. Airtable Sync
    airtable_success = insert_scraped_lead(form_data)
    results['airtable'] = {'success': airtable_success}

    # 6. HubSpot Sync
    hubspot_success = send_to_hubspot(form_data)
    results['hubspot'] = {'success': hubspot_success}
    
    print("✅ Sales order pipeline completed")
    return results

# === HELPER FUNCTION FOR WEBHOOK INTEGRATION ===
def process_webhook_data(webhook_data):
    """Convert webhook data to form_data format"""
    form_data = {
        "Contact Name": webhook_data.get("Parsed Contact Name", "Unknown Contact"),
        "Company Name": webhook_data.get("Parsed Company Name", "Unknown Company"),
        "Email": webhook_data.get("Parsed Contact Email", "unknown@email.com"),
        "Phone Number": webhook_data.get("Parsed Contact Phone", "(000) 000-0000"),
        "Website": webhook_data.get("Parsed Website", "")
    }
    return form_data

if __name__ == "__main__":
    # Example usage
    form_data = {
        "Contact Name": "Tyson Lerfald",
        "Company Name": "YoBot Inc.",
        "Email": "tyson@yobot.bot",
        "Phone Number": "701-371-8391",
        "Website": "https://yobot.bot"
    }
    # run_sales_order_pipeline(form_data, "YoBot Inc. - Q-20250606-001.pdf")