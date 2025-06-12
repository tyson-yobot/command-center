// Demo Integration Test Results - Realistic failure patterns for client presentations
// This data only appears in TEST mode to demonstrate system capabilities

export const demoIntegrationResults = {
  // Batch 1: Core CRM and Invoice Functions
  batch1: [
    {
      integrationName: "function_log_to_crm",
      passFail: "✅ Pass",
      notes: "CRM logging successful - 47 records updated",
      qaOwner: "Tyson Lerfald",
      outputDataPopulated: true,
      recordCreated: true,
      retryAttempted: false,
      moduleType: "CRM",
      timestamp: new Date(Date.now() - 1800000).toISOString()
    },
    {
      integrationName: "function_create_invoice",
      passFail: "❌ Fail", 
      notes: "QuickBooks authentication timeout - requires manual re-auth",
      qaOwner: "Tyson Lerfald",
      outputDataPopulated: false,
      recordCreated: false,
      retryAttempted: true,
      moduleType: "Invoice",
      timestamp: new Date(Date.now() - 1200000).toISOString()
    },
    {
      integrationName: "function_send_slack_notification",
      passFail: "✅ Pass",
      notes: "Slack webhook delivered successfully",
      qaOwner: "Tyson Lerfald", 
      outputDataPopulated: true,
      recordCreated: true,
      retryAttempted: false,
      moduleType: "Notification",
      timestamp: new Date(Date.now() - 900000).toISOString()
    },
    {
      integrationName: "function_send_email_receipt",
      passFail: "⚠️ Warning",
      notes: "Email delivered but SMTP response time elevated (3.2s)",
      qaOwner: "Tyson Lerfald",
      outputDataPopulated: true,
      recordCreated: true,
      retryAttempted: false,
      moduleType: "Email",
      timestamp: new Date(Date.now() - 600000).toISOString()
    },
    {
      integrationName: "function_record_call_log",
      passFail: "✅ Pass",
      notes: "Call recording logged successfully - 8.5/10 satisfaction",
      qaOwner: "Tyson Lerfald",
      outputDataPopulated: true,
      recordCreated: true,
      retryAttempted: false,
      moduleType: "Voice",
      timestamp: new Date(Date.now() - 300000).toISOString()
    },
    {
      integrationName: "function_score_call",
      passFail: "❌ Fail",
      notes: "Voice sentiment analysis API rate limit exceeded",
      qaOwner: "Tyson Lerfald",
      outputDataPopulated: false,
      recordCreated: false,
      retryAttempted: true,
      moduleType: "Voice",
      timestamp: new Date(Date.now() - 1500000).toISOString()
    },
    {
      integrationName: "function_run_voicebot_script",
      passFail: "✅ Pass",
      notes: "Voicebot script executed - 23 calls processed",
      qaOwner: "Tyson Lerfald",
      outputDataPopulated: true,
      recordCreated: true,
      retryAttempted: false,
      moduleType: "Voice",
      timestamp: new Date(Date.now() - 2100000).toISOString()
    },
    {
      integrationName: "function_sync_to_smartspend",
      passFail: "⚠️ Warning",
      notes: "Sync completed but 3 records failed validation",
      qaOwner: "Tyson Lerfald",
      outputDataPopulated: true,
      recordCreated: true,
      retryAttempted: false,
      moduleType: "Finance",
      timestamp: new Date(Date.now() - 2700000).toISOString()
    },
    {
      integrationName: "function_generate_roi_snapshot",
      passFail: "✅ Pass",
      notes: "ROI report generated - $12,500 pipeline value",
      qaOwner: "Tyson Lerfald",
      outputDataPopulated: true,
      recordCreated: true,
      retryAttempted: false,
      moduleType: "Analytics",
      timestamp: new Date(Date.now() - 3300000).toISOString()
    },
    {
      integrationName: "function_trigger_quote_pdf",
      passFail: "❌ Fail",
      notes: "PDF generation service unavailable - 504 gateway timeout",
      qaOwner: "Tyson Lerfald",
      outputDataPopulated: false,
      recordCreated: false,
      retryAttempted: true,
      moduleType: "Document",
      timestamp: new Date(Date.now() - 3900000).toISOString()
    }
  ],

  // Batch 2: Advanced Integration Functions  
  batch2: [
    {
      integrationName: "function_sync_to_hubspot",
      passFail: "✅ Pass",
      notes: "HubSpot sync completed - 156 contacts updated",
      qaOwner: "Tyson Lerfald",
      outputDataPopulated: true,
      recordCreated: true,
      retryAttempted: false,
      moduleType: "CRM",
      timestamp: new Date(Date.now() - 4500000).toISOString()
    },
    {
      integrationName: "function_sync_to_quickbooks",
      passFail: "❌ Fail",
      notes: "OAuth token expired - requires manual refresh",
      qaOwner: "Tyson Lerfald",
      outputDataPopulated: false,
      recordCreated: false,
      retryAttempted: true,
      moduleType: "Finance", 
      timestamp: new Date(Date.now() - 5100000).toISOString()
    },
    {
      integrationName: "function_log_voice_sentiment",
      passFail: "⚠️ Warning",
      notes: "Partial success - 2 of 5 sentiment scores missing",
      qaOwner: "Tyson Lerfald",
      outputDataPopulated: true,
      recordCreated: true,
      retryAttempted: false,
      moduleType: "Voice",
      timestamp: new Date(Date.now() - 5700000).toISOString()
    },
    {
      integrationName: "function_store_transcription",
      passFail: "✅ Pass",
      notes: "Call transcriptions stored successfully",
      qaOwner: "Tyson Lerfald",
      outputDataPopulated: true,
      recordCreated: true,
      retryAttempted: false,
      moduleType: "Voice",
      timestamp: new Date(Date.now() - 6300000).toISOString()
    },
    {
      integrationName: "function_send_sms_alert",
      passFail: "❌ Fail",
      notes: "Twilio webhook delivery failed - carrier blocking",
      qaOwner: "Tyson Lerfald",
      outputDataPopulated: false,
      recordCreated: false,
      retryAttempted: true,
      moduleType: "SMS",
      timestamp: new Date(Date.now() - 6900000).toISOString()
    },
    {
      integrationName: "function_candidate_screening",
      passFail: "✅ Pass",
      notes: "Background check completed - 12 candidates processed",
      qaOwner: "Tyson Lerfald",
      outputDataPopulated: true,
      recordCreated: true,
      retryAttempted: false,
      moduleType: "HR",
      timestamp: new Date(Date.now() - 7500000).toISOString()
    },
    {
      integrationName: "function_background_checks",
      passFail: "⚠️ Warning",
      notes: "Background check API slow response - 8.7s average",
      qaOwner: "Tyson Lerfald",
      outputDataPopulated: true,
      recordCreated: true,
      retryAttempted: false,
      moduleType: "HR",
      timestamp: new Date(Date.now() - 8100000).toISOString()
    },
    {
      integrationName: "function_reference_verification",
      passFail: "✅ Pass",
      notes: "Reference verification completed successfully",
      qaOwner: "Tyson Lerfald",
      outputDataPopulated: true,
      recordCreated: true,
      retryAttempted: false,
      moduleType: "HR",
      timestamp: new Date(Date.now() - 8700000).toISOString()
    },
    {
      integrationName: "function_onboarding_automation",
      passFail: "❌ Fail",
      notes: "Document generation service timeout - manual intervention required",
      qaOwner: "Tyson Lerfald",
      outputDataPopulated: false,
      recordCreated: false,
      retryAttempted: true,
      moduleType: "HR",
      timestamp: new Date(Date.now() - 9300000).toISOString()
    },
    {
      integrationName: "function_document_management",
      passFail: "✅ Pass",
      notes: "Document indexing completed - 847 files processed",
      qaOwner: "Tyson Lerfald",
      outputDataPopulated: true,
      recordCreated: true,
      retryAttempted: false,
      moduleType: "Document",
      timestamp: new Date(Date.now() - 9900000).toISOString()
    },
    {
      integrationName: "function_policy_distribution",
      passFail: "⚠️ Warning",
      notes: "Policy emails sent but 12 delivery failures",
      qaOwner: "Tyson Lerfald",
      outputDataPopulated: true,
      recordCreated: true,
      retryAttempted: false,
      moduleType: "Email",
      timestamp: new Date(Date.now() - 10500000).toISOString()
    },
    {
      integrationName: "function_compliance_training",
      passFail: "✅ Pass",
      notes: "Training module deployment successful - 89% completion rate",
      qaOwner: "Tyson Lerfald",
      outputDataPopulated: true,
      recordCreated: true,
      retryAttempted: false,
      moduleType: "Training",
      timestamp: new Date(Date.now() - 11100000).toISOString()
    }
  ],

  // Summary Statistics
  summary: {
    totalTests: 22,
    passed: 13,
    failed: 5, 
    warnings: 4,
    passRate: 59.1, // Intentionally lower - shows improvement opportunity
    retryAttempts: 6,
    criticalFailures: 3,
    avgResponseTime: 2.4
  }
};