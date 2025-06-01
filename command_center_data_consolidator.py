#!/usr/bin/env python3
"""
Command Center Data Consolidator
Replaces simulated metrics with real integration data from your existing systems
"""

import requests
import os
from datetime import datetime

def get_real_hubspot_metrics():
    """Get actual metrics from HubSpot CRM"""
    try:
        api_key = os.getenv("HUBSPOT_API_KEY")
        if not api_key:
            return {"error": "HubSpot API key required"}
        
        # Get actual contact count
        contacts_url = "https://api.hubapi.com/crm/v3/objects/contacts?limit=100"
        headers = {"Authorization": f"Bearer {api_key}"}
        
        response = requests.get(contacts_url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            total_contacts = data.get("total", 0)
            recent_contacts = len(data.get("results", []))
            
            return {
                "total_contacts": total_contacts,
                "recent_contacts": recent_contacts,
                "source": "hubspot_crm"
            }
        else:
            return {"error": f"HubSpot API error: {response.status_code}"}
            
    except Exception as e:
        return {"error": str(e)}

def get_real_airtable_metrics():
    """Get actual metrics from your Airtable base"""
    try:
        base_id = os.getenv("AIRTABLE_BASE_ID")
        api_key = os.getenv("AIRTABLE_API_KEY")
        
        if not base_id or not api_key:
            return {"error": "Airtable credentials required"}
        
        # Get actual voice call log count
        calls_url = f"https://api.airtable.com/v0/{base_id}/📞 Voice Call Log"
        headers = {"Authorization": f"Bearer {api_key}"}
        
        response = requests.get(calls_url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            total_calls = len(data.get("records", []))
            
            return {
                "total_voice_calls": total_calls,
                "source": "airtable_voice_log"
            }
        else:
            return {"error": f"Airtable API error: {response.status_code}"}
            
    except Exception as e:
        return {"error": str(e)}

def get_real_slack_activity():
    """Check Slack webhook connectivity"""
    try:
        webhook_url = os.getenv("SLACK_WEBHOOK_URL")
        if not webhook_url:
            return {"error": "Slack webhook URL required"}
        
        # Test webhook responsiveness
        test_payload = {"text": "Command Center metric check"}
        response = requests.post(webhook_url, json=test_payload, timeout=5)
        
        return {
            "slack_webhook_active": response.status_code == 200,
            "last_check": datetime.utcnow().isoformat(),
            "source": "slack_webhook"
        }
        
    except Exception as e:
        return {"error": str(e)}

def consolidate_real_metrics():
    """Consolidate real metrics from all connected services"""
    
    real_metrics = {
        "timestamp": datetime.utcnow().isoformat(),
        "data_source": "authentic_apis"
    }
    
    # Get HubSpot data
    hubspot_data = get_real_hubspot_metrics()
    if "error" not in hubspot_data:
        real_metrics.update(hubspot_data)
    
    # Get Airtable data
    airtable_data = get_real_airtable_metrics()
    if "error" not in airtable_data:
        real_metrics.update(airtable_data)
    
    # Get Slack status
    slack_data = get_real_slack_activity()
    if "error" not in slack_data:
        real_metrics.update(slack_data)
    
    # Calculate real system health based on API responsiveness
    connected_apis = 0
    total_apis = 3
    
    if "total_contacts" in real_metrics:
        connected_apis += 1
    if "total_voice_calls" in real_metrics:
        connected_apis += 1
    if "slack_webhook_active" in real_metrics:
        connected_apis += 1
    
    real_metrics["system_health"] = int((connected_apis / total_apis) * 100)
    real_metrics["connected_integrations"] = connected_apis
    
    return real_metrics

def replace_simulated_with_real_data():
    """Replace command center simulated data with real metrics"""
    
    print("Consolidating real data from authenticated sources...")
    
    real_data = consolidate_real_metrics()
    
    print("Real System Metrics:")
    print("=" * 40)
    
    for key, value in real_data.items():
        if key != "timestamp":
            print(f"{key}: {value}")
    
    # Log real metrics to your existing Airtable table
    try:
        base_id = os.getenv("AIRTABLE_BASE_ID")
        api_key = os.getenv("AIRTABLE_API_KEY")
        
        if base_id and api_key:
            url = f"https://api.airtable.com/v0/{base_id}/📊 Ops Metrics Log"
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            
            airtable_data = {
                "fields": {
                    "Metric Type": "real_system_consolidation",
                    "Value": real_data.get("system_health", 0),
                    "Source": "command_center_consolidator",
                    "Timestamp": real_data["timestamp"]
                }
            }
            
            response = requests.post(url, json=airtable_data, headers=headers, timeout=10)
            
            if response.status_code == 200:
                print("Real metrics logged to Ops Metrics Log")
            else:
                print(f"Logging failed: {response.status_code}")
    
    except Exception as e:
        print(f"Logging error: {e}")
    
    return real_data

if __name__ == "__main__":
    real_metrics = replace_simulated_with_real_data()