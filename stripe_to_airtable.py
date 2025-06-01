#!/usr/bin/env python3
"""
Stripe Payment Airtable Logger
Logs all Stripe payments to Airtable for comprehensive tracking
"""

import os
import requests
import json
from datetime import datetime

def log_stripe_to_airtable(email, amount, payment_id, timestamp):
    """
    Log Stripe payment to Airtable Payments table
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
            
        url = f"https://api.airtable.com/v0/{airtable_base_id}/💸%20Stripe%20Payments"
        
        headers = {
            "Authorization": f"Bearer {airtable_token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "fields": {
                "📧 Email": email,
                "💰 Amount": amount,
                "🧾 Payment ID": payment_id,
                "🕒 Timestamp": timestamp,
                "📊 Status": "✅ Completed",
                "🔗 Source": "Stripe Webhook",
                "📝 Notes": f"Payment processed for ${amount:,.2f}"
            }
        }
        
        response = requests.post(
            url,
            headers=headers,
            json=payload,
            timeout=10
        )
        
        if response.status_code == 200:
            print(f"Stripe payment logged to Airtable for {email}")
            return True
        else:
            print(f"Failed to log payment to Airtable: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"Error logging Stripe payment to Airtable: {e}")
        return False

def log_stripe_metrics(email, amount, payment_id, timestamp):
    """
    Log Stripe payment to Command Center metrics tracker
    """
    try:
        airtable_token = os.getenv("AIRTABLE_API_KEY")
        airtable_base_id = os.getenv("AIRTABLE_BASE_ID")
        
        if not airtable_token or not airtable_base_id:
            return False
            
        url = f"https://api.airtable.com/v0/{airtable_base_id}/📊%20Command%20Center%20·%20Metrics%20Tracker"
        
        headers = {
            "Authorization": f"Bearer {airtable_token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "fields": {
                "📌 Event Type": "💸 Payment Received",
                "🔗 Source": "Stripe",
                "🆔 Ref ID": payment_id,
                "📝 Summary": f"Payment from {email}",
                "💰 Amount": amount,
                "🕒 Timestamp": timestamp,
                "👤 Customer": email
            }
        }
        
        response = requests.post(
            url,
            headers=headers,
            json=payload,
            timeout=10
        )
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"Error logging payment metrics: {e}")
        return False

if __name__ == "__main__":
    # Test the function
    log_stripe_to_airtable("customer@example.com", 2500.00, "pi_1234567890", datetime.now().isoformat())