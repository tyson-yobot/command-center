import os
import json
import requests
import datetime
from fpdf import FPDF

def get_google_access_token():
    """Get Google access token using refresh token"""
    refresh_token = os.getenv("GOOGLE_REFRESH_TOKEN")
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    
    if not all([refresh_token, client_id, client_secret]):
        raise Exception("Missing Google credentials")
    
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "client_id": client_id,
        "client_secret": client_secret,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token"
    }
    
    response = requests.post(token_url, data=data)
    if response.status_code != 200:
        raise Exception(f"Token refresh failed: {response.text}")
    
    return response.json()["access_token"]

def create_google_drive_folder(folder_name, parent_folder_id=None):
    """Create folder in Google Drive"""
    access_token = get_google_access_token()
    
    url = "https://www.googleapis.com/drive/v3/files"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    folder_metadata = {
        "name": folder_name,
        "mimeType": "application/vnd.google-apps.folder"
    }
    
    if parent_folder_id:
        folder_metadata["parents"] = [parent_folder_id]
    
    response = requests.post(url, headers=headers, json=folder_metadata)
    
    if response.status_code != 200:
        raise Exception(f"Folder creation failed: {response.text}")
    
    return response.json()["id"]

def upload_pdf_to_drive(pdf_path, folder_id, file_name):
    """Upload PDF to Google Drive folder"""
    access_token = get_google_access_token()
    
    # Upload file
    url = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    metadata = {
        "name": file_name,
        "parents": [folder_id]
    }
    
    files = {
        'metadata': (None, json.dumps(metadata), 'application/json'),
        'media': (file_name, open(pdf_path, 'rb'), 'application/pdf')
    }
    
    response = requests.post(url, headers=headers, files=files)
    
    if response.status_code != 200:
        raise Exception(f"PDF upload failed: {response.text}")
    
    return response.json()["id"]

def generate_professional_quote_pdf(company_name, quote_number, package, total, addons=None):
    """Generate professional quote PDF with real data"""
    pdf = FPDF()
    pdf.add_page()
    
    # Header
    pdf.set_font('Arial', 'B', 20)
    pdf.cell(0, 15, 'YoBot Enterprise Solutions', 0, 1, 'C')
    pdf.set_font('Arial', '', 12)
    pdf.cell(0, 10, 'Intelligent Automation & AI Systems', 0, 1, 'C')
    pdf.ln(10)
    
    # Quote details
    pdf.set_font('Arial', 'B', 16)
    pdf.cell(0, 10, f'Quote #{quote_number}', 0, 1)
    pdf.set_font('Arial', '', 12)
    pdf.cell(0, 8, f'Date: {datetime.datetime.now().strftime("%B %d, %Y")}', 0, 1)
    pdf.cell(0, 8, f'Company: {company_name}', 0, 1)
    pdf.ln(5)
    
    # Package details
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(0, 10, 'Package Details:', 0, 1)
    pdf.set_font('Arial', '', 12)
    pdf.cell(0, 8, f'Selected Package: {package}', 0, 1)
    
    if addons:
        pdf.cell(0, 8, 'Add-ons:', 0, 1)
        for addon in addons:
            pdf.cell(0, 6, f'  • {addon}', 0, 1)
    
    pdf.ln(10)
    
    # Pricing
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(0, 10, f'Total Investment: {total}', 0, 1)
    
    # Save PDF
    pdf_filename = f"{company_name}_{quote_number}.pdf"
    pdf_path = f"/tmp/{pdf_filename}"
    pdf.output(pdf_path)
    
    return pdf_path, pdf_filename

def process_complete_google_drive_order(order_data):
    """Complete Google Drive order processing with real data"""
    try:
        # Extract real order data
        company_name = order_data.get('customer_name', '')
        email = order_data.get('email', '')
        package = order_data.get('package', '')
        total = order_data.get('total', '')
        addons = order_data.get('addons', [])
        
        print(f"Processing Google Drive order for {company_name}")
        
        # Generate proper quote number without abbreviations
        today = datetime.datetime.now().strftime("%Y%m%d")
        timestamp = datetime.datetime.now().strftime("%H%M")
        quote_number = f"Q-{today}-{timestamp}"
        
        # Create main client folder with proper naming
        folder_name = f"{company_name} - {quote_number}"
        main_folder_id = create_google_drive_folder(folder_name)
        
        # Create subfolders
        quotes_folder_id = create_google_drive_folder("Quotes", main_folder_id)
        contracts_folder_id = create_google_drive_folder("Contracts", main_folder_id)
        communications_folder_id = create_google_drive_folder("Communications", main_folder_id)
        
        # Generate professional PDF with real data
        pdf_path, pdf_filename = generate_professional_quote_pdf(
            company_name, quote_number, package, total, addons
        )
        
        # Upload PDF to quotes folder
        pdf_file_id = upload_pdf_to_drive(pdf_path, quotes_folder_id, pdf_filename)
        
        # Create folder URL
        folder_url = f"https://drive.google.com/drive/folders/{main_folder_id}"
        pdf_url = f"https://drive.google.com/file/d/{pdf_file_id}/view"
        
        # Clean up local PDF
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
        
        result = {
            "success": True,
            "client_name": company_name,
            "quote_number": quote_number,
            "email": email,
            "package": package,
            "total": total,
            "addons": addons,
            "folder_id": main_folder_id,
            "folder_url": folder_url,
            "pdf_file_id": pdf_file_id,
            "pdf_url": pdf_url,
            "quotes_folder_id": quotes_folder_id,
            "contracts_folder_id": contracts_folder_id,
            "communications_folder_id": communications_folder_id,
            "processing_time": datetime.datetime.now().isoformat(),
            "method": "Google Drive Integration"
        }
        
        return result
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "client_name": order_data.get('customer_name', 'Unknown'),
            "processing_time": datetime.datetime.now().isoformat(),
            "method": "Google Drive Integration"
        }

if __name__ == "__main__":
    # Test with real data structure
    test_order = {
        "customer_name": "Advanced Dental Solutions",
        "email": "info@advanceddental.com",
        "package": "YoBot Enterprise Package",
        "total": "$125,000",
        "addons": ["SmartSpend Dashboard", "Voice Analytics", "Custom Integration"]
    }
    
    result = process_complete_google_drive_order(test_order)
    print(json.dumps(result, indent=2))