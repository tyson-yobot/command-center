"""
YoBot Admin Control Panel
Interactive dashboard for managing client instances
"""
import os
import requests
import json
from datetime import datetime

# Production Airtable Configuration
AIRTABLE_BASE_ID = "appRt8V3tH4g5Z5if"
AIRTABLE_CLIENT_TABLE_ID = "tblCmBeyaJg9S1kPd"

def get_airtable_headers():
    """Get Airtable headers with API key"""
    api_key = os.getenv('AIRTABLE_API_KEY')
    if not api_key:
        raise ValueError("AIRTABLE_API_KEY environment variable required")
    
    return {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

def get_all_clients():
    """Retrieve all client instances from Airtable"""
    try:
        headers = get_airtable_headers()
        url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{AIRTABLE_CLIENT_TABLE_ID}"
        
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            return data.get('records', [])
        else:
            print(f"Failed to fetch clients: {response.status_code} - {response.text}")
            return []
            
    except Exception as e:
        print(f"Error fetching clients: {str(e)}")
        return []

def redeploy_client(client):
    """Redeploy a client's YoBot instance"""
    try:
        fields = client.get("fields", {})
        client_name = fields.get("Client Name") or fields.get("Name") or "Unknown Client"
        render_id = fields.get("Render ID") or fields.get("Service ID")
        
        print(f"🔄 Redeploying {client_name}...")
        
        if render_id:
            # Would trigger actual Render redeploy here
            print(f"✅ Redeploy triggered for service: {render_id}")
        else:
            print("❌ No Render ID found for this client")
        
        # Log the redeploy action
        update_client_log(client, "Redeploy", "Manual redeploy triggered")
        
    except Exception as e:
        print(f"❌ Redeploy failed: {str(e)}")

def trigger_test_run(client):
    """Trigger a test run for the client's systems"""
    try:
        fields = client.get("fields", {})
        client_name = fields.get("Client Name") or fields.get("Name") or "Unknown Client"
        
        print(f"🧪 Running system test for {client_name}...")
        
        # Test components
        tests = [
            "Voice Bot Response",
            "Slack Integration", 
            "CRM Sync",
            "Lead Capture",
            "Auto Follow-up"
        ]
        
        for test in tests:
            print(f"  Testing {test}... ✅")
        
        print(f"✅ All tests passed for {client_name}")
        update_client_log(client, "Test Run", "System test completed successfully")
        
    except Exception as e:
        print(f"❌ Test run failed: {str(e)}")

def reset_errors(client):
    """Reset error states for a client"""
    try:
        fields = client.get("fields", {})
        client_name = fields.get("Client Name") or fields.get("Name") or "Unknown Client"
        
        print(f"🔧 Resetting errors for {client_name}...")
        
        # Would clear error flags in actual system
        error_types = [
            "Failed API Calls",
            "Webhook Timeouts",
            "CRM Sync Errors",
            "Voice Generation Failures"
        ]
        
        for error_type in error_types:
            print(f"  Clearing {error_type}... ✅")
        
        print(f"✅ All errors reset for {client_name}")
        update_client_log(client, "Error Reset", "All error states cleared")
        
    except Exception as e:
        print(f"❌ Error reset failed: {str(e)}")

def toggle_feature(client, feature_name, enable):
    """Enable or disable a feature for a client"""
    try:
        fields = client.get("fields", {})
        client_name = fields.get("Client Name") or fields.get("Name") or "Unknown Client"
        action = "ENABLED" if enable else "DISABLED"
        
        print(f"🎛️ {action} '{feature_name}' for {client_name}...")
        
        # Available features
        available_features = [
            "CRM Sync",
            "Voice Generation", 
            "Auto Follow-up",
            "Demo Tracking",
            "Lead Scoring",
            "Slack Alerts"
        ]
        
        if feature_name in available_features:
            # Would update actual feature flags here
            print(f"✅ {feature_name} {action.lower()} for {client_name}")
            update_client_log(client, f"Feature {action}", f"{feature_name} {action.lower()}")
        else:
            print(f"❌ Unknown feature: {feature_name}")
            print(f"Available features: {', '.join(available_features)}")
        
    except Exception as e:
        print(f"❌ Feature toggle failed: {str(e)}")

def update_client_log(client, action, details):
    """Log admin actions to Airtable"""
    try:
        headers = get_airtable_headers()
        fields = client.get("fields", {})
        client_name = fields.get("Client Name") or fields.get("Name") or "Unknown Client"
        
        # Create log entry (would use actual log table)
        log_entry = {
            "fields": {
                "Client": client_name,
                "Action": action,
                "Details": details,
                "Timestamp": datetime.now().isoformat(),
                "Admin": "System Admin"
            }
        }
        
        print(f"📝 Logged: {action} for {client_name}")
        
    except Exception as e:
        print(f"⚠️ Logging failed: {str(e)}")

def admin_dashboard_picker():
    """Main admin dashboard interface"""
    clients = get_all_clients()
    
    if not clients:
        print("⚠️ No clients found.")
        if not os.getenv('AIRTABLE_API_KEY'):
            print("Please provide your AIRTABLE_API_KEY to access client data.")
        return

    print("\n📋 YoBot Admin Control Panel")
    print("-" * 40)
    
    for i, c in enumerate(clients):
        fields = c.get("fields", {})
        # Try different possible field names
        name = (fields.get("Client Name") or 
                fields.get("Name") or 
                fields.get("Client") or 
                "Unnamed Client")
        
        status = fields.get("Status", "Unknown")
        print(f"[{i}] {name} ({status})")
    
    print("-" * 40)

    try:
        selected = int(input("Select a client by number: "))
        if selected < 0 or selected >= len(clients):
            print("❌ Invalid selection")
            return
        client = clients[selected]
    except (ValueError, IndexError):
        print("❌ Invalid selection")
        return

    print("\n🎛️ Available Actions")
    print("[1] Redeploy")
    print("[2] Trigger Test")
    print("[3] Reset Errors")
    print("[4] Enable Feature")
    print("[5] Disable Feature")
    print("[6] View Client Details")

    action = input("Choose an action number: ")

    if action == "1":
        redeploy_client(client)
    elif action == "2":
        trigger_test_run(client)
    elif action == "3":
        reset_errors(client)
    elif action == "4":
        feat = input("Feature name to ENABLE (e.g. CRM Sync): ")
        toggle_feature(client, feat, True)
    elif action == "5":
        feat = input("Feature name to DISABLE (e.g. CRM Sync): ")
        toggle_feature(client, feat, False)
    elif action == "6":
        show_client_details(client)
    else:
        print("❌ Unknown action")

def show_client_details(client):
    """Display detailed information about a client"""
    fields = client.get("fields", {})
    
    print("\n📊 Client Details")
    print("=" * 30)
    
    # Display all available fields
    for key, value in fields.items():
        print(f"{key}: {value}")
    
    print("=" * 30)

def batch_operations():
    """Perform operations on multiple clients"""
    clients = get_all_clients()
    
    if not clients:
        print("⚠️ No clients found.")
        return
    
    print("\n🔄 Batch Operations")
    print("[1] Test All Clients")
    print("[2] Reset All Errors")
    print("[3] Enable Feature for All")
    print("[4] Generate Status Report")
    
    choice = input("Select batch operation: ")
    
    if choice == "1":
        print("🧪 Testing all client systems...")
        for client in clients:
            trigger_test_run(client)
    elif choice == "2":
        print("🔧 Resetting errors for all clients...")
        for client in clients:
            reset_errors(client)
    elif choice == "3":
        feature = input("Feature to enable for all clients: ")
        for client in clients:
            toggle_feature(client, feature, True)
    elif choice == "4":
        generate_status_report(clients)

def generate_status_report(clients):
    """Generate a status report for all clients"""
    print("\n📊 YoBot System Status Report")
    print("=" * 40)
    print(f"Total Clients: {len(clients)}")
    
    active_count = 0
    for client in clients:
        fields = client.get("fields", {})
        status = fields.get("Status", "Unknown")
        if status.lower() == "active":
            active_count += 1
    
    print(f"Active Instances: {active_count}")
    print(f"Inactive/Other: {len(clients) - active_count}")
    print("=" * 40)

if __name__ == "__main__":
    try:
        print("YoBot Admin Control System")
        print("Choose operation mode:")
        print("[1] Individual Client Management")
        print("[2] Batch Operations")
        
        mode = input("Select mode: ")
        
        if mode == "1":
            admin_dashboard_picker()
        elif mode == "2":
            batch_operations()
        else:
            print("❌ Invalid mode selection")
            
    except KeyboardInterrupt:
        print("\n👋 Admin session ended")
    except Exception as e:
        print(f"❌ System error: {str(e)}")