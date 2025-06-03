#!/usr/bin/env python3
"""
Support Dispatcher - Command Line Version
Dispatches support tickets to Slack and Airtable via command line arguments
"""

import sys
import json
import os
import requests

SLACK_BOT_TOKEN = os.getenv("SLACK_BOT_TOKEN")
SLACK_CHANNEL_ID = os.getenv("SLACK_CHANNEL_ID", "#support-queue")
AIRTABLE_API_KEY = os.getenv("AIRTABLE_API_KEY")
AIRTABLE_BASE_ID = os.getenv("AIRTABLE_BASE_ID", "appCoAtCZdARb4AM2")
AIRTABLE_TABLE_ID = "tblo1ESkt9ybkvaJH"

def post_to_slack(ticket):
    """Post ticket to Slack channel"""
    try:
        if not SLACK_BOT_TOKEN:
            return False
            
        text = f"""
📨 *Support Ticket*: `{ticket['ticketId']}`
👤 *Client*: {ticket['clientName']}
🧠 *Topic*: {ticket['topic']}
🎯 *AI Reply*: {ticket.get('aiReply', 'No reply generated')}
🚨 *Escalate*: `{ticket.get('escalationFlag', False)}`
"""

        headers = {
            "Authorization": f"Bearer {SLACK_BOT_TOKEN}",
            "Content-Type": "application/json"
        }
        payload = {
            "channel": SLACK_CHANNEL_ID,
            "text": text
        }

        response = requests.post("https://slack.com/api/chat.postMessage", json=payload, headers=headers)
        return response.json().get("ok", False)

    except Exception:
        return False

def log_to_airtable(ticket):
    """Log ticket to Airtable"""
    try:
        if not AIRTABLE_API_KEY:
            return False
            
        url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{AIRTABLE_TABLE_ID}"
        headers = {
            "Authorization": f"Bearer {AIRTABLE_API_KEY}",
            "Content-Type": "application/json"
        }
        data = {
            "fields": {
                "ticketId": ticket["ticketId"],
                "clientName": ticket["clientName"],
                "topic": ticket["topic"],
                "aiReply": ticket.get("aiReply", "No reply generated"),
                "escalationFlag": str(ticket.get("escalationFlag", False)),
                "sentiment": ticket.get("sentiment", "unknown")
            }
        }

        response = requests.post(url, json=data, headers=headers)
        return response.status_code == 200

    except Exception:
        return False

def dispatch_support_response(ticket):
    """Dispatch ticket to all configured services"""
    slack_success = post_to_slack(ticket)
    airtable_success = log_to_airtable(ticket)
    
    return {
        "slack_success": slack_success,
        "airtable_success": airtable_success
    }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        try:
            ticket = json.loads(sys.argv[1])
            result = dispatch_support_response(ticket)
            
            if result["slack_success"]:
                print("Slack notification sent")
            else:
                print("Slack notification failed")
                
            if result["airtable_success"]:
                print("Airtable record created")
            else:
                print("Airtable logging failed")
                
        except json.JSONDecodeError:
            print("Invalid JSON input")
        except Exception:
            print("Dispatch failed")
    else:
        print("No input provided")