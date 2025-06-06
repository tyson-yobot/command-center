import requests
import json
from fpdf import FPDF
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import base64
import os
from datetime import datetime

# ----------------------------------
# 🔐 OAUTH CREDENTIALS WITH REFRESH TOKEN
# ----------------------------------
CLIENT_ID = "685952645658-k8glf5nnpa4d2u1cafih1pbauudus3n.apps.googleusercontent.com"
CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "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")
REFRESH_TOKEN = os.getenv("GOOGLE_REFRESH_TOKEN", "1//0g9GnAKVfRlM9CgYIARAAGBASNwF-L9IrBya2ZudqCC8oAaznpP3_Xd-JvwWc41WFlvT44G9UN3hiEtZWTyN2YfAmBtQdpTfdkA")

def get_fresh_access_token():
    """Get a fresh access token using refresh token"""
    try:
        response = requests.post("https://oauth2.googleapis.com/token", data={
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "refresh_token": REFRESH_TOKEN,
            "grant_type": "refresh_token"
        })
        
        if response.status_code == 200:
            access_token = response.json().get("access_token")
            if access_token:
                print("🔐 Access token refreshed successfully")
                return access_token
        
        print(f"❌ Token refresh failed: {response.text}")
        return None
    except Exception as e:
        print(f"❌ Token refresh error: {e}")
        return None

