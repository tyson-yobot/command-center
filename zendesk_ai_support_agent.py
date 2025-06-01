import requests
import os
from universal_webhook_logger import log_to_airtable

ZENDESK_DOMAIN = "yobot.zendesk.com"
ZENDESK_EMAIL = os.getenv("ZENDESK_EMAIL")
ZENDESK_TOKEN = os.getenv("ZENDESK_TOKEN")

def post_reply(ticket_id, reply_text):
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
    log_to_airtable('Zendesk AI Support Reply', {
        'source': 'AI Support Agent',
        'success': response.status_code == 200,
        'details': f'Reply posted to ticket {ticket_id}: {reply_text[:50]}...',
        'errors': '' if response.status_code == 200 else f'HTTP {response.status_code}: {response.text}',
        'url': f'https://{ZENDESK_DOMAIN}/agent/tickets/{ticket_id}'
    })
    
    return response.status_code, response.text

# Test with ticket ID 23
if __name__ == "__main__":
    status, resp = post_reply(ticket_id=23, reply_text="👋 Thanks for contacting YoBot Support! We're on it.")
    print("✅ Zendesk reply status:", status)
    print("🧾 Response:", resp)