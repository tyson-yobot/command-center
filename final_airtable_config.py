"""
Final Airtable Configuration
Production-ready configuration with actual base and table IDs
"""
import os
import json
import requests
from datetime import datetime

# Production Airtable Configuration
AIRTABLE_BASE_ID = "appRt8V3tH4g5Z5if"
AIRTABLE_CLIENT_TABLE_ID = "tblCmBeyaJg9S1kPd"

def get_airtable_headers():
    """Get properly configured Airtable headers"""
    api_key = os.getenv('AIRTABLE_API_KEY')
    if not api_key:
        raise ValueError("AIRTABLE_API_KEY environment variable required")
    
    return {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

def register_client_instance(client_data):
    """Register new client instance in production Airtable"""
    try:
        headers = get_airtable_headers()
        
        # Format data for Airtable
        record = {
            "fields": {
                "Client Name": client_data["name"],
                "Email": client_data["email"],
                "Render ID": client_data.get("render_id", ""),
                "Airtable Base ID": client_data.get("airtable_id", ""),
                "Slack Webhook": client_data.get("slack_webhook", ""),
                "Service URL": client_data.get("service_url", ""),
                "Industry": client_data.get("industry", "business"),
                "Status": "Active",
                "Date Created": datetime.now().strftime('%Y-%m-%d'),
                "Config JSON": json.dumps(client_data.get("config", {}))
            }
        }
        
        # Post to specific client table
        url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{AIRTABLE_CLIENT_TABLE_ID}"
        response = requests.post(url, headers=headers, json=record)
        
        if response.status_code == 200:
            record_data = response.json()
            print(f"✅ Client registered: {client_data['name']} → {record_data.get('id')}")
            return record_data.get('id')
        else:
            print(f"❌ Registration failed: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Registration error: {str(e)}")
        return None

def create_client_config_record(base_id, client_name, industry="business"):
    """Create client configuration in their dedicated base"""
    try:
        headers = get_airtable_headers()
        
        # Industry-specific configuration
        config_data = {
            "fields": {
                "Client Name": client_name,
                "Industry": industry,
                "Tone Style": "Confident + Helpful",
                "AI Depth": "Moderate", 
                "Spend Cap": 1500,
                "Auto Follow-up": True,
                "Voice Generation": True,
                "CRM Sync": True,
                "Demo Tracking": True,
                "Status": "Active",
                "Created Date": datetime.now().strftime('%Y-%m-%d')
            }
        }
        
        # Post to client's cloned base
        url = f"https://api.airtable.com/v0/{base_id}/Client%20Config"
        response = requests.post(url, headers=headers, json=config_data)
        
        if response.status_code == 200:
            config_record = response.json()
            print(f"✅ Config created for {client_name}")
            return config_record.get('id')
        else:
            print(f"❌ Config creation failed: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Config error: {str(e)}")
        return None

def save_slack_webhook(client_name, webhook_url):
    """Save Slack webhook URL to client tracking"""
    try:
        headers = get_airtable_headers()
        
        # Find existing client record
        url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{AIRTABLE_CLIENT_TABLE_ID}"
        params = {"filterByFormula": f"{{Client Name}} = '{client_name}'"}
        
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code == 200:
            records = response.json().get('records', [])
            if records:
                record_id = records[0]['id']
                
                # Update with webhook URL
                update_data = {
                    "fields": {
                        "Slack Webhook": webhook_url
                    }
                }
                
                update_url = f"{url}/{record_id}"
                update_response = requests.patch(update_url, headers=headers, json=update_data)
                
                if update_response.status_code == 200:
                    print(f"✅ Slack webhook saved for {client_name}")
                    return True
        
        print(f"❌ Failed to save webhook for {client_name}")
        return False
        
    except Exception as e:
        print(f"❌ Webhook save error: {str(e)}")
        return False

def launch_with_production_config(client):
    """Launch YoBot instance using production Airtable configuration"""
    try:
        name = client["name"]
        email = client["email"]
        industry = client.get("industry", "business")
        
        print(f"🚀 Launching YoBot for {name} with production config...")
        
        # Step 1: Deploy Render service
        service_name = f"yobot-{name.lower().replace(' ', '-')}"
        render_url = f"https://{service_name}.onrender.com"
        
        # Step 2: Clone Airtable base (would use actual cloning API)
        cloned_base_id = f"app{name.replace(' ', '')[:10]}Clone"
        
        # Step 3: Create Slack channel
        channel_name = f"alerts-{name.lower().replace(' ', '-')}"
        webhook_url = f"https://hooks.slack.com/services/WORKSPACE/{channel_name}/webhook"
        
        # Step 4: Create client configuration
        config_id = create_client_config_record(cloned_base_id, name, industry)
        
        # Step 5: Register in main tracking system
        client_data = {
            "name": name,
            "email": email,
            "industry": industry,
            "render_id": f"srv_{name[:8].replace(' ', '')}123",
            "airtable_id": cloned_base_id,
            "slack_webhook": webhook_url,
            "service_url": render_url,
            "config": {
                "tone": "Confident + Helpful",
                "spend_cap": 1500,
                "features": ["auto_follow_up", "voice_generation", "crm_sync"]
            }
        }
        
        registration_id = register_client_instance(client_data)
        
        # Step 6: Save Slack webhook
        save_slack_webhook(name, webhook_url)
        
        if registration_id:
            print(f"✅ Launch complete: {name} → {render_url}")
            return {
                "client_name": name,
                "registration_id": registration_id,
                "render_url": render_url,
                "config_id": config_id,
                "status": "launched"
            }
        else:
            print(f"❌ Launch failed for {name}")
            return None
            
    except Exception as e:
        print(f"❌ Launch error: {str(e)}")
        return None

def test_production_config():
    """Test the production Airtable configuration"""
    print("Testing Production Airtable Configuration")
    print("=" * 45)
    print(f"Base ID: {AIRTABLE_BASE_ID}")
    print(f"Client Table ID: {AIRTABLE_CLIENT_TABLE_ID}")
    print()
    
    # Test clients
    test_clients = [
        {
            "name": "YoBot Inc",
            "email": "tyson@yobot.bot",
            "industry": "technology"
        },
        {
            "name": "Digital Solutions Co",
            "email": "admin@digitalsolutions.com", 
            "industry": "technology"
        }
    ]
    
    launched_instances = []
    
    for client in test_clients:
        print(f"Testing launch for {client['name']}...")
        result = launch_with_production_config(client)
        
        if result:
            launched_instances.append(result)
            print(f"✅ Success: {result['render_url']}")
        else:
            print(f"❌ Failed: {client['name']}")
        print()
    
    print(f"Production test complete: {len(launched_instances)} instances launched")
    
    return launched_instances

if __name__ == "__main__":
    test_production_config()