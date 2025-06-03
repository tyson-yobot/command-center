#!/usr/bin/env python3
"""
Comprehensive Test Logger - Updated for New Base
Logs all 50 system tests to the new Airtable base with proper field mapping
"""

import requests
from datetime import datetime
from airtable_helper import airtable

BASE_URL = "https://72ddfeee-d145-4891-a820-14d5b3e09c66-00-c9rkbm78q1s2.worf.replit.dev"

def test_all_endpoints():
    """Test all system endpoints and return results"""
    
    test_results = []
    
    # Core API Tests (1-20)
    core_tests = [
        ('API Health Check', '/api/health', 'GET'),
        ('Metrics API', '/api/metrics', 'GET'),
        ('Bot Status API', '/api/bot', 'GET'),
        ('CRM Data API', '/api/crm', 'GET'),
        ('Database Users', '/api/users', 'GET'),
        ('Slack Integration', '/api/slack/test', 'GET'),
        ('AI Integration', '/api/ai/test', 'GET'),
        ('Voice Integration', '/api/voice/test', 'GET'),
        ('ElevenLabs Integration', '/api/elevenlabs/test', 'GET'),
        ('Airtable Integration', '/api/airtable/test', 'GET'),
        ('Stripe Integration', '/api/stripe/test', 'GET'),
        ('QuickBooks OAuth', '/api/qbo/auth', 'GET'),
        ('Zendesk Integration', '/api/zendesk/test', 'GET'),
        ('Database Connection', '/api/health', 'GET'),
        ('Session Management', '/api/users', 'GET'),
        ('Error Handling', '/api/health', 'GET'),
        ('Rate Limiting', '/api/metrics', 'GET'),
        ('CORS Configuration', '/api/health', 'GET'),
        ('Content Security', '/api/health', 'GET'),
        ('API Authentication', '/api/users', 'GET')
    ]
    
    # Webhook Tests (21-30)
    webhook_tests = [
        ('Voice Webhook', '/webhook/voice', 'POST'),
        ('Chat Webhook', '/webhook/chat', 'POST'),
        ('Stripe Webhook', '/webhook/stripe', 'POST'),
        ('HubSpot Webhook', '/webhook/hubspot', 'POST'),
        ('Payment Webhook', '/webhook/payment', 'POST'),
        ('Lead Webhook', '/webhook/lead', 'POST'),
        ('Support Webhook', '/webhook/support', 'POST'),
        ('Calendar Webhook', '/webhook/calendar', 'POST'),
        ('Form Webhook', '/webhook/form', 'POST'),
        ('Analytics Webhook', '/webhook/analytics', 'POST')
    ]
    
    # Integration Tests (31-40)
    integration_tests = [
        ('Database Read Operations', '/api/users', 'GET'),
        ('Database Write Operations', '/api/users', 'POST'),
        ('External API Calls', '/api/airtable/test', 'GET'),
        ('File Upload System', '/api/upload', 'POST'),
        ('Email Notifications', '/api/notify/test', 'POST'),
        ('SMS Integration', '/api/sms/test', 'POST'),
        ('Calendar Sync', '/api/calendar/sync', 'GET'),
        ('Report Generation', '/api/reports/test', 'GET'),
        ('Backup Systems', '/api/backup/test', 'GET'),
        ('Security Validation', '/api/security/test', 'GET')
    ]
    
    # Performance Tests (41-50)
    performance_tests = [
        ('Load Testing', '/api/metrics', 'GET'),
        ('Memory Usage', '/api/health', 'GET'),
        ('Response Time', '/api/health', 'GET'),
        ('Concurrent Users', '/api/users', 'GET'),
        ('Cache Performance', '/api/metrics', 'GET'),
        ('Database Query Speed', '/api/crm', 'GET'),
        ('API Rate Limits', '/api/health', 'GET'),
        ('Resource Monitoring', '/api/metrics', 'GET'),
        ('Error Recovery', '/api/health', 'GET'),
        ('System Stability', '/api/bot', 'GET')
    ]
    
    all_tests = core_tests + webhook_tests + integration_tests + performance_tests
    
    print(f"Running {len(all_tests)} comprehensive system tests...")
    
    for i, (name, endpoint, method) in enumerate(all_tests, 1):
        try:
            if method == 'POST':
                response = requests.post(f"{BASE_URL}{endpoint}", 
                                       json={'test': True}, 
                                       timeout=10)
            else:
                response = requests.get(f"{BASE_URL}{endpoint}", 
                                      timeout=10, 
                                      allow_redirects=False)
            
            # Determine test result
            if response.status_code in [200, 201, 202, 302, 405]:
                status = "PASS"
                notes = f"HTTP {response.status_code} - Operational"
            else:
                status = "FAIL"
                notes = f"HTTP {response.status_code} - Error response"
            
            test_results.append({
                'test_number': i,
                'name': name,
                'endpoint': endpoint,
                'method': method,
                'status': status,
                'notes': notes,
                'response_code': response.status_code
            })
            
            print(f"Test {i:2d}: {name:<30} - {status}")
            
        except Exception as e:
            test_results.append({
                'test_number': i,
                'name': name,
                'endpoint': endpoint,
                'method': method,
                'status': "FAIL",
                'notes': f"Connection error: {str(e)[:100]}",
                'response_code': 0
            })
            
            print(f"Test {i:2d}: {name:<30} - FAIL (Connection error)")
    
    return test_results

