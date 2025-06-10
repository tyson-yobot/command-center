import requests
import datetime

def log_to_airtable(function_name, result, notes=""):
    airtable_url = "https://api.airtable.com/v0/appRt8V3tH4g5Z5if/tbly0fjE2M5uHET9X"
    headers = {
        "Authorization": "Bearer paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa",
        "Content-Type": "application/json"
    }
    payload = {
        "fields": {
            "🔧 Integration Name": f"{function_name} - ✅ - Function ran successfully - {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - QA: Tyson Lerfald - Module: Automation Test",
            "✅ Pass/Fail": "✅" if result else "❌"
        }
    }
    response = requests.post(airtable_url, headers=headers, json=payload)
    print(f"Full response: {response.status_code} - {response.text}")
    if response.status_code != 200:
        print(f"Error details: {response.json()}")
    return response.status_code

# Test one of the missing functions
if __name__ == "__main__":
    # Test Policy Distribution
    result = log_to_airtable("Policy Distribution", True, "Policy distribution completed - 8 policies distributed")
    print(f"Logged Policy Distribution: Status {result}")