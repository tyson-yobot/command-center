import requests
import logging

SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/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"

def slack_alert(message: str):
    try:
        payload = {"text": f"🚨 {message}"}
        response = requests.post(SLACK_WEBHOOK_URL, json=payload)
        response.raise_for_status()
    except Exception as e:
        logging.error(f"Slack alert failed: {e}")
