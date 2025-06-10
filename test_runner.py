from integration_logger import log_integration_test_to_airtable
import traceback

from function_library import (
    function_1_airtable_connection,
    function_2_slack_notification,
    function_3_stripe_sku_sync,
    function_4_airtable_record_create,
    function_5_airtable_field_update,
    function_6_airtable_bulk_import,
    function_7_airtable_data_sync,
    function_8_airtable_webhook_handler,
    function_9_airtable_backup_create,
    function_10_airtable_schema_validation,
    function_11_slack_channel_post,
    function_12_slack_dm_send,
    function_13_slack_file_upload,
    function_14_slack_webhook,
    function_15_slack_user_lookup,
    function_16_slack_channel_create,
    function_17_slack_message_update,
    function_18_slack_reaction_add,
    function_19_slack_thread_reply,
    function_20_slack_status_update,
    function_21_stripe_payment_intent,
    function_22_stripe_subscription_create,
    function_23_stripe_invoice_generate,
    function_24_stripe_customer_create,
    function_25_stripe_webhook_handler,
    function_26_stripe_refund_process,
    function_27_stripe_price_update,
    function_28_stripe_coupon_create,
    function_29_stripe_balance_check,
    function_30_stripe_connect_account,
    function_31_qbo_invoice_create,
    function_32_qbo_customer_sync,
    function_33_qbo_payment_record,
    function_34_qbo_expense_track,
    function_35_qbo_tax_calculation,
    function_36_qbo_item_sync,
    function_37_qbo_report_generate,
    function_38_qbo_journal_entry,
    function_39_qbo_estimate_create,
    function_40_qbo_vendor_manage,
    function_41_twilio_call_initiate,
    function_42_twilio_sms_send,
    function_43_twilio_voice_record,
    function_44_twilio_conference_setup,
    function_45_twilio_webhook_handler,
    function_46_twilio_verify_phone,
    function_47_twilio_call_status,
    function_48_twilio_number_lookup,
    function_49_twilio_mms_send,
    function_50_twilio_call_forward,
    function_51_elevenlabs_voice_generate,
    function_52_elevenlabs_voice_clone,
    function_53_elevenlabs_speech_synthesis,
    function_54_elevenlabs_voice_training,
    function_55_elevenlabs_audio_stream,
    function_56_elevenlabs_voice_library,
    function_57_elevenlabs_text_to_speech,
    function_58_elevenlabs_voice_settings,
    function_59_elevenlabs_batch_process,
    function_60_elevenlabs_model_train,
    function_61_sendgrid_email_send,
    function_62_sendgrid_template_send,
    function_63_sendgrid_bulk_email,
    function_64_sendgrid_list_management,
    function_65_sendgrid_analytics,
    function_66_sendgrid_webhook_handler,
    function_67_sendgrid_suppression_manage,
    function_68_sendgrid_contact_import,
    function_69_sendgrid_campaign_create,
    function_70_sendgrid_delivery_stats,
    function_71_publer_post_schedule,
    function_72_publer_content_create,
    function_73_publer_multi_platform,
    function_74_publer_analytics_fetch,
    function_75_publer_campaign_manage,
    function_76_publer_account_connect,
    function_77_publer_media_upload,
    function_78_publer_hashtag_research,
    function_79_publer_engagement_track,
    function_80_publer_content_library,
    function_81_lead_capture_form,
    function_82_lead_qualification,
    function_83_lead_scoring,
    function_84_lead_nurture_sequence,
    function_85_lead_handoff_sales,
    function_86_lead_email_sequence,
    function_87_lead_data_enrichment,
    function_88_lead_source_tracking,
    function_89_lead_conversion_rate,
    function_90_lead_funnel_analysis,
    function_91_hubspot_contact_create,
    function_92_hubspot_deal_update,
    function_93_hubspot_email_track,
    function_94_hubspot_workflow_trigger,
    function_95_hubspot_analytics,
    function_96_hubspot_company_sync,
    function_97_hubspot_pipeline_manage,
    function_98_hubspot_task_create,
    function_99_hubspot_note_add,
    function_100_hubspot_property_update,
    function_101_pdf_generate,
    function_102_pdf_parse_extract,
    function_103_document_ocr,
    function_104_contract_analysis,
    function_105_invoice_processing,
    function_106_document_merge,
    function_107_signature_request,
    function_108_document_archive,
    function_109_template_fill,
    function_110_document_convert,
    function_111_openai_content_generate,
    function_112_openai_chat_completion,
    function_113_openai_image_analysis,
    function_114_openai_code_generation,
    function_115_openai_sentiment_analysis,
    function_116_openai_translation,
    function_117_openai_summarization,
    function_118_openai_keyword_extract,
    function_119_openai_content_optimize,
    function_120_openai_topic_modeling,
    function_121_database_create_record,
    function_122_database_update_record,
    function_123_database_delete_record,
    function_124_database_bulk_operations,
    function_125_database_backup_restore,
    function_126_database_migration,
    function_127_database_index_optimize,
    function_128_database_query_optimize,
    function_129_database_schema_update,
    function_130_database_connection_pool,
    function_131_webhook_register,
    function_132_webhook_validate,
    function_133_webhook_process,
    function_134_webhook_retry_logic,
    function_135_webhook_security,
    function_136_webhook_queue_manage,
    function_137_webhook_rate_limit,
    function_138_webhook_log_analyze,
    function_139_webhook_endpoint_test,
    function_140_webhook_signature_verify,
    function_141_calendar_event_create,
    function_142_calendar_sync,
    function_143_meeting_scheduler,
    function_144_reminder_automation,
    function_145_availability_check,
    function_146_timezone_convert,
    function_147_recurring_event,
    function_148_attendee_manage,
    function_149_room_booking,
    function_150_calendar_export,
    function_151_file_upload_handler,
    function_152_file_storage_s3,
    function_153_file_compression,
    function_154_file_format_conversion,
    function_155_file_security_scan,
    function_156_file_metadata_extract,
    function_157_file_duplicate_detect,
    function_158_file_permission_set,
    function_159_file_version_control,
    function_160_file_cleanup_old,
    function_161_analytics_data_collect,
    function_162_report_generation,
    function_163_kpi_calculation,
    function_164_dashboard_update,
    function_165_performance_monitoring,
    function_166_trend_analysis,
    function_167_forecast_model,
    function_168_anomaly_detection,
    function_169_conversion_tracking,
    function_170_cohort_analysis,
    function_171_workflow_trigger,
    function_172_workflow_condition,
    function_173_workflow_action,
    function_174_workflow_error_handler,
    function_175_workflow_completion,
    function_176_workflow_schedule,
    function_177_workflow_dependency,
    function_178_workflow_parallel,
    function_179_workflow_approval,
    function_180_workflow_notification,
    function_181_user_authentication,
    function_182_access_control,
    function_183_data_encryption,
    function_184_audit_logging,
    function_185_compliance_check,
    function_186_security_scan,
    function_187_vulnerability_assess,
    function_188_permission_audit,
    function_189_data_privacy,
    function_190_security_alert,
    function_191_api_health_check,
    function_192_endpoint_validation,
    function_193_data_integrity_check,
    function_194_performance_benchmark,
    function_195_error_simulation,
    function_196_load_testing,
    function_197_stress_testing,
    function_198_security_testing,
    function_199_regression_testing,
    function_200_integration_monitoring,
)

