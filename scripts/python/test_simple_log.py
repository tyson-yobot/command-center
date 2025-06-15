import requests
import os
from datetime import datetime

# Get credentials
AIRTABLE_BASE_ID = os.environ.get('AIRTABLE_BASE_ID')
AIRTABLE_API_KEY = os.environ.get('AIRTABLE_API_KEY')

# Try direct table access with different table names
table_names = [
    "YoBot Integration Test Logger",
    "Integration Test Logger", 
    "Test Logger",
    "tblYoBotIntegrationTestLogger"
]

for table_name in table_names:
    encoded_table = table_name.replace(" ", "%20")
    url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{encoded_table}"
    
    headers = {
        "Authorization": f"Bearer {AIRTABLE_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Test data for logger sanity check
    data = {
        "fields": {
            "Module Name": "Logger Sanity Test",
            "Test Name": "Initial logger test", 
            "Logger Source": "YoBot Integrity Tracker",
            "Executed": True,
            "Output Data": True,
            "Date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "Raw Input": "Sample input payload",
            "Raw Output": "Expected output result",
            "Notes": "This is a manual function execution to confirm live logger connection. No test logic is involved."
        }
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        print(f"Table: {table_name}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Successfully logged to Airtable!")
            print(f"Response: {response.json()}")
            break
        elif response.status_code == 422:
            print("Table exists but field mismatch")
            print(f"Error: {response.text}")
        else:
            print(f"Error: {response.text}")
        print("---")
        
    except Exception as e:
        print(f"Request failed for {table_name}: {str(e)}")
        print("---")