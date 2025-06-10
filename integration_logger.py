#!/usr/bin/env python3
"""
Integration Logger - Test Connection
Purpose: Test Airtable connection and logging functionality
"""

import requests
from datetime import datetime
import json

# Airtable Configuration - From working bulkLogger.ts
AIRTABLE_BASE_ID = "appRt8V3tH4g5Z5if"  
AIRTABLE_TABLE_NAME = "tbly0fjE2M5uHET9X"
AIRTABLE_TOKEN = "paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa"

class IntegrationLogger:
    def __init__(self):
        print("🔧 Integration Logger - CONNECTION TEST")
        self.base_url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{AIRTABLE_TABLE_NAME}"
        self.headers = {
            "Authorization": f"Bearer {AIRTABLE_TOKEN}",
            "Content-Type": "application/json"
        }
        self.test_record_id = None

    def test_connection(self):
        """Test Airtable connection by first reading, then creating if possible"""
        try:
            # First try to read existing records
            print("Testing READ access...")
            response = requests.get(self.base_url, headers=self.headers)
            
            if response.status_code == 200:
                print("✅ READ access confirmed")
                data = response.json()
                records = data.get('records', [])
                print(f"Found {len(records)} existing records")
                
                # Show actual field names from first record
                if records:
                    first_record = records[0]
                    field_names = list(first_record.get('fields', {}).keys())
                    print(f"Available fields: {field_names}")
                
                # Now try to create a test record using the correct field name
                print("Testing WRITE access...")
                test_data = {
                    "fields": {
                        "🔧 Integration Name": "CONNECTION_TEST"
                    }
                }
                
                response = requests.post(self.base_url, headers=self.headers, json=test_data)
            else:
                print(f"❌ READ access failed: {response.status_code}")
                print(f"Response: {response.text}")
                return False
            
            if response.status_code == 200:
                self.test_record_id = response.json()['id']
                print(f"✅ CONNECTION SUCCESS - Test record created: {self.test_record_id}")
                return True
            else:
                print(f"❌ CONNECTION FAILED - Status: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ CONNECTION ERROR: {e}")
            return False

    def delete_test_data(self):
        """Delete the test record"""
        if self.test_record_id:
            try:
                url = f"{self.base_url}/{self.test_record_id}"
                response = requests.delete(url, headers=self.headers)
                
                if response.status_code == 200:
                    print(f"🗑️ Test record deleted: {self.test_record_id}")
                    return True
                else:
                    print(f"❌ Failed to delete test record: {response.status_code}")
                    return False
            except Exception as e:
                print(f"❌ Error deleting test record: {e}")
                return False
        return True

def main():
    logger = IntegrationLogger()
    
    if logger.test_connection():
        print("✅ Logger connection confirmed - ready for integration")
        # Delete test record as instructed
        logger.delete_test_data()
    else:
        print("❌ Logger connection failed")

if __name__ == "__main__":
    main()