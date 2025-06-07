import os
import requests

def post_to_command_center(event_type, source, ref_id, summary, timestamp):
    """
    Post events to Command Center metrics dashboard for live tracking
    """
    url = os.getenv("COMMAND_CENTER_METRICS_URL")  # e.g. https://command.yobot.bot/api/metrics
    api_key = os.getenv('COMMAND_CENTER_API_KEY')
    
    if not url or not api_key:
        print("Command Center credentials not configured - cannot sync event")
        return
        
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "event": event_type,
        "source": source,
        "reference_id": str(ref_id),
        "details": summary,
        "timestamp": timestamp,
        "status": "completed"
    }

    try:
        res = requests.post(url, headers=headers, json=payload)
        if res.status_code == 200:
            print(f"✅ Command Center sync successful: {event_type}")
        else:
            print(f"⚠️ Command Center sync failed: {res.status_code}")
    except Exception as e:
        print(f"⚠️ Command Center sync error: {e}")

if __name__ == "__main__":
    # Test the command center logger
    from datetime import datetime
    test_time = datetime.utcnow().isoformat() + 'Z'
    post_to_command_center(
        event_type="🎫 Auto-Close",
        source="Zendesk", 
        ref_id=12345,
        summary="Test ticket auto-closure",
        timestamp=test_time
    )