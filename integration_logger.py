#!/usr/bin/env python3
"""
Integration Test Log Handler for YoBot
Sends test results to Airtable Integration Test Log table
"""

import os
import requests
import json
from datetime import datetime
from typing import Optional

class IntegrationLogger:
    def __init__(self):
        self.airtable_token = os.getenv('AIRTABLE_API_KEY')
        self.base_id = os.getenv('AIRTABLE_BASE_ID')
        self.table_id = os.getenv('AIRTABLE_TABLE_ID', 'Integration Test Log')
        self.base_url = f"https://api.airtable.com/v0/{self.base_id}/{self.table_id}"
        
        if not self.airtable_token:
            raise ValueError("AIRTABLE_API_KEY environment variable is required")
        if not self.base_id:
            raise ValueError("AIRTABLE_BASE_ID environment variable is required")
    
    async def log_test_result(
        self,
        integration_name: str,
        pass_fail: str,
        notes: str,
        test_date: str,
        qa_owner: str,
        output_data_populated: bool,
        record_created: bool,
        retry_attempted: bool,
        module_type: str,
        related_scenario_link: str
    ) -> bool:
        """
        Log integration test result to Airtable
        
        Args:
            integration_name: Name of the integration being tested
            pass_fail: "✅" for pass, "❌" for fail
            notes: Detailed notes about the test result
            test_date: ISO formatted date string
            qa_owner: Person/system running the test
            output_data_populated: Boolean if output data was populated
            record_created: Boolean if a record was created
            retry_attempted: Boolean if retry was attempted
            module_type: Type of module (e.g., "Airtable Integration")
            related_scenario_link: URL to related scenario/documentation
        
        Returns:
            bool: True if logging successful, False otherwise
        """
        
        headers = {
            'Authorization': f'Bearer {self.airtable_token}',
            'Content-Type': 'application/json'
        }
        
        # Airtable field mapping (no emojis in field names)
        record_data = {
            "fields": {
                "Integration Name": integration_name,
                "Pass/Fail": pass_fail,
                "Notes / Debug": notes,
                "Test Date": test_date,
                "QA Owner": qa_owner,
                "Output Data Pop...": output_data_populated,
                "Record Created?": record_created,
                "Retry Attempted?": retry_attempted,
                "Module Type": module_type,
                "Related Scenario Link": related_scenario_link
            }
        }
        
        try:
            response = requests.post(
                self.base_url,
                headers=headers,
                data=json.dumps(record_data)
            )
            
            if response.status_code == 200:
                print(f"✅ Logged {integration_name} to Airtable")
                return True
            else:
                print(f"❌ Failed to log {integration_name}: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Error logging {integration_name}: {str(e)}")
            return False
    
    def log_integration_test_to_airtable(
        self,
        integration_name: str,
        success: bool,
        notes: str = "",
        module_type: str = "General",
        scenario_link: str = ""
    ) -> bool:
        """
        Simplified logging function for backward compatibility
        """
        import asyncio
        
        return asyncio.run(self.log_test_result(
            integration_name=integration_name,
            pass_fail="✅" if success else "❌",
            notes=notes,
            test_date=datetime.now().isoformat(),
            qa_owner="YoBot_Test_Runner",
            output_data_populated=success,
            record_created=success,
            retry_attempted=not success,
            module_type=module_type,
            related_scenario_link=scenario_link
        ))
    
    async def log_bulk_results(self, results: list) -> bool:
        """
        Log multiple test results in bulk to Airtable
        
        Args:
            results: List of result dictionaries
        
        Returns:
            bool: True if all logs successful
        """
        
        headers = {
            'Authorization': f'Bearer {self.airtable_token}',
            'Content-Type': 'application/json'
        }
        
        # Prepare bulk records (max 10 per request for Airtable)
        records = []
        for result in results[:10]:  # Limit to 10 records per batch
            records.append({
                "fields": {
                    "Integration Name": result.get('integration_name', 'Unknown'),
                    "Pass/Fail": result.get('pass_fail', '❌'),
                    "Notes / Debug": result.get('notes', ''),
                    "Test Date": result.get('test_date', datetime.now().isoformat()),
                    "QA Owner": result.get('qa_owner', 'YoBot_Test_Runner'),
                    "Output Data Pop...": result.get('output_data_populated', False),
                    "Record Created?": result.get('record_created', False),
                    "Retry Attempted?": result.get('retry_attempted', False),
                    "Module Type": result.get('module_type', 'General'),
                    "Related Scenario Link": result.get('related_scenario_link', '')
                }
            })
        
        bulk_data = {"records": records}
        
        try:
            response = requests.post(
                self.base_url,
                headers=headers,
                data=json.dumps(bulk_data)
            )
            
            if response.status_code == 200:
                print(f"✅ Bulk logged {len(records)} results to Airtable")
                return True
            else:
                print(f"❌ Failed to bulk log: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Error bulk logging: {str(e)}")
            return False
    
    def test_connection(self) -> bool:
        """Test the Airtable connection"""
        headers = {
            'Authorization': f'Bearer {self.airtable_token}',
            'Content-Type': 'application/json'
        }
        
        try:
            # Test with a simple GET request
            response = requests.get(
                f"{self.base_url}?maxRecords=1",
                headers=headers
            )
            
            if response.status_code == 200:
                print("✅ Airtable connection successful")
                return True
            else:
                print(f"❌ Airtable connection failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Airtable connection error: {str(e)}")
            return False

# Global logger instance
logger = IntegrationLogger()

# Helper function for quick logging
def log_test(name: str, success: bool, notes: str = "", module: str = "General") -> bool:
    """Quick helper function for logging test results"""
    return logger.log_integration_test_to_airtable(
        integration_name=name,
        success=success,
        notes=notes,
        module_type=module
    )