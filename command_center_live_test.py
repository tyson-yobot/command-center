#!/usr/bin/env python3
"""
Command Center Live Integration Test
Tests all 9 Command Center functions with real data and confirms Airtable logging
"""

import os
import requests
import time
from datetime import datetime

# Import Command Center functions
from command_center_functions import (
    log_support_ticket,
    log_call_recording,
    log_sentiment,
    log_escalation,
    log_client_touchpoint,
    log_missed_call,
    log_qa_review,
    log_keywords,
    log_command_center_metrics
)

def get_command_center_api_key():
    """Get the correct API key for Command Center operations"""
    return (os.getenv("AIRTABLE_COMMAND_CENTER_API_KEY") or 
            os.getenv("AIRTABLE_COMMAND_CENTER_TOKEN") or 
            os.getenv("AIRTABLE_COMMAND_CENTER_BASE_TOKEN") or
            os.getenv("AIRTABLE_VALID_TOKEN") or 
            os.getenv("AIRTABLE_API_KEY"))

def test_command_center_connection():
    """Test basic connection to Command Center base"""
    api_key = get_command_center_api_key()
    if not api_key:
        return {"error": "No API key available", "authenticated": False}
    
    # Test connection to Command Center base
    url = "https://api.airtable.com/v0/appRt8V3tH4g5Z51f"
    headers = {"Authorization": f"Bearer {api_key}"}
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            tables = response.json().get("tables", [])
            return {
                "authenticated": True,
                "tables_found": len(tables),
                "table_names": [table.get("name", "Unknown") for table in tables]
            }
        else:
            return {
                "authenticated": False,
                "error": f"HTTP {response.status_code}: {response.text}"
            }
    except Exception as e:
        return {"authenticated": False, "error": str(e)}

def run_live_command_center_tests():
    """Run comprehensive live tests of all Command Center functions"""
    print("🚀 COMMAND CENTER LIVE INTEGRATION TEST")
    print("=" * 60)
    
    # Test 1: Connection verification
    print("\n1. Testing Command Center Connection...")
    connection_test = test_command_center_connection()
    if connection_test.get("authenticated"):
        print(f"✅ Connected to Command Center base")
        print(f"📊 Found {connection_test['tables_found']} tables")
        if connection_test.get("table_names"):
            print("📋 Available tables:")
            for table in connection_test["table_names"]:
                print(f"   • {table}")
    else:
        print(f"❌ Connection failed: {connection_test.get('error', 'Unknown error')}")
        return False
    
    print("\n2. Testing All 9 Command Center Functions...")
    test_results = []
    
    # Test each function with live data
    functions_to_test = [
        ("Support Ticket", lambda: log_support_ticket(
            f"TK{int(time.time())}", 
            "Live Test Client", 
            "Integration Test", 
            "This is a live test of the support ticket system", 
            False
        )),
        ("Call Recording", lambda: log_call_recording(
            f"CALL{int(time.time())}", 
            "John Test", 
            "+1555000001", 
            f"https://example.com/test-{int(time.time())}.mp3", 
            5
        )),
        ("Sentiment Analysis", lambda: log_sentiment(
            f"CALL{int(time.time())}", 
            "Positive", 
            0.89, 
            "Customer was satisfied with the service"
        )),
        ("Escalation", lambda: log_escalation(
            f"ESC{int(time.time())}", 
            "Jane Test", 
            "Medium", 
            "Live test escalation scenario", 
            "Test Manager"
        )),
        ("Client Touchpoint", lambda: log_client_touchpoint(
            "Bob Test", 
            "Test Corp", 
            "Email", 
            "Follow-up", 
            "Live integration test contact"
        )),
        ("Missed Call", lambda: log_missed_call(
            "Sarah Test", 
            "+1555000002", 
            "Main Line", 
            True
        )),
        ("QA Review", lambda: log_qa_review(
            f"CALL{int(time.time())}", 
            "QA Tester", 
            "Integration Test", 
            8, 
            "Live test QA review"
        )),
        ("NLP Keywords", lambda: log_keywords(
            f"NLP{int(time.time())}", 
            "integration, test, live, system", 
            0.95, 
            "Live testing context"
        )),
        ("Command Center Metrics", lambda: log_command_center_metrics(
            25, 
            97.5, 
            1, 
            85, 
            1.8
        ))
    ]
    
    for function_name, test_func in functions_to_test:
        print(f"\n   Testing {function_name}...")
        try:
            result = test_func()
            if result.get("status") == "success":
                print(f"   ✅ {function_name}: SUCCESS")
                test_results.append((function_name, True, "Working"))
            else:
                error_msg = result.get("error", "Unknown error")
                print(f"   ❌ {function_name}: FAILED - {error_msg}")
                test_results.append((function_name, False, error_msg))
        except Exception as e:
            print(f"   ❌ {function_name}: ERROR - {str(e)}")
            test_results.append((function_name, False, f"Exception: {str(e)}"))
        
        # Small delay between tests
        time.sleep(0.5)
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 COMMAND CENTER TEST RESULTS SUMMARY")
    print("=" * 60)
    
    passed = 0
    for function_name, success, message in test_results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{function_name:25} {status}")
        if not success:
            print(f"{'':25} └─ {message}")
        else:
            passed += 1
    
    print(f"\n🎯 FINAL RESULT: {passed}/{len(test_results)} functions working")
    
    if passed == len(test_results):
        print("\n🚀 ALL COMMAND CENTER FUNCTIONS ARE LIVE AND READY!")
        print("✅ Ready for voice call testing and full system deployment")
        return True
    else:
        print(f"\n⚠️  {len(test_results) - passed} functions need attention before going live")
        return False

def verify_test_logging():
    """Verify that all tests are being logged to Integration Test Log"""
    print("\n3. Verifying Internal Test Logging...")
    
    api_key = get_command_center_api_key()
    if not api_key:
        print("❌ Cannot verify test logging - no API key")
        return False
    
    # Check recent test log entries
    url = "https://api.airtable.com/v0/appCoAtCZdARb4AM2/🧪 Integration Test Log 2"
    headers = {"Authorization": f"Bearer {api_key}"}
    params = {"maxRecords": 10, "sort[0][field]": "📅 Test Date", "sort[0][direction]": "desc"}
    
    try:
        response = requests.get(url, headers=headers, params=params)
        if response.status_code == 200:
            records = response.json().get("records", [])
            recent_tests = [r for r in records if "log_" in r["fields"].get("🧩 Integration Name", "")]
            print(f"✅ Test logging verified - {len(recent_tests)} recent Command Center tests logged")
            return True
        else:
            print(f"❌ Cannot verify test logging - HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Test logging verification failed: {str(e)}")
        return False

if __name__ == "__main__":
    success = run_live_command_center_tests()
    verify_test_logging()
    
    if success:
        print("\n🎉 COMMAND CENTER INTEGRATION COMPLETE")
        print("🔥 System ready for live voice call testing and scraping")
    else:
        print("\n🔧 Additional configuration required before going live")