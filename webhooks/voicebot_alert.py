import os
import requests

def send_voicebot_alert(ticket_id, subject, customer_phone):
    """
    Send VoiceBot notification to customer about ticket closure
    """
    url = os.getenv("VOICEBOT_TRIGGER_URL")  # e.g. https://voicebot.yobot.bot/api/notify
    api_key = os.getenv('VOICEBOT_API_KEY')
    
    if not url or not api_key:
        print("VoiceBot credentials not configured - cannot send alert")
        return

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "phone": customer_phone,
        "message": f"This is YoBot. Your support ticket #{ticket_id} has been automatically resolved. If you still need assistance, just say 'reopen my ticket'.",
        "intent": "AUTO_CLOSE_ALERT",
        "metadata": {
            "ticket_id": ticket_id,
            "subject": subject,
            "action": "auto_closure_notification"
        }
    }

    try:
        res = requests.post(url, headers=headers, json=payload)
        if res.status_code == 200:
            print(f"✅ VoiceBot alert sent to {customer_phone}")
        else:
            print(f"❌ VoiceBot alert failed: {res.status_code}")
    except Exception as e:
        print(f"❌ VoiceBot alert error: {e}")

if __name__ == "__main__":
    # Test the VoiceBot alert
    send_voicebot_alert(12345, "Test ticket subject", "+1234567890")