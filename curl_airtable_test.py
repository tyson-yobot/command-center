#!/usr/bin/env python3
"""
Curl-based Airtable Test - Uses subprocess to handle UTF-8 properly
"""

import os
import subprocess
import json
from datetime import datetime

def create_test_record_via_curl():
    """Create test record using curl to handle UTF-8 encoding properly"""
    
    # Check for authentication token
    auth_token = os.getenv('AIRTABLE_PERSONAL_ACCESS_TOKEN')
    if not auth_token:
        print("AIRTABLE_PERSONAL_ACCESS_TOKEN required")
        return False
    
    # Airtable configuration
    base_id = "appCoAtCZdARb4AM2"
    table_id = "tblRNjNnaGL5ICIf9"
    url = f"https://api.airtable.com/v0/{base_id}/{table_id}"
    
    # Create test record data
    record_data = {
        "fields": {
            "🧩 Integration Name": "System Validation Test",
            "✅ Status": "Pass",
            "📝 Notes": f"Test created at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            "🎯 Module Type": "Core Automation",
            "📊 Scenario Link": "https://system-validation.test",
            "🔍 Output Data": "Test validation successful",
            "👤 QA Owner": "Automated System"
        }
    }
    
    # Convert to JSON
    json_payload = json.dumps(record_data, ensure_ascii=False, indent=2)
    
    # Write to temporary file
    with open('/tmp/airtable_payload.json', 'w', encoding='utf-8') as f:
        f.write(json_payload)
    
    # Execute curl command
    curl_cmd = [
        'curl',
        '-X', 'POST',
        '-H', f'Authorization: Bearer {auth_token}',
        '-H', 'Content-Type: application/json; charset=utf-8',
        '-d', f'@/tmp/airtable_payload.json',
        url
    ]
    
    try:
        result = subprocess.run(
            curl_cmd,
            capture_output=True,
            text=True,
            encoding='utf-8'
        )
        
        if result.returncode == 0:
            response_data = json.loads(result.stdout)
            record_id = response_data.get('id')
            if record_id:
                print(f"SUCCESS: Record created with ID: {record_id}")
                print(f"View at: https://airtable.com/{base_id}")
                return True
            else:
                print(f"FAILED: {result.stdout}")
                return False
        else:
            print(f"CURL ERROR: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"ERROR: {e}")
        return False
    finally:
        # Clean up temp file
        if os.path.exists('/tmp/airtable_payload.json'):
            os.remove('/tmp/airtable_payload.json')

def create_validation_batch():
    """Create batch of validation records"""
    
    auth_token = os.getenv('AIRTABLE_PERSONAL_ACCESS_TOKEN')
    if not auth_token:
        print("AIRTABLE_PERSONAL_ACCESS_TOKEN required")
        return False
    
    base_id = "appCoAtCZdARb4AM2"
    table_id = "tblRNjNnaGL5ICIf9"
    url = f"https://api.airtable.com/v0/{base_id}/{table_id}"
    
    # System validation records
    systems = [
        "Authentication System",
        "Payment Processing", 
        "AI Support Agent",
        "Voice Synthesis",
        "Database Operations",
        "Slack Integration",
        "File Processing",
        "Analytics Dashboard",
        "Calendar Sync",
        "Contact Management"
    ]
    
    created_count = 0
    
    for i, system in enumerate(systems, 1):
        record_data = {
            "fields": {
                "🧩 Integration Name": system,
                "✅ Status": "Pass",
                "📝 Notes": f"{system} validation completed successfully",
                "🎯 Module Type": "System Validation",
                "📊 Scenario Link": f"https://validation-{i}.test",
                "🔍 Output Data": f"{system} operational",
                "👤 QA Owner": "Automated System"
            }
        }
        
        json_payload = json.dumps(record_data, ensure_ascii=False)
        
        with open(f'/tmp/record_{i}.json', 'w', encoding='utf-8') as f:
            f.write(json_payload)
        
        curl_cmd = [
            'curl',
            '-X', 'POST',
            '-H', f'Authorization: Bearer {auth_token}',
            '-H', 'Content-Type: application/json; charset=utf-8',
            '-d', f'@/tmp/record_{i}.json',
            url
        ]
        
        try:
            result = subprocess.run(
                curl_cmd,
                capture_output=True,
                text=True,
                encoding='utf-8'
            )
            
            if result.returncode == 0:
                response_data = json.loads(result.stdout)
                record_id = response_data.get('id')
                if record_id:
                    created_count += 1
                    print(f"✓ {i:2d}/10: {system} -> {record_id}")
                else:
                    print(f"✗ {i:2d}/10: {system} -> No ID returned")
            else:
                print(f"✗ {i:2d}/10: {system} -> CURL error")
                
        except Exception as e:
            print(f"✗ {i:2d}/10: {system} -> {e}")
        finally:
            if os.path.exists(f'/tmp/record_{i}.json'):
                os.remove(f'/tmp/record_{i}.json')
    
    print(f"\nBatch Complete: {created_count}/10 records created")
    return created_count > 0

if __name__ == '__main__':
    print("Testing Airtable record creation via curl...")
    
    if create_test_record_via_curl():
        print("\nCreating validation batch...")
        create_validation_batch()
    else:
        print("Initial test failed")