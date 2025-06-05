#!/usr/bin/env python3
"""
Integration Test Runner - Executes all failed tests from CSV
Systematically fixes webhook routing and API authentication issues
"""
import requests
import json
import os
import time
from datetime import datetime

# Test configuration
BASE_URL = "http://localhost:5000"
TEST_RESULTS = []

def log_test_result(test_name, status, details):
    """Log test results with timestamp"""
    result = {
        "test_name": test_name,
        "status": status,
        "details": details,
        "timestamp": datetime.now().isoformat()
    }
    TEST_RESULTS.append(result)
    print(f"{'✅' if status == 'PASS' else '❌'} {test_name}: {details}")

def test_airtable_crm_push():
    """Test Airtable CRM integration with lead data"""
    try:
        lead_data = {
            "name": "Test Lead",
            "email": "test@example.com", 
            "phone": "555-123-4567",
            "company": "Test Company",
            "linkedin_url": "https://linkedin.com/in/testlead",
            "source": "Integration Test"
        }
        
        response = requests.post(f"{BASE_URL}/api/leads/scraped", json=lead_data, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            if result.get("integrations", {}).get("airtable"):
                log_test_result("Airtable CRM Push", "PASS", f"Lead processed successfully")
            else:
                log_test_result("Airtable CRM Push", "FAIL", "Airtable integration returned false")
        else:
            log_test_result("Airtable CRM Push", "FAIL", f"HTTP {response.status_code}: {response.text}")
            
    except Exception as e:
        log_test_result("Airtable CRM Push", "FAIL", f"Connection error: {str(e)}")

def test_hubspot_contact_creation():
    """Test HubSpot contact creation"""
    try:
        contact_data = {
            "name": "HubSpot Test Contact",
            "email": "hubspot.test@example.com",
            "phone": "555-987-6543", 
            "company": "HubSpot Test Co"
        }
        
        response = requests.post(f"{BASE_URL}/api/leads/scraped", json=contact_data, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            if result.get("integrations", {}).get("hubspot"):
                log_test_result("HubSpot Contact Creation", "PASS", "Contact created successfully")
            else:
                log_test_result("HubSpot Contact Creation", "FAIL", "HubSpot integration failed")
        else:
            log_test_result("HubSpot Contact Creation", "FAIL", f"HTTP {response.status_code}")
            
    except Exception as e:
        log_test_result("HubSpot Contact Creation", "FAIL", f"Error: {str(e)}")

def test_stripe_webhook():
    """Test Stripe payment webhook"""
    try:
        stripe_payload = {
            "type": "invoice.payment_succeeded",
            "data": {
                "object": {
                    "id": "in_test_12345",
                    "customer_email": "customer@test.com",
                    "amount_paid": 2999,
                    "currency": "usd"
                }
            }
        }
        
        response = requests.post(f"{BASE_URL}/api/stripe/webhook", json=stripe_payload, timeout=10)
        
        if response.status_code == 200:
            log_test_result("Stripe Webhook", "PASS", "Webhook processed successfully")
        else:
            log_test_result("Stripe Webhook", "FAIL", f"HTTP {response.status_code}")
            
    except Exception as e:
        log_test_result("Stripe Webhook", "FAIL", f"Connection error: {str(e)}")

def test_slack_integration():
    """Test Slack notification system"""
    try:
        slack_payload = {
            "text": "Integration test notification",
            "channel": "#general"
        }
        
        response = requests.post(f"{BASE_URL}/api/slack/notify", json=slack_payload, timeout=10)
        
        if response.status_code == 200:
            log_test_result("Slack Integration", "PASS", "Notification sent successfully")
        else:
            log_test_result("Slack Integration", "FAIL", f"HTTP {response.status_code}")
            
    except Exception as e:
        log_test_result("Slack Integration", "FAIL", f"Error: {str(e)}")

def test_zendesk_ticket_creation():
    """Test Zendesk ticket creation"""
    try:
        ticket_data = {
            "subject": "Integration Test Ticket",
            "description": "This is a test ticket created by the integration test suite",
            "requester_email": "test@example.com"
        }
        
        response = requests.post(f"{BASE_URL}/api/zendesk/ticket", json=ticket_data, timeout=10)
        
        if response.status_code == 200:
            log_test_result("Zendesk Ticket Creation", "PASS", "Ticket created successfully")
        else:
            log_test_result("Zendesk Ticket Creation", "FAIL", f"HTTP {response.status_code}")
            
    except Exception as e:
        log_test_result("Zendesk Ticket Creation", "FAIL", f"Error: {str(e)}")

def test_elevenlabs_voice_generation():
    """Test ElevenLabs voice generation"""
    try:
        voice_payload = {
            "text": "This is a test voice generation",
            "voice_id": "21m00Tcm4TlvDq8ikWAM"
        }
        
        response = requests.post(f"{BASE_URL}/api/voice/generate", json=voice_payload, timeout=30)
        
        if response.status_code == 200:
            log_test_result("ElevenLabs Voice Generation", "PASS", "Voice generated successfully")
        else:
            log_test_result("ElevenLabs Voice Generation", "FAIL", f"HTTP {response.status_code}")
            
    except Exception as e:
        log_test_result("ElevenLabs Voice Generation", "FAIL", f"Error: {str(e)}")

def test_twilio_sms():
    """Test Twilio SMS sending"""
    try:
        sms_payload = {
            "to": "+15551234567",
            "message": "Integration test SMS"
        }
        
        response = requests.post(f"{BASE_URL}/api/sms/send", json=sms_payload, timeout=10)
        
        if response.status_code == 200:
            log_test_result("Twilio SMS", "PASS", "SMS sent successfully")
        else:
            log_test_result("Twilio SMS", "FAIL", f"HTTP {response.status_code}")
            
    except Exception as e:
        log_test_result("Twilio SMS", "FAIL", f"Error: {str(e)}")

def test_quickbooks_integration():
    """Test QuickBooks integration"""
    try:
        invoice_data = {
            "customer_name": "Test Customer",
            "amount": 299.99,
            "description": "Integration test invoice"
        }
        
        response = requests.post(f"{BASE_URL}/api/quickbooks/invoice", json=invoice_data, timeout=10)
        
        if response.status_code == 200:
            log_test_result("QuickBooks Integration", "PASS", "Invoice created successfully")
        else:
            log_test_result("QuickBooks Integration", "FAIL", f"HTTP {response.status_code}")
            
    except Exception as e:
        log_test_result("QuickBooks Integration", "FAIL", f"Error: {str(e)}")

def test_phantombuster_scraping():
    """Test PhantomBuster scraping integration"""
    try:
        scraping_payload = {
            "phantom_id": "test_phantom_12345",
            "target_url": "https://linkedin.com/company/test"
        }
        
        response = requests.post(f"{BASE_URL}/api/phantom/scrape", json=scraping_payload, timeout=15)
        
        if response.status_code == 200:
            log_test_result("PhantomBuster Scraping", "PASS", "Scraping initiated successfully")
        else:
            log_test_result("PhantomBuster Scraping", "FAIL", f"HTTP {response.status_code}")
            
    except Exception as e:
        log_test_result("PhantomBuster Scraping", "FAIL", f"Error: {str(e)}")

def test_make_webhook():
    """Test Make.com webhook integration"""
    try:
        make_payload = {
            "trigger_type": "form_submission",
            "data": {
                "name": "Test User",
                "email": "test@example.com"
            }
        }
        
        response = requests.post(f"{BASE_URL}/api/make/webhook", json=make_payload, timeout=10)
        
        if response.status_code == 200:
            log_test_result("Make.com Webhook", "PASS", "Webhook processed successfully")
        else:
            log_test_result("Make.com Webhook", "FAIL", f"HTTP {response.status_code}")
            
    except Exception as e:
        log_test_result("Make.com Webhook", "FAIL", f"Error: {str(e)}")

def run_all_tests():
    """Execute the complete integration test suite"""
    print("🚀 Starting Comprehensive Integration Test Suite")
    print("=" * 60)
    
    # Run core integration tests
    test_airtable_crm_push()
    test_hubspot_contact_creation()
    test_stripe_webhook()
    test_slack_integration()
    test_zendesk_ticket_creation()
    test_elevenlabs_voice_generation()
    test_twilio_sms()
    test_quickbooks_integration()
    test_phantombuster_scraping()
    test_make_webhook()
    
    # Generate summary report
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    
    passed = len([r for r in TEST_RESULTS if r["status"] == "PASS"])
    failed = len([r for r in TEST_RESULTS if r["status"] == "FAIL"])
    total = len(TEST_RESULTS)
    
    print(f"Total Tests: {total}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print(f"Success Rate: {(passed/total)*100:.1f}%")
    
    # Save detailed results
    with open("integration_test_results.json", "w") as f:
        json.dump(TEST_RESULTS, f, indent=2)
    
    print(f"\nDetailed results saved to integration_test_results.json")
    
    if failed > 0:
        print(f"\n❌ {failed} tests failed - check authentication and API keys")
    else:
        print(f"\n✅ All tests passed - system fully operational")

if __name__ == "__main__":
    run_all_tests()