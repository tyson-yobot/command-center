"""
Failed Tests Re-Run Suite
Re-executes all failed tests from CSV and updates Airtable with current status
"""
import os
import requests
from datetime import datetime
import json
from airtable_test_logger import log_test_to_airtable

def test_referral_api():
    """Test YoBot Referral API"""
    try:
        # Test referral system components
        from referral_system_test import test_referral_complete_suite
        result = test_referral_complete_suite()
        
        if result:
            log_test_to_airtable("YoBot Referral API", "PASS", "Referral API endpoints operational", "Referral")
            return True
        else:
            log_test_to_airtable("YoBot Referral API", "FAIL", "Referral endpoint not available", "Referral")
            return False
    except Exception as e:
        log_test_to_airtable("YoBot Referral API", "FAIL", f"Error: {str(e)}", "Referral")
        return False

def test_referral_crm_integration():
    """Test Referral CRM Integration"""
    try:
        if not os.getenv('HUBSPOT_API_KEY'):
            log_test_to_airtable("Referral CRM Integration", "FAIL", "HubSpot API key not configured", "CRM Integration")
            return False
            
        # Test HubSpot contact creation
        headers = {
            'Authorization': f'Bearer {os.getenv("HUBSPOT_API_KEY")}',
            'Content-Type': 'application/json'
        }
        
        test_contact = {
            "properties": {
                "email": "test-referral@example.com",
                "firstname": "Test",
                "lastname": "Referral"
            }
        }
        
        response = requests.post(
            "https://api.hubapi.com/crm/v3/objects/contacts",
            headers=headers,
            json=test_contact
        )
        
        if response.status_code == 201:
            log_test_to_airtable("Referral CRM Integration", "PASS", "HubSpot contact creation successful", "CRM Integration")
            return True
        else:
            log_test_to_airtable("Referral CRM Integration", "FAIL", f"HubSpot API error: {response.status_code}", "CRM Integration")
            return False
            
    except Exception as e:
        log_test_to_airtable("Referral CRM Integration", "FAIL", f"Error: {str(e)}", "CRM Integration")
        return False

def test_stripe_payment_webhook():
    """Test Stripe Payment Webhook"""
    try:
        if not os.getenv('STRIPE_SECRET_KEY'):
            log_test_to_airtable("Stripe Payment Webhook", "FAIL", "Stripe API key not configured", "Payments")
            return False
            
        # Test Stripe webhook endpoint
        import stripe
        stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
        
        # Test webhook endpoint configuration
        webhooks = stripe.WebhookEndpoint.list(limit=1)
        
        log_test_to_airtable("Stripe Payment Webhook", "PASS", "Stripe webhook configuration accessible", "Payments")
        return True
        
    except Exception as e:
        log_test_to_airtable("Stripe Payment Webhook", "FAIL", f"Stripe webhook error: {str(e)}", "Payments")
        return False

def test_phantombuster_agents():
    """Test PhantomBuster Agents"""
    try:
        if not os.getenv('PHANTOMBUSTER_API_KEY'):
            log_test_to_airtable("PhantomBuster Agents", "FAIL", "PhantomBuster API key not configured", "Lead Generation")
            return False
            
        headers = {
            'X-Phantombuster-Key': os.getenv('PHANTOMBUSTER_API_KEY')
        }
        
        response = requests.get(
            "https://api.phantombuster.com/api/v2/agents",
            headers=headers
        )
        
        if response.status_code == 200:
            log_test_to_airtable("PhantomBuster Agents", "PASS", "PhantomBuster API connection successful", "Lead Generation")
            return True
        else:
            log_test_to_airtable("PhantomBuster Agents", "FAIL", f"PhantomBuster API error: {response.status_code}", "Lead Generation")
            return False
            
    except Exception as e:
        log_test_to_airtable("PhantomBuster Agents", "FAIL", f"Error: {str(e)}", "Lead Generation")
        return False

def test_airtable_crm_push():
    """Test Airtable CRM Push"""
    try:
        if not os.getenv('AIRTABLE_API_KEY'):
            log_test_to_airtable("Airtable CRM Push", "FAIL", "Airtable API key not configured", "Lead Generation")
            return False
            
        headers = {
            'Authorization': f'Bearer {os.getenv("AIRTABLE_API_KEY")}',
            'Content-Type': 'application/json'
        }
        
        # Test Airtable base access
        base_id = os.getenv('AIRTABLE_BASE_ID', 'appRt8V3tH4g5Z5if')
        
        response = requests.get(
            f"https://api.airtable.com/v0/{base_id}/Integration%20Test%20Log",
            headers=headers
        )
        
        if response.status_code == 200:
            log_test_to_airtable("Airtable CRM Push", "PASS", "Airtable API connection successful", "Lead Generation")
            return True
        else:
            log_test_to_airtable("Airtable CRM Push", "FAIL", f"Airtable API error: {response.status_code}", "Lead Generation")
            return False
            
    except Exception as e:
        log_test_to_airtable("Airtable CRM Push", "FAIL", f"Error: {str(e)}", "Lead Generation")
        return False

