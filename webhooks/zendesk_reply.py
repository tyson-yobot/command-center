import requests
import os
from universal_webhook_logger import log_to_airtable

ZENDESK_DOMAIN = "yobot.zendesk.com"
ZENDESK_EMAIL = os.getenv("ZENDESK_EMAIL")
ZENDESK_TOKEN = os.getenv("ZENDESK_TOKEN")

def post_reply(ticket_id, reply_text):
    """Post an automated reply to a Zendesk ticket"""
    url = f"https://{ZENDESK_DOMAIN}/api/v2/tickets/{ticket_id}.json"
    headers = {
        "Content-Type": "application/json",
    }
    auth = (f"{ZENDESK_EMAIL}/token", ZENDESK_TOKEN)
    data = {
        "ticket": {
            "comment": {
                "body": reply_text,
                "public": True
            }
        }
    }

    response = requests.put(url, json=data, auth=auth, headers=headers)
    
    # Log the reply attempt
    log_to_airtable('Zendesk Auto Reply', {
        'source': 'Zendesk Ticket Auto-Reply System',
        'success': response.status_code == 200,
        'details': f'Reply posted to ticket {ticket_id}: {reply_text[:50]}...',
        'errors': '' if response.status_code == 200 else f'HTTP {response.status_code}: {response.text}',
        'url': f'https://{ZENDESK_DOMAIN}/agent/tickets/{ticket_id}'
    })
    
    return response.status_code, response.text

def handle_ticket_submission(payload):
    """Handle incoming ticket and generate AI reply"""
    ticket_id = payload.get("ticket_id")
    subject = payload.get("subject", "")
    description = payload.get("description", "")
    
    # Draft a basic AI reply
    reply_text = f"Hi there! 👋 Thanks for reaching out about: '{subject}'.\n\nWe've logged your issue and one of our team members will follow up shortly. Let us know if anything changes in the meantime!"

    # Post reply to Zendesk
    status, response = post_reply(ticket_id, reply_text)

    return {
        "status": "success" if status == 200 else "fail",
        "zendesk_status": status,
        "zendesk_response": response
    }