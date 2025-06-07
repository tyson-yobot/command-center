#!/usr/bin/env python3
"""
Real-time webhook monitor to capture actual Tally form submissions
"""

import requests
import json
import time
from datetime import datetime

def monitor_webhooks():
    """Monitor for recent webhook payloads"""
    print("🔍 Monitoring webhook endpoints for real Tally submissions...")
    
    base_url = "http://localhost:5000"
    
    try:
        # Check for recent webhook payloads
        response = requests.get(f"{base_url}/api/webhooks/recent")
        if response.status_code == 200:
            data = response.json()
            payloads = data.get('payloads', [])
            
            print(f"📊 Found {len(payloads)} recent webhook payloads")
            
            for payload in payloads:
                print(f"\n📄 File: {payload['filename']}")
                if payload.get('timestamp'):
                    print(f"⏰ Time: {payload['timestamp']}")
                
                if payload.get('body'):
                    body = payload['body']
                    print("📋 Form Data:")
                    
                    # Extract key fields
                    name = body.get('Full Name', body.get('full_name', 'Not provided'))
                    company = body.get('Company Name', body.get('company_name', 'Not provided'))
                    email = body.get('Email Address', body.get('email', 'Not provided'))
                    package = body.get('🤖 Bot Package', body.get('bot_package', 'Not provided'))
                    amount = body.get('💳 Final Payment Amount Due', body.get('payment_amount', 'Not provided'))
                    
                    print(f"   Name: {name}")
                    print(f"   Company: {company}")
                    print(f"   Email: {email}")
                    print(f"   Package: {package}")
                    print(f"   Amount: ${amount}")
                    
                    # Check if this looks like real data vs sample data
                    if name != "John Smith" and company != "Smith Roofing LLC":
                        print("🎯 THIS APPEARS TO BE REAL FORM SUBMISSION DATA!")
                        return payload
                    else:
                        print("📝 This appears to be sample/test data")
        
        print("\n⚠️  No real Tally form submissions found yet")
        print("💡 Please submit the Tally form again and I'll capture it immediately")
        
    except Exception as e:
        print(f"❌ Error monitoring webhooks: {e}")
    
    return None

def test_webhook_endpoint():
    """Test the webhook endpoint is working"""
    print("\n🧪 Testing webhook endpoint...")
    
    try:
        test_payload = {
            "test": True,
            "timestamp": datetime.now().isoformat(),
            "message": "Webhook monitor test"
        }
        
        response = requests.post(
            "http://localhost:5000/webhook/capture",
            json=test_payload
        )
        
        if response.status_code == 200:
            print("✅ Webhook endpoint is working and ready to capture data")
        else:
            print(f"⚠️  Webhook endpoint returned status: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Webhook endpoint test failed: {e}")

if __name__ == "__main__":
    print("🚀 Starting Webhook Monitor")
    print("=" * 50)
    
    test_webhook_endpoint()
    
    # Monitor for real submissions
    real_submission = monitor_webhooks()
    
    if real_submission:
        print("\n🎉 REAL TALLY SUBMISSION CAPTURED!")
        print("=" * 50)
        print(json.dumps(real_submission, indent=2))
    else:
        print("\n📋 Waiting for your real Tally form submission...")
        print("📍 Webhook URL: http://localhost:5000/webhook/tally_sales_order")
        print("📍 Capture URL: http://localhost:5000/webhook/capture")