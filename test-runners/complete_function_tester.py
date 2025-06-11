#!/usr/bin/env python3
"""
Complete Function Tester - Test all 65 automation functions
Owner: Tyson Lerfald
Purpose: Execute all automation functions via API to ensure proper QA testing
Date: 2025-06-11
"""

import requests
import time
import json

# All 65 automation functions that need QA testing
AUTOMATION_FUNCTIONS = [
    # Batch 1-8: Core Functions (31 functions)
    'log_to_crm',
    'create_invoice', 
    'send_slack_notification',
    'send_email_receipt',
    'record_call_log',
    'score_call',
    'run_voicebot_script',
    'sync_to_smartspend',
    'generate_roi_snapshot',
    'trigger_quote_pdf',
    'sync_to_hubspot',
    'sync_to_quickbooks',
    'log_voice_sentiment',
    'store_transcription',
    'send_sms_alert',
    'candidate_screening',
    'background_checks',
    'reference_verification',
    'onboarding_automation',
    'document_management',
    'policy_distribution',
    'compliance_training',
    'safety_monitoring',
    'incident_reporting',
    'emergency_response',
    'inventory_sync',
    'stripe_payment',
    'gpt_summary',
    'calendar_booking',
    'upload_to_drive',
    'generate_compliance_pdf',
    
    # Batch 9: Lead Engine Functions (5 functions)
    'lead_scraper_apollo',
    'lead_scraper_phantombuster',
    'lead_scraper_apify',
    'export_leads',
    'scraped_leads_airtable',
    
    # Batch 10: Voice/Communication + Support Functions (29 functions)
    'start_pipeline_calls',
    'stop_pipeline_calls',
    'initiate_voice_call_manual',
    'voice_input_elevenlabs',
    'send_sms_twilio',
    'elevenlabs_voice_persona',
    'submit_ticket_zendesk',
    'chatbot_voice_text_hybrid',
    'download_logs',
    'run_diagnostics',
    'emergency_data_wipe',
    'critical_escalation_alert',
    'sales_order_processor',
    'rag_knowledge_engine',
    'botalytics_metrics_dashboard',
    'mailchimp_sync',
    'system_mode_toggle',
    'file_uploads_rag',
    'webhook_automation',
    'api_integration',
    'data_sync',
    'notification_system',
    'backup_system',
    'security_check',
    'performance_monitor',
    'error_handler',
    'log_aggregator',
    'health_check',
    'system_cleanup'
]

def test_all_functions():
    """Test all 65 automation functions via API"""
    print("🧪 COMPLETE AUTOMATION FUNCTION TESTING")
    print("=" * 60)
    print(f"Testing {len(AUTOMATION_FUNCTIONS)} automation functions")
    print()
    
    passed = 0
    failed = 0
    results = []
    
    for i, function_name in enumerate(AUTOMATION_FUNCTIONS, 1):
        print(f"📝 #{i:02d} Testing: {function_name}")
        
        try:
            # Execute function via API
            url = f"http://localhost:5000/api/automation/execute/{function_name}"
            response = requests.post(url, headers={'Content-Type': 'application/json'})
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    record_id = data.get('recordId', 'No ID')
                    print(f"✅ PASS - {function_name} (Record: {record_id})")
                    passed += 1
                    results.append({
                        'function': function_name,
                        'status': 'PASS',
                        'recordId': record_id
                    })
                else:
                    print(f"❌ FAIL - {function_name}: {data.get('error', 'Unknown error')}")
                    failed += 1
                    results.append({
                        'function': function_name,
                        'status': 'FAIL',
                        'error': data.get('error', 'Unknown error')
                    })
            else:
                print(f"❌ FAIL - {function_name}: HTTP {response.status_code}")
                failed += 1
                results.append({
                    'function': function_name,
                    'status': 'FAIL',
                    'error': f'HTTP {response.status_code}'
                })
        
        except Exception as e:
            print(f"❌ ERROR - {function_name}: {str(e)}")
            failed += 1
            results.append({
                'function': function_name,
                'status': 'ERROR',
                'error': str(e)
            })
        
        # Brief delay between tests
        time.sleep(0.1)
    
    print()
    print("=" * 60)
    print("🏁 COMPLETE TEST SUMMARY")
    print("=" * 60)
    print(f"Total Functions Tested: {len(AUTOMATION_FUNCTIONS)}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print(f"Success Rate: {(passed/len(AUTOMATION_FUNCTIONS)*100):.1f}%")
    print()
    
    # Save detailed results
    with open('complete_test_results.json', 'w') as f:
        json.dump({
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
            'total_functions': len(AUTOMATION_FUNCTIONS),
            'passed': passed,
            'failed': failed,
            'success_rate': passed/len(AUTOMATION_FUNCTIONS)*100,
            'results': results
        }, f, indent=2)
    
    print("📊 Detailed results saved to complete_test_results.json")
    
    if failed > 0:
        print(f"⚠️  {failed} functions need attention")
        failed_functions = [r['function'] for r in results if r['status'] != 'PASS']
        print("Failed functions:", ', '.join(failed_functions))

if __name__ == "__main__":
    test_all_functions()