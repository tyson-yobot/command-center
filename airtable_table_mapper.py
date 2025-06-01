#!/usr/bin/env python3
"""
Airtable Table Mapper
Maps correct table names and field structures for YoBot logging
"""

import requests
import os
from datetime import datetime

def get_airtable_base_schema():
    """Get the actual table structure from Airtable"""
    try:
        base_id = os.getenv("AIRTABLE_BASE_ID")
        api_key = os.getenv("AIRTABLE_API_KEY")
        
        if not base_id or not api_key:
            return {"error": "Missing Airtable credentials"}
        
        # Get base metadata
        url = f"https://api.airtable.com/v0/meta/bases/{base_id}/tables"
        headers = {"Authorization": f"Bearer {api_key}"}
        
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            tables = response.json().get("tables", [])
            return {"tables": tables}
        else:
            return {"error": f"API Error: {response.status_code}"}
            
    except Exception as e:
        return {"error": str(e)}

def find_universal_logging_table():
    """Find the correct universal logging table name"""
    schema = get_airtable_base_schema()
    
    if "error" in schema:
        return None
    
    # Look for common logging table names
    logging_keywords = ["log", "universal", "webhook", "automation", "tracker", "events"]
    
    for table in schema.get("tables", []):
        table_name = table.get("name", "").lower()
        for keyword in logging_keywords:
            if keyword in table_name:
                return table.get("name")
    
    # If no specific logging table found, return the first table
    if schema.get("tables"):
        return schema["tables"][0].get("name")
    
    return None

def create_universal_logging_table():
    """Create universal logging table if it doesn't exist"""
    try:
        base_id = os.getenv("AIRTABLE_BASE_ID")
        api_key = os.getenv("AIRTABLE_API_KEY")
        
        table_name = "Universal Webhook Logger"
        
        # Try to log to this table first
        url = f"https://api.airtable.com/v0/{base_id}/{table_name}"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        test_data = {
            "fields": {
                "Event Type": "test",
                "Source": "system",
                "Timestamp": datetime.utcnow().isoformat(),
                "Data": "connection test"
            }
        }
        
        response = requests.post(url, json=test_data, headers=headers, timeout=10)
        
        if response.status_code == 200:
            return table_name
        else:
            # Try alternative table name
            return find_universal_logging_table()
            
    except Exception as e:
        return None

def log_to_correct_airtable_table(data):
    """Log to the correct Airtable table with proper field mapping"""
    try:
        base_id = os.getenv("AIRTABLE_BASE_ID")
        api_key = os.getenv("AIRTABLE_API_KEY")
        
        # First, try to find the correct table
        table_name = create_universal_logging_table()
        
        if not table_name:
            return {"success": False, "error": "No suitable table found"}
        
        url = f"https://api.airtable.com/v0/{base_id}/{table_name}"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        # Map data to simple field structure
        airtable_data = {
            "fields": {
                "Event Type": data.get("event_type", "automation"),
                "Source": data.get("source", "system"),
                "Reference ID": str(data.get("ref_id", "")),
                "Summary": data.get("summary", ""),
                "Timestamp": data.get("timestamp", datetime.utcnow().isoformat()),
                "Raw Data": str(data)[:1000]  # Truncate to avoid field limits
            }
        }
        
        response = requests.post(url, json=airtable_data, headers=headers, timeout=10)
        
        if response.status_code == 200:
            return {"success": True, "table": table_name, "record_id": response.json().get("id")}
        else:
            return {"success": False, "error": f"HTTP {response.status_code}", "table": table_name}
            
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    # Test the mapping
    print("Testing Airtable table mapping...")
    
    schema = get_airtable_base_schema()
    if "tables" in schema:
        print(f"Found {len(schema['tables'])} tables in base:")
        for table in schema["tables"]:
            print(f"  - {table.get('name')}")
    else:
        print(f"Error getting schema: {schema.get('error')}")
    
    # Test logging
    test_result = log_to_correct_airtable_table({
        "event_type": "integration_test",
        "source": "table_mapper",
        "summary": "Testing correct table mapping",
        "timestamp": datetime.utcnow().isoformat()
    })
    
    print(f"Test logging result: {test_result}")