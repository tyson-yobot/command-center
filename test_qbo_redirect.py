import requests

url = "https://72ddfeee-d145-4891-a820-14d5b3e09c66-00-c9rkbm78q1s2.worf.replit.dev/api/qbo/auth"

response = requests.get(url, allow_redirects=False)
print(f"Status Code: {response.status_code}")
print(f"Headers: {dict(response.headers)}")

if 'Location' in response.headers:
    print(f"Redirect URL: {response.headers['Location']}")
    print("✅ Redirect working correctly")
else:
    print(f"Response Body: {response.text}")
    print("❌ Still returning JSON instead of redirecting")