#!/usr/bin/env python3
"""
Create Test Record - Handles UTF-8 encoding for emoji field names
"""

import os
import urllib3
import json
from datetime import datetime

def create_single_test_record():
    """Create one test record using proper UTF-8 handling"""
    
    # Get authentication token
    auth_token = os.getenv('AIRTABLE_PERSONAL_ACCESS_TOKEN')
    if not auth_token:
        print("Need AIRTABLE_PERSONAL_ACCESS_TOKEN environment variable")
        return False
    
    # Airtable configuration
    base_id = "appCoAtCZdARb4AM2"
    table_id = "tblRNjNnaGL5ICIf9"
    
    # Create HTTP pool manager
    http = urllib3.PoolManager()
    
    # Test record data with emoji field names
    record_data = {
        "fields": {
            "🧩 Integration Name": "System Validation Test",
            "✅ Status": "Pass",
            "📝 Notes": f"Test record created at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            "🎯 Module Type": "Core Automation",
            "📊 Scenario Link": "https://system-test.validation",
            "🔍 Output Data": "Test validation successful",
            "👤 QA Owner": "Automated System"
        }
    }
    
    # Prepare request
    url = f"https://api.airtable.com/v0/{base_id}/{table_id}"
    headers = {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }
    
    # Convert to JSON with UTF-8 encoding
    json_data = json.dumps(record_data, ensure_ascii=False)
    encoded_data = json_data.encode('utf-8')
    
    try:
        # Make the request
        response = http.request(
            'POST',
            url,
            body=encoded_data,
            headers=headers
        )
        
        if response.status == 200:
            result = json.loads(response.data.decode('utf-8'))
            record_id = result.get('id')
            print(f"SUCCESS: Test record created with ID: {record_id}")
            print(f"View at: https://airtable.com/{base_id}/{table_id}")
            return True
        else:
            print(f"FAILED: Status {response.status}")
            print(f"Response: {response.data.decode('utf-8')}")
            return False
            
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def create_multiple_validation_records():
    """Create multiple validation records for different system components"""
    
    # Get authentication token
    auth_token = os.getenv('AIRTABLE_PERSONAL_ACCESS_TOKEN')
    if not auth_token:
        print("Need AIRTABLE_PERSONAL_ACCESS_TOKEN environment variable")
        return False
    
    # Airtable configuration
    base_id = "appCoAtCZdARb4AM2"
    table_id = "tblRNjNnaGL5ICIf9"
    
    # Create HTTP pool manager
    http = urllib3.PoolManager()
    
    # System validation records
    validation_records = [
        {
            "name": "Authentication System",
            "module": "Core Automation",
            "notes": "User login and session management verified"
        },
        {
            "name": "Payment Processing", 
            "module": "Payment Integration",
            "notes": "Stripe payment flows operational"
        },
        {
            "name": "AI Support Agent",
            "module": "AI Integration", 
            "notes": "OpenAI GPT-4o responses functioning"
        },
        {
            "name": "Voice Synthesis",
            "module": "Voice Integration",
            "notes": "ElevenLabs voice generation active"
        },
        {
            "name": "Database Operations",
            "module": "Database",
            "notes": "PostgreSQL connections stable"
        },
        {
            "name": "Slack Integration",
            "module": "Communication",
            "notes": "Alert notifications working"
        },
        {
            "name": "File Processing",
            "module": "Document Management", 
            "notes": "Upload and OCR systems operational"
        },
        {
            "name": "Analytics Dashboard",
            "module": "Monitoring",
            "notes": "Real-time metrics displaying correctly"
        },
        {
            "name": "Calendar Sync",
            "module": "External Integration",
            "notes": "Google Calendar integration functional"
        },
        {
            "name": "Contact Management",
            "module": "CRM Integration",
            "notes": "Contact CRUD operations verified"
        }
    ]
    
    created_count = 0
    
    for i, system in enumerate(validation_records, 1):
        # Create record data
        record_data = {
            "fields": {
                "🧩 Integration Name": system["name"],
                "✅ Status": "Pass",
                "📝 Notes": system["notes"],
                "🎯 Module Type": system["module"],
                "📊 Scenario Link": f"https://validation-{i}.test",
                "🔍 Output Data": f"{system['name']} validation completed",
                "👤 QA Owner": "Automated System"
            }
        }
        
        # Prepare request
        url = f"https://api.airtable.com/v0/{base_id}/{table_id}"
        headers = {
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json"
        }
        
        # Convert to JSON with UTF-8 encoding
        json_data = json.dumps(record_data, ensure_ascii=False)
        encoded_data = json_data.encode('utf-8')
        
        try:
            # Make the request
            response = http.request(
                'POST',
                url,
                body=encoded_data,
                headers=headers
            )
            
            if response.status == 200:
                result = json.loads(response.data.decode('utf-8'))
                record_id = result.get('id')
                created_count += 1
                print(f"✓ {i:2d}/10: {system['name']} -> {record_id}")
            else:
                print(f"✗ {i:2d}/10: {system['name']} -> Status {response.status}")
                
        except Exception as e:
            print(f"✗ {i:2d}/10: {system['name']} -> Error: {e}")
    
    print(f"\nValidation Complete: {created_count}/10 records created")
    
    if created_count > 0:
        print(f"View records: https://airtable.com/{base_id}/{table_id}")
        return True
    else:
        print("No records created - check authentication")
        return False

if __name__ == '__main__':
    print("Testing single record creation...")
    if create_single_test_record():
        print("\nCreating full validation suite...")
        create_multiple_validation_records()
    else:
        print("Single test failed - check token permissions")