#!/usr/bin/env python3
"""
Find Available Airtable Tables
Tests the valid token to discover what bases and tables are accessible
"""

import os
import requests

def test_base_access(token, base_id, description):
    """Test what tables are available in a base"""
    print(f"\nTesting {description} ({base_id}):")
    
    try:
        # Get base schema to see available tables
        url = f"https://api.airtable.com/v0/meta/bases/{base_id}/tables"
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            tables = data.get("tables", [])
            print(f"  ✅ Found {len(tables)} tables:")
            for table in tables:
                table_name = table.get("name", "Unknown")
                table_id = table.get("id", "Unknown")
                print(f"    - {table_name} (ID: {table_id})")
            return tables
        else:
            print(f"  ❌ Failed: {response.status_code} - {response.text[:200]}")
            return []
            
    except Exception as e:
        print(f"  ❌ Error: {str(e)[:200]}")
        return []

def test_table_data(token, base_id, table_name, table_id):
    """Test reading data from a specific table"""
    print(f"\n  Testing data from '{table_name}':")
    
    try:
        # Try using table name first
        url = f"https://api.airtable.com/v0/{base_id}/{table_name}"
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(url, headers=headers, params={"maxRecords": 3})
        
        if response.status_code == 200:
            data = response.json()
            records = data.get("records", [])
            print(f"    ✅ Retrieved {len(records)} records using table name")
            if records:
                fields = list(records[0].get("fields", {}).keys())
                print(f"    📋 Available fields: {fields[:5]}{'...' if len(fields) > 5 else ''}")
            return True
        else:
            # Try using table ID
            url = f"https://api.airtable.com/v0/{base_id}/{table_id}"
            response = requests.get(url, headers=headers, params={"maxRecords": 3})
            
            if response.status_code == 200:
                data = response.json()
                records = data.get("records", [])
                print(f"    ✅ Retrieved {len(records)} records using table ID")
                if records:
                    fields = list(records[0].get("fields", {}).keys())
                    print(f"    📋 Available fields: {fields[:5]}{'...' if len(fields) > 5 else ''}")
                return True
            else:
                print(f"    ❌ Failed: {response.status_code} - {response.text[:100]}")
                return False
                
    except Exception as e:
        print(f"    ❌ Error: {str(e)[:100]}")
        return False

def main():
    print("Airtable Base and Table Discovery")
    print("=" * 50)
    
    token = os.getenv("AIRTABLE_VALID_TOKEN")
    
    if not token:
        print("❌ AIRTABLE_VALID_TOKEN not found")
        return
    
    print(f"✅ Testing with token: {token[:20]}...")
    
    # Test known bases
    bases_to_test = [
        ("appe0OSJtB1In1kn5", "Main Base"),
        ("appRt8V3tH4g5Z51f", "Command Center Base"),
        ("appCoAtCZdARb4AM2", "Integration Test Base")
    ]
    
    for base_id, description in bases_to_test:
        tables = test_base_access(token, base_id, description)
        
        # Test reading data from found tables
        for table in tables:
            table_name = table.get("name", "")
            table_id = table.get("id", "")
            
            # Look for integration test related tables
            if any(keyword in table_name.lower() for keyword in ["test", "integration", "log", "metric"]):
                test_table_data(token, base_id, table_name, table_id)

if __name__ == "__main__":
    main()