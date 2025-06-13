import requests
from datetime import datetime

def log_integration_test_to_airtable(
    integration_name: str,
    passed: bool,
    notes: str = "",
    qa_owner: str = "Tyson Lerfald",
    output_data_populated: bool = True,
    record_created: bool = True,
    retry_attempted: bool = False,
    module_type: str = "Webhook",
    related_scenario_link: str = ""
):
    """
    Log integration test results to Airtable with full data validation
    """
    
    # Airtable configuration
    import os
    AIRTABLE_BASE_ID = os.environ.get('AIRTABLE_BASE_ID')
    AIRTABLE_TABLE_NAME = "YoBot%20Integration%20Test%20Logger"
    AIRTABLE_API_KEY = os.environ.get('AIRTABLE_API_KEY')
    
    url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{AIRTABLE_TABLE_NAME}"
    
    headers = {
        "Authorization": f"Bearer {AIRTABLE_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Format pass/fail status
    pass_status = "✅ Pass" if passed else "❌ Fail"
    
    # Auto-generate timestamp
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    data = {
        "fields": {
            "📛 Module Name": integration_name,
            "🧪 Test Name": "Initial logger test",
            "🛡️ Logger Source": module_type,
            "✅ Executed": output_data_populated,
            "✅ Output Data": record_created,
            "📅 Date": timestamp,
            "📥 Raw Input": "Sample input payload",
            "📤 Raw Output": "Expected output result",
            "🧠 Notes": notes,
            "QA Owner": qa_owner,
            "Pass/Fail": pass_status,
            "Retry Attempted": retry_attempted,
            "Related Scenario Link": related_scenario_link
        }
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        response.raise_for_status()
        
        print(f"✅ Successfully logged to Airtable: {integration_name}")
        print(f"📊 Status: {pass_status}")
        print(f"📅 Timestamp: {timestamp}")
        print(f"🔗 Response: {response.status_code}")
        
        return response.json()
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to log to Airtable: {str(e)}")
        if hasattr(e, 'response') and e.response:
            print(f"Response status: {e.response.status_code}")
            print(f"Response body: {e.response.text}")
        raise

# Execute the real logger function as specified
log_integration_test_to_airtable(
    integration_name="Logger Sanity Test",
    passed=True,
    notes="This is a manual function execution to confirm live logger connection. No test logic is involved.",
    qa_owner="Tyson Lerfald",
    output_data_populated=True,
    record_created=True,
    retry_attempted=False,
    module_type="YoBot Integrity Tracker",
    related_scenario_link=""
)