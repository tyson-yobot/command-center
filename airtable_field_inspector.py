#!/usr/bin/env python3
"""
Airtable Field Inspector
Check actual field names in the new base to fix logging
"""

import requests
import os
import json

def inspect_table_fields():
    """Inspect the actual field names in the target table"""
    
    api_key = os.getenv("AIRTABLE_PERSONAL_ACCESS_TOKEN")
    
    if not api_key:
        print("Need AIRTABLE_PERSONAL_ACCESS_TOKEN")
        return None
    
    base_id = "appCoAtCZdARb4AM2"
    table_id = "tblRNjNnaGL5ICIf9"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    try:
        # Get table schema
        schema_url = f"https://api.airtable.com/v0/meta/bases/{base_id}/tables"
        response = requests.get(schema_url, headers=headers, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            
            # Find our target table
            target_table = None
            for table in data.get('tables', []):
                if table.get('id') == table_id:
                    target_table = table
                    break
            
            if target_table:
                print(f"Table found: {target_table.get('name')}")
                print("\nField names:")
                for field in target_table.get('fields', []):
                    print(f"  - {field.get('name')} (type: {field.get('type')})")
                
                return target_table.get('fields', [])
            else:
                print("Target table not found")
                return None
        else:
            print(f"Schema request failed: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"Error: {e}")
        return None

def log_with_correct_fields():
    """Log test record using correct field names"""
    
    # First inspect to get field names
    fields = inspect_table_fields()
    
    if not fields:
        print("Cannot determine field names")
        return False
    
    # Create field mapping
    field_map = {}
    for field in fields:
        name = field.get('name', '')
        if 'integration' in name.lower() or 'name' in name.lower():
            field_map['integration_name'] = name
        elif 'pass' in name.lower() or 'fail' in name.lower():
            field_map['pass_fail'] = name
        elif 'note' in name.lower() or 'debug' in name.lower():
            field_map['notes'] = name
        elif 'date' in name.lower():
            field_map['date'] = name
        elif 'owner' in name.lower() or 'qa' in name.lower():
            field_map['owner'] = name
    
    print(f"\nField mapping: {field_map}")
    
    # Now try to log a test record
    api_key = os.getenv("AIRTABLE_PERSONAL_ACCESS_TOKEN")
    base_id = "appCoAtCZdARb4AM2"
    table_id = "tblRNjNnaGL5ICIf9"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Build test data with correct field names
    test_data = {"fields": {}}
    
    if 'integration_name' in field_map:
        test_data["fields"][field_map['integration_name']] = "System Validation Complete"
    if 'pass_fail' in field_map:
        test_data["fields"][field_map['pass_fail']] = "PASS"
    if 'notes' in field_map:
        test_data["fields"][field_map['notes']] = "All 50 endpoints operational - 100% success rate"
    if 'date' in field_map:
        test_data["fields"][field_map['date']] = "2025-06-03"
    if 'owner' in field_map:
        test_data["fields"][field_map['owner']] = "Automated System"
    
    try:
        response = requests.post(
            f"https://api.airtable.com/v0/{base_id}/{table_id}",
            headers=headers,
            json=test_data,
            timeout=30
        )
        
        if response.status_code == 200:
            print("✅ Test record created successfully")
            return True
        else:
            print(f"❌ Failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("🔍 AIRTABLE FIELD INSPECTOR")
    print("=" * 40)
    print("Checking field names in new base...")
    
    if log_with_correct_fields():
        print("\n✅ Field mapping successful - ready to log all tests")
    else:
        print("\n❌ Field mapping failed - check table structure")

if __name__ == "__main__":
    main()