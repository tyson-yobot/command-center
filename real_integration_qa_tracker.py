#!/usr/bin/env python3
"""
Real Integration QA Tracker
Logs actual integration test results to Airtable QA Tracker table
"""

import requests
import os
from datetime import datetime

class IntegrationQATracker:
    def __init__(self):
        self.base_id = os.getenv("AIRTABLE_BASE_ID")
        self.api_key = os.getenv("AIRTABLE_API_KEY")
        self.table_name = "🧪 Integration QA Tracker"
        
    def log_integration_test(self, integration_name, pass_fail, output_populated, 
                           record_created, errors, notes, qa_owner="System", scenario_link=""):
        """Log integration test results to Airtable QA Tracker"""
        try:
            url = f"https://api.airtable.com/v0/{self.base_id}/{self.table_name}"
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "fields": {
                    "🔧 Integration Name": integration_name,
                    "✅ Pass/Fail": pass_fail,
                    "📤 Output Data Populated": output_populated,
                    "🗃️ Record Created?": record_created,
                    "🐞 Errors Observed": errors,
                    "🧠 Notes / Debug": notes,
                    "🧑‍💻 QA Owner": qa_owner,
                    "📅 Test Date": datetime.utcnow().strftime('%Y-%m-%d'),
                    "📂 Related Scenario Link": scenario_link
                }
            }
            
            response = requests.post(url, json=data, headers=headers, timeout=10)
            
            if response.status_code == 200:
                return {"success": True, "record_id": response.json().get("id")}
            else:
                return {"success": False, "error": f"Airtable API Error: {response.status_code}"}
                
        except Exception as e:
            return {"success": False, "error": str(e)}

def run_real_integration_tests():
    """Run actual integration tests and log real results"""
    tracker = IntegrationQATracker()
    
    # Test HubSpot API connection
    def test_hubspot_real():
        try:
            api_key = os.getenv("HUBSPOT_API_KEY")
            if not api_key:
                return "FAIL", "No", "No", "Missing API key", "API key not configured"
                
            url = "https://api.hubapi.com/crm/v3/objects/contacts?limit=1"
            headers = {"Authorization": f"Bearer {api_key}"}
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                contacts_found = len(data.get("results", []))
                return "PASS", "Yes", "Yes", "", f"Successfully retrieved {contacts_found} contacts"
            else:
                return "FAIL", "No", "No", f"HTTP {response.status_code}", f"API returned error status"
                
        except Exception as e:
            return "FAIL", "No", "No", str(e), "Connection failed"
    
    # Test Slack webhook
    def test_slack_real():
        try:
            webhook_url = os.getenv("SLACK_WEBHOOK_URL")
            if not webhook_url:
                return "FAIL", "No", "No", "Missing webhook URL", "Webhook URL not configured"
                
            test_payload = {
                "text": f"Integration QA Test - {datetime.utcnow().strftime('%H:%M:%S')}"
            }
            response = requests.post(webhook_url, json=test_payload, timeout=10)
            
            if response.status_code == 200:
                return "PASS", "Yes", "Yes", "", "Message delivered successfully"
            else:
                return "FAIL", "No", "No", f"HTTP {response.status_code}", "Webhook delivery failed"
                
        except Exception as e:
            return "FAIL", "No", "No", str(e), "Webhook connection failed"
    
    # Test QuickBooks API
    def test_quickbooks_real():
        try:
            access_token = os.getenv("QUICKBOOKS_ACCESS_TOKEN")
            realm_id = os.getenv("QUICKBOOKS_REALM_ID")
            
            if not access_token or not realm_id:
                return "FAIL", "No", "No", "Missing credentials", "Access token or realm ID not configured"
                
            url = f"https://quickbooks.api.intuit.com/v3/company/{realm_id}/companyinfo/{realm_id}"
            headers = {"Authorization": f"Bearer {access_token}", "Accept": "application/json"}
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                return "PASS", "Yes", "Yes", "", "Company info retrieved successfully"
            elif response.status_code == 401:
                return "FAIL", "No", "No", "401 Unauthorized", "Access token expired or invalid"
            else:
                return "FAIL", "No", "No", f"HTTP {response.status_code}", "API connection failed"
                
        except Exception as e:
            return "FAIL", "No", "No", str(e), "Connection error"
    
    # Test Airtable logging capability
    def test_airtable_real():
        try:
            api_key = os.getenv("AIRTABLE_API_KEY")
            base_id = os.getenv("AIRTABLE_BASE_ID")
            
            if not api_key or not base_id:
                return "FAIL", "No", "No", "Missing credentials", "API key or base ID not configured"
                
            # Test by creating a test record
            test_result = tracker.log_integration_test(
                integration_name="Airtable Connection Test",
                pass_fail="PASS",
                output_populated="Yes",
                record_created="Yes",
                errors="",
                notes="Self-test of Airtable logging capability"
            )
            
            if test_result.get("success"):
                return "PASS", "Yes", "Yes", "", f"Record created: {test_result.get('record_id', 'Unknown')}"
            else:
                return "FAIL", "No", "No", test_result.get("error", "Unknown"), "Failed to create test record"
                
        except Exception as e:
            return "FAIL", "No", "No", str(e), "Airtable connection failed"
    
    # Run all tests and log results
    tests = {
        "HubSpot CRM API": test_hubspot_real,
        "Slack Webhook": test_slack_real,
        "QuickBooks Online API": test_quickbooks_real,
        "Airtable Logging": test_airtable_real
    }
    
    results = {}
    
    for integration_name, test_func in tests.items():
        print(f"Testing {integration_name}...")
        pass_fail, output_populated, record_created, errors, notes = test_func()
        
        # Log the result to Airtable
        log_result = tracker.log_integration_test(
            integration_name=integration_name,
            pass_fail=pass_fail,
            output_populated=output_populated,
            record_created=record_created,
            errors=errors,
            notes=notes,
            qa_owner="Automated QA System"
        )
        
        results[integration_name] = {
            "status": pass_fail,
            "logged": log_result.get("success", False),
            "details": notes
        }
        
        print(f"  Status: {pass_fail}")
        print(f"  Logged to QA Tracker: {log_result.get('success', False)}")
    
    return results

if __name__ == "__main__":
    print("Running Real Integration QA Tests...")
    print("=" * 50)
    
    test_results = run_real_integration_tests()
    
    print("\nQA Test Summary:")
    print("=" * 30)
    
    passed = sum(1 for result in test_results.values() if result["status"] == "PASS")
    total = len(test_results)
    
    for integration, result in test_results.items():
        status_icon = "✅" if result["status"] == "PASS" else "❌"
        log_icon = "📝" if result["logged"] else "❌"
        print(f"{status_icon} {integration}: {result['status']} {log_icon}")
        if result["details"]:
            print(f"   → {result['details']}")
    
    print(f"\nOverall: {passed}/{total} integrations passing")
    print("All results logged to Airtable QA Tracker table")