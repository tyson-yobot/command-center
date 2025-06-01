"""
QuickBooks Token Refresh Handler
Handles automatic token refresh for QuickBooks Online API
"""

import requests
import os
from datetime import datetime
from universal_webhook_logger import log_to_airtable

def refresh_quickbooks_token():
    """
    Refresh QuickBooks access token using refresh token
    """
    try:
        refresh_token = os.getenv("QUICKBOOKS_REFRESH_TOKEN")
        client_id = os.getenv("QUICKBOOKS_CLIENT_ID") 
        client_secret = os.getenv("QUICKBOOKS_CLIENT_SECRET")
        
        if not all([refresh_token, client_id, client_secret]):
            return {
                "success": False,
                "error": "Missing QuickBooks credentials",
                "details": "Need QUICKBOOKS_REFRESH_TOKEN, QUICKBOOKS_CLIENT_ID, and QUICKBOOKS_CLIENT_SECRET"
            }
        
        # QuickBooks token refresh endpoint
        url = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer"
        
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": f"Basic {client_id}:{client_secret}"
        }
        
        data = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token
        }
        
        response = requests.post(url, headers=headers, data=data, timeout=30)
        
        if response.status_code == 200:
            token_data = response.json()
            
            # Log successful token refresh
            log_to_airtable('QuickBooks Token Refresh', {
                'source': 'QuickBooks API Authentication',
                'success': True,
                'details': f'Access token refreshed successfully - expires in {token_data.get("expires_in", 0)} seconds',
                'url': 'https://replit.com/@YoBot/CommandCenter'
            })
            
            return {
                "success": True,
                "access_token": token_data.get("access_token"),
                "refresh_token": token_data.get("refresh_token"),
                "expires_in": token_data.get("expires_in"),
                "token_type": token_data.get("token_type")
            }
        else:
            error_details = f"HTTP {response.status_code}: {response.text}"
            
            # Log failed token refresh
            log_to_airtable('QuickBooks Token Refresh', {
                'source': 'QuickBooks API Authentication',
                'success': False,
                'errors': error_details,
                'details': 'Token refresh failed - may need to re-authorize application',
                'url': 'https://replit.com/@YoBot/CommandCenter'
            })
            
            return {
                "success": False,
                "error": "Token refresh failed",
                "details": error_details
            }
            
    except Exception as e:
        error_msg = str(e)
        
        # Log exception
        log_to_airtable('QuickBooks Token Refresh', {
            'source': 'QuickBooks API Authentication',
            'success': False,
            'errors': error_msg,
            'details': 'Exception occurred during token refresh process',
            'url': 'https://replit.com/@YoBot/CommandCenter'
        })
        
        return {
            "success": False,
            "error": "Exception during token refresh",
            "details": error_msg
        }

def test_quickbooks_with_refresh():
    """
    Test QuickBooks connection and refresh token if needed
    """
    access_token = os.getenv("QUICKBOOKS_ACCESS_TOKEN")
    realm_id = os.getenv("QUICKBOOKS_REALM_ID")
    
    if not access_token or not realm_id:
        return {
            "status": "missing_credentials",
            "message": "QuickBooks access token or realm ID not configured"
        }
    
    # First, try with existing token
    url = f"https://quickbooks.api.intuit.com/v3/company/{realm_id}/companyinfo/{realm_id}"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json"
    }
    
    response = requests.get(url, headers=headers, timeout=10)
    
    if response.status_code == 200:
        company_info = response.json()
        company_name = company_info.get("QueryResponse", {}).get("CompanyInfo", [{}])[0].get("CompanyName", "Unknown")
        
        return {
            "status": "connected",
            "company_name": company_name,
            "realm_id": realm_id,
            "token_status": "valid"
        }
    elif response.status_code == 401:
        # Token expired, try to refresh
        print("QuickBooks token expired, attempting refresh...")
        refresh_result = refresh_quickbooks_token()
        
        if refresh_result["success"]:
            return {
                "status": "token_refreshed",
                "message": "Token refreshed successfully",
                "new_token": refresh_result["access_token"][:20] + "...",
                "expires_in": refresh_result["expires_in"]
            }
        else:
            return {
                "status": "refresh_failed",
                "error": refresh_result["error"],
                "details": refresh_result["details"]
            }
    else:
        return {
            "status": "api_error",
            "error": f"HTTP {response.status_code}",
            "details": response.text[:200]
        }

if __name__ == "__main__":
    result = test_quickbooks_with_refresh()
    print(f"QuickBooks API Test Result: {result}")