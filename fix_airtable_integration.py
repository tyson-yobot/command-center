#!/usr/bin/env python3
"""
Fix Airtable Integration with correct token and test logging table
"""
import requests
import json

def test_logging_table_connection():
    """Test connection to the correct logging table"""
    
    token = "paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa"
    base_id = "appCoAtCZdARb4AM2"
    table_id = "tblRNjNnaGL5ICIf9"
    
    print(f"Testing logging table: {base_id}/{table_id}")
    
    # Test GET to see existing structure
    url = f"https://api.airtable.com/v0/{base_id}/{table_id}?maxRecords=1"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers)
        print(f"GET Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("Connection successful!")
            
            if 'records' in data and len(data['records']) > 0:
                print("\nExisting field structure:")
                fields = data['records'][0]['fields']
                for field_name in fields.keys():
                    print(f"  - '{field_name}'")
                return list(fields.keys())
            else:
                print("No existing records found")
                return []
                
        else:
            print(f"GET failed: {response.text}")
            return []
    
    except Exception as e:
        print(f"Error: {e}")
        return []

def test_lead_logging():
    """Test posting a lead to the logging table"""
    
    token = "paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa"
    base_id = "appCoAtCZdARb4AM2"
    table_id = "tblRNjNnaGL5ICIf9"
    
    url = f"https://api.airtable.com/v0/{base_id}/{table_id}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Test with basic lead data
    payload = {
        "records": [{
            "fields": {
                "Name": "Integration Test Lead",
                "Email": "integration@test.com",
                "Phone": "555-999-8888",
                "Company": "Integration Test Co",
                "Source": "API Integration Fix"
            }
        }]
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        print(f"POST Status: {response.status_code}")
        
        if response.status_code in [200, 201]:
            result = response.json()
            record_id = result['records'][0]['id']
            print(f"Lead logged successfully! Record ID: {record_id}")
            return True
        else:
            print(f"POST failed: {response.text}")
            
            # Try with different field names if standard ones fail
            alt_payload = {
                "records": [{
                    "fields": {
                        "Full Name": "Integration Test Lead Alt",
                        "Email Address": "integration.alt@test.com",
                        "Phone Number": "555-999-7777",
                        "Company Name": "Integration Test Alt Co",
                        "Lead Source": "API Integration Fix Alt"
                    }
                }]
            }
            
            print("Trying alternative field names...")
            alt_response = requests.post(url, headers=headers, json=alt_payload)
            print(f"Alt POST Status: {alt_response.status_code}")
            
            if alt_response.status_code in [200, 201]:
                result = alt_response.json()
                record_id = result['records'][0]['id']
                print(f"Alt lead logged successfully! Record ID: {record_id}")
                return True
            else:
                print(f"Alt POST also failed: {alt_response.text}")
                return False
                
    except Exception as e:
        print(f"POST Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing Airtable logging table integration...")
    print("=" * 50)
    
    # Test connection and get field structure
    fields = test_logging_table_connection()
    
    print("\n" + "=" * 50)
    print("Testing lead logging...")
    
    # Test posting a lead
    success = test_lead_logging()
    
    if success:
        print("\nAirtable integration is working!")
    else:
        print("\nNeed to identify correct field names")