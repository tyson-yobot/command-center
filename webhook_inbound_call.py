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
    """Log inbound call to Airtable and return record ID for missed call tracking"""
    if not AIRTABLE_KEY or not BASE_ID:
        print("Missing Airtable credentials for call logging")
        return None
    
    url = f"https://api.airtable.com/v0/{BASE_ID}/{TABLE_NAME}"
    headers = {
        "Authorization": f"Bearer {AIRTABLE_KEY}",
        "Content-Type": "application/json"
    }
    
    fields = {
        "📞 Caller Number": phone_number,
        "📅 Call Time": datetime.utcnow().isoformat(),
        "🎤 VoiceBot Engaged": True,
        "📄 Call Outcome": "In Progress"
    }
    
    try:
        response = requests.post(url, json={"records": [{"fields": fields}]}, headers=headers)
        response.raise_for_status()
        record_data = response.json()
        record_id = record_data['records'][0]['id']
        print(f"✅ Logged inbound call from {phone_number} to Airtable (Record: {record_id})")
        return record_id
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to log call to Airtable: {e}")
        return None

def trigger_missed_call_fallback(phone_number, record_id=None):
    """Trigger missed call SMS fallback"""
    try:
        webhook_url = "https://72ddfeee-d145-4891-a820-14d5b3e09c66-00-c9rkbm78q1s2.worf.replit.dev/api/missed-call-responder"
        payload = {
            "phone": phone_number,
            "airtable_record_id": record_id
        }
        
        response = requests.post(webhook_url, json=payload, timeout=10)
        if response.ok:
            print(f"✅ Missed call fallback triggered for {phone_number}")
            log_command_center_event(f"📵 Missed call SMS fallback sent to {phone_number}")
        else:
            print(f"❌ Failed to trigger missed call fallback: {response.status_code}")
    except Exception as e:
        print(f"❌ Error triggering missed call fallback: {e}")

def detect_call_hangup(call_status, call_duration=0):
    """Detect if call was missed or hung up quickly"""
    missed_indicators = ['no-answer', 'busy', 'failed', 'canceled']
    return call_status in missed_indicators or (call_duration and int(call_duration) < 5)

def is_silent_caller(call_duration=0, recording_url=None):
    """Detect if caller is silent or didn't speak"""
    # If call duration is very short or no recording, likely silent
    return int(call_duration) < 3 or not recording_url

def call_timed_out(call_duration=0):
    """Detect if call timed out without interaction"""
    # If call lasted longer than expected but no meaningful interaction
    return int(call_duration) > 30 and int(call_duration) < 60

def handler(request):
    """Main webhook handler for inbound calls"""
    # Check if inbound voice is enabled
    if os.getenv("INBOUND_VOICE_ENABLED") == "false":
        log_command_center_event("📞 Inbound call rejected - VoiceBot disabled")
        return Response("<Response><Reject/></Response>", mimetype="text/xml")
    
    # Get caller information
    from_number = request.form.get("From")
    call_status = request.form.get("CallStatus", "in-progress")
    call_duration = request.form.get("CallDuration", "0")
    
    log_command_center_event(f"📞 Inbound call from {from_number} (Status: {call_status})")
    
    # Log call to Airtable and get record ID
    record_id = log_to_airtable(from_number)
    
    # Implement trigger logic as specified
    recording_url = request.form.get("RecordingUrl")
    
    # Check if call should trigger missed call responder
    if is_silent_caller(call_duration, recording_url) or call_timed_out(call_duration):
        log_command_center_event(f"📵 Silent caller or timeout detected - triggering SMS fallback")
        # Trigger missed call responder with exact logic pattern
        requests.post("https://72ddfeee-d145-4891-a820-14d5b3e09c66-00-c9rkbm78q1s2.worf.replit.dev/api/missed-call-responder", json={
            "airtable_record_id": record_id,
            "phone": from_number
        })
        return Response("<Response><Hangup/></Response>", mimetype="text/xml")
    
    # Also check traditional missed call indicators
    if detect_call_hangup(call_status, call_duration):
        log_command_center_event(f"📵 Call detected as missed - triggering SMS fallback")
        requests.post("https://72ddfeee-d145-4891-a820-14d5b3e09c66-00-c9rkbm78q1s2.worf.replit.dev/api/missed-call-responder", json={
            "airtable_record_id": record_id,
            "phone": from_number
        })
        return Response("<Response><Hangup/></Response>", mimetype="text/xml")
    
    # Handle successful call connection
    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna">Welcome to YoBot. Please tell me how I can help you.</Say>
    <Pause length="2"/>
    <Record timeout="30" transcribe="true" recordingStatusCallback="https://72ddfeee-d145-4891-a820-14d5b3e09c66-00-c9rkbm78q1s2.worf.replit.dev/api/call-completed" />
    <Say voice="Polly.Joanna">Thank you for calling YoBot. Have a great day!</Say>
</Response>
"""
    return Response(twiml, mimetype="text/xml")

def call_status_callback(request):
    """Handle call status callbacks from Twilio"""
    call_status = request.form.get("CallStatus")
    from_number = request.form.get("From")
    call_duration = request.form.get("CallDuration", "0")
    recording_url = request.form.get("RecordingUrl")
    
    log_command_center_event(f"📞 Call status update: {from_number} - {call_status}")
    
    # Get saved Airtable record ID from initial call logging
    # In production, this would be stored temporarily and retrieved here
    airtable_id = None  # This should be retrieved from temporary storage
    
    # Implement trigger logic as specified
    if is_silent_caller(call_duration, recording_url) or call_timed_out(call_duration):
        requests.post("https://72ddfeee-d145-4891-a820-14d5b3e09c66-00-c9rkbm78q1s2.worf.replit.dev/api/missed-call-responder", json={
            "airtable_record_id": airtable_id,
            "phone": from_number
        })
    
    return Response("OK", mimetype="text/plain")

def webhook_inbound_call():
    """Flask route wrapper"""
    return handler(request)

if __name__ == "__main__":
    # Test the webhook handler
    print("Testing inbound call webhook handler...")
    print("Handler ready for Twilio integration")