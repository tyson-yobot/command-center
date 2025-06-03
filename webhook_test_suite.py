"""
Webhook Test Suite
Comprehensive testing of all automation endpoints with real validation
"""
import requests
import json
import time
from datetime import datetime

# Your deployment URL
BASE_URL = "https://72ddfeee-d145-4891-a820-14d5b3e09c66-00-c9rkbm78q1s2.worf.replit.dev"

def test_webhook_endpoint(endpoint, payload, expected_response=None):
    """Test individual webhook endpoint with payload"""
    url = f"{BASE_URL}/api/webhook/{endpoint}"
    
    try:
        print(f"\n🧪 Testing {endpoint} webhook...")
        print(f"URL: {url}")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(url, json=payload, timeout=10)
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print(f"✅ {endpoint} webhook is operational")
            return True
        else:
            print(f"❌ {endpoint} webhook returned error")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"❌ {endpoint} webhook - Connection failed")
        return False
    except requests.exceptions.Timeout:
        print(f"❌ {endpoint} webhook - Request timeout")
        return False
    except Exception as e:
        print(f"❌ {endpoint} webhook - Error: {str(e)}")
        return False

def test_support_webhook():
    """Test support ticket automation"""
    payload = {
        "ticket_id": "TEST-001",
        "customer_name": "John Doe",
        "customer_email": "john.doe@testcompany.com",
        "subject": "Integration Test",
        "message": "This is a test support ticket to verify automation",
        "priority": "medium",
        "category": "technical"
    }
    return test_webhook_endpoint("support", payload)

def test_lead_webhook():
    """Test lead capture automation"""
    payload = {
        "lead_id": "LEAD-001",
        "name": "Jane Smith",
        "email": "jane.smith@prospect.com",
        "company": "Test Corp",
        "phone": "+1-555-0123",
        "source": "website",
        "interest_level": "high",
        "message": "Interested in automation services"
    }
    return test_webhook_endpoint("lead", payload)

def test_payment_webhook():
    """Test payment processing automation"""
    payload = {
        "payment_id": "PAY-001",
        "customer_email": "customer@example.com",
        "amount": 299.99,
        "currency": "USD",
        "status": "completed",
        "invoice_id": "INV-001"
    }
    return test_webhook_endpoint("payment", payload)

def test_stripe_webhook():
    """Test Stripe integration"""
    payload = {
        "id": "evt_test_webhook",
        "object": "event",
        "type": "payment_intent.succeeded",
        "data": {
            "object": {
                "id": "pi_test_123",
                "amount": 29999,
                "currency": "usd",
                "customer": "cus_test_123"
            }
        }
    }
    return test_webhook_endpoint("stripe", payload)

def test_hubspot_webhook():
    """Test HubSpot CRM integration"""
    payload = {
        "objectId": "12345",
        "propertyName": "lifecyclestage",
        "propertyValue": "customer",
        "changeSource": "CRM",
        "eventId": "test-event-001"
    }
    return test_webhook_endpoint("hubspot", payload)

def test_calendar_webhook():
    """Test calendar booking automation"""
    payload = {
        "booking_id": "BOOK-001",
        "customer_name": "Mike Johnson",
        "customer_email": "mike@company.com",
        "meeting_type": "demo",
        "scheduled_time": "2024-01-15T14:00:00Z",
        "duration": 30
    }
    return test_webhook_endpoint("calendar", payload)

def test_usage_webhook():
    """Test usage monitoring"""
    payload = {
        "client_id": "CLIENT-001",
        "usage_type": "voice_minutes",
        "current_usage": 850,
        "limit": 1000,
        "percentage": 85
    }
    return test_webhook_endpoint("usage", payload)

def test_form_webhook():
    """Test form submission automation"""
    payload = {
        "form_id": "contact-form",
        "submission_id": "SUB-001",
        "fields": {
            "name": "Sarah Wilson",
            "email": "sarah@business.com",
            "phone": "+1-555-0199",
            "company": "Wilson Enterprises",
            "message": "Request for consultation"
        }
    }
    return test_webhook_endpoint("form", payload)

