"""
QuickBooks Client ID Fix
Simple way to add the missing client ID and test token refresh
"""

import os
import requests
from universal_webhook_logger import log_to_airtable

def set_quickbooks_client_id(client_id):
    """
    Set the QuickBooks client ID and test token refresh
    """
    print(f"Setting QuickBooks Client ID: {client_id[:10]}...")
    
    # Set the environment variable
    os.environ['QUICKBOOKS_CLIENT_ID'] = client_id
    
    # Test the token refresh
    return test_quickbooks_token_refresh()

def test_quickbooks_token_refresh():
    """
    Test QuickBooks token refresh with current credentials
    """
    try:
        refresh_token = os.getenv("QUICKBOOKS_REFRESH_TOKEN")
        client_id = os.getenv("QUICKBOOKS_CLIENT_ID")
        client_secret = os.getenv("QUICKBOOKS_CLIENT_SECRET")
        
        print(f"Refresh Token: {'✅ Available' if refresh_token else '❌ Missing'}")
        print(f"Client ID: {'✅ Available' if client_id else '❌ Missing'}")
        print(f"Client Secret: {'✅ Available' if client_secret else '❌ Missing'}")
        
        if not all([refresh_token, client_id, client_secret]):
            return {
                "success": False,
                "error": "Missing credentials",
                "details": "Need refresh token, client ID, and client secret"
            }
        
        # QuickBooks token refresh endpoint
        url = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer"
        
        # Use basic auth with client_id:client_secret
        import base64
        auth_string = f"{client_id}:{client_secret}"
        auth_bytes = auth_string.encode('ascii')
        auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
        
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": f"Basic {auth_b64}"
        }
        
        data = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token
        }
        
        print("Attempting token refresh...")
        response = requests.post(url, headers=headers, data=data, timeout=30)
        
        if response.status_code == 200:
            token_data = response.json()
            
            # Log successful refresh
            log_to_airtable('QuickBooks Token Refresh Success', {
                'source': 'QuickBooks API Fix',
                'success': True,
                'details': f'Token refreshed successfully - expires in {token_data.get("expires_in", 0)} seconds',
                'url': 'https://replit.com/@YoBot/CommandCenter'
            })
            
            print(f"✅ Token refresh successful!")
            print(f"   New access token: {token_data.get('access_token', '')[:20]}...")
            print(f"   Expires in: {token_data.get('expires_in', 0)} seconds")
            
            return {
                "success": True,
                "access_token": token_data.get("access_token"),
                "refresh_token": token_data.get("refresh_token"),
                "expires_in": token_data.get("expires_in")
            }
        else:
            error_details = f"HTTP {response.status_code}: {response.text}"
            print(f"❌ Token refresh failed: {error_details}")
            
            # Log failed refresh
            log_to_airtable('QuickBooks Token Refresh Failed', {
                'source': 'QuickBooks API Fix',
                'success': False,
                'errors': error_details,
                'details': 'Token refresh failed - check credentials',
                'url': 'https://replit.com/@YoBot/CommandCenter'
            })
            
            return {
                "success": False,
                "error": "Token refresh failed",
                "details": error_details
            }
            
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Exception during token refresh: {error_msg}")
        
        log_to_airtable('QuickBooks Token Refresh Error', {
            'source': 'QuickBooks API Fix',
            'success': False,
            'errors': error_msg,
            'details': 'Exception occurred during token refresh',
            'url': 'https://replit.com/@YoBot/CommandCenter'
        })
        
        return {
            "success": False,
            "error": "Exception",
            "details": error_msg
        }

if __name__ == "__main__":
    print("QuickBooks Token Refresh Test")
    print("=" * 40)
    result = test_quickbooks_token_refresh()
    
    if result["success"]:
        print("\n🎉 QuickBooks API is now ready!")
    else:
        print(f"\n❌ Still need QuickBooks client ID to complete the fix")
        print("Please provide the QuickBooks client ID to resolve the Critical API Integration")