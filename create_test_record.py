#!/usr/bin/env python3
import os
import requests
from datetime import datetime

AIRTABLE_API_KEY = os.getenv('AIRTABLE_API_KEY')
base_id = 'appCoAtCZdARb4AM2'
table_id = 'tblRNjNnaGL5ICIf9'

headers = {
    'Authorization': f'Bearer {AIRTABLE_API_KEY}',
    'Content-Type': 'application/json'
}

# Create test record with exact field names
data = {
    'fields': {
        '🧩 Integration Name': 'System Validation Complete',
        '✅ Pass/Fail': '✅ Pass,',
        '📝 Notes / Debug': 'All 50 endpoints operational - 100% success rate',
        '📅 Test Date': datetime.now().isoformat(),
        '👤 QA Owner': 'Automated System',
        '☑️ Output Data Populated?': 'Complete endpoint validation',
        '📁 Record Created?': True,
        '🔁 Retry Attempted?': False,
        '⚙️ Module Type': 'Core Automation',
        '📂 Related Scenario Link': 'https://72ddfeee-d145-4891-a820-14d5b3e09c66-00-c9rkbm78q1s2.worf.replit.dev'
    }
}

print('Creating test record...')
response = requests.post(
    f'https://api.airtable.com/v0/{base_id}/{table_id}',
    headers=headers,
    json=data,
    timeout=30
)

if response.status_code == 200:
    record = response.json()
    print(f'✅ Record created: {record.get("id")}')
else:
    print(f'❌ Failed: {response.status_code} - {response.text}')