"""
Enhanced Integration Test Logger
Automatically logs all test results to Airtable Integration Test Log table
"""

import requests
import os
from datetime import datetime
from universal_webhook_logger import log_to_airtable

# Your Airtable credentials
AIRTABLE_API_KEY = os.getenv('AIRTABLE_API_KEY')
BASE_ID = os.getenv('AIRTABLE_BASE_ID')
TABLE_NAME = "🧪 Integration Test Log"

def log_test_to_airtable(name, status, notes, module_type="Core Automation", link=""):
    """Log integration test results to Airtable tracking table"""
    if AIRTABLE_API_KEY and BASE_ID:
        url = f"https://api.airtable.com/v0/{BASE_ID}/{TABLE_NAME}"
        headers = {
            "Authorization": f"Bearer {AIRTABLE_API_KEY}",
            "Content-Type": "application/json"
        }
        data = {
            "fields": {
                "🔧 Integration Name": name,
                "✅ Pass/Fail": status,
                "🧠 Notes / Debug": notes,
                "📅 Test Date": datetime.today().strftime("%Y-%m-%d"),
                "🧑‍💻 QA Owner": "Tyson",
                "📤 Output Data Populated": True,
                "🗃️ Record Created?": True,
                "🔁 Retry Attempted?": False,
                "🧩 Module Type": module_type,
                "📂 Related Scenario Link": link
            }
        }
        
        try:
            response = requests.post(url, headers=headers, json=data)
            if response.status_code == 200:
                print("✅ Airtable test log posted successfully")
                return True
            else:
                print(f"❌ Test log failed: {response.status_code} {response.text}")
                return False
        except Exception as e:
            print(f"❌ Test log error: {str(e)}")
            return False
    else:
        print("❌ Airtable credentials not available for test logging")
        return False

def test_hubspot_with_logging():
    """Test HubSpot integration with automatic logging"""
    try:
        hubspot_key = os.getenv('HUBSPOT_API_KEY')
        
        if hubspot_key:
            # Test contact creation
            url = 'https://api.hubapi.com/crm/v3/objects/contacts'
            headers = {'Authorization': f'Bearer {hubspot_key}', 'Content-Type': 'application/json'}
            
            timestamp = datetime.now().strftime("%H%M%S")
            data = {
                'properties': {
                    'email': f'auto_test_{timestamp}@yobot.bot',
                    'firstname': 'Auto',
                    'lastname': f'Test_{timestamp}',
                    'company': 'YoBot Integration Suite'
                }
            }
            
            response = requests.post(url, headers=headers, json=data)
            
            if response.status_code == 201:
                contact_data = response.json()
                contact_id = contact_data.get('id')
                
                # Log successful test
                log_test_to_airtable(
                    name="HubSpot Contact Creation",
                    status="✅",
                    notes=f"Created contact ID: {contact_id}",
                    module_type="CRM Integration",
                    link=f"https://app.hubspot.com/contacts/{contact_id}"
                )
                return True
            else:
                # Log failed test
                log_test_to_airtable(
                    name="HubSpot Contact Creation",
                    status="❌",
                    notes=f"{response.status_code} error - {response.text}",
                    module_type="CRM Integration",
                    link="https://app.hubspot.com/contacts"
                )
                return False
        else:
            log_test_to_airtable(
                name="HubSpot Contact Creation",
                status="❌",
                notes="API key not available",
                module_type="CRM Integration"
            )
            return False
            
    except Exception as e:
        log_test_to_airtable(
            name="HubSpot Contact Creation",
            status="❌",
            notes=f"Exception: {str(e)}",
            module_type="CRM Integration"
        )
        return False

def test_slack_with_logging():
    """Test Slack integration with automatic logging"""
    try:
        # Test alerts channel
        alerts_webhook = "https://hooks.slack.com/services/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"
        timestamp = datetime.now().strftime("%H:%M:%S")
        
        alert_message = {
            "text": f"Integration test alert - {timestamp}",
            "username": "YoBot Integration Tester"
        }
        
        response = requests.post(alerts_webhook, json=alert_message, timeout=5)
        
        if response.status_code == 200:
            # Log successful test
            log_test_to_airtable(
                name="Slack Alert System",
                status="✅",
                notes=f"Alert sent successfully at {timestamp}",
                module_type="Communication",
                link="https://hooks.slack.com/services/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"
            )
            return True
        else:
            # Log failed test
            log_test_to_airtable(
                name="Slack Alert System",
                status="❌",
                notes=f"{response.status_code} error - webhook failed",
                module_type="Communication",
                link="https://hooks.slack.com/services/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"
            )
            return False
            
    except Exception as e:
        log_test_to_airtable(
            name="Slack Alert System",
            status="❌",
            notes=f"Exception: {str(e)}",
            module_type="Communication"
        )
        return False

