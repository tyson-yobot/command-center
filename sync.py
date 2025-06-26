import os
import requests
from datetime import datetime, timedelta
from pyicloud_ipd import PyiCloudService


def sync_calendar_to_airtable() -> None:
    """Sync the next 30 days of iCloud events into Airtable.

    Environment variables required:
    - ICLOUD_USERNAME  (usually your @icloud.com alias)
    - ICLOUD_PASSWORD  (app‑specific password)
    - AIRTABLE_API_KEY
    - AIRTABLE_BASE_ID
    - AIRTABLE_TABLE_ID
    """

    # ── LOAD SECRETS FROM ENV ───────────────────────────────────────
    ICLOUD_USERNAME  = os.getenv("ICLOUD_USERNAME")
    ICLOUD_PASSWORD  = os.getenv("ICLOUD_PASSWORD")
    AIRTABLE_API_KEY = os.getenv("AIRTABLE_API_KEY")
    AIRTABLE_BASE_ID = os.getenv("AIRTABLE_BASE_ID")
    AIRTABLE_TABLE_ID = os.getenv("AIRTABLE_TABLE_ID")

    # ── QUICK SANITY‑CHECK ──────────────────────────────────────────
    config = {
        "ICLOUD_USERNAME": ICLOUD_USERNAME,
        "ICLOUD_PASSWORD": ICLOUD_PASSWORD,
        "AIRTABLE_API_KEY": AIRTABLE_API_KEY,
        "AIRTABLE_BASE_ID": AIRTABLE_BASE_ID,
        "AIRTABLE_TABLE_ID": AIRTABLE_TABLE_ID,
    }
    missing = [k for k, v in config.items() if not v]
    if missing:
        print(f"❌  Missing env vars: {', '.join(missing)} — aborting")
        return

    print("🚀  Starting iCloud → Airtable sync …")

    # ── LOGIN ───────────────────────────────────────────────────────
    icloud = PyiCloudService(ICLOUD_USERNAME, ICLOUD_PASSWORD)
    if icloud.requires_2fa:
        print("🔐  2‑factor auth required — complete it once, then rerun")
        return
    print("🔑  Logged in to iCloud")

    # ── FETCH EVENTS ────────────────────────────────────────────────
    now = datetime.now()
    future = now + timedelta(days=30)
    events = icloud.calendar.events(now, future)
    print(f"🗓️   {len(events)} events fetched; syncing up to 50 …")

    # ── AIRTABLE ENDPOINT ───────────────────────────────────────────
    airtable_url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{AIRTABLE_TABLE_ID}"
    headers = {
        "Authorization": f"Bearer {AIRTABLE_API_KEY}",
        "Content-Type": "application/json",
    }

    # ── HELPERS ─────────────────────────────────────────────────────
    def iso(dt):
        return dt.isoformat() if isinstance(dt, datetime) else dt

    # ── PUSH LOOP ───────────────────────────────────────────────────
    for event in events[:50]:
        title = event.get("title") or "Untitled"
        start_time = event.get("startDate")
        end_time   = event.get("endDate")
        location   = event.get("location") or ""
        notes      = event.get("notes") or ""

        payload = {
            "fields": {
                "📅 Event Title": title,
                "🕒 Start Time": iso(start_time),
                "⏰ End Time": iso(end_time),
                "🗺 Location": location,
                "📝 Notes": notes,
                "📆 Synced At": datetime.utcnow().isoformat(),
            }
        }

        try:
            resp = requests.post(airtable_url, headers=headers, json=payload, timeout=15)
            if resp.status_code == 200:
                print(f"✅  Synced: {title}")
            else:
                print(f"⚠️  Airtable error {resp.status_code}: {resp.text}")
        except Exception as e:
            print(f"❌  Failed to sync ‘{title}’ → {e}")

    print("🏁  Sync finished – check Airtable table ‘📅 Calendar Sync Log’.")


if __name__ == "__main__":
    sync_calendar_to_airtable()
