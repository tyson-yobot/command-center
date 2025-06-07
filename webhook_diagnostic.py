#!/usr/bin/env python3
import requests
import json
from datetime import datetime

def comprehensive_webhook_test():
    """Test all possible webhook endpoints and configurations"""
    
    # Test data mimicking real Tally form
    test_payload = {
        "eventType": "FORM_RESPONSE",
        "eventId": "evt_diagnostic_test",
        "createdAt": datetime.now().isoformat() + "Z",
        "data": {
            "responseId": "resp_diagnostic",
            "formId": "yobot_sales_form",
            "fields": [
                {"key": "full_name", "label": "Full Name", "value": "Diagnostic Test User"},
                {"key": "company_name", "label": "Company Name", "value": "Test Corp"},
                {"key": "email", "label": "Email Address", "value": "test@testcorp.com"},
                {"key": "phone", "label": "Phone Number", "value": "+1-555-TEST-123"},
                {"key": "bot_package", "label": "Bot Package", "value": "Enterprise - $4997/month"},
                {"key": "add_ons", "label": "Add-On Modules", "value": ["Voice AI - $500", "Analytics - $200"]},
                {"key": "payment_amount", "label": "Payment Amount", "value": "5697"},
                {"key": "signature", "label": "Digital Signature", "value": "Diagnostic Test User"}
            ]
        }
    }
    
    # Test all possible endpoint variations
    endpoints = [
        "http://localhost:5000/api/orders/test",
        "https://workspace--tyson44.replit.app/api/orders/test",
        "http://localhost:5000/webhook/tally",
        "http://localhost:5000/api/webhook/tally",
        "http://localhost:5000/webhook",
        "http://localhost:5000/api/orders"
    ]
    
    successful_endpoints = []
    
    for endpoint in endpoints:
        try:
            print(f"Testing: {endpoint}")
            response = requests.post(
                endpoint,
                json=test_payload,
                headers={
                    'Content-Type': 'application/json',
                    'User-Agent': 'TallyWebhook/1.0',
                    'X-Tally-Signature': 'test_signature'
                },
                timeout=10
            )
            
            if response.status_code == 200:
                print(f"✅ SUCCESS: {endpoint}")
                print(f"Response: {response.text[:100]}...")
                successful_endpoints.append(endpoint)
            else:
                print(f"❌ FAILED: {endpoint} - Status: {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            print(f"🔌 CONNECTION FAILED: {endpoint}")
        except Exception as e:
            print(f"❌ ERROR: {endpoint} - {e}")
        
        print("-" * 50)
    
    print(f"\n📊 SUMMARY:")
    print(f"Working endpoints: {len(successful_endpoints)}")
    for endpoint in successful_endpoints:
        print(f"  ✅ {endpoint}")
    
    if successful_endpoints:
        print(f"\n🎯 USE THIS URL IN TALLY: {successful_endpoints[0]}")
    else:
        print(f"\n❌ NO WORKING ENDPOINTS FOUND")

if __name__ == "__main__":
    comprehensive_webhook_test()