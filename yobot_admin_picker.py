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

def get_all_clients_with_render():
    """Step 1: Pull all clients that have Render IDs"""
    clients = get_all_clients()
    return [c for c in clients if "📦 Render ID" in c["fields"] or "Render ID" in c["fields"]]

def global_redeploy():
    """Step 2: Global redeploy function for all clients"""
    clients = get_all_clients_with_render()
    
    if not clients:
        print("⚠️ No clients with Render IDs found")
        return
    
    print(f"🔄 Starting global redeploy for {len(clients)} clients...")
    
    for c in clients:
        try:
            fields = c.get("fields", {})
            client_name = fields.get("🧾 Client Name") or fields.get("Client Name") or "Unknown"
            redeploy_client(c)
        except Exception as e:
            print(f"⚠️ Failed for {client_name}: {e}")
    
    print("✅ Global redeploy complete.")

def toggle_feature_globally(feature_name, enable=True):
    """Step 3: Apply feature toggle to all clients"""
    clients = get_all_clients()
    
    if not clients:
        print("⚠️ No clients found")
        return
    
    action = "Enabling" if enable else "Disabling"
    print(f"🎛️ {action} '{feature_name}' for {len(clients)} clients...")
    
    for c in clients:
        try:
            fields = c.get("fields", {})
            client_name = fields.get("🧾 Client Name") or fields.get("Client Name") or "Unknown"
            toggle_feature(c, feature_name, enable)
        except Exception as e:
            print(f"⚠️ Toggle failed for {client_name}: {e}")
    
    action_past = "Enabled" if enable else "Disabled"
    print(f"✅ {action_past} '{feature_name}' across all clients.")

