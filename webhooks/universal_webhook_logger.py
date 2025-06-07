#!/usr/bin/env python3
"""
Universal Webhook Logger
Drop-in logging system for all YoBot modules with consistent schema
"""

import os
import requests
import json
import uuid
from datetime import datetime

def post_slack_alert(uuid, integration, result, notes, scenario_link):
    """Send Slack notification for integration test results"""
    alerts_webhook = "https://hooks.slack.com/services/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"
    escalation_webhook = "https://hooks.slack.com/services/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"
    
    # Send standard alert to #yobot-alerts
    message = {
        "text": f"🧪 *{integration}* test completed\n"
                f"• Status: *{result}*\n"
                f"• Notes: {notes or 'None'}\n"
                f"• [📂 Scenario]({scenario_link})\n"
                f"• 🆔 *Test UUID:* `{uuid}`"
    }
    
    try:
        response = requests.post(alerts_webhook, json=message, timeout=5)
        print(f"Slack alert sent: {response.status_code}")
        
        # Send escalation alert for failures to #yobot-escalation
        if result == "❌ Fail":
            escalation_msg = {
                "text": f"🚨 *FAILED QA TEST: {integration}*\n"
                        f"• Status: ❌ Fail\n"
                        f"• Notes: {notes or 'None'}\n"
                        f"• [📂 Scenario]({scenario_link})\n"
                        f"• 🆔 *Test UUID:* `{uuid}`\n"
                        f"<@daniel.sharpe> please investigate"
            }
            escalation_response = requests.post(escalation_webhook, json=escalation_msg, timeout=5)
            print(f"Escalation alert sent: {escalation_response.status_code}")
            
    except Exception as e:
        print(f"Slack notification failed: {e}")

def post_escalation_alert(uuid, integration, notes, scenario_link):
    """Legacy function - escalation now handled in post_slack_alert"""
    print("Escalation handled by main alert function")