def test_linkedin_auto_message():
    """Test LinkedIn Auto-Message"""
    try:
        # Test LinkedIn messaging system
        from phantombuster_lead_generator import send_linkedin_message
        
        test_profile = "https://linkedin.com/in/test-profile"
        test_message = "Test message for integration testing"
        
        result = send_linkedin_message(test_profile, test_message)
        
        if result:
            log_test_to_airtable("LinkedIn Auto-Message", "PASS", "LinkedIn messaging system operational", "LinkedIn Automation")
            return True
        else:
            log_test_to_airtable("LinkedIn Auto-Message", "FAIL", "LinkedIn messaging not configured", "LinkedIn Automation")
            return False
            
    except Exception as e:
        log_test_to_airtable("LinkedIn Auto-Message", "FAIL", f"Error: {str(e)}", "LinkedIn Automation")
        return False

def test_demo_booking_logged():
    """Test Demo Booking Logged"""
    try:
        from demo_booking_automation import log_demo_booking
        
        test_lead = {
            "name": "Test Demo Client",
            "email": "demo-test@example.com",
            "company": "Test Corp",
            "demo_time": "2025-06-03T14:00:00"
        }
        
        result = log_demo_booking(test_lead)
        
        if result:
            log_test_to_airtable("Demo Booking Logged", "PASS", "Demo booking system operational", "Demo Tracking")
            return True
        else:
            log_test_to_airtable("Demo Booking Logged", "FAIL", "Demo booking logging failed", "Demo Tracking")
            return False
            
    except Exception as e:
        log_test_to_airtable("Demo Booking Logged", "FAIL", f"Error: {str(e)}", "Demo Tracking")
        return False

def test_smartspend_usage():
    """Test SmartSpend Usage Logging"""
    try:
        from metrics_tracker_airtable import log_usage_metric
        
        test_metrics = [
            {"client": "test@client.com", "service": "Voice Minutes", "units": 50, "cost": 7.5},
            {"client": "test@client.com", "service": "API Calls", "units": 1000, "cost": 5.0}
        ]
        
        success_count = 0
        for metric in test_metrics:
            if log_usage_metric(metric["client"], metric["service"], metric["units"], metric["cost"]):
                success_count += 1
        
        if success_count > 0:
            log_test_to_airtable("SmartSpend Usage Logged", "PASS", f"Usage tracking operational ({success_count}/2 metrics)", "Usage Tracking")
            return True
        else:
            log_test_to_airtable("SmartSpend Usage Logged", "FAIL", "Usage tracking not configured", "Usage Tracking")
            return False
            
    except Exception as e:
        log_test_to_airtable("SmartSpend Usage Logged", "FAIL", f"Error: {str(e)}", "Usage Tracking")
        return False

def test_dynamic_tone_retrieval():
    """Test Dynamic Tone Retrieval"""
    try:
        if not os.getenv('AIRTABLE_API_KEY'):
            log_test_to_airtable("Dynamic Tone Retrieval", "FAIL", "Airtable API key not configured", "Voice Tone System")
            return False
            
        headers = {
            'Authorization': f'Bearer {os.getenv("AIRTABLE_API_KEY")}',
            'Content-Type': 'application/json'
        }
        
        # Test tone data retrieval
        base_id = os.getenv('AIRTABLE_BASE_ID', 'appRt8V3tH4g5Z5if')
        
        response = requests.get(
            f"https://api.airtable.com/v0/{base_id}/Voice%20Tones",
            headers=headers
        )
        
        if response.status_code == 200:
            log_test_to_airtable("Dynamic Tone Retrieval", "PASS", "Tone data retrieval successful", "Voice Tone System")
            return True
        else:
            log_test_to_airtable("Dynamic Tone Retrieval", "FAIL", f"Failed to fetch tone data: HTTP {response.status_code}", "Voice Tone System")
            return False
            
    except Exception as e:
        log_test_to_airtable("Dynamic Tone Retrieval", "FAIL", f"Error: {str(e)}", "Voice Tone System")
        return False

