from flask import Blueprint, request, jsonify
import requests
import os
from dotenv import load_dotenv

load_dotenv()

crm_sync_router = Blueprint("crm_sync_router", __name__)

# ✅ Airtable Config (only hardcoded BASE/TABLE ID)
AIRTABLE_API_KEY = os.getenv("AIRTABLE_API_KEY")
AIRTABLE_BASE_ID = "appRt8V3tH4g5Z5if"
AIRTABLE_TABLE_ID = "tblCrmClientFlow"  # Update if needed

# ✅ Slack webhook for alerts
SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/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"

@crm_sync_router.route('/api/crm-sync', methods=['POST'])
def sync_to_crm():
    try:
        submission = request.get_json()

        fields = {
            "🧑 Full Name": submission.get("🧑 Full Name", ""),
            "📧 Email": submission.get("📧 Email", ""),
            "📞 Phone Number": submission.get("📞 Phone Number", ""),
            "🏢 Company": submission.get("🏢 Company", ""),
            "💼 Deal Stage": submission.get("💼 Deal Stage", "New Lead"),
            "📌 Lead Source": submission.get("📌 Lead Source", "YoBot Dashboard"),
            "📝 Notes": submission.get("📝 Notes", ""),
            "🔐 Consent to Contact": submission.get("🔐 Consent to Contact", True)
        }

        airtable_url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{AIRTABLE_TABLE_ID}"
        headers = {
            "Authorization": f"Bearer {AIRTABLE_API_KEY}",
            "Content-Type": "application/json"
        }

        r = requests.post(airtable_url, headers=headers, json={"fields": fields})

        if r.status_code in [200, 201]:
            return jsonify({"status": "success", "id": r.json().get("id")}), 200
        else:
            requests.post(SLACK_WEBHOOK_URL, json={"text": f"🚨 CRM Airtable Error: {r.text}"})
            return jsonify({"status": "airtable_error", "message": r.text}), 500

    except Exception as e:
        requests.post(SLACK_WEBHOOK_URL, json={"text": f"🔥 CRM Sync Exception: {str(e)}"})
        return jsonify({"status": "error", "message": str(e)}), 500
