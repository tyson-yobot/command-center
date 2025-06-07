"""
YoBot Integration Status Dashboard
Real-time status of all external service connections and automations
"""
import os
import requests
from datetime import datetime

def check_phantombuster_status():
    """Check Phantombuster API status with different endpoint formats"""
    api_key = os.getenv('PHANTOMBUSTER_API_KEY')
    if not api_key:
        return {"service": "Phantombuster", "status": "❌", "message": "API key not configured"}
    
    # Try different API endpoints and authentication methods
    endpoints_to_try = [
        {
            "url": "https://phantombuster.com/api/v1/agent/all",
            "headers": {"X-Phantombuster-Key-1": api_key}
        },
        {
            "url": "https://api.phantombuster.com/api/v1/agents",
            "headers": {"X-Phantombuster-Key-1": api_key}
        },
        {
            "url": "https://phantombuster.com/api/v2/agents",
            "headers": {"X-Phantombuster-Key": api_key}
        }
    ]
    
    for i, endpoint in enumerate(endpoints_to_try):
        try:
            response = requests.get(endpoint["url"], headers=endpoint["headers"], timeout=10)
            if response.status_code == 200:
                return {
                    "service": "Phantombuster", 
                    "status": "✅", 
                    "message": f"Connected successfully (endpoint {i+1})",
                    "endpoint": endpoint["url"]
                }
            elif response.status_code == 401:
                return {"service": "Phantombuster", "status": "🔑", "message": "Authentication failed - check API key"}
        except Exception as e:
            continue
    
    return {"service": "Phantombuster", "status": "❌", "message": "All endpoints failed - please verify API key"}

def check_hubspot_status():
    """Check HubSpot API status"""
    api_key = os.getenv('HUBSPOT_API_KEY')
    if not api_key:
        return {"service": "HubSpot", "status": "❌", "message": "API key not configured"}
    
    try:
        response = requests.get(
            f"https://api.hubapi.com/contacts/v1/lists/all?hapikey={api_key}",
            timeout=10
        )
        if response.status_code == 200:
            return {"service": "HubSpot", "status": "✅", "message": "Connected successfully"}
        else:
            return {"service": "HubSpot", "status": "❌", "message": f"API Error: {response.status_code}"}
    except Exception as e:
        return {"service": "HubSpot", "status": "❌", "message": f"Connection error: {str(e)}"}

def check_airtable_status():
    """Check Airtable API status"""
    api_key = os.getenv('AIRTABLE_API_KEY')
    base_id = os.getenv('AIRTABLE_BASE_ID')
    
    if not api_key or not base_id:
        return {"service": "Airtable", "status": "❌", "message": "API key or base ID not configured"}
    
    try:
        response = requests.get(
            f"https://api.airtable.com/v0/{base_id}",
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=10
        )
        if response.status_code == 200:
            return {"service": "Airtable", "status": "✅", "message": "Connected successfully"}
        else:
            return {"service": "Airtable", "status": "❌", "message": f"API Error: {response.status_code}"}
    except Exception as e:
        return {"service": "Airtable", "status": "❌", "message": f"Connection error: {str(e)}"}

def check_slack_status():
    """Check Slack webhook status"""
    webhook_url = os.getenv('SLACK_WEBHOOK_URL')
    if not webhook_url:
        return {"service": "Slack", "status": "❌", "message": "Webhook URL not configured"}
    
    try:
        test_payload = {"text": "YoBot integration test"}
        response = requests.post(webhook_url, json=test_payload, timeout=10)
        if response.status_code == 200:
            return {"service": "Slack", "status": "✅", "message": "Webhook connected successfully"}
        else:
            return {"service": "Slack", "status": "❌", "message": f"Webhook Error: {response.status_code}"}
    except Exception as e:
        return {"service": "Slack", "status": "❌", "message": f"Connection error: {str(e)}"}

def check_quickbooks_status():
    """Check QuickBooks API status"""
    access_token = os.getenv('QUICKBOOKS_ACCESS_TOKEN')
    realm_id = os.getenv('QUICKBOOKS_REALM_ID')
    
    if not access_token or not realm_id:
        return {"service": "QuickBooks", "status": "❌", "message": "Access token or realm ID not configured"}
    
    try:
        response = requests.get(
            f"https://sandbox-quickbooks.api.intuit.com/v3/company/{realm_id}/companyinfo/{realm_id}",
            headers={"Authorization": f"Bearer {access_token}", "Accept": "application/json"},
            timeout=10
        )
        if response.status_code == 200:
            return {"service": "QuickBooks", "status": "✅", "message": "Connected successfully"}
        else:
            return {"service": "QuickBooks", "status": "❌", "message": f"API Error: {response.status_code}"}
    except Exception as e:
        return {"service": "QuickBooks", "status": "❌", "message": f"Connection error: {str(e)}"}

def check_zendesk_status():
    """Check Zendesk API status"""
    domain = os.getenv('ZENDESK_DOMAIN')
    email = os.getenv('ZENDESK_EMAIL')
    
    if not domain or not email:
        return {"service": "Zendesk", "status": "❌", "message": "Domain or email not configured"}
    
    return {"service": "Zendesk", "status": "⚠️", "message": "Configured but not fully tested"}

def generate_integration_status_report():
    """Generate comprehensive integration status report"""
    print("🤖 YoBot Integration Status Dashboard")
    print("=" * 50)
    print(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Check all integrations
    integrations = [
        check_phantombuster_status(),
        check_hubspot_status(),
        check_airtable_status(),
        check_slack_status(),
        check_quickbooks_status(),
        check_zendesk_status()
    ]
    
    # Display results
    for integration in integrations:
        status_line = f"{integration['status']} {integration['service']:<15} | {integration['message']}"
        print(status_line)
    
    # Summary
    connected_count = len([i for i in integrations if i['status'] == '✅'])
    total_count = len(integrations)
    
    print()
    print(f"📊 Summary: {connected_count}/{total_count} integrations active")
    print(f"🎯 System Health: {(connected_count/total_count)*100:.1f}%")
    
    return integrations

def main():
    """Run integration status check"""
    generate_integration_status_report()

if __name__ == "__main__":
    main()