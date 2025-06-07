import requests

# Test the correct Replit domain
domain = "72ddfeee-d145-4891-a820-14d5b3e09c66-00-c9rkbm78q1s2.worf.replit.dev"
test_url = f"https://{domain}/api/orders/test"

test_payload = {
    "eventType": "FORM_RESPONSE",
    "data": {
        "fields": [
            {"label": "Full Name", "value": "Domain Test User"},
            {"label": "Company Name", "value": "Domain Test Corp"},
            {"label": "Email Address", "value": "test@domaintest.com"}
        ]
    }
}

try:
    response = requests.post(test_url, json=test_payload, timeout=10)
    print(f"✅ SUCCESS: {test_url}")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text[:200]}...")
    print(f"\n🎯 CORRECT TALLY WEBHOOK URL: {test_url}")
except Exception as e:
    print(f"❌ FAILED: {test_url}")
    print(f"Error: {e}")