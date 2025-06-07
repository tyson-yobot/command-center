"""
Email Trigger System
Handles outbound email messaging with SendGrid integration
"""

import requests
import os
from datetime import datetime
from command_center_dispatcher import CommandCenterDispatcher
from slack_alerts import alert_system

class EmailTriggerSystem:
    def __init__(self):
        self.sendgrid_api_key = os.getenv("SENDGRID_API_KEY")
        self.from_email = os.getenv("FROM_EMAIL", "noreply@yobot.bot")
        self.dispatcher = CommandCenterDispatcher()
        
    def send_email(self, to_email, subject, body, html_body=None):
        """Send email via SendGrid API"""
        if not self.sendgrid_api_key:
            return {"error": "SendGrid API key not configured"}
        
        try:
            url = "https://api.sendgrid.com/v3/mail/send"
            headers = {
                "Authorization": f"Bearer {self.sendgrid_api_key}",
                "Content-Type": "application/json"
            }
            
            content = [{"type": "text/plain", "value": body}]
            if html_body:
                content.append({"type": "text/html", "value": html_body})
            
            data = {
                "personalizations": [{"to": [{"email": to_email}]}],
                "from": {"email": self.from_email},
                "subject": subject,
                "content": content
            }
            
            response = requests.post(url, json=data, headers=headers, timeout=10)
            
            if response.status_code == 202:
                # Log success
                self.dispatcher.log_command_center_event(
                    "email_sent",
                    f"📧 Email sent to {to_email}: {subject}"
                )
                
                return {
                    "success": True,
                    "to": to_email,
                    "subject": subject,
                    "status": "sent"
                }
            else:
                # Log failure
                error_msg = f"Email failed: {response.status_code} - {response.text}"
                alert_system.alert_api_failure("SendGrid", response.status_code, response.text)
                return {"error": error_msg}
                
        except Exception as e:
            error_msg = f"Email sending failed: {str(e)}"
            alert_system.alert_system_failure("Email System", str(e))
            return {"error": error_msg}

def handler(request):
    """Handle email trigger requests"""
    email_system = EmailTriggerSystem()
    
    try:
        data = request.json if hasattr(request, 'json') else {}
        to_email = data.get("email", "demo@yobot.bot")
        subject = data.get("subject", "Thanks for checking out YoBot!")
        body = data.get("body", "We'll be in touch shortly. – The YoBot Team")
        html_body = data.get("html_body")
        
        result = email_system.send_email(to_email, subject, body, html_body)
        
        if result.get("success"):
            return {
                "success": True,
                "to": to_email,
                "subject": subject,
                "timestamp": datetime.now().isoformat()
            }
        else:
            return {"error": result.get("error")}
            
    except Exception as e:
        return {"error": f"Email handler failed: {str(e)}"}

# Global email system
email_system = EmailTriggerSystem()

def send_email_notification(to_email, subject, body):
    """Quick function for sending email notifications"""
    return email_system.send_email(to_email, subject, body)

if __name__ == "__main__":
    # Test email system
    test_request = type('Request', (), {
        'json': {
            "email": "test@example.com",
            "subject": "Test Email from YoBot",
            "body": "This is a test email from the YoBot automation system."
        }
    })()
    
    result = handler(test_request)
    print(f"Email test result: {result}")