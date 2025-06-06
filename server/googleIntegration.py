import requests, json
from fpdf import FPDF
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import base64
import os
from datetime import datetime

# ----------------------------------
# 🔐 AUTH: ACCESS TOKEN
# ----------------------------------
ACCESS_TOKEN = "ya29.a0AW4Xtxh3Ol7z5GXcB6jDg9zdaQzbrfJdKm1aklw4qsBJoS13GP0OQWassOF-6u_Att_H9uI0jH4VirY6k1RFWATG2UsdrGTFT4WrmZIy-NfmorqzrR9XY-HJntQkj1tAYr_rH-N3WJ1i_bOw7nL2HAHB2gdqSbTM-5RZsWn6aCgYKAewSARMSFQHGX2Mi2BigMOSRyvdyL4y2bNOt0Q0175"

def process_sales_order_complete(order_data):
    """
    Complete sales order processing with Google Drive folder creation,
    PDF generation, upload, and Gmail delivery
    """
    try:
        # Extract order details
        client_name = order_data.get('customer_name', 'Valued Client')
        client_email = order_data.get('email', 'customer@example.com')
        bot_package = order_data.get('package', 'Standard')
        addons = order_data.get('addons', [])
        total_cost = order_data.get('total', '$0')
        order_id = order_data.get('order_id', datetime.now().strftime('%Y%m%d'))

        print(f"🚀 Processing complete sales order for {client_name}")

        # ----------------------------------
        # 📁 1. Create Google Drive Folder
        # ----------------------------------
        folder_metadata = {
            "name": f"YoBot - {client_name}",
            "mimeType": "application/vnd.google-apps.folder"
        }
        res = requests.post(
            "https://www.googleapis.com/drive/v3/files",
            headers={
                "Authorization": f"Bearer {ACCESS_TOKEN}",
                "Content-Type": "application/json"
            },
            json=folder_metadata
        )
        
        if res.status_code != 200:
            print(f"❌ Folder creation failed: {res.text}")
            return {"success": False, "error": "Drive folder creation failed"}
            
        folder_id = res.json().get("id")
        folder_url = f"https://drive.google.com/drive/folders/{folder_id}"
        print(f"📁 Folder created: {folder_id}")

        # ----------------------------------
        # 🧾 2. Generate PDF Quote
        # ----------------------------------
        pdf_filename = f"YoBot_Quote_{client_name.replace(' ', '_')}_{order_id}.pdf"
        
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", "B", 16)
        pdf.cell(200, 10, txt="YoBot AI Solutions", ln=True, align='C')
        pdf.set_font("Arial", size=12)
        pdf.cell(200, 10, txt="", ln=True)
        pdf.cell(200, 10, txt=f"Quote for: {client_name}", ln=True)
        pdf.cell(200, 10, txt=f"Date: {datetime.now().strftime('%B %d, %Y')}", ln=True)
        pdf.cell(200, 10, txt=f"Quote ID: {order_id}", ln=True)
        pdf.cell(200, 10, txt="", ln=True)
        pdf.set_font("Arial", "B", 12)
        pdf.cell(200, 10, txt="Package Details:", ln=True)
        pdf.set_font("Arial", size=12)
        pdf.cell(200, 10, txt=f"Bot Package: {bot_package}", ln=True)
        
        if addons:
            pdf.cell(200, 10, txt=f"Add-ons: {', '.join(addons)}", ln=True)
        
        pdf.cell(200, 10, txt=f"Total Investment: {total_cost}", ln=True)
        pdf.cell(200, 10, txt="", ln=True)
        pdf.set_font("Arial", "B", 12)
        pdf.cell(200, 10, txt="Next Steps:", ln=True)
        pdf.set_font("Arial", size=12)
        pdf.cell(200, 10, txt="1. Review and approve this quote", ln=True)
        pdf.cell(200, 10, txt="2. Schedule implementation kickoff", ln=True)
        pdf.cell(200, 10, txt="3. Begin AI automation setup", ln=True)
        pdf.cell(200, 10, txt="", ln=True)
        pdf.cell(200, 10, txt="Contact: sales@yobot.ai", ln=True)
        
        pdf.output(pdf_filename)
        print(f"🧾 PDF generated: {pdf_filename}")

        # ----------------------------------
        # 📤 3. Upload PDF to Drive Folder
        # ----------------------------------
        upload_url = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart"
        metadata = {
            "name": pdf_filename,
            "parents": [folder_id]
        }
        files = {
            "data": ("metadata", json.dumps(metadata), "application/json"),
            "file": open(pdf_filename, "rb")
        }
        res = requests.post(
            upload_url,
            headers={"Authorization": f"Bearer {ACCESS_TOKEN}"},
            files=files
        )
        
        if res.status_code != 200:
            print(f"❌ Upload failed: {res.text}")
            return {"success": False, "error": "PDF upload failed"}
            
        file_id = res.json().get("id")
        drive_pdf_url = f"https://drive.google.com/file/d/{file_id}/view"
        print(f"📤 PDF uploaded: {file_id}")

        # ----------------------------------
        # ✉️ 4. Email Client PDF Link
        # ----------------------------------
        message = MIMEMultipart("alternative")
        message["Subject"] = f"Your YoBot Quote - {client_name}"
        message["To"] = client_email
        message["From"] = "me"

        html = f"""
        <html>
          <body>
            <h2>Your YoBot AI Solutions Quote</h2>
            <p>Dear {client_name},</p>
            <p>Thank you for your interest in YoBot's AI automation solutions!</p>
            
            <h3>Quote Summary:</h3>
            <ul>
                <li><strong>Package:</strong> {bot_package}</li>
                {f'<li><strong>Add-ons:</strong> {", ".join(addons)}</li>' if addons else ''}
                <li><strong>Total Investment:</strong> {total_cost}</li>
                <li><strong>Quote ID:</strong> {order_id}</li>
            </ul>
            
            <p><a href="{drive_pdf_url}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">📄 View Your Complete Quote</a></p>
            
            <p><a href="{folder_url}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">📁 Access Your Client Folder</a></p>
            
            <p>We're excited to help transform your business with AI automation. Please review the quote and let us know if you have any questions.</p>
            
            <p>Best regards,<br>
            The YoBot Sales Team<br>
            Email: sales@yobot.ai</p>
          </body>
        </html>
        """

        message.attach(MIMEText(html, "html"))
        encoded = base64.urlsafe_b64encode(message.as_bytes()).decode()

        res = requests.post(
            "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
            headers={
                "Authorization": f"Bearer {ACCESS_TOKEN}",
                "Content-Type": "application/json"
            },
            json={"raw": encoded}
        )

        if res.status_code != 200:
            print(f"❌ Email failed: {res.text}")
            return {"success": False, "error": "Email delivery failed"}

        print(f"✉️ Email sent to {client_email}")

        # Clean up local PDF file
        try:
            os.remove(pdf_filename)
        except:
            pass

        return {
            "success": True,
            "folder_id": folder_id,
            "folder_url": folder_url,
            "pdf_url": drive_pdf_url,
            "email_sent": True,
            "client_name": client_name,
            "client_email": client_email,
            "order_id": order_id
        }

    except Exception as e:
        print(f"❌ Complete sales order processing error: {e}")
        return {
            "success": False,
            "error": str(e),
            "client_name": order_data.get('customer_name', 'Unknown'),
            "order_id": order_data.get('order_id', 'N/A')
        }

