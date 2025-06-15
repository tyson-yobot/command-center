
from flask import Flask, request, jsonify
import requests
import datetime
import os

app = Flask(__name__)

# 🔐 Optional: Add basic verification
CALENDLY_SECRET = os.getenv("CALENDLY_SECRET", "your-secret")

@app.route("/webhooks/calendly-booking", methods=["POST"])
def calendly_booking():
    data = request.get_json()

    # ✅ Basic validation
    if not data or "event" not in data:
        return jsonify({"error": "Invalid payload"}), 400

    # 📥 Extract fields (adjust as needed)
    event = data["event"]
    invitee = data.get("invitee", {})
    name = invitee.get("name", "Unknown")
    email = invitee.get("email", "Unknown")
    time = event.get("start_time", "Unknown")
    booking_type = event.get("event_type_name", "General Meeting")

    # 🗂️ Log to Airtable (optional)
    airtable_url = "https://api.airtable.com/v0/YOUR_BASE_ID/YOUR_TABLE_NAME"
    headers = {
        "Authorization": "Bearer YOUR_AIRTABLE_TOKEN",
        "Content-Type": "application/json"
    }
    payload = {
        "fields": {
            "🧑 Name": name,
            "📧 Email": email,
            "🗓️ Booking Time": time,
            "📋 Type": booking_type,
            "📥 Source": "Calendly"
        }
    }
    requests.post(airtable_url, headers=headers, json=payload)

    # 📩 Send Slack or Twilio alert if needed here...

    return jsonify({"status": "Booking received"}), 200

if __name__ == "__main__":
    app.run(port=3000)
