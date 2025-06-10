#!/usr/bin/env python3
"""
Integration Logger - Production System
Purpose: Log automation function results to Airtable
"""

import requests
from datetime import datetime
import json

# Airtable Configuration - Working settings
AIRTABLE_BASE_ID = "appRt8V3tH4g5Z5if"  
AIRTABLE_TABLE_NAME = "tbly0fjE2M5uHET9X"
AIRTABLE_TOKEN = "paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa"

class IntegrationLogger:
    def __init__(self):
        print("🔧 Integration Logger - LIVE PRODUCTION MODE")
        self.base_url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{AIRTABLE_TABLE_NAME}"
        self.headers = {
            "Authorization": f"Bearer {AIRTABLE_TOKEN}",
            "Content-Type": "application/json"
        }

    def log_integration_result(self, integration_name: str, success: bool, notes: str = "", endpoint: str = ""):
        """Log an integration test result to Airtable"""
        try:
            fields = {
                "🔧 Integration Name": integration_name
            }
            
            data = {"fields": fields}
            response = requests.post(self.base_url, headers=self.headers, json=data)
            
            if response.status_code == 200:
                record_id = response.json()['id']
                status = "✅ SUCCESS" if success else "❌ FAILED"
                print(f"{status} - {integration_name} logged to Airtable: {record_id}")
                return True
            else:
                print(f"❌ Failed to log {integration_name}: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Error logging {integration_name}: {e}")
            return False

def main():
    """Test the logger with sample integration results"""
    logger = IntegrationLogger()
    
    # Test logging various integration results
    test_integrations = [
        ("Mailchimp Sync", True, "Email list synchronized successfully"),
        ("Slack Notification", True, "Message sent to #general channel"),
        ("Stripe Payment", True, "Payment processed successfully"),
        ("API Health Check", True, "All endpoints responding"),
        ("Database Backup", True, "Backup completed successfully")
    ]
    
    print("\n🚀 Testing Integration Logger...")
    print("=" * 50)
    
    success_count = 0
    for integration_name, success, notes in test_integrations:
        if logger.log_integration_result(integration_name, success, notes):
            success_count += 1
    
    print("=" * 50)
    print(f"✅ Successfully logged {success_count}/{len(test_integrations)} integrations")
    print("🏁 Integration logger testing completed")

if __name__ == "__main__":
    main()