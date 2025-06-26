import os
import requests
from pyicloud import PyiCloudService
from datetime import datetime, timedelta

def sync_calendar_to_airtable() -> None:
    """
    Pull the next 30 days of iCloud events and push them to Airtable.
    """
    # ── ENV ─────────────────────────────────────────────
    icloud_username     = os.getenv("ICLOUD_USERNAME")
    icloud_password     = os.getenv("ICLOUD_PASSWORD")
    airtable_api_key    = os.getenv("AIRTABLE_PRODUCTION_API_KEY")
    airtable_base_id    = os.getenv("AIRTABLE_BASE_ID")
    airtable_table_name = os.getenv("AIRTABLE_TABLE_NAME")

    # Guard-rail: abort if any var is missing
    if not all([icloud_username, icloud_password,
                airtable_api_key, airtable_base_id, airtable_table_name]):
        print("❌  Missing one or more environment variables. Sync aborted.")
        return

    # ── LOGIN ───────────────────────────────────────────
    icloud = PyiCloudService(icloud_username, icloud_password)
    if icloud.requires_2fa:
        print("🔐  2-factor auth required. Complete it in the iCloud account.")
        return

    # ── FETCH EVENTS ────────────────────────────────────
    now, future = datetime.now(), datetime.now() + timedelta(days=30)
    events = icloud.calendar.events(now, future)
    print(f"🗓️  {len(events)} events found; syncing first 50 …")

    airtable_url = f"https://api.airtable.com/v0/{airtable_base_id}/{airtable_table_name}"
    headers = {
        "Authorization": f"Bearer {airtable_api_key}",
        "Content-Type":  "application/json"
    }

    # ── PUSH LOOP ───────────────────────────────────────
    for event in events[:50]:
        try:
            title       = event.get("title") or "Untitled"
            start_time  = event.get("startDate")
            end_time    = event.get("endDate")
            location    = event.get("location", "")
            notes       = event.get("notes", "")

            def iso(dt):  # helper
                return dt.isoformat() if isinstance(dt, datetime) else dt

            payload = {
                "fields": {
                    "📅 Event Title": title,
                    "🕒 Start Time":  iso(start_time),
                    "⏰ End Time":    iso(end_time),
                    "🗺 Location":    location,
                    "📝 Notes":       notes,
                    "📆 Synced At":   datetime.utcnow().isoformat()
                }
            }
            resp = requests.post(airtable_url, headers=headers, json=payload)
            if resp.status_code == 200:
                print(f"✅  Synced: {title}")
            else:
                print(f"⚠️  Airtable error {resp.status_code}: {resp.text}")

        except Exception as e:
            print(f"❌  Failed to sync event “{event.get('title', 'N/A')}” → {e}")

if __name__ == "__main__":
    sync_calendar_to_airtable()
