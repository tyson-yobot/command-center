from flask import Flask, request
import requests
import os
from datetime import datetime

app = Flask(__name__)

def log_chat_to_crm(name, email, message, timestamp):
    """Log chat message to HubSpot CRM"""
    try:
        response = requests.post("https://api.hubapi.com/crm/v3/objects/contacts", 
            headers={
                "Authorization": f"Bearer {os.getenv('HUBSPOT_API_KEY')}",
                "Content-Type": "application/json"
            }, 
            json={
                "properties": {
                    "email": email,
                    "firstname": name,
                    "last_chat_message": message,
                    "last_chat_timestamp": timestamp,
                    "hs_lead_status": "NEW",
                    "lifecyclestage": "lead",
                    "lead_source": "Live Chat"
                }
            }
        )
        if response.status_code == 201:
            print(f"✅ Chat logged to CRM for {name}")
        else:
            print(f"⚠️ CRM logging failed: {response.status_code}")
    except Exception as e:
        print(f"❌ CRM logging error: {e}")

def log_chat_to_airtable(name, email, message, timestamp):
    """Log chat message to Airtable Lead Tracker"""
    try:
        response = requests.post(
            f"https://api.airtable.com/v0/{os.getenv('AIRTABLE_BASE_ID')}/🎯%20Lead%20Qualification%20Tracker", 
            headers={
                "Authorization": f"Bearer {os.getenv('AIRTABLE_API_KEY')}",
                "Content-Type": "application/json"
            }, 
            json={
                "fields": {
                    "👤 Name": name,
                    "📧 Email": email,
                    "💬 Message": message[:500],  # Limit message length
                    "🕒 Timestamp": timestamp,
                    "📋 Source": "Live Chat",
                    "📊 Status": "New Lead"
                }
            }
        )
        if response.status_code == 200:
            print(f"✅ Chat logged to Airtable for {name}")
        else:
            print(f"⚠️ Airtable logging failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Airtable logging error: {e}")

def inject_chat_to_rag(name, email, message, timestamp):
    """Inject chat message into RAG knowledge base"""
    try:
        response = requests.post(os.getenv("RAG_INDEX_URL"), 
            headers={
                "Authorization": f"Bearer {os.getenv('RAG_API_KEY')}",
                "Content-Type": "application/json"
            }, 
            json={
                "source": "Live Chat",
                "reference_id": email,
                "content": f"{name} wrote at {timestamp}: {message}. This indicates customer interest and engagement through live chat channel.",
                "tags": ["chat", "inbound", "crm", "customer_engagement"],
                "timestamp": timestamp,
                "priority": "medium",
                "searchable": True
            }
        )
        if response.status_code == 200:
            print(f"✅ Chat injected to RAG for {name}")
        else:
            print(f"⚠️ RAG injection failed: {response.status_code}")
    except Exception as e:
        print(f"❌ RAG injection error: {e}")

def send_chat_slack_alert(name, email, message):
    """Send Slack notification for new chat"""
    try:
        response = requests.post(os.getenv("SLACK_WEBHOOK_URL"), 
            json={
                "text": f"💬 New chat from *{name}* ({email}):\n> {message[:200]}{'...' if len(message) > 200 else ''}",
                "blocks": [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": f"💬 *New Live Chat*\n\n*From:* {name}\n*Email:* {email}\n*Message:* {message}"
                        }
                    },
                    {
                        "type": "actions",
                        "elements": [
                            {
                                "type": "button",
                                "text": {"type": "plain_text", "text": "View in CRM"},
                                "style": "primary",
                                "url": f"https://app.hubspot.com/contacts/search?term={email}"
                            }
                        ]
                    }
                ]
            }
        )
        if response.status_code == 200:
            print(f"✅ Slack alert sent for {name}")
        else:
            print(f"⚠️ Slack alert failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Slack alert error: {e}")

def log_chat_to_metrics(name, email, timestamp):
    """Log chat to Command Center metrics tracker"""
    try:
        response = requests.post(
            f"https://api.airtable.com/v0/{os.getenv('AIRTABLE_BASE_ID')}/📊%20Command%20Center%20·%20Metrics%20Tracker", 
            headers={
                "Authorization": f"Bearer {os.getenv('AIRTABLE_API_KEY')}",
                "Content-Type": "application/json"
            }, 
            json={
                "fields": {
                    "📌 Event Type": "💬 Inbound Chat",
                    "🔗 Source": "Webchat",
                    "🆔 Ref ID": email,
                    "📝 Summary": f"Chat started by {name}",
                    "🕒 Timestamp": timestamp
                }
            }
        )
        if response.status_code == 200:
            print(f"✅ Chat logged to metrics for {name}")
        else:
            print(f"⚠️ Metrics logging failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Metrics logging error: {e}")

def log_chat_to_command_center(name, email, message, timestamp):
    """Log chat to Command Center API"""
    try:
        response = requests.post(os.getenv("COMMAND_CENTER_METRICS_URL"), 
            headers={
                "Authorization": f"Bearer {os.getenv('COMMAND_CENTER_API_KEY')}",
                "Content-Type": "application/json"
            }, 
            json={
                "event": "💬 Inbound Chat",
                "source": "Webchat",
                "reference_id": email,
                "details": f"{name} wrote: {message[:100]}{'...' if len(message) > 100 else ''}",
                "timestamp": timestamp
            }
        )
        if response.status_code == 200:
            print(f"✅ Chat logged to Command Center for {name}")
        else:
            print(f"⚠️ Command Center logging failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Command Center logging error: {e}")

@app.route("/chat-webhook", methods=["POST"])
def chat_webhook():
    """Process incoming chat messages across all systems"""
    data = request.json
    name = data.get("name", "Unknown")
    email = data.get("email", "")
    message = data.get("message", "")
    timestamp = data.get("timestamp", datetime.utcnow().isoformat())

    if not email or not message:
        return {"error": "Email and message are required"}, 400

    # Process chat across all integrations - Full Auto-Responder Chain
    log_chat_to_crm(name, email, message, timestamp)
    log_chat_to_airtable(name, email, message, timestamp)
    inject_chat_to_rag(name, email, message, timestamp)
    send_chat_slack_alert(name, email, message)
    log_chat_to_metrics(name, email, timestamp)
    log_chat_to_command_center(name, email, message, timestamp)

    return {
        "success": True,
        "message": "Chat processed across all systems",
        "timestamp": timestamp
    }, 200

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "chat_webhook"}, 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)