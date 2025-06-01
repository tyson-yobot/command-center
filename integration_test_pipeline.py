#!/usr/bin/env python3
"""
Integration Test Pipeline
Tests all external service integrations with real API credentials
"""

import requests
import os
from datetime import datetime
from enhanced_automation_workflows import qb_automation, slack_automation, chat_automation, scoring_automation
from universal_webhook_logger import log_to_airtable

def test_quickbooks_connection():
    """Test QuickBooks Online API connection"""
    try:
        access_token = os.getenv("QUICKBOOKS_ACCESS_TOKEN")
        realm_id = os.getenv("QUICKBOOKS_REALM_ID")
        
        if not access_token or not realm_id:
            return {"status": "missing_credentials", "message": "QuickBooks credentials not found"}
        
        url = f"https://quickbooks.api.intuit.com/v3/company/{realm_id}/companyinfo/{realm_id}"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json"
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            company_info = response.json()
            return {
                "status": "connected",
                "company_name": company_info.get("QueryResponse", {}).get("CompanyInfo", [{}])[0].get("CompanyName"),
                "realm_id": realm_id
            }
        else:
            return {"status": "failed", "error": f"API Error: {response.status_code}"}
            
    except Exception as e:
        return {"status": "error", "message": str(e)}

def test_hubspot_connection():
    """Test HubSpot CRM API connection"""
    try:
        api_key = os.getenv("HUBSPOT_API_KEY")
        
        if not api_key:
            return {"status": "missing_credentials", "message": "HubSpot API key not found"}
        
        url = "https://api.hubapi.com/crm/v3/objects/contacts?limit=1"
        headers = {"Authorization": f"Bearer {api_key}"}
        
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            return {"status": "connected", "contacts_accessible": True}
        else:
            return {"status": "failed", "error": f"API Error: {response.status_code}"}
            
    except Exception as e:
        return {"status": "error", "message": str(e)}

def test_slack_webhook():
    """Test Slack webhook notification"""
    try:
        webhook_url = os.getenv("SLACK_WEBHOOK_URL")
        
        if not webhook_url:
            return {"status": "missing_credentials", "message": "Slack webhook URL not found"}
        
        test_message = {
            "text": "🧪 YoBot Integration Test",
            "attachments": [{
                "color": "good",
                "text": f"Testing Slack integration at {datetime.utcnow().strftime('%H:%M:%S UTC')}"
            }]
        }
        
        response = requests.post(webhook_url, json=test_message, timeout=10)
        
        if response.status_code == 200:
            return {"status": "connected", "message_sent": True}
        else:
            return {"status": "failed", "error": f"Webhook Error: {response.status_code}"}
            
    except Exception as e:
        return {"status": "error", "message": str(e)}

def test_airtable_connection():
    """Test Airtable API connection"""
    try:
        api_key = os.getenv("AIRTABLE_API_KEY")
        base_id = os.getenv("AIRTABLE_BASE_ID")
        
        if not api_key or not base_id:
            return {"status": "missing_credentials", "message": "Airtable credentials not found"}
        
        # Test by creating a test log entry
        test_result = log_to_airtable("Integration Tests", {
            "test_type": "connection_test",
            "status": "testing",
            "timestamp": datetime.utcnow().isoformat()
        })
        
        return {"status": "connected", "logging_active": test_result}
        
    except Exception as e:
        return {"status": "error", "message": str(e)}

