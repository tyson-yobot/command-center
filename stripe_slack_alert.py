#!/usr/bin/env python3
"""
Stripe Payment Slack Alert System
Sends instant Slack notifications when Stripe payments are received
"""

import os
import requests
import json
from datetime import datetime

def send_stripe_payment_alert(email, amount):
    """
    Send Slack notification when a Stripe payment is received
    """
    try:
        slack_webhook_url = os.getenv("SLACK_WEBHOOK_URL")
        
        if not slack_webhook_url:
            print("SLACK_WEBHOOK_URL not configured")
            return False
            
        message = {
            "text": f"💸 Payment Received: {email} paid ${amount:,.2f} via Stripe",
            "attachments": [
                {
                    "color": "good",
                    "fields": [
                        {
                            "title": "Customer Email",
                            "value": email,
                            "short": True
                        },
                        {
                            "title": "Amount",
                            "value": f"${amount:,.2f}",
                            "short": True
                        },
                        {
                            "title": "Payment Method",
                            "value": "Stripe",
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
            print(f"Stripe payment alert sent to Slack for {email}")
            return True
        else:
            print(f"Failed to send Slack alert: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"Error sending Stripe Slack alert: {e}")
        return False

def send_detailed_payment_alert(email, amount, payment_id, customer_name=None):
    """
    Send detailed Stripe payment notification with additional context
    """
    try:
        slack_webhook_url = os.getenv("SLACK_WEBHOOK_URL")
        
        if not slack_webhook_url:
            return False
            
        customer_display = customer_name if customer_name else email
        
        message = {
            "text": f"💸 *Payment Received via Stripe*",
            "attachments": [
                {
                    "color": "good",
                    "title": f"${amount:,.2f} payment processed",
                    "fields": [
                        {
                            "title": "Customer",
                            "value": customer_display,
                            "short": True
                        },
                        {
                            "title": "Email",
                            "value": email,
                            "short": True
                        },
                        {
                            "title": "Amount",
                            "value": f"${amount:,.2f}",
                            "short": True
                        },
                        {
                            "title": "Payment ID",
                            "value": payment_id,
                            "short": True
                        }
                    ],
                    "footer": "YoBot Payment System",
                    "ts": int(datetime.now().timestamp())
                }
            ]
        }
        
        response = requests.post(
            slack_webhook_url,
            json=message,
            timeout=10
        )
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"Error sending detailed payment alert: {e}")
        return False

if __name__ == "__main__":
    # Test the function
    send_stripe_payment_alert("test@example.com", 3500.00)