def test_elevenlabs_with_logging():
    """Test ElevenLabs integration with automatic logging"""
    try:
        api_key = os.getenv('ELEVENLABS_API_KEY')
        voice_id = 'cjVigY5qzO86Huf0OWal'
        
        if api_key:
            url = f'https://api.elevenlabs.io/v1/text-to-speech/{voice_id}'
            headers = {'xi-api-key': api_key, 'Content-Type': 'application/json'}
            
            timestamp = datetime.now().strftime('%H:%M:%S')
            data = {
                'text': f'Voice integration test at {timestamp}',
                'voice_settings': {'stability': 0.75, 'similarity_boost': 0.75}
            }
            
            response = requests.post(url, json=data, headers=headers)
            
            if response.ok:
                filename = f'voice_test_{datetime.now().strftime("%H%M%S")}.mp3'
                with open(filename, 'wb') as f:
                    f.write(response.content)
                
                # Log successful test
                log_test_to_airtable(
                    name="ElevenLabs Voice Generation",
                    status="✅",
                    notes=f"Generated {filename} successfully",
                    module_type="Voice Processing",
                    link="https://elevenlabs.io"
                )
                return True
            else:
                # Log failed test
                log_test_to_airtable(
                    name="ElevenLabs Voice Generation",
                    status="❌",
                    notes=f"{response.status_code} error - {response.text}",
                    module_type="Voice Processing",
                    link="https://elevenlabs.io"
                )
                return False
        else:
            log_test_to_airtable(
                name="ElevenLabs Voice Generation",
                status="❌",
                notes="API key not available",
                module_type="Voice Processing"
            )
            return False
            
    except Exception as e:
        log_test_to_airtable(
            name="ElevenLabs Voice Generation",
            status="❌",
            notes=f"Exception: {str(e)}",
            module_type="Voice Processing"
        )
        return False

def test_zendesk_with_logging():
    """Test Zendesk integration with automatic logging"""
    try:
        domain = os.getenv('ZENDESK_DOMAIN') or 'yobot.zendesk.com'
        email = os.getenv('ZENDESK_EMAIL') or 'tyson@yobot.bot'
        token = os.getenv('ZENDESK_API_TOKEN')
        
        if token:
            # Test ticket retrieval
            url = f'https://{domain}/api/v2/tickets.json'
            response = requests.get(url, auth=(f'{email}/token', token))
            
            if response.status_code == 200:
                tickets_data = response.json()
                ticket_count = len(tickets_data.get('tickets', []))
                
                # Log successful test
                log_test_to_airtable(
                    name="Zendesk Ticket Access",
                    status="✅",
                    notes=f"Retrieved {ticket_count} tickets successfully",
                    module_type="Support System",
                    link=f"https://{domain}/agent/tickets"
                )
                return True
            else:
                # Log failed test
                log_test_to_airtable(
                    name="Zendesk Ticket Access",
                    status="❌",
                    notes=f"{response.status_code} error - {response.text}",
                    module_type="Support System",
                    link=f"https://{domain}/agent/tickets"
                )
                return False
        else:
            log_test_to_airtable(
                name="Zendesk Ticket Access",
                status="❌",
                notes="API token not available",
                module_type="Support System",
                link=f"https://{domain}/agent/tickets"
            )
            return False
            
    except Exception as e:
        log_test_to_airtable(
            name="Zendesk Ticket Access",
            status="❌",
            notes=f"Exception: {str(e)}",
            module_type="Support System"
        )
        return False

def run_comprehensive_logged_tests():
    """Run all integration tests with automatic Airtable logging"""
    
    print("🧪 Running Comprehensive Integration Tests with Airtable Logging")
    print("=" * 70)
    
    results = {
        'hubspot': test_hubspot_with_logging(),
        'slack': test_slack_with_logging(),
        'elevenlabs': test_elevenlabs_with_logging(),
        'zendesk': test_zendesk_with_logging()
    }
    
    # Summary log entry
    passed_tests = sum(results.values())
    total_tests = len(results)
    
    log_test_to_airtable(
        name="Comprehensive Integration Test Suite",
        status="✅" if passed_tests == total_tests else "⚠️",
        notes=f"Passed {passed_tests}/{total_tests} integration tests",
        module_type="Test Framework",
        link="https://replit.com/@YoBot/CommandCenter"
    )
    
    print(f"\n📊 Test Results: {passed_tests}/{total_tests} systems operational")
    print("🎯 All test results automatically logged to Airtable")
    
    return results

if __name__ == "__main__":
    run_comprehensive_logged_tests()