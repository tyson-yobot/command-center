#!/usr/bin/env python3
"""
YoBot Webhook Automation Test Suite
Tests all 8 comprehensive automation webhook endpoints
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:5000"

def test_support_ticket_webhook():
    """Test support ticket automation webhook"""
    print("Testing Support Ticket Webhook...")
    
    ticket_data = {
        "ticketId": f"TICKET_{int(time.time())}",
        "clientName": "Test Client",
        "topic": "API Integration Issue",
        "ticketBody": "Having trouble with webhook integration. Need immediate assistance.",
        "priority": "high",
        "customerEmail": "test@testclient.com",
        "submittedBy": "John Doe"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/webhook/support", json=ticket_data)
        print(f"✅ Support Ticket Response: {response.status_code}")
        print(f"   Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Support Ticket Error: {e}")
        return False

def test_lead_capture_webhook():
    """Test lead capture automation webhook"""
    print("\nTesting Lead Capture Webhook...")
    
    lead_data = {
        "id": f"LEAD_{int(time.time())}",
        "name": "Sarah Johnson",
        "email": "sarah.johnson@prospect.com",
        "company": "Prospect Corp",
        "phone": "+1-555-0123",
        "source": "website_form",
        "interest_level": "high",
        "budget": "$50,000"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/webhook/lead", json=lead_data)
        print(f"✅ Lead Capture Response: {response.status_code}")
        print(f"   Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Lead Capture Error: {e}")
        return False

def test_payment_webhook():
    """Test payment processing automation webhook"""
    print("\nTesting Payment Webhook...")
    
    payment_data = {
        "id": f"PAY_{int(time.time())}",
        "customer_email": "customer@example.com",
        "amount": 2500.00,
        "currency": "USD",
        "status": "completed",
        "payment_method": "credit_card",
        "invoice_id": "INV_12345"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/webhook/payment", json=payment_data)
        print(f"✅ Payment Webhook Response: {response.status_code}")
        print(f"   Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Payment Webhook Error: {e}")
        return False

def test_stripe_webhook():
    """Test Stripe event automation webhook"""
    print("\nTesting Stripe Webhook...")
    
    stripe_data = {
        "type": "payment_intent.succeeded",
        "data": {
            "object": {
                "id": f"pi_{int(time.time())}",
                "amount": 5000,
                "currency": "usd",
                "customer": "cus_test123",
                "metadata": {
                    "order_id": "ORDER_789"
                }
            }
        }
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/webhook/stripe", json=stripe_data)
        print(f"✅ Stripe Webhook Response: {response.status_code}")
        print(f"   Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Stripe Webhook Error: {e}")
        return False

def test_usage_threshold_webhook():
    """Test usage threshold automation webhook"""
    print("\nTesting Usage Threshold Webhook...")
    
    usage_data = {
        "customer_id": "CUST_12345",
        "threshold_type": "voice_minutes",
        "current_usage": 950,
        "limit": 1000,
        "percentage": 95,
        "plan": "Professional"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/webhook/usage", json=usage_data)
        print(f"✅ Usage Threshold Response: {response.status_code}")
        print(f"   Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Usage Threshold Error: {e}")
        return False

def test_calendar_booking_webhook():
    """Test calendar booking automation webhook"""
    print("\nTesting Calendar Booking Webhook...")
    
    booking_data = {
        "id": f"BOOKING_{int(time.time())}",
        "attendee_name": "Michael Chen",
        "attendee_email": "michael.chen@company.com",
        "meeting_type": "Demo Call",
        "scheduled_time": "2024-06-04T14:00:00Z",
        "duration": 60,
        "zoom_link": "https://zoom.us/j/123456789"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/webhook/calendar", json=booking_data)
        print(f"✅ Calendar Booking Response: {response.status_code}")
        print(f"   Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Calendar Booking Error: {e}")
        return False

def test_form_submission_webhook():
    """Test form submission automation webhook"""
    print("\nTesting Form Submission Webhook...")
    
    form_data = {
        "id": f"FORM_{int(time.time())}",
        "form_type": "contact_us",
        "name": "Lisa Rodriguez",
        "email": "lisa.rodriguez@business.com",
        "message": "Interested in enterprise automation solutions",
        "company": "Business Solutions Inc",
        "industry": "Technology"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/webhook/form", json=form_data)
        print(f"✅ Form Submission Response: {response.status_code}")
        print(f"   Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Form Submission Error: {e}")
        return False

def test_airtable_integration():
    """Test Airtable Integration Test Log API"""
    print("\nTesting Airtable Integration...")
    
    try:
        # Test metrics endpoint
        response = requests.get(f"{BASE_URL}/api/airtable/test-metrics")
        print(f"✅ Airtable Test Metrics: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Total Tests: {data.get('totalTests', 0)}")
            print(f"   Pass Rate: {data.get('passRate', 0)}%")
        
        # Test Command Center metrics
        response = requests.get(f"{BASE_URL}/api/airtable/command-center-metrics")
        print(f"✅ Command Center Metrics: {response.status_code}")
        
        return True
    except Exception as e:
        print(f"❌ Airtable Integration Error: {e}")
        return False

def run_comprehensive_webhook_test():
    """Run complete webhook automation test suite"""
    print("YoBot Comprehensive Webhook Automation Test Suite")
    print("=" * 60)
    print(f"Test Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    tests = [
        test_support_ticket_webhook,
        test_lead_capture_webhook,
        test_payment_webhook,
        test_stripe_webhook,
        test_usage_threshold_webhook,
        test_calendar_booking_webhook,
        test_form_submission_webhook,
        test_airtable_integration
    ]
    
    results = []
    for test in tests:
        result = test()
        results.append(result)
        time.sleep(1)  # Brief pause between tests
    
    print("\n" + "=" * 60)
    print("Test Summary:")
    print(f"Total Tests: {len(results)}")
    print(f"Passed: {sum(results)}")
    print(f"Failed: {len(results) - sum(results)}")
    print(f"Success Rate: {(sum(results) / len(results)) * 100:.1f}%")
    
    if all(results):
        print("\n🎉 ALL WEBHOOK AUTOMATIONS WORKING!")
        print("✅ Complete automation system is operational")
    else:
        print("\n⚠️  Some webhook automations need attention")
    
    print(f"Test Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    run_comprehensive_webhook_test()