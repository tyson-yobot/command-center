#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Direct Airtable Test with Proper UTF-8 Encoding
Uses exact emoji field names from your table
"""

import os
import requests
import json
from datetime import datetime

def create_test_records():
    """Create test records using exact emoji field names"""
    
    # Use Personal Access Token
    auth_token = os.getenv('AIRTABLE_PERSONAL_ACCESS_TOKEN')
    
    if not auth_token:
        print("Personal Access Token required")
        return False
    
    base_id = "appCoAtCZdARb4AM2"
    table_id = "tblRNjNnaGL5ICIf9"
    
    # Test records with exact emoji field names
    test_records = [
        {
            "🧩 Integration Name": "User Authentication System",
            "✅ Status": "Pass",
            "📝 Notes": "Login and session management operational",
            "🎯 Module Type": "Core Automation",
            "📊 Scenario Link": "https://system-validation.test",
            "🔍 Output Data": "Authentication verified",
            "👤 QA Owner": "Automated System"
        },
        {
            "🧩 Integration Name": "Payment Processing",
            "✅ Status": "Pass", 
            "📝 Notes": "Stripe integration fully functional",
            "🎯 Module Type": "Payment Integration",
            "📊 Scenario Link": "https://payment-test.validation",
            "🔍 Output Data": "Payment flows operational",
            "👤 QA Owner": "Automated System"
        },
        {
            "🧩 Integration Name": "AI Support Agent",
            "✅ Status": "Pass",
            "📝 Notes": "OpenAI GPT-4o responses working",
            "🎯 Module Type": "AI Integration", 
            "📊 Scenario Link": "https://ai-support.test",
            "🔍 Output Data": "AI responses generated successfully",
            "👤 QA Owner": "Automated System"
        },
        {
            "🧩 Integration Name": "Voice Synthesis",
            "✅ Status": "Pass",
            "📝 Notes": "ElevenLabs voice generation active",
            "🎯 Module Type": "Voice Integration",
            "📊 Scenario Link": "https://voice-synthesis.test", 
            "🔍 Output Data": "Voice files generated",
            "👤 QA Owner": "Automated System"
        },
        {
            "🧩 Integration Name": "Slack Notifications",
            "✅ Status": "Pass",
            "📝 Notes": "Alert system operational",
            "🎯 Module Type": "Communication",
            "📊 Scenario Link": "https://slack-integration.test",
            "🔍 Output Data": "Notifications sent successfully", 
            "👤 QA Owner": "Automated System"
        }
    ]
    
    headers = {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json; charset=utf-8"
    }
    
    created_count = 0
    
    for i, record_data in enumerate(test_records, 1):
        try:
            payload = {
                "fields": record_data
            }
            
            response = requests.post(
                f"https://api.airtable.com/v0/{base_id}/{table_id}",
                headers=headers,
                data=json.dumps(payload, ensure_ascii=False).encode('utf-8'),
                timeout=30
            )
            
            if response.status_code == 200:
                record = response.json()
                record_id = record.get('id')
                created_count += 1
                print(f"✓ Record {i}: {record_data['🧩 Integration Name']} -> {record_id}")
            else:
                print(f"✗ Record {i}: {record_data['🧩 Integration Name']} -> {response.status_code}")
                print(f"  Response: {response.text}")
                
        except Exception as e:
            print(f"✗ Record {i}: {record_data['🧩 Integration Name']} -> Error: {e}")
    
    print(f"\nResults: {created_count}/{len(test_records)} records created")
    
    if created_count > 0:
        print(f"Check your table: https://airtable.com/{base_id}/{table_id}")
        return True
    else:
        print("No records created - check authentication")
        return False

if __name__ == '__main__':
    print("Creating test records with emoji field names...")
    create_test_records()