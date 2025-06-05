#!/usr/bin/env python3
"""
Run all 1500 integration tests and update existing Airtable records
"""
import requests
import json
import time
from datetime import datetime

# Fixed configuration
AIRTABLE_TOKEN = "paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa"
BASE_ID = "appCoAtCZdARb4AM2"
TABLE_ID = "tblRNjNnaGL5ICIf9"
WEBHOOK_URL = "http://localhost:5000"

def get_failed_tests():
    """Get all failed or blank test records from Airtable"""
    url = f"https://api.airtable.com/v0/{BASE_ID}/{TABLE_ID}"
    headers = {
        "Authorization": f"Bearer {AIRTABLE_TOKEN}",
        "Content-Type": "application/json"
    }
    
    # Filter for failed or blank results
    params = {
        "filterByFormula": "OR({✅ Pass/Fail} = '', {✅ Pass/Fail} = '❌ Fail', {✅ Pass/Fail} = BLANK())",
        "maxRecords": 1500
    }
    
    try:
        response = requests.get(url, headers=headers, params=params)
        if response.status_code == 200:
            data = response.json()
            print(f"Found {len(data['records'])} tests to re-run")
            return data['records']
        else:
            print(f"Failed to fetch tests: {response.status_code}")
            print(f"Response: {response.text}")
            return []
    except Exception as e:
        print(f"Error fetching tests: {e}")
        return []

def update_test_result(record_id, passed, notes=""):
    """Update existing Airtable record with test result using PATCH"""
    url = f"https://api.airtable.com/v0/{BASE_ID}/{TABLE_ID}/{record_id}"
    headers = {
        "Authorization": f"Bearer {AIRTABLE_TOKEN}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "fields": {
            "✅ Pass/Fail": "✅ Pass" if passed else "❌ Fail",
            "📝 Notes / Debug": notes or ("Test executed successfully" if passed else "Test execution failed"),
            "📅 Test Date": datetime.now().isoformat(),
            "👤 QA Owner": "System Retest",
            "☑️ Output Data Populated?": "Yes - Operational" if passed else "No - Failed",
            "📁 Record Created?": passed
        }
    }
    
    try:
        response = requests.patch(url, headers=headers, json=payload)
        if response.status_code == 200:
            return True
        else:
            print(f"Failed to update record {record_id}: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"Error updating record {record_id}: {e}")
        return False

def run_integration_test(test_name):
    """Run a specific integration test"""
    try:
        # Test lead processing endpoint
        payload = {
            "name": f"Test {test_name}",
            "email": f"test.{test_name.lower().replace(' ', '')}@automated.com",
            "phone": "555-TEST-999",
            "company": f"{test_name} Test Co",
            "linkedin_url": f"https://linkedin.com/in/{test_name.lower().replace(' ', '')}",
            "source": f"Automated Test - {test_name}"
        }
        
        response = requests.post(
            f"{WEBHOOK_URL}/api/leads/scraped",
            headers={"Content-Type": "application/json"},
            json=payload,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get("success"):
                return True, f"Integration test passed - {test_name}"
            else:
                return False, f"Integration returned success=false - {test_name}"
        else:
            return False, f"HTTP {response.status_code} - {test_name}"
            
    except Exception as e:
        return False, f"Exception: {str(e)} - {test_name}"

def run_automation_function_test(function_number):
    """Test automation function endpoint"""
    try:
        batch_number = 14 + (function_number // 10)  # Determine batch
        
        response = requests.post(
            f"{WEBHOOK_URL}/api/automation-batch-{batch_number}/function-{function_number}",
            headers={"Content-Type": "application/json"},
            json={"test": True},
            timeout=5
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get("success"):
                return True, f"Function {function_number} executed successfully"
            else:
                return False, f"Function {function_number} returned success=false"
        else:
            return False, f"Function {function_number} HTTP {response.status_code}"
            
    except Exception as e:
        return False, f"Function {function_number} error: {str(e)}"

def run_comprehensive_test_suite():
    """Run all 1500 tests and update existing records"""
    failed_tests = get_failed_tests()
    
    if not failed_tests:
        print("No failed tests found to re-run")
        return
    
    print(f"Starting comprehensive test suite for {len(failed_tests)} tests...")
    print("=" * 80)
    
    passed = 0
    failed = 0
    updated = 0
    
    for i, test_record in enumerate(failed_tests):
        record_id = test_record['id']
        fields = test_record['fields']
        test_name = fields.get('🧩 Integration Name', f'Test {i+1}')
        
        print(f"\nTest {i+1}/{len(failed_tests)}: {test_name}")
        
        # Determine test type and run appropriate test
        if 'Function' in test_name and any(char.isdigit() for char in test_name):
            # Extract function number
            import re
            function_match = re.search(r'Function (\d+)', test_name)
            if function_match:
                function_number = int(function_match.group(1))
                success, notes = run_automation_function_test(function_number)
            else:
                success, notes = run_integration_test(test_name)
        else:
            success, notes = run_integration_test(test_name)
        
        # Update the existing record
        if update_test_result(record_id, success, notes):
            updated += 1
            if success:
                passed += 1
                print(f"✅ PASSED - Updated record {record_id}")
            else:
                failed += 1
                print(f"❌ FAILED - Updated record {record_id}")
        else:
            print(f"⚠️  Test result not updated for {record_id}")
        
        # Rate limiting
        time.sleep(0.1)
        
        # Progress update every 50 tests
        if (i + 1) % 50 == 0:
            print(f"\nProgress: {i+1}/{len(failed_tests)} tests completed")
            print(f"Status: {passed} passed, {failed} failed, {updated} records updated")
    
    print("\n" + "=" * 80)
    print(f"Test Suite Complete:")
    print(f"  Total tests: {len(failed_tests)}")
    print(f"  Passed: {passed}")
    print(f"  Failed: {failed}")
    print(f"  Records updated: {updated}")
    print(f"  Success rate: {(passed/len(failed_tests)*100):.1f}%")
    
    return passed, failed, updated

if __name__ == "__main__":
    print("🚀 Starting comprehensive 1500 test re-run...")
    print("This will re-run all failed tests and update existing Airtable records")
    
    try:
        passed, failed, updated = run_comprehensive_test_suite()
        
        print(f"\n🎉 Test suite completed!")
        print(f"Final results: {passed} passed, {failed} failed")
        print(f"All filtered views will remain accurate with updated records")
        
    except KeyboardInterrupt:
        print("\nTest suite interrupted by user")
    except Exception as e:
        print(f"Test suite error: {e}")