"""
Working Test Logger - Uses existing accessible table
Demonstrates the auto-logging pattern you requested
"""

import requests
import os
from datetime import datetime
from universal_webhook_logger import log_to_airtable

def log_test_result(test_name, status, details, link=""):
    """
    Simple test logger that works with existing table access
    """
    try:
        # Use the working universal logger
        result = log_to_airtable(test_name, {
            'source': 'Integration Test Suite',
            'success': status == "✅",
            'details': details,
            'url': link or 'https://replit.com/@YoBot/CommandCenter'
        })
        
        if result:
            print(f"✅ Test logged: {test_name}")
        else:
            print(f"❌ Logging failed for: {test_name}")
            
    except Exception as e:
        print(f"❌ Logger error: {str(e)}")

# Example: HubSpot Contact Test with Auto-Logging
def test_hubspot_contact():
    """Test HubSpot contact creation with automatic logging"""
    try:
        hubspot_key = os.getenv('HUBSPOT_API_KEY')
        
        if hubspot_key:
            url = 'https://api.hubapi.com/crm/v3/objects/contacts'
            headers = {'Authorization': f'Bearer {hubspot_key}', 'Content-Type': 'application/json'}
            
            timestamp = datetime.now().strftime("%H%M%S")
            data = {
                'properties': {
                    'email': f'test_logger_{timestamp}@yobot.bot',
                    'firstname': 'Test',
                    'lastname': f'Logger_{timestamp}'
                }
            }
            
            response = requests.post(url, headers=headers, json=data)
            
            if response.status_code == 201:
                contact_data = response.json()
                contact_id = contact_data.get('id')
                
                # Auto-log success
                log_test_result(
                    test_name="HubSpot Contact Creation",
                    status="✅", 
                    details=f"Created contact ID: {contact_id}",
                    link=f"https://app.hubspot.com/contacts/{contact_id}"
                )
                return True
            else:
                # Auto-log failure
                log_test_result(
                    test_name="HubSpot Contact Creation",
                    status="❌",
                    details=f"{response.status_code} error - {response.text}",
                    link="https://app.hubspot.com/contacts"
                )
                return False
        else:
            # Auto-log missing credentials
            log_test_result(
                test_name="HubSpot Contact Creation",
                status="❌",
                details="API key not available"
            )
            return False
            
    except Exception as e:
        # Auto-log exceptions
        log_test_result(
            test_name="HubSpot Contact Creation",
            status="❌",
            details=f"Exception: {str(e)}"
        )
        return False

# Example: Slack Alert Test with Auto-Logging
def test_slack_alert():
    """Test Slack alert with automatic logging"""
    try:
        webhook_url = "https://hooks.slack.com/services/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"
        timestamp = datetime.now().strftime("%H:%M:%S")
        
        message = {
            "text": f"Test logger integration - {timestamp}",
            "username": "YoBot Test Logger"
        }
        
        response = requests.post(webhook_url, json=message, timeout=5)
        
        if response.status_code == 200:
            # Auto-log success
            log_test_result(
                test_name="Slack Alert System",
                status="✅",
                details=f"Alert sent successfully at {timestamp}",
                link=webhook_url
            )
            return True
        else:
            # Auto-log failure
            log_test_result(
                test_name="Slack Alert System", 
                status="❌",
                details=f"{response.status_code} error - webhook failed",
                link=webhook_url
            )
            return False
            
    except Exception as e:
        # Auto-log exceptions
        log_test_result(
            test_name="Slack Alert System",
            status="❌", 
            details=f"Exception: {str(e)}"
        )
        return False

def run_logged_tests():
    """Run tests with automatic logging"""
    print("🧪 Running Integration Tests with Auto-Logging")
    print("=" * 50)
    
    # Test HubSpot
    print("Testing HubSpot contact creation...")
    hubspot_result = test_hubspot_contact()
    
    # Test Slack
    print("Testing Slack alert system...")
    slack_result = test_slack_alert()
    
    # Summary
    total_passed = sum([hubspot_result, slack_result])
    total_tests = 2
    
    print(f"\n📊 Results: {total_passed}/{total_tests} tests passed")
    print("🎯 All results automatically logged to tracking system")
    
    return {"hubspot": hubspot_result, "slack": slack_result}

if __name__ == "__main__":
    run_logged_tests()