def create_client_folder_only(client_name):
    """
    Create just a Google Drive folder for a client
    """
    try:
        folder_metadata = {
            "name": f"YoBot - {client_name}",
            "mimeType": "application/vnd.google-apps.folder"
        }
        res = requests.post(
            "https://www.googleapis.com/drive/v3/files",
            headers={
                "Authorization": f"Bearer {ACCESS_TOKEN}",
                "Content-Type": "application/json"
            },
            json=folder_metadata
        )
        
        if res.status_code == 200:
            folder_data = res.json()
            folder_id = folder_data["id"]
            folder_url = f"https://drive.google.com/drive/folders/{folder_id}"
            
            print(f"✅ Drive folder created for {client_name}: {folder_id}")
            
            return {
                "success": True,
                "folder_id": folder_id,
                "folder_url": folder_url,
                "client_name": client_name
            }
        else:
            print(f"❌ Drive folder creation failed: {res.text}")
            return {"success": False, "error": f"API error: {res.status_code}"}
            
    except Exception as e:
        print(f"❌ Drive folder creation error: {e}")
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    # Test the complete workflow
    test_order = {
        "customer_name": "Tyson Lerfald",
        "email": "tyson@yobot.bot",
        "package": "Platinum",
        "addons": ["SmartSpend™", "CRM Sync", "VoiceBot"],
        "total": "$25,000 setup + $1,999/mo",
        "order_id": "Q-20250606-001"
    }
    
    result = process_sales_order_complete(test_order)
    print("Final result:", result)