def test_make_webhook():
    """Test Make.com webhook"""
    try:
        webhook_url = os.getenv("MAKE_WEBHOOK_URL")
        
        if not webhook_url:
            return {"status": "missing_credentials", "message": "Make.com webhook URL not found"}
        
        test_payload = {
            "test": True,
            "source": "yobot_integration_test",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        response = requests.post(webhook_url, json=test_payload, timeout=10)
        
        if response.status_code == 200:
            return {"status": "connected", "webhook_responsive": True}
        else:
            return {"status": "failed", "error": f"Webhook Error: {response.status_code}"}
            
    except Exception as e:
        return {"status": "error", "message": str(e)}

def test_zendesk_connection():
    """Test Zendesk API connection"""
    try:
        domain = os.getenv("ZENDESK_DOMAIN")
        email = os.getenv("ZENDESK_EMAIL")
        token = os.getenv("ZENDESK_API_TOKEN")
        
        if not domain or not email:
            return {"status": "missing_credentials", "message": "Zendesk credentials incomplete"}
        
        if not token:
            return {"status": "missing_token", "message": "Zendesk API token required for full testing"}
        
        url = f"https://{domain}/api/v2/users/me.json"
        auth = (f"{email}/token", token)
        
        response = requests.get(url, auth=auth, timeout=10)
        
        if response.status_code == 200:
            user_data = response.json()
            return {
                "status": "connected",
                "domain": domain,
                "user": user_data.get("user", {}).get("name")
            }
        else:
            return {"status": "failed", "error": f"API Error: {response.status_code}"}
            
    except Exception as e:
        return {"status": "error", "message": str(e)}

def run_automation_workflow_tests():
    """Test the enhanced automation workflows"""
    results = {}
    
    # Test QuickBooks entity fetch
    try:
        qb_result = qb_automation.get_qbo_entities()
        results["qb_entities"] = "success" if "customers" in qb_result else "failed"
    except Exception as e:
        results["qb_entities"] = f"error: {str(e)}"
    
    # Test lead scoring
    try:
        test_lead = {
            "name": "Test Lead",
            "email": "test@example.com",
            "visited_pricing": True,
            "opened_emails": 5,
            "clicked_demo": True
        }
        score_result = scoring_automation.score_lead(test_lead)
        results["lead_scoring"] = "success" if "score" in score_result else "failed"
    except Exception as e:
        results["lead_scoring"] = f"error: {str(e)}"
    
    # Test Slack notification
    try:
        test_lead_info = {
            "name": "Integration Test Lead",
            "email": "test@yobot.com",
            "source": "API Test",
            "score": 85
        }
        slack_result = slack_automation.post_lead_summary(test_lead_info)
        results["slack_notification"] = "success" if slack_result else "failed"
    except Exception as e:
        results["slack_notification"] = f"error: {str(e)}"
    
    return results

def run_comprehensive_integration_test():
    """Run comprehensive test of all integrations"""
    print("🧪 Starting YoBot Integration Test Suite...")
    
    test_results = {
        "quickbooks": test_quickbooks_connection(),
        "hubspot": test_hubspot_connection(),
        "slack": test_slack_webhook(),
        "airtable": test_airtable_connection(),
        "make": test_make_webhook(),
        "zendesk": test_zendesk_connection(),
        "automation_workflows": run_automation_workflow_tests()
    }
    
    # Log comprehensive test results
    log_to_airtable("Integration Test Results", {
        "test_timestamp": datetime.utcnow().isoformat(),
        "quickbooks_status": test_results["quickbooks"]["status"],
        "hubspot_status": test_results["hubspot"]["status"],
        "slack_status": test_results["slack"]["status"],
        "airtable_status": test_results["airtable"]["status"],
        "make_status": test_results["make"]["status"],
        "zendesk_status": test_results["zendesk"]["status"],
        "total_connected": sum(1 for result in test_results.values() 
                              if isinstance(result, dict) and result.get("status") == "connected")
    })
    
    return test_results

if __name__ == "__main__":
    results = run_comprehensive_integration_test()
    
    print("\n📊 Integration Test Results:")
    print("=" * 50)
    
    for service, result in results.items():
        if isinstance(result, dict):
            status = result.get("status", "unknown")
            print(f"{service.upper()}: {status}")
            if status == "connected":
                print(f"  ✅ Successfully connected")
            elif status == "missing_credentials":
                print(f"  ⚠️  {result.get('message', 'Credentials needed')}")
            elif status == "failed":
                print(f"  ❌ {result.get('error', 'Connection failed')}")
        else:
            print(f"{service.upper()}: {result}")
    
    print("\n🎯 Integration Summary:")
    connected = sum(1 for result in results.values() 
                   if isinstance(result, dict) and result.get("status") == "connected")
    total = len([r for r in results.values() if isinstance(r, dict)])
    print(f"Connected Services: {connected}/{total}")