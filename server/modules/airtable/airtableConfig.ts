// Comprehensive Airtable Configuration for YoBot System
export const AIRTABLE_BASES = {
  // YoBot Command Center (Live Ops)
  COMMAND_CENTER: {
    baseId: 'appCoAtCZdARb4AM2',
    tables: {
      METRICS_TRACKER: 'Command Center - Metrics Tracker Table',
      INTEGRATION_QA_TRACKER: 'Integration QA Tracker Table', 
      INTEGRATION_TEST_LOG: 'Integration Test Log Table',
      COMPLETED_INTEGRATION_QA: 'Completed Integration QA Table',
      CLIENT_INSTANCES: 'Client Instances Table',
      LEADS_INTAKE: 'Leads - Intake Table',
      INDUSTRY_TEMPLATES: 'Industry Templates Table',
      CLIENT_INTAKE: 'Client Intake Table'
    }
  },

  // YoBot Ops & Alerts Log
  OPS_ALERTS: {
    baseId: 'appCoAtCZdARb4A4F',
    tables: {
      SMARTSPEND_SLACK_LOGS: 'SmartSpend - Slack Logs Table',
      ERROR_FALLBACK_LOG: 'Error + Fallback Log Table',
      EVENT_SYNC_LOG: 'Event Sync Log Table',
      SUPPORT_TICKET_LOG: 'Support Ticket Log Table'
    }
  },

  // YoBot Client CRM
  CLIENT_CRM: {
    baseId: 'appMbVQJ0n3nWR11N',
    tables: {
      CLIENT_BOOKINGS: 'Client Bookings Table',
      TEAM_MEMBERS: 'Team Members Table',
      DEAL_MILESTONES: 'Deal Milestones Table',
      QUOTE_GENERATOR_LOGS: 'Quote Generator Logs Table',
      CRM_CONTACTS: 'CRM Contacts Table',
      REP_ASSIGNMENT_TRACKER: 'Rep Assignment Tracker Table',
      INVOICE_TRACKING: 'Invoice Tracking Table',
      SUPPORT_TICKET_SUMMARY: 'Support Ticket Summary Table'
    }
  },

  // YoBot Sales & Automation
  SALES_AUTOMATION: {
    baseId: 'appe05t1B1tn1Kn5',
    tables: {
      SALES_ORDERS: 'Sales Orders Table',
      BOT_PACKAGES: 'Bot Packages Table',
      ADDON_MODULES: 'Add-On Modules Table',
      QA_CALL_REVIEW: 'QA Call Review Table',
      CALL_RECORDING_TRACKER: 'Call Recording Tracker Table',
      NLP_KEYWORD_TRACKER: 'NLP Keyword Tracker Table',
      CALL_SENTIMENT_LOG: 'Call Sentiment Log Table',
      ESCALATION_TRACKER: 'Escalation Tracker Table',
      CLIENT_TOUCHPOINT_LOG: 'Client Touchpoint Log Table',
      MISSED_CALL_LOG: 'Missed Call Log Table',
      AB_TEST_LOG: 'A/B Test Log Table',
      SLACK_ALERTS_LOG: 'Slack Alerts Log Table',
      INTEGRATION_SYNC_TRACKER: 'Integration Sync Tracker Table',
      PERSONALITY_PACK_TRACKER: 'Personality Pack Tracker Table',
      VOICEBOT_PERFORMANCE_DASHBOARD: 'Voicebot Performance Dashboard Log Table',
      FALLBACK_LOG: 'Fallback Log Table',
      BOT_HEALTH_MONITOR: 'Bot Health Monitor Table',
      REVENUE_FORECAST_LOG: 'Revenue Forecast Log Table',
      CLIENT_PULSE_TRACKER: 'Client Pulse Tracker Table',
      OPS_METRICS_LOG: 'Ops Metrics Log Table',
      CLIENT_TIER_VIEW: 'Client Tier View Table',
      COMMAND_CENTER_WIRING_TRACKER: 'Command Center Wiring Tracker Table',
      CONTRACT_STATUS_TRACKER: 'Contract Status Tracker Table',
      CRM_VOICE_AUDIT_LOG: 'CRM + Voice Audit Log Table',
      SUGGESTIONS_PUSH_LOG: 'Suggestions Push Log Table',
      MANUAL_REVIEW_QUEUE: 'Manual Review Queue Table',
      FOLLOWUP_SCHEDULER_LOG: 'Follow-Up Scheduler Log Table',
      SUPPORT_METRICS_ROLLUP: 'Support Metrics Rollup Table',
      SUPPORT_SETTINGS: 'Support Settings Table',
      INTERNAL_CONFIG: 'Internal Config Table',
      STRIPE_PRICE_TRACKER: 'Stripe Price Tracker (Live) Table',
      STRIPE_PRODUCTS: 'Stripe Products Table',
      COMPLIANCE_CHECKLIST_LOG: 'Compliance Checklist Log Table',
      AIRTABLE_SCHEMA_DOCUMENTATION: 'Airtable Schema Documentation Table',
      TONE_RESPONSE_VARIANT_LIBRARY: 'Tone Response Variant Library Table'
    }
  },

  // YoBot ROI Calculator
  ROI_CALCULATOR: {
    baseId: 'appbFDTqB2WtRNV1H',
    tables: {
      CLIENT_ROI_RESULTS: 'Client ROI Results Table',
      BOTALYTICS_ROI: 'Botalytics - ROI'
    }
  },

  // YoBot SmartSpend Tracker
  SMARTSPEND_TRACKER: {
    baseId: 'appGtcRZUd0JqnkQS',
    tables: {
      SMARTSPEND_MASTER: 'SmartSpend Master Table',
      BUDGET_ROI_TRACKER: 'SmartSpend - Budget & ROI Tracker Table',
      INTAKE_SUBMISSIONS: 'SmartSpend Intake Submissions Table',
      IMPORTED_TABLE: 'Imported Table',
      DASHBOARD_INTAKE_VISUAL: 'Dashboard Intake Visual Table'
    }
  }
};

// Helper function to get Airtable URL
export function getAirtableUrl(baseKey: string, tableKey: string): string {
  const bases = AIRTABLE_BASES as any;
  const base = bases[baseKey];
  if (!base) throw new Error(`Base ${baseKey} not found`);
  
  const tableName = base.tables[tableKey];
  if (!tableName) throw new Error(`Table ${tableKey} not found in base ${baseKey}`);
  
  return `https://api.airtable.com/v0/${base.baseId}/${encodeURIComponent(tableName)}`;
}

// Helper function to get base ID
export function getBaseId(baseKey: string): string {
  const bases = AIRTABLE_BASES as any;
  const base = bases[baseKey];
  if (!base) throw new Error(`Base ${baseKey} not found`);
  return base.baseId;
}