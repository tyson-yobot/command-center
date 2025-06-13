import requests
import os
from datetime import datetime

# Execute the log_to_airtable function exactly as specified
def log_to_airtable(data):
    AIRTABLE_BASE_ID = os.environ.get('AIRTABLE_BASE_ID')
    AIRTABLE_API_KEY = os.environ.get('AIRTABLE_API_KEY')
    
    url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/Integration%20Test%20Log"
    
    headers = {
        "Authorization": f"Bearer {AIRTABLE_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Map the exact data structure provided
    airtable_data = {
        "fields": {
            "📛 Module Name": data["📛 Module Name"],
            "🧪 Test Name": data["🧪 Test Name"], 
            "🛡️ Logger Source": data["🛡️ Logger Source"],
            "✅ Executed": data["✅ Executed"],
            "✅ Output Data": data["✅ Output Data"],
            "📅 Date": datetime.now().strftime("%Y-%m-%d %H:%M:%S") if data["📅 Date"] == "AUTO" else data["📅 Date"],
            "📥 Raw Input": data["📥 Raw Input"],
            "📤 Raw Output": data["📤 Raw Output"],
            "🧠 Notes": data["🧠 Notes"]
        }
    }
    
    response = requests.post(url, json=airtable_data, headers=headers)
    
    if response.status_code == 200:
        print("✅ Successfully logged to Airtable")
        print(f"Record ID: {response.json()['id']}")
        return response.json()
    else:
        print(f"❌ Failed: {response.status_code}")
        print(f"Error: {response.text}")
        return None

# Execute exactly as specified - no wrapper, no modifications
log_to_airtable({
    "📛 Module Name": "Logger Sanity Test",
    "🧪 Test Name": "Initial logger test",
    "🛡️ Logger Source": "YoBot Integrity Tracker",
    "✅ Executed": True,
    "✅ Output Data": True,
    "📅 Date": "AUTO",
    "📥 Raw Input": "Sample input payload",
    "📤 Raw Output": "Expected output result",
    "🧠 Notes": "This is a manual function execution to confirm live logger connection. No test logic is involved."
})