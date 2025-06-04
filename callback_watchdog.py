# callback_watchdog.py
import os, requests
from datetime import datetime

AIRTABLE_BASE_ID = os.getenv("AIRTABLE_BASE_ID")
TABLE_ID = os.getenv("TABLE_ID")
AIRTABLE_KEY = os.getenv("AIRTABLE_KEY")
TWILIO_SID = os.getenv("TWILIO_SID")
TWILIO_AUTH = os.getenv("TWILIO_AUTH")
TWILIO_FROM = os.getenv("TWILIO_FROM")
ALERT_PHONE = "+17013718391"

def send_reminder_sms(to, body):
    requests.post(
        f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_SID}/Messages.json",
        auth=(TWILIO_SID, TWILIO_AUTH),
        data={"To": to, "From": TWILIO_FROM, "Body": body}
    )

def run_watchdog():
    url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{TABLE_ID}?filterByFormula=AND({{📅 Callback Scheduled}} < '{datetime.utcnow().isoformat()}', {{📄 Call Outcome}} = '📩 Callback Needed')"
    headers = {"Authorization": f"Bearer {AIRTABLE_KEY}"}
    res = requests.get(url, headers=headers).json()
    for r in res.get("records", []):
        phone = r['fields'].get("📞 Caller Phone")
        if phone:
            send_reminder_sms(phone, "📞 We missed your callback! Would you like to reschedule with YoBot?")

if __name__ == "__main__":
    run_watchdog()