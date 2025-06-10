#!/usr/bin/env python3
"""
Integration Logger - Test Connection
Purpose: Test Airtable connection and logging functionality
"""

import requests
from datetime import datetime
import json

# Airtable Configuration - PLEASE PROVIDE CORRECT VALUES
AIRTABLE_BASE_ID = "NEED_CORRECT_BASE_ID"  
AIRTABLE_TABLE_NAME = "NEED_CORRECT_TABLE_NAME"
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
                print(f"Found {len(data.get('records', []))} existing records")
                
                # Now try to create a test record
                print("Testing WRITE access...")
                test_data = {
                    "fields": {
                        "🔧 Integration Name": "CONNECTION_TEST",
                        "⚡ Status": "testing",
                        "🔢 Status Code": 200,
                        "⏱️ Response Time": 0.1,
                        "📅 Last Tested": datetime.now().isoformat(),
                        "🔗 Endpoint": "test://connection",
                        "📊 Response Size": 100
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
        # Keep test record for now - will delete when user confirms
    else:
        print("❌ Logger connection failed")

if __name__ == "__main__":
    main()