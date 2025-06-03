#!/usr/bin/env python3
"""
Airtable Authentication Test
Tests all available Airtable credentials and connections
"""

import os
import requests
from pyairtable import Api

def test_airtable_credentials():
    """Test all available Airtable credentials"""
    print("Airtable Authentication Test")
    print("=" * 50)
    
    # Get all available tokens
    tokens = {
        "AIRTABLE_API_KEY": os.getenv("AIRTABLE_API_KEY"),
        "AIRTABLE_PERSONAL_ACCESS_TOKEN": os.getenv("AIRTABLE_PERSONAL_ACCESS_TOKEN"),
        "AIRTABLE_COMMAND_CENTER_TOKEN": os.getenv("AIRTABLE_COMMAND_CENTER_TOKEN"),
        "AIRTABLE_COMMAND_CENTER_BASE_TOKEN": os.getenv("AIRTABLE_COMMAND_CENTER_BASE_TOKEN"),
        "AIRTABLE_VALID_TOKEN": os.getenv("AIRTABLE_VALID_TOKEN")
    }
    
    # Get base IDs
    bases = {
        "AIRTABLE_BASE_ID": os.getenv("AIRTABLE_BASE_ID"),
        "AIRTABLE_COMMAND_CENTER_BASE_ID": "appRt8V3tH4g5Z51f"
    }
    
    print("Available Credentials:")
    for token_name, token_value in tokens.items():
        status = "✅ Available" if token_value else "❌ Missing"
        print(f"  {token_name}: {status}")
    
    print("\nBase IDs:")
    for base_name, base_id in bases.items():
        print(f"  {base_name}: {base_id}")
    
    print("\n" + "=" * 50)
    
    # Test each token with Integration Test Log
    table_name = "🧪 Integration Test Log"
    
    for token_name, token_value in tokens.items():
        if not token_value:
            continue
            
        print(f"\nTesting {token_name}...")
        
        # Test with main base
        if bases["AIRTABLE_BASE_ID"]:
            success = test_table_access(token_value, bases["AIRTABLE_BASE_ID"], table_name, f"{token_name} + Main Base")
            if success:
                print(f"✅ {token_name} works with main base!")
                return token_value, bases["AIRTABLE_BASE_ID"]
        
        # Test with Command Center base
        success = test_table_access(token_value, bases["AIRTABLE_COMMAND_CENTER_BASE_ID"], table_name, f"{token_name} + CC Base")
        if success:
            print(f"✅ {token_name} works with Command Center base!")
            return token_value, bases["AIRTABLE_COMMAND_CENTER_BASE_ID"]
    
    print("\n❌ No working Airtable authentication found")
    print("\nTo fix this issue, you need to provide:")
    print("1. A valid Airtable Personal Access Token")
    print("2. The correct Base ID containing the Integration Test Log table")
    
    return None, None

def test_table_access(token, base_id, table_name, description):
    """Test access to specific table"""
    try:
        print(f"  Testing {description}...")
        
        # Method 1: Try PyAirtable API
        try:
            api = Api(token)
            table = api.table(base_id, table_name)
            records = table.all(max_records=1)
            print(f"    ✅ PyAirtable: Found {len(records)} record(s)")
            return True
        except Exception as e:
            print(f"    ❌ PyAirtable failed: {str(e)[:100]}")
        
        # Method 2: Try direct REST API
        try:
            url = f"https://api.airtable.com/v0/{base_id}/{table_name}"
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(url, headers=headers, params={"maxRecords": 1})
            
            if response.status_code == 200:
                data = response.json()
                record_count = len(data.get("records", []))
                print(f"    ✅ REST API: Found {record_count} record(s)")
                return True
            else:
                print(f"    ❌ REST API failed: {response.status_code} - {response.text[:100]}")
        except Exception as e:
            print(f"    ❌ REST API error: {str(e)[:100]}")
        
        return False
        
    except Exception as e:
        print(f"    ❌ General error: {str(e)[:100]}")
        return False

def test_specific_tables():
    """Test access to other known tables"""
    print("\n" + "=" * 50)
    print("Testing Other Known Tables:")
    
    # Get working credentials
    working_token, working_base = test_airtable_credentials()
    
    if not working_token:
        print("❌ No working credentials found, skipping table tests")
        return
    
    # Known tables to test
    tables_to_test = [
        "Integration Test Log",
        "🧪 Integration Test Log", 
        "Test Log",
        "Command Center",
        "Support Tickets",
        "Metrics"
    ]
    
    for table_name in tables_to_test:
        print(f"\nTesting table: {table_name}")
        success = test_table_access(working_token, working_base, table_name, f"Table: {table_name}")
        if success:
            print(f"✅ Found working table: {table_name}")

if __name__ == "__main__":
    test_airtable_credentials()
    test_specific_tables()