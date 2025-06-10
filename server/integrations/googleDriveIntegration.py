"""
Google Drive Integration for YoBot Sales Order Automation
Creates client folders and manages document storage
"""

import os
from datetime import datetime
from pydrive.auth import GoogleAuth
from pydrive.drive import GoogleDrive
import json

# Configuration
PARENT_FOLDER_ID = '1BxCvF8mHnGqP3Rw7SzN9KjL4MxQ6YtE2'  # Main "1. Clients" folder ID

def authenticate_drive():
    """Authenticate with Google Drive using service account"""
    try:
        gauth = GoogleAuth()
        
        # Use service account credentials if available
        if os.path.exists('./client_secret.json'):
            gauth.LoadCredentialsFile('./client_secret.json')
        else:
            # Fall back to interactive auth
            gauth.LocalWebserverAuth()
        
        drive = GoogleDrive(gauth)
        return drive
    except Exception as e:
        print(f"Google Drive authentication failed: {str(e)}")
        return None

def create_client_folder(company_name):
    """
    Creates a folder using the client's company name inside the 1. Clients directory.
    Returns the folder ID if successful, None if failed.
    """
    try:
        drive = authenticate_drive()
        if not drive:
            return None

        # Clean company name for folder creation
        clean_name = "".join(c for c in company_name if c.isalnum() or c in (' ', '-', '_')).strip()
        
        folder_metadata = {
            'title': clean_name,
            'mimeType': 'application/vnd.google-apps.folder',
            'parents': [{'id': PARENT_FOLDER_ID}]
        }

        folder = drive.CreateFile(folder_metadata)
        folder.Upload()
        
        print(f'✅ Google Drive folder created: {clean_name}')
        
        return {
            'success': True,
            'folder_id': folder['id'],
            'folder_name': clean_name,
            'folder_url': f"https://drive.google.com/drive/folders/{folder['id']}",
            'message': f'Folder created successfully for {company_name}'
        }
        
    except Exception as e:
        print(f'❌ Failed to create Google Drive folder: {str(e)}')
        return {
            'success': False,
            'error': str(e),
            'message': 'Failed to create Google Drive folder'
        }

def upload_file_to_client_folder(file_path, folder_id, file_name=None):
    """
    Upload a file to a specific client folder in Google Drive
    """
    try:
        drive = authenticate_drive()
        if not drive:
            return None

        if not file_name:
            file_name = os.path.basename(file_path)

        file_metadata = {
            'title': file_name,
            'parents': [{'id': folder_id}]
        }

        file_obj = drive.CreateFile(file_metadata)
        file_obj.SetContentFile(file_path)
        file_obj.Upload()

        return {
            'success': True,
            'file_id': file_obj['id'],
            'file_url': f"https://drive.google.com/file/d/{file_obj['id']}/view",
            'message': f'File {file_name} uploaded successfully'
        }

    except Exception as e:
        print(f'❌ Failed to upload file to Google Drive: {str(e)}')
        return {
            'success': False,
            'error': str(e),
            'message': 'Failed to upload file to Google Drive'
        }

def get_client_folder(company_name):
    """
    Search for existing client folder by company name
    """
    try:
        drive = authenticate_drive()
        if not drive:
            return None

        clean_name = "".join(c for c in company_name if c.isalnum() or c in (' ', '-', '_')).strip()
        
        # Search for folder by name within the parent folder
        file_list = drive.ListFile({
            'q': f"'{PARENT_FOLDER_ID}' in parents and title='{clean_name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
        }).GetList()

        if file_list:
            folder = file_list[0]
            return {
                'success': True,
                'folder_id': folder['id'],
                'folder_name': folder['title'],
                'folder_url': f"https://drive.google.com/drive/folders/{folder['id']}",
                'message': f'Found existing folder for {company_name}'
            }
        else:
            return {
                'success': False,
                'message': f'No folder found for {company_name}'
            }

    except Exception as e:
        print(f'❌ Failed to search for client folder: {str(e)}')
        return {
            'success': False,
            'error': str(e),
            'message': 'Failed to search for client folder'
        }

def test_google_drive_integration():
    """Test Google Drive integration"""
    try:
        # Test authentication
        drive = authenticate_drive()
        if not drive:
            return {
                'success': False,
                'message': 'Google Drive authentication failed'
            }

        # Test folder creation
        test_result = create_client_folder("Test Company - YoBot Integration")
        
        return {
            'success': True,
            'message': 'Google Drive integration test completed',
            'test_result': test_result
        }

    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'message': 'Google Drive integration test failed'
        }

if __name__ == "__main__":
    # Run integration test
    result = test_google_drive_integration()
    print(json.dumps(result, indent=2))