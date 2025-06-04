"""
Retry Callback Scheduler
Runs on schedule (every 10 minutes) to re-attempt missed calls
"""
import requests
import os
from datetime import datetime
from missed_call_slack_alert import send_retry_alert

AIRTABLE_KEY = os.getenv("AIRTABLE_KEY", "paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa")
AIRTABLE_BASE_ID = os.getenv("AIRTABLE_BASE_ID", "appRt8V3tH4g5Z5if")
TABLE_ID = os.getenv("TABLE_ID", "tbldPRZ4nHbtj9opU")
RETRY_URL = "https://72ddfeee-d145-4891-a820-14d5b3e09c66-00-c9rkbm78q1s2.worf.replit.dev/api/start-outbound-call"

def process_retry_callbacks():
    """Pull missed calls and schedule retry attempts"""
    
    # Step 1: Pull missed calls with no retry yet
    headers = {
        "Authorization": f"Bearer {AIRTABLE_KEY}"
    }
    params = {
        "filterByFormula": "AND({📄 Call Outcome} = '🔕 Missed', NOT({📅 Callback Scheduled} = ''))"
    }

    try:
        response = requests.get(
            f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{TABLE_ID}",
            headers=headers,
            params=params
        )
        response.raise_for_status()
        
        records = response.json().get("records", [])
        print(f"📋 Found {len(records)} missed calls to retry")

        # Step 2: Loop and retry
        retry_count = 0
        for record in records:
            phone = record['fields'].get("📞 Caller Number")
            record_id = record['id']
            
            if not phone:
                continue

            # Send to outbound call endpoint
            retry_payload = {
                "phone": phone,
                "airtable_record_id": record_id,
                "retry": True
            }

            try:
                retry_response = requests.post(RETRY_URL, json=retry_payload, timeout=10)
                if retry_response.ok:
                    print(f"✅ Retry call triggered for {phone}")
                    retry_count += 1
                    
                    # Optional: log that a retry was attempted
                    update_payload = {
                        "fields": {
                            "📞 Retry Attempted": datetime.utcnow().isoformat(),
                            "📄 Call Outcome": "🔄 Retry Scheduled"
                        }
                    }

                    requests.patch(
                        f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{TABLE_ID}/{record_id}",
                        headers={
                            "Authorization": f"Bearer {AIRTABLE_KEY}",
                            "Content-Type": "application/json"
                        },
                        json=update_payload
                    )
                else:
                    print(f"❌ Failed to trigger retry for {phone}: {retry_response.status_code}")
                    
            except Exception as e:
                print(f"❌ Error triggering retry for {phone}: {e}")
        
        print(f"📞 Processed {retry_count} retry attempts")
        return {"retries_processed": retry_count, "total_found": len(records)}
        
    except Exception as e:
        print(f"❌ Error processing retry callbacks: {e}")
        return {"error": str(e)}

def retry_callback_scheduler():
    """Flask route wrapper for retry callback scheduler"""
    return process_retry_callbacks()

if __name__ == "__main__":
    # Test the retry callback scheduler
    result = process_retry_callbacks()
    print(f"Scheduler result: {result}")