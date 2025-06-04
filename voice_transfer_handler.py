"""
Voice Transfer Handler
Handles fake transfers with realistic delays for YoBot voice calls
"""
import time
import re

def perform_fake_transfer(name):
    """
    Simulates transfer to specified person with 5-second delay
    Returns unavailable message for realistic handling
    """
    print(f"⏳ Simulating transfer to {name.title()}...")
    time.sleep(5)
    return f"Sorry, {name.title()} is currently unavailable. Would you like to leave a message for them?"

def check_transfer_command(text):
    """
    Checks if user is requesting a transfer to someone
    Returns the name if transfer detected, None otherwise
    """
    text_lower = text.lower()
    
    # Common transfer patterns
    transfer_patterns = [
        r"transfer me to (\w+)",
        r"can i speak to (\w+)",
        r"i need to talk to (\w+)",
        r"put me through to (\w+)",
        r"connect me to (\w+)",
        r"i want to speak with (\w+)",
        r"is (\w+) available",
        r"can you get (\w+)",
        r"let me talk to (\w+)"
    ]
    
    for pattern in transfer_patterns:
        match = re.search(pattern, text_lower)
        if match:
            return match.group(1)
    
    return None

def handle_voice_transfer(conversation, reply):
    """
    Handles transfer logic within voice conversation
    Returns tuple: (should_continue, updated_conversation)
    """
    transfer_target = check_transfer_command(reply)
    if transfer_target:
        print(f"🎭 Faking transfer to {transfer_target}")
        fake_reply = perform_fake_transfer(transfer_target)
        conversation.append({"role": "assistant", "content": fake_reply})
        return True, conversation  # Should continue with fake reply instead of GPT
    
    return False, conversation  # No transfer, proceed normally

def log_voicemail_and_alert(message_text, caller_number="+1UNKNOWN"):
    """
    Logs voicemail message to Airtable and sends SMS alert
    """
    import os
    import requests
    
    try:
        # 1. Save to Airtable
        airtable_url = f"https://api.airtable.com/v0/{os.getenv('AIRTABLE_BASE_ID')}/{os.getenv('TABLE_ID')}"
        headers = {
            "Authorization": f"Bearer {os.getenv('AIRTABLE_KEY')}",
            "Content-Type": "application/json"
        }
        data = {
            "fields": {
                "📄 Call Outcome": "📩 Voicemail",
                "📞 Caller Phone": caller_number,
                "📝 Caller Message": message_text
            }
        }
        
        airtable_response = requests.post(airtable_url, headers=headers, json=data)
        print(f"📝 Airtable log: {airtable_response.status_code}")
        
        # 2. Send SMS via Twilio
        sms_payload = {
            "To": os.getenv("ALERT_PHONE"),  # Alert phone number
            "From": os.getenv("TWILIO_FROM"),
            "Body": f"📩 New message from {caller_number}:\n\"{message_text}\""
        }
        
        sms_response = requests.post(
            f"https://api.twilio.com/2010-04-01/Accounts/{os.getenv('TWILIO_SID')}/Messages.json",
            auth=(os.getenv("TWILIO_SID"), os.getenv("TWILIO_AUTH")),
            data=sms_payload
        )
        print(f"📱 SMS alert sent: {sms_response.status_code}")
        
        # 3. Schedule callback for 1 hour later
        schedule_callback(caller_number)
        
        return True
        
    except Exception as e:
        print(f"❌ Voicemail logging error: {e}")
        return False

def schedule_callback(caller_number):
    """
    Schedules a callback 1 hour after voicemail is received
    """
    import os
    import requests
    from datetime import datetime, timedelta
    
    try:
        callback_time = (datetime.utcnow() + timedelta(hours=1)).strftime("%Y-%m-%dT%H:%M:%S.000Z")

        airtable_url = f"https://api.airtable.com/v0/{os.getenv('AIRTABLE_BASE_ID')}/{os.getenv('TABLE_ID')}"
        headers = {
            "Authorization": f"Bearer {os.getenv('AIRTABLE_KEY')}",
            "Content-Type": "application/json"
        }

        data = {
            "fields": {
                "📄 Call Outcome": "📩 Callback Needed",
                "📞 Caller Phone": caller_number,
                "📅 Callback Scheduled": callback_time
            }
        }

        response = requests.post(airtable_url, headers=headers, json=data)
        print("✅ Callback record created:", response.json())
        return response.status_code == 200
        
    except Exception as e:
        print(f"❌ Callback scheduling error: {e}")
        return False

def check_message_response(text):
    """
    Checks if caller is providing a message after being asked
    """
    message_indicators = [
        "yes", "sure", "please tell them", "let them know",
        "tell him", "tell her", "my message is", "here's my message"
    ]
    
    text_lower = text.lower()
    for indicator in message_indicators:
        if indicator in text_lower:
            return True
    
    # If text is longer than a few words, likely a message
    if len(text.split()) > 5:
        return True
        
    return False

def test_transfer_handler():
    """Test the transfer detection and handling"""
    test_phrases = [
        "Can you transfer me to Mike?",
        "I need to speak with Sarah",
        "Is John available?",
        "Put me through to the manager",
        "Hello, how are you today?"  # Should not trigger transfer
    ]
    
    for phrase in test_phrases:
        target = check_transfer_command(phrase)
        if target:
            print(f"✅ Transfer detected: '{phrase}' -> {target}")
            fake_response = perform_fake_transfer(target)
            print(f"   Response: {fake_response}")
        else:
            print(f"❌ No transfer: '{phrase}'")
        print()

if __name__ == "__main__":
    test_transfer_handler()