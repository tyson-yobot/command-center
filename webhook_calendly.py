"""
Calendly Webhook Handler
Replaces Zapier → Calendly integration
Receives booking data, logs to Airtable, syncs to HubSpot, triggers notifications
"""

import os
import requests
from datetime import datetime
from flask import Flask, request, jsonify

app = Flask(__name__)

# Environment variables
AIRTABLE_API_KEY = os.getenv('AIRTABLE_API_KEY')
AIRTABLE_BASE_ID = os.getenv('AIRTABLE_BASE_ID')
HUBSPOT_API_KEY = os.getenv('HUBSPOT_API_KEY')
SLACK_WEBHOOK_URL = os.getenv('SLACK_WEBHOOK_URL')

def log_to_airtable(booking_data):
    """Log Calendly booking to Airtable"""
    if not AIRTABLE_API_KEY or not AIRTABLE_BASE_ID:
        return {"error": "Airtable credentials not configured"}
    
    url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/Calendly%20Bookings"
    headers = {
        "Authorization": f"Bearer {AIRTABLE_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "records": [{
            "fields": {
                "📅 Event Name": booking_data.get("event_name", ""),
                "👤 Attendee Name": booking_data.get("attendee_name", ""),
                "📧 Email": booking_data.get("email", ""),
                "📞 Phone": booking_data.get("phone", ""),
                "🕒 Scheduled Time": booking_data.get("start_time", ""),
                "⏰ Duration": booking_data.get("duration", ""),
                "🔗 Meeting Link": booking_data.get("meeting_url", ""),
                "📝 Notes": booking_data.get("notes", ""),
                "✅ Status": "Confirmed",
                "🕐 Created": datetime.now().isoformat()
            }
        }]
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        return response.json()
    except Exception as e:
        return {"error": f"Airtable logging failed: {str(e)}"}

def sync_to_hubspot(booking_data):
    """Sync booking to HubSpot contact"""
    if not HUBSPOT_API_KEY:
        return {"error": "HubSpot API key not configured"}
    
    # Create or update contact
    contact_url = "https://api.hubapi.com/crm/v3/objects/contacts"
    headers = {
        "Authorization": f"Bearer {HUBSPOT_API_KEY}",
        "Content-Type": "application/json"
    }
    
    contact_payload = {
        "properties": {
            "email": booking_data.get("email", ""),
            "firstname": booking_data.get("attendee_name", "").split()[0] if booking_data.get("attendee_name") else "",
            "lastname": " ".join(booking_data.get("attendee_name", "").split()[1:]) if len(booking_data.get("attendee_name", "").split()) > 1 else "",
            "phone": booking_data.get("phone", ""),
            "lifecyclestage": "opportunity",
            "hs_lead_status": "NEW",
            "calendly_booking_date": booking_data.get("start_time", ""),
            "calendly_event_type": booking_data.get("event_name", "")
        }
    }
    
    try:
        response = requests.post(contact_url, headers=headers, json=contact_payload, timeout=30)
        return response.json()
    except Exception as e:
        return {"error": f"HubSpot sync failed: {str(e)}"}

def send_slack_notification(booking_data):
    """Send Slack notification for new booking"""
    if not SLACK_WEBHOOK_URL:
        return {"error": "Slack webhook not configured"}
    
    message = {
        "text": f"📅 *New Calendly Booking*",
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"📅 *New Calendly Booking*\n\n*Event:* {booking_data.get('event_name', 'N/A')}\n*Attendee:* {booking_data.get('attendee_name', 'N/A')}\n*Email:* {booking_data.get('email', 'N/A')}\n*Time:* {booking_data.get('start_time', 'N/A')}"
                }
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "View in HubSpot"
                        },
                        "url": f"https://app.hubspot.com/contacts/search/{booking_data.get('email', '')}"
                    }
                ]
            }
        ]
    }
    
    try:
        response = requests.post(SLACK_WEBHOOK_URL, json=message, timeout=30)
        return {"status": "notification_sent"}
    except Exception as e:
        return {"error": f"Slack notification failed: {str(e)}"}

@app.route('/webhooks/calendly-booking', methods=['POST'])
def handle_calendly_webhook():
    """Handle incoming Calendly webhook"""
    try:
        data = request.json
        
        # Extract booking information from Calendly webhook payload
        event = data.get('payload', {}).get('event', {})
        invitee = data.get('payload', {}).get('invitee', {})
        
        booking_data = {
            "event_name": event.get('event_type', {}).get('name', ''),
            "attendee_name": invitee.get('name', ''),
            "email": invitee.get('email', ''),
            "phone": invitee.get('text_reminder_number', ''),
            "start_time": event.get('start_time', ''),
            "duration": event.get('event_type', {}).get('duration', ''),
            "meeting_url": event.get('location', {}).get('join_url', ''),
            "notes": invitee.get('questions_and_answers', [{}])[0].get('answer', '') if invitee.get('questions_and_answers') else '',
            "timezone": invitee.get('timezone', '')
        }
        
        # Process the booking
        results = {
            "airtable_log": log_to_airtable(booking_data),
            "hubspot_sync": sync_to_hubspot(booking_data),
            "slack_notification": send_slack_notification(booking_data)
        }
        
        return jsonify({
            "success": True,
            "message": "Calendly booking processed successfully",
            "booking_data": booking_data,
            "results": results
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Webhook processing failed: {str(e)}"
        }), 500

@app.route('/webhooks/calendly-booking', methods=['GET'])
def calendly_webhook_status():
    """Health check for Calendly webhook"""
    return jsonify({
        "status": "active",
        "endpoint": "/webhooks/calendly-booking",
        "method": "POST",
        "description": "Calendly booking webhook handler"
    })

if __name__ == '__main__':
    app.run(debug=True, port=5001)