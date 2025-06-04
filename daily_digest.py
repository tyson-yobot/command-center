# daily_digest.py
import os, requests
from datetime import datetime

AIRTABLE_BASE_ID = os.getenv("AIRTABLE_BASE_ID")
TABLE_ID = os.getenv("TABLE_ID")
AIRTABLE_KEY = os.getenv("AIRTABLE_KEY")
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")
ALERT_PHONE = "+17013718391"

def send_digest():
    url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{TABLE_ID}"
    headers = {"Authorization": f"Bearer {AIRTABLE_KEY}"}
    res = requests.get(url, headers=headers).json()

    missed = sum(1 for r in res["records"] if r['fields'].get("📄 Call Outcome") == "🔕 Missed")
    messages = sum(1 for r in res["records"] if r['fields'].get("📄 Call Outcome") == "📩 Voicemail")
    callbacks = sum(1 for r in res["records"] if r['fields'].get("📄 Call Outcome") == "📩 Callback Needed")

    summary = f"📊 YoBot Daily Digest:\n- {missed} missed calls\n- {callbacks} callbacks due\n- {messages} messages left"

    requests.post(
        f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_ACCOUNT_SID}/Messages.json",
        auth=(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN),
        data={"To": ALERT_PHONE, "From": TWILIO_PHONE_NUMBER, "Body": summary}
    )

if __name__ == "__main__":
    send_digest()