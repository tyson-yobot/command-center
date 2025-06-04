"""
Pipeline Calls Trigger
Automatically calls all active leads in the pipeline from Airtable
"""
import requests
import os
from datetime import datetime

AIRTABLE_API_KEY = os.getenv("AIRTABLE_KEY")
BASE_ID = os.getenv("AIRTABLE_BASE_ID")
TABLE_NAME = os.getenv("TABLE_PIPELINE")
SLACK_WEBHOOK_URL = os.getenv("SLACK_ALERT_URL")

def get_pipeline_leads():
    """Get leads from Airtable pipeline"""
    if not AIRTABLE_API_KEY or not BASE_ID or not TABLE_NAME:
        return []
    
    url = f"https://api.airtable.com/v0/{BASE_ID}/{TABLE_NAME}"
    params = {
        "filterByFormula": "AND({Status}='New', {Phone} != '')"
    }
    headers = {"Authorization": f"Bearer {AIRTABLE_API_KEY}"}
    
    try:
        res = requests.get(url, headers=headers, params=params)
        res.raise_for_status()
        return res.json().get("records", [])
    except:
        return []

def call_lead(phone_number):
    """Trigger voice call"""
    try:
        requests.post("https://your-replit-url/initiate_call", json={"phone": phone_number})
    except:
        pass

def send_slack_alert(lead):
    """Send Slack alert if hot or high score"""
    if not SLACK_WEBHOOK_URL:
        return False
        
    fields = lead["fields"]
    if fields.get("🔥 Hot Lead") or fields.get("📈 Lead Score", 0) >= 80:
        msg = f"""🔥 *Hot Lead Alert*
👤 {fields.get('Name', 'N/A')}
📞 {fields.get('Phone')}
📧 {fields.get('Email', 'N/A')}
"""
        try:
            requests.post(SLACK_WEBHOOK_URL, json={"text": msg})
            return True
        except:
            pass
    return False

def update_airtable(lead):
    """Log back to Airtable"""
    if not AIRTABLE_API_KEY or not BASE_ID or not TABLE_NAME:
        return
        
    id = lead["id"]
    fields = lead["fields"]
    current_attempts = fields.get("# Call Attempts", 0)
    new_attempts = current_attempts + 1

    headers = {
        "Authorization": f"Bearer {AIRTABLE_API_KEY}",
        "Content-Type": "application/json"
    }

    updates = {
        "📅 Last Called": datetime.utcnow().isoformat(),
        "# Call Attempts": new_attempts,
        "📞 Call Status": "Call Attempted"
    }

    if new_attempts >= 2 and not fields.get("🧠 Escalated"):
        try:
            requests.post("https://your-replit-url/ai_followup", json={
                "name": fields.get("Name", ""),
                "email": fields.get("Email", ""),
                "phone": fields.get("Phone", "")
            })
            updates["🧠 Escalated"] = True
        except:
            pass

    if send_slack_alert(lead):
        updates["🚨 Slack Alert Sent"] = True

    url = f"https://api.airtable.com/v0/{BASE_ID}/{TABLE_NAME}/{id}"
    try:
        requests.patch(url, json={"fields": updates}, headers=headers)
    except:
        pass

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

def handler(request):
    """Main handler"""
    leads = get_pipeline_leads()
    for lead in leads:
        phone = lead["fields"].get("Phone")
        if not phone:
            continue
        call_lead(phone)
        update_airtable(lead)
    return {"calls_triggered": len(leads)}

def trigger_pipeline_calls():
    """Main function to trigger calls for all pipeline leads"""
    return handler(None)

if __name__ == "__main__":
    # Test the function
    result = trigger_pipeline_calls()
    print(result)