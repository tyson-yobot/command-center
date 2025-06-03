#!/usr/bin/env python3
"""
Final Validation Test
Quick test of the 4 previously failing components
"""

import requests
import json
from datetime import datetime

BASE_URL = "https://72ddfeee-d145-4891-a820-14d5b3e09c66-00-c9rkbm78q1s2.worf.replit.dev"

def test_fixed_webhooks():
    """Test the webhooks that were previously failing"""
    tests = [
        {
            'name': 'Support Webhook',
            'endpoint': '/api/webhook/support',
            'payload': {
                'ticketId': 'SUP-TEST-001',
                'clientName': 'Test Client',
                'topic': 'System validation test',
                'message': 'Testing support webhook functionality'
            }
        },
        {
            'name': 'Calendar Webhook',
            'endpoint': '/api/webhook/calendar',
            'payload': {
                'event_type': 'meeting.scheduled',
                'attendee_email': 'test@validation.com',
                'meeting_time': '2025-06-04T14:00:00Z',
                'meeting_type': 'validation_test'
            }
        },
        {
            'name': 'Form Webhook',
            'endpoint': '/api/webhook/form',
            'payload': {
                'form_id': 'validation_form',
                'submission_id': 'VAL-' + str(int(datetime.now().timestamp())),
                'fields': {
                    'name': 'Validation Test',
                    'email': 'validation@test.com'
                }
            }
        }
    ]
    
    print("🔧 TESTING FIXED WEBHOOK ENDPOINTS")
    print("=" * 50)
    
    results = {}
    for test in tests:
        try:
            response = requests.post(
                f"{BASE_URL}{test['endpoint']}",
                json=test['payload'],
                timeout=10
            )
            
            status = "✅ PASS" if response.status_code in [200, 201, 202] else "❌ FAIL"
            
            try:
                response_data = response.json()
                details = f"HTTP {response.status_code} - {response_data.get('message', 'Success')}"
            except:
                details = f"HTTP {response.status_code}"
            
            results[test['name']] = {
                'status': status,
                'details': details
            }
            
            print(f"  {test['name']:<20} {status} - {details}")
            
        except Exception as e:
            status = "❌ FAIL"
            details = f"Error: {str(e)}"
            results[test['name']] = {'status': status, 'details': details}
            print(f"  {test['name']:<20} {status} - {details}")
    
    return results

def test_health_endpoint():
    """Test system health endpoint"""
    print("\n🏥 TESTING HEALTH ENDPOINT")
    print("=" * 30)
    
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        
        if response.status_code == 200:
            try:
                health_data = response.json()
                print(f"  Health Check        ✅ PASS - {health_data.get('status', 'OK')}")
                return {'status': 'PASS', 'data': health_data}
            except:
                print(f"  Health Check        ✅ PASS - HTTP {response.status_code}")
                return {'status': 'PASS'}
        else:
            print(f"  Health Check        ❌ FAIL - HTTP {response.status_code}")
            return {'status': 'FAIL'}
    except Exception as e:
        print(f"  Health Check        ❌ FAIL - {str(e)}")
        return {'status': 'FAIL'}

def run_final_validation():
    """Run final validation of all components"""
    print("🚀 FINAL SYSTEM VALIDATION")
    print("=" * 60)
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # Test fixed webhooks
    webhook_results = test_fixed_webhooks()
    
    # Test health endpoint
    health_result = test_health_endpoint()
    
    # Calculate results
    webhook_passed = sum(1 for r in webhook_results.values() if 'PASS' in r['status'])
    webhook_total = len(webhook_results)
    health_passed = 1 if 'PASS' in health_result['status'] else 0
    
    total_passed = webhook_passed + health_passed
    total_tests = webhook_total + 1
    success_rate = (total_passed / total_tests * 100) if total_tests > 0 else 0
    
    print(f"\n" + "=" * 60)
    print("📊 FINAL VALIDATION RESULTS")
    print("=" * 60)
    print(f"Webhook Endpoints: {webhook_passed}/{webhook_total} passing")
    print(f"Health Check: {health_passed}/1 passing")
    print(f"Overall: {total_passed}/{total_tests} tests passing ({success_rate:.1f}%)")
    
    if success_rate == 100:
        print("\n🎉 ALL SYSTEMS OPERATIONAL")
        print("   Ready for production deployment")
    else:
        print(f"\n⚠️ {total_tests - total_passed} components still need attention")
    
    return {
        'webhook_results': webhook_results,
        'health_result': health_result,
        'success_rate': success_rate,
        'total_passed': total_passed,
        'total_tests': total_tests
    }

if __name__ == "__main__":
    results = run_final_validation()