TEST_FUNCTIONS = [
    ("Function 1: Airtable Connection", function_1_airtable_connection),
    ("Function 2: Slack Notification", function_2_slack_notification),
    ("Function 3: Stripe SKU Sync", function_3_stripe_sku_sync),
    ("Function 4: Airtable Record Create", function_4_airtable_record_create),
    ("Function 5: Airtable Field Update", function_5_airtable_field_update),
    ("Function 6: Airtable Bulk Import", function_6_airtable_bulk_import),
    ("Function 7: Airtable Data Sync", function_7_airtable_data_sync),
    ("Function 8: Airtable Webhook Handler", function_8_airtable_webhook_handler),
    ("Function 9: Airtable Backup Create", function_9_airtable_backup_create),
    ("Function 10: Airtable Schema Validation", function_10_airtable_schema_validation),
    ("Function 11: Slack Channel Post", function_11_slack_channel_post),
    ("Function 12: Slack DM Send", function_12_slack_dm_send),
    ("Function 13: Slack File Upload", function_13_slack_file_upload),
    ("Function 14: Slack Webhook", function_14_slack_webhook),
    ("Function 15: Slack User Lookup", function_15_slack_user_lookup),
    ("Function 16: Slack Channel Create", function_16_slack_channel_create),
    ("Function 17: Slack Message Update", function_17_slack_message_update),
    ("Function 18: Slack Reaction Add", function_18_slack_reaction_add),
    ("Function 19: Slack Thread Reply", function_19_slack_thread_reply),
    ("Function 20: Slack Status Update", function_20_slack_status_update),
    ("Function 21: Stripe Payment Intent", function_21_stripe_payment_intent),
    ("Function 22: Stripe Subscription Create", function_22_stripe_subscription_create),
    ("Function 23: Stripe Invoice Generate", function_23_stripe_invoice_generate),
    ("Function 24: Stripe Customer Create", function_24_stripe_customer_create),
    ("Function 25: Stripe Webhook Handler", function_25_stripe_webhook_handler),
    ("Function 26: Stripe Refund Process", function_26_stripe_refund_process),
    ("Function 27: Stripe Price Update", function_27_stripe_price_update),
    ("Function 28: Stripe Coupon Create", function_28_stripe_coupon_create),
    ("Function 29: Stripe Balance Check", function_29_stripe_balance_check),
    ("Function 30: Stripe Connect Account", function_30_stripe_connect_account),
    ("Function 31: QuickBooks Invoice Create", function_31_qbo_invoice_create),
    ("Function 32: QuickBooks Customer Sync", function_32_qbo_customer_sync),
    ("Function 33: QuickBooks Payment Record", function_33_qbo_payment_record),
    ("Function 34: QuickBooks Expense Track", function_34_qbo_expense_track),
    ("Function 35: QuickBooks Tax Calculation", function_35_qbo_tax_calculation),
    ("Function 36: QuickBooks Item Sync", function_36_qbo_item_sync),
    ("Function 37: QuickBooks Report Generate", function_37_qbo_report_generate),
    ("Function 38: QuickBooks Journal Entry", function_38_qbo_journal_entry),
    ("Function 39: QuickBooks Estimate Create", function_39_qbo_estimate_create),
    ("Function 40: QuickBooks Vendor Manage", function_40_qbo_vendor_manage),
    ("Function 41: Twilio Call Initiate", function_41_twilio_call_initiate),
    ("Function 42: Twilio SMS Send", function_42_twilio_sms_send),
    ("Function 43: Twilio Voice Record", function_43_twilio_voice_record),
    ("Function 44: Twilio Conference Setup", function_44_twilio_conference_setup),
    ("Function 45: Twilio Webhook Handler", function_45_twilio_webhook_handler),
    ("Function 46: Twilio Verify Phone", function_46_twilio_verify_phone),
    ("Function 47: Twilio Call Status", function_47_twilio_call_status),
    ("Function 48: Twilio Number Lookup", function_48_twilio_number_lookup),
    ("Function 49: Twilio MMS Send", function_49_twilio_mms_send),
    ("Function 50: Twilio Call Forward", function_50_twilio_call_forward),
    ("Function 51: ElevenLabs Voice Generate", function_51_elevenlabs_voice_generate),
    ("Function 52: ElevenLabs Voice Clone", function_52_elevenlabs_voice_clone),
    ("Function 53: ElevenLabs Speech Synthesis", function_53_elevenlabs_speech_synthesis),
    ("Function 54: ElevenLabs Voice Training", function_54_elevenlabs_voice_training),
    ("Function 55: ElevenLabs Audio Stream", function_55_elevenlabs_audio_stream),
    ("Function 56: ElevenLabs Voice Library", function_56_elevenlabs_voice_library),
    ("Function 57: ElevenLabs Text to Speech", function_57_elevenlabs_text_to_speech),
    ("Function 58: ElevenLabs Voice Settings", function_58_elevenlabs_voice_settings),
    ("Function 59: ElevenLabs Batch Process", function_59_elevenlabs_batch_process),
    ("Function 60: ElevenLabs Model Train", function_60_elevenlabs_model_train),
    ("Function 61: SendGrid Email Send", function_61_sendgrid_email_send),
    ("Function 62: SendGrid Template Send", function_62_sendgrid_template_send),
    ("Function 63: SendGrid Bulk Email", function_63_sendgrid_bulk_email),
    ("Function 64: SendGrid List Management", function_64_sendgrid_list_management),
    ("Function 65: SendGrid Analytics", function_65_sendgrid_analytics),
    ("Function 66: SendGrid Webhook Handler", function_66_sendgrid_webhook_handler),
    ("Function 67: SendGrid Suppression Manage", function_67_sendgrid_suppression_manage),
    ("Function 68: SendGrid Contact Import", function_68_sendgrid_contact_import),
    ("Function 69: SendGrid Campaign Create", function_69_sendgrid_campaign_create),
    ("Function 70: SendGrid Delivery Stats", function_70_sendgrid_delivery_stats),
    ("Function 71: Publer Post Schedule", function_71_publer_post_schedule),
    ("Function 72: Publer Content Create", function_72_publer_content_create),
    ("Function 73: Publer Multi Platform", function_73_publer_multi_platform),
    ("Function 74: Publer Analytics Fetch", function_74_publer_analytics_fetch),
    ("Function 75: Publer Campaign Manage", function_75_publer_campaign_manage),
    ("Function 76: Publer Account Connect", function_76_publer_account_connect),
    ("Function 77: Publer Media Upload", function_77_publer_media_upload),
    ("Function 78: Publer Hashtag Research", function_78_publer_hashtag_research),
    ("Function 79: Publer Engagement Track", function_79_publer_engagement_track),
    ("Function 80: Publer Content Library", function_80_publer_content_library),
    ("Function 81: Lead Capture Form", function_81_lead_capture_form),
    ("Function 82: Lead Qualification", function_82_lead_qualification),
    ("Function 83: Lead Scoring", function_83_lead_scoring),
    ("Function 84: Lead Nurture Sequence", function_84_lead_nurture_sequence),
    ("Function 85: Lead Handoff Sales", function_85_lead_handoff_sales),
    ("Function 86: Lead Email Sequence", function_86_lead_email_sequence),
    ("Function 87: Lead Data Enrichment", function_87_lead_data_enrichment),
    ("Function 88: Lead Source Tracking", function_88_lead_source_tracking),
    ("Function 89: Lead Conversion Rate", function_89_lead_conversion_rate),
    ("Function 90: Lead Funnel Analysis", function_90_lead_funnel_analysis),
    ("Function 91: HubSpot Contact Create", function_91_hubspot_contact_create),
    ("Function 92: HubSpot Deal Update", function_92_hubspot_deal_update),
    ("Function 93: HubSpot Email Track", function_93_hubspot_email_track),
    ("Function 94: HubSpot Workflow Trigger", function_94_hubspot_workflow_trigger),
    ("Function 95: HubSpot Analytics", function_95_hubspot_analytics),
    ("Function 96: HubSpot Company Sync", function_96_hubspot_company_sync),
    ("Function 97: HubSpot Pipeline Manage", function_97_hubspot_pipeline_manage),
    ("Function 98: HubSpot Task Create", function_98_hubspot_task_create),
    ("Function 99: HubSpot Note Add", function_99_hubspot_note_add),
    ("Function 100: HubSpot Property Update", function_100_hubspot_property_update),
    ("Function 101: PDF Generate", function_101_pdf_generate),
    ("Function 102: PDF Parse Extract", function_102_pdf_parse_extract),
    ("Function 103: Document OCR", function_103_document_ocr),
    ("Function 104: Contract Analysis", function_104_contract_analysis),
    ("Function 105: Invoice Processing", function_105_invoice_processing),
    ("Function 106: Document Merge", function_106_document_merge),
    ("Function 107: Signature Request", function_107_signature_request),
    ("Function 108: Document Archive", function_108_document_archive),
    ("Function 109: Template Fill", function_109_template_fill),
    ("Function 110: Document Convert", function_110_document_convert),
    ("Function 111: OpenAI Content Generate", function_111_openai_content_generate),
    ("Function 112: OpenAI Chat Completion", function_112_openai_chat_completion),
    ("Function 113: OpenAI Image Analysis", function_113_openai_image_analysis),
    ("Function 114: OpenAI Code Generation", function_114_openai_code_generation),
    ("Function 115: OpenAI Sentiment Analysis", function_115_openai_sentiment_analysis),
    ("Function 116: OpenAI Translation", function_116_openai_translation),
    ("Function 117: OpenAI Summarization", function_117_openai_summarization),
    ("Function 118: OpenAI Keyword Extract", function_118_openai_keyword_extract),
    ("Function 119: OpenAI Content Optimize", function_119_openai_content_optimize),
    ("Function 120: OpenAI Topic Modeling", function_120_openai_topic_modeling),
    ("Function 121: Database Create Record", function_121_database_create_record),
    ("Function 122: Database Update Record", function_122_database_update_record),
    ("Function 123: Database Delete Record", function_123_database_delete_record),
    ("Function 124: Database Bulk Operations", function_124_database_bulk_operations),
    ("Function 125: Database Backup Restore", function_125_database_backup_restore),
    ("Function 126: Database Migration", function_126_database_migration),
    ("Function 127: Database Index Optimize", function_127_database_index_optimize),
    ("Function 128: Database Query Optimize", function_128_database_query_optimize),
    ("Function 129: Database Schema Update", function_129_database_schema_update),
    ("Function 130: Database Connection Pool", function_130_database_connection_pool),
    ("Function 131: Webhook Register", function_131_webhook_register),
    ("Function 132: Webhook Validate", function_132_webhook_validate),
    ("Function 133: Webhook Process", function_133_webhook_process),
    ("Function 134: Webhook Retry Logic", function_134_webhook_retry_logic),
    ("Function 135: Webhook Security", function_135_webhook_security),
    ("Function 136: Webhook Queue Manage", function_136_webhook_queue_manage),
    ("Function 137: Webhook Rate Limit", function_137_webhook_rate_limit),
    ("Function 138: Webhook Log Analyze", function_138_webhook_log_analyze),
    ("Function 139: Webhook Endpoint Test", function_139_webhook_endpoint_test),
    ("Function 140: Webhook Signature Verify", function_140_webhook_signature_verify),
    ("Function 141: Calendar Event Create", function_141_calendar_event_create),
    ("Function 142: Calendar Sync", function_142_calendar_sync),
    ("Function 143: Meeting Scheduler", function_143_meeting_scheduler),
    ("Function 144: Reminder Automation", function_144_reminder_automation),
    ("Function 145: Availability Check", function_145_availability_check),
    ("Function 146: Timezone Convert", function_146_timezone_convert),
    ("Function 147: Recurring Event", function_147_recurring_event),
    ("Function 148: Attendee Manage", function_148_attendee_manage),
    ("Function 149: Room Booking", function_149_room_booking),
    ("Function 150: Calendar Export", function_150_calendar_export),
    ("Function 151: File Upload Handler", function_151_file_upload_handler),
    ("Function 152: File Storage S3", function_152_file_storage_s3),
    ("Function 153: File Compression", function_153_file_compression),
    ("Function 154: File Format Conversion", function_154_file_format_conversion),
    ("Function 155: File Security Scan", function_155_file_security_scan),
    ("Function 156: File Metadata Extract", function_156_file_metadata_extract),
    ("Function 157: File Duplicate Detect", function_157_file_duplicate_detect),
    ("Function 158: File Permission Set", function_158_file_permission_set),
    ("Function 159: File Version Control", function_159_file_version_control),
    ("Function 160: File Cleanup Old", function_160_file_cleanup_old),
    ("Function 161: Analytics Data Collect", function_161_analytics_data_collect),
    ("Function 162: Report Generation", function_162_report_generation),
    ("Function 163: KPI Calculation", function_163_kpi_calculation),
    ("Function 164: Dashboard Update", function_164_dashboard_update),
    ("Function 165: Performance Monitoring", function_165_performance_monitoring),
    ("Function 166: Trend Analysis", function_166_trend_analysis),
    ("Function 167: Forecast Model", function_167_forecast_model),
    ("Function 168: Anomaly Detection", function_168_anomaly_detection),
    ("Function 169: Conversion Tracking", function_169_conversion_tracking),
    ("Function 170: Cohort Analysis", function_170_cohort_analysis),
    ("Function 171: Workflow Trigger", function_171_workflow_trigger),
    ("Function 172: Workflow Condition", function_172_workflow_condition),
    ("Function 173: Workflow Action", function_173_workflow_action),
    ("Function 174: Workflow Error Handler", function_174_workflow_error_handler),
    ("Function 175: Workflow Completion", function_175_workflow_completion),
    ("Function 176: Workflow Schedule", function_176_workflow_schedule),
    ("Function 177: Workflow Dependency", function_177_workflow_dependency),
    ("Function 178: Workflow Parallel", function_178_workflow_parallel),
    ("Function 179: Workflow Approval", function_179_workflow_approval),
    ("Function 180: Workflow Notification", function_180_workflow_notification),
    ("Function 181: User Authentication", function_181_user_authentication),
    ("Function 182: Access Control", function_182_access_control),
    ("Function 183: Data Encryption", function_183_data_encryption),
    ("Function 184: Audit Logging", function_184_audit_logging),
    ("Function 185: Compliance Check", function_185_compliance_check),
    ("Function 186: Security Scan", function_186_security_scan),
    ("Function 187: Vulnerability Assess", function_187_vulnerability_assess),
    ("Function 188: Permission Audit", function_188_permission_audit),
    ("Function 189: Data Privacy", function_189_data_privacy),
    ("Function 190: Security Alert", function_190_security_alert),
    ("Function 191: API Health Check", function_191_api_health_check),
    ("Function 192: Endpoint Validation", function_192_endpoint_validation),
    ("Function 193: Data Integrity Check", function_193_data_integrity_check),
    ("Function 194: Performance Benchmark", function_194_performance_benchmark),
    ("Function 195: Error Simulation", function_195_error_simulation),
    ("Function 196: Load Testing", function_196_load_testing),
    ("Function 197: Stress Testing", function_197_stress_testing),
    ("Function 198: Security Testing", function_198_security_testing),
    ("Function 199: Regression Testing", function_199_regression_testing),
    ("Function 200: Integration Monitoring", function_200_integration_monitoring),
]

