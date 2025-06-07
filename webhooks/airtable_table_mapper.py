#!/usr/bin/env python3
"""
Airtable Table Mapper
Maps correct table names and field structures for YoBot logging
"""

import os
import requests
from pyairtable import Api

AIRTABLE_API_KEY = os.environ.get('AIRTABLE_API_KEY')
AIRTABLE_BASE_ID = os.environ.get('AIRTABLE_BASE_ID')

def get_airtable_base_schema():
    """Get the actual table structure from Airtable"""
    if not AIRTABLE_API_KEY or not AIRTABLE_BASE_ID:
        print("Missing Airtable credentials")
        return None
    
    try:
        # Use direct API to get base schema
        headers = {'Authorization': f'Bearer {AIRTABLE_API_KEY}'}
        url = f'https://api.airtable.com/v0/meta/bases/{AIRTABLE_BASE_ID}/tables'
        
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            print("Available tables in your Airtable base:")
            for table in data.get('tables', []):
                print(f"  - {table['name']} (ID: {table['id']})")
                print(f"    Fields: {[field['name'] for field in table.get('fields', [])]}")
            return data
        else:
            print(f"Error accessing base schema: {response.status_code}")
            print(response.text)
            return None
            
    except Exception as e:
        print(f"Error getting base schema: {e}")
        return None

def find_universal_logging_table():
    """Find the correct universal logging table name"""
    possible_names = [
        'Integration Test Log',
        'Failed tests to be fixed',
        'Test Results',
        'Integration Tests',
        'QA Results',
        'System Tests',
        'Automation Tests'
    ]
    
    if not AIRTABLE_API_KEY or not AIRTABLE_BASE_ID:
        return None
    
    api = Api(AIRTABLE_API_KEY)
    
    for table_name in possible_names:
        try:
            table = api.table(AIRTABLE_BASE_ID, table_name)
            # Test if we can read from this table
            records = table.all(max_records=1)
            print(f"Found accessible table: {table_name}")
            return table_name
        except Exception as e:
            print(f"Cannot access table '{table_name}': {e}")
            continue
    
    return None

def create_universal_logging_table():
    """Create universal logging table if it doesn't exist"""
    # This would require additional permissions
    print("Creating new table requires admin permissions")
    return False

def log_to_correct_airtable_table(data):
    """Log to the correct Airtable table with proper field mapping"""
    table_name = find_universal_logging_table()
    
    if not table_name:
        print("No accessible logging table found")
        return False
    
    try:
        api = Api(AIRTABLE_API_KEY)
        table = api.table(AIRTABLE_BASE_ID, table_name)
        
        # Map data to correct field names
        record_data = {
            'Integration Name': data.get('test_name', 'Unknown Test'),
            'Pass/Fail': '✅' if data.get('status') == 'PASS' else '❌',
            'Notes / Debug': data.get('details', ''),
            'Test Date': data.get('timestamp', ''),
            'QA Owner': 'Automated System',
            'Module Type': data.get('module_type', 'System Test')
        }
        
        table.create(record_data)
        return True
        
    except Exception as e:
        print(f"Error logging to table: {e}")
        return False

if __name__ == "__main__":
    print("🔍 AIRTABLE TABLE MAPPER")
    print("=" * 40)
    
    # Get base schema
    schema = get_airtable_base_schema()
    
    # Find correct table
    table_name = find_universal_logging_table()
    if table_name:
        print(f"\n✅ Found logging table: {table_name}")
    else:
        print("\n❌ No accessible logging table found")
        print("Please check your Airtable permissions or provide the correct table name.")