import requests
import os
from datetime import datetime

def log_to_airtable(data):
    AIRTABLE_BASE_ID = "appRt8V3tH4g5Z5if"
    AIRTABLE_API_KEY = "paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa"
    
    url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/tbly0fjE2M5uHET9X"
    
    headers = {
        "Authorization": f"Bearer {AIRTABLE_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Map the data to Airtable field structure matching actual table schema
    airtable_data = {
        "fields": {
            "🔧 Integration Name": f"{data['📛 Module Name']} - {'✅' if data['✅ Executed'] else '❌'} - {data['🧠 Notes']} - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - QA: {data['🛡️ Logger Source']} - Module: Logger Test"
        }
    }
    
    try:
        response = requests.post(url, json=airtable_data, headers=headers)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Record created: {result['id']}")
            return result
        else:
            print(f"❌ Failed: {response.status_code}")
            print(f"Error: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        return None