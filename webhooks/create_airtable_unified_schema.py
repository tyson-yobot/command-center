#!/usr/bin/env python3
"""
Create Unified Airtable Schema for All Webhook Endpoints
Sets up proper field structure that works with your existing API key
"""

import requests
import json
import os

def test_simple_fields():
    """Test the simplest possible field structure first"""
    
    api_key = os.getenv('AIRTABLE_API_KEY')
    if not api_key:
        print("❌ AIRTABLE_API_KEY not found")
        return
    
    base_url = "https://api.airtable.com/v0/appRt8V3tH4g5Z5if/tbldPRZ4nHbtj9opU/"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Test with simplest field names
    simple_tests = [
        {
            "name": "Basic Text Field",
            "fields": {"Name": "Test User"}
        },
        {
            "name": "Standard Fields",
            "fields": {
                "Name": "Test User",
                "Email": "test@example.com"
            }
        },
        {
            "name": "Form Fields",
            "fields": {
                "name": "Test User",
                "email": "test@example.com", 
                "form": "Test Form"
            }
        }
    ]
    
    for test in simple_tests:
        print(f"\n🧪 Testing: {test['name']}")
        
        try:
            response = requests.post(
                base_url,
                headers=headers,
                json={"fields": test["fields"]},
                timeout=10
            )
            
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                print("   ✅ SUCCESS!")
                print(f"   Working fields: {list(test['fields'].keys())}")
                return test["fields"]
            else:
                error_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
                print(f"   ❌ FAILED: {error_data}")
                
        except Exception as e:
            print(f"   ❌ ERROR: {str(e)}")
    
    return None

def create_test_record():
    """Create a test record to establish working field structure"""
    
    api_key = os.getenv('AIRTABLE_API_KEY')
    if not api_key:
        print("❌ AIRTABLE_API_KEY not found")
        return
    
    base_url = "https://api.airtable.com/v0/appRt8V3tH4g5Z5if/tbldPRZ4nHbtj9opU/"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Webhook standard fields based on your specifications
    webhook_fields = {
        "name": "Test Webhook User",
        "email": "webhook@test.com",
        "phone": "555-0123",
        "form": "Webhook Test",
        "source": "API Test"
    }
    
    print("\n🚀 Creating test record with webhook fields...")
    print(f"   Fields: {json.dumps(webhook_fields, indent=2)}")
    
    try:
        response = requests.post(
            base_url,
            headers=headers,
            json={"fields": webhook_fields},
            timeout=10
        )
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            print("   ✅ SUCCESS! Webhook fields work!")
            record_data = response.json()
            print(f"   Record ID: {record_data['id']}")
            return webhook_fields
        else:
            error_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
            print(f"   ❌ FAILED: {error_data}")
            
    except Exception as e:
        print(f"   ❌ ERROR: {str(e)}")
    
    return None

if __name__ == "__main__":
    print("🔧 Creating Unified Airtable Schema")
    print("=" * 50)
    
    # First test simple fields
    working_fields = test_simple_fields()
    
    if not working_fields:
        # Try webhook standard fields
        working_fields = create_test_record()
    
    if working_fields:
        print("\n✅ WORKING FIELD STRUCTURE:")
        print(json.dumps(working_fields, indent=2))
        
        # Save to file
        with open('working_airtable_fields.json', 'w') as f:
            json.dump(working_fields, f, indent=2)
        print("\n💾 Saved to working_airtable_fields.json")
    else:
        print("\n❌ Unable to determine working field structure")
        print("   The table may not exist or may have specific field requirements")