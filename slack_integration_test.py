import requests
from universal_webhook_logger import log_to_airtable

# Using your existing working Slack webhook URLs
SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/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"

def send_slack_alert(message):
    payload = {"text": message}
    response = requests.post(SLACK_WEBHOOK_URL, json=payload)
    
    if response.status_code == 200:
        print("✅ Slack alert sent.")
        
        # Log successful Slack integration
        log_to_airtable('Slack Integration Test', {
            'source': 'Slack QA Test',
            'success': True,
            'details': f'Successfully sent message: {message[:50]}...',
            'url': 'https://replit.com/@YoBot/CommandCenter'
        })
        return True
    else:
        print("❌ Slack failed:", response.status_code, response.text)
        
        # Log failed Slack integration
        log_to_airtable('Slack Integration Test', {
            'source': 'Slack QA Test',
            'success': False,
            'errors': f'HTTP {response.status_code}: {response.text}',
            'details': f'Failed to send message: {message[:50]}...',
            'url': 'https://replit.com/@YoBot/CommandCenter'
        })
        return False

if __name__ == "__main__":
    send_slack_alert("🧪 Test alert from YoBot QA Tracker – Slack integration.")