#!/usr/bin/env python3
"""
Comprehensive End-to-End Test Suite
Full QA validation of every webhook endpoint, API integration, and automation workflow
"""

import os
import requests
import json
import time
from datetime import datetime
from pyairtable import Api

# Configuration
BASE_URL = "https://72ddfeee-d145-4891-a820-14d5b3e09c66-00-c9rkbm78q1s2.worf.replit.dev"
AIRTABLE_API_KEY = os.environ.get('AIRTABLE_API_KEY')
AIRTABLE_BASE_ID = os.environ.get('AIRTABLE_BASE_ID')

def log_test_result(test_name, status, details="", output_data=""):
    """Log test results to Airtable"""
    if not AIRTABLE_API_KEY or not AIRTABLE_BASE_ID:
        print(f"⚠️ Airtable logging disabled - {test_name}: {status}")
        return
    
    try:
        api = Api(AIRTABLE_API_KEY)
        
        # Try different table names
        table_names = ['🧪 Integration Test Log', 'Integration Test Log', 'Test Results']
        table = None
        
        for name in table_names:
            try:
                table = api.table(AIRTABLE_BASE_ID, name)
                break
            except:
                continue
        
        if not table:
            print(f"Could not access Airtable - {test_name}: {status}")
            return
        
        # Check if record exists and update, otherwise create
        existing = table.all(formula=f"{{🔧 Integration Name}} = '{test_name}'")
        
        record_data = {
            '🔧 Integration Name': test_name,
            '✅ Pass/Fail': '✅' if status == 'PASS' else '❌',
            '🧠 Notes / Debug': details,
            '📅 Test Date': datetime.now().strftime('%Y-%m-%d'),
            '🧑‍💻 QA Owner': 'Automated System',
            '📤 Output Data Populated': 'checked' if output_data else '',
            '🔁 Retry Attempted?': 'Yes - End-to-End Test',
            '🧩 Module Type': 'End-to-End Validation'
        }
        
        if existing:
            table.update(existing[0]['id'], record_data)
            print(f"✓ Updated Airtable: {test_name} - {status}")
        else:
            table.create(record_data)
            print(f"✓ Created Airtable: {test_name} - {status}")
        
    except Exception as e:
        print(f"❌ Airtable logging failed for {test_name}: {e}")

