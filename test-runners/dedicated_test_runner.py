#!/usr/bin/env python3
"""
Dedicated Test Runner - QA Testing ONLY
Owner: Tyson Lerfald
Purpose: Test automation functions and log results to Airtable for QA purposes
Date: 2025-06-11

This script is for TESTING PURPOSES ONLY. It imports clean business functions
and runs them in a test context, logging results to Airtable.

Business functions should NOT automatically log - this is the only place
where Airtable logging should happen.
"""

import sys
import traceback
from datetime import datetime
import requests

sys.path.append('.')
from clean_automation_functions import *

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
    """Log test results to Airtable - TESTING ONLY"""
    airtable_api_key = "paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa"
    base_id = "appbFDTqB2WtRNV1H"
    table_id = "tbl7K5RthCtD69BE1"
    base_url = f"https://api.airtable.com/v0/{base_id}/{table_id}"
    
    headers = {
        "Authorization": f"Bearer {airtable_api_key}",
        "Content-Type": "application/json"
    }
    
    # Check if record exists for this function (patch system)
    search_url = f"{base_url}?filterByFormula={{🔧 Integration Name}}='{integration_name}'"
    
    try:
        search_response = requests.get(search_url, headers=headers)
        existing_records = search_response.json().get('records', [])
        
        payload = {
            'fields': {
                '🔧 Integration Name': integration_name,
                '✅ Pass/Fail': '✅ Pass' if passed else '❌ Fail',
                '🧠 Notes / Debug': notes,
                '📅 Test Date': datetime.now().isoformat(),
                '🧑‍💻 QA Owner': qa_owner,
                '📤 Output Data Populated?': output_data_populated,
                '🗃️ Record Created?': record_created,
                '🔁 Retry Attempted?': len(existing_records) > 0,
                '🧩 Module Type': module_type,
                '📂 Related Scenario Link': related_scenario_link
            }
        }
        
        if existing_records:
            # Update existing record (PATCH)
            record_id = existing_records[0]['id']
            patch_url = f"{base_url}/{record_id}"
            response = requests.patch(patch_url, headers=headers, json=payload)
            operation = "UPDATED"
        else:
            # Create new record (POST)
            response = requests.post(base_url, headers=headers, json=payload)
            operation = "CREATED"
        
        if response.status_code in [200, 201]:
            record_id = response.json().get('id', existing_records[0]['id'] if existing_records else 'unknown')
            print(f"🔄 TEST LOG: {integration_name} - {record_id}")
        else:
            print(f"❌ Test log failed for {integration_name}: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Test logging error for {integration_name}: {e}")

class DedicatedTestRunner:
    def __init__(self):
        self.test_functions = [
            # Batch 1-4: Core Automation
            ("Log to CRM", function_log_to_crm),
            ("Create Invoice", function_create_invoice),
            ("Send Slack Notification", function_send_slack_notification),
            ("Send Email Receipt", function_send_email_receipt),
            ("Record Call Log", function_record_call_log),
            ("Score Call", function_score_call),
            ("Run Voicebot Script", function_run_voicebot_script),
            ("Sync to Smartspend", function_sync_to_smartspend),
            ("Generate ROI Snapshot", function_generate_roi_snapshot),
            ("Trigger Quote PDF", function_trigger_quote_pdf),
            ("Sync to Hubspot", function_sync_to_hubspot),
            ("Sync to Quickbooks", function_sync_to_quickbooks),
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
            
            # Batch 5: Lead Engine
            ("Lead Scraper Apollo", function_lead_scraper_apollo),
            ("Lead Scraper PhantomBuster", function_lead_scraper_phantombuster),
            ("Lead Scraper Apify", function_lead_scraper_apify),
            ("Export Leads", function_export_leads),
            ("Scraped Leads Airtable", function_scraped_leads_airtable),
            
            # Batch 6: Voice/Communication
            ("Start Pipeline Calls", function_start_pipeline_calls),
            ("Stop Pipeline Calls", function_stop_pipeline_calls),
            ("Initiate Voice Call Manual", function_initiate_voice_call_manual),
            ("Voice Input ElevenLabs", function_voice_input_elevenlabs),
            ("Send SMS Twilio", function_send_sms_twilio),
            ("ElevenLabs Voice Persona", function_elevenlabs_voice_persona),
            
            # Batch 7: Support & Monitoring
            ("Submit Ticket Zendesk", function_submit_ticket_zendesk),
            ("Chatbot Voice Text Hybrid", function_chatbot_voice_text_hybrid),
            ("Download Logs", function_download_logs),
            ("Run Diagnostics", function_run_diagnostics),
            ("Emergency Data Wipe", function_emergency_data_wipe),
            ("Critical Escalation Alert", function_critical_escalation_alert),
            
            # Batch 8: Advanced Core Systems
            ("Sales Order Processor", function_sales_order_processor),
            ("RAG Knowledge Engine", function_rag_knowledge_engine),
            ("Botalytics Metrics Dashboard", function_botalytics_metrics_dashboard),
            ("Mailchimp Sync", function_mailchimp_sync),
            ("System Mode Toggle", function_system_mode_toggle),
            ("File Uploads RAG", function_file_uploads_rag)
        ]
    
    def run_test_suite(self):
        """Run complete test suite - QA ONLY"""
        print("🧪 DEDICATED TEST RUNNER - QA TESTING")
        print("=" * 50)
        print("Testing business functions and logging results to Airtable")
        print("Business functions do NOT auto-log - this is test-only logging")
        print()
        
        passed = 0
        failed = 0
        
        for name, func in self.test_functions:
            try:
                # Execute the business function (no auto-logging)
                result = func()
                
                # Log test result to Airtable (QA logging only)
                if result:
                    passed += 1
                    log_integration_test_to_airtable(
                        integration_name=name,
                        passed=True,
                        notes="QA Test: Function executed successfully"
                    )
                    print(f"✅ {name}: PASS")
                else:
                    failed += 1
                    log_integration_test_to_airtable(
                        integration_name=name,
                        passed=False,
                        notes="QA Test: Function returned False"
                    )
                    print(f"❌ {name}: FAIL - Function returned False")
                    
            except Exception as e:
                failed += 1
                error_details = traceback.format_exc()
                log_integration_test_to_airtable(
                    integration_name=name,
                    passed=False,
                    notes=f"QA Test: Exception occurred - {error_details}"
                )
                print(f"❌ {name}: FAIL - Exception: {e}")
        
        print()
        print("=" * 50)
        print("QA TEST RESULTS")
        print("=" * 50)
        print(f"Total Tested: {passed + failed}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(passed/(passed + failed)*100):.1f}%")
        print()
        print("All test results logged to Airtable Integration Test Log")
        
        return {"passed": passed, "failed": failed, "total": passed + failed}

def main():
    """Run QA test suite"""
    runner = DedicatedTestRunner()
    results = runner.run_test_suite()
    
    print(f"🎯 QA Testing Complete: {results['passed']}/{results['total']} functions passed")
    print("Airtable contains ONLY test results - no business execution logging")

if __name__ == "__main__":
    main()