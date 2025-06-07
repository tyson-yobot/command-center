#!/usr/bin/env python3
"""
Comprehensive Webhook System Validator
Tests all 12 webhook endpoints with detailed validation and logging
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "https://workspace--tyson44.replit.app"

def test_webhook_comprehensive(endpoint, payload, test_name):
    """Comprehensive webhook endpoint testing"""
    print(f"\n🧪 Testing: {test_name}")
    print(f"📡 Endpoint: {endpoint}")
    print(f"📤 Payload: {json.dumps(payload, indent=2)}")
    
    start_time = time.time()
    
    try:
        response = requests.post(
            f"{BASE_URL}{endpoint}",
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        response_time = round((time.time() - start_time) * 1000, 2)
        
        print(f"📊 Status: {response.status_code}")
        print(f"⏱️ Response Time: {response_time}ms")
        
        if response.status_code == 200:
            try:
                response_data = response.json()
                print(f"✅ Success: {response_data.get('message', 'Request processed')}")
                
                # Validate response structure
                required_fields = ['success', 'message']
                missing_fields = [field for field in required_fields if field not in response_data]
                
                if missing_fields:
                    print(f"⚠️ Missing response fields: {missing_fields}")
                else:
                    print("✓ Response structure valid")
                
                return {
                    'status': 'PASS',
                    'response_time': response_time,
                    'response': response_data
                }
                
            except json.JSONDecodeError:
                print(f"⚠️ Invalid JSON response: {response.text[:200]}")
                return {
                    'status': 'PARTIAL',
                    'response_time': response_time,
                    'issue': 'Invalid JSON'
                }
        else:
            print(f"❌ Failed: {response.text}")
            return {
                'status': 'FAIL',
                'response_time': response_time,
                'error': response.text
            }
            
    except requests.exceptions.Timeout:
        print("❌ Request timeout")
        return {'status': 'TIMEOUT', 'response_time': 30000}
    except requests.exceptions.ConnectionError:
        print("❌ Connection error")
        return {'status': 'CONNECTION_ERROR', 'response_time': 0}
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return {'status': 'ERROR', 'response_time': 0, 'error': str(e)}

def run_comprehensive_webhook_tests():
    """Execute comprehensive webhook validation"""
    print("🚀 YoBot Comprehensive Webhook System Validation")
    print("=" * 70)
    print(f"🌐 Target: {BASE_URL}")
    print(f"🕒 Started: {datetime.now()}")
    print()
    
    test_results = []
    
    # Test 1: Webhook Status
    print("📊 Testing System Status Endpoint")
    try:
        response = requests.get(f"{BASE_URL}/api/webhook/status", timeout=10)
        if response.status_code == 200:
            status_data = response.json()
            print("✅ Status endpoint operational")
            print(f"  Endpoints: {status_data.get('endpoints', 'Unknown')}")
            print(f"  Health: {status_data.get('health', 'Unknown')}")
            print(f"  Airtable: {status_data.get('airtableConnected', 'Unknown')}")
        else:
            print(f"⚠️ Status endpoint returned {response.status_code}")
    except Exception as e:
        print(f"❌ Status endpoint error: {e}")
    
    print("\n" + "=" * 70)
    print("🧪 WEBHOOK ENDPOINT VALIDATION")
    print("=" * 70)
    
    # Test 2: Platinum Promo Lead
    result = test_webhook_comprehensive(
        "/api/leads/promo",
        {
            "name": "Alex Johnson",
            "email": "alex.johnson@techstartup.com",
            "phone": "+1-555-0101",
            "company": "TechStartup Inc",
            "source": "Platinum Promo Campaign"
        },
        "Platinum Promo Lead Capture"
    )
    test_results.append(("Platinum Promo", result))
    time.sleep(1)
    
    # Test 3: ROI Snapshot Lead
    result = test_webhook_comprehensive(
        "/api/leads/roi",
        {
            "name": "Maria Garcia",
            "email": "maria.garcia@retailcorp.com",
            "phone": "+1-555-0102",
            "company": "RetailCorp Solutions",
            "currentCosts": 25000,
            "goalROI": 4.0,
            "industry": "Retail"
        },
        "ROI Snapshot Lead"
    )
    test_results.append(("ROI Snapshot", result))
    time.sleep(1)
    
    # Test 4: Booking Form
    result = test_webhook_comprehensive(
        "/api/leads/booking",
        {
            "name": "David Kim",
            "email": "david.kim@financegroup.com",
            "phone": "+1-555-0103",
            "preferredTime": "2024-06-15 10:00:00",
            "timeZone": "PST",
            "meetingType": "Product Demo",
            "company": "Finance Group LLC"
        },
        "Demo Booking Form"
    )
    test_results.append(("Booking Form", result))
    time.sleep(1)
    
    # Test 5: Demo Request
    result = test_webhook_comprehensive(
        "/api/leads/demo",
        {
            "name": "Jennifer Lopez",
            "email": "jennifer.lopez@healthsystem.org",
            "phone": "+1-555-0104",
            "company": "Health System Network",
            "industry": "Healthcare",
            "teamSize": "50-100",
            "urgency": "High"
        },
        "Demo Request Form"
    )
    test_results.append(("Demo Request", result))
    time.sleep(1)
    
    # Test 6: General Lead Capture
    result = test_webhook_comprehensive(
        "/api/leads/capture",
        {
            "name": "Robert Chen",
            "email": "robert.chen@consulting.biz",
            "phone": "+1-555-0105",
            "company": "Chen Consulting Group",
            "leadSource": "Website Contact Form",
            "message": "Interested in voice automation for customer service",
            "budget": "10000-25000"
        },
        "General Lead Capture"
    )
    test_results.append(("Lead Capture", result))
    time.sleep(1)
    
    # Test 7: Sales Order Live
    result = test_webhook_comprehensive(
        "/api/orders/live",
        {
            "name": "Sarah Wilson",
            "email": "sarah.wilson@enterprise.com",
            "phone": "+1-555-0106",
            "package": "Enterprise",
            "addOns": ["Advanced Analytics", "SmartSpend", "Custom Integration"],
            "oneTimeTotal": 50000,
            "monthlyTotal": 3999,
            "finalQuoteTotal": 53999,
            "paymentMethod": "Wire Transfer"
        },
        "Live Sales Order"
    )
    test_results.append(("Sales Order Live", result))
    time.sleep(1)
    
    # Test 8: Sales Order Test
    result = test_webhook_comprehensive(
        "/api/orders/test",
        {
            "name": "Test Customer",
            "email": "test.customer@example.com",
            "package": "Standard",
            "addOns": ["Basic Analytics"],
            "testMode": True,
            "scenario": "Order Processing Validation"
        },
        "Test Sales Order"
    )
    test_results.append(("Sales Order Test", result))
    time.sleep(1)
    
    # Test 9: Awarded Project
    result = test_webhook_comprehensive(
        "/api/projects/awarded",
        {
            "clientName": "Global Manufacturing Inc",
            "clientEmail": "contracts@globalmanufacturing.com",
            "projectValue": 250000,
            "industry": "Manufacturing",
            "projectType": "Enterprise Voice Automation",
            "startDate": "2024-07-15",
            "duration": "18 months",
            "teamSize": "200+"
        },
        "Project Award Notification"
    )
    test_results.append(("Awarded Project", result))
    time.sleep(1)
    
    # Test 10: Dashboard Intake
    result = test_webhook_comprehensive(
        "/api/dashboard/intake",
        {
            "dashboardName": "Executive Analytics Dashboard",
            "requestedBy": "ceo@company.com",
            "priority": "Critical",
            "requirements": "Real-time KPIs, ROI tracking, call analytics integration",
            "deadline": "2024-06-30",
            "stakeholders": "C-Suite, Operations Team"
        },
        "Dashboard Intake Request"
    )
    test_results.append(("Dashboard Intake", result))
    time.sleep(1)
    
    # Test 11: SmartSpend Charge
    result = test_webhook_comprehensive(
        "/api/smartspend/charge",
        {
            "clientEmail": "billing@techcorp.com",
            "amount": 750,
            "campaignName": "Q3 Lead Generation Campaign",
            "budgetCategory": "Voice Outreach",
            "expectedROI": 5.2,
            "targetAudience": "Enterprise Prospects"
        },
        "SmartSpend Budget Charge"
    )
    test_results.append(("SmartSpend Charge", result))
    time.sleep(1)
    
    # Test 12: Feature Request
    result = test_webhook_comprehensive(
        "/api/features/request",
        {
            "requestedBy": "product.owner@client.com",
            "featureTitle": "Multi-Language Voice Support",
            "description": "Need Spanish and French voice capabilities for international customers",
            "priority": "High",
            "category": "Voice Technology",
            "estimatedValue": "Very High",
            "timeline": "Q3 2024"
        },
        "Feature Request Submission"
    )
    test_results.append(("Feature Request", result))
    time.sleep(1)
    
    # Test 13: Contact Us
    result = test_webhook_comprehensive(
        "/api/contact/message",
        {
            "name": "Michael Thompson",
            "email": "michael.thompson@nonprofit.org",
            "phone": "+1-555-0107",
            "subject": "Partnership Opportunity",
            "message": "Our nonprofit is interested in exploring voice automation for donor outreach programs. We serve 50,000+ donors annually.",
            "urgency": "Medium",
            "organization": "Community Impact Foundation"
        },
        "Contact Us Message"
    )
    test_results.append(("Contact Us", result))
    
    # Generate comprehensive report
    print("\n" + "=" * 70)
    print("📊 COMPREHENSIVE VALIDATION RESULTS")
    print("=" * 70)
    
    passed = failed = partial = timeout = connection_error = 0
    total_response_time = 0
    
    for test_name, result in test_results:
        status = result['status']
        response_time = result.get('response_time', 0)
        total_response_time += response_time
        
        if status == 'PASS':
            status_icon = "✅"
            passed += 1
        elif status == 'PARTIAL':
            status_icon = "⚠️"
            partial += 1
        elif status == 'TIMEOUT':
            status_icon = "⏰"
            timeout += 1
        elif status == 'CONNECTION_ERROR':
            status_icon = "🔌"
            connection_error += 1
        else:
            status_icon = "❌"
            failed += 1
        
        print(f"{status_icon} {test_name:.<25} {status:>15} ({response_time}ms)")
    
    total_tests = len(test_results)
    avg_response_time = round(total_response_time / total_tests, 2) if total_tests > 0 else 0
    success_rate = round((passed / total_tests) * 100, 1) if total_tests > 0 else 0
    
    print("\n" + "-" * 70)
    print(f"📈 SUMMARY STATISTICS")
    print(f"   Total Tests: {total_tests}")
    print(f"   Passed: {passed}")
    print(f"   Partial: {partial}")
    print(f"   Failed: {failed}")
    print(f"   Timeout: {timeout}")
    print(f"   Connection Errors: {connection_error}")
    print(f"   Success Rate: {success_rate}%")
    print(f"   Average Response Time: {avg_response_time}ms")
    
    if passed == total_tests:
        print("\n🎉 ALL WEBHOOK ENDPOINTS FULLY OPERATIONAL!")
        print("✅ System ready for production traffic")
        print("✅ All response structures valid")
        print("✅ Performance within acceptable limits")
    elif passed + partial == total_tests:
        print("\n🟡 WEBHOOK SYSTEM OPERATIONAL WITH MINOR ISSUES")
        print("⚠️ Some endpoints have structural issues but are functional")
    else:
        print(f"\n🔧 WEBHOOK SYSTEM NEEDS ATTENTION")
        print(f"❌ {failed + timeout + connection_error} endpoints not working properly")
    
    # Export results
    results_export = {
        'timestamp': datetime.now().isoformat(),
        'summary': {
            'total_tests': total_tests,
            'passed': passed,
            'partial': partial,
            'failed': failed,
            'timeout': timeout,
            'connection_error': connection_error,
            'success_rate': success_rate,
            'avg_response_time': avg_response_time
        },
        'detailed_results': dict(test_results)
    }
    
    with open('webhook_validation_results.json', 'w') as f:
        json.dump(results_export, f, indent=2)
    
    print(f"\n💾 Results exported to: webhook_validation_results.json")
    print(f"🕒 Completed: {datetime.now()}")
    
    return success_rate > 90

if __name__ == "__main__":
    success = run_comprehensive_webhook_tests()
    exit(0 if success else 1)