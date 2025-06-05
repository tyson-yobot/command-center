#!/usr/bin/env python3
"""
YoBot Webhook Endpoint Testing Suite
Comprehensive validation of all 12 webhook endpoints
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "https://workspace--tyson44.replit.app"

def test_webhook_endpoint(endpoint, payload, description):
    """Test individual webhook endpoint"""
    print(f"\n🧪 Testing: {description}")
    print(f"📍 Endpoint: {endpoint}")
    
    try:
        response = requests.post(
            f"{BASE_URL}{endpoint}",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"📊 Status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ SUCCESS")
            return True
        else:
            print(f"❌ FAILED: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def run_comprehensive_webhook_tests():
    """Run complete webhook endpoint validation"""
    
    print("=" * 60)
    print("🚀 YoBot Webhook Endpoint Testing Suite")
    print("=" * 60)
    
    test_results = []
    
    # Test 1: Sales Order Live
    result = test_webhook_endpoint(
        "/api/orders/live",
        {
            "customer_name": "Test Customer Live",
            "order_total": 1299.99,
            "products": "YoBot Premium Package",
            "contact_email": "test@company.com",
            "delivery_date": "2025-06-15"
        },
        "🧾 Sales Order Form LIVE"
    )
    test_results.append(("Sales Order Live", result))
    
    # Test 2: Sales Order Test
    result = test_webhook_endpoint(
        "/api/orders/test",
        {
            "customer_name": "Test Customer",
            "order_total": 999.99,
            "products": "YoBot Standard Package",
            "contact_email": "test@example.com"
        },
        "🧾 Sales Order Form TEST"
    )
    test_results.append(("Sales Order Test", result))
    
    # Test 3: Awarded Project
    result = test_webhook_endpoint(
        "/api/projects/awarded",
        {
            "project_name": "Enterprise Bot Implementation",
            "client_name": "Test Corporation",
            "project_value": 50000,
            "start_date": "2025-07-01",
            "requirements": "Full automation suite with custom integrations"
        },
        "📋 Awarded Project Intake"
    )
    test_results.append(("Awarded Project", result))
    
    # Test 4: Platinum Promo (existing)
    result = test_webhook_endpoint(
        "/api/leads/promo",
        {
            "name": "Test Promo Lead",
            "email": "promo@test.com",
            "phone": "555-0123",
            "source": "Webhook Test"
        },
        "📝 Platinum Promo Lead"
    )
    test_results.append(("Platinum Promo", result))
    
    # Test 5: ROI Snapshot
    result = test_webhook_endpoint(
        "/api/leads/roi",
        {
            "leads_per_month": 150,
            "conversion_rate": 25,
            "avg_revenue_per_client": 5000,
            "bot_monthly_cost": 997,
            "notes": "High-volume real estate agency"
        },
        "📊 ROI Snapshot Form"
    )
    test_results.append(("ROI Snapshot", result))
    
    # Test 6: Booking Form
    result = test_webhook_endpoint(
        "/api/leads/booking",
        {
            "name": "Test Booking",
            "email": "booking@test.com",
            "phone": "555-0456",
            "date": "2025-06-10",
            "notes": "Demo meeting request"
        },
        "📅 Booking Form"
    )
    test_results.append(("Booking Form", result))
    
    # Test 7: Demo Request
    result = test_webhook_endpoint(
        "/api/leads/demo",
        {
            "name": "Demo Requester",
            "email": "demo@company.com",
            "company": "Test Industries",
            "phone": "555-0789",
            "use_case": "Lead generation automation"
        },
        "🧠 Demo Request Phase 1"
    )
    test_results.append(("Demo Request", result))
    
    # Test 8: Lead Capture (existing)
    result = test_webhook_endpoint(
        "/api/leads/capture",
        {
            "name": "General Lead",
            "email": "lead@test.com",
            "phone": "555-0321",
            "company": "Test Corp",
            "source": "Website"
        },
        "📥 General Lead Capture"
    )
    test_results.append(("Lead Capture", result))
    
    # Test 9: Feature Request
    result = test_webhook_endpoint(
        "/api/features/request",
        {
            "feature_name": "Advanced Analytics Dashboard",
            "requester_name": "Test User",
            "description": "Real-time performance metrics with custom KPIs",
            "priority": "High",
            "use_case": "Enterprise reporting requirements"
        },
        "💡 Feature Request Form"
    )
    test_results.append(("Feature Request", result))
    
    # Test 10: Dashboard Intake
    result = test_webhook_endpoint(
        "/api/intake/dashboard",
        {
            "client_name": "Dashboard Client",
            "dashboard_type": "Executive Summary",
            "data_sources": "CRM, Sales, Support Tickets",
            "requirements": "Real-time updates, mobile responsive"
        },
        "📊 Dashboard Intake"
    )
    test_results.append(("Dashboard Intake", result))
    
    # Test 11: Contact Form
    result = test_webhook_endpoint(
        "/api/contact/general",
        {
            "name": "Contact Test",
            "email": "contact@test.com",
            "subject": "General Inquiry",
            "message": "Testing the contact form webhook",
            "contact_type": "Support"
        },
        "📬 General Contact Form"
    )
    test_results.append(("Contact Form", result))
    
    # Test 12: SmartSpend Charge
    result = test_webhook_endpoint(
        "/api/smartspend/charge",
        {
            "client_name": "SmartSpend Client",
            "charge_amount": 297.50,
            "description": "Additional voice minutes package",
            "category": "Voice Services",
            "approval_status": "Auto-Approved"
        },
        "💳 SmartSpend Charge Intake"
    )
    test_results.append(("SmartSpend Charge", result))
    
    # Generate Summary Report
    print("\n" + "=" * 60)
    print("📋 WEBHOOK TESTING SUMMARY")
    print("=" * 60)
    
    passed = 0
    failed = 0
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:.<30} {status}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print(f"\n📊 Results: {passed} passed, {failed} failed out of {len(test_results)} tests")
    print(f"🎯 Success Rate: {(passed/len(test_results)*100):.1f}%")
    
    if failed == 0:
        print("\n🎉 ALL WEBHOOK ENDPOINTS OPERATIONAL!")
    else:
        print(f"\n⚠️  {failed} endpoints need attention")
    
    return test_results

def test_system_health():
    """Test system health endpoint"""
    print("\n🔍 Testing System Health Check...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/system/health-check", timeout=10)
        
        if response.status_code == 200:
            health_data = response.json()
            print("✅ System Health Check: OPERATIONAL")
            print(f"📊 Overall Status: {health_data['health']['overallStatus']}")
            print(f"🚀 Ready for Phase 3: {health_data['health']['readyForPhase3']}")
            return True
        else:
            print(f"❌ Health Check Failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Health Check Error: {str(e)}")
        return False

if __name__ == "__main__":
    print(f"🕐 Test Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test system health first
    health_ok = test_system_health()
    
    # Run webhook tests
    webhook_results = run_comprehensive_webhook_tests()
    
    print(f"\n🕐 Test Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)