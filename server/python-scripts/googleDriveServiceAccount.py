import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

def get_service_account_credentials():
    """Get Google credentials using service account key"""
    try:
        # Try to get service account from environment
        creds_json = os.getenv("GOOGLE_DRIVE_CREDENTIALS")
        if not creds_json:
            return {"success": False, "error": "No service account credentials found"}
            
        # Parse the JSON credentials
        creds_data = json.loads(creds_json)
        
        # Create credentials object
        credentials = service_account.Credentials.from_service_account_info(
            creds_data,
            scopes=['https://www.googleapis.com/auth/drive']
        )
        
        return {"success": True, "credentials": credentials}
    except Exception as e:
        return {"success": False, "error": str(e)}

def create_drive_folder_service_account(client_name):
    """Create Google Drive folder using service account"""
    try:
        creds_result = get_service_account_credentials()
        if not creds_result["success"]:
            return creds_result
            
        service = build('drive', 'v3', credentials=creds_result["credentials"])
        
        # Your specified parent folder ID
        parent_folder_id = "1-D1Do5bWsHWX1R7YexNEBLsgpBsV7WRh"
        
        print(f"🔍 Creating folder for '{client_name}' in parent {parent_folder_id}")
        
        # Create new folder
        folder_metadata = {
            'name': client_name,
            'mimeType': 'application/vnd.google-apps.folder',
            'parents': [parent_folder_id]
        }
        
        folder = service.files().create(body=folder_metadata, fields='id,webViewLink').execute()
        folder_id = folder.get('id')
        
        print(f"✅ Folder created: {folder_id}")
        
        return {
            "success": True,
            "folder_id": folder_id,
            "folder_url": folder.get('webViewLink'),
            "folder_name": client_name
        }
        
    except Exception as e:
        print(f"❌ Service account folder creation failed: {str(e)}")
        return {"success": False, "error": str(e)}

def upload_pdf_service_account(pdf_path, folder_id, client_name, quote_number):
    """Upload PDF using service account"""
    try:
        creds_result = get_service_account_credentials()
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
        
        print(f"✅ PDF uploaded: {uploaded_file.get('id')}")
        
        return {
            "success": True,
            "file_id": uploaded_file.get('id'),
            "file_url": uploaded_file.get('webViewLink')
        }
        
    except Exception as e:
        print(f"❌ Service account PDF upload failed: {str(e)}")
        return {"success": False, "error": str(e)}