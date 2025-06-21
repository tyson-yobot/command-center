import os
from dotenv import load_dotenv
load_dotenv()
from pyicloud import PyiCloudService
import requests
from datetime import datetime

def sync_calendar_to_airtable():
    icloud = PyiCloudService(os.getenv('ICLOUD_USERNAME'), os.getenv('ICLOUD_PASSWORD'))

    if icloud.requires_2fa:
        print("2FA required — please log in manually first.")
        return

    events = icloud.calendar.events()
    
    airtable_url = f"https://api.airtable.com/v0/{os.getenv('AIRTABLE_BASE_ID')}/{os.getenv('AIRTABLE_TABLE_NAME')}"
    headers = {
        "Authorization": f"Bearer {os.getenv('AIRTABLE_API_KEY')}",
        "Content-Type": "application/json"
    }

    for event in events[:20]:  # Limiting to 20 events for sanity
        payload = {
            "fields": {
                "fldNECf5efvY6P9EN": event.get("title"),           # :date: Date
                "fld3ucbnOfD43hY9o": datetime.utcnow().isoformat(), # :calendar: Last Activity Timestamp
                "fldRWRv03mGr5Ko9K": event.get("notes"),           # :memo: Notes
                "fldkJiqxxZzfo7L7l": "iCloud",                     # :round_pushpin: Dashboard (optional default)
                "fldWpz8CP5OPmJwWf": "Synced",                     # :large_green_circle: System Status
                "flduc2s3ao8VnOnfJ": "Calendar Sync",              # :gear: Function
            }
        }

        response = requests.post(airtable_url, headers=headers, json=payload)
        print(f"Synced event: {event.get('title')} | Status: {response.status_code}")
