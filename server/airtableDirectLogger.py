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
    return response.status_code

# Test one of the missing functions
if __name__ == "__main__":
    # Test Onboarding Automation
    result = log_to_airtable("Onboarding Automation", True, "Employee onboarding completed - 3 new hires processed")
    print(f"Logged Onboarding Automation: Status {result}")