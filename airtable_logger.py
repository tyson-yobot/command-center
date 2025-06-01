import os
import requests

def log_sales_event(event_type, sales_order_id, source_id, amount, notes=""):
    """
    Log sales events to Airtable for comprehensive tracking
    """
    airtable_base_id = os.getenv("AIRTABLE_BASE_ID")
    airtable_table_name = "Sales Event Log"
    airtable_token = os.getenv("AIRTABLE_API_KEY")

    if not all([airtable_base_id, airtable_token]):
        print("❌ Airtable credentials missing - cannot log sales event")
        return None

    url = f"https://api.airtable.com/v0/{airtable_base_id}/{airtable_table_name}"
    headers = {
        "Authorization": f"Bearer {airtable_token}",
        "Content-Type": "application/json"
    }

    payload = {
        "fields": {
            "🗓️ Event Type": event_type,
            "🔗 Linked Sales Order": [sales_order_id] if sales_order_id else [],
            "🧾 Source ID": source_id,
            "💵 Amount": amount,
            "📝 Notes": notes,
            "🕒 Timestamp": get_current_timestamp()
        }
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code == 200:
            record_id = response.json().get('id')
            print(f"✅ Sales event logged to Airtable: {record_id}")
            return response.json()
        else:
            print(f"❌ Airtable logging failed: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Airtable logging error: {e}")
        return None

def log_invoice_event(invoice_id, customer_name, amount, status, qbo_invoice_id=None):
    """
    Log invoice creation and status changes
    """
    return log_sales_event(
        event_type="🧾 Invoice Event",
        sales_order_id=qbo_invoice_id or invoice_id,
        source_id=invoice_id,
        amount=amount,
        notes=f"Customer: {customer_name}, Status: {status}, QBO ID: {qbo_invoice_id or 'Pending'}"
    )

def log_payment_event(payment_id, invoice_id, amount, method, status="completed"):
    """
    Log payment processing events
    """
    return log_sales_event(
        event_type="💳 Payment Event",
        sales_order_id=invoice_id,
        source_id=payment_id,
        amount=amount,
        notes=f"Method: {method}, Status: {status}, Invoice: {invoice_id}"
    )

def log_integration_error(source, error_message, context=""):
    """
    Log integration errors for debugging
    """
    return log_sales_event(
        event_type="❌ Integration Error",
        sales_order_id="",
        source_id=source,
        amount=0,
        notes=f"Error: {error_message}, Context: {context}"
    )

def get_current_timestamp():
    """
    Get current timestamp in ISO format
    """
    from datetime import datetime
    return datetime.utcnow().isoformat() + 'Z'

if __name__ == "__main__":
    # Test the logging system
    test_result = log_sales_event(
        event_type="💳 Stripe Payment Received",
        sales_order_id="test_order_123",
        source_id="stripe_test_payment",
        amount=100.00,
        notes="Test payment - integration verification"
    )
    print("Test logging completed:", test_result)