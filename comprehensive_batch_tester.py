#!/usr/bin/env python3
"""
Comprehensive Batch Test Runner - All Automation Functions
Owner: Tyson Lerfald
Purpose: Test all automation functions in organized batches with live Airtable logging
Date: 2025-06-11

This script organizes and tests all automation functions by category:
- Batch 1-4: Core automation functions (31 functions)
- Batch 5: Lead Engine functions (5 functions) 
- Batch 6: Voice/Communication functions (6 functions)
- Batch 7: Support & Monitoring functions (6 functions)
- Batch 8: Advanced Core System functions (6 functions)

Total: 54 automation functions with live logging to Airtable
"""

import sys
import time
sys.path.append('.')

from live_automation_logger import (
    # Batch 1-4: Core automation functions
    function_log_to_crm, function_create_invoice, function_send_slack_notification,
    function_send_email_receipt, function_record_call_log, function_score_call,
    function_run_voicebot_script, function_sync_to_smartspend, function_generate_roi_snapshot,
    function_trigger_quote_pdf, function_sync_to_hubspot, function_sync_to_quickbooks,
    function_log_voice_sentiment, function_store_transcription, function_send_sms_alert,
    function_candidate_screening, function_background_checks, function_reference_verification,
    function_onboarding_automation, function_document_management, function_policy_distribution,
    function_compliance_training, function_safety_monitoring, function_incident_reporting,
    function_emergency_response, function_inventory_sync, function_stripe_payment,
    function_gpt_summary, function_calendar_booking, function_upload_to_drive,
    function_generate_compliance_pdf,
    
    # Batch 5: Lead Engine functions
    function_lead_scraper_apollo, function_lead_scraper_phantombuster, function_lead_scraper_apify,
    function_export_leads, function_scraped_leads_airtable,
    
    # Batch 6: Voice/Communication functions
    function_start_pipeline_calls, function_stop_pipeline_calls, function_initiate_voice_call_manual,
    function_voice_input_elevenlabs, function_send_sms_twilio, function_elevenlabs_voice_persona,
    
    # Batch 7: Support & Monitoring functions
    function_submit_ticket_zendesk, function_chatbot_voice_text_hybrid, function_download_logs,
    function_run_diagnostics, function_emergency_data_wipe, function_critical_escalation_alert,
    
    # Batch 8: Advanced Core System functions
    function_sales_order_processor, function_rag_knowledge_engine, function_botalytics_metrics_dashboard,
    function_mailchimp_sync, function_system_mode_toggle, function_file_uploads_rag
)

class ComprehensiveBatchTester:
    def __init__(self):
        self.batch_definitions = {
            "Batch 1-4: Core Automation": [
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
                ("Generate Compliance PDF", function_generate_compliance_pdf)
            ],
            "Batch 5: Lead Engine": [
                ("Lead Scraper Apollo", function_lead_scraper_apollo),
                ("Lead Scraper PhantomBuster", function_lead_scraper_phantombuster),
                ("Lead Scraper Apify", function_lead_scraper_apify),
                ("Export Leads", function_export_leads),
                ("Scraped Leads Airtable", function_scraped_leads_airtable)
            ],
            "Batch 6: Voice/Communication": [
                ("Start Pipeline Calls", function_start_pipeline_calls),
                ("Stop Pipeline Calls", function_stop_pipeline_calls),
                ("Initiate Voice Call Manual", function_initiate_voice_call_manual),
                ("Voice Input ElevenLabs", function_voice_input_elevenlabs),
                ("Send SMS Twilio", function_send_sms_twilio),
                ("ElevenLabs Voice Persona", function_elevenlabs_voice_persona)
            ],
            "Batch 7: Support & Monitoring": [
                ("Submit Ticket Zendesk", function_submit_ticket_zendesk),
                ("Chatbot Voice Text Hybrid", function_chatbot_voice_text_hybrid),
                ("Download Logs", function_download_logs),
                ("Run Diagnostics", function_run_diagnostics),
                ("Emergency Data Wipe", function_emergency_data_wipe),
                ("Critical Escalation Alert", function_critical_escalation_alert)
            ],
            "Batch 8: Advanced Core Systems": [
                ("Sales Order Processor", function_sales_order_processor),
                ("RAG Knowledge Engine", function_rag_knowledge_engine),
                ("Botalytics Metrics Dashboard", function_botalytics_metrics_dashboard),
                ("Mailchimp Sync", function_mailchimp_sync),
                ("System Mode Toggle", function_system_mode_toggle),
                ("File Uploads RAG", function_file_uploads_rag)
            ]
        }
        
    def test_batch(self, batch_name: str, functions: list, delay: float = 0.3):
        """Test a single batch of functions"""
        print(f"\n{'='*60}")
        print(f"TESTING {batch_name.upper()}")
        print(f"{'='*60}")
        
        passed = 0
        failed = 0
        
        for name, func in functions:
            try:
                result = func()
                if result:
                    passed += 1
                    print(f"✓ {name}")
                else:
                    failed += 1
                    print(f"✗ {name}: Function returned False")
                    
                time.sleep(delay)  # Brief pause between function calls
                
            except Exception as e:
                failed += 1
                print(f"✗ {name}: Exception - {e}")
        
        print(f"\n{batch_name} Results: {passed} passed, {failed} failed")
        return passed, failed
    
    def run_comprehensive_test(self, selected_batches: list = None):
        """Run comprehensive test of selected batches or all batches"""
        print("🚀 COMPREHENSIVE AUTOMATION TEST RUNNER")
        print("=" * 60)
        
        total_passed = 0
        total_failed = 0
        test_start = time.time()
        
        batches_to_test = selected_batches or list(self.batch_definitions.keys())
        
        for batch_name in batches_to_test:
            if batch_name in self.batch_definitions:
                functions = self.batch_definitions[batch_name]
                passed, failed = self.test_batch(batch_name, functions)
                total_passed += passed
                total_failed += failed
            else:
                print(f"Warning: Batch '{batch_name}' not found")
        
        test_duration = time.time() - test_start
        
        print(f"\n{'='*60}")
        print("FINAL RESULTS")
        print(f"{'='*60}")
        print(f"Total Functions Tested: {total_passed + total_failed}")
        print(f"Passed: {total_passed}")
        print(f"Failed: {total_failed}")
        print(f"Success Rate: {(total_passed/(total_passed + total_failed)*100):.1f}%")
        print(f"Test Duration: {test_duration:.2f} seconds")
        print(f"All executions logged to Airtable with patch system")
        
        return {
            "total_tested": total_passed + total_failed,
            "passed": total_passed,
            "failed": total_failed,
            "success_rate": total_passed/(total_passed + total_failed)*100 if (total_passed + total_failed) > 0 else 0,
            "duration": test_duration
        }

def main():
    """Main execution function"""
    tester = ComprehensiveBatchTester()
    
    # Test all batches
    results = tester.run_comprehensive_test()
    
    print(f"\n🎯 Test Summary: {results['passed']}/{results['total_tested']} functions passed")
    print(f"📊 Dashboard should show all {results['total_tested']} function executions")

if __name__ == "__main__":
    main()