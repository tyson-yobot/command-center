"""
Start Outbound Call
Triggers outbound calls for missed call retries using Twilio
"""
import os
import requests
from datetime import datetime

# Environment variables
TWILIO_SID = os.getenv("TWILIO_SID")
TWILIO_AUTH = os.getenv("TWILIO_AUTH") 
TWILIO_FROM = os.getenv("TWILIO_FROM")
AIRTABLE_KEY = os.getenv("AIRTABLE_KEY", "paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa")
AIRTABLE_BASE_ID = os.getenv("AIRTABLE_BASE_ID", "appRt8V3tH4g5Z5if")
TABLE_ID = os.getenv("TABLE_ID", "tbldPRZ4nHbtj9opU")

def start_outbound_call(phone, airtable_record_id=None, retry=False):
    """Start outbound call using Twilio API"""
    
    if not phone:
        return {"error": "Missing phone number"}
    
    if not all([TWILIO_SID, TWILIO_AUTH, TWILIO_FROM]):
        return {"error": "Missing Twilio credentials"}
    
    try:
        # Create outbound call using Twilio REST API
        twilio_url = f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_SID}/Calls.json"
        twilio_auth = (TWILIO_SID, TWILIO_AUTH)
        
        # TwiML URL for the callback greeting
        twiml_url = "https://72ddfeee-d145-4891-a820-14d5b3e09c66-00-c9rkbm78q1s2.worf.replit.dev/api/voicebot-greeting"
        status_callback_url = "https://72ddfeee-d145-4891-a820-14d5b3e09c66-00-c9rkbm78q1s2.worf.replit.dev/api/call-completed"
        
        call_data = {
            'To': phone,
            'From': TWILIO_FROM,
            'Url': twiml_url,
            'StatusCallback': status_callback_url,
            'StatusCallbackEvent': 'initiated,completed'
        }
        
        response = requests.post(twilio_url, data=call_data, auth=twilio_auth)
        response.raise_for_status()
        
        call_info = response.json()
        call_sid = call_info.get('sid')
        
        print(f"📞 Outbound call initiated: {phone} → SID: {call_sid}")
        
        # Update Airtable record if provided
        if airtable_record_id:
            update_airtable_retry_status(airtable_record_id, call_sid, retry)
        
        return {
            "success": True, 
            "sid": call_sid, 
            "phone": phone,
            "retry": retry,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except requests.exceptions.RequestException as e:
        error_msg = f"Failed to initiate outbound call: {e}"
        print(f"❌ {error_msg}")
        return {"error": error_msg}

def update_airtable_retry_status(record_id, call_sid, is_retry):
    """Update Airtable record with retry call status"""
    
    try:
        url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{TABLE_ID}/{record_id}"
        headers = {
            "Authorization": f"Bearer {AIRTABLE_KEY}",
            "Content-Type": "application/json"
        }
        
        fields = {
            "📞 Outbound Call SID": call_sid,
            "📅 Retry Call Time": datetime.utcnow().isoformat(),
            "📄 Call Outcome": "🔄 Retry In Progress" if is_retry else "📞 Callback Initiated"
        }
        
        update_data = {"fields": fields}
        
        response = requests.patch(url, json=update_data, headers=headers)
        if response.ok:
            print(f"✅ Updated Airtable record {record_id} with retry status")
        else:
            print(f"❌ Failed to update Airtable: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error updating Airtable retry status: {e}")

def generate_voicebot_greeting():
    """Generate TwiML for voicebot greeting"""
    
    twiml = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna">Hello! This is YoBot calling you back. We noticed you tried to reach us earlier. How can I help you today?</Say>
    <Pause length="2"/>
    <Record timeout="30" transcribe="true" recordingStatusCallback="https://72ddfeee-d145-4891-a820-14d5b3e09c66-00-c9rkbm78q1s2.worf.replit.dev/api/call-completed" />
    <Say voice="Polly.Joanna">Thank you for your response. We'll follow up with you shortly. Have a great day!</Say>
</Response>"""
    
    return twiml

def handler(request_data):
    """Handle start outbound call requests"""
    
    if isinstance(request_data, dict):
        data = request_data
    else:
        data = request_data.get_json() if hasattr(request_data, 'get_json') else {}
    
    phone = data.get("phone")
    record_id = data.get("airtable_record_id")
    retry = data.get("retry", False)
    
    return start_outbound_call(phone, record_id, retry)

def start_outbound_call_route():
    """Flask route wrapper for outbound calls"""
    from flask import request
    return handler(request)

if __name__ == "__main__":
    # Test outbound call
    test_data = {
        "phone": "+15551234567",
        "airtable_record_id": "recTestOutbound123",
        "retry": True
    }
    result = handler(test_data)
    print(f"Test result: {result}")