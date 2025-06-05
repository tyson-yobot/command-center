#!/usr/bin/env python3
"""
YoBot Webhook Endpoint Testing Suite
Comprehensive validation of all 12 webhook endpoints
"""

import requests
import json
import time
from datetime import datetime

def test_webhook_endpoint(endpoint, payload, description):
    """Test individual webhook endpoint"""
    base_url = "http://localhost:5000"
    url = f"{base_url}{endpoint}"
    
    print(f"\n🧪 Testing: {description}")
    print(f"   URL: {url}")
    print(f"   Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        print(f"   Status: {response.status_code}")
        
        # Check if response is JSON
        try:
            json_response = response.json()
            print(f"   Response: {json.dumps(json_response, indent=2)}")
            return {"success": True, "status": response.status_code, "data": json_response}
        except json.JSONDecodeError:
            print(f"   Response (HTML): {response.text[:200]}...")
            return {"success": False, "status": response.status_code, "error": "HTML response instead of JSON"}
            
    except requests.exceptions.RequestException as e:
        print(f"   Error: {str(e)}")
        return {"success": False, "error": str(e)}

def run_comprehensive_webhook_tests():
    """Run complete webhook endpoint validation"""
    
    print("🚀 YoBot Webhook Endpoint Testing Suite")
    print("=" * 50)
    
    # Test all 12 webhook endpoints with sample data
    tests = [
        {
            "endpoint": "/api/orders/live",
            "payload": {
                "customer_name": "Test Customer",
                "order_total": 1299.99,
                "products": "YoBot Premium",
                "contact_email": "test@company.com",
                "delivery_date": "2025-06-15"
            },
            "description": "Sales Order Live"
        },
        {
            "endpoint": "/api/orders/test",
            "payload": {
                "customer_name": "Test Customer",
                "order_total": 999.99,
                "products": "YoBot Standard",
                "contact_email": "test@company.com"
            },
            "description": "Sales Order Test"
        },
        {
            "endpoint": "/api/projects/awarded",
            "payload": {
                "client_name": "ABC Corp",
                "project_name": "AI Implementation",
                "project_value": 25000.00,
                "start_date": "2025-07-01"
            },
            "description": "Awarded Project"
        },
        {
            "endpoint": "/api/leads/promo",
            "payload": {
                "name": "John Doe",
                "email": "john@example.com",
                "phone": "555-1234",
                "source": "Platinum Promo"
            },
            "description": "Platinum Promo Lead"
        },
        {
            "endpoint": "/api/leads/roi",
            "payload": {
                "company_name": "Tech Startup",
                "email": "contact@techstartup.com",
                "current_revenue": 500000,
                "target_growth": 25
            },
            "description": "ROI Snapshot Lead"
        },
        {
            "endpoint": "/api/leads/booking",
            "payload": {
                "full_name": "Jane Smith",
                "email": "jane@company.com",
                "phone": "555-5678",
                "preferred_time": "Morning",
                "meeting_type": "Demo"
            },
            "description": "Booking Form Lead"
        },
        {
            "endpoint": "/api/leads/demo",
            "payload": {
                "name": "Mike Johnson",
                "email": "mike@business.com",
                "company": "Business Inc",
                "demo_type": "Premium"
            },
            "description": "Demo Request Lead"
        },
        {
            "endpoint": "/api/leads/capture",
            "payload": {
                "name": "Sarah Wilson",
                "email": "sarah@enterprise.com",
                "phone": "555-9012",
                "lead_source": "Website"
            },
            "description": "General Lead Capture"
        },
        {
            "endpoint": "/api/features/request",
            "payload": {
                "requester_name": "Product Manager",
                "feature_name": "Advanced Analytics",
                "priority": "High",
                "description": "Real-time dashboard analytics"
            },
            "description": "Feature Request"
        },
        {
            "endpoint": "/api/intake/dashboard",
            "payload": {
                "client_name": "Enterprise Client",
                "dashboard_type": "Executive",
                "requirements": "Monthly reporting"
            },
            "description": "Dashboard Intake"
        },
        {
            "endpoint": "/api/contact/general",
            "payload": {
                "name": "Customer Support",
                "email": "support@client.com",
                "subject": "Integration Question",
                "message": "Need help with API integration"
            },
            "description": "General Contact Form"
        },
        {
            "endpoint": "/api/smartspend/charge",
            "payload": {
                "client_name": "Premium Client",
                "charge_amount": 150.00,
                "category": "Voice Minutes",
                "billing_period": "Monthly"
            },
            "description": "SmartSpend Charge"
        }
    ]
    
    results = []
    successful_tests = 0
    
    for test in tests:
        result = test_webhook_endpoint(
            test["endpoint"], 
            test["payload"], 
            test["description"]
        )
        results.append({
            "endpoint": test["endpoint"],
            "description": test["description"],
            "result": result
        })
        
        if result.get("success"):
            successful_tests += 1
            
        time.sleep(1)  # Small delay between tests
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    print(f"Total Endpoints: {len(tests)}")
    print(f"Successful: {successful_tests}")
    print(f"Failed: {len(tests) - successful_tests}")
    print(f"Success Rate: {(successful_tests/len(tests)*100):.1f}%")
    
    # Failed tests details
    failed_tests = [r for r in results if not r["result"].get("success")]
    if failed_tests:
        print("\n❌ FAILED TESTS:")
        for test in failed_tests:
            print(f"   - {test['description']} ({test['endpoint']})")
            if "error" in test["result"]:
                print(f"     Error: {test['result']['error']}")
    
    return results

def test_system_health():
    """Test system health endpoint"""
    print("\n🏥 Testing System Health...")
    
    health_endpoints = [
        "/api/webhooks/status",
        "/api/metrics",
        "/api/health"
    ]
    
    for endpoint in health_endpoints:
        try:
            response = requests.get(f"http://localhost:5000{endpoint}", timeout=5)
            print(f"   {endpoint}: {response.status_code}")
            if response.headers.get('content-type', '').startswith('application/json'):
                print(f"   ✅ JSON response")
            else:
                print(f"   ❌ Non-JSON response")
        except Exception as e:
            print(f"   {endpoint}: ERROR - {str(e)}")

if __name__ == "__main__":
    print(f"🕐 Starting webhook tests at {datetime.now()}")
    test_system_health()
    results = run_comprehensive_webhook_tests()
    
    # Save results to file
    with open('webhook_test_results.json', 'w') as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "results": results
        }, f, indent=2)
    
    print(f"\n💾 Results saved to webhook_test_results.json")
    print(f"🕐 Testing completed at {datetime.now()}")