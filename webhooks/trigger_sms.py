"""
SMS Trigger System
Handles outbound SMS messaging with Twilio integration
"""

import requests
import os
from datetime import datetime
from command_center_dispatcher import CommandCenterDispatcher
from slack_alerts import alert_system

class SMSTriggerSystem:
    def __init__(self):
        self.twilio_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.twilio_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.twilio_from = os.getenv("TWILIO_PHONE_NUMBER")
        self.dispatcher = CommandCenterDispatcher()
        
    def send_sms(self, to_number, message):
        """Send SMS via Twilio API"""
        if not all([self.twilio_sid, self.twilio_token, self.twilio_from]):
            return {"error": "Twilio credentials not configured"}
        
        try:
            url = f"https://api.twilio.com/2010-04-01/Accounts/{self.twilio_sid}/Messages.json"
            data = {
                "To": to_number,
                "From": self.twilio_from,
                "Body": message
            }
            auth = (self.twilio_sid, self.twilio_token)
            
            response = requests.post(url, data=data, auth=auth, timeout=10)
            
            if response.status_code == 201:
                result = response.json()
                
                # Log success
                self.dispatcher.log_command_center_event(
                    "sms_sent",
                    f"📩 SMS sent to {to_number}: {message[:50]}..."
                )
                
                return {
                    "success": True,
                    "message_sid": result.get("sid"),
                    "to": to_number,
                    "status": result.get("status")
                }
            else:
                # Log failure
                error_msg = f"SMS failed: {response.status_code} - {response.text}"
                alert_system.alert_api_failure("Twilio SMS", response.status_code, response.text)
                return {"error": error_msg}
                
        except Exception as e:
            error_msg = f"SMS sending failed: {str(e)}"
            alert_system.alert_system_failure("SMS System", str(e))
            return {"error": error_msg}

def handler(request):
    """Handle SMS trigger requests"""
    sms_system = SMSTriggerSystem()
    
    try:
        payload = request.json if hasattr(request, 'json') else {}
        to_number = payload.get("number", payload.get("to", "+15551234567"))
        message = payload.get("message", "📣 Your YoBot® demo is ready!")
        
        result = sms_system.send_sms(to_number, message)
        
        if result.get("success"):
            return {
                "success": True,
                "message_sid": result.get("message_sid"),
                "to": to_number,
                "timestamp": datetime.now().isoformat()
            }
        else:
            return {"error": result.get("error")}
            
    except Exception as e:
        return {"error": f"SMS handler failed: {str(e)}"}

# Global SMS system
sms_system = SMSTriggerSystem()

def send_sms_alert(to_number, message):
    """Quick function for sending SMS alerts"""
    return sms_system.send_sms(to_number, message)

if __name__ == "__main__":
    # Test SMS system
    test_request = type('Request', (), {
        'json': {
            "number": "+15551234567",
            "message": "Test SMS from YoBot automation system"
        }
    })()
    
    result = handler(test_request)
    print(f"SMS test result: {result}")