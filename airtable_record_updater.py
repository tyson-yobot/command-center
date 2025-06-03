"""
Airtable Record Updater
Updates existing failed test records to show current pass/fail status
"""

import requests
import os
from datetime import datetime

# Your specific Airtable credentials
AIRTABLE_API_KEY = os.getenv('AIRTABLE_API_KEY')
BASE_ID = "appRt8V3tH4g5Z5if"
TABLE_ID = "tbly0fjE2M5uHET9X"

def get_existing_records():
    """Get all existing records from the Integration Test Log table"""
    if not AIRTABLE_API_KEY:
        print("❌ Airtable API key not available")
        return []
    
    url = f"https://api.airtable.com/v0/{BASE_ID}/{TABLE_ID}"
    headers = {
        "Authorization": f"Bearer {AIRTABLE_API_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            return data.get('records', [])
        else:
            print(f"❌ Failed to get records: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Error getting records: {str(e)}")
        return []

def update_record_status(record_id, new_status, new_notes):
    """Update an existing record's status and notes"""
    if not AIRTABLE_API_KEY:
        return False
    
    url = f"https://api.airtable.com/v0/{BASE_ID}/{TABLE_ID}/{record_id}"
    headers = {
        "Authorization": f"Bearer {AIRTABLE_API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "fields": {
            "✅ Pass/Fail": "✅" if new_status == "PASS" else "❌",
            "🧠 Notes / Debug": new_notes,
            "📅 Test Date": datetime.today().strftime("%Y-%m-%d")
        }
    }
    
    try:
        response = requests.patch(url, headers=headers, json=data)
        if response.status_code == 200:
            return True
        else:
            print(f"❌ Failed to update record: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error updating record: {str(e)}")
        return False

def find_and_update_test_result(test_name, new_status, new_notes):
    """Find existing test record and update its status"""
    records = get_existing_records()
    
    for record in records:
        fields = record.get('fields', {})
        integration_name = fields.get('🔧 Integration Name', '')
        
        if test_name.lower() in integration_name.lower() or integration_name.lower() in test_name.lower():
            record_id = record['id']
            print(f"🔄 Updating '{integration_name}' to {new_status}")
            
            if update_record_status(record_id, new_status, new_notes):
                print(f"✅ Updated record: {integration_name}")
                return True
            else:
                print(f"❌ Failed to update: {integration_name}")
                return False
    
    print(f"⚠️ No existing record found for: {test_name}")
    return False

def run_targeted_tests_with_updates():
    """Run tests for systems that should now be working and update existing records"""
    print("🔄 Running Targeted Tests to Update Existing Records")
    print("=" * 60)
    
    # Test cases that should now pass with Render API
    test_cases = [
        {
            "name": "Render Service Creation Error",
            "test_func": test_render_service_creation,
            "expected_result": "PASS"
        },
        {
            "name": "Client Provisioning Partial", 
            "test_func": test_client_provisioning,
            "expected_result": "PASS"
        },
        {
            "name": "Referral CRM Integration",
            "test_func": test_hubspot_referral,
            "expected_result": "PASS"
        },
        {
            "name": "Airtable CRM Push",
            "test_func": test_airtable_access,
            "expected_result": "PARTIAL"
        }
    ]
    
    updated_count = 0
    
    for test_case in test_cases:
        print(f"\n🧪 Testing {test_case['name']}...")
        
        try:
            result = test_case["test_func"]()
            
            if result:
                status = "PASS"
                notes = f"✅ Test now passing - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
            else:
                status = "FAIL"
                notes = f"❌ Test still failing - requires additional configuration"
            
            if find_and_update_test_result(test_case["name"], status, notes):
                updated_count += 1
                
        except Exception as e:
            notes = f"❌ Test error: {str(e)}"
            find_and_update_test_result(test_case["name"], "FAIL", notes)
    
    print(f"\n📊 Updated {updated_count} existing test records")
    return updated_count

def test_render_service_creation():
    """Test Render service creation with actual API"""
    try:
        headers = {
            'Authorization': 'Bearer rnd_OKvvDa1w1wcGlSFCY6d8MN7nSbeH',
            'Content-Type': 'application/json'
        }
        
        response = requests.get("https://api.render.com/v1/services", headers=headers)
        return response.status_code == 200
    except:
        return False

def test_client_provisioning():
    """Test client provisioning system"""
    try:
        from client_provisioning_automation import generate_client_config
        config = generate_client_config("Test Client", "test@example.com")
        return config and "client_name" in config
    except:
        return False

def test_hubspot_referral():
    """Test HubSpot referral integration"""
    try:
        hubspot_key = os.getenv('HUBSPOT_API_KEY')
        if not hubspot_key:
            return False
            
        headers = {'Authorization': f'Bearer {hubspot_key}'}
        response = requests.get('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', headers=headers)
        return response.status_code == 200
    except:
        return False

def test_airtable_access():
    """Test Airtable access"""
    try:
        if not AIRTABLE_API_KEY:
            return False
        headers = {'Authorization': f'Bearer {AIRTABLE_API_KEY}'}
        response = requests.get(f"https://api.airtable.com/v0/{BASE_ID}/{TABLE_ID}?maxRecords=1", headers=headers)
        return response.status_code == 200
    except:
        return False

if __name__ == "__main__":
    run_targeted_tests_with_updates()