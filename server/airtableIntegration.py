import requests
import os
from datetime import datetime

# Using your confirmed Airtable credentials
AIRTABLE_API_KEY = "paty41tSgNrAPUQZV"
BASE_ID = "appRt8V3tH4g5Z5if"
TABLE_ID = "tbldPRZ4nHbtj9opU"

HEADERS = {
    "Authorization": f"Bearer {AIRTABLE_API_KEY}",
    "Content-Type": "application/json"
}

def create_airtable_record(table_name, payload):
    """Create a new record in the specified Airtable table"""
    url = f"https://api.airtable.com/v0/{BASE_ID}/{table_name}"
    response = requests.post(url, headers=HEADERS, json={"fields": payload})
    response.raise_for_status()
    return response.json()

def create_crm_contact(contact_name, email, company_name, phone):
    """Create CRM contact record"""
    contact_payload = {
        "👤 Full Name": contact_name,
        "📧 Email": email,
        "🏢 Company": company_name,
        "📱 Phone": phone,
    }
    return create_airtable_record("🧑‍💼 CRM Contacts", contact_payload)

def create_sales_order(quote_number, current_date, company_name, one_time_payment, monthly_recurring, selected_addons, selected_package):
    """Create sales order record"""
    sales_order_payload = {
        "🏷️ Quote #": quote_number,
        "📅 Date": current_date,
        "🏢 Company Name": company_name,
        "💳 One-Time Payment": one_time_payment,
        "📆 Monthly Payment": monthly_recurring,
        "🧩 Add-Ons Selected": ", ".join(selected_addons),
        "🤖 Bot Package": selected_package,
    }
    return create_airtable_record("🧾 Sales Orders", sales_order_payload)

def push_task(task_title, company_name, assigned_to, due_date):
    """Create project roadmap task"""
    task_payload = {
        "📌 Task": task_title,
        "🏢 Company": company_name,
        "👤 Assigned To": assigned_to,
        "📅 Due Date": due_date,
        "🔁 Auto-Generated": True
    }
    return create_airtable_record("📌 Project Roadmap Tracker", task_payload)

def push_to_airtable(quote_data):
    """Push quote data to specific Airtable table using your confirmed credentials"""
    headers = {
        "Authorization": f"Bearer {AIRTABLE_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "fields": {
            "🏷️ Quote Number": quote_data["quote_number"],
            "🏢 Company Name": quote_data["company_name"],
            "🧑 Contact Name": quote_data["contact_name"],
            "📅 Date": quote_data["date"],
            "🧾 Line Items": ", ".join([f"{i['name']} – ${i['price']:,}" for i in quote_data["line_items"]]),
            "💳 Total": quote_data["total"],
            "📝 Status": "Quote Sent"
        }
    }

    response = requests.post(
        f"https://api.airtable.com/v0/{BASE_ID}/{TABLE_ID}",
        headers=headers,
        json=payload
    )

    return response.json()

def create_complete_sales_order_integration(data):
    """Complete sales order integration with all Airtable tables"""
    try:
        # Extract data
        company_name = data.get('company')
        contact_name = data.get('contact')
        email = data.get('email')
        phone = data.get('phone')
        quote_id = data.get('quote_id')
        current_date = data.get('date')
        one_time_payment = data.get('one_time_payment')
        monthly_recurring = data.get('monthly_recurring')
        selected_addons = data.get('addons', [])
        bot_package = data.get('package')
        grand_total = data.get('grand_total')
        
        results = {}
        
        # Create line items for quote
        from pdfQuoteGenerator import create_line_items_from_package
        line_items = create_line_items_from_package(bot_package, selected_addons)
        
        # Push to main quote table using your specific format
        quote_data = {
            "quote_number": quote_id,
            "company_name": company_name,
            "contact_name": contact_name,
            "date": current_date,
            "line_items": line_items,
            "total": grand_total or sum(item['price'] for item in line_items)
        }
        
        results['quote_record'] = push_to_airtable(quote_data)
        
        # Create CRM Contact
        results['crm_contact'] = create_crm_contact(contact_name, email, company_name, phone)
        
        # Create Sales Order
        results['sales_order'] = create_sales_order(
            quote_id, current_date, company_name, 
            one_time_payment, monthly_recurring, 
            selected_addons, bot_package
        )
        
        # Create initial project tasks
        due_date = datetime.now().strftime('%Y-%m-%d')
        results['initial_task'] = push_task(
            f"Setup {bot_package} package for {company_name}",
            company_name,
            "Daniel Sharpe",
            due_date
        )
        
        return {
            "status": "success",
            "message": "All Airtable records created successfully",
            "results": results
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"Airtable integration failed: {str(e)}"
        }