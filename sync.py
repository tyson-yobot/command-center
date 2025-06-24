import os
import requests
from pyicloud import PyiCloudService
from datetime import datetime, timedelta

def sync_calendar_to_airtable():
    try:
        # Load credentials
        icloud_username = os.getenv("ICLOUD_USERNAME")
        icloud_password = os.getenv("ICLOUD_PASSWORD")
        airtable_api_key = os.getenv("AIRTABLE_PRODUCTION_API_KEY")
        airtable_base_id = os.getenv("AIRTABLE_BASE_ID")
        airtable_table_name = os.getenv("AIRTABLE_TABLE_NAME")

        if not all([icloud_username, icloud_password, airtable_api_key, airtable_base_id, airtable_table_name]):
            print("❌ Missing environment variables.")
            return

        # Login to iCloud
        icloud = PyiCloudService(icloud_username, icloud_password)

        if icloud.requires_2fa:
            print("2FA required. Please complete this manually.")
            return

        # Get events for the next 30 days
        now = datetime.now()
        future = now + timedelta(days=30)
        events = icloud.calendar.events(now, future)

        print(f"Found {len(events)} events to sync.")

        for event in events[:50]:
            title = event.get("tit
