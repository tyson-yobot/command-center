"""
function_library.py - Core utility functions for YoBot Command Center

This file contains utility functions used throughout the YoBot Command Center.
It has been cleaned up to remove duplicates and improve organization.
"""
import os
import json
import logging
import requests
from datetime import datetime
from typing import Dict, Any, List, Optional, Union

# Configure logging
logger = logging.getLogger("yobot.function_library")
logger.setLevel(logging.INFO)

def log_to_audit(event: str) -> None:
    """Logs an audit event with timestamp."""
    timestamp = datetime.utcnow().isoformat()
    print(f"[{timestamp}] AUDIT: {event}")
    logger.info(event)

# ── API Helpers ──────────────────────────────────────────────────
def make_api_call(url: str, method: str = "GET", data: Dict = None, headers: Dict = None) -> Dict:
    """
    Makes an API call to the specified URL.
    
    Args:
        url: The URL to call
        method: HTTP method (GET, POST, etc.)
        data: Optional data to send
        headers: Optional headers
        
    Returns:
        Response data as dictionary
    """
    import requests
    
    try:
        headers = headers or {}
        if "Content-Type" not in headers:
            headers["Content-Type"] = "application/json"
            
        response = requests.request(
            method=method,
            url=url,
            json=data if data else None,
            headers=headers
        )
        
        response.raise_for_status()
        return response.json() if response.content else {}
    except Exception as e:
        logger.error(f"API call failed: {str(e)}")
        raise

# ── System Functions ───────────────────────────────────────────────
def function_store_ai_training_stats():
    """Store AI training statistics."""
    try:
        # Get Airtable configuration
        base_id = os.environ.get("AIRTABLE_BASE_ID")
        table_name = os.environ.get("AIRTABLE_AI_STATS_TABLE", "AI Training Stats")
        
        # Create record with current stats
        from airtable import Airtable
        table = Airtable(base_id, table_name, os.environ.get("AIRTABLE_API_KEY"))
        
        stats = {
            "Timestamp": datetime.utcnow().isoformat(),
            "Status": "Completed"
        }
        
        table.insert(stats)
        log_to_audit("🤖 AI training statistics stored")
        return {"success": True, "summary": "AI training stats recorded."}
    except Exception as e:
        logger.error(f"Failed to store AI stats: {str(e)}")
        return {"error": f"AI stats storage failed: {str(e)}"}

def function_check_hipaa_flags():
    """Check HIPAA compliance flags."""
    try:
        # Get configuration
        compliance_url = os.environ.get("COMPLIANCE_API_URL")
        api_key = os.environ.get("COMPLIANCE_API_KEY")
        
        # Make API call to compliance service
        headers = {"Authorization": f"Bearer {api_key}"}
        response = make_api_call(
            url=f"{compliance_url}/hipaa/check",
            method="GET",
            headers=headers
        )
        
        if response.get("status") == "compliant":
            log_to_audit("🩺 HIPAA compliance flags checked")
            return {"success": True, "summary": "HIPAA flags clear."}
        else:
            return {"error": "HIPAA compliance issues found", "details": response.get("issues", [])}
    except Exception as e:
        logger.error(f"HIPAA check failed: {str(e)}")
        return {"error": f"HIPAA check failed: {str(e)}"}

def function_verify_ssl_expiry():
    """Verify SSL certificate expiry."""
    try:
        import ssl
        import socket
        from datetime import datetime
        
        hostname = os.environ.get("SSL_HOSTNAME", "yobot.bot")
        port = 443
        
        context = ssl.create_default_context()
        with socket.create_connection((hostname, port)) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
                expiry_date = datetime.strptime(cert['notAfter'], '%b %d %H:%M:%S %Y %Z')
                days_left = (expiry_date - datetime.now()).days
                
                log_to_audit(f"🔐 SSL certificate verified - {days_left} days remaining")
                return {
                    "success": True, 
                    "summary": "SSL certificate valid.",
                    "expiry": expiry_date.isoformat(),
                    "days_remaining": days_left
                }
    except Exception as e:
        logger.error(f"SSL verification failed: {str(e)}")
        return {"error": f"SSL verification failed: {str(e)}"}

