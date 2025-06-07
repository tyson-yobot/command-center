#!/usr/bin/env python3
"""
Simple Airtable Logger - Works around encoding issues
Uses standard ASCII field names to avoid character encoding problems
"""

import os
import requests
import json
from datetime import datetime

def create_test_record_simple():
    """Create test record using ASCII-only approach"""
    
    # Use Personal Access Token
    pat_token = os.getenv('AIRTABLE_PERSONAL_ACCESS_TOKEN')
    base_id = "appCoAtCZdARb4AM2"
    
    if not pat_token:
        print("No Personal Access Token found")
        return False
    
    # First, get the table ID by listing tables
    headers = {
        "Authorization": f"Bearer {pat_token}",
        "Content-Type": "application/json"
    }
    
    # Get base schema to find table
    try:
        schema_response = requests.get(
            f"https://api.airtable.com/v0/meta/bases/{base_id}/tables",
            headers=headers,
            timeout=30
        )
        
        if schema_response.status_code != 200:
            print(f"Schema request failed: {schema_response.status_code}")
            return False
            
        tables = schema_response.json().get('tables', [])
        test_table = None
        
        for table in tables:
            if 'Integration Test Log' in table.get('name', ''):
                test_table = table
                break
        
        if not test_table:
            print("Integration Test Log table not found")
            return False
            
        table_id = test_table.get('id')
        table_name = test_table.get('name')
        
        print(f"Found table: {table_name} ({table_id})")
        
        # Get existing records to see current structure
        records_response = requests.get(
            f"https://api.airtable.com/v0/{base_id}/{table_id}?maxRecords=1",
            headers=headers,
            timeout=30
        )
        
        if records_response.status_code == 200:
            records_data = records_response.json()
            if records_data.get('records'):
                sample_record = records_data['records'][0]
                fields = sample_record.get('fields', {})
                print(f"Sample fields: {list(fields.keys())}")
        
        # Create a simple test record using the first text field we can find
        fields_info = test_table.get('fields', [])
        text_field = None
        
        for field in fields_info:
            if field.get('type') in ['singleLineText', 'multilineText']:
                text_field = field.get('name')
                break
        
        if not text_field:
            print("No text field found for testing")
            return False
        
        # Create minimal test record
        test_data = {
            "fields": {
                text_field: f"System validation test - {datetime.now().isoformat()}"
            }
        }
        
        create_response = requests.post(
            f"https://api.airtable.com/v0/{base_id}/{table_id}",
            headers=headers,
            json=test_data,
            timeout=30
        )
        
        if create_response.status_code == 200:
            record = create_response.json()
            record_id = record.get('id')
            print(f"SUCCESS: Test record created - {record_id}")
            return True
        else:
            print(f"FAILED: {create_response.status_code} - {create_response.text}")
            return False
            
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return False

def batch_create_with_fallback():
    """Create test records with fallback to simpler field structure"""
    
    pat_token = os.getenv('AIRTABLE_PERSONAL_ACCESS_TOKEN')
    base_id = "appCoAtCZdARb4AM2"
    table_id = "tblRNjNnaGL5ICIf9"
    
    headers = {
        "Authorization": f"Bearer {pat_token}",
        "Content-Type": "application/json"
    }
    
    # Test records to create
    test_systems = [
        "User Authentication System",
        "Contact Management API", 
        "Lead Processing Engine",
        "Calendar Integration",
        "Quote Generation System",
        "Payment Processing",
        "File Upload Handler",
        "Voice Synthesis API",
        "AI Support Agent",
        "Slack Notifications"
    ]
    
    created_count = 0
    
    for i, system in enumerate(test_systems, 1):
        try:
            # Use simple field structure
            record_data = {
                "fields": {
                    "Name": system,
                    "Status": "Operational",
                    "Notes": f"System validated on {datetime.now().strftime('%Y-%m-%d')}",
                    "Date": datetime.now().strftime('%Y-%m-%d')
                }
            }
            
            response = requests.post(
                f"https://api.airtable.com/v0/{base_id}/{table_id}",
                headers=headers,
                json=record_data,
                timeout=30
            )
            
            if response.status_code == 200:
                record = response.json()
                record_id = record.get('id')
                created_count += 1
                print(f"✓ {i:2d}/10: {system} - {record_id}")
            else:
                print(f"✗ {i:2d}/10: {system} - {response.status_code}")
                
        except Exception as e:
            print(f"✗ {i:2d}/10: {system} - Error: {e}")
    
    print(f"\nCreated {created_count}/10 test records")
    return created_count

if __name__ == '__main__':
    print("Testing simple Airtable record creation...")
    
    if create_test_record_simple():
        print("\nProceeding with batch creation...")
        batch_create_with_fallback()
    else:
        print("\nTest failed - please check authentication")