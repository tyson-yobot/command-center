import os
import json
import datetime
import requests
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
import base64

def get_google_credentials():
    """Get Google credentials from environment variables"""
    try:
        client_id = os.getenv("GOOGLE_CLIENT_ID")
        client_secret = os.getenv("GOOGLE_CLIENT_SECRET") 
        refresh_token = os.getenv("GOOGLE_REFRESH_TOKEN")
        
        if not all([client_id, client_secret, refresh_token]):
            return {"success": False, "error": "Missing Google OAuth credentials"}
            
        credentials = Credentials(
            token=None,
            refresh_token=refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=client_id,
            client_secret=client_secret
        )
        
        return {"success": True, "credentials": credentials}
    except Exception as e:
        return {"success": False, "error": str(e)}

def create_client_folder(client_name):
    """Create Google Drive folder for client"""
    try:
        creds_result = get_google_credentials()
        if not creds_result["success"]:
            return creds_result
            
        service = build('drive', 'v3', credentials=creds_result["credentials"])
        
        # Create folder name with date
        folder_name = f"{client_name} - YoBot Project {datetime.datetime.now().strftime('%Y-%m-%d')}"
        
        folder_metadata = {
            'name': folder_name,
            'mimeType': 'application/vnd.google-apps.folder'
        }
        
        folder = service.files().create(body=folder_metadata, fields='id,webViewLink').execute()
        
        return {
            "success": True,
            "folder_id": folder.get('id'),
            "folder_url": folder.get('webViewLink'),
            "folder_name": folder_name
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}

def upload_pdf_to_drive(pdf_path, folder_id, client_name, quote_number):
    """Upload PDF to Google Drive folder"""
    try:
        creds_result = get_google_credentials()
        if not creds_result["success"]:
            return creds_result
            
        service = build('drive', 'v3', credentials=creds_result["credentials"])
        
        file_name = f"{client_name}_Quote_{quote_number}.pdf"
        
        file_metadata = {
            'name': file_name,
            'parents': [folder_id]
        }
        
        media = MediaFileUpload(pdf_path, mimetype='application/pdf')
        
        uploaded_file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id,webViewLink'
        ).execute()
        
        return {
            "success": True,
            "file_id": uploaded_file.get('id'),
            "file_url": uploaded_file.get('webViewLink'),
            "file_name": file_name
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}

def send_gmail_with_attachment(client_email, client_name, quote_number, folder_url, pdf_url):
    """Send Gmail with quote information"""
    try:
        creds_result = get_google_credentials()
        if not creds_result["success"]:
            return creds_result
            
        service = build('gmail', 'v1', credentials=creds_result["credentials"])
        
        subject = f"Your YoBot Quote - {quote_number}"
        
        message_text = f"""Hi {client_name},

Thank you for your interest in YoBot Enterprise Solutions. Your personalized quote is ready!

Quote Details:
- Quote Number: {quote_number}
- Project Folder: {folder_url}
- Quote Document: {pdf_url}

Our AI-powered automation platform will transform your business operations with:
• Intelligent voice bot integration
• Automated lead generation and qualification  
• Seamless CRM integration
• 24/7 customer support automation

We're excited to help you grow your business with cutting-edge automation technology.

Best regards,
The YoBot Team
"""
        
        message = {
            'raw': base64.urlsafe_b64encode(
                f"To: {client_email}\r\nSubject: {subject}\r\n\r\n{message_text}".encode()
            ).decode()
        }
        
        sent_message = service.users().messages().send(userId='me', body=message).execute()
        
        return {
            "success": True,
            "message_id": sent_message['id'],
            "recipient": client_email
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}

def process_complete_google_sales_order(order_data):
    """Complete sales order processing with Google Drive and Gmail"""
    try:
        company_name = order_data.get('customer_name', 'Client Company')
        client_email = order_data.get('email', 'client@example.com')
        package = order_data.get('package', 'YoBot Package')
        total = order_data.get('total', '$0')
        
        print(f"Processing complete Google sales order for {company_name}")

        # Step 1: Generate quote number
        today = datetime.datetime.now().strftime("%Y%m%d")
        company_code = ''.join([c.upper() for c in company_name.split() if c])[:3]
        quote_number = f"Q-{company_code}-{today}-001"

        # Step 2: Generate PDF locally first
        from localSalesOrderAutomation import generate_quote_pdf
        pdf_result = generate_quote_pdf(company_name, quote_number, package, total, client_email)
        if not pdf_result["success"]:
            return {"success": False, "error": f"PDF generation failed: {pdf_result['error']}"}

        # Step 3: Create Google Drive folder
        folder_result = create_client_folder(company_name)
        if not folder_result["success"]:
            return {"success": False, "error": f"Google Drive folder creation failed: {folder_result['error']}"}

        # Step 4: Upload PDF to Drive folder
        upload_result = upload_pdf_to_drive(
            pdf_result["pdf_path"], 
            folder_result["folder_id"], 
            company_name, 
            quote_number
        )
        if not upload_result["success"]:
            return {"success": False, "error": f"PDF upload failed: {upload_result['error']}"}

        # Step 5: Send Gmail notification
        email_result = send_gmail_with_attachment(
            client_email, 
            company_name, 
            quote_number, 
            folder_result["folder_url"],
            upload_result["file_url"]
        )

        # Step 6: Log to Airtable
        try:
            import requests
            api_key = os.getenv("AIRTABLE_API_KEY")
            if api_key:
                webhook_data = {
                    "🧾 Function Name": "Complete Google Sales Order Processing",
                    "📝 Source Form": "Tally Sales Order Form",
                    "📅 Timestamp": datetime.datetime.now().isoformat(),
                    "📊 Dashboard Name": "Sales Automation",
                    "👤 Client": company_name,
                    "📧 Email": client_email,
                    "💰 Total": total,
                    "📦 Package": package,
                    "📁 Folder URL": folder_result["folder_url"],
                    "📄 PDF URL": upload_result["file_url"],
                    "🔗 Quote Number": quote_number,
                    "✉️ Email Sent": "Yes" if email_result["success"] else "No",
                    "🎯 Status": "Complete - Google Integration"
                }

                requests.post(
                    "https://api.airtable.com/v0/appRt8V3tH4g5Z5if/tbldPRZ4nHbtj9opU/",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json"
                    },
                    json={"fields": webhook_data}
                )
        except Exception as log_error:
            print(f"Airtable logging failed: {log_error}")

        return {
            "success": True,
            "client_name": company_name,
            "quote_number": quote_number,
            "order_id": order_data.get('order_id', quote_number),
            "folder_url": folder_result["folder_url"],
            "pdf_url": upload_result["file_url"],
            "email_sent": email_result["success"],
            "processing_time": datetime.datetime.now().isoformat(),
            "method": "Complete Google Drive and Gmail integration"
        }

    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    # Test with sample data
    test_order = {
        "customer_name": "Google Test Company",
        "email": "test@googletest.com",
        "package": "Enterprise Google Package",
        "total": "$35000"
    }
    
    result = process_complete_google_sales_order(test_order)
    print(json.dumps(result, indent=2))