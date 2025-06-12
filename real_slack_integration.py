#!/usr/bin/env python3
"""
Real Slack Integration - Actual API implementation
No hardcoded returns - validates real Slack connectivity
"""

import os
import requests
from datetime import datetime

def log_integration_test_to_airtable(integration_name: str, passed: bool, notes: str, module_type: str = "Automation Test"):
    """Log real test results to production Airtable"""
    api_key = os.getenv('AIRTABLE_PRODUCTION_API_KEY')
    if not api_key:
        print("ERROR: AIRTABLE_PRODUCTION_API_KEY not found")
        return False
    
    base_id = "appbFDTqB2WtRNV1H"
    table_id = "tbl7K5RthCtD69BE1"
    list_url = f"https://api.airtable.com/v0/{base_id}/{table_id}"
    headers = {'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'}
    
    # Check for existing record
    params = {'filterByFormula': f"{{🔧 Integration Name}} = '{integration_name}'"}
    
    try:
        response = requests.get(list_url, headers=headers, params=params)
        response.raise_for_status()
        existing_records = response.json().get('records', [])
        
        record_data = {
            "🔧 Integration Name": integration_name,
            "✅ Pass/Fail": "✅ Pass" if passed else "❌ Fail",
            "🧠 Notes / Debug": notes,
            "🧑‍💻 QA Owner": "Tyson Lerfald",
            "📤 Output Data Populated?": passed,
            "🗃️ Record Created?": passed,
            "🔁 Retry Attempted?": not passed,
            "🧩 Module Type": module_type,
            "📅 Test Date": datetime.now().isoformat()
        }
        
        if existing_records:
            # PATCH existing record
            record_id = existing_records[0]['id']
            patch_url = f"{list_url}/{record_id}"
            payload = {"fields": record_data}
            response = requests.patch(patch_url, headers=headers, json=payload)
            response.raise_for_status()
            print(f"UPDATED: {integration_name} - {'PASSED' if passed else 'FAILED'}")
        else:
            # POST new record
            payload = {"fields": record_data}
            response = requests.post(list_url, headers=headers, json=payload)
            response.raise_for_status()
            print(f"CREATED: {integration_name} - {'PASSED' if passed else 'FAILED'}")
        
        return True
    except Exception as e:
        print(f"Airtable logging failed: {e}")
        return False

def test_slack_webhook_connection():
    """Test actual Slack webhook connectivity"""
    slack_webhook_url = os.getenv('SLACK_WEBHOOK_URL')
    
    if not slack_webhook_url:
        notes = "FAILED: SLACK_WEBHOOK_URL environment variable not set"
        log_integration_test_to_airtable("Slack Notifications", False, notes, "Communication")
        return False
    
    # Test message payload
    test_payload = {
        "text": "YoBot Integration Test",
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"🧠 *YoBot System Test*\n✅ Slack integration verified at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n🔧 Integration Name: Slack Notifications"
                }
            }
        ]
    }
    
    try:
        response = requests.post(slack_webhook_url, json=test_payload, timeout=10)
        response.raise_for_status()
        
        if response.status_code == 200:
            notes = f"SUCCESS: Slack webhook responded with 200. Message sent successfully at {datetime.now().isoformat()}"
            log_integration_test_to_airtable("Slack Notifications", True, notes, "Communication")
            print("✅ Slack webhook test PASSED")
            return True
        else:
            notes = f"FAILED: Slack webhook returned status {response.status_code}: {response.text}"
            log_integration_test_to_airtable("Slack Notifications", False, notes, "Communication")
            return False
            
    except requests.exceptions.Timeout:
        notes = "FAILED: Slack webhook request timed out after 10 seconds"
        log_integration_test_to_airtable("Slack Notifications", False, notes, "Communication")
        return False
    except requests.exceptions.RequestException as e:
        notes = f"FAILED: Slack webhook request error: {str(e)}"
        log_integration_test_to_airtable("Slack Notifications", False, notes, "Communication")
        return False
    except Exception as e:
        notes = f"FAILED: Unexpected error during Slack test: {str(e)}"
        log_integration_test_to_airtable("Slack Notifications", False, notes, "Communication")
        return False

def send_slack_notification(message: str, channel: str = None):
    """Send actual Slack notification - real implementation"""
    slack_webhook_url = os.getenv('SLACK_WEBHOOK_URL')
    
    if not slack_webhook_url:
        print("ERROR: SLACK_WEBHOOK_URL not configured")
        return False
    
    payload = {
        "text": message,
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"🤖 *YoBot Notification*\n{message}\n📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
                }
            }
        ]
    }
    
    if channel:
        payload["channel"] = channel
    
    try:
        response = requests.post(slack_webhook_url, json=payload, timeout=10)
        response.raise_for_status()
        return response.status_code == 200
    except Exception as e:
        print(f"Slack notification failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing real Slack integration...")
    test_slack_webhook_connection()