import os
import requests

def log_to_hubspot(ticket_id, subject, closed_time):
    """
    Log Zendesk ticket closures as activities in HubSpot
    """
    hubspot_token = os.getenv('HUBSPOT_ACCESS_TOKEN')
    
    if not hubspot_token:
        print("HubSpot access token not configured - cannot log ticket closure")
        return

    url = "https://api.hubapi.com/engagements/v1/engagements"
    headers = {
        "Authorization": f"Bearer {hubspot_token}",
        "Content-Type": "application/json"
    }

    payload = {
        "engagement": {
            "active": True,
            "type": "NOTE",
            "timestamp": int(__import__('datetime').datetime.fromisoformat(closed_time.replace('Z', '+00:00')).timestamp() * 1000) if closed_time else None
        },
        "metadata": {
            "body": f"✅ Zendesk ticket #{ticket_id} was auto-closed.\n\nSubject: {subject}\n\nTicket automatically resolved after being in solved status for 48+ hours."
        }
    }

    try:
        res = requests.post(url, headers=headers, json=payload)
        if res.status_code == 200:
            print(f"✅ HubSpot engagement logged for ticket {ticket_id}")
        else:
            print(f"❌ HubSpot logging failed: {res.status_code} - {res.text}")
    except Exception as e:
        print(f"❌ HubSpot logging error: {e}")

if __name__ == "__main__":
    # Test the HubSpot logger
    from datetime import datetime
    test_time = datetime.utcnow().isoformat() + 'Z'
    log_to_hubspot(12345, "Test ticket subject", test_time)