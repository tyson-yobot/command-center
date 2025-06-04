"""
Calendly Event Webhook Handler
Replaces Zapier integration with direct webhook processing
"""

import os
import requests
from datetime import datetime

def log_command_center_event(msg):
    """Log events to command center with timestamp"""
    print(f"[{datetime.now()}] {msg}")

def handler(request):
    """Handle Calendly webhook events"""
    try:
        event = request.json
        
        # Extract event data
        invitee = event.get("payload", {}).get("invitee", {})
        event_data = event.get("payload", {}).get("event", {})
        event_type = event.get("payload", {}).get("event_type", {})
        
        name = invitee.get("name", "Unknown")
        email = invitee.get("email", "")
        start_time = event_data.get("start_time", "")
        event_type_name = event_type.get("name", "Unknown Event")
        
        log_command_center_event(f"📆 New Calendly booking: {name} ({email}) - {event_type_name}")
        
        # Log to Airtable
        if os.getenv("AIRTABLE_KEY") or os.getenv("AIRTABLE_API_KEY"):
            try:
                log_booking_to_airtable(name, email, event_type_name, start_time)
            except Exception as e:
                log_command_center_event(f"❌ Airtable logging failed: {e}")
        
        # Send Slack alert
        if os.getenv("SLACK_ALERT_URL"):
            try:
                send_slack_alert(name, email, event_type_name, start_time)
            except Exception as e:
                log_command_center_event(f"❌ Slack alert failed: {e}")
        
        return {
            "success": True,
            "status": "logged",
            "booking": {
                "name": name,
                "email": email,
                "event_type": event_type_name,
                "start_time": start_time
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        log_command_center_event(f"❌ Calendly webhook error: {e}")
        return {"error": str(e)}

def log_booking_to_airtable(name, email, event_type, start_time):
    """Log booking to Airtable"""
    api_key = os.getenv("AIRTABLE_KEY") or os.getenv("AIRTABLE_API_KEY")
    base_id = os.getenv("AIRTABLE_BASE_ID")
    table_name = os.getenv("TABLE_CALENDLY", "🗓️ Calendly Event Log")
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    data = {
        "fields": {
            "👤 Name": name,
            "📧 Email": email,
            "📅 Event Type": event_type,
            "⏰ Start Time": start_time,
            "🔁 Source": "Calendly Webhook",
            "📅 Logged At": datetime.utcnow().isoformat()
        }
    }
    
    url = f"https://api.airtable.com/v0/{base_id}/{table_name}"
    response = requests.post(url, json=data, headers=headers)
    response.raise_for_status()

def send_slack_alert(name, email, event_type, start_time):
    """Send Slack alert for new booking"""
    webhook_url = os.getenv("SLACK_ALERT_URL")
    
    alert_msg = f"📆 *New Calendly Booking*\n👤 {name}\n📧 {email}\n🗓️ {event_type}\n⏰ {start_time}"
    
    response = requests.post(webhook_url, json={"text": alert_msg})
    response.raise_for_status()

if __name__ == "__main__":
    # Test the handler
    test_payload = {
        "payload": {
            "invitee": {
                "name": "John Smith",
                "email": "john@example.com"
            },
            "event": {
                "start_time": "2025-06-04T15:00:00Z"
            },
            "event_type": {
                "name": "30 Minute Demo"
            }
        }
    }
    
    class MockRequest:
        def __init__(self, payload):
            self.json = payload
    
    result = handler(MockRequest(test_payload))
    print(f"Test result: {result}")