def process_sales_order_complete(order_data):
    """
    Complete sales order processing with Google Drive folder creation,
    PDF generation, upload, and Gmail delivery
    """
    try:
        # Get fresh access token using refresh token
        access_token = get_fresh_access_token()
        if not access_token:
            return {"success": False, "error": "Failed to refresh access token"}

        # Extract order details
        client_name = order_data.get('customer_name', 'Valued Client')
        client_email = order_data.get('email', 'customer@example.com')
        bot_package = order_data.get('package', 'Standard')
        addons = order_data.get('addons', [])
        total_cost = order_data.get('total', '$0')
        order_id = order_data.get('order_id', datetime.now().strftime('%Y%m%d'))

        print(f"🚀 Processing complete sales order for {client_name}")

        # ----------------------------------
        # 📁 1. Create Google Drive Folder in 1 - Clients directory
        # ----------------------------------
        
        # Use the known "1 - Clients" folder ID
        clients_folder_id = "1eBAdAc_polSkFSl-3F0NNH_scN8RzaFE"
        print(f"📂 Creating client folder in 1 - Clients directory: {clients_folder_id}")
        
        folder_metadata = {
            "name": f"YoBot - {client_name}",
            "mimeType": "application/vnd.google-apps.folder",
            "parents": [clients_folder_id]
        }
        
        folder_res = requests.post(
            "https://www.googleapis.com/drive/v3/files",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            },
            json=folder_metadata
        )
        
        if folder_res.status_code != 200:
            print(f"❌ Folder creation failed: {folder_res.text}")
            return {"success": False, "error": "Drive folder creation failed"}
            
        folder_id = folder_res.json().get("id")
        folder_url = f"https://drive.google.com/drive/folders/{folder_id}"
        print(f"📁 Folder created: {folder_id}")

        # ----------------------------------
        # 🧾 2. Generate Professional PDF Quote
        # ----------------------------------
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", "B", 16)
        pdf.cell(0, 10, "YoBot Enterprise Solution Quote", ln=True, align="C")
        pdf.ln(10)
        
        pdf.set_font("Arial", size=12)
        pdf.cell(0, 10, f"Quote for: {client_name}", ln=True)
        pdf.cell(0, 10, f"Email: {client_email}", ln=True)
        pdf.cell(0, 10, f"Order ID: {order_id}", ln=True)
        pdf.ln(5)
        
        pdf.cell(0, 10, f"Bot Package: {bot_package}", ln=True)
        if addons:
            pdf.cell(0, 10, f"Add-ons: {', '.join(addons)}", ln=True)
        pdf.cell(0, 10, f"Total Investment: {total_cost}", ln=True)
        pdf.ln(10)
        
        pdf.cell(0, 10, "Thank you for choosing YoBot!", ln=True)
        pdf.cell(0, 10, "Your automation journey begins here.", ln=True)
        
        pdf_filename = f"YoBot_Quote_{client_name.replace(' ', '_')}_{order_id}.pdf"
        pdf_path = f"/tmp/{pdf_filename}"
        pdf.output(pdf_path)
        print(f"🧾 PDF generated: {pdf_filename}")

        # ----------------------------------
        # 📤 3. Upload PDF to Client Folder
        # ----------------------------------
        with open(pdf_path, 'rb') as pdf_file:
            upload_metadata = {
                "name": pdf_filename,
                "parents": [folder_id]
            }
            
            files = {
                'data': ('metadata', json.dumps(upload_metadata), 'application/json'),
                'file': (pdf_filename, pdf_file, 'application/pdf')
            }
            
            upload_res = requests.post(
                "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
                headers={"Authorization": f"Bearer {access_token}"},
                files=files
            )
        
        if upload_res.status_code not in [200, 201]:
            print(f"❌ PDF upload failed: {upload_res.text}")
            return {"success": False, "error": "PDF upload failed"}
            
        file_id = upload_res.json().get("id")
        pdf_url = f"https://drive.google.com/file/d/{file_id}/view"
        print(f"📤 PDF uploaded: {file_id}")

        # ----------------------------------
        # ✉️ 4. Send Gmail Notification (if scope permits)
        # ----------------------------------
        try:
            message = MIMEMultipart("alternative")
            message["Subject"] = f"Your YoBot Quote - {order_id}"
            message["To"] = client_email
            message["From"] = "me"

            html_content = f"""
            <html>
              <body>
                <h2>Your YoBot Quote is Ready!</h2>
                <p>Hi {client_name},</p>
                <p>Thank you for your interest in YoBot Enterprise Solutions.</p>
                <p><strong>Package:</strong> {bot_package}</p>
                <p><strong>Total Investment:</strong> {total_cost}</p>
                <p><a href="{pdf_url}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View Your Quote</a></p>
                <p><a href="{folder_url}">Access Your Client Folder</a></p>
                <p>Best regards,<br>The YoBot Team</p>
              </body>
            </html>
            """
            
            message.attach(MIMEText(html_content, "html"))
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()

            email_res = requests.post(
                "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json"
                },
                json={"raw": raw_message}
            )
            
            if email_res.status_code == 200:
                print(f"✉️ Email sent to {client_email}")
            else:
                print(f"⚠️ Email delivery requires Gmail scope - proceeding with Drive links only")
                print(f"Gmail error: {email_res.text}")
                
        except Exception as email_error:
            print(f"⚠️ Email delivery failed: {email_error}")

        return {
            "success": True,
            "folder_id": folder_id,
            "folder_url": folder_url,
            "pdf_id": file_id,
            "pdf_url": pdf_url,
            "client_name": client_name,
            "order_id": order_id
        }

    except Exception as e:
        print(f"❌ Sales order processing failed: {e}")
        return {"success": False, "error": str(e)}

def create_client_folder_only(client_name):
    """
    Create just a Google Drive folder for a client
    """
    try:
        access_token = get_fresh_access_token()
        if not access_token:
            return {"success": False, "error": "Failed to refresh access token"}

        clients_folder_id = "1eBAdAc_polSkFSl-3F0NNH_scN8RzaFE"
        
        folder_metadata = {
            "name": f"YoBot - {client_name}",
            "mimeType": "application/vnd.google-apps.folder",
            "parents": [clients_folder_id]
        }
        
        folder_res = requests.post(
            "https://www.googleapis.com/drive/v3/files",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            },
            json=folder_metadata
        )
        
        if folder_res.status_code != 200:
            return {"success": False, "error": "Folder creation failed"}
            
        folder_id = folder_res.json().get("id")
        folder_url = f"https://drive.google.com/drive/folders/{folder_id}"
        
        return {
            "success": True,
            "folder_id": folder_id,
            "folder_url": folder_url
        }

    except Exception as e:
        return {"success": False, "error": str(e)}