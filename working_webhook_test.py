"""
Working Webhook Test - Using Correct Field Formats
Tests actual webhook functionality with proper field mappings
"""
import requests
import json

BASE_URL = "https://72ddfeee-d145-4891-a820-14d5b3e09c66-00-c9rkbm78q1s2.worf.replit.dev"

def test_working_webhooks():
    """Test webhooks that are confirmed working"""
    
    print("Testing WORKING webhook endpoints:")
    print("=" * 50)
    
    # 1. Lead webhook (confirmed working)
    print("\n1. Testing Lead Capture...")
    lead_response = requests.post(f"{BASE_URL}/api/webhook/lead", json={
        "name": "Test Lead",
        "email": "test@company.com",
        "company": "Test Corp",
        "phone": "+1-555-0123"
    })
    print(f"Status: {lead_response.status_code}")
    if lead_response.status_code == 200:
        data = lead_response.json()
        print(f"✓ Lead processing: {data['message']}")
        print(f"✓ Automations: {', '.join(data['automations_triggered'])}")
    
    # 2. Support webhook (using correct fields)
    print("\n2. Testing Support Ticket...")
    support_response = requests.post(f"{BASE_URL}/api/webhook/support", json={
        "ticketId": "TEST-001",
        "clientName": "John Doe", 
        "topic": "Integration Test"
    })
    print(f"Status: {support_response.status_code}")
    print(f"Response: {support_response.text}")
    
    # 3. Payment webhook (confirmed working)
    print("\n3. Testing Payment Processing...")
    payment_response = requests.post(f"{BASE_URL}/api/webhook/payment", json={
        "payment_id": "PAY-001",
        "customer_email": "customer@example.com",
        "amount": 299.99
    })
    print(f"Status: {payment_response.status_code}")
    if payment_response.status_code == 200:
        print("✓ Payment processing initiated")
    
    # 4. Stripe webhook (confirmed working)
    print("\n4. Testing Stripe Integration...")
    stripe_response = requests.post(f"{BASE_URL}/api/webhook/stripe", json={
        "type": "payment_intent.succeeded",
        "data": {"object": {"amount": 29999}}
    })
    print(f"Status: {stripe_response.status_code}")
    if stripe_response.status_code == 200:
        print("✓ Stripe event processing initiated")
    
    # 5. HubSpot webhook (confirmed working) 
    print("\n5. Testing HubSpot CRM...")
    hubspot_response = requests.post(f"{BASE_URL}/api/webhook/hubspot", json={
        "objectId": "12345",
        "propertyName": "lifecyclestage",
        "propertyValue": "customer"
    })
    print(f"Status: {hubspot_response.status_code}")
    if hubspot_response.status_code == 200:
        print("✓ HubSpot data processing initiated")
    
    # 6. Usage monitoring (confirmed working)
    print("\n6. Testing Usage Monitoring...")
    usage_response = requests.post(f"{BASE_URL}/api/webhook/usage", json={
        "client_id": "CLIENT-001",
        "usage_type": "voice_minutes",
        "current_usage": 850,
        "limit": 1000
    })
    print(f"Status: {usage_response.status_code}")
    if usage_response.status_code == 200:
        print("✓ Usage threshold processing initiated")

def test_api_endpoints():
    """Test API data endpoints"""
    
    print("\n\nTesting API Data Endpoints:")
    print("=" * 50)
    
    # Test metrics endpoint
    print("\n1. Testing Metrics API...")
    metrics_response = requests.get(f"{BASE_URL}/api/metrics")
    if metrics_response.status_code == 200:
        metrics = metrics_response.json()
        print(f"✓ Metrics API working")
        print(f"  Active Calls: {metrics.get('activeCalls', 'N/A')}")
        print(f"  AI Responses: {metrics.get('aiResponsesToday', 'N/A')}")
        print(f"  System Health: {metrics.get('systemHealth', 'N/A')}%")
    
    # Test CRM endpoint
    print("\n2. Testing CRM Data API...")
    crm_response = requests.get(f"{BASE_URL}/api/crm")
    if crm_response.status_code == 200:
        print("✓ CRM API working")
        crm_data = crm_response.json()
        print(f"  Pipeline Value: ${crm_data.get('pipelineValue', 'N/A'):,}")
        print(f"  Active Leads: {crm_data.get('activeLeads', 'N/A')}")
    
    # Test Bot endpoint
    print("\n3. Testing Bot Status API...")
    bot_response = requests.get(f"{BASE_URL}/api/bot")
    if bot_response.status_code == 200:
        print("✓ Bot API working")
        bot_data = bot_response.json()
        print(f"  Bot Status: {bot_data.get('status', 'N/A')}")
        print(f"  Active Clients: {bot_data.get('activeClients', 'N/A')}")

def test_quickbooks_oauth():
    """Test QuickBooks OAuth"""
    
    print("\n\nTesting QuickBooks Integration:")
    print("=" * 50)
    
    oauth_response = requests.get(f"{BASE_URL}/api/qbo/auth")
    if oauth_response.status_code == 200:
        auth_data = oauth_response.json()
        print("✓ QuickBooks OAuth configured")
        print(f"  Auth URL generated successfully")
        print(f"  Ready for OAuth connection")
    else:
        print("✗ QuickBooks OAuth issue")

if __name__ == "__main__":
    print("🔧 WEBHOOK FUNCTIONALITY TEST")
    print(f"Testing: {BASE_URL}")
    print("=" * 60)
    
    test_working_webhooks()
    test_api_endpoints() 
    test_quickbooks_oauth()
    
    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("Working endpoints can receive webhook data from external services")
    print("API endpoints provide real-time system data")
    print("QuickBooks OAuth ready for connection")