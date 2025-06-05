#!/usr/bin/env python3
"""
Debug Airtable Integration - Check field structure and test authentication
"""
import os
import requests
import json

def test_airtable_connection():
    """Test Airtable connection and examine field structure"""
    
    # Get API credentials
    api_key = os.getenv('AIRTABLE_PERSONAL_ACCESS_TOKEN') or os.getenv('AIRTABLE_API_KEY')
    base_id = 'appRt8V3tH4g5Z5if'
    table_id = 'tbldPRZ4nHbtj9opU'
    
    if not api_key:
        print("❌ No Airtable API key found")
        return
    
    print(f"🔑 Using API key: {api_key[:10]}...")
    
    # Test connection with GET request
    url = f"https://api.airtable.com/v0/{base_id}/{table_id}?maxRecords=1"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers)
        print(f"📡 GET Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Connection successful!")
            
            if 'records' in data and len(data['records']) > 0:
                print("\n📋 Existing field structure:")
                fields = data['records'][0]['fields']
                for field_name, field_value in fields.items():
                    print(f"  - '{field_name}': {type(field_value).__name__}")
            else:
                print("📝 No existing records found")
                
        else:
            print(f"❌ Connection failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def test_airtable_post():
    """Test POST request with current field mapping"""
    
    api_key = os.getenv('AIRTABLE_PERSONAL_ACCESS_TOKEN') or os.getenv('AIRTABLE_API_KEY')
    base_id = 'appRt8V3tH4g5Z5if'
    table_id = 'tbldPRZ4nHbtj9opU'
    
    url = f"https://api.airtable.com/v0/{base_id}/{table_id}"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Test payload with current field mapping
    payload = {
        "records": [{
            "fields": {
                "🧑 Full Name": "Debug Test Lead",
                "📧 Email": "debug@airtable.com",
                "📞 Phone": "555-999-0000",
                "🏢 Company": "Debug Company",
                "🔗 LinkedIn URL": "https://linkedin.com/in/debug",
                "📥 Lead Source": "Debug Test"
            }
        }]
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        print(f"📤 POST Response Status: {response.status_code}")
        
        if response.status_code in [200, 201]:
            print("✅ POST successful!")
            print(f"📋 Response: {response.json()}")
        else:
            print(f"❌ POST failed: {response.text}")
            error_data = response.json() if response.text else {}
            if 'error' in error_data:
                print(f"🔍 Error details: {error_data['error']}")
                
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    print("🔧 Debugging Airtable Integration")
    print("=" * 50)
    test_airtable_connection()
    print("\n" + "=" * 50)
    test_airtable_post()