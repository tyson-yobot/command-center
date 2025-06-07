#!/usr/bin/env python3
"""
Stripe to QuickBooks Online Integration
Records Stripe payments as payment records in QuickBooks Online
"""

import os
import requests
import json
from datetime import datetime

def record_stripe_payment(invoice_id, amount_paid, customer_email):
    """
    Record a Stripe payment in QuickBooks Online
    """
    try:
        qbo_realm_id = os.getenv('QUICKBOOKS_REALM_ID')
        qbo_access_token = os.getenv('QUICKBOOKS_ACCESS_TOKEN')
        
        if not qbo_realm_id or not qbo_access_token:
            print("QuickBooks Online credentials not configured")
            return False
            
        # First, get the customer reference
        customer_ref = get_customer_ref(customer_email)
        if not customer_ref:
            print(f"Customer not found for email: {customer_email}")
            return False
            
        url = f"https://quickbooks.api.intuit.com/v3/company/{qbo_realm_id}/payment"
        headers = {
            "Authorization": f"Bearer {qbo_access_token}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        payment_data = {
            "CustomerRef": {"value": customer_ref},
            "TotalAmt": amount_paid,
            "PaymentMethodRef": {"value": "1", "name": "Credit Card"},
            "DepositToAccountRef": {"value": "4", "name": "Checking"},
            "Line": [{
                "Amount": amount_paid,
                "LinkedTxn": [{"TxnId": invoice_id, "TxnType": "Invoice"}]
            }]
        }
        
        response = requests.post(url, headers=headers, json=payment_data, timeout=10)
        
        if response.status_code == 200:
            print(f"Stripe payment recorded in QBO for {customer_email}")
            return True
        else:
            print(f"Failed to record payment in QBO: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"Error recording Stripe payment in QBO: {e}")
        return False

def get_customer_ref(email):
    """
    Get QuickBooks customer reference by email address
    """
    try:
        qbo_realm_id = os.getenv('QUICKBOOKS_REALM_ID')
        qbo_access_token = os.getenv('QUICKBOOKS_ACCESS_TOKEN')
        
        if not qbo_realm_id or not qbo_access_token:
            return None
            
        url = f"https://quickbooks.api.intuit.com/v3/company/{qbo_realm_id}/query"
        headers = {
            "Authorization": f"Bearer {qbo_access_token}",
            "Accept": "application/json"
        }
        
        params = {
            "query": f"select * from Customer where PrimaryEmailAddr = '{email}'"
        }
        
        response = requests.get(url, headers=headers, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            customers = data.get("QueryResponse", {}).get("Customer", [])
            if customers:
                return customers[0]["Id"]
                
        return None
        
    except Exception as e:
        print(f"Error getting customer reference: {e}")
        return None

def verify_qbo_connection():
    """
    Verify QuickBooks Online connection is working
    """
    try:
        qbo_realm_id = os.getenv('QUICKBOOKS_REALM_ID')
        qbo_access_token = os.getenv('QUICKBOOKS_ACCESS_TOKEN')
        
        if not qbo_realm_id or not qbo_access_token:
            return False
            
        url = f"https://quickbooks.api.intuit.com/v3/company/{qbo_realm_id}/companyinfo/{qbo_realm_id}"
        headers = {
            "Authorization": f"Bearer {qbo_access_token}",
            "Accept": "application/json"
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        return response.status_code == 200
        
    except Exception as e:
        print(f"QBO connection test failed: {e}")
        return False

if __name__ == "__main__":
    # Test the function
    record_stripe_payment("INV-001", 1500.00, "test@example.com")