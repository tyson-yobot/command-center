import requests
import datetime

# Simple test function
def test_airtable_connection():
    airtable_url = "https://api.airtable.com/v0/appRt8V3tH4g5Z5if/tbly0fjE2M5uHET9X"
    headers = {
        "Authorization": "Bearer paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa",
        "Content-Type": "application/json"
    }
    
    payload = {
        "fields": {
            "🔧 Integration Name": "TEST_REPLIT_CORRECTED"
        }
    }
    
    try:
        print("Sending request to Airtable...")
        response = requests.post(airtable_url, headers=headers, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        return response.status_code
    except Exception as e:
        print(f"ERROR: {e}")
        return None

# Run the test
if __name__ == "__main__":
    test_airtable_connection()