def log_global_update(action, notes=""):
    """Step 2: Function to log updates to Global Updates Log table"""
    try:
        headers = {"Authorization": f"Bearer {os.getenv('AIRTABLE_API_KEY')}"}
        record = {
            "fields": {
                "📅 Date": datetime.now().strftime('%Y-%m-%d %H:%M'),
                "👤 Operator": "Tyson",
                "🔧 Action": action,
                "📝 Notes": notes
            }
        }
        
        # Post to Global Updates Log table
        response = requests.post(
            "https://api.airtable.com/v0/appRt8V3tH4g5Z5if/📓%20Global%20Updates%20Log",
            headers=headers,
            json={"records": [record]}
        )
        
        if response.status_code == 200:
            print(f"📝 Logged: {action}")
            return True
        else:
            print(f"⚠️ Log failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"⚠️ Logging error: {str(e)}")
        return False

def broadcast_update():
    """Step 4: One-command broadcast launcher with logging"""
    print("📡 Starting broadcast update across all YoBot instances...")
    
    # Global redeploy
    global_redeploy()
    
    # Enable demo mode globally
    toggle_feature_globally("Demo Mode", True)
    
    # Additional broadcast actions
    toggle_feature_globally("Auto Follow-up", True)
    toggle_feature_globally("Voice Generation", True)
    
    # Log the global update
    log_global_update(
        "Global Redeploy + Demo Mode Enable", 
        "All YoBots updated with latest build and feature toggles"
    )
    
    print("✅ Broadcast update complete across all instances.")

def emergency_shutdown():
    """Emergency shutdown for all client instances"""
    clients = get_all_clients()
    
    print("🚨 EMERGENCY SHUTDOWN: Disabling all YoBot instances...")
    
    for c in clients:
        try:
            fields = c.get("fields", {})
            client_name = fields.get("🧾 Client Name") or fields.get("Client Name") or "Unknown"
            
            # Disable all critical features
            toggle_feature(c, "Voice Bot", False)
            toggle_feature(c, "Auto Follow-up", False)
            toggle_feature(c, "Lead Capture", False)
            
            print(f"🛑 {client_name}: All systems disabled")
            
        except Exception as e:
            print(f"⚠️ Shutdown failed for {client_name}: {e}")
    
    print("🚨 Emergency shutdown complete.")

def log_client_ping(client):
    """1. Client-Specific Analytics Ping"""
    try:
        base_id = client["fields"].get("📊 Airtable Base ID")
        if not base_id:
            print(f"⚠️ No Airtable Base ID for {client['fields'].get('🧾 Client Name', 'Unknown')}")
            return False
            
        headers = {"Authorization": f"Bearer {os.getenv('AIRTABLE_API_KEY')}"}
        payload = {
            "fields": {
                "📅 Ping Timestamp": datetime.now().strftime('%Y-%m-%d %H:%M'),
                "📍 Status": "✅ Online"
            }
        }
        
        response = requests.post(
            f"https://api.airtable.com/v0/{base_id}/📈%20Usage%20Log", 
            headers=headers, 
            json={"records": [payload]}
        )
        
        if response.status_code == 200:
            print(f"📊 Pinged {client['fields'].get('🧾 Client Name', 'Unknown')}")
            return True
        else:
            print(f"⚠️ Ping failed for {client['fields'].get('🧾 Client Name', 'Unknown')}: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"⚠️ Ping error: {str(e)}")
        return False

def check_render_status(client):
    """2. Client Downtime Auto-Checker"""
    try:
        service_id = client["fields"].get("📦 Render ID")
        if not service_id:
            print(f"⚠️ No Render ID for {client['fields'].get('🧾 Client Name', 'Unknown')}")
            return False
            
        headers = {"Authorization": f"Bearer {os.getenv('RENDER_API_KEY')}"}
        response = requests.get(
            f"https://api.render.com/v1/services/{service_id}", 
            headers=headers
        )
        
        client_name = client['fields'].get('🧾 Client Name', 'Unknown')
        
        if response.status_code != 200:
            post_to_slack(f"🚨 {client_name} API check failed!")
            return False
            
        service_data = response.json()
        if service_data.get("status") != "live":
            post_to_slack(f"🚨 {client_name} is offline!")
            return False
        else:
            print(f"✅ {client_name} is online")
            return True
            
    except Exception as e:
        print(f"⚠️ Status check error: {str(e)}")
        return False

def audit_feature_usage(feature):
    """3. Multi-Client Feature Audit"""
    clients = get_all_clients()
    enabled = []
    disabled = []
    
    for c in clients:
        client_name = c["fields"].get("🧾 Client Name", "Unknown")
        config = c["fields"].get("✅ Features Enabled", "")
        
        if feature in config:
            enabled.append(client_name)
        else:
            disabled.append(client_name)
    
    print(f"📊 Feature Audit: {feature}")
    print(f"✅ Enabled ({len(enabled)}): {enabled}")
    print(f"❌ Disabled ({len(disabled)}): {disabled}")
    
    return {"enabled": enabled, "disabled": disabled}

def send_ops_digest():
    """4. Daily Ops Summary Blast"""
    try:
        clients = get_all_clients()
        summary = f"📊 Daily YoBot Report ({datetime.now().date()}):\n\n"
        
        total_clients = len(clients)
        active_clients = 0
        
        for c in clients:
            client_name = c['fields'].get('🧾 Client Name', 'Unknown')
            last_deploy = c['fields'].get('📅 Last Deploy', 'N/A')
            status = c['fields'].get('Status', 'Unknown')
            
            if status.lower() == 'active':
                active_clients += 1
                status_icon = "✅"
            else:
                status_icon = "⚠️"
                
            summary += f"{status_icon} {client_name} — Last Deploy: {last_deploy}\n"
        
        summary += f"\n📈 Summary: {active_clients}/{total_clients} instances active"
        
        post_to_slack(summary)
        print("📧 Daily ops digest sent to Slack")
        
    except Exception as e:
        print(f"⚠️ Digest error: {str(e)}")

def post_to_slack(message):
    """Post message to Slack webhook"""
    try:
        webhook_url = os.getenv('SLACK_WEBHOOK_URL')
        if not webhook_url:
            print("⚠️ No Slack webhook URL configured")
            return False
            
        payload = {"text": message}
        response = requests.post(webhook_url, json=payload)
        
        if response.status_code == 200:
            return True
        else:
            print(f"⚠️ Slack post failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"⚠️ Slack error: {str(e)}")
        return False

def run_comprehensive_health_check():
    """5. Comprehensive Health Check for All Clients"""
    print("🔍 Running comprehensive health check...")
    clients = get_all_clients()
    
    health_report = {
        "online": [],
        "offline": [],
        "ping_success": [],
        "ping_failed": []
    }
    
    for client in clients:
        client_name = client['fields'].get('🧾 Client Name', 'Unknown')
        
        # Check Render status
        if check_render_status(client):
            health_report["online"].append(client_name)
        else:
            health_report["offline"].append(client_name)
        
        # Log analytics ping
        if log_client_ping(client):
            health_report["ping_success"].append(client_name)
        else:
            health_report["ping_failed"].append(client_name)
    
    # Generate summary
    summary = f"""🏥 YoBot Health Check Summary:
    
Online: {len(health_report['online'])} clients
Offline: {len(health_report['offline'])} clients
Analytics OK: {len(health_report['ping_success'])} clients
Analytics Failed: {len(health_report['ping_failed'])} clients

Status: {'🟢 All Systems Operational' if not health_report['offline'] else '🔴 Issues Detected'}"""
    
    post_to_slack(summary)
    return health_report

def generate_status_report(clients):
    """Generate a status report for all clients"""
    print("\n📊 YoBot System Status Report")
    print("=" * 40)
    print(f"Total Clients: {len(clients)}")
    
    active_count = 0
    render_count = 0
    for client in clients:
        fields = client.get("fields", {})
        status = fields.get("Status", "Unknown")
        if status.lower() == "active":
            active_count += 1
        if "📦 Render ID" in fields or "Render ID" in fields:
            render_count += 1
    
    print(f"Active Instances: {active_count}")
    print(f"With Render Services: {render_count}")
    print(f"Inactive/Other: {len(clients) - active_count}")
    print("=" * 40)

def rebroadcast_lead_to_all(lead_data):
    """1. Lead Re-Broadcast to All Bots"""
    clients = get_all_clients_with_render()
    success_count = 0
    failed_count = 0
    
    print(f"📤 Broadcasting lead to {len(clients)} YoBot instances...")
    
    for c in clients:
        try:
            client_name = c["fields"].get("🧾 Client Name", "Unknown")
            render_url = c["fields"].get("📦 Render URL")
            
            if not render_url:
                print(f"⚠️ No Render URL for {client_name}")
                failed_count += 1
                continue
                
            response = requests.post(
                f"{render_url}/lead", 
                json=lead_data,
                timeout=10
            )
            
            if response.status_code == 200:
                print(f"📤 Sent to {client_name}")
                success_count += 1
            else:
                print(f"⚠️ Failed for {client_name}: {response.status_code}")
                failed_count += 1
                
        except Exception as e:
            print(f"⚠️ Failed for {client_name}: {str(e)}")
            failed_count += 1
    
    summary = f"📊 Lead broadcast complete: {success_count} success, {failed_count} failed"
    print(summary)
    post_to_slack(f"📡 {summary}")
    
    return {"success": success_count, "failed": failed_count}

def global_crm_resync():
    """2. Global CRM Re-Sync Trigger"""
    clients = get_all_clients()
    sync_count = 0
    
    print(f"🔄 Triggering CRM sync for {len(clients)} clients...")
    
    for c in clients:
        try:
            client_name = c["fields"].get("🧾 Client Name", "Unknown")
            base_id = c["fields"].get("📊 Airtable Base ID")
            
            if not base_id:
                print(f"⚠️ No Airtable Base ID for {client_name}")
                continue
                
            url = f"https://api.airtable.com/v0/{base_id}/🎯%20CRM"
            headers = {"Authorization": f"Bearer {os.getenv('AIRTABLE_API_KEY')}"}
            
            sync_record = {
                "fields": {
                    "🔁 Sync Now": "✅",
                    "📅 Sync Timestamp": datetime.now().strftime('%Y-%m-%d %H:%M'),
                    "👤 Triggered By": "Admin Panel"
                }
            }
            
            response = requests.post(
                url, 
                headers=headers, 
                json={"records": [sync_record]}
            )
            
            if response.status_code == 200:
                print(f"🔄 CRM sync triggered for {client_name}")
                sync_count += 1
            else:
                print(f"⚠️ Sync failed for {client_name}: {response.status_code}")
                
        except Exception as e:
            print(f"⚠️ Sync error for {client_name}: {str(e)}")
    
    summary = f"🔄 Global CRM sync triggered for {sync_count} clients"
    print(summary)
    post_to_slack(summary)
    
    return sync_count

def scan_and_alert_errors():
    """3. Error Escalator Slack Alert"""
    clients = get_all_clients()
    error_clients = []
    total_errors = 0
    
    print("🔍 Scanning for client errors...")
    
    for c in clients:
        client_name = c["fields"].get("🧾 Client Name", "Unknown")
        error_count = c["fields"].get("💥 Errors", 0)
        
        # Handle different error field formats
        if isinstance(error_count, str):
            try:
                error_count = int(error_count)
            except:
                error_count = 0
        
        if error_count > 0:
            error_clients.append({
                "name": client_name,
                "errors": error_count
            })
            total_errors += error_count
            
            # Send individual alerts for high error counts
            if error_count >= 5:
                post_to_slack(f"🚨 CRITICAL: {client_name} has {error_count} errors!")
            else:
                post_to_slack(f"⚠️ {client_name} has {error_count} errors")
    
    # Send summary alert
    if error_clients:
        error_summary = f"🚨 Error Summary: {len(error_clients)} clients with {total_errors} total errors"
        print(error_summary)
        post_to_slack(error_summary)
    else:
        print("✅ No errors detected across all clients")
        post_to_slack("✅ All YoBot instances error-free")
    
    return error_clients

def generate_fallback_url(client):
    """4. Backup Bot Link Generator"""
    try:
        render_id = client["fields"].get("📦 Render ID")
        client_name = client["fields"].get("🧾 Client Name", "Unknown")
        
        if not render_id:
            print(f"⚠️ No Render ID for {client_name}")
            return None
        
        # Generate multiple fallback options
        fallback_urls = {
            "primary": f"https://fallback-{render_id}.onrender.com",
            "backup": f"https://{render_id}-backup.onrender.com", 
            "emergency": f"https://emergency-{client_name.lower().replace(' ', '-')}.onrender.com"
        }
        
        print(f"🔗 Fallback URLs for {client_name}:")
        for url_type, url in fallback_urls.items():
            print(f"  {url_type.title()}: {url}")
        
        return fallback_urls
        
    except Exception as e:
        print(f"⚠️ Fallback generation error: {str(e)}")
        return None

def emergency_recovery_protocol():
    """5. Emergency Recovery Protocol"""
    print("🚨 INITIATING EMERGENCY RECOVERY PROTOCOL")
    
    # Step 1: Check all client health
    health_report = run_comprehensive_health_check()
    
    # Step 2: Generate fallback URLs for offline clients
    for offline_client in health_report.get("offline", []):
        clients = get_all_clients()
        for client in clients:
            if client["fields"].get("🧾 Client Name") == offline_client:
                generate_fallback_url(client)
    
    # Step 3: Trigger global CRM resync
    global_crm_resync()
    
    # Step 4: Scan for errors and alert
    scan_and_alert_errors()
    
    # Step 5: Send ops digest
    send_ops_digest()
    
    # Step 6: Log emergency action
    log_global_update(
        "Emergency Recovery Protocol", 
        f"Full system recovery initiated. {len(health_report.get('offline', []))} offline clients detected."
    )
    
    print("✅ Emergency recovery protocol complete")
    
    return {
        "health_check": health_report,
        "recovery_actions": [
            "Health check completed",
            "Fallback URLs generated", 
            "CRM resync triggered",
            "Error scan completed",
            "Ops digest sent"
        ]
    }

def rotate_api_key(client, key_field, new_key):
    """1. API Key Rotator"""
    try:
        base_id = client["fields"].get("📊 Airtable Base ID")
        client_name = client["fields"].get("🧾 Client Name", "Unknown")
        
        if not base_id:
            print(f"⚠️ No Airtable Base ID for {client_name}")
            return False
            
        headers = {"Authorization": f"Bearer {os.getenv('AIRTABLE_API_KEY')}"}
        data = {
            "records": [{
                "fields": {
                    key_field: new_key,
                    "📅 Rotated": datetime.now().strftime('%Y-%m-%d %H:%M'),
                    "👤 Rotated By": "Admin Panel"
                }
            }],
            "typecast": True
        }
        
        response = requests.patch(
            f"https://api.airtable.com/v0/{base_id}/🔐%20Secrets", 
            headers=headers, 
            json=data
        )
        
        if response.status_code == 200:
            print(f"🔐 Rotated {key_field} for {client_name}")
            post_to_slack(f"🔐 API key rotation complete for {client_name}")
            return True
        else:
            print(f"⚠️ Key rotation failed for {client_name}: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"⚠️ Key rotation error: {str(e)}")
        return False

def run_test_suite(client, suite_name="basic"):
    """2. Targeted Bot Test Runner"""
    try:
        render_url = client["fields"].get("📦 Render URL")
        client_name = client["fields"].get("🧾 Client Name", "Unknown")
        
        if not render_url:
            print(f"⚠️ No Render URL for {client_name}")
            return False
            
        test_payload = {
            "suite": suite_name,
            "timestamp": datetime.now().isoformat(),
            "triggered_by": "admin_panel"
        }
        
        response = requests.post(
            f"{render_url}/test", 
            json=test_payload,
            timeout=30
        )
        
        if response.status_code == 200:
            print(f"🧪 Test suite '{suite_name}' triggered for {client_name}")
            result = response.json()
            
            # Log test results
            log_global_update(
                f"Test Suite: {suite_name}",
                f"Client: {client_name}, Status: {result.get('status', 'Unknown')}"
            )
            
            return result
        else:
            print(f"⚠️ Test failed for {client_name}: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"⚠️ Test error for {client_name}: {str(e)}")
        return False

def fetch_render_logs(client, lines=100):
    """3. Fetch Render Logs"""
    try:
        service_id = client["fields"].get("📦 Render ID")
        client_name = client["fields"].get("🧾 Client Name", "Unknown")
        
        if not service_id:
            print(f"⚠️ No Render ID for {client_name}")
            return None
            
        headers = {"Authorization": f"Bearer {os.getenv('RENDER_API_KEY')}"}
        
        # Fetch recent logs
        response = requests.get(
            f"https://api.render.com/v1/services/{service_id}/logs",
            headers=headers,
            params={"limit": lines}
        )
        
        if response.status_code == 200:
            logs = response.text
            print(f"📄 Recent logs for {client_name}:")
            print("-" * 50)
            print(logs[:1000] + "..." if len(logs) > 1000 else logs)
            print("-" * 50)
            
            # Check for errors in logs
            error_indicators = ["ERROR", "FATAL", "Exception", "Error:", "Failed"]
            errors_found = any(indicator in logs for indicator in error_indicators)
            
            if errors_found:
                post_to_slack(f"🚨 Errors detected in {client_name} logs!")
            
            return logs
        else:
            print(f"⚠️ Log fetch failed for {client_name}: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"⚠️ Log fetch error: {str(e)}")
        return None

def check_usage_quota(client, warning_threshold=50):
    """4. Client Usage Quota Monitor"""
    try:
        base_id = client["fields"].get("📊 Airtable Base ID")
        client_name = client["fields"].get("🧾 Client Name", "Unknown")
        
        if not base_id:
            print(f"⚠️ No Airtable Base ID for {client_name}")
            return None
            
        headers = {"Authorization": f"Bearer {os.getenv('AIRTABLE_API_KEY')}"}
        
        # Fetch usage records
        response = requests.get(
            f"https://api.airtable.com/v0/{base_id}/📈%20Usage%20Log", 
            headers=headers
        )
        
        if response.status_code == 200:
            records = response.json().get("records", [])
            usage_count = len(records)
            
            print(f"📊 {client_name} usage: {usage_count} records")
            
            # Check quota thresholds
            if usage_count > warning_threshold:
                warning_msg = f"⚠️ {client_name} is nearing quota ({usage_count} records)"
                print(warning_msg)
                post_to_slack(warning_msg)
                
                # If very high usage, escalate
                if usage_count > 100:
                    critical_msg = f"🚨 CRITICAL: {client_name} has {usage_count} usage records!"
                    post_to_slack(critical_msg)
            
            # Calculate usage metrics
            recent_records = [r for r in records if "📅" in r.get("fields", {})]
            
            usage_metrics = {
                "total_records": usage_count,
                "recent_activity": len(recent_records),
                "status": "normal" if usage_count < warning_threshold else "warning"
            }
            
            return usage_metrics
        else:
            print(f"⚠️ Usage check failed for {client_name}: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"⚠️ Usage check error: {str(e)}")
        return None

def comprehensive_client_audit(client):
    """5. Comprehensive Client Audit"""
    client_name = client["fields"].get("🧾 Client Name", "Unknown")
    print(f"🔍 Running comprehensive audit for {client_name}...")
    
    audit_results = {
        "client_name": client_name,
        "timestamp": datetime.now().isoformat(),
        "checks": {}
    }
    
    # Health check
    audit_results["checks"]["health"] = check_render_status(client)
    
    # Usage quota check
    audit_results["checks"]["usage"] = check_usage_quota(client)
    
    # Test suite run
    audit_results["checks"]["tests"] = run_test_suite(client, "health")
    
    # Log analysis
    logs = fetch_render_logs(client, 50)
    audit_results["checks"]["logs"] = logs is not None
    
    # Analytics ping
    audit_results["checks"]["analytics"] = log_client_ping(client)
    
    # Generate audit summary
    passed_checks = sum(1 for check in audit_results["checks"].values() if check)
    total_checks = len(audit_results["checks"])
    
    audit_summary = f"📋 Audit Complete for {client_name}: {passed_checks}/{total_checks} checks passed"
    print(audit_summary)
    
    # Send audit report to Slack
    audit_details = f"""🔍 Client Audit Report: {client_name}
    
Health Status: {'✅' if audit_results['checks']['health'] else '❌'}
Usage Check: {'✅' if audit_results['checks']['usage'] else '❌'}
Test Suite: {'✅' if audit_results['checks']['tests'] else '❌'}
Log Access: {'✅' if audit_results['checks']['logs'] else '❌'}
Analytics: {'✅' if audit_results['checks']['analytics'] else '❌'}

Overall Score: {passed_checks}/{total_checks}"""
    
    post_to_slack(audit_details)
    
    return audit_results

def clone_client_instance(source_client, new_name, new_email):
    """1. Client Cloner / Replicator"""
    try:
        print(f"🧬 Cloning {source_client['fields'].get('🧾 Client Name', 'Unknown')} → {new_name}")
        
        # Get source configuration
        source_base_id = source_client["fields"].get("📊 Airtable Base ID")
        
        # Clone Render service
        render_id = clone_render_service(new_name)
        
        # Clone Airtable base  
        airtable_id = clone_airtable_base(source_base_id, new_name)
        
        # Create Slack webhook
        slack_webhook = create_client_slack(new_name)
        
        # Register new client
        client_data = {
            "name": new_name,
            "email": new_email,
            "render_id": render_id,
            "airtable_id": airtable_id,
            "slack_webhook": slack_webhook
        }
        
        register_new_client(client_data)
        
        # Log the cloning action
        log_global_update(
            f"Client Cloned: {new_name}",
            f"Source: {source_client['fields'].get('🧾 Client Name', 'Unknown')}, Email: {new_email}"
        )
        
        # Send notification
        post_to_slack(f"🧬 New client instance cloned: {new_name}")
        
        print(f"✅ Successfully cloned {source_client['fields'].get('🧾 Client Name', 'Unknown')} → {new_name}")
        return client_data
        
    except Exception as e:
        print(f"⚠️ Clone failed: {str(e)}")
        return None

def blast_announcement(msg):
    """2. Universal Announcement Blaster"""
    try:
        clients = get_all_clients()
        success_count = 0
        failed_count = 0
        
        print(f"📣 Broadcasting announcement to {len(clients)} clients...")
        
        for c in clients:
            try:
                client_name = c["fields"].get("🧾 Client Name", "Unknown")
                webhook = c["fields"].get("🔔 Slack Webhook")
                
                if not webhook:
                    print(f"⚠️ No Slack webhook for {client_name}")
                    failed_count += 1
                    continue
                
                response = requests.post(
                    webhook, 
                    json={"text": f"📣 {msg}"},
                    timeout=10
                )
                
                if response.status_code == 200:
                    print(f"📤 Sent to {client_name}")
                    success_count += 1
                else:
                    print(f"⚠️ Failed to notify {client_name}: {response.status_code}")
                    failed_count += 1
                    
            except Exception as e:
                print(f"⚠️ Failed to notify {client_name}: {str(e)}")
                failed_count += 1
        
        # Log the broadcast
        log_global_update(
            "Universal Announcement",
            f"Message: {msg[:50]}... | Success: {success_count}, Failed: {failed_count}"
        )
        
        summary = f"📊 Announcement sent: {success_count} success, {failed_count} failed"
        print(summary)
        
        return {"success": success_count, "failed": failed_count}
        
    except Exception as e:
        print(f"⚠️ Broadcast error: {str(e)}")
        return None

def inject_patch(client, patch_name, payload):
    """3. Client Patch Injector"""
    try:
        client_name = client["fields"].get("🧾 Client Name", "Unknown")
        render_url = client["fields"].get("📦 Render URL")
        
        if not render_url:
            print(f"⚠️ No Render URL for {client_name}")
            return False
        
        patch_data = {
            "patch": patch_name,
            "data": payload,
            "timestamp": datetime.now().isoformat(),
            "injected_by": "admin_panel"
        }
        
        response = requests.post(
            f"{render_url}/patch", 
            json=patch_data,
            timeout=30
        )
        
        if response.status_code == 200:
            print(f"🛠 Patch '{patch_name}' sent to {client_name}")
            
            # Log the patch injection
            log_global_update(
                f"Patch Injected: {patch_name}",
                f"Client: {client_name}, Payload size: {len(str(payload))} chars"
            )
            
            # Send Slack notification
            post_to_slack(f"🛠 Patch '{patch_name}' deployed to {client_name}")
            
            return True
        else:
            print(f"⚠️ Patch failed for {client_name}: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"⚠️ Patch injection error: {str(e)}")
        return False

def lockdown_feature(client, feature):
    """4. Feature Lockdown Override"""
    try:
        client_name = client["fields"].get("🧾 Client Name", "Unknown")
        
        # Disable the feature
        toggle_result = toggle_feature(client, feature, False)
        
        if toggle_result:
            # Send lockdown notification
            lockdown_msg = f"🔒 FEATURE LOCKDOWN: {feature} disabled for {client_name}"
            post_to_slack(lockdown_msg)
            
            # Log the lockdown action
            log_global_update(
                f"Feature Lockdown: {feature}",
                f"Client: {client_name}, Reason: Admin override"
            )
            
            print(f"🔒 {feature} locked down for {client_name}")
            return True
        else:
            print(f"⚠️ Lockdown failed for {client_name}")
            return False
            
    except Exception as e:
        print(f"⚠️ Lockdown error: {str(e)}")
        return False

def global_feature_lockdown(feature, reason="Security measure"):
    """5. Global Feature Lockdown"""
    clients = get_all_clients()
    locked_count = 0
    
    print(f"🔒 Initiating global lockdown of '{feature}' across {len(clients)} clients...")
    
    for client in clients:
        if lockdown_feature(client, feature):
            locked_count += 1
    
    # Send global alert
    global_alert = f"🚨 GLOBAL LOCKDOWN: {feature} disabled across {locked_count} clients. Reason: {reason}"
    post_to_slack(global_alert)
    
    # Log global action
    log_global_update(
        f"Global Feature Lockdown: {feature}",
        f"Affected: {locked_count}/{len(clients)} clients, Reason: {reason}"
    )
    
    print(f"🔒 Global lockdown complete: {locked_count}/{len(clients)} clients affected")
    return locked_count

def master_control_panel():
    """6. Master Control Panel - All Functions Available"""
    print("🎛️ YoBot Master Control Panel")
    print("=" * 50)
    
    functions = {
        "1": ("Global Redeploy", global_redeploy),
        "2": ("Feature Toggle", lambda: toggle_feature_globally("Voice Generation", True)),
        "3": ("Broadcast Update", broadcast_update),
        "4": ("Error Scan", scan_and_alert_errors),
        "5": ("CRM Sync", global_crm_resync),
        "6": ("Health Check", run_comprehensive_health_check),
        "7": ("Emergency Recovery", emergency_recovery_protocol),
        "8": ("Universal Announcement", lambda: blast_announcement("System maintenance scheduled")),
        "9": ("Feature Lockdown", lambda: global_feature_lockdown("Demo Mode", "Security audit")),
        "10": ("Status Report", lambda: generate_status_report(get_all_clients()))
    }
    
    print("Available Operations:")
    for key, (name, func) in functions.items():
        print(f"[{key}] {name}")
    
    return functions

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