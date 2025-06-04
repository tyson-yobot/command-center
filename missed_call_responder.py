"""
Missed Call Responder
Handles missed calls with automatic SMS fallback and Airtable logging
"""
import os
import requests
from datetime import datetime

AIRTABLE_KEY = os.getenv("AIRTABLE_KEY")
BASE_ID = os.getenv("AIRTABLE_BASE_ID")
TABLE_ID = os.getenv("TABLE_ID")  # Optional if you're using table name
TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID") or os.getenv("TWILIO_SID")
TWILIO_AUTH = os.getenv("TWILIO_AUTH_TOKEN") or os.getenv("TWILIO_AUTH")
TWILIO_FROM = os.getenv("TWILIO_PHONE_NUMBER") or os.getenv("TWILIO_FROM")

def send_fallback_sms(to_number):
    """Send SMS fallback for missed calls"""
    if not TWILIO_SID or not TWILIO_AUTH or not TWILIO_FROM:
        print("Missing Twilio credentials for SMS fallback")
        return False
        
    url = f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_SID}/Messages.json"
    auth = (TWILIO_SID, TWILIO_AUTH)
    data = {
        "To": to_number,
        "From": TWILIO_FROM,
        "Body": "Hi! We missed your call to YoBot. Reply here or schedule a callback at yobot.bot 🚀"
    }
    
    try:
        response = requests.post(url, data=data, auth=auth)
        response.raise_for_status()
        print(f"✅ SMS fallback sent to {to_number}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to send SMS fallback: {e}")
        return False

def log_outcome_to_airtable(record_id):
    """Update Airtable record with missed call outcome"""
    if not AIRTABLE_KEY or not BASE_ID or not TABLE_ID:
        print("Missing Airtable credentials for outcome logging")
        return False
        
    url = f"https://api.airtable.com/v0/{BASE_ID}/{TABLE_ID}/{record_id}"
    headers = {
        "Authorization": f"Bearer {AIRTABLE_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "fields": {
            "📄 Call Outcome": "🔕 Missed",
            "📅 Follow-up Sent": datetime.utcnow().isoformat(),
            "📱 SMS Fallback": True
        }
    }
    
    try:
        response = requests.patch(url, json=payload, headers=headers)
        response.raise_for_status()
        print(f"✅ Airtable record {record_id} updated with missed call outcome")
        return True
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to update Airtable record: {e}")
        return False

def handler(request):
    """Main handler for missed call responses"""
    try:
        if hasattr(request, 'json'):
            data = request.json
        else:
            data = request
            
        record_id = data.get("airtable_record_id")
        phone_number = data.get("phone")
        
        if not phone_number:
            return {"status": "error", "message": "Phone number required"}
            
        # Send SMS fallback
        sms_sent = send_fallback_sms(phone_number)
        
        # Update Airtable if record ID provided
        airtable_updated = False
        if record_id:
            airtable_updated = log_outcome_to_airtable(record_id)
        
        print(f"📵 Missed call follow-up processed for {phone_number}")
        
        return {
            "status": "processed",
            "phone": phone_number,
            "sms_sent": sms_sent,
            "airtable_updated": airtable_updated,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Error processing missed call response: {e}")
        return {"status": "error", "message": str(e)}

def missed_call_responder():
    """Flask route wrapper for missed call responses"""
    from flask import request
    return handler(request)

if __name__ == "__main__":
    # Test the missed call responder
    test_data = {
        "airtable_record_id": "recTestRecord123",
        "phone": "+1234567890"
    }
    result = handler(test_data)
    print(f"Test result: {result}")