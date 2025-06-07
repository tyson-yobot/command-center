#!/usr/bin/env python3
import requests
import json
from datetime import datetime

def test_webhook_endpoint():
    """Test the webhook endpoint with sample Tally data"""
    
    # Sample Tally form data structure
    test_payload = {
        "eventId": "evt_test_12345",
        "eventType": "FORM_RESPONSE",
        "createdAt": "2025-06-07T23:53:00.000Z",
        "data": {
            "responseId": "resp_test_12345",
            "submissionId": "sub_test_12345",
            "respondentId": "user_test_12345",
            "formId": "form_yobot_sales_order",
            "formName": "YoBot Sales Order Form",
            "createdAt": "2025-06-07T23:53:00.000Z",
            "fields": [
                {
                    "key": "question_full_name",
                    "label": "Full Name",
                    "type": "INPUT_TEXT",
                    "value": "Test User"
                },
                {
                    "key": "question_company_name",
                    "label": "Company Name",
                    "type": "INPUT_TEXT",
                    "value": "Test Company LLC"
                },
                {
                    "key": "question_email",
                    "label": "Email Address",
                    "type": "INPUT_EMAIL",
                    "value": "test@example.com"
                },
                {
                    "key": "question_phone",
                    "label": "Phone Number",
                    "type": "INPUT_PHONE",
                    "value": "+1-555-123-4567"
                },
                {
                    "key": "question_website",
                    "label": "Website",
                    "type": "INPUT_URL",
                    "value": "https://testcompany.com"
                },
                {
                    "key": "question_bot_package",
                    "label": "Bot Package",
                    "type": "MULTIPLE_CHOICE",
                    "value": "Professional Package - $2,997/month"
                },
                {
                    "key": "question_add_ons",
                    "label": "Add-On Modules",
                    "type": "CHECKBOXES",
                    "value": [
                        "Voice AI Module - $500/month",
                        "Lead Generation Module - $300/month"
                    ]
                },
                {
                    "key": "question_payment_amount",
                    "label": "Final Payment Amount Due",
                    "type": "INPUT_NUMBER",
                    "value": "3797"
                },
                {
                    "key": "question_signature",
                    "label": "Typed Signature",
                    "type": "INPUT_TEXT",
                    "value": "Test User"
                },
                {
                    "key": "question_payment_method",
                    "label": "Preferred Payment Method",
                    "type": "MULTIPLE_CHOICE",
                    "value": "Credit Card"
                }
            ]
        }
    }
    
    # Test endpoints
    endpoints = [
        "https://workspace--tyson44.replit.app/api/orders/test",
        "https://workspace--tyson44.replit.app/webhook",
        "https://workspace--tyson44.replit.app/"
    ]
    
    for endpoint in endpoints:
        try:
            print(f"Testing endpoint: {endpoint}")
            response = requests.post(
                endpoint, 
                json=test_payload,
                headers={
                    'Content-Type': 'application/json',
                    'User-Agent': 'Tally-Webhook/1.0'
                },
                timeout=10
            )
            
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text[:200]}...")
            print(f"Headers: {dict(response.headers)}")
            print("-" * 50)
            
        except Exception as e:
            print(f"Error testing {endpoint}: {e}")
            print("-" * 50)

if __name__ == "__main__":
    test_webhook_endpoint()