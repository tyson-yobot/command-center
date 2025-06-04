"""
Inbound SMS Webhook Handler
Logs incoming SMS messages and provides auto-responses
"""

import requests
import os
from datetime import datetime
from command_center_dispatcher import CommandCenterDispatcher
from slack_alerts import alert_system

def handler(request):
    """Handle incoming SMS messages from Twilio"""
    dispatcher = CommandCenterDispatcher()
    
    try:
        # Extract SMS data from Twilio webhook
        data = request.form if hasattr(request, 'form') else request.json
        
        incoming_msg = data.get('Body', '')
        from_number = data.get('From', '')
        to_number = data.get('To', '')
        message_sid = data.get('MessageSid', '')
        account_sid = data.get('AccountSid', '')
        
        # Log to command center
        dispatcher.log_command_center_event(
            "inbound_sms", 
            f"📩 SMS from {from_number}: {incoming_msg[:100]}..."
        )
        
        # Log to Airtable if configured
        if os.getenv("AIRTABLE_API_KEY") and os.getenv("AIRTABLE_BASE_ID"):
            log_sms_to_airtable(from_number, incoming_msg, message_sid)
        
        # Analyze message for keywords
        response_message = analyze_and_respond(incoming_msg, from_number)
        
        # Send Slack alert for important messages
        if is_urgent_message(incoming_msg):
            alert_system.send_slack_alert(
                f"Urgent SMS from {from_number}: {incoming_msg}",
                "HIGH"
            )
        
        return {
            "success": True,
            "from": from_number,
            "message": incoming_msg,
            "response": response_message,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        error_msg = f"SMS webhook processing failed: {str(e)}"
        dispatcher.log_command_center_event("sms_webhook_error", error_msg)
        alert_system.alert_system_failure("SMS Webhook", str(e))
        
        return {"error": error_msg}

def log_sms_to_airtable(from_number, message, message_sid):
    """Log SMS to Airtable SMS tracking table"""
    try:
        airtable_api_key = os.getenv("AIRTABLE_API_KEY")
        airtable_base_id = os.getenv("AIRTABLE_BASE_ID")
        
        url = f"https://api.airtable.com/v0/{airtable_base_id}/📱%20SMS%20Log"
        headers = {
            "Authorization": f"Bearer {airtable_api_key}",
            "Content-Type": "application/json"
        }
        
        record_data = {
            "fields": {
                "📞 From Number": from_number,
                "💬 Message": message,
                "🆔 Message SID": message_sid,
                "📅 Received": datetime.now().isoformat(),
                "📂 Direction": "Inbound",
                "🏷️ Status": "Processed"
            }
        }
        
        response = requests.post(
            url,
            json={"records": [record_data]},
            headers=headers,
            timeout=10
        )
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"Failed to log SMS to Airtable: {str(e)}")
        return False

def analyze_and_respond(message, from_number):
    """Analyze message content and generate appropriate response"""
    message_lower = message.lower()
    
    # Keyword-based responses
    if any(word in message_lower for word in ['stop', 'unsubscribe', 'opt out']):
        return "You have been unsubscribed. Reply START to opt back in."
    
    elif any(word in message_lower for word in ['help', 'info', 'support']):
        return "For support, please call us at (555) 123-4567 or email support@yourdomain.com"
    
    elif any(word in message_lower for word in ['quote', 'estimate', 'price']):
        return "Thanks for your interest! A team member will contact you within 24 hours with a custom quote."
    
    elif any(word in message_lower for word in ['urgent', 'emergency', 'asap']):
        return "We've received your urgent message. A team member will contact you immediately."
    
    elif any(word in message_lower for word in ['appointment', 'schedule', 'meeting']):
        return "To schedule an appointment, please visit our booking page or call (555) 123-4567."
    
    else:
        return "Thanks for your message. A team member will review it and respond within 4 hours."

def is_urgent_message(message):
    """Check if message contains urgent keywords"""
    urgent_keywords = [
        'urgent', 'emergency', 'asap', 'immediate', 'help',
        'problem', 'issue', 'broken', 'not working', 'error'
    ]
    
    return any(keyword in message.lower() for keyword in urgent_keywords)

def create_auto_response(from_number, response_message):
    """Create auto-response SMS (requires Twilio configuration)"""
    try:
        # This would integrate with Twilio to send response
        # Requires TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN
        twilio_sid = os.getenv("TWILIO_ACCOUNT_SID")
        twilio_token = os.getenv("TWILIO_AUTH_TOKEN")
        twilio_number = os.getenv("TWILIO_PHONE_NUMBER")
        
        if not all([twilio_sid, twilio_token, twilio_number]):
            return {"error": "Twilio credentials not configured"}
        
        # Would implement Twilio SMS sending here
        return {
            "success": True,
            "to": from_number,
            "message": response_message
        }
        
    except Exception as e:
        return {"error": f"Auto-response failed: {str(e)}"}

if __name__ == "__main__":
    # Test the SMS webhook handler
    test_request = type('Request', (), {
        'json': {
            'Body': 'I need urgent help with my account',
            'From': '+15551234567',
            'To': '+15559876543',
            'MessageSid': 'SM1234567890',
            'AccountSid': 'AC1234567890'
        }
    })()
    
    result = handler(test_request)
    print(f"SMS webhook test result: {result}")