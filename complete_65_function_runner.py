#!/usr/bin/env python3
"""
Complete 65 Function Runner - Execute ALL Functions
Owner: Tyson Lerfald
Purpose: Run all 65 automation functions and log to Airtable to fix count mismatch
Date: 2025-06-11

This script will execute every single automation function and log the results,
ensuring the dashboard shows exactly 65 functions as expected.
"""

import requests
import os
from datetime import datetime
import time

def log_integration_test_to_airtable(
    integration_name: str,
    passed: bool,
    notes: str = "",
    qa_owner: str = "Tyson Lerfald",
    output_data_populated: bool = True,
    record_created: bool = True,
    retry_attempted: bool = False,
    module_type: str = "Automation Test",
    related_scenario_link: str = ""
):
    """Log test results to Airtable"""
    try:
        airtable_api_key = os.environ.get('AIRTABLE_API_KEY')
        if not airtable_api_key:
            print("❌ AIRTABLE_API_KEY not found")
            return None
            
        # Format the integration name with result indicator and timestamp
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        result_indicator = "✅" if passed else "❌"
        formatted_name = f"{integration_name} - {result_indicator} - {notes} - {timestamp} - QA: {qa_owner} - Module: {module_type}"
        
        airtable_url = 'https://api.airtable.com/v0/appSwSSjrFOD2Ql0f/tblCQosawWr4uqcul'
        headers = {
            'Authorization': f'Bearer {airtable_api_key}',
            'Content-Type': 'application/json'
        }
        
        # Check if record exists
        search_response = requests.get(f"{airtable_url}?filterByFormula={{🔧 Integration Name}}='{integration_name}'", headers=headers)
        
        record_data = {
            "🔧 Integration Name": formatted_name,
            "✅ Pass/Fail": result_indicator,
            "📋 Notes": f"QA Test {notes}",
            "👤 QA Owner": qa_owner,
            "📊 Output Data Populated": output_data_populated,
            "📝 Record Created": record_created,
            "🔄 Retry Attempted": retry_attempted,
            "🏷️ Module Type": module_type
        }
        
        if related_scenario_link:
            record_data["🔗 Related Scenario Link"] = related_scenario_link
        
        if search_response.status_code == 200 and search_response.json().get('records'):
            # Update existing record
            existing_record = search_response.json()['records'][0]
            record_id = existing_record['id']
            
            patch_data = {"fields": record_data}
            response = requests.patch(f"{airtable_url}/{record_id}", headers=headers, json=patch_data)
        else:
            # Create new record
            post_data = {"fields": record_data}
            response = requests.post(airtable_url, headers=headers, json=post_data)
        
        if response.status_code in [200, 201]:
            print(f"✅ Logged: {integration_name} - {result_indicator}")
            return response.json().get('id') if 'id' in response.json() else response.json().get('records', [{}])[0].get('id')
        else:
            print(f"❌ Failed to log {integration_name}: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Error logging {integration_name}: {str(e)}")
        return None

# Import all automation functions
import sys
sys.path.append('.')
from clean_automation_functions import *

