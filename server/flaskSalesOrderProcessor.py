from flask import Flask, request, jsonify
from datetime import datetime
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
import os, textwrap

app = Flask(__name__)

# === Google Drive Setup ===
import os
import json

SCOPES = ['https://www.googleapis.com/auth/drive']

# Use Google Drive credentials from environment
credentials_json = os.getenv('GOOGLE_DRIVE_CREDENTIALS')
if credentials_json:
    try:
        # Clean the JSON string - remove any extra quotes or escaping
        cleaned_json = credentials_json.strip()
        if cleaned_json.startswith('"') and cleaned_json.endswith('"'):
            cleaned_json = cleaned_json[1:-1]
        cleaned_json = cleaned_json.replace('\\"', '"')
        
        credentials_info = json.loads(cleaned_json)
        credentials = service_account.Credentials.from_service_account_info(
            credentials_info, scopes=SCOPES)
    except json.JSONDecodeError as e:
        print(f"Error parsing Google Drive credentials: {e}")
        # Fallback to file
        SERVICE_ACCOUNT_FILE = '../credentials.json'
        credentials = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, scopes=SCOPES)
else:
    # Fallback to file if environment variable not available
    SERVICE_ACCOUNT_FILE = '../credentials.json'
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
drive_service = build('drive', 'v3', credentials=credentials)

# === Helper: Find or create folder ===
def get_or_create_folder(name, parent_id=None):
    query = f"name='{name}' and mimeType='application/vnd.google-apps.folder'"
    if parent_id:
        query += f" and '{parent_id}' in parents"
    results = drive_service.files().list(q=query, spaces='drive', fields='files(id)').execute()
    items = results.get('files', [])
    if items:
        return items[0]['id']
    metadata = {'name': name, 'mimeType': 'application/vnd.google-apps.folder'}
    if parent_id:
        metadata['parents'] = [parent_id]
    folder = drive_service.files().create(body=metadata, fields='id').execute()
    return folder.get('id')

# === Main Function ===
def process_sales_order(data):

    company = data.get("company_name")
    contact = data.get("contact_name")
    email = data.get("email")
    phone = data.get("phone")
    package = data.get("bot_package", {})
    addons = data.get("addons", [])

    today = datetime.today()
    date_str = today.strftime("%Y-%m-%d")
    quote_number = f"Q-{today.strftime('%Y%m%d')}-001"

    subtotal = package['price'] + sum(a['setup'] for a in addons)
    tax = round(subtotal * 0.063, 2)
    total = subtotal + tax

    # === Generate PDF ===
    pdf_path = f"/tmp/{company} - {quote_number}.pdf"
    doc = SimpleDocTemplate(pdf_path, pagesize=letter, leftMargin=30, rightMargin=30)
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name='Left', alignment=TA_LEFT))
    elems = []

    # Logo
    logo_path = "../Main YoBot Logo.png"  # Path from server directory
    if os.path.exists(logo_path):
        elems.append(Image(logo_path, width=150, height=60))
        elems.append(Spacer(1, 10))

    # Client Info
    for line in [
        f"YoBot, Inc.", "YoBot Turnkey Solutions", "https://yobot.bot", "",
        f"Date: {date_str}", f"Quote #: {quote_number}", "", "Client Information:",
        f"Client Name: {company}", f"Contact: {contact}", f"Email: {email}", f"Phone: {phone}"
    ]:
        elems.append(Paragraph(line, styles["Normal"]))
    elems.append(Spacer(1, 12))

    # Table
    table_data = [["Item", "Description", "Qty", "Price"]]
    table_data.append([
        package['name'], Paragraph("<br/>".join(textwrap.wrap(package['description'], 60)), styles["Left"]),
        "1", f"${package['price']:,.2f}"
    ])
    table_data.append([
        package['name'] + " Monthly Fee", "Monthly Service Fee", "1", f"${package['monthly']:,.2f}"
    ])
    for addon in addons:
        table_data.append([addon['name'], "Add-On Setup Fee", "1", f"${addon['setup']:,.2f}"])
        table_data.append([addon['name'], "Monthly Add-On Fee", "1", f"${addon['monthly']:,.2f}"])

    table = Table(table_data, colWidths=[150, 240, 50, 70])
    table.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, colors.black),
        ('BACKGROUND', (0,0), (-1,0), colors.lightgrey),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ALIGN', (2,1), (3,-1), 'RIGHT')
    ]))
    elems.append(table)
    elems.append(Spacer(1, 10))

    # Totals
    for line in [
        f"Subtotal: ${subtotal:,.2f}",
        f"Tax (6.3%): ${tax:,.2f}",
        f"Total: ${total:,.2f}",
        "✔️ 50% Payment Received – Thank you!"
    ]:
        elems.append(Paragraph(line, styles["Normal"]))
    elems.append(Spacer(1, 20))

    elems.append(Paragraph("""<b>**Terms & Conditions**</b><br/>• Payment due within 30 days.<br/>• Late payments subject to 1.5% monthly fee.<br/>• Contact us with any questions.""", styles["Left"]))
    doc.build(elems)

    # === Upload to Drive ===
    clients_folder_id = get_or_create_folder("1. Clients")
    client_folder_id = get_or_create_folder(company, parent_id=clients_folder_id)
    file_metadata = {'name': f"{company} - {quote_number}.pdf", 'parents': [client_folder_id]}
    media = MediaFileUpload(pdf_path, mimetype='application/pdf')
    file = drive_service.files().create(body=file_metadata, media_body=media, fields='id, webViewLink').execute()

    return {
        "status": "success",
        "quote_number": quote_number,
        "pdf_url": file['webViewLink']
    }

if __name__ == '__main__':
    import sys
    import json
    
    # Read JSON input from stdin
    input_data = sys.stdin.read()
    try:
        data = json.loads(input_data)
        result = process_sales_order(data)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({
            "status": "error",
            "error": str(e)
        }))