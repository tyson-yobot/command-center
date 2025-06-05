#!/usr/bin/env python3
"""
Command Center API Integration Test
Tests all UI control endpoints and webhook functionality
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "https://workspace--tyson44.replit.app"

def test_endpoint(method, endpoint, payload=None, description=""):
    """Test a single API endpoint"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method.upper() == 'GET':
            response = requests.get(url, timeout=10)
        elif method.upper() == 'POST':
            response = requests.post(url, json=payload, timeout=10)
        elif method.upper() == 'PATCH':
            response = requests.patch(url, json=payload, timeout=10)
        else:
            return {"error": f"Unsupported method: {method}"}
            
        result = {
            "endpoint": endpoint,
            "method": method,
            "status": response.status_code,
            "success": 200 <= response.status_code < 300,
            "response_time": response.elapsed.total_seconds(),
            "description": description
        }
        
        if response.headers.get('content-type', '').startswith('application/json'):
            try:
                result["data"] = response.json()
            except:
                result["data"] = response.text[:200]
        else:
            result["data"] = response.text[:200]
            
        return result
        
    except Exception as e:
        return {
            "endpoint": endpoint,
            "method": method,
            "status": "ERROR",
            "success": False,
            "error": str(e),
            "description": description
        }

def main():
    print("🚀 Command Center API Integration Test")
    print("=" * 60)
    print(f"Target: {BASE_URL}")
    print(f"Started: {datetime.now()}")
    print()
    
    # Test cases for Command Center UI controls
    test_cases = [
        # System Status
        ("GET", "/api/webhook/status", None, "Webhook System Status"),
        
        # Command Center UI Controls
        ("PATCH", "/api/voicebot/status", {"enabled": True}, "VoiceBot Toggle ON"),
        ("PATCH", "/api/voicebot/status", {"enabled": False}, "VoiceBot Toggle OFF"),
        ("POST", "/api/dev/trigger", {"webhook": "test", "payload": {}}, "Force Webhook Trigger"),
        ("POST", "/api/bot/memory/reload", {}, "Reload Bot Memory"),
        ("GET", "/api/metrics/pull", None, "Refresh Metrics Data"),
        
        # PDF Quote Builder
        ("POST", "/api/quotes/build", {
            "package": "Professional",
            "addOns": ["SmartSpend", "Advanced Analytics"],
            "email": "test@example.com",
            "clientName": "Test Client Corp"
        }, "PDF Quote Generation"),
        
        # Call Management
        ("GET", "/api/logs/calls", None, "Call Log Viewer"),
        ("PATCH", "/api/calls/outcome", {
            "callId": "CALL_TEST_001",
            "newOutcome": "Lead Booked",
            "reason": "Manual override for testing"
        }, "Call Outcome Override"),
        
        # Communication Systems
        ("POST", "/api/alerts/slack", {
            "message": "API test alert from Command Center",
            "channel": "#alerts"
        }, "Slack Alert Trigger"),
        
        # Calendar & Email
        ("POST", "/api/calendar/invite", {
            "date": "2024-06-15",
            "time": "14:00",
            "name": "Test Attendee",
            "email": "attendee@example.com",
            "meetingType": "Product Demo"
        }, "Calendar Invite Generator"),
        
        ("POST", "/api/email/send-pack", {
            "email": "recipient@example.com",
            "clientName": "Test Client",
            "includeQuote": True
        }, "Demo Email Prep Pack"),
        
        ("POST", "/api/email/resend-quote", {
            "email": "client@example.com",
            "quoteId": "Q-TEST-001",
            "clientName": "Test Client"
        }, "Quote Resend"),
        
        # SMS & Lead Management
        ("POST", "/api/sms/reactivate", {
            "phone": "+1-555-0123",
            "name": "Test Lead",
            "lastContact": "2024-05-01T00:00:00Z"
        }, "SMS Lead Reactivation"),
        
        # Advanced Features
        ("GET", "/api/rag/memory", None, "RAG Memory Viewer"),
        ("GET", "/api/addons/status", None, "Add-On Status Tracker"),
        ("GET", "/api/stripe/status", None, "Stripe Payment Status"),
        ("GET", "/api/compliance/flags", None, "Compliance Flags"),
        ("GET", "/api/health/score", None, "Client Health Score"),
        ("GET", "/api/metrics/history", None, "Metrics History for Sparklines"),
        
        # Add-On Management
        ("POST", "/api/addons/activate", {
            "client": "test-client",
            "addonName": "Advanced Analytics",
            "setupCost": 750,
            "monthlyCost": 399
        }, "Add-On Activation"),
        
        # AI Features
        ("POST", "/api/ai/feedback", {
            "callTranscript": "Customer inquired about pricing and seemed interested",
            "currentOutcome": "Interested"
        }, "AI Call Review Feedback"),
        
        # Core Webhook Endpoints
        ("POST", "/api/leads/promo", {
            "name": "Test Promo Lead",
            "email": "promo@example.com",
            "phone": "+1-555-0199",
            "company": "Promo Test Corp"
        }, "Platinum Promo Lead Capture"),
        
        ("POST", "/api/leads/roi", {
            "name": "ROI Test Lead",
            "email": "roi@example.com",
            "phone": "+1-555-0198",
            "company": "ROI Test Corp",
            "currentCosts": 15000,
            "goalROI": 3.5
        }, "ROI Snapshot Lead"),
        
        ("POST", "/api/orders/live", {
            "name": "Live Order Test",
            "email": "order@example.com",
            "phone": "+1-555-0197",
            "package": "Enterprise",
            "addOns": ["SmartSpend", "Custom Integration"],
            "oneTimeTotal": 75000,
            "monthlyTotal": 4999,
            "finalQuoteTotal": 79999
        }, "Live Sales Order")
    ]
    
    results = []
    success_count = 0
    
    for method, endpoint, payload, description in test_cases:
        print(f"🧪 Testing: {description}")
        print(f"   {method} {endpoint}")
        
        result = test_endpoint(method, endpoint, payload, description)
        results.append(result)
        
        if result["success"]:
            print(f"   ✅ Success ({result['status']}) - {result['response_time']:.3f}s")
            success_count += 1
        else:
            print(f"   ❌ Failed ({result.get('status', 'ERROR')})")
            if 'error' in result:
                print(f"      Error: {result['error']}")
        
        print()
        time.sleep(0.5)  # Rate limiting
    
    # Summary
    print("=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    print(f"Total Tests: {len(test_cases)}")
    print(f"Successful: {success_count}")
    print(f"Failed: {len(test_cases) - success_count}")
    print(f"Success Rate: {(success_count / len(test_cases) * 100):.1f}%")
    print()
    
    # Detailed results
    print("📋 DETAILED RESULTS")
    print("-" * 60)
    
    for result in results:
        status_icon = "✅" if result["success"] else "❌"
        print(f"{status_icon} {result['description']}")
        print(f"    {result['method']} {result['endpoint']}")
        print(f"    Status: {result['status']}")
        
        if not result["success"] and 'error' in result:
            print(f"    Error: {result['error']}")
        
        if result["success"] and 'data' in result:
            if isinstance(result['data'], dict) and 'success' in result['data']:
                print(f"    Response: {result['data'].get('message', 'Success')}")
        
        print()
    
    print(f"🏁 Testing completed at {datetime.now()}")

if __name__ == "__main__":
    main()