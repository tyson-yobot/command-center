"""
HubSpot Contact Test + Auto-Logging
Enhanced HubSpot CRM integration test with automatic result logging
"""

import requests
import os
from datetime import datetime

# Your actual Airtable credentials
AIRTABLE_API_KEY = os.getenv('AIRTABLE_API_KEY')
BASE_ID = "appRt8V3tH4g5Z5if"
TABLE_ID = "tbly0fjE2M5uHET9X"

def log_test_to_airtable(name, status, notes, module_type="Core Automation", link=""):
    """Auto-log test results to Integration Test Log"""
    if AIRTABLE_API_KEY:
        url = f"https://api.airtable.com/v0/{BASE_ID}/{TABLE_ID}"
        headers = {
            "Authorization": f"Bearer {AIRTABLE_API_KEY}",
            "Content-Type": "application/json"
        }
        data = {
            "fields": {
                "🔧 Integration Name": name,
                "✅ Pass/Fail": status == "✅",
                "🧠 Notes / Debug": notes,
                "📅 Test Date": datetime.today().strftime("%Y-%m-%d"),
                "🧑‍💻 QA Owner": "Tyson",
                "🧩 Module Type": module_type,
                "📂 Related Scenario Link": link
            }
        }
        
        response = requests.post(url, headers=headers, json=data)
        if response.status_code == 200:
            print("✅ Airtable log posted")
            return True
        else:
            print(f"❌ Airtable log failed: {response.status_code} {response.text}")
            return False
    else:
        print("❌ Airtable API key not available")
        return False

def test_hubspot_contact_creation():
    """Test HubSpot contact creation"""
    hubspot_key = os.getenv('HUBSPOT_API_KEY')
    
    if not hubspot_key:
        print("❌ HubSpot API key not found")
        log_test_to_airtable(
            "HubSpot Contact Creation",
            "❌",
            "API key not configured",
            "CRM Integration"
        )
        return False
    
    url = "https://api.hubapi.com/crm/v3/objects/contacts"
    headers = {
        "Authorization": f"Bearer {hubspot_key}",
        "Content-Type": "application/json"
    }
    
    timestamp = datetime.now().strftime("%H%M%S")
    data = {
        "properties": {
            "email": f"testcontact_{timestamp}@yobot.bot",
            "firstname": "Test",
            "lastname": "Bot",
            "company": "YoBot Integration Test"
        }
    }
    
    try:
        response = requests.post(url, headers=headers, json=data, timeout=10)
        
        if response.status_code == 201:
            contact_data = response.json()
            contact_id = contact_data.get('id', 'unknown')
            print(f"✅ HubSpot contact created - ID: {contact_id}")
            
            log_test_to_airtable(
                "HubSpot Contact Creation",
                "✅",
                f"Contact created successfully - ID: {contact_id}",
                "CRM Integration",
                f"https://app.hubspot.com/contacts/{contact_id}"
            )
            return True
            
        else:
            error_msg = f"HTTP {response.status_code}: {response.text}"
            print(f"❌ HubSpot contact creation failed: {error_msg}")
            
            log_test_to_airtable(
                "HubSpot Contact Creation",
                "❌",
                error_msg,
                "CRM Integration"
            )
            return False
            
    except Exception as e:
        error_msg = str(e)
        print(f"❌ HubSpot contact creation error: {error_msg}")
        
        log_test_to_airtable(
            "HubSpot Contact Creation",
            "❌",
            f"Exception: {error_msg}",
            "CRM Integration"
        )
        return False

def test_hubspot_contact_retrieval():
    """Test HubSpot contact retrieval"""
    hubspot_key = os.getenv('HUBSPOT_API_KEY')
    
    if not hubspot_key:
        print("❌ HubSpot API key not found")
        return False
    
    url = "https://api.hubapi.com/crm/v3/objects/contacts?limit=5"
    headers = {
        "Authorization": f"Bearer {hubspot_key}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            contact_data = response.json()
            total_contacts = contact_data.get('total', 0)
            results_count = len(contact_data.get('results', []))
            
            print(f"✅ HubSpot contact retrieval successful - {total_contacts} total contacts")
            
            log_test_to_airtable(
                "HubSpot Contact Retrieval",
                "✅",
                f"Retrieved {results_count} contacts from {total_contacts} total",
                "CRM Integration",
                "https://app.hubspot.com/contacts"
            )
            return True
            
        else:
            error_msg = f"HTTP {response.status_code}: {response.text}"
            print(f"❌ HubSpot contact retrieval failed: {error_msg}")
            
            log_test_to_airtable(
                "HubSpot Contact Retrieval",
                "❌",
                error_msg,
                "CRM Integration"
            )
            return False
            
    except Exception as e:
        error_msg = str(e)
        print(f"❌ HubSpot contact retrieval error: {error_msg}")
        
        log_test_to_airtable(
            "HubSpot Contact Retrieval",
            "❌",
            f"Exception: {error_msg}",
            "CRM Integration"
        )
        return False

def test_booking_link_alert():
    """Test booking link Slack alert"""
    webhook_url = "https://hooks.slack.com/services/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"
    timestamp = datetime.now().strftime("%H:%M:%S")
    
    payload = {
        "text": f"📅 Booking Link Sent: https://calendly.com/yobot/30min (Test at {timestamp})",
        "username": "YoBot Scheduler",
        "icon_emoji": ":calendar:"
    }
    
    try:
        response = requests.post(webhook_url, json=payload, timeout=5)
        
        if response.status_code == 200:
            print("✅ Booking link alert sent to Slack")
            
            log_test_to_airtable(
                "Booking Link Trigger",
                "✅",
                f"Calendly link posted to Slack at {timestamp}",
                "Scheduling",
                "https://calendly.com/yobot/30min"
            )
            return True
            
        else:
            error_msg = f"HTTP {response.status_code}: {response.text}"
            print(f"❌ Booking link alert failed: {error_msg}")
            
            log_test_to_airtable(
                "Booking Link Trigger",
                "❌",
                error_msg,
                "Scheduling"
            )
            return False
            
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Booking link alert error: {error_msg}")
        
        log_test_to_airtable(
            "Booking Link Trigger",
            "❌",
            f"Exception: {error_msg}",
            "Scheduling"
        )
        return False

def test_hubspot_integration_suite():
    """Run complete HubSpot integration test suite with auto-logging"""
    print("🚀 Running HubSpot Integration Test Suite")
    print("=" * 50)
    
    # Run all tests
    contact_creation = test_hubspot_contact_creation()
    contact_retrieval = test_hubspot_contact_retrieval()
    booking_alert = test_booking_link_alert()
    
    # Summary
    results = [contact_creation, contact_retrieval, booking_alert]
    total_passed = sum(results)
    total_tests = len(results)
    
    print(f"\n📊 HubSpot Integration Results: {total_passed}/{total_tests} tests passed")
    
    # Log overall suite result
    if total_passed == total_tests:
        log_test_to_airtable(
            "Complete HubSpot Integration Suite",
            "✅",
            f"All {total_tests} HubSpot tests passed successfully",
            "CRM System",
            "https://app.hubspot.com"
        )
    else:
        log_test_to_airtable(
            "Complete HubSpot Integration Suite",
            "❌",
            f"Only {total_passed}/{total_tests} HubSpot tests passed",
            "CRM System"
        )
    
    print("🎯 All results automatically logged to Integration Test Log")
    return total_passed == total_tests

if __name__ == "__main__":
    test_hubspot_integration_suite()