import requests
import json

# Test the webhook endpoint
try:
    response = requests.post(
        "http://localhost:5000/api/orders/test",
        json={"test": "live_connectivity"},
        timeout=5
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Connection error: {e}")