def run_all_65_functions():
    """Execute all 65 automation functions and log results"""
    
    print("🚀 Starting Complete 65 Function Test Runner")
    print("=" * 60)
    
    # Define all 65 functions in execution order
    all_functions = [
        # BATCH 1-4: CORE AUTOMATION FUNCTIONS (31 functions)
        ("Log to CRM", function_log_to_crm),
        ("Create Invoice", function_create_invoice),
        ("Send Slack Notification", function_send_slack_notification),
        ("Send Email Receipt", function_send_email_receipt),
        ("Record Call Log", function_record_call_log),
        ("Score Call", function_score_call),
        ("Run Voicebot Script", function_run_voicebot_script),
        ("Sync to SmartSpend", function_sync_to_smartspend),
        ("Generate ROI Snapshot", function_generate_roi_snapshot),
        ("Trigger Quote PDF", function_trigger_quote_pdf),
        ("Sync to HubSpot", function_sync_to_hubspot),
        ("Sync to QuickBooks", function_sync_to_quickbooks),
        ("Log Voice Sentiment", function_log_voice_sentiment),
        ("Store Transcription", function_store_transcription),
        ("Send SMS Alert", function_send_sms_alert),
        ("Candidate Screening", function_candidate_screening),
        ("Background Checks", function_background_checks),
        ("Reference Verification", function_reference_verification),
        ("Onboarding Automation", function_onboarding_automation),
        ("Document Management", function_document_management),
        ("Policy Distribution", function_policy_distribution),
        ("Compliance Training", function_compliance_training),
        ("Safety Monitoring", function_safety_monitoring),
        ("Incident Reporting", function_incident_reporting),
        ("Emergency Response", function_emergency_response),
        ("Inventory Sync", function_inventory_sync),
        ("Stripe Payment", function_stripe_payment),
        ("GPT Summary", function_gpt_summary),
        ("Calendar Booking", function_calendar_booking),
        ("Upload to Drive", function_upload_to_drive),
        ("Generate Compliance PDF", function_generate_compliance_pdf),
        
        # BATCH 5: LEAD ENGINE FUNCTIONS (5 functions)
        ("Lead Scraper Apollo", function_lead_scraper_apollo),
        ("Lead Scraper PhantomBuster", function_lead_scraper_phantombuster),
        ("Lead Scraper Apify", function_lead_scraper_apify),
        ("Export Leads", function_export_leads),
        ("Scraped Leads Airtable", function_scraped_leads_airtable),
        
        # BATCH 6: VOICE/COMMUNICATION FUNCTIONS (6 functions)
        ("Start Pipeline Calls", function_start_pipeline_calls),
        ("Stop Pipeline Calls", function_stop_pipeline_calls),
        ("Initiate Voice Call Manual", function_initiate_voice_call_manual),
        ("Voice Input ElevenLabs", function_voice_input_elevenlabs),
        ("Send SMS Twilio", function_send_sms_twilio),
        ("ElevenLabs Voice Persona", function_elevenlabs_voice_persona),
        
        # BATCH 7: SUPPORT & MONITORING FUNCTIONS (6 functions)
        ("Submit Ticket Zendesk", function_submit_ticket_zendesk),
        ("Chatbot Voice Text Hybrid", function_chatbot_voice_text_hybrid),
        ("Download Logs", function_download_logs),
        ("Run Diagnostics", function_run_diagnostics),
        ("Emergency Data Wipe", function_emergency_data_wipe),
        ("Critical Escalation Alert", function_critical_escalation_alert),
        
        # BATCH 8: ADVANCED CORE SYSTEM FUNCTIONS (6 functions)
        ("Sales Order Processor", function_sales_order_processor),
        ("RAG Knowledge Engine", function_rag_knowledge_engine),
        ("Botalytics Metrics Dashboard", function_botalytics_metrics_dashboard),
        ("Mailchimp Sync", function_mailchimp_sync),
        ("System Mode Toggle", function_system_mode_toggle),
        ("File Uploads RAG", function_file_uploads_rag),
        
        # BATCH 9: ADDITIONAL FUNCTIONS (11 functions)
        ("Webhook Automation", function_webhook_automation),
        ("API Integration", function_api_integration),
        ("Data Sync", function_data_sync),
        ("Notification System", function_notification_system),
        ("Backup System", function_backup_system),
        ("Security Check", function_security_check),
        ("Performance Monitor", function_performance_monitor),
        ("Error Handler", function_error_handler),
        ("Log Aggregator", function_log_aggregator),
        ("Health Check", function_health_check),
        ("System Cleanup", function_system_cleanup),
    ]
    
    print(f"📊 Total functions to execute: {len(all_functions)}")
    
    successful_tests = 0
    failed_tests = 0
    
    for i, (func_name, func) in enumerate(all_functions, 1):
        try:
            print(f"\n🔄 [{i:2d}/65] Testing: {func_name}")
            
            # Execute the function
            result = func()
            success = result is True
            
            # Log to Airtable
            test_number = f"#{i:03d}"
            log_integration_test_to_airtable(
                integration_name=func_name,
                passed=success,
                notes=f"Complete Test {test_number}",
                qa_owner="Tyson Lerfald",
                module_type="Automation Test"
            )
            
            if success:
                successful_tests += 1
                print(f"✅ {func_name} - PASSED")
            else:
                failed_tests += 1
                print(f"❌ {func_name} - FAILED")
            
            # Small delay to avoid rate limiting
            time.sleep(0.2)
            
        except Exception as e:
            failed_tests += 1
            print(f"❌ {func_name} - ERROR: {str(e)}")
            
            # Still log the failure
            log_integration_test_to_airtable(
                integration_name=func_name,
                passed=False,
                notes=f"Error: {str(e)[:50]}",
                qa_owner="Tyson Lerfald",
                module_type="Automation Test"
            )
    
    print("\n" + "=" * 60)
    print("🏁 COMPLETE 65 FUNCTION TEST SUMMARY")
    print("=" * 60)
    print(f"📊 Total Functions Executed: {len(all_functions)}")
    print(f"✅ Successful Tests: {successful_tests}")
    print(f"❌ Failed Tests: {failed_tests}")
    print(f"📈 Success Rate: {(successful_tests/len(all_functions)*100):.1f}%")
    print(f"🕐 Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("\n🎯 Dashboard should now show exactly 65 functions!")

if __name__ == "__main__":
    run_all_65_functions()