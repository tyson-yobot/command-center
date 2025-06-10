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

    # Populate ALL fields with correct field names from Airtable schema
    status = PASS_FAIL_OPTIONS[passed]
    
    payload = {
        "fields": {
            "🔧 Integration Name": integration_name,
            "✅ Pass/Fail": status,
            "🧠 Notes / Debug": notes,
            "📅 Test Date": datetime.now().isoformat(),
            "🧑‍💻 QA Owner": qa_owner,
            "📤 Output Data Populated": output_data_populated,
            "🗃️ Record Created?": record_created,
            "🔁 Retry Attempted?": retry_attempted,
            "🧩 Module Type": module_type,
            "📂 Related Scenario Link": related_scenario_link
        }
    }

    response = requests.post(url, headers=headers, json=payload)
    print("📤 Payload:", payload)
    print("🌐 Response:", response.status_code, response.text)

    if response.status_code in [200, 201]:
        print("✅ Logged.")
    else:
        print("❌ Log failed.")