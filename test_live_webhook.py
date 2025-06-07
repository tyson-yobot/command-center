#!/usr/bin/env python3
import requests
import json

def test_live_webhook():
    """Test live webhook with realistic form data"""
    
    payload = {
        "eventType": "FORM_RESPONSE",
        "eventId": "evt_live_test_123",
        "createdAt": "2025-06-07T18:59:00.000Z",
        "data": {
            "responseId": "resp_live_123",
            "formId": "yobot_sales_order",
            "fields": [
                {
                    "key": "full_name",
                    "label": "Full Name",
                    "type": "INPUT_TEXT",
                    "value": "John Smith"
                },
                {
                    "key": "company_name", 
                    "label": "Company Name",
                    "type": "INPUT_TEXT",
                    "value": "Smith Enterprises LLC"
                },
                {
                    "key": "email",
                    "label": "Email Address", 
                    "type": "INPUT_EMAIL",
                    "value": "john@smithenterprises.com"
                },
                {
                    "key": "phone",
                    "label": "Phone Number",
                    "type": "INPUT_PHONE", 
                    "value": "+1-555-123-4567"
                },
                {
                    "key": "website",
                    "label": "Website",
                    "type": "INPUT_URL",
                    "value": "https://smithenterprises.com"
                },
                {
                    "key": "bot_package",
                    "label": "Bot Package",
                    "type": "MULTIPLE_CHOICE",
                    "value": "Professional Package - $2,997/month"
                },
                {
                    "key": "add_ons",
                    "label": "Add-On Modules",
                    "type": "CHECKBOXES", 
                    "value": [
                        "Voice AI Module - $500/month",
                        "Lead Generation Module - $300/month"
                    ]
                },
                {
                    "key": "payment_amount",
                    "label": "Final Payment Amount Due",
                    "type": "INPUT_NUMBER",
                    "value": "3797"
                },
                {
                    "key": "signature",
                    "label": "Typed Signature",
                    "type": "INPUT_TEXT", 
                    "value": "John Smith"
                },
                {
                    "key": "payment_method",
                    "label": "Preferred Payment Method",
                    "type": "MULTIPLE_CHOICE",
                    "value": "Credit Card"
                }
            ]
        }
    }
    
    try:
        response = requests.post(
            "http://localhost:5000/api/orders/test",
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Webhook test successful")
        else:
            print("❌ Webhook test failed")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_live_webhook()