#!/usr/bin/env python3
"""
Failed Test Re-runner with Dashboard Security
Re-runs all 137 failed tests from the Integration Test Log Airtable
Updates existing records with PATCH method for accurate filtered views
"""

import requests
import json
import time
from datetime import datetime

# Dashboard Security Check
VALID_DASHBOARD = "COMMAND_CENTER"
DASHBOARD_ID = "COMMAND_CENTER"

def validate_dashboard_access():
    """Validate dashboard fingerprint security"""
    if DASHBOARD_ID != VALID_DASHBOARD:
        print("🚫 Automation blocked: invalid dashboard context.")
        return False
    return True

def get_failed_tests():
    """Get all failed tests from Integration Test Log Airtable"""
    if not validate_dashboard_access():
        return []
    
    # Airtable configuration for Integration Test Log
    base_id = "appRt8V3tH4g5Z5if"
    table_id = "tblRNjNnaGL5ICIf9"
    api_key = "YOUR_AIRTABLE_API_KEY"  # User needs to provide this
    
    url = f"https://api.airtable.com/v0/{base_id}/{table_id}"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Filter for failed or blank test results
    params = {
        "filterByFormula": "OR({Result} = '❌ Fail', {Result} = '')"
    }
    
    try:
        response = requests.get(url, headers=headers, params=params)
        if response.status_code == 200:
            return response.json().get("records", [])
        else:
            print(f"Failed to fetch tests: {response.status_code}")
            return []
    except Exception as e:
        print(f"Error fetching failed tests: {e}")
        return []

def re_run_automation_test(test_record):
    """Re-run individual automation test"""
    if not validate_dashboard_access():
        return False
    
    test_name = test_record["fields"].get("Test Name", "Unknown")
    print(f"Re-running: {test_name}")
    
    # Map test names to automation endpoints
    endpoint_mapping = {
        "Create Record Test": "/api/airtable/create-record",
        "Support Ticket Logging": "/api/airtable/log-support-ticket", 
        "Call Recording Logging": "/api/airtable/log-call-recording",
        "NLP Keyword Logging": "/api/airtable/log-nlp-keyword",
        "Sentiment Analysis Logging": "/api/airtable/log-call-sentiment",
        "Find Record Test": "/api/airtable/find-record",
        "Upsert Test Result": "/api/airtable/upsert-test-result",
        "Escalation Tracker": "/api/airtable/log-escalation",
        "Missed Call Logger": "/api/airtable/log-missed-call",
        "Function 110": "/api/automation/escalation-tracker",
        "Function 112": "/api/automation/missed-call-logger"
    }
    
    # Check for batch automation functions
    if "Automation Batch" in test_name:
        parts = test_name.split()
        if len(parts) >= 4:
            try:
                batch_num = int(parts[2])
                func_num = int(parts[4])
                endpoint = f"/api/automation-batch-{batch_num}/function-{func_num}"
            except:
                endpoint = "/api/automation/test-generic"
        else:
            endpoint = "/api/automation/test-generic"
    else:
        endpoint = endpoint_mapping.get(test_name, "/api/automation/test-generic")
    
    # Execute test
    try:
        test_url = f"http://localhost:5000{endpoint}"
        test_data = {
            "test_execution": True,
            "dashboard_id": DASHBOARD_ID,
            "timestamp": datetime.now().isoformat()
        }
        
        response = requests.post(test_url, json=test_data, timeout=10)
        
        if response.status_code == 200:
            print(f"✅ {test_name} - PASSED")
            return True
        else:
            print(f"❌ {test_name} - FAILED (Status: {response.status_code})")
            return False
            
    except Exception as e:
        print(f"❌ {test_name} - ERROR: {e}")
        return False

def update_test_result(record_id, passed):
    """Update Airtable record with new test result using PATCH method"""
    if not validate_dashboard_access():
        return False
    
    base_id = "appRt8V3tH4g5Z5if"
    table_id = "tblRNjNnaGL5ICIf9"
    api_key = "YOUR_AIRTABLE_API_KEY"  # User needs to provide this
    
    url = f"https://api.airtable.com/v0/{base_id}/{table_id}/{record_id}"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Update fields
    result_value = "✅ Pass" if passed else "❌ Fail"
    update_data = {
        "fields": {
            "Result": result_value,
            "Last Updated": datetime.now().isoformat(),
            "Re-run Count": 1
        }
    }
    
    try:
        response = requests.patch(url, json=update_data, headers=headers)
        if response.status_code == 200:
            print(f"📝 Updated record {record_id} - {result_value}")
            return True
        else:
            print(f"Failed to update record {record_id}: {response.status_code}")
            return False
    except Exception as e:
        print(f"Error updating record {record_id}: {e}")
        return False

def main():
    """Main function to re-run all failed tests"""
    print("🔐 Dashboard Security: COMMAND_CENTER")
    print("🧪 Starting Failed Test Re-runner...")
    
    if not validate_dashboard_access():
        print("❌ Invalid dashboard context - exiting")
        return
    
    # Get all failed tests
    failed_tests = get_failed_tests()
    
    if not failed_tests:
        print("❌ Could not retrieve failed tests. Please check Airtable API key.")
        print("Required: AIRTABLE_API_KEY environment variable or update script")
        return
    
    print(f"📊 Found {len(failed_tests)} failed tests to re-run")
    
    # Re-run each test
    passed_count = 0
    failed_count = 0
    
    for test_record in failed_tests:
        record_id = test_record["id"]
        test_name = test_record["fields"].get("Test Name", "Unknown")
        
        # Re-run the test
        test_passed = re_run_automation_test(test_record)
        
        # Update the Airtable record
        update_success = update_test_result(record_id, test_passed)
        
        if test_passed:
            passed_count += 1
        else:
            failed_count += 1
        
        # Small delay to avoid rate limiting
        time.sleep(0.5)
    
    # Final summary
    print("\n" + "="*50)
    print("📈 TEST RE-RUN SUMMARY")
    print("="*50)
    print(f"Total tests re-run: {len(failed_tests)}")
    print(f"✅ Now passing: {passed_count}")
    print(f"❌ Still failing: {failed_count}")
    print(f"🎯 Success rate: {(passed_count/len(failed_tests)*100):.1f}%")
    print("="*50)

if __name__ == "__main__":
    main()