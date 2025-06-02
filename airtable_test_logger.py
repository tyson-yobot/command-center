"""
Airtable Integration Test Logger
Uses your specific base and table IDs for logging test results
"""

import requests
import os
from datetime import datetime

# Your specific Airtable credentials
AIRTABLE_API_KEY = os.getenv('AIRTABLE_API_KEY')
BASE_ID = "appRt8V3tH4g5Z5if"
TABLE_ID = "tbly0fjE2M5uHET9X"

def log_test_to_airtable(name, status, notes, module_type="Core Automation", link=""):
    """Log integration test results to your specific Airtable table"""
    if AIRTABLE_API_KEY:
        url = f"https://api.airtable.com/v0/{BASE_ID}/{TABLE_ID}"
        headers = {
            "Authorization": f"Bearer {AIRTABLE_API_KEY}",
            "Content-Type": "application/json"
        }
        # Use correct checkbox boolean for Pass/Fail field
        data = {
            "fields": {
                "🔧 Integration Name": name,
                "✅ Pass/Fail": "✅" if status else "❌",
                "🧠 Notes / Debug": notes,
                "📅 Test Date": datetime.today().strftime("%Y-%m-%d"),
                "🧑‍💻 QA Owner": "Tyson",
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
        print("❌ Airtable API key not available")
        return False

def test_hubspot_with_airtable_logging():
    """Test HubSpot with logging to your Airtable table"""
    try:
        hubspot_key = os.getenv('HUBSPOT_API_KEY')
        
        if hubspot_key:
            url = 'https://api.hubapi.com/crm/v3/objects/contacts'
            headers = {'Authorization': f'Bearer {hubspot_key}', 'Content-Type': 'application/json'}
            
            timestamp = datetime.now().strftime("%H%M%S")
            data = {
                'properties': {
                    'email': f'airtable_test_{timestamp}@yobot.bot',
                    'firstname': 'Airtable',
                    'lastname': f'Test_{timestamp}'
                }
            }
            
            response = requests.post(url, headers=headers, json=data)
            
            if response.status_code == 201:
                contact_data = response.json()
                contact_id = contact_data.get('id')
                
                # Log successful test to your Airtable
                log_test_to_airtable(
                    name="HubSpot Contact Creation",
                    status="✅",
                    notes=f"Created contact ID: {contact_id}",
                    module_type="CRM Integration",
                    link=f"https://app.hubspot.com/contacts/{contact_id}"
                )
                return True
            else:
                # Log failed test to your Airtable
                log_test_to_airtable(
                    name="HubSpot Contact Creation",
                    status="❌",
                    notes=f"{response.status_code} error - {response.text}",
                    module_type="CRM Integration"
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

def test_slack_with_airtable_logging():
    """Test Slack with logging to your Airtable table"""
    try:
        webhook_url = "https://hooks.slack.com/services/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"
        timestamp = datetime.now().strftime("%H:%M:%S")
        
        message = {
            "text": f"Airtable test integration - {timestamp}",
            "username": "YoBot Airtable Tester"
        }
        
        response = requests.post(webhook_url, json=message, timeout=5)
        
        if response.status_code == 200:
            # Log successful test to your Airtable
            log_test_to_airtable(
                name="Slack Alert System",
                status="✅",
                notes=f"Alert sent successfully at {timestamp}",
                module_type="Communication",
                link=webhook_url
            )
            return True
        else:
            # Log failed test to your Airtable
            log_test_to_airtable(
                name="Slack Alert System",
                status="❌",
                notes=f"{response.status_code} error - webhook failed",
                module_type="Communication"
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

if __name__ == "__main__":
    print("🧪 Testing with your Airtable Integration Test Log")
    print("=" * 50)
    
    # Test HubSpot
    print("Testing HubSpot...")
    hubspot_result = test_hubspot_with_airtable_logging()
    
    # Test Slack  
    print("Testing Slack...")
    slack_result = test_slack_with_airtable_logging()
    
    # Summary
    total_passed = sum([hubspot_result, slack_result])
    print(f"\n📊 Results: {total_passed}/2 tests passed")
    print("🎯 Results logged to your Airtable Integration Test Log table")