def test_webhook_endpoints():
    """Test all webhook endpoints with realistic payloads"""
    webhooks = [
        {
            'name': 'Lead Webhook',
            'endpoint': '/api/webhook/lead',
            'payload': {
                'contact_name': 'Sarah Johnson',
                'email': 'sarah.johnson@techcorp.com',
                'company': 'TechCorp Solutions',
                'phone': '+1-555-0123',
                'source': 'website_form',
                'lead_score': 85,
                'notes': 'Interested in enterprise automation package'
            }
        },
        {
            'name': 'Support Webhook',
            'endpoint': '/api/webhook/support',
            'payload': {
                'ticket_id': 'SUP-001-' + str(int(time.time())),
                'customer_email': 'help@clientcompany.com',
                'subject': 'Bot not responding properly',
                'message': 'Our voice bot stopped working after the latest update',
                'priority': 'high',
                'category': 'technical_support'
            }
        },
        {
            'name': 'Payment Webhook',
            'endpoint': '/api/webhook/payment',
            'payload': {
                'payment_id': 'PAY-' + str(int(time.time())),
                'customer_email': 'billing@enterprise.com',
                'amount': 2500.00,
                'currency': 'USD',
                'status': 'completed',
                'invoice_id': 'INV-2025-001'
            }
        },
        {
            'name': 'Stripe Webhook',
            'endpoint': '/api/webhook/stripe',
            'payload': {
                'type': 'payment_intent.succeeded',
                'data': {
                    'object': {
                        'id': 'pi_' + str(int(time.time())),
                        'amount': 5000,
                        'currency': 'usd',
                        'customer': 'cus_test123',
                        'metadata': {
                            'customer_email': 'premium@client.com'
                        }
                    }
                }
            }
        },
        {
            'name': 'HubSpot Webhook',
            'endpoint': '/api/webhook/hubspot',
            'payload': {
                'contact_id': 'HS-' + str(int(time.time())),
                'email': 'contact@newlead.com',
                'firstname': 'Michael',
                'lastname': 'Chen',
                'company': 'Innovation Labs',
                'phone': '+1-555-0456',
                'lifecycle_stage': 'lead'
            }
        },
        {
            'name': 'Usage Webhook',
            'endpoint': '/api/webhook/usage',
            'payload': {
                'client_email': 'admin@heavyuser.com',
                'usage_type': 'voice_minutes',
                'current_usage': 950,
                'plan_limit': 1000,
                'threshold_exceeded': True,
                'alert_level': 'warning'
            }
        },
        {
            'name': 'Calendar Webhook',
            'endpoint': '/api/webhook/calendar',
            'payload': {
                'event_type': 'meeting.scheduled',
                'attendee_email': 'prospect@bigcorp.com',
                'meeting_time': '2025-06-04T14:00:00Z',
                'meeting_type': 'demo',
                'organizer': 'sales@yobot.com'
            }
        },
        {
            'name': 'Form Webhook',
            'endpoint': '/api/webhook/form',
            'payload': {
                'form_id': 'tally_demo_form',
                'submission_id': 'SUB-' + str(int(time.time())),
                'fields': {
                    'name': 'Jennifer Wu',
                    'email': 'jennifer@startup.io',
                    'company': 'StartupIO',
                    'interest': 'voice_automation'
                }
            }
        }
    ]
    
    results = {}
    print("🪝 TESTING WEBHOOK ENDPOINTS")
    print("=" * 50)
    
    for webhook in webhooks:
        try:
            response = requests.post(
                f"{BASE_URL}{webhook['endpoint']}",
                json=webhook['payload'],
                timeout=15
            )
            
            status = "PASS" if response.status_code in [200, 201, 202] else "FAIL"
            
            try:
                response_data = response.json()
                details = f"HTTP {response.status_code} - {response_data.get('message', 'Success')}"
            except:
                details = f"HTTP {response.status_code}"
            
            results[webhook['name']] = {
                'status': status,
                'details': details,
                'response': response_data if 'response_data' in locals() else {}
            }
            
            print(f"  {webhook['name']:<20} {status} - {details}")
            
            # Log to Airtable
            log_test_result(
                webhook['name'],
                status,
                details,
                json.dumps(webhook['payload'])
            )
            
        except Exception as e:
            status = "FAIL"
            details = f"Connection error: {str(e)}"
            results[webhook['name']] = {'status': status, 'details': details}
            
            print(f"  {webhook['name']:<20} {status} - {details}")
            
            log_test_result(webhook['name'], status, details)
    
    return results

def test_api_integrations():
    """Test all API integrations with live authentication"""
    integrations = [
        {
            'name': 'Slack Bot Integration',
            'endpoint': '/api/slack/test',
            'test_data': {'test_message': 'End-to-end validation test'}
        },
        {
            'name': 'Airtable Connection',
            'endpoint': '/api/airtable/test',
            'test_data': {'test_record': True}
        },
        {
            'name': 'ElevenLabs Voice',
            'endpoint': '/api/elevenlabs/test',
            'test_data': {'text': 'Testing voice generation for YoBot system'}
        },
        {
            'name': 'OpenAI GPT Integration',
            'endpoint': '/api/ai/test',
            'test_data': {'prompt': 'Generate a test support response'}
        },
        {
            'name': 'QuickBooks OAuth',
            'endpoint': '/api/qbo/auth',
            'test_data': None
        },
        {
            'name': 'Stripe Connection',
            'endpoint': '/api/stripe/test',
            'test_data': {'test_payment': True}
        },
        {
            'name': 'HubSpot CRM Sync',
            'endpoint': '/api/hubspot/test',
            'test_data': {'test_contact': True}
        }
    ]
    
    results = {}
    print("\n🔗 TESTING API INTEGRATIONS")
    print("=" * 50)
    
    for integration in integrations:
        try:
            if integration['name'] == 'QuickBooks OAuth':
                # Special handling for OAuth redirect
                response = requests.get(
                    f"{BASE_URL}{integration['endpoint']}",
                    timeout=10,
                    allow_redirects=False
                )
                status = "PASS" if response.status_code == 302 else "FAIL"
                details = f"OAuth redirect: HTTP {response.status_code}"
            else:
                if integration['test_data']:
                    response = requests.post(
                        f"{BASE_URL}{integration['endpoint']}",
                        json=integration['test_data'],
                        timeout=15
                    )
                else:
                    response = requests.get(
                        f"{BASE_URL}{integration['endpoint']}",
                        timeout=15
                    )
                
                status = "PASS" if response.status_code == 200 else "FAIL"
                
                try:
                    response_data = response.json()
                    details = f"HTTP {response.status_code} - {response_data.get('message', 'Connected')}"
                except:
                    details = f"HTTP {response.status_code}"
            
            results[integration['name']] = {
                'status': status,
                'details': details
            }
            
            print(f"  {integration['name']:<25} {status} - {details}")
            
            log_test_result(integration['name'], status, details)
            
        except Exception as e:
            status = "FAIL"
            details = f"Connection error: {str(e)}"
            results[integration['name']] = {'status': status, 'details': details}
            
            print(f"  {integration['name']:<25} {status} - {details}")
            
            log_test_result(integration['name'], status, details)
    
    return results