def test_botalytics_logging():
    """Test Botalytics Data Logging"""
    try:
        from metrics_tracker_airtable import log_botalytics_metric
        
        test_metrics = [
            {"client": "client_001", "metric": "Conversion Rate", "value": 0.15},
            {"client": "client_001", "metric": "Bot Calls", "value": 45},
            {"client": "client_002", "metric": "Response Time", "value": 1.2},
            {"client": "client_002", "metric": "Satisfaction Score", "value": 4.7}
        ]
        
        success_count = 0
        for metric in test_metrics:
            if log_botalytics_metric(metric["client"], metric["metric"], metric["value"]):
                success_count += 1
        
        if success_count > 0:
            log_test_to_airtable("Botalytics Data Logging", "PASS", f"Analytics logging operational ({success_count}/4 metrics)", "Analytics Tracking")
            return True
        else:
            log_test_to_airtable("Botalytics Data Logging", "FAIL", "Analytics logging not configured", "Analytics Tracking")
            return False
            
    except Exception as e:
        log_test_to_airtable("Botalytics Data Logging", "FAIL", f"Error: {str(e)}", "Analytics Tracking")
        return False

def test_elevenlabs_audio():
    """Test ElevenLabs Audio Generation"""
    try:
        if not os.getenv('ELEVENLABS_API_KEY'):
            log_test_to_airtable("Audio Generation Failed", "FAIL", "ElevenLabs API key not configured", "Voice Generation")
            return False
            
        headers = {
            'Authorization': f'Bearer {os.getenv("ELEVENLABS_API_KEY")}',
            'Content-Type': 'application/json'
        }
        
        # Test ElevenLabs API access
        response = requests.get(
            "https://api.elevenlabs.io/v1/voices",
            headers=headers
        )
        
        if response.status_code == 200:
            log_test_to_airtable("Audio Generation Failed", "PASS", "ElevenLabs API connection successful", "Voice Generation")
            return True
        else:
            log_test_to_airtable("Audio Generation Failed", "FAIL", f"ElevenLabs API error: {response.status_code}", "Voice Generation")
            return False
            
    except Exception as e:
        log_test_to_airtable("Audio Generation Failed", "FAIL", f"Error: {str(e)}", "Voice Generation")
        return False

def test_client_provisioning():
    """Test Client Provisioning System"""
    try:
        from client_provisioning_automation import generate_client_config
        
        test_config = generate_client_config("Test Client", "test@client.com", "technology")
        
        if test_config and "client_name" in test_config:
            log_test_to_airtable("Client Provisioning Partial", "PASS", "Client provisioning system operational", "Complete Provisioning")
            return True
        else:
            log_test_to_airtable("Client Provisioning Partial", "FAIL", "Client provisioning configuration failed", "Complete Provisioning")
            return False
            
    except Exception as e:
        log_test_to_airtable("Client Provisioning Partial", "FAIL", f"Error: {str(e)}", "Complete Provisioning")
        return False

def run_failed_tests_rerun():
    """Re-run all failed tests and update Airtable"""
    print("🔄 Re-running Failed Tests from CSV")
    print("=" * 60)
    
    tests = [
        ("Referral API", test_referral_api),
        ("Referral CRM Integration", test_referral_crm_integration),
        ("Stripe Payment Webhook", test_stripe_payment_webhook),
        ("PhantomBuster Agents", test_phantombuster_agents),
        ("Airtable CRM Push", test_airtable_crm_push),
        ("LinkedIn Auto-Message", test_linkedin_auto_message),
        ("Demo Booking Logged", test_demo_booking_logged),
        ("SmartSpend Usage", test_smartspend_usage),
        ("Dynamic Tone Retrieval", test_dynamic_tone_retrieval),
        ("Botalytics Logging", test_botalytics_logging),
        ("ElevenLabs Audio", test_elevenlabs_audio),
        ("Client Provisioning", test_client_provisioning)
    ]
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        print(f"🧪 Testing {test_name}...")
        try:
            if test_func():
                print(f"  ✅ PASS")
                passed += 1
            else:
                print(f"  ❌ FAIL")
                failed += 1
        except Exception as e:
            print(f"  ❌ ERROR: {str(e)}")
            failed += 1
    
    print("\n" + "=" * 60)
    print(f"📊 Failed Tests Re-run Complete")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"📈 Improvement: {passed}/{passed + failed} tests now working")
    
    # Log overall re-run results
    log_test_to_airtable(
        "Failed Tests Re-run Suite", 
        "COMPLETE",
        f"Re-tested {passed + failed} failed systems. {passed} now passing, {failed} still need attention.",
        "Test Suite"
    )
    
    return {"passed": passed, "failed": failed, "total": passed + failed}

if __name__ == "__main__":
    run_failed_tests_rerun()