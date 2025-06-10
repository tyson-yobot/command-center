#!/usr/bin/env python3
"""
Discover Airtable Schema
Get the actual field names from your Airtable base
"""

import requests
import json

# Your actual Airtable credentials
AIRTABLE_BASE_ID = "appCoAtCZdARb4AM2"
AIRTABLE_TABLE_ID = "tblRNjNnaGL5ICIf9"
AIRTABLE_API_KEY = "paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa"
AIRTABLE_URL = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{AIRTABLE_TABLE_ID}"

HEADERS = {
    "Authorization": f"Bearer {AIRTABLE_API_KEY}",
    "Content-Type": "application/json"
}

def discover_table_schema():
    """Discover the actual field names in the Airtable table"""
    try:
        # Get existing records to see field structure
        response = requests.get(f"{AIRTABLE_URL}?maxRecords=1", headers=HEADERS)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Successfully connected to Airtable")
            print(f"Base ID: {AIRTABLE_BASE_ID}")
            print(f"Table ID: {AIRTABLE_TABLE_ID}")
            
            if data.get('records'):
                print("\n📋 Discovered field structure:")
                fields = data['records'][0].get('fields', {})
                for field_name in fields.keys():
                    print(f"  - {field_name}")
                    
                return list(fields.keys())
            else:
                print("\n📋 No records found, but connection successful")
                print("Will attempt to create a test record to discover fields")
                return []
        else:
            print(f"❌ Failed to connect: {response.status_code}")
            print(f"Error: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return None

def test_minimal_record():
    """Test creating a minimal record to discover required fields"""
    test_data = {
        "fields": {
            "Name": "YoBot System Test",
            "Status": "Testing"
        }
    }
    
    try:
        response = requests.post(AIRTABLE_URL, headers=HEADERS, json=test_data)
        
        if response.status_code == 200:
            print("✅ Minimal record created successfully")
            record = response.json()
            print("📋 Record structure:")
            print(json.dumps(record, indent=2))
            return True
        else:
            print(f"❌ Failed to create record: {response.status_code}")
            print(f"Error: {response.text}")
            
            # Try with even simpler structure
            simple_data = {"fields": {"Name": "Test"}}
            simple_response = requests.post(AIRTABLE_URL, headers=HEADERS, json=simple_data)
            
            if simple_response.status_code == 200:
                print("✅ Simple record created")
                return True
            else:
                print(f"❌ Simple record also failed: {simple_response.status_code}")
                print(f"Error: {simple_response.text}")
                return False
                
    except Exception as e:
        print(f"❌ Error creating test record: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Discovering Airtable Schema...")
    print("=" * 50)
    
    # First try to discover existing schema
    fields = discover_table_schema()
    
    if fields is None:
        print("\n🧪 Testing minimal record creation...")
        test_minimal_record()
    elif len(fields) == 0:
        print("\n🧪 No existing records, testing record creation...")
        test_minimal_record()
    else:
        print(f"\n✅ Found {len(fields)} fields in your table")
        print("Ready to proceed with automation logging")