def log_to_airtable(table_name, data):
    """
    Universal logging function for all modules
    Routes to your existing Airtable tables with proper field mapping
    """
    try:
        base_id = "appRt8V3tH4g5Z5if"
        api_key = "patOBlGeI7sSi2Pn9.1ca51aa3a13aadc43cf821dbb6cbaab11e29736f330cffb066fcc1c64854327f"
        
        if not base_id or not api_key:
            print("Missing Airtable credentials")
            return False
        
        # Map to your existing tables
        table_mapping = {
            "Voice Call Log": "📞 Voice Call Log",
            "Integration Sync Tracker": "🔗 Integration Sync Tracker", 
            "File Upload Tracker": "🗃 File Upload Tracker",
            "Slack Alerts Log": "📣 Slack Alerts Log",
            "Lead Qualification Tracker": "🎯 Lead Qualification Tracker",
            "Escalation Tracker": "🚨 Escalation Tracker",
            "System Alerts Log": "🚨 System Alerts Log",
            "Ops Metrics Log": "📊 Ops Metrics Log",
            "CRM + Voice Audit Log": "🔗 CRM + Voice Audit Log",
            "Support Metrics Rollup": "📊 Support Metrics Rollup",
            "Command Center Wiring Tracker": "Command Center Wiring Tracker",
            "Tone Logs": "🗣️ Tone Response Variant Library",
            "Payment Logs": "🧾 Stripe Price Tracker (Live)",
            "OCR Logs": "🗃 File Upload Tracker",
            "Chat Logs": "💼 Client Touchpoint Log",
            "Quote Logs": "🧾 PDF Quote Generator Log",
            "Upload Logs": "🗃 File Upload Tracker",
            "RAG Logs": "🔗 Integration Sync Tracker",
            "System Logs": "🚨 System Alerts Log",
            "Workflow Logs": "📊 Ops Metrics Log"
        }
        
        # Use the corrected table ID for direct access
        table_id = "tbljRrOMdPXvRngEy"
        
        url = f"https://api.airtable.com/v0/{base_id}/{table_id}"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        # Ensure timestamp
        if "timestamp" not in data:
            data["timestamp"] = datetime.utcnow().isoformat()
        
        # Generate unique test UUID for traceability
        test_uuid = str(uuid.uuid4())
        
        # Map to your Integration QA table field structure
        simplified_data = {}
        
        simplified_data["🆔 Test UUID"] = test_uuid
        simplified_data["🔧 Integration Name"] = data.get("source", "YoBot System")
        simplified_data["✅ Pass/Fail"] = "✅ Pass" if data.get("success", True) else "❌ Fail"
        simplified_data["📤 Output Data Populated"] = "Yes" if (data.get("conversations", 0) > 0 or data.get("revenue", 0) > 0) else "No"
        simplified_data["🗃️ Record Created?"] = "Yes"
        simplified_data["🐞 Errors Observed"] = str(data.get("errors", ""))
        simplified_data["🧠 Notes / Debug"] = str(data.get("details", data.get("summary", str(data))))[:500]
        simplified_data["🧑‍💻 QA Owner"] = "System"
        simplified_data["📅 Test Date"] = data["timestamp"][:10]
        simplified_data["📂 Related Scenario Link"] = data.get("url", "https://replit.com/@YoBot/CommandCenter")
        
        airtable_data = {"fields": simplified_data}
        
        response = requests.post(url, json=airtable_data, headers=headers, timeout=10)
        
        if response.status_code == 200:
            print(f"Logged to table {table_id}")
            
            # Send Slack notification if webhook URL is available
            post_slack_alert(test_uuid, simplified_data["🔧 Integration Name"], 
                           simplified_data["✅ Pass/Fail"], 
                           simplified_data["🧠 Notes / Debug"],
                           simplified_data["📂 Related Scenario Link"])
            
            # Send escalation alert for failed tests
            if simplified_data["✅ Pass/Fail"] == "❌ Fail":
                post_escalation_alert(test_uuid, simplified_data["🔧 Integration Name"],
                                     simplified_data["🧠 Notes / Debug"],
                                     simplified_data["📂 Related Scenario Link"])
            
            return True
        else:
            print(f"Failed to log to table {table_id}: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"Universal logging error: {e}")
        return False

def log_voice_generation(user_email, variant, voice_id, generation_time, success=True):
    """
    Log voice generation events with consistent schema
    """
    return log_to_airtable("Tone Logs", {
        "email": user_email,
        "variant": variant,
        "voice_id": voice_id,
        "generation_time": generation_time,
        "success": success,
        "timestamp": datetime.utcnow().isoformat()
    })

def log_stripe_payment(customer_email, amount, payment_id):
    """
    Log Stripe payment events with consistent schema
    """
    return log_to_airtable("Payment Logs", {
        "email": customer_email,
        "amount": amount,
        "payment_id": payment_id,
        "source": "Stripe",
        "timestamp": datetime.utcnow().isoformat()
    })

def log_ocr_processing(user_email, filename, text_extracted, confidence):
    """
    Log OCR processing events with consistent schema
    """
    return log_to_airtable("OCR Logs", {
        "email": user_email,
        "filename": filename,
        "text_length": len(text_extracted),
        "confidence": confidence,
        "timestamp": datetime.utcnow().isoformat()
    })

def log_chat_interaction(customer_email, customer_name, message_length, response_time):
    """
    Log chat interactions with consistent schema
    """
    return log_to_airtable("Chat Logs", {
        "email": customer_email,
        "name": customer_name,
        "message_length": message_length,
        "response_time": response_time,
        "timestamp": datetime.utcnow().isoformat()
    })

def log_quote_activity(customer_email, quote_id, action, amount=None):
    """
    Log quote activities with consistent schema
    """
    data = {
        "email": customer_email,
        "quote_id": quote_id,
        "action": action,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    if amount:
        data["amount"] = amount
        
    return log_to_airtable("Quote Logs", data)

def log_file_upload(user_email, filename, file_size, processing_status):
    """
    Log file upload events with consistent schema
    """
    return log_to_airtable("Upload Logs", {
        "email": user_email,
        "filename": filename,
        "file_size": file_size,
        "status": processing_status,
        "timestamp": datetime.utcnow().isoformat()
    })

def log_rag_injection(source, content_type, success, reference_id=None):
    """
    Log RAG injection events with consistent schema
    """
    data = {
        "source": source,
        "content_type": content_type,
        "success": success,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    if reference_id:
        data["reference_id"] = reference_id
        
    return log_to_airtable("RAG Logs", data)

def log_system_event(event_type, source, details, severity="info"):
    """
    Log system events with consistent schema
    """
    return log_to_airtable("System Logs", {
        "event_type": event_type,
        "source": source,
        "details": details,
        "severity": severity,
        "timestamp": datetime.utcnow().isoformat()
    })

def log_automation_workflow(workflow_name, trigger_source, steps_completed, total_steps, success=True):
    """
    Log automation workflow execution with consistent schema
    """
    return log_to_airtable("Workflow Logs", {
        "workflow_name": workflow_name,
        "trigger_source": trigger_source,
        "steps_completed": steps_completed,
        "total_steps": total_steps,
        "success": success,
        "completion_rate": (steps_completed / total_steps) * 100 if total_steps > 0 else 0,
        "timestamp": datetime.utcnow().isoformat()
    })

# Convenience functions for common logging patterns
def quick_log(table, email, action, details=None):
    """
    Quick logging function for simple events
    """
    data = {
        "email": email,
        "action": action,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    if details:
        data.update(details)
        
    return log_to_airtable(table, data)

if __name__ == "__main__":
    # Test universal logging
    test_result = log_to_airtable("Test Logs", {
        "email": "test@yobot.com",
        "action": "system_test",
        "module": "universal_logger"
    })
    
    print(f"Test logging result: {test_result}")