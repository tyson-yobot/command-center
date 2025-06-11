import { spawn } from 'child_process';
import path from 'path';

// Execute Python automation functions with live logging
export async function executeLiveAutomation(functionName: string): Promise<{ success: boolean, recordId?: string, error?: string }> {
  return new Promise((resolve) => {
    const pythonScript = `
import sys
sys.path.append('${process.cwd()}')
from live_automation_logger import *

# Execute the specific function
if '${functionName}' == 'log_to_crm':
    function_log_to_crm()
elif '${functionName}' == 'create_invoice':
    function_create_invoice()
elif '${functionName}' == 'send_slack_notification':
    function_send_slack_notification()
elif '${functionName}' == 'send_email_receipt':
    function_send_email_receipt()
elif '${functionName}' == 'record_call_log':
    function_record_call_log()
elif '${functionName}' == 'score_call':
    function_score_call()
elif '${functionName}' == 'run_voicebot_script':
    function_run_voicebot_script()
elif '${functionName}' == 'sync_to_smartspend':
    function_sync_to_smartspend()
elif '${functionName}' == 'generate_roi_snapshot':
    function_generate_roi_snapshot()
elif '${functionName}' == 'trigger_quote_pdf':
    function_trigger_quote_pdf()
elif '${functionName}' == 'sync_to_hubspot':
    function_sync_to_hubspot()
elif '${functionName}' == 'sync_to_quickbooks':
    function_sync_to_quickbooks()
elif '${functionName}' == 'log_voice_sentiment':
    function_log_voice_sentiment()
elif '${functionName}' == 'store_transcription':
    function_store_transcription()
elif '${functionName}' == 'send_sms_alert':
    function_send_sms_alert()
elif '${functionName}' == 'candidate_screening':
    function_candidate_screening()
elif '${functionName}' == 'background_checks':
    function_background_checks()
elif '${functionName}' == 'reference_verification':
    function_reference_verification()
elif '${functionName}' == 'onboarding_automation':
    function_onboarding_automation()
elif '${functionName}' == 'document_management':
    function_document_management()
elif '${functionName}' == 'policy_distribution':
    function_policy_distribution()
elif '${functionName}' == 'compliance_training':
    function_compliance_training()
elif '${functionName}' == 'safety_monitoring':
    function_safety_monitoring()
elif '${functionName}' == 'incident_reporting':
    function_incident_reporting()
elif '${functionName}' == 'emergency_response':
    function_emergency_response()
elif '${functionName}' == 'inventory_sync':
    function_inventory_sync()
elif '${functionName}' == 'stripe_payment':
    function_stripe_payment()
elif '${functionName}' == 'gpt_summary':
    function_gpt_summary()
elif '${functionName}' == 'calendar_booking':
    function_calendar_booking()
elif '${functionName}' == 'upload_to_drive':
    function_upload_to_drive()
elif '${functionName}' == 'generate_compliance_pdf':
    function_generate_compliance_pdf()
# Batch 9: Lead Engine Functions (32-36)
elif '${functionName}' == 'lead_scraper_apollo':
    function_lead_scraper_apollo()
elif '${functionName}' == 'lead_scraper_phantombuster':
    function_lead_scraper_phantombuster()
elif '${functionName}' == 'lead_scraper_apify':
    function_lead_scraper_apify()
elif '${functionName}' == 'export_leads':
    function_export_leads()
elif '${functionName}' == 'scraped_leads_airtable':
    function_scraped_leads_airtable()
# Batch 10: Voice/Communication + Support Functions (37-54)
elif '${functionName}' == 'start_pipeline_calls':
    function_start_pipeline_calls()
elif '${functionName}' == 'stop_pipeline_calls':
    function_stop_pipeline_calls()
elif '${functionName}' == 'initiate_voice_call_manual':
    function_initiate_voice_call_manual()
elif '${functionName}' == 'voice_input_elevenlabs':
    function_voice_input_elevenlabs()
elif '${functionName}' == 'send_sms_twilio':
    function_send_sms_twilio()
elif '${functionName}' == 'elevenlabs_voice_persona':
    function_elevenlabs_voice_persona()
elif '${functionName}' == 'submit_ticket_zendesk':
    function_submit_ticket_zendesk()
elif '${functionName}' == 'chatbot_voice_text_hybrid':
    function_chatbot_voice_text_hybrid()
elif '${functionName}' == 'download_logs':
    function_download_logs()
elif '${functionName}' == 'run_diagnostics':
    function_run_diagnostics()
elif '${functionName}' == 'emergency_data_wipe':
    function_emergency_data_wipe()
elif '${functionName}' == 'critical_escalation_alert':
    function_critical_escalation_alert()
elif '${functionName}' == 'sales_order_processor':
    function_sales_order_processor()
elif '${functionName}' == 'rag_knowledge_engine':
    function_rag_knowledge_engine()
elif '${functionName}' == 'botalytics_metrics_dashboard':
    function_botalytics_metrics_dashboard()
elif '${functionName}' == 'mailchimp_sync':
    function_mailchimp_sync()
elif '${functionName}' == 'system_mode_toggle':
    function_system_mode_toggle()
elif '${functionName}' == 'file_uploads_rag':
    function_file_uploads_rag()
elif '${functionName}' == 'webhook_automation':
    function_webhook_automation()
elif '${functionName}' == 'api_integration':
    function_api_integration()
elif '${functionName}' == 'data_sync':
    function_data_sync()
elif '${functionName}' == 'notification_system':
    function_notification_system()
elif '${functionName}' == 'backup_system':
    function_backup_system()
elif '${functionName}' == 'security_check':
    function_security_check()
elif '${functionName}' == 'performance_monitor':
    function_performance_monitor()
elif '${functionName}' == 'error_handler':
    function_error_handler()
elif '${functionName}' == 'log_aggregator':
    function_log_aggregator()
elif '${functionName}' == 'health_check':
    function_health_check()
elif '${functionName}' == 'system_cleanup':
    function_system_cleanup()
else:
    print('❌ Unknown function:', '${functionName}')
`;

    const pythonProcess = spawn('python3', ['-c', pythonScript], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        // Look for record ID in output
        const recordMatch = output.match(/🔄 LIVE LOG: .* - (rec[a-zA-Z0-9]+)/);
        const recordId = recordMatch ? recordMatch[1] : undefined;
        
        resolve({
          success: true,
          recordId
        });
      } else {
        resolve({
          success: false,
          error: error || 'Python execution failed'
        });
      }
    });
  });
}

// Available automation functions
export const AUTOMATION_FUNCTIONS = [
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
  // Batch 9: Lead Engine Functions (32-36)
  'lead_scraper_apollo',
  'lead_scraper_phantombuster',
  'lead_scraper_apify',
  'export_leads',
  'scraped_leads_airtable',
  // Batch 10: Voice/Communication + Support Functions (37-54)
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
];