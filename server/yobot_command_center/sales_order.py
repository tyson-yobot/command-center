from flask import Blueprint, request, current_app, jsonify
import os
import datetime as dt
import io
import requests
from google.oauth2 import service_account
from googleapiclient.discovery import build
from reportlab.lib.pagesizes import LETTER
from reportlab.pdfgen import canvas

sales_order_bp = Blueprint('sales_order', __name__)

# ENV VARS
AIRTABLE_API_KEY = os.getenv('AIRTABLE_API_KEY')
AIRTABLE_BASE_ID = os.getenv('AIRTABLE_BASE_ID')
AIRTABLE_SALES_TABLE = os.getenv('AIRTABLE_SALES_TABLE', 'Sales Orders')
GOOGLE_SA_FILE = os.getenv('GOOGLE_SA_FILE', 'service_account.json')
GOOGLE_DRIVE_PARENT_ID = os.getenv('GOOGLE_DRIVE_PARENT_ID')
SLACK_WEBHOOK_URL = os.getenv('SLACK_WEBHOOK_URL')

# Airtable helper
def airtable_create_record(fields: dict):
    url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{AIRTABLE_SALES_TABLE}"
    headers = {
        "Authorization": f"Bearer {AIRTABLE_API_KEY}",
        "Content-Type": "application/json"
    }
    resp = requests.post(url, headers=headers, json={"fields": fields})
    resp.raise_for_status()
    return resp.json()

def airtable_get_quote_count(company: str, date_str: str):
    """
    Count existing quotes today for this company.
    """
    url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{AIRTABLE_SALES_TABLE}"
    headers = {
        "Authorization": f"Bearer {AIRTABLE_API_KEY}"
    }
    formula = f"AND({{Company}}='{company}', {{Quote Date}}='{date_str}')"
    params = {"filterByFormula": formula, "fields[]": ["Quote ID"]}
    resp = requests.get(url, headers=headers, params=params)
    resp.raise_for_status()
    records = resp.json().get('records', [])
    return len(records)

# Google Drive helper
def get_drive_service():
    creds = service_account.Credentials.from_service_account_file(GOOGLE_SA_FILE, scopes=[
        'https://www.googleapis.com/auth/drive'
    ])
    return build('drive', 'v3', credentials=creds)

def create_client_folder(service, company_name):
    file_metadata = {
        "name": company_name,
        "mimeType": "application/vnd.google-apps.folder",
        "parents": [GOOGLE_DRIVE_PARENT_ID]
    }
    folder = service.files().create(body=file_metadata, fields='id, webViewLink').execute()
    return folder['id'], folder['webViewLink']

def upload_pdf_to_drive(service, folder_id, pdf_bytes, pdf_name):
    media = {
        'name': pdf_name,
        'mimeType': 'application/pdf',
        'parents': [folder_id]
    }
    file = service.files().create(body=media, media_body=io.BytesIO(pdf_bytes),
                                  fields='id, webViewLink').execute()
    return file['webViewLink']

# PDF helper
def generate_quote_pdf(data: dict, quote_id: str):
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=LETTER)
    text = c.beginText(40, 730)
    text.setFont("Helvetica", 12)
    lines = [
        f"Quote ID: {quote_id}",
        f"Date: {dt.datetime.utcnow().strftime('%Y-%m-%d')}",
        f"Company: {data['company_name']}",
        f"Contact: {data['name']} | {data['email']} | {data['phone']}",
        f"Package Selected: {data['package']}",
        "Add-Ons:"
    ]
    for addon in data.get('addons', []):
        lines.append(f"  • {addon['name']} - {addon['price']}")

    lines.append(f"Total One-Time: {data.get('one_time_total')}")
    lines.append(f"Total Monthly: {data.get('monthly_total')}")
    for line in lines:
        text.textLine(line)
    c.drawText(text)
    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer.read()

# Slack helper
def slack_notify(message: str):
    if not SLACK_WEBHOOK_URL:
        return
    requests.post(SLACK_WEBHOOK_URL, json={"text": message})

def create_quote_id(company_name: str):
    today_str = dt.datetime.utcnow().strftime('%Y%m%d')
    count = airtable_get_quote_count(company_name, dt.datetime.utcnow().strftime('%Y-%m-%d'))
    suffix = f"{count+1:03d}"
    return f"Q-{today_str}-{suffix}"

@sales_order_bp.route('/api/sales-order', methods=['POST'])
def handle_sales_order():
    """
    Expects JSON payload from Tally containing:
    name, phone, email, company_name, package, addons (list), totals
    """
    data = request.json
    required = ['name', 'phone', 'email', 'company_name', 'package']
    missing = [r for r in required if r not in data or not data[r]]
    if missing:
        return jsonify({"error": f"Missing required fields: {missing}"}), 400

    quote_id = create_quote_id(data['company_name'])
    pdf_bytes = generate_quote_pdf(data, quote_id)
    service = get_drive_service()
    folder_id, folder_link = create_client_folder(service, data['company_name'])
    pdf_name = f"{data['company_name']} - {quote_id}.pdf"
    pdf_link = upload_pdf_to_drive(service, folder_id, pdf_bytes, pdf_name)

    # Airtable record
    fields = {
        "Quote ID": quote_id,
        "Quote Date": dt.datetime.utcnow().strftime('%Y-%m-%d'),
        "Company": data['company_name'],
        "Contact Name": data['name'],
        "Contact Email": data['email'],
        "Contact Phone": data['phone'],
        "Package": data['package'],
        "Add-Ons": ", ".join([a['name'] for a in data.get('addons', [])]),
        "One-Time Total": data.get('one_time_total'),
        "Monthly Total": data.get('monthly_total'),
        "Quote PDF": pdf_link,
        "Drive Folder": folder_link
    }
    airtable_rec = airtable_create_record(fields)

    # Slack notification
    slack_notify(f"✅ New Sales Order: {quote_id} for {data['company_name']}\n{folder_link}")

    return jsonify({"status": "success", "quote_id": quote_id, "drive_folder": folder_link, "airtable_id": airtable_rec['id']}), 201
