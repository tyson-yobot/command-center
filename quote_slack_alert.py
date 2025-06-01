#!/usr/bin/env python3
"""
Quote Signing Slack Alert System
Sends instant Slack notifications when quotes are signed
"""

import os
import requests
import json
from datetime import datetime

def send_quote_signed_alert(name, quote_id, amount):
    """
    Send Slack notification when a quote is signed
    """
    try:
        slack_webhook_url = os.getenv("SLACK_WEBHOOK_URL")
        
        if not slack_webhook_url:
            print("SLACK_WEBHOOK_URL not configured")
            return False
            
        message = {
            "text": f"🧾 *Quote Signed!* {name} just signed Quote #{quote_id} for ${amount:,.2f}",
            "attachments": [
                {
                    "color": "good",
                    "fields": [
                        {
                            "title": "Customer",
                            "value": name,
                            "short": True
                        },
                        {
                            "title": "Quote ID",
                            "value": f"#{quote_id}",
                            "short": True
                        },
                        {
                            "title": "Amount",
                            "value": f"${amount:,.2f}",
                            "short": True
                        },
                        {
                            "title": "Time",
                            "value": datetime.now().strftime("%I:%M %p"),
                            "short": True
                        }
                    ]
                }
            ]
        }
        
        response = requests.post(
            slack_webhook_url,
            json=message,
            timeout=10
        )
        
        if response.status_code == 200:
            print(f"Quote signing alert sent to Slack for {name}")
            return True
        else:
            print(f"Failed to send Slack alert: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"Error sending quote Slack alert: {e}")
        return False

if __name__ == "__main__":
    # Test the function
    send_quote_signed_alert("John Smith", "Q-2025-001", 5000.00)