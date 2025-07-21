"""
function_library_full_cleaned.py - Core utility functions for YoBot Command Center
"""
import os
import json
import logging
import datetime as dt
from typing import Dict, Any, List, Optional, Union

# Configure logging
logger = logging.getLogger("yobot.function_library")
logger.setLevel(logging.INFO)

# ── Airtable helpers ───────────────────────────────────────────────
def airtable_create_record(base_id: str, table_name: str, fields: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new record in Airtable and return the created record."""
    try:
        from airtable import Airtable
        api_key = os.environ["AIRTABLE_API_KEY"]
        table = Airtable(base_id, table_name, api_key)
        record = table.insert(fields)
        logger.info(f"Created record in {table_name}: {record['id']}")
        return record
    except Exception as e:
        logger.error(f"Failed to create Airtable record: {str(e)}")
        raise

def airtable_get_record(base_id: str, table_name: str, record_id: str) -> Optional[Dict[str, Any]]:
    """Get a record from Airtable by ID."""
    try:
        from airtable import Airtable
        api_key = os.environ["AIRTABLE_API_KEY"]
        table = Airtable(base_id, table_name, api_key)
        record = table.get(record_id)
        return record
    except Exception as e:
        logger.error(f"Failed to get Airtable record {record_id}: {str(e)}")
        return None

def airtable_update_record(base_id: str, table_name: str, record_id: str, fields: Dict[str, Any]) -> Dict[str, Any]:
    """Update an existing record in Airtable."""
    try:
        from airtable import Airtable
        api_key = os.environ["AIRTABLE_API_KEY"]
        table = Airtable(base_id, table_name, api_key)
        record = table.update(record_id, fields)
        logger.info(f"Updated record in {table_name}: {record_id}")
        return record
    except Exception as e:
        logger.error(f"Failed to update Airtable record {record_id}: {str(e)}")
        raise

# ── Quote helpers ─────────────────────────────────────────────────
def create_quote_id(company_name: str) -> str:
    """Generate a unique quote ID based on company name and date."""
    today = dt.datetime.now()
    prefix = ''.join(c for c in company_name[:3].upper() if c.isalpha())
    if not prefix:
        prefix = "YBT"  # Default if company name doesn't have letters
    return f"{prefix}-{today.strftime('%Y%m%d')}-{today.strftime('%H%M')}"

def generate_quote_pdf(order_data: Dict[str, Any], quote_id: str, logo_path: str = None) -> bytes:
    """Generate a PDF quote from order data."""
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
        from reportlab.lib.units import inch
        from io import BytesIO
        
        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter
        
        # Add logo if provided
        if logo_path and os.path.exists(logo_path):
            c.drawImage(logo_path, 50, height - 100, width=100, height=50)
        
        # Add quote header
        c.setFont("Helvetica-Bold", 18)
        c.drawString(50, height - 150, f"Quote #{quote_id}")
        
        # Add company info
        c.setFont("Helvetica", 12)
        c.drawString(50, height - 180, f"Company: {order_data['fields'].get('Company', 'N/A')}")
        c.drawString(50, height - 200, f"Contact: {order_data['fields'].get('Contact Email', 'N/A')}")
        c.drawString(50, height - 220, f"Date: {dt.datetime.now().strftime('%Y-%m-%d')}")
        
        # Add line items
        y_position = height - 280
        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, y_position, "Line Items:")
        y_position -= 20
        
        try:
            line_items = json.loads(order_data['fields'].get('Line Items', '[]'))
            total = 0
            
            for i, item in enumerate(line_items):
                c.setFont("Helvetica", 10)
                item_text = f"{i+1}. {item.get('name', 'Item')} - ${item.get('price', 0)} x {item.get('qty', 1)}"
                c.drawString(70, y_position, item_text)
                y_position -= 15
                total += item.get('price', 0) * item.get('qty', 1)
            
            # Add total
            y_position -= 20
            c.setFont("Helvetica-Bold", 12)
            c.drawString(50, y_position, f"Total: ${total:.2f}")
        except (json.JSONDecodeError, KeyError):
            c.drawString(70, y_position, "No line items found")
        
        # Add footer
        c.setFont("Helvetica-Italic", 8)
        c.drawString(50, 50, "This quote is valid for 30 days from the date of issue.")
        c.drawString(50, 35, "YoBot® - Automation for your business")
        
        c.save()
        pdf_bytes = buffer.getvalue()
        buffer.close()
        
        logger.info(f"Generated PDF quote for {quote_id}")
        return pdf_bytes
    except Exception as e:
        logger.error(f"Failed to generate PDF quote: {str(e)}")
        raise

def create_work_order_tasks(order_data: Dict[str, Any], quote_id: str) -> List[Dict[str, Any]]:
    """Create work order tasks in Airtable based on the order."""
    try:
        base_id = os.environ["AIRTABLE_BASE_ID"]
        tasks_table = os.getenv("AIRTABLE_TASKS_TABLE", "Tasks")
        company = order_data['fields'].get('Company', 'Unknown')
        
        tasks = [
            {"Task": "Initial Setup", "Status": "Not Started", "Quote ID": quote_id, "Company": company},
            {"Task": "Configuration", "Status": "Not Started", "Quote ID": quote_id, "Company": company},
            {"Task": "Training", "Status": "Not Started", "Quote ID": quote_id, "Company": company},
            {"Task": "Final Review", "Status": "Not Started", "Quote ID": quote_id, "Company": company}
        ]
        
        created_tasks = []
        for task in tasks:
            record = airtable_create_record(base_id, tasks_table, task)
            created_tasks.append(record)
        
        logger.info(f"Created {len(created_tasks)} work order tasks for {quote_id}")
        return created_tasks
    except Exception as e:
        logger.error(f"Failed to create work order tasks: {str(e)}")
        raise

# ── Google Drive helpers ─────────────────────────────────────────
def get_drive_service():
    """Get authenticated Google Drive service."""
    try:
        from googleapiclient.discovery import build
        from google.oauth2 import service_account
        
        # Get credentials from environment or file
        creds_path = os.getenv("GOOGLE_CREDENTIALS_PATH")
        if creds_path and os.path.exists(creds_path):
            credentials = service_account.Credentials.from_service_account_file(
                creds_path, scopes=['https://www.googleapis.com/auth/drive']
            )
        else:
            # Use default credentials
            credentials = service_account.Credentials.from_service_account_info(
                json.loads(os.environ["GOOGLE_CREDENTIALS_JSON"]),
                scopes=['https://www.googleapis.com/auth/drive']
            )
        
        service = build('drive', 'v3', credentials=credentials)
        return service
    except Exception as e:
        logger.error(f"Failed to get Drive service: {str(e)}")
        raise

def ensure_drive_folder(drive_service, folder_name: str, parent_id: str = None) -> str:
    """Ensure a folder exists in Google Drive, create if not."""
    try:
        # Check if folder already exists
        query = f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder'"
        if parent_id:
            query += f" and '{parent_id}' in parents"
        
        results = drive_service.files().list(
            q=query,
            spaces='drive',
            fields='files(id, name)'
        ).execute()
        
        items = results.get('files', [])
        
        if items:
            # Folder exists, return its ID
            return items[0]['id']
        else:
            # Create folder
            file_metadata = {
                'name': folder_name,
                'mimeType': 'application/vnd.google-apps.folder'
            }
            if parent_id:
                file_metadata['parents'] = [parent_id]
            
            folder = drive_service.files().create(
                body=file_metadata,
                fields='id'
            ).execute()
            
            logger.info(f"Created Drive folder: {folder_name}")
            return folder.get('id')
    except Exception as e:
        logger.error(f"Failed to ensure Drive folder {folder_name}: {str(e)}")
        raise

def upload_pdf_to_drive(drive_service, folder_id: str, pdf_bytes: bytes, file_name: str) -> str:
    """Upload a PDF to Google Drive and return the link."""
    try:
        from googleapiclient.http import MediaInMemoryUpload
        
        file_metadata = {
            'name': file_name,
            'parents': [folder_id]
        }
        
        media = MediaInMemoryUpload(pdf_bytes, mimetype='application/pdf')
        
        file = drive_service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id,webViewLink'
        ).execute()
        
        logger.info(f"Uploaded PDF to Drive: {file_name}")
        return file.get('webViewLink')
    except Exception as e:
        logger.error(f"Failed to upload PDF to Drive: {str(e)}")
        raise

# ── QuickBooks ───────────────────────────────────────────────────
def create_quickbooks_invoice(order_data: Dict[str, Any], quote_id: str) -> str:
    """Create an invoice in QuickBooks and return the link."""
    try:
        # This would normally use the QuickBooks API
        # For now, we'll just log and return a mock link
        company = order_data['fields'].get('Company', 'Unknown')
        logger.info(f"Created QuickBooks invoice for {company} (Quote ID: {quote_id})")
        return f"https://quickbooks.intuit.com/app/invoices/{quote_id}"
    except Exception as e:
        logger.error(f"Failed to create QuickBooks invoice: {str(e)}")
        raise

# ── DocuSign ────────────────────────────────────────────────────
def send_for_signature(pdf_bytes: bytes, order_data: Dict[str, Any], template_id: str) -> str:
    """Send a document for signature via DocuSign and return the envelope ID."""
    try:
        # This would normally use the DocuSign API
        # For now, we'll just log and return a mock envelope ID
        company = order_data['fields'].get('Company', 'Unknown')
        email = order_data['fields'].get('Contact Email', 'unknown@example.com')
        envelope_id = f"DS-{dt.datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        logger.info(f"Sent document for signature to {email} (Company: {company})")
        return envelope_id
    except Exception as e:
        logger.error(f"Failed to send document for signature: {str(e)}")
        raise

# ── Messaging ────────────────────────────────────────────────────
def send_email(to: List[str], subject: str, body: str, attachments: List[tuple] = None) -> bool:
    """Send an email with optional attachments."""
    try:
        import smtplib
        from email.mime.multipart import MIMEMultipart
        from email.mime.text import MIMEText
        from email.mime.application import MIMEApplication
        
        # Get SMTP settings from environment
        smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_user = os.environ["SMTP_USER"]
        smtp_password = os.environ["SMTP_PASSWORD"]
        from_email = os.getenv("FROM_EMAIL", smtp_user)
        
        # Create message
        msg = MIMEMultipart()
        msg['From'] = from_email
        msg['To'] = ', '.join(to)
        msg['Subject'] = subject
        
        # Add body
        msg.attach(MIMEText(body, 'plain'))
        
        # Add attachments
        if attachments:
            for attachment in attachments:
                mime_type, name, data = attachment
                part = MIMEApplication(data, Name=name)
                part['Content-Disposition'] = f'attachment; filename="{name}"'
                msg.attach(part)
        
        # Send email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
        
        logger.info(f"Sent email to {to} with subject: {subject}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        return False

def send_slack_alert(channel: str, message: str) -> bool:
    """Send an alert to a Slack channel."""
    try:
        import requests
        
        webhook_url = os.environ["SLACK_WEBHOOK_URL"]
        
        payload = {
            "channel": channel,
            "text": message
        }
        
        response = requests.post(
            webhook_url,
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            logger.info(f"Sent Slack alert to {channel}")
            return True
        else:
            logger.warning(f"Failed to send Slack alert: {response.status_code} {response.text}")
            return False
    except Exception as e:
        logger.error(f"Failed to send Slack alert: {str(e)}")
        return False