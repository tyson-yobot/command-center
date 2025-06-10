import requests
import datetime

def log_integration_test(integration_name, passed, notes="", qa_owner="Tyson Lerfald", output_populated=True, record_created=True, retry_attempted=False, module_type="Automation Test", scenario_link=""):
    """
    Log integration test results to Airtable using your exact working code
    """
    
    airtable_url = "https://api.airtable.com/v0/appRt8V3tH4g5Z5if/tbly0fjE2M5uHET9X"
    headers = {
        "Authorization": "Bearer paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa",
        "Content-Type": "application/json"
    }
    
    payload = {
        "fields": {
            "🔧 Integration Name": integration_name,
            "✅ Pass/Fail": "✅" if passed else "❌",
            "🧠 Notes / Debug": notes,
            "📅 Test Date": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "🧑‍💻 QA Owner": qa_owner,
            "📤 Output Data Populated": output_populated,
            "🗃️ Record Created?": record_created,
            "🔁 Retry Attempted?": retry_attempted,
            "🧩 Module Type": module_type,
            "📂 Related Scenario Link": scenario_link
        }
    }
    
    try:
        response = requests.post(airtable_url, headers=headers, json=payload)
        print(f"Status: {response.status_code} - Response: {response.text}")
        return response.status_code
    except Exception as e:
        print(f"Error logging to Airtable: {e}")
        return None

# Test one of the missing functions
if __name__ == "__main__":
    # Test Compliance Training
    result = log_integration_test("Compliance Training", True, "Compliance training completed - 15 employees trained")
    print(f"Logged Compliance Training: Status {result}")