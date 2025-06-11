from integration_logger import log_integration_test_to_airtable
from function_library import *
import traceback

TEST_FUNCTIONS = [
    ("Log To CRM", function_log_to_crm),
    ("Create Invoice", function_create_invoice),
    ("Send Slack Notification", function_send_slack_notification),
    ("Send Email Receipt", function_send_email_receipt),
    ("Record Call Log", function_record_call_log),
    ("Score Call", function_score_call),
    ("Run Voicebot Script", function_run_voicebot_script),
    ("Sync To Smartspend", function_sync_to_smartspend),
    ("Generate ROI Snapshot", function_generate_roi_snapshot),
    ("Trigger Quote PDF", function_trigger_quote_pdf),
    ("Sync To HubSpot", function_sync_to_hubspot),
    ("Sync To QuickBooks", function_sync_to_quickbooks),
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
]

print("🚀 Starting automation function tests...")
print("=" * 60)

success_count = 0
failure_count = 0

for name, fn in TEST_FUNCTIONS:
    try:
        print(f"🔄 Testing: {name}")
        result = fn()
        log_integration_test_to_airtable(
            integration_name=name,
            passed=True,
            notes="Function ran successfully"
        )
        success_count += 1
        print(f"✅ {name} - SUCCESS")
    except Exception as e:
        log_integration_test_to_airtable(
            integration_name=name,
            passed=False,
            notes=traceback.format_exc()
        )
        failure_count += 1
        print(f"❌ {name} - FAILED: {str(e)}")
    print("-" * 40)

print("=" * 60)
print(f"📊 FINAL RESULTS:")
print(f"✅ Successful: {success_count}")
print(f"❌ Failed: {failure_count}")
print(f"📈 Success Rate: {(success_count/(success_count+failure_count)*100):.1f}%")
print("🏁 Test run completed")