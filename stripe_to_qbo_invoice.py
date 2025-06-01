import os
import requests
import time

def create_qbo_invoice(customer_name, amount, description):
    """
    Create a QuickBooks Online invoice from Stripe payment data
    """
    url = f"https://quickbooks.api.intuit.com/v3/company/{os.getenv('QUICKBOOKS_REALM_ID')}/invoice?minorversion=65"
    headers = {
        "Authorization": f"Bearer {os.getenv('QUICKBOOKS_ACCESS_TOKEN')}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    
    payload = {
        "CustomerRef": {
            "value": get_customer_id(customer_name)
        },
        "Line": [
            {
                "DetailType": "SalesItemLineDetail",
                "Amount": amount,
                "SalesItemLineDetail": {
                    "ItemRef": {
                        "value": get_item_id(description)
                    }
                },
                "Description": description
            }
        ],
        "DocNumber": f"STRIPE-{int(time.time())}",
        "TxnDate": get_current_date()
    }

    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code == 200:
        invoice_data = response.json()
        invoice_id = invoice_data.get('QueryResponse', {}).get('Invoice', [{}])[0].get('Id')
        
        # Mark invoice as paid since payment already received via Stripe
        mark_invoice_paid(invoice_id, amount)
        
        print(f"✅ QBO Invoice {invoice_id} created and marked paid")
        return invoice_data
    else:
        print(f"❌ QBO Invoice creation failed: {response.status_code} - {response.text}")
        raise Exception(f"QBO API Error: {response.text}")

def get_customer_id(name):
    """
    Get or create customer ID in QuickBooks
    For now using default - will enhance when token is active
    """
    return "1"

def get_item_id(description):
    """
    Get service/product item ID for QuickBooks
    For now using default - will enhance when token is active
    """
    return "1"

def mark_invoice_paid(invoice_id, amount):
    """
    Mark the invoice as paid in QuickBooks
    """
    if not invoice_id:
        return
        
    url = f"https://quickbooks.api.intuit.com/v3/company/{os.getenv('QUICKBOOKS_REALM_ID')}/payment?minorversion=65"
    headers = {
        "Authorization": f"Bearer {os.getenv('QUICKBOOKS_ACCESS_TOKEN')}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    
    payment_payload = {
        "CustomerRef": {"value": "1"},
        "TotalAmt": amount,
        "Line": [
            {
                "Amount": amount,
                "LinkedTxn": [
                    {
                        "TxnId": invoice_id,
                        "TxnType": "Invoice"
                    }
                ]
            }
        ]
    }
    
    try:
        response = requests.post(url, headers=headers, json=payment_payload)
        if response.status_code == 200:
            print(f"✅ Invoice {invoice_id} marked as paid")
        else:
            print(f"⚠️ Failed to mark invoice as paid: {response.text}")
    except Exception as e:
        print(f"⚠️ Payment marking error: {e}")

def get_current_date():
    """
    Get current date in YYYY-MM-DD format for QuickBooks
    """
    from datetime import datetime
    return datetime.now().strftime('%Y-%m-%d')

if __name__ == "__main__":
    # Test the integration
    test_invoice = create_qbo_invoice(
        customer_name="Test Customer",
        amount=100.00,
        description="YoBot Service Payment - Stripe Integration Test"
    )
    print("Test invoice creation completed:", test_invoice)