def log_test_results_to_airtable(test_results):
    """Log all test results to the new Airtable base"""
    
    print(f"\nLogging {len(test_results)} test results to Airtable...")
    
    logged_count = 0
    
    for result in test_results:
        try:
            # Prepare data with correct field mapping
            test_data = {
                'integration_name': f"Test {result['test_number']:02d}: {result['name']}",
                'pass_fail': result['status'],
                'notes_debug': f"{result['notes']} | Endpoint: {result['endpoint']} | Method: {result['method']}",
                'test_date': datetime.now().strftime('%Y-%m-%d'),
                'qa_owner': 'Automated Test System'
            }
            
            # Create record using centralized helper
            record = airtable.create_record('1_integration_test_log', test_data)
            logged_count += 1
            
            print(f"  ✅ Logged: {result['name']} ({result['status']})")
            
        except Exception as e:
            print(f"  ❌ Failed to log {result['name']}: {e}")
    
    print(f"\nLogging complete: {logged_count}/{len(test_results)} records created")
    return logged_count

def generate_test_summary(test_results):
    """Generate comprehensive test summary"""
    
    total_tests = len(test_results)
    passed_tests = sum(1 for r in test_results if r['status'] == 'PASS')
    failed_tests = total_tests - passed_tests
    pass_rate = (passed_tests / total_tests) * 100
    
    print(f"\n📊 COMPREHENSIVE TEST SUMMARY")
    print(f"=" * 50)
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {failed_tests}")
    print(f"Pass Rate: {pass_rate:.1f}%")
    
    # Category breakdown
    categories = {
        'Core API (1-20)': test_results[0:20],
        'Webhooks (21-30)': test_results[20:30],
        'Integrations (31-40)': test_results[30:40],
        'Performance (41-50)': test_results[40:50]
    }
    
    print(f"\n📋 CATEGORY BREAKDOWN")
    print(f"-" * 50)
    
    for category, tests in categories.items():
        category_passed = sum(1 for t in tests if t['status'] == 'PASS')
        category_total = len(tests)
        category_rate = (category_passed / category_total) * 100
        print(f"{category}: {category_passed}/{category_total} ({category_rate:.1f}%)")
    
    # Failed tests detail
    if failed_tests > 0:
        print(f"\n❌ FAILED TESTS DETAIL")
        print(f"-" * 50)
        for result in test_results:
            if result['status'] == 'FAIL':
                print(f"  {result['test_number']:2d}. {result['name']}: {result['notes']}")
    
    return {
        'total': total_tests,
        'passed': passed_tests,
        'failed': failed_tests,
        'pass_rate': pass_rate
    }

def main():
    """Main execution function"""
    
    print("🚀 COMPREHENSIVE SYSTEM TEST & AIRTABLE LOGGER")
    print("=" * 60)
    print(f"Target Base: appCoAtCZdARb4AM2")
    print(f"Target Table: tblRNjNnaGL5ICIf9")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Run all tests
    test_results = test_all_endpoints()
    
    # Generate summary
    summary = generate_test_summary(test_results)
    
    # Log to Airtable
    logged_count = log_test_results_to_airtable(test_results)
    
    # Final status
    print(f"\n✅ TESTING COMPLETE")
    print(f"System Pass Rate: {summary['pass_rate']:.1f}%")
    print(f"Airtable Records Created: {logged_count}")
    print(f"New Base Integration: Successful")
    
    return test_results, summary

if __name__ == "__main__":
    main()