#!/usr/bin/env python3
"""
Token Validator - Test Personal Access Token
"""

import requests
import os

def validate_token():
    """Test if the Personal Access Token is valid"""
    
    token = os.getenv("AIRTABLE_PERSONAL_ACCESS_TOKEN")
    
    if not token:
        print("Token not found in environment")
        return False
    
    print(f"Token found: {token[:20]}...")
    
    # Test with base metadata endpoint
    base_id = "appCoAtCZdARb4AM2"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Test 1: Get base metadata
    try:
        url = f"https://api.airtable.com/v0/meta/bases/{base_id}/tables"
        response = requests.get(url, headers=headers, timeout=30)
        
        print(f"Metadata test: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Found {len(data.get('tables', []))} tables in base")
            
            # Look for our target table
            for table in data.get('tables', []):
                if table.get('id') == 'tblRNjNnaGL5ICIf9':
                    print(f"Target table found: {table.get('name')}")
                    print("Fields:")
                    for field in table.get('fields', []):
                        print(f"  - {field.get('name')}")
                    return True
            
            print("Target table not found")
            return False
        else:
            print(f"Metadata failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_simple_record():
    """Try creating a simple record with basic field names"""
    
    token = os.getenv("AIRTABLE_PERSONAL_ACCESS_TOKEN")
    base_id = "appCoAtCZdARb4AM2"
    table_id = "tblRNjNnaGL5ICIf9"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Try with simplest possible data
    test_data = {
        "fields": {
            "Name": "Test Record"
        }
    }
    
    try:
        response = requests.post(
            f"https://api.airtable.com/v0/{base_id}/{table_id}",
            headers=headers,
            json=test_data,
            timeout=30
        )
        
        print(f"Simple record test: {response.status_code}")
        print(f"Response: {response.text}")
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"Simple record error: {e}")
        return False

def main():
    print("Token Validation Test")
    print("=" * 30)
    
    if validate_token():
        print("\nToken valid - testing record creation...")
        test_simple_record()
    else:
        print("\nToken validation failed")

if __name__ == "__main__":
    main()