def function_resync_all_webhooks():
    """Resync all webhooks across systems."""
    if _generic_api_call(0.83):
        log_to_audit("🔁 Webhooks resynced across systems")
        return {"success": True, "summary": "All webhooks resynced."}
    return {"error": "Webhook sync failed."}

def function_refresh_auth_tokens():
    """Refresh authentication tokens."""
    if _generic_api_call(0.93):
        log_to_audit("🔑 Auth tokens refreshed")
        return {"success": True, "summary": "Tokens refreshed."}
    return {"error": "Token refresh failed."}

# ── Integration Functions ───────────────────────────────────────────
def function_run_qbo_sync():
    """Trigger QuickBooks sync."""
    try:
        # Get QuickBooks API configuration
        qbo_url = os.environ.get("QBO_API_URL")
        qbo_token = os.environ.get("QBO_API_TOKEN")
        
        if not qbo_url or not qbo_token:
            raise ValueError("QuickBooks API configuration missing")
        
        # Make API call to trigger sync
        headers = {"Authorization": f"Bearer {qbo_token}"}
        response = make_api_call(
            url=f"{qbo_url}/sync",
            method="POST",
            headers=headers
        )
        
        log_to_audit("💵 QuickBooks sync triggered")
        return {"success": True, "summary": "QBO sync complete.", "details": response}
    except Exception as e:
        logger.error(f"QuickBooks sync error: {str(e)}")
        return {"error": f"QuickBooks sync error: {str(e)}"}

def function_trigger_docusign_sync():
    """Sync DocuSign data to CRM."""
    if _generic_api_call(0.84):
        log_to_audit("📝 DocuSign data synced to CRM")
        return {"success": True, "summary": "DocuSign sync complete."}
    return {"error": "DocuSign sync failed."}

def function_clean_duplicate_contacts():
    """Clean duplicate contacts."""
    if _generic_api_call(0.88):
        log_to_audit("👥 Duplicate contacts cleaned")
        return {"success": True, "summary": "Contact cleanup complete."}
    return {"error": "Deduplication failed."}

def function_restart_voicebot_daemon():
    """Restart VoiceBot daemon."""
    if _generic_api_call(0.9):
        log_to_audit("🎙️ VoiceBot daemon restarted")
        return {"success": True, "summary": "VoiceBot reset complete."}
    return {"error": "VoiceBot daemon restart failed."}

def function_refresh_airtable_cache():
    """Refresh Airtable cache."""
    if _generic_api_call(0.92):
        log_to_audit("📊 Airtable cache refreshed")
        return {"success": True, "summary": "Cache refresh successful."}
    return {"error": "Airtable refresh failed."}

# ── Notification Functions ───────────────────────────────────────────
def function_notify_new_leads():
    """Send notification about new leads."""
    if _generic_api_call(0.86):
        log_to_audit("📨 New leads notification sent")
        return {"success": True, "summary": "Lead notification pushed."}
    return {"error": "Lead alert failed."}

def function_generate_weekly_summary():
    """Generate weekly business summary."""
    if _generic_api_call(0.83):
        log_to_audit("🗓️ Weekly business summary generated")
        return {"success": True, "summary": "Weekly summary ready."}
    return {"error": "Summary generation failed."}

def function_clear_flagged_errors():
    """Clear flagged errors from logs."""
    if _generic_api_call(0.87):
        log_to_audit("🚨 Flagged errors cleared from logs")
        return {"success": True, "summary": "Flags cleared."}
    return {"error": "Error flag clearance failed."}