for name, fn in TEST_FUNCTIONS:
    try:
        result = fn()
        log_integration_test_to_airtable(
            integration_name=name,
            passed=True,
            notes="Function ran successfully"
        )
    except Exception as e:
        log_integration_test_to_airtable(
            integration_name=name,
            passed=False,
            notes=traceback.format_exc()
        )

class YoBotTestRunner:
    def __init__(self):
        self.logger = IntegrationLogger()
        self.results = {
            'passed': 0,
            'failed': 0,
            'total': 0,
            'errors': []
        }
    
    async def run_function_test(self, func):
        """Run a single function test and log results"""
        function_name = func.__name__
        test_start_time = datetime.now()
        
        try:
            print(f"Testing {function_name}...")
            
            # Execute the function
            if asyncio.iscoroutinefunction(func):
                result = await func()
            else:
                result = func()
            
            # Log success
            await self.logger.log_test_result(
                integration_name=function_name,
                pass_fail="✅",
                notes=f"Function executed successfully. Result: {str(result)[:200]}",
                test_date=test_start_time.isoformat(),
                qa_owner="YoBot_Test_Runner",
                output_data_populated=True,
                record_created=bool(result),
                retry_attempted=False,
                module_type=self._get_module_type(function_name),
                related_scenario_link=f"https://yobot.automation/{function_name}"
            )
            
            self.results['passed'] += 1
            print(f"✅ {function_name} - PASSED")
            return True
            
        except Exception as e:
            error_details = traceback.format_exc()
            
            # Log failure
            await self.logger.log_test_result(
                integration_name=function_name,
                pass_fail="❌",
                notes=f"Error: {str(e)}\n\nTraceback:\n{error_details}",
                test_date=test_start_time.isoformat(),
                qa_owner="YoBot_Test_Runner",
                output_data_populated=False,
                record_created=False,
                retry_attempted=True,
                module_type=self._get_module_type(function_name),
                related_scenario_link=f"https://yobot.automation/{function_name}"
            )
            
            self.results['failed'] += 1
            self.results['errors'].append({
                'function': function_name,
                'error': str(e),
                'traceback': error_details
            })
            print(f"❌ {function_name} - FAILED: {str(e)}")
            return False
    
    def _get_module_type(self, function_name):
        """Determine module type based on function name"""
        if 'airtable' in function_name.lower():
            return 'Airtable Integration'
        elif 'slack' in function_name.lower():
            return 'Slack Integration'
        elif 'stripe' in function_name.lower():
            return 'Payment Processing'
        elif 'qbo' in function_name.lower() or 'quickbooks' in function_name.lower():
            return 'QuickBooks Integration'
        elif 'twilio' in function_name.lower():
            return 'Voice/SMS Communication'
        elif 'elevenlabs' in function_name.lower():
            return 'AI Voice Generation'
        elif 'sendgrid' in function_name.lower() or 'email' in function_name.lower():
            return 'Email Automation'
        elif 'publer' in function_name.lower() or 'social' in function_name.lower():
            return 'Social Media'
        elif 'lead' in function_name.lower():
            return 'Lead Management'
        elif 'hubspot' in function_name.lower() or 'crm' in function_name.lower():
            return 'CRM Integration'
        elif 'pdf' in function_name.lower() or 'document' in function_name.lower():
            return 'Document Processing'
        elif 'openai' in function_name.lower() or 'ai' in function_name.lower():
            return 'AI Content Generation'
        elif 'database' in function_name.lower():
            return 'Database Operations'
        elif 'webhook' in function_name.lower():
            return 'Webhook Management'
        elif 'calendar' in function_name.lower():
            return 'Calendar Integration'
        elif 'file' in function_name.lower():
            return 'File Management'
        elif 'analytics' in function_name.lower() or 'report' in function_name.lower():
            return 'Analytics & Reporting'
        elif 'workflow' in function_name.lower():
            return 'Automation Workflow'
        elif 'security' in function_name.lower() or 'auth' in function_name.lower():
            return 'Security & Compliance'
        else:
            return 'General Automation'
    
    async def run_all_tests(self):
        """Run all registered function tests"""
        print("🚀 Starting YoBot Master Test Runner")
        print(f"📊 Total functions to test: {len(TEST_FUNCTIONS)}")
        print("=" * 50)
        
        self.results['total'] = len(TEST_FUNCTIONS)
        
        for func in TEST_FUNCTIONS:
            await self.run_function_test(func)
            # Small delay between tests to avoid rate limiting
            await asyncio.sleep(0.5)
        
        # Generate summary report
        await self._generate_summary_report()
    
    async def _generate_summary_report(self):
        """Generate and log final test summary"""
        print("\n" + "=" * 50)
        print("📋 YoBot Test Runner Summary")
        print("=" * 50)
        print(f"✅ Passed: {self.results['passed']}")
        print(f"❌ Failed: {self.results['failed']}")
        print(f"📊 Total: {self.results['total']}")
        print(f"📈 Success Rate: {(self.results['passed'] / self.results['total'] * 100):.1f}%")
        
        if self.results['errors']:
            print("\n🚨 Failed Functions:")
            for error in self.results['errors']:
                print(f"  - {error['function']}: {error['error']}")
        
        # Log summary to Airtable
        await self.logger.log_test_result(
            integration_name="MASTER_TEST_SUMMARY",
            pass_fail="✅" if self.results['failed'] == 0 else "❌",
            notes=f"Test Run Complete. Passed: {self.results['passed']}, Failed: {self.results['failed']}, Total: {self.results['total']}",
            test_date=datetime.now().isoformat(),
            qa_owner="YoBot_Test_Runner",
            output_data_populated=True,
            record_created=True,
            retry_attempted=False,
            module_type="Test Summary",
            related_scenario_link="https://yobot.automation/master-test-summary"
        )

async def main():
    """Main entry point for test runner"""
    runner = YoBotTestRunner()
    await runner.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())