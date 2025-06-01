"""
Slack Alert Test + Auto-Logging
Enhanced Slack integration test with automatic result logging
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

def test_slack_alerts_channel():
    """Test primary Slack alerts channel"""
    webhook_url = "https://hooks.slack.com/services/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"
    timestamp = datetime.now().strftime("%H:%M:%S")
    
    payload = {
        "text": f"🧪 Slack alerts integration test at {timestamp}",
        "username": "YoBot QA",
        "icon_emoji": ":robot_face:"
    }
    
    try:
        response = requests.post(webhook_url, json=payload, timeout=5)
        
        if response.status_code == 200:
            print("✅ Slack alerts channel working")
            log_test_to_airtable(
                "Slack Alerts Channel", 
                "✅", 
                f"Alert sent successfully at {timestamp}",
                "Communication",
                webhook_url
            )
            return True
        else:
            raise Exception(f"HTTP {response.status_code}: {response.text}")
            
    except Exception as e:
        print(f"❌ Slack alerts failed: {str(e)}")
        log_test_to_airtable(
            "Slack Alerts Channel", 
            "❌", 
            f"Error: {str(e)}",
            "Communication"
        )
        return False

def test_slack_escalation_channel():
    """Test Slack escalation channel"""
    webhook_url = "https://hooks.slack.com/services/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"
    timestamp = datetime.now().strftime("%H:%M:%S")
    
    payload = {
        "text": f"🚨 Escalation channel test at {timestamp}",
        "username": "YoBot Escalation QA",
        "icon_emoji": ":warning:"
    }
    
    try:
        response = requests.post(webhook_url, json=payload, timeout=5)
        
        if response.status_code == 200:
            print("✅ Slack escalation channel working")
            log_test_to_airtable(
                "Slack Escalation Channel", 
                "✅", 
                f"Escalation alert sent successfully at {timestamp}",
                "Communication",
                webhook_url
            )
            return True
        else:
            raise Exception(f"HTTP {response.status_code}: {response.text}")
            
    except Exception as e:
        print(f"❌ Slack escalation failed: {str(e)}")
        log_test_to_airtable(
            "Slack Escalation Channel", 
            "❌", 
            f"Error: {str(e)}",
            "Communication"
        )
        return False

def test_slack_integration_suite():
    """Run complete Slack integration test with auto-logging"""
    print("🚀 Running Slack Integration Test Suite")
    print("=" * 50)
    
    # Test both channels
    alerts_result = test_slack_alerts_channel()
    escalation_result = test_slack_escalation_channel()
    
    # Summary
    total_passed = sum([alerts_result, escalation_result])
    total_tests = 2
    
    print(f"\n📊 Slack Integration Results: {total_passed}/{total_tests} channels operational")
    
    # Log overall suite result
    if total_passed == total_tests:
        log_test_to_airtable(
            "Complete Slack Integration Suite",
            "✅",
            f"All {total_tests} Slack channels tested successfully",
            "Communication System",
            "https://replit.com/@YoBot/CommandCenter"
        )
    else:
        log_test_to_airtable(
            "Complete Slack Integration Suite",
            "❌",
            f"Only {total_passed}/{total_tests} Slack channels working",
            "Communication System"
        )
    
    print("🎯 All results automatically logged to Integration Test Log")
    return total_passed == total_tests

if __name__ == "__main__":
    test_slack_integration_suite()