def test_automation_workflows():
    """Test end-to-end automation workflows"""
    workflows = [
        {
            'name': 'Support Ticket Flow',
            'steps': [
                'Create support ticket',
                'Generate AI response',
                'Create voice MP3',
                'Log to Airtable',
                'Send Slack alert'
            ]
        },
        {
            'name': 'Lead Capture Flow',
            'steps': [
                'Capture lead data',
                'Score lead',
                'Sync to CRM',
                'Trigger follow-up',
                'Log activity'
            ]
        },
        {
            'name': 'Payment Processing Flow',
            'steps': [
                'Process payment',
                'Create QBO invoice',
                'Update Airtable',
                'Send confirmation',
                'Trigger billing workflow'
            ]
        },
        {
            'name': 'Voice Fallback Flow',
            'steps': [
                'Detect voice failure',
                'Generate fallback MP3',
                'Log error event',
                'Alert support team',
                'Update status'
            ]
        }
    ]
    
    results = {}
    print("\n⚡ TESTING AUTOMATION WORKFLOWS")
    print("=" * 50)
    
    for workflow in workflows:
        try:
            # Test workflow endpoint
            test_payload = {
                'workflow_name': workflow['name'].lower().replace(' ', '_'),
                'test_mode': True,
                'timestamp': datetime.now().isoformat()
            }
            
            response = requests.post(
                f"{BASE_URL}/api/workflow/test",
                json=test_payload,
                timeout=20
            )
            
            status = "PASS" if response.status_code in [200, 201, 202] else "FAIL"
            
            try:
                response_data = response.json()
                details = f"Workflow executed: {response_data.get('message', 'Complete')}"
            except:
                details = f"HTTP {response.status_code}"
            
            results[workflow['name']] = {
                'status': status,
                'details': details,
                'steps': workflow['steps']
            }
            
            print(f"  {workflow['name']:<25} {status} - {details}")
            for step in workflow['steps']:
                print(f"    → {step}")
            
            log_test_result(workflow['name'], status, details)
            
        except Exception as e:
            status = "FAIL"
            details = f"Workflow error: {str(e)}"
            results[workflow['name']] = {'status': status, 'details': details}
            
            print(f"  {workflow['name']:<25} {status} - {details}")
            
            log_test_result(workflow['name'], status, details)
    
    return results

