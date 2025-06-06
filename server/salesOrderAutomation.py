import requests, json, datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import base64
import os

# ------------------------------
# 🔐 OAuth Credentials (From You)
# ------------------------------
CLIENT_ID = "685952645658-k8glf5nnp4d2u1cafih1pbauudus3nc.apps.googleusercontent.com"
CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "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")
REFRESH_TOKEN = os.getenv("GOOGLE_REFRESH_TOKEN", "1//0g9GnAKVfRlM9CgYIARAAGBASNwF-L9IrBya2ZudqCC8oAaznpP3_Xd-JvwWc41WFlvT44G9UN3hiEtZWTyN2YfAmBtQdpTfdkA")
TEMPLATE_DOC_ID = "1MuPApi3WCiCkjLG4I78uPklP2aNk-PrlU5-R3CDbjbQ"

def process_complete_sales_order(order_data):
    """
    Complete sales order processing with Google Drive folder, PDF generation, and Gmail delivery
    Based on your working script
    """
    try:
        # Extract order details
        client_name = order_data.get('customer_name', 'Valued Client')
        contact_name = client_name.split()[0] if client_name else 'Contact'
        contact_email = order_data.get('email', 'customer@example.com')
        contact_phone = order_data.get('phone', '(000) 000-0000')
        company_name = order_data.get('company', f"{client_name} Inc.")
        
        bot_package = order_data.get('package', 'Standard Bot')
        package_price = order_data.get('total', '$0')
        monthly_fee = order_data.get('monthly_fee', '$0')
        package_description = f"Includes Full White Label, Custom Analytics, Support Rep"
        
        addons = order_data.get('addons', [])
        addon_list = []
        for addon in addons:
            if isinstance(addon, str):
                addon_list.append({"name": addon, "description": "Premium feature", "qty": 1, "price": "$499"})
            else:
                addon_list.append(addon)
        
        subtotal = package_price
        tax_rate = "7.5%"
        # Calculate tax from total
        total_amount = float(package_price.replace('$', '').replace(',', '')) if package_price != '$0' else 0
        tax_amount = f"${total_amount * 0.075:.2f}"
        total_price = f"${total_amount * 1.075:.2f}"
        
        order_id = order_data.get('order_id', f"Q-{datetime.datetime.today().strftime('%Y%m%d')}-001")

        print(f"🚀 Processing complete sales order for {client_name}")

        # ------------------------------
        # 🔁 Step 1: Refresh Token
        # ------------------------------
        token_response = requests.post("https://oauth2.googleapis.com/token", data={
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "refresh_token": REFRESH_TOKEN,
            "grant_type": "refresh_token"
        })
        
        if token_response.status_code != 200:
            print(f"❌ Token refresh failed: {token_response.text}")
            return {"success": False, "error": f"OAuth token refresh failed: {token_response.text}"}
            
        token_data = token_response.json()
        access_token = token_data.get("access_token")
        
        if not access_token:
            return {"success": False, "error": "No access token received"}

        print("🔐 Access token refreshed successfully")

        # ------------------------------
        # 📁 Step 2: Create Folder
        # ------------------------------
        folder_name = company_name
        folder_response = requests.post("https://www.googleapis.com/drive/v3/files", headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }, json={
            "name": folder_name,
            "mimeType": "application/vnd.google-apps.folder"
        })
        
        if folder_response.status_code != 200:
            print(f"❌ Folder creation failed: {folder_response.text}")
            return {"success": False, "error": f"Folder creation failed: {folder_response.text}"}
            
        folder_data = folder_response.json()
        folder_id = folder_data["id"]
        folder_url = f"https://drive.google.com/drive/folders/{folder_id}"
        print(f"📁 Folder created: {folder_id}")

        # ------------------------------
        # 📄 Step 3: Copy Template Doc
        # ------------------------------
        copy_response = requests.post(f"https://www.googleapis.com/drive/v3/files/{TEMPLATE_DOC_ID}/copy", headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }, json={
            "name": f"{client_name} Quote",
            "parents": [folder_id]
        })
        
        if copy_response.status_code != 200:
            print(f"❌ Document copy failed: {copy_response.text}")
            return {"success": False, "error": f"Document copy failed: {copy_response.text}"}
            
        copy_data = copy_response.json()
        doc_id = copy_data["id"]
        print(f"📄 Document copied: {doc_id}")

        # ------------------------------
        # ✏️ Step 4: Replace Fields in Doc
        # ------------------------------
        replace_requests = [
            {"replaceAllText": {"containsText": {"text": "{{ClientName}}"}, "replaceText": client_name}},
            {"replaceAllText": {"containsText": {"text": "{{ContactName}}"}, "replaceText": contact_name}},
            {"replaceAllText": {"containsText": {"text": "{{ContactEmail}}"}, "replaceText": contact_email}},
            {"replaceAllText": {"containsText": {"text": "{{ContactPhone}}"}, "replaceText": contact_phone}},
            {"replaceAllText": {"containsText": {"text": "{{BotPackage}}"}, "replaceText": bot_package}},
            {"replaceAllText": {"containsText": {"text": "{{PackageDescription}}"}, "replaceText": package_description}},
            {"replaceAllText": {"containsText": {"text": "{{PackagePrice}}"}, "replaceText": package_price}},
            {"replaceAllText": {"containsText": {"text": "{{Monthly Fee}}"}, "replaceText": monthly_fee}},
            {"replaceAllText": {"containsText": {"text": "{{Subtotal}}"}, "replaceText": subtotal}},
            {"replaceAllText": {"containsText": {"text": "{{TaxRate}}"}, "replaceText": tax_rate}},
            {"replaceAllText": {"containsText": {"text": "{{TaxAmount}}"}, "replaceText": tax_amount}},
            {"replaceAllText": {"containsText": {"text": "{{TotalPrice}}"}, "replaceText": total_price}},
            {"replaceAllText": {"containsText": {"text": "{{Date}}"}, "replaceText": datetime.datetime.today().strftime("%Y-%m-%d")}},
            {"replaceAllText": {"containsText": {"text": "{{QuoteNumber}}"}, "replaceText": order_id}}
        ]

        update_response = requests.post(f"https://docs.googleapis.com/v1/documents/{doc_id}:batchUpdate", headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }, json={
            "requests": replace_requests
        })
        
        if update_response.status_code != 200:
            print(f"❌ Document update failed: {update_response.text}")
            return {"success": False, "error": f"Document update failed: {update_response.text}"}

        print("✏️ Document fields updated")

        # ------------------------------
        # 📄 Step 5: Export to PDF
        # ------------------------------
        export_response = requests.get(f"https://www.googleapis.com/drive/v3/files/{doc_id}/export?mimeType=application/pdf", headers={
            "Authorization": f"Bearer {access_token}"
        })
        
        if export_response.status_code != 200:
            print(f"❌ PDF export failed: {export_response.status_code}")
            return {"success": False, "error": f"PDF export failed: {export_response.status_code}"}
            
        pdf_data = export_response.content
        print("📄 PDF exported successfully")

        # ------------------------------
        # 📤 Step 6: Upload PDF to Drive
        # ------------------------------
        pdf_filename = f"{client_name} – {order_id}.pdf"
        metadata = {
            "name": pdf_filename,
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
            print(f"❌ PDF upload failed: {upload_response.text}")
            return {"success": False, "error": f"PDF upload failed: {upload_response.text}"}
            
        upload_data = upload_response.json()
        pdf_id = upload_data["id"]
        pdf_link = f"https://drive.google.com/file/d/{pdf_id}/view"
        print(f"📤 PDF uploaded: {pdf_id}")

        # ------------------------------
        # ✉️ Step 7: Send Email to Client
        # ------------------------------
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"YoBot® Quote – {order_id}"
            msg["To"] = contact_email
            msg["From"] = "me"

            html = f"""
            <p>Hi {client_name},</p>
            <p>Your quote is ready!<br>
            <a href="{pdf_link}">Click here to view/download the PDF</a></p>
            <p>Thanks!<br><strong>YoBot Team</strong></p>
            """

            msg.attach(MIMEText(html, "html"))
            raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
            
            email_response = requests.post("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }, json={"raw": raw})
            
            email_sent = email_response.status_code == 200
            if email_sent:
                print(f"✉️ Email sent to {contact_email}")
            else:
                print(f"⚠️ Email sending failed: {email_response.text}")

        except Exception as email_error:
            print(f"⚠️ Email sending error: {email_error}")
            email_sent = False

        return {
            "success": True,
            "client_name": client_name,
            "order_id": order_id,
            "folder_id": folder_id,
            "folder_url": folder_url,
            "pdf_id": pdf_id,
            "pdf_url": pdf_link,
            "email_sent": email_sent,
            "processing_time": datetime.datetime.now().isoformat()
        }

    except Exception as e:
        print(f"❌ Sales order processing failed: {e}")
        return {"success": False, "error": str(e)}

def create_simple_folder(client_name):
    """
    Create just a Google Drive folder for testing
    """
    try:
        # Get access token
        token_response = requests.post("https://oauth2.googleapis.com/token", data={
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "refresh_token": REFRESH_TOKEN,
            "grant_type": "refresh_token"
        })
        
        if token_response.status_code != 200:
            return {"success": False, "error": "Token refresh failed"}
            
        access_token = token_response.json().get("access_token")
        
        # Create folder
        folder_response = requests.post("https://www.googleapis.com/drive/v3/files", headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }, json={
            "name": f"YoBot - {client_name}",
            "mimeType": "application/vnd.google-apps.folder"
        })
        
        if folder_response.status_code != 200:
            return {"success": False, "error": "Folder creation failed"}
            
        folder_id = folder_response.json()["id"]
        folder_url = f"https://drive.google.com/drive/folders/{folder_id}"
        
        return {
            "success": True,
            "folder_id": folder_id,
            "folder_url": folder_url
        }

    except Exception as e:
        return {"success": False, "error": str(e)}