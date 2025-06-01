#!/usr/bin/env python3
"""
Admin Feed Logger
Duplicates all automation events to admin monitoring feed for complete oversight
"""

import os
import requests
import json
from datetime import datetime

def duplicate_to_admin_feed(source_data):
    """
    Duplicate automation events to admin monitoring feed
    """
    try:
        admin_feed_url = os.getenv("ADMIN_FEED_URL")
        admin_api_key = os.getenv("ADMIN_API_KEY")
        
        if not admin_feed_url:
            print("Admin feed URL not configured")
            return False
            
        headers = {
            "Content-Type": "application/json"
        }
        
        if admin_api_key:
            headers["Authorization"] = f"Bearer {admin_api_key}"
            
        payload = {
            "type": "RAG Injection",
            "email": source_data.get("email", "unknown"),
            "source": source_data.get("source", "N/A"),
            "title": source_data.get("title", "Untitled"),
            "timestamp": datetime.utcnow().isoformat(),
            "metadata": source_data.get("metadata", {}),
            "event_id": f"admin_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        }
        
        response = requests.post(
            admin_feed_url,
            headers=headers,
            json=payload,
            timeout=10
        )
        
        if response.status_code == 200:
            print(f"Event duplicated to admin feed: {source_data.get('title', 'Unknown')}")
            return True
        else:
            print(f"Failed to duplicate to admin feed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"Admin feed duplication error: {e}")
        return False

def log_admin_event(event_type, email, source, title, details=None):
    """
    Log specific events to admin feed with structured data
    """
    try:
        admin_feed_url = os.getenv("ADMIN_FEED_URL")
        
        if not admin_feed_url:
            return False
            
        event_data = {
            "type": event_type,
            "email": email,
            "source": source,
            "title": title,
            "details": details or {},
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return duplicate_to_admin_feed(event_data)
        
    except Exception as e:
        print(f"Admin event logging error: {e}")
        return False

def log_file_upload_to_admin(email, filename, file_size, user_name):
    """
    Log file upload events to admin feed
    """
    return log_admin_event(
        event_type="File Upload",
        email=email,
        source="File Upload Handler",
        title=f"{user_name} uploaded {filename}",
        details={
            "filename": filename,
            "file_size": file_size,
            "user_name": user_name
        }
    )

def log_quote_signed_to_admin(customer_name, quote_id, amount):
    """
    Log quote signing events to admin feed
    """
    return log_admin_event(
        event_type="Quote Signed",
        email="system@yobot.bot",
        source="Quote Engine",
        title=f"{customer_name} signed Quote #{quote_id}",
        details={
            "quote_id": quote_id,
            "amount": amount,
            "customer_name": customer_name
        }
    )

def log_stripe_payment_to_admin(customer_email, payment_id, amount):
    """
    Log Stripe payment events to admin feed
    """
    return log_admin_event(
        event_type="Payment Received",
        email=customer_email,
        source="Stripe",
        title=f"Payment received: ${amount:,.2f}",
        details={
            "payment_id": payment_id,
            "amount": amount
        }
    )

def log_chat_message_to_admin(customer_name, customer_email, message):
    """
    Log chat messages to admin feed
    """
    return log_admin_event(
        event_type="Chat Message",
        email=customer_email,
        source="Live Chat",
        title=f"Message from {customer_name}",
        details={
            "message": message[:100] + "..." if len(message) > 100 else message,
            "customer_name": customer_name
        }
    )

def log_missed_call_to_admin(caller_name, phone_number, timestamp):
    """
    Log missed call events to admin feed
    """
    return log_admin_event(
        event_type="Missed Call",
        email="system@yobot.bot",
        source="VoiceBot",
        title=f"Missed call from {caller_name}",
        details={
            "phone_number": phone_number,
            "caller_name": caller_name,
            "call_time": timestamp
        }
    )

if __name__ == "__main__":
    # Test the admin feed logging
    test_data = {
        "email": "test@example.com",
        "source": "Test System",
        "title": "Test Event",
        "metadata": {"test": True}
    }
    
    duplicate_to_admin_feed(test_data)