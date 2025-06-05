#!/usr/bin/env python3
"""
Test connection to the correct logging table
"""
import os
import requests
import json

def test_logging_table():
    """Test the correct Airtable logging table"""
    
    api_key = os.getenv('AIRTABLE_PERSONAL_ACCESS_TOKEN')
    base_id = 'appCoAtCZdARb4AM2'
    table_id = 'tblRNjNnaGL5ICIf9'
    
    print(f"Testing base: {base_id}")
    print(f"Testing table: {table_id}")
    
    # Test GET first
    url = f"https://api.airtable.com/v0/{base_id}/{table_id}?maxRecords=1"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers)
        print(f"GET Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Connection successful!")
            
            if 'records' in data and len(data['records']) > 0:
                print("\nField structure:")
                fields = data['records'][0]['fields']
                for field_name in fields.keys():
                    print(f"  - '{field_name}'")
            else:
                print("No existing records found")
                
        else:
            print(f"❌ GET failed: {response.text}")
    
    except Exception as e:
        print(f"❌ Error: {e}")

    # Test POST with simple data
    print("\nTesting POST...")
    payload = {
        "records": [{
            "fields": {
                "Name": "Test Lead",
                "Email": "test@example.com", 
                "Phone": "555-000-1111",
                "Company": "Test Company",
                "Source": "API Test"
            }
        }]
    }
    
    try:
        response = requests.post(url.split('?')[0], headers=headers, json=payload)
        print(f"POST Status: {response.status_code}")
        
        if response.status_code in [200, 201]:
            print("✅ POST successful!")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ POST failed: {response.text}")
            
    except Exception as e:
        print(f"❌ POST Error: {e}")

if __name__ == "__main__":
    test_logging_table()