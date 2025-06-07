#!/usr/bin/env python3
"""
Webhook Connectivity Test
Tests direct connectivity to the Tally webhook endpoint
"""

import requests
import json
from datetime import datetime

def test_webhook_connectivity():
    """Test webhook connectivity with sample form data"""
    
    # Your confirmed webhook URL
    webhook_url = "https://workspace--tyson44.replit.app/api/orders/test"
    
    # Sample form data structure that Tally would send
    test_payload = {
        "company_name": "TEST COMPANY SUBMISSION",
        "contact_name": "Test Contact",
        "email": "test@example.com",
        "phone": "+1234567890",
        "service_type": "Test Service",
        "project_details": "This is a test submission from connectivity test",
        "timestamp": datetime.now().isoformat(),
        "source": "connectivity_test"
    }
    
    headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'TallyConnectivityTest/1.0'
    }
    
    print(f"Testing webhook connectivity to: {webhook_url}")
    print(f"Payload: {json.dumps(test_payload, indent=2)}")
    
    try:
        response = requests.post(
            webhook_url,
            json=test_payload,
            headers=headers,
            timeout=30
        )
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Body: {response.text}")
        
        if response.status_code == 200:
            print("✅ Webhook connectivity successful!")
            return True
        else:
            print("❌ Webhook connectivity failed!")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Connection error: {e}")
        return False

def test_local_endpoint():
    """Test local endpoint connectivity"""
    
    local_url = "http://localhost:5000/api/orders/test"
    
    test_payload = {
        "test_type": "local_connectivity",
        "timestamp": datetime.now().isoformat()
    }
    
    print(f"\nTesting local endpoint: {local_url}")
    
    try:
        response = requests.post(
            local_url,
            json=test_payload,
            timeout=10
        )
        
        print(f"Local Response Status: {response.status_code}")
        print(f"Local Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Local endpoint working!")
            return True
        else:
            print("❌ Local endpoint failed!")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Local connection error: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("WEBHOOK CONNECTIVITY DIAGNOSTIC")
    print("=" * 60)
    
    # Test local endpoint first
    local_success = test_local_endpoint()
    
    # Test public endpoint
    public_success = test_webhook_connectivity()
    
    print("\n" + "=" * 60)
    print("CONNECTIVITY TEST RESULTS")
    print("=" * 60)
    print(f"Local Endpoint: {'✅ PASS' if local_success else '❌ FAIL'}")
    print(f"Public Endpoint: {'✅ PASS' if public_success else '❌ FAIL'}")
    
    if not public_success:
        print("\n🔍 TROUBLESHOOTING SUGGESTIONS:")
        print("1. Verify webhook URL in Tally form settings")
        print("2. Check if Replit deployment is public")
        print("3. Confirm no firewall blocking external requests")
        print("4. Test webhook URL directly in browser")