#!/usr/bin/env python3
"""
Universal Webhook Logger
Drop-in logging system for all YoBot modules with consistent schema
"""

import os
import requests
import json
from datetime import datetime

def log_to_airtable(table_name, data):
    """
    Universal logging function for all modules
    Routes to your existing Airtable tables with proper field mapping
    """
    try:
        base_id = os.getenv("AIRTABLE_BASE_ID")
        api_key = os.getenv("AIRTABLE_API_KEY")
        
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
        
        actual_table = table_mapping.get(table_name, "🚨 System Alerts Log")
        
        url = f"https://api.airtable.com/v0/{base_id}/{actual_table}"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        # Ensure timestamp
        if "timestamp" not in data:
            data["timestamp"] = datetime.utcnow().isoformat()
        
        # Map to specific field structures for each table
        simplified_data = {}
        
        if actual_table == "🚨 System Alerts Log":
            simplified_data["🚨 Alert Type"] = data.get("event_type", data.get("action", "automation"))
            simplified_data["⚙️ Triggered By"] = data.get("source", "system")
            simplified_data["🔥 Severity"] = data.get("severity", "info")
            simplified_data["📍 Status"] = data.get("status", "active")
            simplified_data["🕒 Timestamp"] = data["timestamp"]
        
        elif "File Upload" in actual_table:
            simplified_data["File Name"] = data.get("filename", "unknown")
            simplified_data["User"] = data.get("email", "system")
            simplified_data["Status"] = data.get("status", "processed")
            simplified_data["Timestamp"] = data["timestamp"]
        
        elif "Integration Sync" in actual_table:
            simplified_data["Integration"] = data.get("source", "system")
            simplified_data["Event"] = data.get("event_type", data.get("action", "sync"))
            simplified_data["Status"] = data.get("status", "completed")
            simplified_data["Timestamp"] = data["timestamp"]
        
        elif "Slack Alerts" in actual_table:
            simplified_data["Alert Type"] = data.get("event_type", "notification")
            simplified_data["Message"] = str(data.get("details", data.get("summary", data)))[:200]
            simplified_data["Timestamp"] = data["timestamp"]
        
        elif "Lead Qualification" in actual_table:
            simplified_data["Lead Email"] = data.get("email", "unknown")
            simplified_data["Action"] = data.get("action", data.get("event_type", "qualification"))
            simplified_data["Score"] = data.get("score", 0)
            simplified_data["Timestamp"] = data["timestamp"]
        
        elif "Voice Call" in actual_table:
            simplified_data["Caller"] = data.get("email", data.get("phone", "unknown"))
            simplified_data["Call Type"] = data.get("event_type", "automated")
            simplified_data["Duration"] = data.get("duration", 0)
            simplified_data["Timestamp"] = data["timestamp"]
        
        elif "Client Touchpoint" in actual_table:
            simplified_data["Client Email"] = data.get("email", "unknown")
            simplified_data["Touchpoint Type"] = data.get("event_type", data.get("action", "interaction"))
            simplified_data["Details"] = str(data.get("details", data.get("message", "")))[:200]
            simplified_data["Timestamp"] = data["timestamp"]
        
        elif "Ops Metrics" in actual_table:
            simplified_data["Metric Type"] = data.get("event_type", "automation")
            simplified_data["Value"] = data.get("amount", data.get("count", 1))
            simplified_data["Source"] = data.get("source", "system")
            simplified_data["Timestamp"] = data["timestamp"]
        
        else:
            # Fallback generic mapping
            simplified_data["Event"] = data.get("event_type", data.get("action", "automation"))
            simplified_data["Source"] = data.get("source", "system")
            simplified_data["Details"] = str(data)[:200]
            simplified_data["Timestamp"] = data["timestamp"]
        
        airtable_data = {"fields": simplified_data}
        
        response = requests.post(url, json=airtable_data, headers=headers, timeout=10)
        
        if response.status_code == 200:
            print(f"Logged to {actual_table}")
            return True
        else:
            print(f"Failed to log to {actual_table}: {response.status_code}")
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