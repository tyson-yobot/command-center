"""
HubSpot Support Webhook Handler
Replaces Zapier → HubSpot/Zendesk integration
Receives support form data, logs to Airtable, creates Zendesk ticket
"""

import os
import requests
from datetime import datetime
from flask import Flask, request, jsonify

app = Flask(__name__)

# Environment variables
AIRTABLE_API_KEY = os.getenv('AIRTABLE_API_KEY')
AIRTABLE_BASE_ID = os.getenv('AIRTABLE_BASE_ID')
ZENDESK_DOMAIN = os.getenv('ZENDESK_DOMAIN')
ZENDESK_EMAIL = os.getenv('ZENDESK_EMAIL')
ZENDESK_API_TOKEN = os.getenv('ZENDESK_API_TOKEN')
SLACK_WEBHOOK_URL = os.getenv('SLACK_WEBHOOK_URL')

def log_to_airtable(support_data):
    """Log support request to Airtable"""
    if not AIRTABLE_API_KEY or not AIRTABLE_BASE_ID:
        return {"error": "Airtable credentials not configured"}
    
    url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/Support%20Tickets"
    headers = {
        "Authorization": f"Bearer {AIRTABLE_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "records": [{
            "fields": {
                "🎫 Ticket Subject": support_data.get("subject", ""),
                "👤 Customer Name": support_data.get("name", ""),
                "📧 Email": support_data.get("email", ""),
                "📞 Phone": support_data.get("phone", ""),
                "📝 Description": support_data.get("description", ""),
                "🏷️ Priority": support_data.get("priority", "Medium"),
                "📂 Category": support_data.get("category", "General"),
                "✅ Status": "New",
                "🕐 Created": datetime.now().isoformat(),
                "🔗 Source": "HubSpot Form"
            }
        }]
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        return response.json()
    except Exception as e:
        return {"error": f"Airtable logging failed: {str(e)}"}

def create_zendesk_ticket(support_data):
    """Create Zendesk ticket from support request"""
    if not all([ZENDESK_DOMAIN, ZENDESK_EMAIL, ZENDESK_API_TOKEN]):
        return {"error": "Zendesk credentials not configured"}
    
    url = f"https://{ZENDESK_DOMAIN}.zendesk.com/api/v2/tickets.json"
    auth = (f"{ZENDESK_EMAIL}/token", ZENDESK_API_TOKEN)
    headers = {"Content-Type": "application/json"}
    
    # Map priority levels
    priority_map = {
        "Low": "low",
        "Medium": "normal", 
        "High": "high",
        "Urgent": "urgent"
    }
    
    payload = {
        "ticket": {
            "subject": support_data.get("subject", "Support Request"),
            "comment": {
                "body": f"Support request from {support_data.get('name', 'Unknown')}\n\n{support_data.get('description', '')}\n\nContact: {support_data.get('email', '')} | {support_data.get('phone', '')}"
            },
            "requester": {
                "name": support_data.get("name", ""),
                "email": support_data.get("email", "")
            },
            "priority": priority_map.get(support_data.get("priority", "Medium"), "normal"),
            "type": "question",
            "tags": ["hubspot", "web-form", "yobot"]
        }
    }
    
    try:
        response = requests.post(url, json=payload, auth=auth, headers=headers, timeout=30)
        return response.json()
    except Exception as e:
        return {"error": f"Zendesk ticket creation failed: {str(e)}"}

def send_slack_alert(support_data, ticket_data):
    """Send Slack alert for new support ticket"""
    if not SLACK_WEBHOOK_URL:
        return {"error": "Slack webhook not configured"}
    
    ticket_id = ticket_data.get("ticket", {}).get("id", "Unknown") if ticket_data and "ticket" in ticket_data else "N/A"
    
    message = {
        "text": f"🎫 *New Support Ticket*",
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"🎫 *New Support Ticket #{ticket_id}*\n\n*Subject:* {support_data.get('subject', 'N/A')}\n*Customer:* {support_data.get('name', 'N/A')}\n*Email:* {support_data.get('email', 'N/A')}\n*Priority:* {support_data.get('priority', 'Medium')}"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*Description:*\n{support_data.get('description', 'No description provided')[:200]}..."
                }
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "View Ticket"
                        },
                        "url": f"https://{ZENDESK_DOMAIN}.zendesk.com/agent/tickets/{ticket_id}"
                    }
                ]
            }
        ]
    }
    
    try:
        response = requests.post(SLACK_WEBHOOK_URL, json=message, timeout=30)
        return {"status": "alert_sent"}
    except Exception as e:
        return {"error": f"Slack alert failed: {str(e)}"}

@app.route('/webhooks/hubspot-support', methods=['POST'])
def handle_hubspot_support():
    """Handle incoming HubSpot support form submission"""
    try:
        data = request.json
        
        # Extract support data from HubSpot webhook payload
        support_data = {
            "subject": data.get("subject", data.get("ticket_subject", "Support Request")),
            "name": data.get("firstname", "") + " " + data.get("lastname", ""),
            "email": data.get("email", ""),
            "phone": data.get("phone", ""),
            "description": data.get("message", data.get("description", "")),
            "priority": data.get("priority", "Medium"),
            "category": data.get("category", data.get("issue_type", "General")),
            "company": data.get("company", ""),
            "source": "HubSpot Form"
        }
        
        # Process the support request
        airtable_result = log_to_airtable(support_data)
        zendesk_result = create_zendesk_ticket(support_data)
        slack_result = send_slack_alert(support_data, zendesk_result)
        
        return jsonify({
            "success": True,
            "message": "Support ticket processed successfully",
            "support_data": support_data,
            "results": {
                "airtable_log": airtable_result,
                "zendesk_ticket": zendesk_result,
                "slack_alert": slack_result
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Support webhook processing failed: {str(e)}"
        }), 500

@app.route('/webhooks/hubspot-support', methods=['GET'])
def hubspot_support_status():
    """Health check for HubSpot support webhook"""
    return jsonify({
        "status": "active",
        "endpoint": "/webhooks/hubspot-support",
        "method": "POST",
        "description": "HubSpot support form webhook handler",
        "integrations": {
            "airtable": bool(AIRTABLE_API_KEY and AIRTABLE_BASE_ID),
            "zendesk": bool(ZENDESK_DOMAIN and ZENDESK_EMAIL and ZENDESK_API_TOKEN),
            "slack": bool(SLACK_WEBHOOK_URL)
        }
    })

if __name__ == '__main__':
    app.run(debug=True, port=5002)