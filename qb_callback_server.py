from flask import Flask, request
import requests
import base64
import json

app = Flask(__name__)

# Your QuickBooks credentials
CLIENT_ID = 'ABFKQruSPhRVxF89f0OfjopDH75UfGrCvswLR185exeZti85ep'
CLIENT_SECRET = 'E2TnUZabfdR7Ty2jV4d8R95VlD4Fl4GwoEaXjm17'
REDIRECT_URI = 'https://developer.intuit.com/v2/OAuth2Playground/RedirectUrl'

@app.route('/')
def index():
    return "YoBot QBO Sync is live ✅"

@app.route('/auth')
def get_auth_url():
    auth_url = f"https://appcenter.intuit.com/connect/oauth2?client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}&response_type=code&scope=com.intuit.quickbooks.accounting openid profile email&state=yobot_auth"
    return {
        "auth_url": auth_url,
        "instructions": "Visit this URL to authorize QuickBooks access"
    }

@app.route('/callback')
def callback():
    code = request.args.get('code')
    realm_id = request.args.get('realmId')
    
    if not code or not realm_id:
        return {
            "status": "❌ Missing parameters",
            "params": request.args.to_dict()
        }
    
    try:
        # Exchange code for access token
        auth_header = base64.b64encode(f"{CLIENT_ID}:{CLIENT_SECRET}".encode()).decode()
        
        token_response = requests.post(
            'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
            data={
                'grant_type': 'authorization_code',
                'code': code,
                'redirect_uri': REDIRECT_URI
            },
            headers={
                'Authorization': f'Basic {auth_header}',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        )
        
        if token_response.status_code != 200:
            return {
                "status": "❌ Token exchange failed",
                "error": token_response.text
            }
        
        tokens = token_response.json()
        access_token = tokens['access_token']
        
        # Get customers
        customers_response = requests.get(
            f'https://sandbox-quickbooks.api.intuit.com/v3/company/{realm_id}/query?query=SELECT * FROM Customer&minorversion=65',
            headers={
                'Authorization': f'Bearer {access_token}',
                'Accept': 'application/json'
            }
        )
        
        customers = []
        if customers_response.status_code == 200:
            customers_data = customers_response.json()
            customers = customers_data.get('QueryResponse', {}).get('Customer', [])
        
        # Get items/products
        items_response = requests.get(
            f'https://sandbox-quickbooks.api.intuit.com/v3/company/{realm_id}/query?query=SELECT * FROM Item&minorversion=65',
            headers={
                'Authorization': f'Bearer {access_token}',
                'Accept': 'application/json'
            }
        )
        
        items = []
        if items_response.status_code == 200:
            items_data = items_response.json()
            items = items_data.get('QueryResponse', {}).get('Item', [])
        
        return {
            "status": "✅ QuickBooks connection successful",
            "access_token": access_token,
            "refresh_token": tokens.get('refresh_token'),
            "realm_id": realm_id,
            "customers_count": len(customers),
            "items_count": len(items),
            "customers": [{"id": c.get('Id'), "name": c.get('Name')} for c in customers],
            "items": [{"id": i.get('Id'), "name": i.get('Name'), "price": i.get('UnitPrice')} for i in items]
        }
        
    except Exception as e:
        return {
            "status": "❌ Error processing callback",
            "error": str(e)
        }

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080)