def test_api_endpoints():
    """Test API endpoints for data retrieval"""
    endpoints = ["metrics", "crm", "bot"]
    results = []
    
    for endpoint in endpoints:
        url = f"{BASE_URL}/api/{endpoint}"
        try:
            print(f"\n🔍 Testing {endpoint} API...")
            response = requests.get(url, timeout=10)
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ {endpoint} API operational - Data received")
                print(f"Sample data: {json.dumps(data, indent=2)[:200]}...")
                results.append(True)
            else:
                print(f"❌ {endpoint} API error")
                results.append(False)
                
        except Exception as e:
            print(f"❌ {endpoint} API error: {str(e)}")
            results.append(False)
    
    return results

def test_quickbooks_oauth():
    """Test QuickBooks OAuth endpoint"""
    url = f"{BASE_URL}/api/qbo/auth"
    try:
        print(f"\n🔗 Testing QuickBooks OAuth...")
        response = requests.get(url, timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if "authUrl" in data:
                print(f"✅ QuickBooks OAuth operational")
                print(f"Auth URL generated: {data['authUrl'][:50]}...")
                return True
        
        print(f"❌ QuickBooks OAuth failed")
        return False
        
    except Exception as e:
        print(f"❌ QuickBooks OAuth error: {str(e)}")
        return False

def run_comprehensive_test_suite():
    """Run complete test suite for all automation components"""
    print("🚀 Starting Comprehensive Automation Test Suite")
    print(f"Testing deployment: {BASE_URL}")
    print("=" * 60)
    
    # Test all webhook endpoints
    webhook_tests = [
        ("Support Automation", test_support_webhook),
        ("Lead Capture", test_lead_webhook),
        ("Payment Processing", test_payment_webhook),
        ("Stripe Integration", test_stripe_webhook),
        ("HubSpot CRM Sync", test_hubspot_webhook),
        ("Calendar Booking", test_calendar_webhook),
        ("Usage Monitoring", test_usage_webhook),
        ("Form Automation", test_form_webhook)
    ]
    
    webhook_results = []
    for test_name, test_func in webhook_tests:
        result = test_func()
        webhook_results.append((test_name, result))
        time.sleep(1)  # Brief pause between tests
    
    # Test API endpoints
    print("\n📊 Testing API Endpoints...")
    api_results = test_api_endpoints()
    
    # Test QuickBooks OAuth
    qb_result = test_quickbooks_oauth()
    
    # Generate summary report
    print("\n" + "=" * 60)
    print("📋 TEST RESULTS SUMMARY")
    print("=" * 60)
    
    print("\n🔗 Webhook Automation Tests:")
    webhook_pass = 0
    for test_name, result in webhook_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {status} {test_name}")
        if result:
            webhook_pass += 1
    
    print(f"\n📊 API Endpoint Tests:")
    api_names = ["Metrics", "CRM Data", "Bot Status"]
    api_pass = 0
    for i, result in enumerate(api_results):
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {status} {api_names[i]}")
        if result:
            api_pass += 1
    
    print(f"\n🔗 Integration Tests:")
    qb_status = "✅ PASS" if qb_result else "❌ FAIL"
    print(f"  {qb_status} QuickBooks OAuth")
    
    # Overall summary
    total_tests = len(webhook_results) + len(api_results) + 1
    total_pass = webhook_pass + api_pass + (1 if qb_result else 0)
    
    print(f"\n🎯 OVERALL RESULTS:")
    print(f"  Total Tests: {total_tests}")
    print(f"  Passed: {total_pass}")
    print(f"  Failed: {total_tests - total_pass}")
    print(f"  Success Rate: {(total_pass/total_tests)*100:.1f}%")
    
    if total_pass == total_tests:
        print("\n🎉 ALL SYSTEMS OPERATIONAL!")
        print("Your automation platform is fully functional and ready for production use.")
    else:
        print(f"\n⚠️  {total_tests - total_pass} systems need attention")
        print("Review failed tests above for troubleshooting.")

if __name__ == "__main__":
    run_comprehensive_test_suite()