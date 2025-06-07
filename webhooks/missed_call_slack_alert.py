"""
Missed Call Slack Alert System
Sends structured Slack notifications for missed calls and retry attempts
"""
import os
import requests
from datetime import datetime

SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL")

def send_slack_alert(phone, call_time, callback_time, retried=False):
    """Send Slack alert for missed call events"""
    
    if not SLACK_WEBHOOK_URL:
        print("No Slack webhook URL configured - skipping alert")
        return False
    
    try:
        retry_status = "✅ Retry Attempted" if retried else "❌ No Retry Yet"
        message = {
            "text": f"📞 *Missed Call Alert*",
            "blocks": [
                {
                    "type": "section", 
                    "text": {
                        "type": "mrkdwn", 
                        "text": f"*Caller:* `{phone}`\n*Call Time:* {call_time}\n*Callback Scheduled:* {callback_time or 'N/A'}\n*Status:* {retry_status}"
                    }
                },
                {"type": "divider"}
            ]
        }
        
        response = requests.post(SLACK_WEBHOOK_URL, json=message, timeout=10)
        if response.ok:
            print(f"✅ Slack alert sent for {phone}")
            return True
        else:
            print(f"❌ Failed to send Slack alert: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error sending Slack alert: {e}")
        return False

def send_missed_call_alert(phone, call_time):
    """Send alert for initial missed call"""
    return send_slack_alert(phone, call_time, None, retried=False)

def send_retry_alert(phone, callback_time):
    """Send alert for retry attempt"""
    return send_slack_alert(phone, "N/A", callback_time, retried=True)

if __name__ == "__main__":
    # Test the Slack alert system
    test_phone = "+15551234567"
    test_time = datetime.utcnow().isoformat()
    
    print("Testing missed call alert...")
    send_missed_call_alert(test_phone, test_time)
    
    print("Testing retry alert...")
    send_retry_alert(test_phone, test_time)