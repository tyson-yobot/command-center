#!/usr/bin/env python3
"""
Focused Test Repair System
Identifies and fixes specific failing tests without Airtable logging issues
"""

import requests
import json
from datetime import datetime

BASE_URL = "https://72ddfeee-d145-4891-a820-14d5b3e09c66-00-c9rkbm78q1s2.worf.replit.dev"

def test_critical_apis():
    """Test critical API endpoints that should be working"""
    tests = [
        ('Metrics API', 'GET', '/api/metrics'),
        ('Bot Status API', 'GET', '/api/bot'),
        ('CRM Data API', 'GET', '/api/crm'),
        ('QuickBooks Auth', 'GET', '/api/qbo/auth'),
        ('QuickBooks Connection', 'GET', '/api/qbo/test-connection'),
        ('Slack Integration', 'GET', '/api/slack/test'),
        ('Zendesk Integration', 'GET', '/api/zendesk/test'),
        ('Stripe Integration', 'GET', '/api/stripe/test'),
        ('AI Integration', 'GET', '/api/ai/test'),
        ('Voice Integration', 'GET', '/api/voice/test'),
        ('ElevenLabs Integration', 'GET', '/api/elevenlabs/test')
    ]
    
    results = {}
    print("Testing Critical APIs...")
    
    for name, method, endpoint in tests:
        try:
            if method == 'GET':
                response = requests.get(f"{BASE_URL}{endpoint}", timeout=10)
            else:
                response = requests.post(f"{BASE_URL}{endpoint}", timeout=10)
            
            status = "PASS" if response.status_code in [200, 302] else "FAIL"
            
            print(f"  {name:<25} {status} (HTTP {response.status_code})")
            
            results[name] = {
                'status': status,
                'code': response.status_code,
                'endpoint': endpoint
            }
            
        except Exception as e:
            print(f"  {name:<25} FAIL ({str(e)})")
            results[name] = {
                'status': 'FAIL',
                'error': str(e),
                'endpoint': endpoint
            }
    
    return results

def test_webhook_functionality():
    """Test webhook endpoints with proper payloads"""
    webhooks = [
        ('/webhook/voice', {'test': True, 'caller': 'system_test'}),
        ('/webhook/chat', {'test': True, 'message': 'system_test'}),
        ('/webhook/stripe', {'test': True, 'event_type': 'test'}),
        ('/webhook/hubspot', {'test': True, 'contact_id': 'test'}),
        ('/webhook/calendly', {'test': True, 'event': 'test'}),
        ('/webhook/zendesk', {'test': True, 'ticket_id': 'test'})
    ]
    
    results = {}
    print("\nTesting Webhook Functionality...")
    
    for endpoint, payload in webhooks:
        try:
            response = requests.post(
                f"{BASE_URL}{endpoint}",
                json=payload,
                timeout=10
            )
            
            status = "PASS" if response.status_code in [200, 201, 202] else "FAIL"
            
            print(f"  {endpoint:<25} {status} (HTTP {response.status_code})")
            
            results[endpoint] = {
                'status': status,
                'code': response.status_code
            }
            
        except Exception as e:
            print(f"  {endpoint:<25} FAIL ({str(e)})")
            results[endpoint] = {
                'status': 'FAIL',
                'error': str(e)
            }
    
    return results

def test_database_crud():
    """Test database CRUD operations"""
    tests = [
        ('Create User', 'POST', '/api/users', {'username': 'test_user_repair', 'email': 'repair@yobot.dev'}),
        ('Get Users', 'GET', '/api/users', None),
        ('Create Bot', 'POST', '/api/bots', {'name': 'Repair Test Bot', 'status': 'active'}),
        ('Get Bots', 'GET', '/api/bots', None),
        ('Get Notifications', 'GET', '/api/notifications', None)
    ]
    
    results = {}
    print("\nTesting Database Operations...")
    
    for name, method, endpoint, payload in tests:
        try:
            if method == 'GET':
                response = requests.get(f"{BASE_URL}{endpoint}", timeout=10)
            else:
                response = requests.post(f"{BASE_URL}{endpoint}", json=payload, timeout=10)
            
            status = "PASS" if response.status_code in [200, 201] else "FAIL"
            
            print(f"  {name:<25} {status} (HTTP {response.status_code})")
            
            results[name] = {
                'status': status,
                'code': response.status_code
            }
            
        except Exception as e:
            print(f"  {name:<25} FAIL ({str(e)})")
            results[name] = {
                'status': 'FAIL',
                'error': str(e)
            }
    
    return results

