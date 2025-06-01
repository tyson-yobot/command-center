#!/usr/bin/env python3
"""
Quote Signing Metrics Logger
Tracks quote signatures in Airtable Command Center Metrics
"""

import os
import requests
import json
from datetime import datetime

def log_quote_to_metrics(name, quote_id, amount, timestamp):
    """
    Log quote signing to Command Center Metrics Tracker in Airtable
    """
    try:
        airtable_token = os.getenv("AIRTABLE_API_KEY")
        airtable_base_id = os.getenv("AIRTABLE_BASE_ID")
        
        if not airtable_token or not airtable_base_id:
            print("Airtable credentials not configured")
            return False
            
        # Format timestamp if not provided
        if not timestamp:
            timestamp = datetime.now().isoformat()
            
        url = f"https://api.airtable.com/v0/{airtable_base_id}/📊%20Command%20Center%20·%20Metrics%20Tracker"
        
        headers = {
            "Authorization": f"Bearer {airtable_token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "fields": {
                "📌 Event Type": "🧾 Quote Signed",
                "🔗 Source": "PDF Signature",
                "🆔 Ref ID": str(quote_id),
                "📝 Summary": f"{name} signed quote for ${amount:,.2f}",
                "💰 Amount": amount,
                "🕒 Timestamp": timestamp,
                "👤 Customer": name,
                "📊 Status": "✅ Completed"
            }
        }
        
        response = requests.post(
            url,
            headers=headers,
            json=payload,
            timeout=10
        )
        
        if response.status_code == 200:
            print(f"Quote metrics logged to Airtable for {name}")
            return True
        else:
            print(f"Failed to log quote metrics: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"Error logging quote metrics: {e}")
        return False

def get_current_timestamp():
    """
    Get current timestamp in ISO format
    """
    return datetime.now().isoformat()

if __name__ == "__main__":
    # Test the function
    log_quote_to_metrics("Jane Doe", "Q-2025-002", 7500.00, get_current_timestamp())