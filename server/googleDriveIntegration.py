import os
import json
import datetime
import requests
from fpdf import FPDF
import smtplib
import ssl
from email.message import EmailMessage

# Google OAuth credentials from environment
CLIENT_ID = "685952645658-k8glf5nnp4d2u1cafih1pbauudus3nc.apps.googleusercontent.com"
CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
REFRESH_TOKEN = os.getenv("GOOGLE_REFRESH_TOKEN", "")

def create_client_folder(company_name):
    """Create Google Drive folder for client"""
    try:
        # Get access token
        token_response = requests.post("https://oauth2.googleapis.com/token", data={
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "refresh_token": REFRESH_TOKEN,
            "grant_type": "refresh_token"
        })
        
        if token_response.status_code != 200:
            return {"success": False, "error": "OAuth token refresh failed"}
            
        access_token = token_response.json().get("access_token")
        if not access_token:
            return {"success": False, "error": "No access token received"}

        # Create folder
        folder_response = requests.post("https://www.googleapis.com/drive/v3/files", headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }, json={
            "name": f"YoBot - {company_name}",
            "mimeType": "application/vnd.google-apps.folder"
        })
        
        if folder_response.status_code not in [200, 201]:
            return {"success": False, "error": "Folder creation failed"}
            
        folder_data = folder_response.json()
        folder_id = folder_data["id"]
        folder_url = f"https://drive.google.com/drive/folders/{folder_id}"
        
        return {
            "success": True,
            "folder_id": folder_id,
            "folder_url": folder_url
        }

    except Exception as e:
        return {"success": False, "error": str(e)}

def generate_quote_number(company_name):
    """Generate unique quote number per company per day"""
    today = datetime.datetime.now().strftime("%Y%m%d")
    quote_id = f"Q-{today}-001"  # Simplified for now
    return quote_id

def generate_quote_pdf(company_name, quote_number, items, total_paid):
    """Generate PDF quote"""
    try:
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)

        # Header
        pdf.cell(200, 10, txt=f"YoBot Quote: {quote_number}", ln=True, align="C")
        pdf.cell(200, 10, txt=f"Company: {company_name}", ln=True, align="L")
        pdf.cell(200, 10, txt=f"Date: {datetime.datetime.now().strftime('%Y-%m-%d')}", ln=True, align="L")
        pdf.ln(10)

        # Items
        pdf.set_font("Arial", size=11)
        pdf.cell(200, 10, txt="Quote Breakdown:", ln=True, align="L")
        for item in items:
            pdf.cell(200, 10, txt=f"- {item}", ln=True, align="L")
        pdf.ln(10)

        # Payment Summary
        pdf.set_font("Arial", 'B', size=12)
        pdf.cell(200, 10, txt=f"Total: {total_paid}", ln=True, align="L")

        # Save PDF to memory
        pdf_path = f"./temp/{company_name}_{quote_number}.pdf"
        os.makedirs("./temp", exist_ok=True)
        pdf.output(pdf_path)
        
        return {"success": True, "pdf_path": pdf_path}

    except Exception as e:
        return {"success": False, "error": str(e)}

def upload_pdf_to_drive(pdf_path, folder_id, filename):
    """Upload PDF to Google Drive"""
    try:
        # Get access token
        token_response = requests.post("https://oauth2.googleapis.com/token", data={
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "refresh_token": REFRESH_TOKEN,
            "grant_type": "refresh_token"
        })
        
        access_token = token_response.json().get("access_token")
        if not access_token:
            return {"success": False, "error": "No access token"}

        # Upload PDF
        with open(pdf_path, 'rb') as pdf_file:
            pdf_data = pdf_file.read()

        metadata = {
            "name": filename,
            "parents": [folder_id],
            "mimeType": "application/pdf"
        }
        
        upload_response = requests.post("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", headers={
            "Authorization": f"Bearer {access_token}"
        }, files={
            "data": ("metadata", json.dumps(metadata), "application/json"),
            "file": ("file", pdf_data, "application/pdf")
        })
        
        if upload_response.status_code not in [200, 201]:
            return {"success": False, "error": "PDF upload failed"}
            
        upload_data = upload_response.json()
        pdf_id = upload_data["id"]
        pdf_url = f"https://drive.google.com/file/d/{pdf_id}/view"
        
        return {"success": True, "pdf_id": pdf_id, "pdf_url": pdf_url}

    except Exception as e:
        return {"success": False, "error": str(e)}

def send_quote_email(client_email, company_name, quote_number, pdf_url):
    """Send quote email using Gmail API"""
    try:
        # Get access token
        token_response = requests.post("https://oauth2.googleapis.com/token", data={
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "refresh_token": REFRESH_TOKEN,
            "grant_type": "refresh_token"
        })
        
        access_token = token_response.json().get("access_token")
        if not access_token:
            return {"success": False, "error": "No access token for email"}

        # Create email
        import base64
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart

        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"YoBot Quote - {quote_number}"
        msg["To"] = client_email
        msg["From"] = "me"

        html = f"""
        <p>Hi {company_name},</p>
        <p>Your YoBot quote is ready!</p>
        <p><a href="{pdf_url}">Click here to view your quote</a></p>
        <p>Thanks!<br><strong>YoBot Team</strong></p>
        """

        msg.attach(MIMEText(html, "html"))
        raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
        
        email_response = requests.post("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }, json={"raw": raw})
        
        return {"success": email_response.status_code == 200}

    except Exception as e:
        return {"success": False, "error": str(e)}

def process_complete_sales_order(order_data):
    """Complete sales order processing with Google Drive integration"""
    try:
        company_name = order_data.get('customer_name', 'Client Company')
        client_email = order_data.get('email', 'client@example.com')
        package = order_data.get('package', 'YoBot Package')
        total = order_data.get('total', '$0')
        
        print(f"Processing sales order for {company_name}")

        # Step 1: Create Google Drive folder
        folder_result = create_client_folder(company_name)
        if not folder_result["success"]:
            return {"success": False, "error": f"Folder creation failed: {folder_result['error']}"}

        # Step 2: Generate quote number
        quote_number = generate_quote_number(company_name)

        # Step 3: Generate PDF
        items = [f"YoBot Package: {package}", f"Total: {total}"]
        pdf_result = generate_quote_pdf(company_name, quote_number, items, total)
        if not pdf_result["success"]:
            return {"success": False, "error": f"PDF generation failed: {pdf_result['error']}"}

        # Step 4: Upload PDF to Drive
        pdf_filename = f"{company_name} - {quote_number}.pdf"
        upload_result = upload_pdf_to_drive(pdf_result["pdf_path"], folder_result["folder_id"], pdf_filename)
        if not upload_result["success"]:
            return {"success": False, "error": f"PDF upload failed: {upload_result['error']}"}

        # Step 5: Send email
        email_result = send_quote_email(client_email, company_name, quote_number, upload_result["pdf_url"])

        # Cleanup temp file
        try:
            os.remove(pdf_result["pdf_path"])
        except:
            pass

        return {
            "success": True,
            "client_name": company_name,
            "order_id": quote_number,
            "folder_url": folder_result["folder_url"],
            "pdf_url": upload_result["pdf_url"],
            "email_sent": email_result["success"],
            "processing_time": datetime.datetime.now().isoformat()
        }

    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    # Test with sample data
    test_order = {
        "customer_name": "Test Company",
        "email": "test@company.com",
        "package": "Enterprise Bot",
        "total": "$15000"
    }
    
    result = process_complete_sales_order(test_order)
    print(json.dumps(result, indent=2))