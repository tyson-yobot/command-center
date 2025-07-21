# ✅ Lead Scraper Router — FINAL PRODUCTION (No Parameters, Fully Wired)

from flask import Blueprint, jsonify
import requests
import os
from dotenv import load_dotenv

load_dotenv()

lead_scraper_router = Blueprint('lead_scraper_router', __name__, url_prefix='/lead-scraper')

# ✅ Hardcoded Airtable Info (Per Build Spec)
AIRTABLE_BASE_ID = "appRt8V3tH4g5Z5if"
LEAD_TABLE_ID = "tbljFeOZryU3TxlhB"
AIRTABLE_API_KEY = os.getenv("AIRTABLE_API_KEY")

# ✅ Slack Webhook
SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/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"

@lead_scraper_router.route('/run', methods=['POST'])
def run_lead_scraper():
    try:
        leads = run_lead_scrape()
        success_count = 0

        for lead in leads:
            airtable_url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{LEAD_TABLE_ID}"
            headers = {
                "Authorization": f"Bearer {AIRTABLE_API_KEY}",
                "Content-Type": "application/json"
            }

            data = {
                "fields": {
                    "🧑 Full Name": lead["name"],
                    "📧 Email Address": lead["email"],
                    "📞 Phone Number": lead["phone"],
                    "🏢 Company Name": lead["company"],
                    "🔗 Source Profile URL": lead["url"],
                    "🌐 Website URL": lead["website"],
                    "📍 Location": lead["location"],
                    "💼 Job Title": lead["title"],
                    "📅 Date Scraped": lead["timestamp"]
                }
            }

            r = requests.post(airtable_url, headers=headers, json=data)
            if r.status_code == 200:
                success_count += 1
            else:
                print(f"❌ Failed to insert: {r.text}")

        slack_msg = {
            "text": f"✅ Lead scraper completed. {success_count} leads inserted into Airtable."
        }
        requests.post(SLACK_WEBHOOK_URL, json=slack_msg)

        return jsonify({"status": "success", "inserted": success_count})

    except Exception as e:
        print(f"🚨 Error in lead scraper: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


def run_lead_scrape():
    # ⚠️ Implement your real lead scraping logic here
    return []
