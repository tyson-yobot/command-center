#!/usr/bin/env python3
"""
Current Airtable Logger - Production Ready
Owner: Tyson Lerfald
Purpose: Standardized Airtable logging function for all automation testing
Date: 2025-06-11

This is the exact logger function being used across all automation files.
Use this function signature and implementation for consistent logging.
"""

import requests
from datetime import datetime
import os


def log_integration_test_to_airtable(
    integration_name: str,
    passed: bool,
    notes: str = "",
    qa_owner: str = "Tyson Lerfald",
    output_data_populated: bool = True,
    record_created: bool = True,
    retry_attempted: bool = False,
    module_type: str = "Automation Test",
    related_scenario_link: str = ""
):
    """
    Production Airtable Logger Function
    
    This function uses PATCH system to update existing records instead of creating duplicates.
    It searches for existing records by integration name and updates them with new test data.
    
    Args:
        integration_name: Name of the automation function being tested
        passed: Boolean indicating if test passed
        notes: Additional notes (will include QA Test # format)
        qa_owner: QA owner (default: Tyson Lerfald)
        output_data_populated: Boolean for output data status
        record_created: Boolean for record creation status
        retry_attempted: Boolean for retry status
        module_type: Type of module being tested
        related_scenario_link: Optional link to related scenario
    
    Returns:
        str: Record ID if successful, None if failed
    """
    
    # Use same configuration as working live_automation_logger.py
    airtable_api_key = "paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa"
    base_id = "appbFDTqB2WtRNV1H"
    table_id = "tbl7K5RthCtD69BE1"
    
    headers = {
        "Authorization": f"Bearer {airtable_api_key}",
        "Content-Type": "application/json"
    }
    
    # Step 1: Search for existing record by integration name
    search_url = f"https://api.airtable.com/v0/{base_id}/{table_id}"
    search_params = {
        "filterByFormula": f"SEARCH('{integration_name}', {{🔧 Integration Name}})"
    }
    
    try:
        search_response = requests.get(search_url, headers=headers, params=search_params)
        existing_records = search_response.json().get('records', [])
        
        # Step 2: Prepare update data with proper QA Test format
        status_emoji = "✅" if passed else "❌"
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Generate QA Test number based on existing pattern
        import random
        qa_test_number = random.randint(1, 100)
        
        # Create notes with QA Test format if not already present
        if "QA Test #" not in notes:
            notes = f"QA Test #{qa_test_number} - {integration_name} execution - {notes}"
        
        update_fields = {
            "🔧 Integration Name": integration_name,
            "✅ Pass/Fail": "✅ Pass" if passed else "❌ Fail",
            "🧠 Notes / Debug": notes,
            "📅 Test Date": datetime.now().isoformat(),
            "🧑‍💻 QA Owner": qa_owner,
            "📤 Output Data Populated": output_data_populated,
            "🗃️ Record Created?": record_created,
            "🔁 Retry Attempted?": retry_attempted,
            "🧩 Module Type": module_type,
            "📂 Related Scenario Link": related_scenario_link
        }
        
        if existing_records:
            # Step 3: Update existing record (PATCH)
            record_id = existing_records[0]['id']
            patch_url = f"https://api.airtable.com/v0/{base_id}/{table_id}/{record_id}"
            
            patch_payload = {
                "fields": update_fields
            }
            
            response = requests.patch(patch_url, headers=headers, json=patch_payload)
            
            if response.status_code == 200:
                print(f"🔄 PATCH LOG: {integration_name} - {record_id}")
                return record_id
            else:
                print(f"❌ Patch failed: {response.status_code}")
                return None
        
        else:
            # Step 4: Create new record if none exists (POST)
            post_url = f"https://api.airtable.com/v0/{base_id}/{table_id}"
            
            post_payload = {
                "fields": update_fields
            }
            
            response = requests.post(post_url, headers=headers, json=post_payload)
            
            if response.status_code in [200, 201]:
                record_id = response.json().get('id', 'Unknown')
                print(f"🆕 NEW LOG: {integration_name} - {record_id}")
                return record_id
            else:
                print(f"❌ Create failed: {response.status_code}")
                return None
                
    except Exception as e:
        print(f"❌ Airtable error: {str(e)}")
        return None


# Example usage for automation functions
def example_automation_function():
    """Example showing how to use the logger in automation functions"""
    
    # Your automation logic here
    success = True  # Replace with actual automation result
    
    # Log the execution
    record_id = log_integration_test_to_airtable(
        integration_name="Example Function",
        passed=success,
        notes="Example automation execution",
        module_type="Automation Test"
    )
    
    if record_id:
        print(f"✅ Example Function logged: {record_id}")
    else:
        print("❌ Logging failed")


if __name__ == "__main__":
    # Test the logger function
    test_record = log_integration_test_to_airtable(
        integration_name="Logger Test",
        passed=True,
        notes="Testing the standardized logger function",
        module_type="System Test"
    )
    
    if test_record:
        print(f"Logger test successful: {test_record}")
    else:
        print("Logger test failed")