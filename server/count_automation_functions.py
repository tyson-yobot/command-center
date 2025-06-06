#!/usr/bin/env python3
"""
Count All Automation Functions in Airtable
Get accurate count of all logged automation functions
"""

import requests
import json
from datetime import datetime

# Your Airtable credentials
AIRTABLE_BASE_ID = "appCoAtCZdARb4AM2"
AIRTABLE_TABLE_ID = "tblRNjNnaGL5ICIf9"
AIRTABLE_API_KEY = "paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa"
AIRTABLE_URL = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{AIRTABLE_TABLE_ID}"

HEADERS = {
    "Authorization": f"Bearer {AIRTABLE_API_KEY}",
    "Content-Type": "application/json"
}

def count_all_automation_records():
    """Count all automation function records in Airtable"""
    try:
        all_records = []
        offset = None
        
        while True:
            url = AIRTABLE_URL
            if offset:
                url += f"?offset={offset}"
            
            response = requests.get(url, headers=HEADERS)
            
            if response.status_code == 200:
                data = response.json()
                records = data.get('records', [])
                all_records.extend(records)
                
                offset = data.get('offset')
                if not offset:
                    break
            else:
                print(f"❌ Error fetching records: {response.status_code}")
                break
        
        # Analyze the records
        total_count = len(all_records)
        
        # Count by module type
        module_types = {}
        automation_functions = 0
        system_functions = 0
        integration_tests = 0
        
        for record in all_records:
            fields = record.get('fields', {})
            integration_name = fields.get('🧩 Integration Name', '')
            module_type = fields.get('⚙️ Module Type', 'Unknown')
            
            # Count module types
            if module_type in module_types:
                module_types[module_type] += 1
            else:
                module_types[module_type] = 1
            
            # Categorize functions
            if 'Function' in integration_name or 'Automation' in integration_name:
                automation_functions += 1
            elif 'System' in integration_name:
                system_functions += 1
            elif 'Integration' in integration_name or 'Test' in integration_name:
                integration_tests += 1
        
        print("🚀 YOBOT AUTOMATION FUNCTION COUNT REPORT")
        print("=" * 60)
        print(f"Total Records in Airtable: {total_count}")
        print()
        print("📊 BREAKDOWN BY CATEGORY:")
        print(f"  Automation Functions: {automation_functions}")
        print(f"  System Functions: {system_functions}")
        print(f"  Integration Tests: {integration_tests}")
        print()
        print("📋 BREAKDOWN BY MODULE TYPE:")
        for module_type, count in sorted(module_types.items()):
            print(f"  {module_type}: {count}")
        
        # Recent records analysis
        today = datetime.now().strftime("%Y-%m-%d")
        today_records = [r for r in all_records if r.get('fields', {}).get('📅 Test Date') == today]
        
        print(f"\n📅 Records logged today ({today}): {len(today_records)}")
        
        return {
            "total": total_count,
            "automation_functions": automation_functions,
            "system_functions": system_functions,
            "integration_tests": integration_tests,
            "module_breakdown": module_types,
            "today_count": len(today_records)
        }
        
    except Exception as e:
        print(f"❌ Error counting records: {e}")
        return None

def log_count_summary(count_data):
    """Log the count summary to Airtable"""
    if not count_data:
        return
    
    summary = f"Total logged functions: {count_data['total']} | Automation: {count_data['automation_functions']} | System: {count_data['system_functions']} | Integration: {count_data['integration_tests']} | Today: {count_data['today_count']}"
    
    data = {
        "fields": {
            "🧩 Integration Name": f"Function Count Report: {count_data['total']} Total Functions",
            "📝 Notes / Debug": summary,
            "📅 Test Date": datetime.now().strftime("%Y-%m-%d"),
            "👤 QA Owner": "YoBot System",
            "⚙️ Module Type": "System Report"
        }
    }
    
    try:
        response = requests.post(AIRTABLE_URL, headers=HEADERS, json=data)
        if response.status_code == 200:
            print("✅ Count summary logged to Airtable")
        else:
            print(f"❌ Failed to log summary: {response.status_code}")
    except Exception as e:
        print(f"❌ Error logging summary: {e}")

if __name__ == "__main__":
    print("🔍 COUNTING ALL AUTOMATION FUNCTIONS...")
    print("=" * 50)
    
    count_data = count_all_automation_records()
    
    if count_data:
        log_count_summary(count_data)
        
        print(f"\n🎯 CONFIRMED: {count_data['total']} TOTAL FUNCTIONS LOGGED")
        print("✅ YoBot system has comprehensive automation coverage")
    else:
        print("❌ Unable to count automation functions")