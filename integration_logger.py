import requests
from datetime import datetime

PASS_FAIL_OPTIONS = {
    True: "✅",
    False: "❌"
}

def log_integration_test_to_airtable(
    integration_name: str,
    passed: bool,
    notes: str = "",
    qa_owner: str = "Daniel Sharpe",
    output_data_populated: bool = True,
    record_created: bool = True,
    retry_attempted: bool = False,
    module_type: str = "Webhook",
    related_scenario_link: str = ""
):
    airtable_api_key = "paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa"
    base_id = "appRt8V3tH4g5Z5if"
    table_id = "tbly0fjE2M5uHET9X"
    url = f"https://api.airtable.com/v0/{base_id}/{table_id}"

    headers = {
        "Authorization": f"Bearer {airtable_api_key}",
        "Content-Type": "application/json"
    }

    # Format all data into the single available field
    status = PASS_FAIL_OPTIONS[passed]
    formatted_entry = f"{integration_name} - {status} - {notes} - {datetime.now().isoformat()} - QA: {qa_owner} - Module: {module_type}"
    
    payload = {
        "fields": {
            "🔧 Integration Name": formatted_entry
        }
    }

    response = requests.post(url, headers=headers, json=payload)
    print("📤 Payload:", payload)
    print("🌐 Response:", response.status_code, response.text)

    if response.status_code in [200, 201]:
        print("✅ Logged.")
    else:
        print("❌ Log failed.")