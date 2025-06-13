import requests
import os

# Get credentials
AIRTABLE_BASE_ID = os.environ.get('AIRTABLE_BASE_ID')
AIRTABLE_API_KEY = os.environ.get('AIRTABLE_API_KEY')

print(f"Base ID: {AIRTABLE_BASE_ID}")
print(f"API Key length: {len(AIRTABLE_API_KEY) if AIRTABLE_API_KEY else 'None'}")

# Test connection and list tables
url = f"https://api.airtable.com/v0/meta/bases/{AIRTABLE_BASE_ID}/tables"

headers = {
    "Authorization": f"Bearer {AIRTABLE_API_KEY}",
    "Content-Type": "application/json"
}

try:
    response = requests.get(url, headers=headers)
    print(f"Response status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("Available tables:")
        for table in data.get('tables', []):
            print(f"  - {table['name']} (ID: {table['id']})")
    else:
        print(f"Error response: {response.text}")
        
except Exception as e:
    print(f"Request failed: {str(e)}")