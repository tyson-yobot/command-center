"""
modules/sales_order.py - Helper functions for sales order processing
"""
import os
import logging
from typing import Tuple, Optional

logger = logging.getLogger("yobot.sales_order")
logger.setLevel(logging.INFO)

def create_client_folder(drive_service, company_name: str) -> Tuple[str, bool]:
    """
    Creates a folder structure for a client in Google Drive:
    1 - Clients / <Company> / ...
    
    Returns:
        Tuple of (folder_id, created_new)
    """
    try:
        from ..function_library_full_cleaned import ensure_drive_folder
        
        # Get the parent folder ID (1 - Clients)
        parent_id = os.environ["GOOGLE_DRIVE_PARENT_ID"]
        
        # Create or get the client folder
        client_folder_id = ensure_drive_folder(drive_service, company_name, parent_id)
        
        # Check if this was a new folder or existing one
        query = f"name='{company_name}' and mimeType='application/vnd.google-apps.folder' and '{parent_id}' in parents"
        results = drive_service.files().list(
            q=query,
            spaces='drive',
            fields='files(id, createdTime)'
        ).execute()
        
        items = results.get('files', [])
        
        # If the folder was just created, the createdTime will be very recent
        import datetime
        now = datetime.datetime.utcnow()
        created_new = False
        
        if items:
            created_time = datetime.datetime.fromisoformat(items[0]['createdTime'].replace('Z', '+00:00'))
            created_new = (now - created_time).total_seconds() < 10  # Created within the last 10 seconds
        
        # Create standard subfolders if this is a new client
        if created_new:
            ensure_drive_folder(drive_service, "Quotes", client_folder_id)
            ensure_drive_folder(drive_service, "Contracts", client_folder_id)
            ensure_drive_folder(drive_service, "Invoices", client_folder_id)
            ensure_drive_folder(drive_service, "Documents", client_folder_id)
            logger.info(f"Created standard folder structure for {company_name}")
        
        return client_folder_id, created_new
    except Exception as e:
        logger.error(f"Failed to create client folder for {company_name}: {str(e)}")
        raise