def test_qbo_specific_endpoints():
    """Test QuickBooks specific functionality"""
    qbo_tests = [
        ('QBO OAuth Redirect', 'GET', '/api/qbo/auth'),
        ('QBO Connection Test', 'GET', '/api/qbo/test-connection'),
        ('QBO Customer Creation', 'POST', '/api/qbo/create-customer', {
            'name': 'Test Customer Repair',
            'email': 'test-repair@yobot.dev',
            'phone': '555-999-0000'
        }),
        ('QBO Customer List', 'GET', '/api/qbo/customers')
    ]
    
    results = {}
    print("\nTesting QuickBooks Integration...")
    
    for name, method, endpoint, *payload in qbo_tests:
        try:
            if method == 'GET':
                response = requests.get(f"{BASE_URL}{endpoint}", timeout=15, allow_redirects=False)
            else:
                response = requests.post(f"{BASE_URL}{endpoint}", json=payload[0] if payload else {}, timeout=15)
            
            # QBO auth should redirect (302), others should be 200
            expected_codes = [302] if 'auth' in endpoint else [200, 201]
            status = "PASS" if response.status_code in expected_codes else "FAIL"
            
            print(f"  {name:<25} {status} (HTTP {response.status_code})")
            
            results[name] = {
                'status': status,
                'code': response.status_code
            }
            
        except Exception as e:
            print(f"  {name:<25} FAIL ({str(e)})")
            results[name] = {
                'status': 'FAIL',
                'error': str(e)
            }
    
    return results

def identify_failing_services():
    """Identify which specific services need attention"""
    print("\nIdentifying Failing Services...")
    
    # Test service-specific endpoints
    services = {
        'HubSpot': '/api/hubspot/test',
        'OpenAI': '/api/ai/test', 
        'Airtable': '/api/airtable/test',
        'Google Calendar': '/api/calendar/test',
        'Twilio SMS': '/api/sms/test'
    }
    
    failing_services = []
    working_services = []
    
    for service, endpoint in services.items():
        try:
            response = requests.get(f"{BASE_URL}{endpoint}", timeout=10)
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if data.get('success', True):  # Assume success if no explicit failure
                        working_services.append(service)
                    else:
                        failing_services.append(f"{service}: {data.get('message', 'API error')}")
                except:
                    working_services.append(service)  # 200 without JSON is still working
            else:
                failing_services.append(f"{service}: HTTP {response.status_code}")
                
        except Exception as e:
            failing_services.append(f"{service}: {str(e)}")
    
    print(f"\nWorking Services ({len(working_services)}):")
    for service in working_services:
        print(f"  ✓ {service}")
    
    print(f"\nFailing Services ({len(failing_services)}):")
    for service in failing_services:
        print(f"  ✗ {service}")
    
    return failing_services, working_services

def run_focused_repair():
    """Run focused test repair to identify specific issues"""
    print("🔧 FOCUSED TEST REPAIR SYSTEM")
    print("=" * 60)
    
    # Test critical APIs
    api_results = test_critical_apis()
    
    # Test webhooks
    webhook_results = test_webhook_functionality()
    
    # Test database operations
    db_results = test_database_crud()
    
    # Test QuickBooks specifically
    qbo_results = test_qbo_specific_endpoints()
    
    # Identify failing services
    failing_services, working_services = identify_failing_services()
    
    # Generate summary
    all_results = {
        'APIs': api_results,
        'Webhooks': webhook_results,
        'Database': db_results,
        'QuickBooks': qbo_results
    }
    
    print("\n" + "=" * 60)
    print("REPAIR ANALYSIS SUMMARY")
    print("=" * 60)
    
    total_tests = 0
    passed_tests = 0
    failed_tests = []
    
    for category, tests in all_results.items():
        category_passed = sum(1 for test in tests.values() if test.get('status') == 'PASS')
        category_total = len(tests)
        
        total_tests += category_total
        passed_tests += category_passed
        
        print(f"\n{category}:")
        print(f"  Passed: {category_passed}/{category_total}")
        
        # Collect failed tests
        for name, result in tests.items():
            if result.get('status') != 'PASS':
                failed_tests.append(f"{category}: {name}")
    
    success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
    
    print(f"\nOVERALL RESULTS:")
    print(f"  Total Tests: {total_tests}")
    print(f"  Passed: {passed_tests}")
    print(f"  Failed: {total_tests - passed_tests}")
    print(f"  Success Rate: {success_rate:.1f}%")
    
    print(f"\nPRIORITY FIXES NEEDED:")
    print(f"  Failed Tests: {len(failed_tests)}")
    for test in failed_tests[:10]:  # Show first 10 failures
        print(f"    - {test}")
    
    if len(failed_tests) > 10:
        print(f"    ... and {len(failed_tests) - 10} more")
    
    print(f"\nSERVICE STATUS:")
    print(f"  Working: {len(working_services)} services")
    print(f"  Failing: {len(failing_services)} services")
    
    return {
        'total_tests': total_tests,
        'passed_tests': passed_tests,
        'failed_tests': failed_tests,
        'failing_services': failing_services,
        'success_rate': success_rate
    }

if __name__ == "__main__":
    results = run_focused_repair()