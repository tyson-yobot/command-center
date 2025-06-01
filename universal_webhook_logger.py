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
        
        actual_table = table_mapping.get(table_name, "🚨 System Alerts Log")
        
        url = f"https://api.airtable.com/v0/{base_id}/{actual_table}"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        # Ensure timestamp
        if "timestamp" not in data:
            data["timestamp"] = datetime.utcnow().isoformat()
        
        # Map to your actual table field structure
        simplified_data = {}
        
        # Default to the main operations metrics table structure
        simplified_data["📅 Date"] = data["timestamp"][:10]  # Extract date from timestamp
        simplified_data["🏷️ Client / Bot Name"] = data.get("source", "System")
        simplified_data["💬 Conversations"] = data.get("conversations", 1)
        simplified_data["✉️ Messages Exchanged"] = data.get("messages", 1)
        simplified_data["🎯 Leads Captured"] = data.get("leads", 0)
        simplified_data["🔀 Live Transfers"] = data.get("transfers", 0)
        simplified_data["⏱️ Avg Response Time (sec)"] = data.get("response_time", 180)
        simplified_data["📈 Conversion Rate"] = data.get("conversion_rate", 0.0)
        simplified_data["💰 Revenue Booked"] = data.get("revenue", 0)
        simplified_data["📛 Errors/Fallbacks"] = data.get("errors", 0)
        simplified_data["📊 Engagement Score"] = data.get("engagement", 85)
        simplified_data["📣 Notifications Sent"] = data.get("notifications", 1)
        simplified_data["😃 Avg Sentiment Score"] = data.get("sentiment", 0.8)
        simplified_data["📄 Docs Retrieved"] = data.get("docs", 0)
        simplified_data["📝 Notes"] = str(data.get("details", data.get("summary", str(data))))[:500]
        
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