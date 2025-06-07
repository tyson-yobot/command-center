import os
import requests

def log_zendesk_closure(ticket_id, subject, updated_at):
    """
    Log Zendesk ticket closures to Airtable for tracking
    """
    airtable_base_id = os.getenv("AIRTABLE_BASE_ID")
    airtable_table = "Zendesk Auto-Close Log"
    airtable_token = os.getenv("AIRTABLE_API_KEY")

    if not all([airtable_base_id, airtable_token]):
        print("Airtable credentials missing - cannot log closure")
        return

    url = f"https://api.airtable.com/v0/{airtable_base_id}/{airtable_table}"
    headers = {
        "Authorization": f"Bearer {airtable_token}",
        "Content-Type": "application/json"
    }

    payload = {
        "fields": {
            "🎫 Ticket ID": str(ticket_id),
            "📄 Subject": subject[:255],  # Limit subject length
            "📆 Closed At": updated_at,
            "🤖 Closure Type": "Auto-Close",
            "📊 Status": "Completed"
        }
    }

    try:
        res = requests.post(url, headers=headers, json=payload)
        if res.status_code == 200:
            print(f"✅ Closure logged to Airtable: {ticket_id}")
        else:
            print(f"❌ Airtable logging failed: {res.status_code}")
    except Exception as e:
        print(f"❌ Airtable logging error: {e}")

if __name__ == "__main__":
    # Test the logger
    log_zendesk_closure(12345, "Test ticket subject", "2025-01-01T12:00:00Z")