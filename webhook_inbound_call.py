"""
Webhook handler for incoming Twilio calls
Handles the incoming Twilio call and starts the VoiceBot
"""
from flask import request, Response
import os
import requests
from datetime import datetime

AIRTABLE_KEY = os.getenv("AIRTABLE_API_KEY")
BASE_ID = os.getenv("AIRTABLE_BASE_ID")
TABLE_NAME = "📥 Inbound Call Log"

def log_command_center_event(msg):
    """Log command center events"""
    print(f"[{datetime.now()}] {msg}")

def log_to_airtable(phone_number):
    """Log inbound call to Airtable"""
    if not AIRTABLE_KEY or not BASE_ID:
        print("Missing Airtable credentials for call logging")
        return
    
    url = f"https://api.airtable.com/v0/{BASE_ID}/{TABLE_NAME}"
    headers = {
        "Authorization": f"Bearer {AIRTABLE_KEY}",
        "Content-Type": "application/json"
    }
    
    fields = {
        "📞 Caller Number": phone_number,
        "📅 Call Time": datetime.utcnow().isoformat(),
        "🎤 VoiceBot Engaged": True,
        "📄 Call Outcome": "Resolved"  # default for now
    }
    
    try:
        response = requests.post(url, json={"fields": fields}, headers=headers)
        response.raise_for_status()
        print(f"✅ Logged inbound call from {phone_number} to Airtable")
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to log call to Airtable: {e}")

def handler(request):
    """Main webhook handler for inbound calls"""
    # Check if inbound voice is enabled
    if os.getenv("INBOUND_VOICE_ENABLED") == "false":
        log_command_center_event("📞 Inbound call rejected - VoiceBot disabled")
        return Response("<Response><Reject/></Response>", mimetype="text/xml")
    
    # Get caller information
    from_number = request.form.get("From")
    log_command_center_event(f"📞 Inbound call from {from_number}")
    log_to_airtable(from_number)

    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna">Welcome to YoBot. Please tell me how I can help you.</Say>
    <Pause length="1"/>
    <Redirect>https://your-replit-url/voicebot_stream</Redirect>
</Response>
"""
    return Response(twiml, mimetype="text/xml")

def webhook_inbound_call():
    """Flask route wrapper"""
    return handler(request)

if __name__ == "__main__":
    # Test the webhook handler
    print("Testing inbound call webhook handler...")
    print("Handler ready for Twilio integration")