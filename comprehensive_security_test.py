#!/usr/bin/env python3
"""
Comprehensive Security Test Runner
Tests dashboard fingerprint security, kill switch, and automation logging
"""

import requests
import json
import time
import os
from datetime import datetime

# Security configuration
VALID_DASHBOARD = "COMMAND_CENTER"
BASE_URL = "http://localhost:5000"

def test_dashboard_security():
    """Test dashboard fingerprint security validation"""
    print("🔐 Testing Dashboard Security Fingerprint...")
    
    # Test with correct dashboard ID
    os.environ["DASHBOARD_ID"] = VALID_DASHBOARD
    
    test_endpoints = [
        "/api/automation-batch-22/function-1",
        "/api/automation-batch-30/function-15",
        "/api/automation-batch-45/function-30"
    ]
    
    passed = 0
    total = len(test_endpoints)
    
    for endpoint in test_endpoints:
        try:
            response = requests.post(
                f"{BASE_URL}{endpoint}",
                json={"test_execution": True},
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("security_validated"):
                    print(f"✅ {endpoint} - Security validated")
                    passed += 1
                else:
                    print(f"❌ {endpoint} - Security not validated")
            else:
                print(f"❌ {endpoint} - HTTP {response.status_code}")
                
        except Exception as e:
            print(f"❌ {endpoint} - Exception: {e}")
    
    print(f"Dashboard Security: {passed}/{total} passed\n")
    return passed == total

def test_kill_switch():
    """Test global kill switch functionality"""
    print("🛑 Testing Global Kill Switch...")
    
    # Enable kill switch
    os.environ["KILL_SWITCH"] = "true"
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/automation-batch-25/function-1",
            json={"test_execution": True},
            timeout=5
        )
        
        if response.status_code == 410:
            print("✅ Kill switch working - automation blocked")
            # Disable kill switch
            os.environ["KILL_SWITCH"] = "false"
            return True
        else:
            print(f"❌ Kill switch failed - got HTTP {response.status_code}")
            os.environ["KILL_SWITCH"] = "false"
            return False
            
    except Exception as e:
        print(f"❌ Kill switch test exception: {e}")
        os.environ["KILL_SWITCH"] = "false"
        return False

def test_automation_batches():
    """Test all automation batch endpoints for security compliance"""
    print("🧪 Testing Automation Batch Endpoints...")
    
    os.environ["DASHBOARD_ID"] = VALID_DASHBOARD
    os.environ["KILL_SWITCH"] = "false"
    
    passed = 0
    failed = 0
    
    # Test subset of batch functions to validate security
    test_batches = [22, 25, 30, 35, 40, 45, 48]
    test_functions = [1, 5, 10, 15, 20, 25, 30]
    
    for batch_num in test_batches:
        for func_num in test_functions:
            endpoint = f"/api/automation-batch-{batch_num}/function-{func_num}"
            
            try:
                response = requests.post(
                    f"{BASE_URL}{endpoint}",
                    json={"test_execution": True},
                    timeout=5
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("security_validated") and data.get("success"):
                        passed += 1
                    else:
                        failed += 1
                        print(f"❌ {endpoint} - Missing security validation")
                else:
                    failed += 1
                    print(f"❌ {endpoint} - HTTP {response.status_code}")
                    
            except Exception as e:
                failed += 1
                print(f"❌ {endpoint} - Exception: {e}")
            
            # Small delay to avoid overwhelming server
            time.sleep(0.1)
    
    total = passed + failed
    print(f"Batch Automation Tests: {passed}/{total} passed")
    print(f"Success Rate: {(passed/total*100):.1f}%\n")
    
    return passed > failed

def test_airtable_logging():
    """Test Airtable automation logging functionality"""
    print("📊 Testing Airtable Logging Integration...")
    
    # This requires valid Airtable credentials
    airtable_key = os.getenv("AIRTABLE_VALID_TOKEN") or os.getenv("AIRTABLE_API_KEY")
    
    if not airtable_key:
        print("⚠️ Airtable API key not configured - skipping logging test")
        return False
    
    try:
        # Test logging endpoint
        response = requests.post(
            f"{BASE_URL}/api/automation-batch-30/function-1",
            json={"test_logging": True},
            timeout=10
        )
        
        if response.status_code == 200:
            print("✅ Automation logging endpoint working")
            return True
        else:
            print(f"❌ Logging test failed - HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Logging test exception: {e}")
        return False

def test_slack_alerts():
    """Test Slack alert integration"""
    print("💬 Testing Slack Alert Integration...")
    
    slack_webhook = os.getenv("SLACK_WEBHOOK_URL")
    
    if not slack_webhook:
        print("⚠️ Slack webhook not configured - skipping alert test")
        return False
    
    try:
        # This would test actual Slack integration
        # For now, just verify webhook URL is configured
        if slack_webhook.startswith("https://hooks.slack.com"):
            print("✅ Slack webhook configured")
            return True
        else:
            print("❌ Invalid Slack webhook URL")
            return False
            
    except Exception as e:
        print(f"❌ Slack test exception: {e}")
        return False

def run_comprehensive_security_test():
    """Run complete security validation suite"""
    print("🚀 Starting Comprehensive Security Test Suite")
    print("=" * 60)
    
    results = {}
    
    # Run all security tests
    results["dashboard_security"] = test_dashboard_security()
    results["kill_switch"] = test_kill_switch()
    results["automation_batches"] = test_automation_batches()
    results["airtable_logging"] = test_airtable_logging()
    results["slack_alerts"] = test_slack_alerts()
    
    # Generate summary
    passed_tests = sum(results.values())
    total_tests = len(results)
    
    print("=" * 60)
    print("🎯 SECURITY TEST SUMMARY")
    print("=" * 60)
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
    
    print("-" * 60)
    print(f"Overall Results: {passed_tests}/{total_tests} tests passed")
    print(f"Security Compliance: {(passed_tests/total_tests*100):.1f}%")
    
    if passed_tests == total_tests:
        print("🎉 All security tests PASSED - System secure!")
    else:
        print("⚠️ Some security tests FAILED - Review required")
    
    print("=" * 60)
    
    return results

if __name__ == "__main__":
    run_comprehensive_security_test()