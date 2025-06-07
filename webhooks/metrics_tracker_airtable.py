import os
import requests

def log_metrics_to_airtable(event_type, source, ref_id, summary, timestamp):
    """
    Log metrics to the Command Center Metrics Tracker Airtable table
    """
    base_id = os.getenv("AIRTABLE_BASE_ID")
    table = "Command Center Metrics Tracker"
    token = os.getenv("AIRTABLE_API_KEY")

    if not all([base_id, token]):
        print("Airtable credentials missing - cannot log to metrics tracker")
        return

    url = f"https://api.airtable.com/v0/{base_id}/{table}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    payload = {
        "fields": {
            "📌 Event Type": event_type,
            "🔗 Source": source,
            "🆔 Ref ID": str(ref_id),
            "📝 Summary": summary[:500],  # Limit summary length
            "🕒 Timestamp": timestamp,
            "📊 Status": "Completed"
        }
    }

    try:
        res = requests.post(url, headers=headers, json=payload)
        if res.status_code == 200:
            print(f"✅ Metrics logged to tracker: {event_type}")
        else:
            print(f"❌ Metrics tracker logging failed: {res.status_code}")
    except Exception as e:
        print(f"❌ Metrics tracker error: {e}")

if __name__ == "__main__":
    # Test the metrics tracker
    from datetime import datetime
    test_time = datetime.utcnow().isoformat() + 'Z'
    log_metrics_to_airtable(
        event_type="🎫 Auto-Close",
        source="Zendesk",
        ref_id=12345,
        summary="Test ticket auto-closure for metrics tracking",
        timestamp=test_time
    )