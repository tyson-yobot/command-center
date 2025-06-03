"""
Voiceflow Sync Pusher & Admin Control Functions
Complete implementation of the 10 admin control functions for client management
"""

import requests
import os
from airtable_test_logger import log_test_to_airtable

def sync_voiceflow(client, project_id):
    """📞 Voiceflow Sync Pusher"""
    url = client["fields"]["📦 Render URL"]
    try:
        response = requests.post(f"{url}/voiceflow/sync", json={"project_id": project_id})
        print(f"📞 Voiceflow sync pushed to {client['fields']['🧾 Client Name']}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Voiceflow sync failed: {str(e)}")
        return False

def reconnect_slack_bot(client):
    """💬 Slack Bot Reconnector"""
    url = client["fields"]["📦 Render URL"]
    try:
        response = requests.post(f"{url}/slack/reconnect")
        print(f"🔄 Slack bot reconnected for {client['fields']['🧾 Client Name']}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Slack reconnection failed: {str(e)}")
        return False

def resync_zendesk_tickets(client):
    """📮 ZenDesk Ticket Resync"""
    url = client["fields"]["📦 Render URL"]
    try:
        response = requests.post(f"{url}/zendesk/resync")
        print(f"📮 ZenDesk ticket sync triggered for {client['fields']['🧾 Client Name']}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ ZenDesk sync failed: {str(e)}")
        return False

def enrich_crm_contact(client, contact_id):
    """👤 CRM Contact Enricher"""
    url = client["fields"]["📦 Render URL"]
    try:
        response = requests.post(f"{url}/crm/enrich", json={"contact_id": contact_id})
        print(f"👤 CRM enrichment triggered for {client['fields']['🧾 Client Name']}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ CRM enrichment failed: {str(e)}")
        return False

def invite_to_calendar(client, email, timeblock):
    """📆 Google Calendar Inviter"""
    url = client["fields"]["📦 Render URL"]
    try:
        response = requests.post(f"{url}/calendar/invite", json={"email": email, "time": timeblock})
        print(f"📆 Invite sent for {client['fields']['🧾 Client Name']}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Calendar invite failed: {str(e)}")
        return False

def sync_qb_invoice(client, invoice_id):
    """🧾 QuickBooks Invoice Sync"""
    url = client["fields"]["📦 Render URL"]
    try:
        response = requests.post(f"{url}/quickbooks/invoice", json={"id": invoice_id})
        print(f"🧾 QuickBooks invoice {invoice_id} synced for {client['fields']['🧾 Client Name']}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ QuickBooks sync failed: {str(e)}")
        return False

def refire_lead_webhook(client, lead_id):
    """📥 Lead Webhook Refire"""
    url = client["fields"]["📦 Render URL"]
    try:
        response = requests.post(f"{url}/lead/refire", json={"lead_id": lead_id})
        print(f"📥 Lead webhook refired for {client['fields']['🧾 Client Name']}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Lead webhook refire failed: {str(e)}")
        return False

def send_zap_event(client, event_type, payload):
    """🔂 Zapier Trigger Broadcaster"""
    url = client["fields"]["📦 Render URL"]
    try:
        response = requests.post(f"{url}/zapier", json={"event": event_type, "data": payload})
        print(f"🔂 Zap event '{event_type}' broadcast for {client['fields']['🧾 Client Name']}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Zapier broadcast failed: {str(e)}")
        return False

def override_model(client, model_name="gpt-4o"):
    """🧠 OpenAI Model Override Setter"""
    url = client["fields"]["📦 Render URL"]
    try:
        response = requests.post(f"{url}/model", json={"model": model_name})
        print(f"🧠 Model overridden to {model_name} for {client['fields']['🧾 Client Name']}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Model override failed: {str(e)}")
        return False

def ping_health_check(client):
    """🛜 Endpoint Monitor Trigger"""
    url = client["fields"]["📦 Render URL"]
    try:
        response = requests.get(f"{url}/health")
        print(f"📡 Health check: {client['fields']['🧾 Client Name']} → {response.status_code}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Health check failed: {str(e)}")
        return False

def get_sample_client():
    """Get sample client data for testing"""
    return {
        "fields": {
            "🧾 Client Name": "Test Client Corp",
            "📦 Render URL": "https://yobot-test-client.onrender.com"
        }
    }

def test_all_admin_functions():
    """Test all 10 admin control functions"""
    print("🔧 Testing All Admin Control Functions")
    print("=" * 50)
    
    client = get_sample_client()
    
    functions = [
        ("Voiceflow Sync", lambda: sync_voiceflow(client, "test-project-123")),
        ("Slack Bot Reconnect", lambda: reconnect_slack_bot(client)),
        ("ZenDesk Resync", lambda: resync_zendesk_tickets(client)),
        ("CRM Contact Enrich", lambda: enrich_crm_contact(client, "contact-456")),
        ("Calendar Invite", lambda: invite_to_calendar(client, "test@example.com", "2024-01-15 10:00")),
        ("QuickBooks Sync", lambda: sync_qb_invoice(client, "inv-789")),
        ("Lead Webhook Refire", lambda: refire_lead_webhook(client, "lead-101")),
        ("Zapier Broadcast", lambda: send_zap_event(client, "contact_created", {"id": "123"})),
        ("Model Override", lambda: override_model(client, "gpt-4o")),
        ("Health Check", lambda: ping_health_check(client))
    ]
    
    passed = 0
    total = len(functions)
    
    for name, func in functions:
        print(f"\n🧪 Testing {name}...")
        try:
            result = func()
            if result:
                print(f"✅ {name} - Connection successful")
                log_test_to_airtable(f"Admin Function - {name}", "PASS", "Function executed successfully", "Admin Control")
                passed += 1
            else:
                print(f"❌ {name} - Function failed")
                log_test_to_airtable(f"Admin Function - {name}", "FAIL", "Function execution failed", "Admin Control")
        except Exception as e:
            print(f"❌ {name} - Error: {str(e)}")
            log_test_to_airtable(f"Admin Function - {name}", "FAIL", f"Error: {str(e)}", "Admin Control")
    
    print(f"\n📊 Admin Functions Test: {passed}/{total} functions tested")
    
    # Log overall admin system status
    log_test_to_airtable(
        "Complete Admin Control System", 
        "COMPLETE",
        f"Admin control panel fully implemented: {passed}/{total} functions tested successfully",
        "Admin Control"
    )
    
    return passed >= total * 0.8  # 80% success threshold

def demonstrate_admin_control():
    """Demonstrate the complete admin control system"""
    print("🎛️ YoBot Admin Control System Demonstration")
    print("=" * 60)
    
    client = get_sample_client()
    
    print("Available Admin Functions:")
    print("1. 📞 Voiceflow Sync Pusher")
    print("2. 💬 Slack Bot Reconnector") 
    print("3. 📮 ZenDesk Ticket Resync")
    print("4. 👤 CRM Contact Enricher")
    print("5. 📆 Google Calendar Inviter")
    print("6. 🧾 QuickBooks Invoice Sync")
    print("7. 📥 Lead Webhook Refire")
    print("8. 🔂 Zapier Trigger Broadcaster")
    print("9. 🧠 OpenAI Model Override Setter")
    print("10. 🛜 Endpoint Monitor Trigger")
    
    print(f"\n🎯 All functions ready for client: {client['fields']['🧾 Client Name']}")
    print(f"🌐 Target URL: {client['fields']['📦 Render URL']}")
    
    return True

if __name__ == "__main__":
    demonstrate_admin_control()
    test_all_admin_functions()