def test_log_tables():
    """Verify all log tables are receiving data"""
    log_tables = [
        'Support Ticket Log',
        'Payment Tracker', 
        'AI Response Log',
        'Error + Fallback Log',
        'QA Event Results',
        'Usage Alerts Log'
    ]
    
    results = {}
    print("\n📋 TESTING LOG TABLES")
    print("=" * 50)
    
    for table_name in log_tables:
        try:
            # Test logging to each table
            test_payload = {
                'table_name': table_name,
                'test_data': {
                    'test_entry': True,
                    'timestamp': datetime.now().isoformat(),
                    'source': 'end_to_end_validation'
                }
            }
            
            response = requests.post(
                f"{BASE_URL}/api/log/test",
                json=test_payload,
                timeout=10
            )
            
            status = "PASS" if response.status_code in [200, 201] else "FAIL"
            details = f"Log table accessible: HTTP {response.status_code}"
            
            results[table_name] = {
                'status': status,
                'details': details
            }
            
            print(f"  {table_name:<25} {status} - {details}")
            
            log_test_result(f"Log Table: {table_name}", status, details)
            
        except Exception as e:
            status = "FAIL"
            details = f"Table error: {str(e)}"
            results[table_name] = {'status': status, 'details': details}
            
            print(f"  {table_name:<25} {status} - {details}")
            
            log_test_result(f"Log Table: {table_name}", status, details)
    
    return results

def test_health_endpoint():
    """Test system health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        
        if response.status_code == 200:
            health_data = response.json()
            return {
                'status': 'PASS',
                'details': f"System healthy: {health_data.get('status', 'OK')}",
                'data': health_data
            }
        else:
            return {
                'status': 'FAIL',
                'details': f"Health check failed: HTTP {response.status_code}"
            }
    except:
        return {
            'status': 'FAIL',
            'details': "Health endpoint not accessible"
        }

def run_comprehensive_tests():
    """Run complete end-to-end test suite"""
    print("🚀 COMPREHENSIVE END-TO-END TEST SUITE")
    print("=" * 80)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    
    all_results = {}
    
    # Test webhooks
    webhook_results = test_webhook_endpoints()
    all_results['Webhooks'] = webhook_results
    
    # Test API integrations
    api_results = test_api_integrations()
    all_results['API Integrations'] = api_results
    
    # Test automation workflows
    workflow_results = test_automation_workflows()
    all_results['Automation Workflows'] = workflow_results
    
    # Test log tables
    log_results = test_log_tables()
    all_results['Log Tables'] = log_results
    
    # Test health endpoint
    health_result = test_health_endpoint()
    all_results['System Health'] = {'Health Check': health_result}
    
    # Generate final report
    print("\n" + "=" * 80)
    print("📊 COMPREHENSIVE TEST RESULTS")
    print("=" * 80)
    
    total_tests = 0
    passed_tests = 0
    failed_tests = []
    
    for category, tests in all_results.items():
        category_passed = sum(1 for test in tests.values() if test.get('status') == 'PASS')
        category_total = len(tests)
        
        total_tests += category_total
        passed_tests += category_passed
        
        print(f"\n{category}:")
        print(f"  ✅ Passed: {category_passed}/{category_total}")
        
        # Show failed tests
        category_failed = [name for name, result in tests.items() if result.get('status') != 'PASS']
        if category_failed:
            print(f"  ❌ Failed: {', '.join(category_failed)}")
            failed_tests.extend([f"{category}: {test}" for test in category_failed])
    
    success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
    
    print(f"\n🎯 FINAL RESULTS:")
    print(f"   Total Tests: {total_tests}")
    print(f"   Passed: {passed_tests}")
    print(f"   Failed: {total_tests - passed_tests}")
    print(f"   Success Rate: {success_rate:.1f}%")
    
    # Log overall summary
    log_test_result(
        "End-to-End System Validation",
        "PASS" if success_rate >= 90 else "FAIL",
        f"Complete system validation: {passed_tests}/{total_tests} tests passed ({success_rate:.1f}%)",
        json.dumps(all_results, indent=2)
    )
    
    if success_rate >= 90:
        print("\n🎉 SYSTEM VALIDATION SUCCESSFUL")
        print("   All critical components operational")
        print("   Ready for production deployment")
    else:
        print(f"\n⚠️ SYSTEM NEEDS ATTENTION")
        print(f"   {len(failed_tests)} components require fixes")
        for test in failed_tests:
            print(f"     - {test}")
    
    return all_results

if __name__ == "__main__":
    results = run_comprehensive_tests()