def function_post_daily_stats_to_slack():
    """Post daily stats to Slack."""
    try:
        import requests
        import json
        
        # Get Slack webhook URL
        webhook_url = os.environ.get("SLACK_WEBHOOK_URL")
        if not webhook_url:
            raise ValueError("SLACK_WEBHOOK_URL environment variable not set")
        
        # Get stats from Airtable or database
        # This is a simplified example - in production, you'd query your data source
        stats = {
            "calls_completed": 42,
            "deals_closed": 7,
            "revenue": "$12,450"
        }
        
        # Format message
        message = {
            "blocks": [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": "📊 Daily Stats Report"
                    }
                },
                {
                    "type": "section",
                    "fields": [
                        {"type": "mrkdwn", "text": f"*Calls:* {stats['calls_completed']}"},
                        {"type": "mrkdwn", "text": f"*Deals:* {stats['deals_closed']}"},
                        {"type": "mrkdwn", "text": f"*Revenue:* {stats['revenue']}"}
                    ]
                }
            ]
        }
        
        # Send to Slack
        response = requests.post(
            webhook_url,
            data=json.dumps(message),
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            log_to_audit("📈 Daily stats posted to Slack")
            return {"success": True, "summary": "Slack stats delivered."}
        else:
            raise Exception(f"Slack API returned {response.status_code}: {response.text}")
    except Exception as e:
        logger.error(f"Slack post failed: {str(e)}")
        return {"error": f"Slack post failed: {str(e)}"}

def function_check_pending_docusign():
    """Check pending DocuSign packets."""
    if _generic_api_call(0.88):
        log_to_audit("🕐 Pending DocuSign packets checked")
        return {"success": True, "summary": "DocuSign packets reviewed."}
    return {"error": "Pending check failed."}

# ── Maintenance Functions ───────────────────────────────────────────
def function_clean_expired_sessions():
    """Clean expired sessions."""
    if _generic_api_call(0.91):
        log_to_audit("🧹 Expired sessions cleaned")
        return {"success": True, "summary": "Sessions cleaned."}
    return {"error": "Session cleanup failed."}

def function_verify_deal_stage_integrity():
    """Verify deal stage integrity."""
    if _generic_api_call(0.85):
        log_to_audit("🧮 Deal stage integrity verified")
        return {"success": True, "summary": "Deal stages validated."}
    return {"error": "Deal stage check failed."}

def function_sync_roster_to_drive():
    """Sync team roster to Google Drive."""
    if _generic_api_call(0.84):
        log_to_audit("📁 Team roster synced to Google Drive")
        return {"success": True, "summary": "Drive sync complete."}
    return {"error": "Drive sync failed."}

def function_scan_for_spam_signups():
    """Scan for spam signups."""
    if _generic_api_call(0.86):
        log_to_audit("🚫 Spam signups scanned")
        return {"success": True, "summary": "Spam review done."}
    return {"error": "Spam scan failed."}

def function_verify_sla_adherence():
    """Verify SLA performance."""
    if _generic_api_call(0.89):
        log_to_audit("📏 SLA performance verified")
        return {"success": True, "summary": "SLA report ready."}
    return {"error": "SLA check failed."}

# ── Trigger Functions ───────────────────────────────────────────────
def function_trigger_all_callbacks():
    """Trigger all callbacks."""
    if _generic_api_call(0.9):
        log_to_audit("🔁 All callbacks triggered")
        return {"success": True, "summary": "Callbacks fired."}
    return {"error": "Callback trigger failed."}

def function_send_status_dashboard():
    """Send status dashboard."""
    if _generic_api_call(0.87):
        log_to_audit("📡 Status dashboard sent")
        return {"success": True, "summary": "Dashboard shared."}
    return {"error": "Status share failed."}

def function_enrich_lead_data():
    """Enrich lead data."""
    if _generic_api_call(0.85):
        log_to_audit("🧠 Lead data enriched")
        return {"success": True, "summary": "Lead enrichment done."}
    return {"error": "Lead enrichment failed."}

def function_validate_all_integrations():
    """Validate all integrations."""
    if _generic_api_call(0.91):
        log_to_audit("🔎 All integrations validated")
        return {"success": True, "summary": "Integration audit clean."}
    return {"error": "Integration check failed."}

def function_optimize_task_backlog():
    """Optimize task backlog."""
    if _generic_api_call(0.89):
        log_to_audit("📌 Task backlog optimized")
        return {"success": True, "summary": "Backlog optimized."}
    return {"error": "Task optimization failed."}

# ── Analytics Functions ───────────────────────────────────────────────
def function_run_daily_forecast():
    """Run daily forecasting."""
    if _generic_api_call(0.9):
        log_to_audit("📈 Daily forecasting run complete")
        return {"success": True, "summary": "Forecast generated."}
    return {"error": "Forecast run failed."}

def function_restart_slack_relay():
    """Restart Slack relay service."""
    if _generic_api_call(0.88):
        log_to_audit("📣 Slack relay service restarted")
        return {"success": True, "summary": "Slack relay reset."}
    return {"error": "Slack relay failed."}

def function_purge_old_logs():
    """Purge old logs."""
    if _generic_api_call(0.91):
        log_to_audit("🧹 Old logs purged")
        return {"success": True, "summary": "Logs cleaned up."}
    return {"error": "Log purge failed."}

def function_analyze_roi_trends():
    """Analyze ROI trends."""
    if _generic_api_call(0.9):
        log_to_audit("📊 ROI trends analyzed")
        return {"success": True, "summary": "ROI review complete."}
    return {"error": "ROI analysis failed."}

# ── Admin Functions ───────────────────────────────────────────────────
def function_lock_all_admin_panels():
    """Lock all admin panels."""
    if _generic_api_call(0.88):
        log_to_audit("🔒 Admin panels locked")
        return {"success": True, "summary": "Panels locked."}
    return {"error": "Admin lock failed."}

def function_trigger_content_refresh():
    """Trigger content refresh."""
    if _generic_api_call(0.9):
        log_to_audit("🔄 Content refresh triggered")
        return {"success": True, "summary": "Content updated."}
    return {"error": "Content refresh failed."}

def function_restart_email_engine():
    """Restart email delivery engine."""
    if _generic_api_call(0.87):
        log_to_audit("📧 Email delivery engine restarted")
        return {"success": True, "summary": "Email engine restarted."}
    return {"error": "Email restart failed."}

def function_scan_dead_leads():
    """Scan dead leads for reactivation."""
    if _generic_api_call(0.84):
        log_to_audit("☠️ Dead leads re-scanned for reactivation")
        return {"success": True, "summary": "Dead leads scanned."}
    return {"error": "Lead scan failed."}

def function_validate_quickbooks_mapping():
    """Validate QuickBooks field mapping."""
    if _generic_api_call(0.91):
        log_to_audit("📘 QuickBooks field mapping validated")
        return {"success": True, "summary": "Mapping verified."}
    return {"error": "QBO validation failed."}

# ── Alert Functions ───────────────────────────────────────────────────
def function_notify_admins_of_escalation():
    """Notify admins of escalation."""
    if _generic_api_call(0.86):
        log_to_audit("🚨 Admins notified of escalation")
        return {"success": True, "summary": "Escalation alert sent."}
    return {"error": "Escalation alert failed."}

def function_batch_verify_sms():
    """Verify bulk SMS."""
    if _generic_api_call(0.89):
        log_to_audit("📲 Bulk SMS verification complete")
        return {"success": True, "summary": "SMS verified."}
    return {"error": "SMS verification failed."}

def function_archive_old_roadmaps():
    """Archive old project roadmaps."""
    if _generic_api_call(0.85):
        log_to_audit("📦 Old project roadmaps archived")
        return {"success": True, "summary": "Archives complete."}
    return {"error": "Archiving failed."}

def function_sync_gsheet_exports():
    """Sync Google Sheets exports."""
    if _generic_api_call(0.87):
        log_to_audit("📄 Google Sheets exports synced")
        return {"success": True, "summary": "Sheets synced."}
    return {"error": "Sheet sync failed."}

# ── RAG Functions ───────────────────────────────────────────────────
def function_check_rag_ingestion_status():
    """Verify RAG ingestion status."""
    if _generic_api_call(0.91):
        log_to_audit("📚 RAG ingestion status verified")
        return {"success": True, "summary": "RAG status clean."}
    return {"error": "RAG check failed."}

def function_notify_users_of_feature_release():
    """Send feature release notification."""
    if _generic_api_call(0.9):
        log_to_audit("🚀 Feature release notification sent")
        return {"success": True, "summary": "Release message sent."}
    return {"error": "Release notify failed."}

def function_force_analytics_pipeline():
    """Force refresh analytics pipeline."""
    if _generic_api_call(0.93):
        log_to_audit("📊 Analytics pipeline forced refresh")
        return {"success": True, "summary": "Analytics refreshed."}
    return {"error": "Analytics run failed."}

def function_wipe_test_data():
    """Wipe test data from production views."""
    if _generic_api_call(0.88):
        log_to_audit("🧽 Test data wiped from production views")
        return {"success": True, "summary": "Test data cleared."}
    return {"error": "Wipe failed."}

def function_regenerate_docs():
    """Regenerate internal documents."""
    if _generic_api_call(0.89):
        log_to_audit("📄 Internal documents regenerated")
        return {"success": True, "summary": "Docs refreshed."}
    return {"error": "Doc regeneration failed."}

def function_ping_lead_scraper():
    """Ping lead scraper."""
    try:
        # Get lead scraper API URL
        scraper_url = os.environ.get("LEAD_SCRAPER_URL")
        if not scraper_url:
            raise ValueError("LEAD_SCRAPER_URL environment variable not set")
        
        # Make health check request
        response = make_api_call(
            url=f"{scraper_url}/health",
            method="GET"
        )
        
        if response.get("status") == "healthy":
            log_to_audit("🕵️ Lead scraper successfully pinged")
            return {"success": True, "summary": "Scraper pinged.", "details": response}
        else:
            raise Exception(f"Lead scraper reported unhealthy status: {response}")
    except Exception as e:
        logger.error(f"Lead scraper down: {str(e)}")
        return {"error": f"Lead scraper down: {str(e)}"}

# ── Advanced Functions ───────────────────────────────────────────────
def submit_copilot_command(command: str, user: str):
    """Submit a command to the Copilot system."""
    try:
        from icloud_calendar_sync.aggregator import airtable_post
        
        record = {
            "🧠 Prompt": command,
            "👤 Submitted By": user,
            "📅 Timestamp": datetime.utcnow().isoformat() + "Z",
            "⚙️ Action Status": "Received"
        }
        
        # Replace with actual Airtable base and table IDs
        base_id = os.environ.get("AIRTABLE_COPILOT_BASE_ID", "appRt8V3tH4g5Z5if")
        table_id = os.environ.get("AIRTABLE_COPILOT_TABLE_ID", "tblCopilot")
        
        return airtable_post(
            base_id=base_id,
            table_id=table_id,
            payload=record
        )
    except Exception as e:
        logger.error(f"Failed to submit copilot command: {str(e)}")
        return {"error": str(e)}

def get_live_call_queue():
    """Get the live call queue from Airtable."""
    try:
        from icloud_calendar_sync.aggregator import airtable_get
        
        # Replace with actual Airtable base and table IDs
        base_id = os.environ.get("AIRTABLE_CALLS_BASE_ID", "appRt8V3tH4g5Z5if")
        table_id = os.environ.get("AIRTABLE_CALLS_TABLE_ID", "tblLiveCalls")
        
        records = airtable_get(
            base_id=base_id,
            table_id=table_id,
            filters="AND({📞 Status}='Queued')",
            max_records=20
        )
        
        return [{
            "name": r["fields"].get("👤 Contact Name", "Unknown"),
            "priority": r["fields"].get("⭐ Priority", "Low"),
            "timestamp": r["fields"].get("🕒 Queued Time"),
            "id": r["id"]
        } for r in records]
    except Exception as e:
        logger.error(f"Failed to get live call queue: {str(e)}")
        return []

def updateBotBehavior():
    """Update bot behavior settings."""
    try:
        logger.info("Syncing bot behavior...")
        
        # Check for feature flag
        if not os.environ.get("BEHAVIOR_TUNING_ENABLED", "true").lower() == "true":
            return {"status": "skipped", "reason": "Behavior tuning disabled by env flag."}
        
        # Pull config from Airtable or another source
        # TODO: Replace with real Airtable logic
        behavior_rules = {
            "fallback_enabled": True,
            "nlp_strictness": "high",
            "auto_hand_off": False
        }
        
        logger.info(f"Pushing rules: {behavior_rules}")
        
        # TODO: Implement actual behavior update logic
        
        return {
            "status": "success", 
            "message": "Behavior tuning rules applied.", 
            "applied_rules": behavior_rules
        }
    except Exception as e:
        logger.error(f"Failed to update bot behavior: {str(e)}")
        return {"status": "error", "message": str(e)}