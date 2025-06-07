#!/usr/bin/env python3
import requests
import json

def test_real_webhook_url():
    """Test the exact webhook URL the user should have configured"""
    
    # The correct webhook URL
    webhook_url = "https://72ddfeee-d145-4891-a820-14d5b3e09c66-00-c9rkbm78q1s2.worf.replit.dev/api/orders/test"
    
    # Simulate a real Tally form submission
    tally_payload = {
        "eventId": "evt_real_test_12345",
        "eventType": "FORM_RESPONSE", 
        "createdAt": "2025-06-07T19:05:30.000Z",
        "data": {
            "responseId": "resp_real_test",
            "submissionId": "sub_real_test", 
            "respondentId": "user_real_test",
            "formId": "yobot_sales_order_form",
            "formName": "YoBot Sales Order Form",
            "createdAt": "2025-06-07T19:05:30.000Z",
            "fields": [
                {
                    "key": "question_mNqP4Q",
                    "label": "Full Name",
                    "type": "INPUT_TEXT",
                    "value": "Real User Name"
                },
                {
                    "key": "question_nLpO5R", 
                    "label": "Company Name",
                    "type": "INPUT_TEXT",
                    "value": "Real Company LLC"
                },
                {
                    "key": "question_oMqP6S",
                    "label": "Email Address",
                    "type": "INPUT_EMAIL", 
                    "value": "real@realcompany.com"
                },
                {
                    "key": "question_pNrQ7T",
                    "label": "Phone Number",
                    "type": "INPUT_PHONE",
                    "value": "+1-555-REAL-123"
                },
                {
                    "key": "question_qOsR8U",
                    "label": "Website",
                    "type": "INPUT_URL",
                    "value": "https://realcompany.com"
                },
                {
                    "key": "question_rPtS9V",
                    "label": "Bot Package Selection",
                    "type": "MULTIPLE_CHOICE",
                    "value": "Enterprise Package - $4,997/month"
                },
                {
                    "key": "question_sQuT0W",
                    "label": "Add-On Modules",
                    "type": "CHECKBOXES",
                    "value": [
                        "Voice AI Module - $500/month",
                        "Advanced Analytics - $300/month",
                        "Lead Generation - $200/month"
                    ]
                },
                {
                    "key": "question_tRvU1X",
                    "label": "Total Payment Amount",
                    "type": "INPUT_NUMBER", 
                    "value": "5997"
                },
                {
                    "key": "question_uSwV2Y",
                    "label": "Digital Signature",
                    "type": "INPUT_TEXT",
                    "value": "Real User Name"
                },
                {
                    "key": "question_vTxW3Z",
                    "label": "Payment Method",
                    "type": "MULTIPLE_CHOICE",
                    "value": "Credit Card - Stripe"
                }
            ]
        }
    }
    
    print(f"Testing webhook: {webhook_url}")
    
    try:
        response = requests.post(
            webhook_url,
            json=tally_payload,
            headers={
                'Content-Type': 'application/json',
                'User-Agent': 'Tally-Webhook/1.0',
                'X-Tally-Signature': 'sha256=test_signature'
            },
            timeout=15
        )
        
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("SUCCESS: Webhook is working")
            print(f"Response: {response.text[:150]}...")
            return True
        else:
            print(f"FAILED: Status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError as e:
        print(f"CONNECTION ERROR: {e}")
        return False
    except Exception as e:
        print(f"ERROR: {e}")
        return False

if __name__ == "__main__":
    test_real_webhook_url()