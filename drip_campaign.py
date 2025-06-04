# drip_campaign.py
import os, requests
from datetime import datetime, timedelta

AIRTABLE_BASE_ID = os.getenv("AIRTABLE_BASE_ID")
TABLE_ID = os.getenv("TABLE_ID")
AIRTABLE_KEY = os.getenv("AIRTABLE_KEY")
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

DRIP_TEMPLATE = {
    1: "👋 Just checking in! Would you like to finish booking with YoBot?",
    3: "📅 Still interested in a demo or setup? We're here when you're ready.",
    7: "📬 Last call — we'll close this out unless we hear back. Thanks from YoBot."
}

def send_sms(to, body):
    requests.post(
        f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_ACCOUNT_SID}/Messages.json",
        auth=(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN),
        data={"To": to, "From": TWILIO_PHONE_NUMBER, "Body": body}
    )

def run_drip():
    url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{TABLE_ID}"
    headers = {"Authorization": f"Bearer {AIRTABLE_KEY}"}
    res = requests.get(url, headers=headers).json()

    for r in res.get("records", []):
        created = r['createdTime']
        phone = r['fields'].get("📞 Caller Phone")
        if not phone:
            continue
        
        days_since = (datetime.utcnow() - datetime.fromisoformat(created[:-1])).days
        if days_since in DRIP_TEMPLATE:
            send_sms(phone, DRIP_TEMPLATE[days_since])

if __name__ == "__main__":
    run_drip()