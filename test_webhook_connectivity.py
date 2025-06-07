#!/usr/bin/env python3
import requests
import json
from datetime import datetime

def test_webhook_connectivity():
    """Test webhook connectivity with real submission data"""
    
    # Test the working webhook URL
    webhook_url = "https://72ddfeee-d145-4891-a820-14d5b3e09c66-00-c9rkbm78q1s2.worf.replit.dev/api/orders/test"
    
    # Simulate your actual Tally form submission
    real_submission = {
        "eventType": "FORM_RESPONSE",
        "eventId": f"evt_user_submission_{int(datetime.now().timestamp())}",
        "createdAt": datetime.now().isoformat() + "Z",
        "data": {
            "responseId": f"resp_user_{int(datetime.now().timestamp())}",
            "formId": "user_sales_order_form",
            "formName": "YoBot Sales Order Form",
            "createdAt": datetime.now().isoformat() + "Z",
            "fields": [
                {"key": "full_name", "label": "Full Name", "value": "User Submission Test"},
                {"key": "company_name", "label": "Company Name", "value": "Test Submission Company"},
                {"key": "email", "label": "Email Address", "value": "usertest@submissioncompany.com"},
                {"key": "phone", "label": "Phone Number", "value": "+1-555-SUBMIT-TEST"},
                {"key": "website", "label": "Website", "value": "https://submissioncompany.com"},
                {"key": "bot_package", "label": "Bot Package", "value": "Professional Package - $2,997/month"},
                {"key": "add_ons", "label": "Add-On Modules", "value": ["Voice AI - $500/month", "Analytics - $200/month"]},
                {"key": "payment_amount", "label": "Payment Amount", "value": "3697"},
                {"key": "signature", "label": "Digital Signature", "value": "User Submission Test"},
                {"key": "payment_method", "label": "Payment Method", "value": "Credit Card"}
            ]
        }
    }
    
    try:
        response = requests.post(
            webhook_url,
            json=real_submission,
            headers={
                'Content-Type': 'application/json',
                'User-Agent': 'Tally-Webhook/1.0'
            },
            timeout=10
        )
        
        if response.status_code == 200:
            print(f"WEBHOOK WORKING: {webhook_url}")
            print(f"Response: {response.text[:100]}...")
            return True
        else:
            print(f"WEBHOOK FAILED: Status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"CONNECTION ERROR: {e}")
        return False

if __name__ == "__main__":
    success = test_webhook_connectivity()
    if success:
        print("\nWEBHOOK IS WORKING - Your Tally form URL is incorrect")
        print("Use this exact URL in your Tally form:")
        print("https://72ddfeee-d145-4891-a820-14d5b3e09c66-00-c9rkbm78q1s2.worf.replit.dev/api/orders/test")
    else:
        print("\nWEBHOOK NOT ACCESSIBLE")