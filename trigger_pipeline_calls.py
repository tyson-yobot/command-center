"""
Pipeline Calls Trigger
Automatically calls all active leads in the pipeline from Airtable
"""
import requests
import os
from datetime import datetime

AIRTABLE_API_KEY = os.getenv("AIRTABLE_API_KEY")
BASE_ID = os.getenv("AIRTABLE_BASE_ID") 
TABLE_NAME = "🧠 Lead Engine"

def get_pipeline_leads():
    """Get all active leads with phone numbers from Airtable"""
    if not AIRTABLE_API_KEY or not BASE_ID:
        print("Missing Airtable credentials")
        return []
    
    url = f"https://api.airtable.com/v0/{BASE_ID}/{TABLE_NAME}?filterByFormula=AND({{Stage}}='Active',{{Phone}}!='')"
    headers = {"Authorization": f"Bearer {AIRTABLE_API_KEY}"}
    
    try:
        res = requests.get(url, headers=headers)
        res.raise_for_status()
        return res.json().get("records", [])
    except requests.exceptions.RequestException as e:
        print(f"Error fetching leads: {e}")
        return []

def call_lead(phone_number, lead_name="Unknown"):
    """Trigger a call to a specific lead"""
    try:
        # Use the existing voice call endpoint
        response = requests.post("http://localhost:5000/api/voice/initiate-call", 
                               json={
                                   "phone": phone_number,
                                   "lead_name": lead_name,
                                   "source": "pipeline_calls"
                               })
        return response.status_code == 200
    except requests.exceptions.RequestException as e:
        print(f"Error calling {phone_number}: {e}")
        return False

def log_pipeline_call_session(total_calls, successful_calls):
    """Log the pipeline call session to Airtable"""
    if not AIRTABLE_API_KEY or not BASE_ID:
        return
    
    log_table = "📞 Call Log"
    url = f"https://api.airtable.com/v0/{BASE_ID}/{log_table}"
    headers = {
        "Authorization": f"Bearer {AIRTABLE_API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "records": [{
            "fields": {
                "Type": "Pipeline Batch",
                "Total Calls": total_calls,
                "Successful": successful_calls,
                "Timestamp": datetime.now().isoformat(),
                "Source": "Command Center"
            }
        }]
    }
    
    try:
        requests.post(url, json=data, headers=headers)
    except:
        pass  # Silent fail for logging

def trigger_pipeline_calls():
    """Main function to trigger calls for all pipeline leads"""
    print("🚀 Starting pipeline calls...")
    
    leads = get_pipeline_leads()
    total_calls = len(leads)
    successful_calls = 0
    
    if total_calls == 0:
        print("No active leads found in pipeline")
        return {"calls_triggered": 0, "success": False, "message": "No active leads found"}
    
    print(f"Found {total_calls} active leads to call")
    
    for lead in leads:
        fields = lead.get("fields", {})
        phone = fields.get("Phone", "")
        name = fields.get("Name", "Unknown Lead")
        
        if phone:
            print(f"Calling {name} at {phone}")
            if call_lead(phone, name):
                successful_calls += 1
            else:
                print(f"Failed to call {name}")
    
    # Log the session
    log_pipeline_call_session(total_calls, successful_calls)
    
    print(f"✅ Pipeline calls complete: {successful_calls}/{total_calls} successful")
    
    return {
        "calls_triggered": total_calls,
        "successful_calls": successful_calls,
        "success": True,
        "message": f"Called {successful_calls} out of {total_calls} leads"
    }

def handler(request):
    """Flask handler for the pipeline calls endpoint"""
    return trigger_pipeline_calls()

if __name__ == "__main__":
    # Test the function
    result = trigger_pipeline_calls()
    print(result)