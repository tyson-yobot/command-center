#!/usr/bin/env python3
import os
import requests
import json
from datetime import datetime

def test_pat_authentication():
    """Test Personal Access Token authentication with proper encoding"""
    
    # Use Personal Access Token
    pat_token = os.getenv('AIRTABLE_PERSONAL_ACCESS_TOKEN')
    base_id = "appCoAtCZdARb4AM2"
    table_id = "tblRNjNnaGL5ICIf9"
    
    if not pat_token:
        print("❌ No Personal Access Token found")
        return False
    
    # Test record with correct field names
    test_data = {
        "fields": {
            "🧩 Integration Name": "PAT Authentication Test",
            "✅ Pass/Fail": "✅ Pass,",
            "📝 Notes / Debug": "Testing Personal Access Token authentication with UTF-8 encoding",
            "📅 Test Date": datetime.now().isoformat(),
            "👤 QA Owner": "System Validation",
            "☑️ Output Data Populated?": "Authentication successful",
            "📁 Record Created?": True,
            "🔁 Retry Attempted?": False,
            "⚙️ Module Type": "Core Authentication",
            "📂 Related Scenario Link": "https://72ddfeee-d145-4891-a820-14d5b3e09c66-00-c9rkbm78q1s2.worf.replit.dev"
        }
    }
    
    headers = {
        "Authorization": f"Bearer {pat_token}",
        "Content-Type": "application/json; charset=utf-8"
    }
    
    url = f"https://api.airtable.com/v0/{base_id}/{table_id}"
    
    try:
        # Use requests.post with json parameter for automatic UTF-8 handling
        response = requests.post(url, headers=headers, json=test_data, timeout=30)
        
        if response.status_code == 200:
            record = response.json()
            record_id = record.get('id')
            print(f"✅ PAT test successful: {record_id}")
            return True
        else:
            print(f"❌ PAT test failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Request error: {e}")
        return False

if __name__ == '__main__':
    test_pat_authentication()