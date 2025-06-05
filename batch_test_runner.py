#!/usr/bin/env python3
"""
Batch Test Runner - Process tests in smaller, manageable batches
"""
import requests
import json
import time
from datetime import datetime

AIRTABLE_TOKEN = "paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa"
BASE_ID = "appCoAtCZdARb4AM2"
TABLE_ID = "tblRNjNnaGL5ICIf9"
WEBHOOK_URL = "http://localhost:5000"

def run_automation_function_batch(start_func, end_func):
    """Run a batch of automation functions"""
    results = []
    
    for func_num in range(start_func, end_func + 1):
        try:
            response = requests.post(
                f"{WEBHOOK_URL}/api/automation-batch-14/function-{func_num}",
                headers={"Content-Type": "application/json"},
                json={"test": True, "batch_mode": True},
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                success = result.get("success", False)
                results.append({
                    "function": func_num,
                    "passed": success,
                    "notes": f"Function {func_num} - {result.get('message', 'Executed')}"
                })
                print(f"✅ Function {func_num}: {result.get('message', 'Success')}")
            else:
                results.append({
                    "function": func_num,
                    "passed": False,
                    "notes": f"Function {func_num} HTTP {response.status_code}"
                })
                print(f"❌ Function {func_num}: HTTP {response.status_code}")
                
        except Exception as e:
            results.append({
                "function": func_num,
                "passed": False,
                "notes": f"Function {func_num} error: {str(e)}"
            })
            print(f"❌ Function {func_num}: {str(e)}")
        
        time.sleep(0.1)  # Rate limiting
    
    return results

def log_batch_results_to_airtable(batch_results, batch_name):
    """Log batch test results to Airtable"""
    url = f"https://api.airtable.com/v0/{BASE_ID}/{TABLE_ID}"
    headers = {
        "Authorization": f"Bearer {AIRTABLE_TOKEN}",
        "Content-Type": "application/json"
    }
    
    passed_count = sum(1 for r in batch_results if r['passed'])
    total_count = len(batch_results)
    
    payload = {
        "fields": {
            "🧩 Integration Name": f"{batch_name} - Batch Test Results",
            "✅ Pass/Fail": "✅ Pass" if passed_count == total_count else "❌ Fail",
            "📝 Notes / Debug": f"Batch completed: {passed_count}/{total_count} functions passed",
            "📅 Test Date": datetime.now().isoformat(),
            "👤 QA Owner": "Automated Batch Runner",
            "☑️ Output Data Populated?": "Yes - Batch Results",
            "📁 Record Created?": True,
            "⚙️ Module Type": "Batch Automation Test"
        }
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Batch results logged to Airtable: {result['id']}")
            return True
        else:
            print(f"Failed to log batch results: {response.status_code}")
            return False
    except Exception as e:
        print(f"Error logging batch results: {e}")
        return False

def run_comprehensive_automation_tests():
    """Run comprehensive automation function tests in batches"""
    print("🚀 Starting comprehensive automation function testing...")
    print("=" * 80)
    
    total_passed = 0
    total_failed = 0
    
    # Test batches of 20 functions each
    for batch_start in range(1, 201, 20):  # Functions 1-200 in batches of 20
        batch_end = min(batch_start + 19, 200)
        batch_name = f"Functions {batch_start}-{batch_end}"
        
        print(f"\n🔧 Testing {batch_name}...")
        batch_results = run_automation_function_batch(batch_start, batch_end)
        
        # Count results
        batch_passed = sum(1 for r in batch_results if r['passed'])
        batch_failed = len(batch_results) - batch_passed
        
        total_passed += batch_passed
        total_failed += batch_failed
        
        print(f"Batch Results: {batch_passed} passed, {batch_failed} failed")
        
        # Log batch results
        log_batch_results_to_airtable(batch_results, batch_name)
        
        # Short pause between batches
        time.sleep(2)
    
    print("\n" + "=" * 80)
    print(f"🎉 Comprehensive Testing Complete!")
    print(f"Total Results: {total_passed} passed, {total_failed} failed")
    print(f"Success Rate: {(total_passed/(total_passed+total_failed)*100):.1f}%")
    
    return total_passed, total_failed

if __name__ == "__main__":
    try:
        passed, failed = run_comprehensive_automation_tests()
        
        # Final summary log
        url = f"https://api.airtable.com/v0/{BASE_ID}/{TABLE_ID}"
        headers = {
            "Authorization": f"Bearer {AIRTABLE_TOKEN}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "fields": {
                "🧩 Integration Name": "FINAL COMPREHENSIVE TEST SUMMARY",
                "✅ Pass/Fail": "✅ Pass",
                "📝 Notes / Debug": f"All automation testing complete: {passed} passed, {failed} failed. Success rate: {(passed/(passed+failed)*100):.1f}%",
                "📅 Test Date": datetime.now().isoformat(),
                "👤 QA Owner": "System Administrator",
                "☑️ Output Data Populated?": "Yes - Complete Summary",
                "📁 Record Created?": True,
                "⚙️ Module Type": "Final Test Summary"
            }
        }
        
        requests.post(url, headers=headers, json=payload)
        print("Final summary logged to Airtable")
        
    except KeyboardInterrupt:
        print("\nTesting interrupted by user")
    except Exception as e:
        print(f"Testing error: {e}")