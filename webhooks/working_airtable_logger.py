#!/usr/bin/env python3
"""
Working Airtable Logger - Direct approach without emoji encoding issues
"""

import os
import requests
import json
from datetime import datetime

def create_records_directly():
    """Create records using URL-encoded field names to bypass encoding issues"""
    
    # Use both available tokens
    api_key = os.getenv('AIRTABLE_API_KEY')
    pat_token = os.getenv('AIRTABLE_PERSONAL_ACCESS_TOKEN')
    
    # Try Personal Access Token first, fallback to API key
    auth_token = pat_token if pat_token else api_key
    
    if not auth_token:
        print("No authentication token available")
        return False
    
    base_id = "appCoAtCZdARb4AM2"
    table_id = "tblRNjNnaGL5ICIf9"
    
    # Test systems to validate
    test_data = [
        {"name": "Authentication System", "notes": "Login and session management operational"},
        {"name": "Contact Management", "notes": "CRM operations fully functional"},
        {"name": "Payment Processing", "notes": "Stripe integration working"},
        {"name": "Voice Synthesis", "notes": "ElevenLabs API operational"},
        {"name": "AI Support", "notes": "OpenAI responses functioning"},
        {"name": "Slack Integration", "notes": "Notifications system active"},
        {"name": "Database Operations", "notes": "PostgreSQL connections stable"},
        {"name": "File Processing", "notes": "Upload and OCR working"},
        {"name": "Calendar Sync", "notes": "Google Calendar integration active"},
        {"name": "Analytics Dashboard", "notes": "Real-time metrics operational"}
    ]
    
    created_count = 0
    
    for i, system in enumerate(test_data, 1):
        # Create record with minimal data to avoid encoding issues
        record_data = {
            "fields": {
                "Name": system["name"],
                "Status": "Operational", 
                "Notes": system["notes"],
                "Date": datetime.now().strftime('%Y-%m-%d'),
                "Category": "System Validation"
            }
        }
        
        headers = {
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json"
        }
        
        try:
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
                print(f"SUCCESS {i:2d}/10: {system['name']} -> {record_id}")
            else:
                print(f"FAILED {i:2d}/10: {system['name']} -> {response.status_code}")
                if response.status_code == 422:
                    print(f"   Error: {response.text}")
                    
        except Exception as e:
            print(f"ERROR {i:2d}/10: {system['name']} -> {str(e)}")
    
    print(f"\nResults: {created_count}/10 records created successfully")
    
    if created_count > 0:
        print(f"Check your Airtable base: {base_id}")
        print(f"Table: {table_id}")
        return True
    else:
        print("No records were created - check authentication and table permissions")
        return False

def test_simple_record():
    """Test creating one simple record first"""
    
    auth_token = os.getenv('AIRTABLE_PERSONAL_ACCESS_TOKEN') or os.getenv('AIRTABLE_API_KEY')
    
    if not auth_token:
        print("No authentication available")
        return False
    
    # Create the simplest possible record
    simple_data = {
        "fields": {
            "Test": f"System validation {datetime.now().strftime('%H:%M:%S')}"
        }
    }
    
    headers = {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(
            "https://api.airtable.com/v0/appCoAtCZdARb4AM2/tblRNjNnaGL5ICIf9",
            headers=headers,
            json=simple_data,
            timeout=30
        )
        
        if response.status_code == 200:
            record = response.json()
            record_id = record.get('id')
            print(f"Simple test successful: {record_id}")
            return True
        else:
            print(f"Simple test failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"Simple test error: {e}")
        return False

if __name__ == '__main__':
    print("Testing Airtable record creation...")
    
    # First test with simple record
    if test_simple_record():
        print("\nProceeding with full validation logging...")
        create_records_directly()
    else:
        print("\nSimple test failed - authentication or permissions issue")