import os
import requests
from pyicloud import PyiCloudService
from datetime import datetime, timedelta

def sync_calendar_to_airtable():
    try:
        # Load environment variables
        icloud_username = os.getenv("ICLOUD_USERNAME")
        icloud_password = os.getenv("ICLOUD_PASSWORD")
        airtable_key = os.getenv("AIRTABLE_PRODUCTION_API_KEY")
        airtable_base_id = os.getenv("AIRTABLE_BASE_ID")
        airtable_table_name = os.getenv("AIRTABLE_TABLE_NAME")

        if not all([icloud_username, icloud_password, airtable_api_key, airtable_base_id, airtable_table_name]):
            print("Missing environment variables. Abort.")
            return

        # Log in to iCloud
        icloud = PyiCloudService(icloud_username, icloud_password)

        if icloud.requires_2fa:
            print("2FA required. Please complete this manually in your account.")
            return

        # Fetch calendar events for the next 30 days
        now = datetime.now()
        future = now + timedelta(days=30)
        events = icloud.calendar.events(now, future)

        print(f"Found {len(events)} events to sync")

        for event in events[:50]:
            title = event.get("title", "(No Title)")
            start_time = event.get("startDate")
            end_time = event.get("endDate")
            location = event.get("location", "")
            notes = event.get("notes", "")

            # Format datetime
            def fmt(dt):
                return dt.isoformat() if isinstance(dt, datetime) else dt

            airtable_url = f"https://api.airtable.com/v0/{airtable_base_id}/{airtable_table_name}"

            headers = {
                "Authorization": f"Bearer {airtable_api_key}",
                "Content-Type": "application/json"
            }

            data = {
                "fields": {
                    "📅 Event Title": title,
                    "🕒 Start Time": fmt(start_time),
                    "⏰ End Time": fmt(end_time),
                    "🗺 Location": location,
                    "📝 Notes": notes,
                    "📆 Synced At": datetime.now().isoformat()
                }
            }

            response = requests.post(airtable_url, headers=headers, json=data)
            if response.status_code != 200:
                print(f"Failed to insert event '{title}' → {response.text}")
            else:
                print(f"✅ Synced: {title}")

    except Exception as e:
        print(f"❌ Error during sync: {e}")
