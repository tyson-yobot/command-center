#!/usr/bin/env python3
"""
Airtable Field Structure Diagnostic Tool
Identifies exact field requirements for the working table tbldPRZ4nHbtj9opU
"""

import requests
import json
import os

def test_field_combinations():
    """Test different field combinations to find the working structure"""
    
    api_key = os.getenv('AIRTABLE_API_KEY')
    if not api_key:
        print("❌ AIRTABLE_API_KEY not found")
        return
    
    base_url = "https://api.airtable.com/v0/appRt8V3tH4g5Z5if/tbldPRZ4nHbtj9opU/"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Test different field name variations
    field_tests = [
        {
            "name": "Original Working Fields",
            "fields": {
                "👤 Full Name": "Test User",
                "📧 Email": "test@example.com", 
                "📞 Phone": "555-0123",
                "📥 Lead Source": "API Test"
            }
        },
        {
            "name": "Without Emojis",
            "fields": {
                "Full Name": "Test User",
                "Email": "test@example.com",
                "Phone": "555-0123", 
                "Lead Source": "API Test"
            }
        },
        {
            "name": "Minimal Required Fields",
            "fields": {
                "👤 Full Name": "Test User",
                "📧 Email": "test@example.com"
            }
        },
        {
            "name": "Single Field Test",
            "fields": {
                "👤 Full Name": "Test User"
            }
        }
    ]
    
    for test in field_tests:
        print(f"\n🧪 Testing: {test['name']}")
        print(f"   Fields: {json.dumps(test['fields'], indent=2)}")
        
        try:
            response = requests.post(
                base_url,
                headers=headers,
                json={"fields": test["fields"]},
                timeout=10
            )
            
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                print("   ✅ SUCCESS - This field structure works!")
                print(f"   Response: {json.dumps(response.json(), indent=2)}")
                return test["fields"]  # Return working structure
            else:
                error_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
                print(f"   ❌ FAILED: {error_data}")
                
        except Exception as e:
            print(f"   ❌ ERROR: {str(e)}")
    
    return None

def get_table_schema():
    """Get the actual table schema from Airtable API"""
    
    api_key = os.getenv('AIRTABLE_API_KEY')
    if not api_key:
        print("❌ AIRTABLE_API_KEY not found")
        return
    
    # Try to get table schema by listing records
    base_url = "https://api.airtable.com/v0/appRt8V3tH4g5Z5if/tbldPRZ4nHbtj9opU"
    headers = {
        "Authorization": f"Bearer {api_key}"
    }
    
    print("\n📋 Getting table schema...")
    
    try:
        response = requests.get(f"{base_url}?maxRecords=1", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('records'):
                record = data['records'][0]
                fields = record.get('fields', {})
                print("   ✅ Found existing record with fields:")
                for field_name in fields.keys():
                    print(f"     - {field_name}")
                return list(fields.keys())
            else:
                print("   ℹ️  No existing records found")
        else:
            print(f"   ❌ Error getting schema: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ ERROR: {str(e)}")
    
    return None

if __name__ == "__main__":
    print("🔍 Airtable Field Structure Diagnostic")
    print("=" * 50)
    
    # First, try to get existing schema
    existing_fields = get_table_schema()
    
    # Then test field combinations
    working_structure = test_field_combinations()
    
    if working_structure:
        print("\n✅ WORKING FIELD STRUCTURE FOUND:")
        print(json.dumps(working_structure, indent=2))
        
        # Save to file
        with open('working_airtable_fields.json', 'w') as f:
            json.dump(working_structure, f, indent=2)
        print("\n💾 Saved working structure to working_airtable_fields.json")
    else:
        print("\n❌ No working field structure found")
        print("   Check Airtable table permissions and field names")