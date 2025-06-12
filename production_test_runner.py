#!/usr/bin/env python3
"""
Production Test Runner - Tests actual automation functions and logs real results
Base ID: appbFDTqB2WtRNV1H
Table ID: tbl7K5RthCtD69BE1
"""

import requests
import json
from datetime import datetime
import os
import sys

def log_integration_test_to_airtable(
    integration_name: str,
    passed: bool,
    notes: str = "",
    qa_owner: str = "Tyson Lerfald",
    output_data_populated: bool = True,
    record_created: bool = True,
    retry_attempted: bool = False,
    module_type: str = "Webhook",
    related_scenario_link: str = ""
):
    """
    Log integration test results to production Airtable
    Uses PATCH method for retesting failed functions
    """
    
    api_key = os.getenv('AIRTABLE_PRODUCTION_API_KEY')
    if not api_key:
        print("ERROR: AIRTABLE_PRODUCTION_API_KEY not found")
        return False
    
    base_id = "appbFDTqB2WtRNV1H"
    table_id = "tbl7K5RthCtD69BE1"
    
    # Check if record exists for this integration
    list_url = f"https://api.airtable.com/v0/{base_id}/{table_id}"
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    
    # Search for existing record
    params = {
        'filterByFormula': f"{{Integration Name}} = '{integration_name}'"
    }
    
    try:
        response = requests.get(list_url, headers=headers, params=params)
        response.raise_for_status()
        existing_records = response.json().get('records', [])
        
        # Prepare record data
        record_data = {
            "Integration Name": integration_name,
            "Status": "✅ Passed" if passed else "❌ Failed",
            "Notes": notes,
            "QA Owner": qa_owner,
            "Output Data Populated": output_data_populated,
            "Record Created": record_created,
            "Retry Attempted": retry_attempted,
            "Module Type": module_type,
            "Related Scenario Link": related_scenario_link,
            "Logger Source": "🧠 AI Locked Logger v1.0",
            "Last Tested": datetime.now().isoformat()
        }
        
        if existing_records:
            # PATCH existing record for retesting
            record_id = existing_records[0]['id']
            patch_url = f"{list_url}/{record_id}"
            
            payload = {
                "fields": record_data
            }
            
            response = requests.patch(patch_url, headers=headers, json=payload)
            response.raise_for_status()
            
            print(f"PATCHED: {integration_name} - {'PASSED' if passed else 'FAILED'}")
            return True
            
        else:
            # POST new record
            payload = {
                "fields": record_data
            }
            
            response = requests.post(list_url, headers=headers, json=payload)
            response.raise_for_status()
            
            print(f"CREATED: {integration_name} - {'PASSED' if passed else 'FAILED'}")
            return True
            
    except requests.exceptions.RequestException as e:
        print(f"Airtable API Error: {e}")
        return False
    except Exception as e:
        print(f"Logging Error: {e}")
        return False

def test_function_log_to_crm():
    """Test CRM logging function"""
    try:
        # Import and test actual function
        from function_library import function_log_to_crm
        result = function_log_to_crm()
        
        if result and 'success' in str(result).lower():
            log_integration_test_to_airtable(
                integration_name="CRM Logger",
                passed=True,
                notes="Successfully logged to CRM system",
                module_type="CRM Integration"
            )
            return True
        else:
            log_integration_test_to_airtable(
                integration_name="CRM Logger", 
                passed=False,
                notes=f"CRM logging failed: {result}",
                module_type="CRM Integration"
            )
            return False
            
    except Exception as e:
        log_integration_test_to_airtable(
            integration_name="CRM Logger",
            passed=False,
            notes=f"Exception in CRM test: {str(e)}",
            module_type="CRM Integration"
        )
        return False

def test_function_create_invoice():
    """Test invoice creation function"""
    try:
        from function_library import function_create_invoice
        result = function_create_invoice()
        
        if result and 'created' in str(result).lower():
            log_integration_test_to_airtable(
                integration_name="Invoice Creator",
                passed=True,
                notes="Successfully created invoice",
                module_type="Billing Integration"
            )
            return True
        else:
            log_integration_test_to_airtable(
                integration_name="Invoice Creator",
                passed=False,
                notes=f"Invoice creation failed: {result}",
                module_type="Billing Integration"
            )
            return False
            
    except Exception as e:
        log_integration_test_to_airtable(
            integration_name="Invoice Creator",
            passed=False,
            notes=f"Exception in invoice test: {str(e)}",
            module_type="Billing Integration"
        )
        return False

def test_function_send_slack_notification():
    """Test Slack notification function"""
    try:
        from function_library import function_send_slack_notification
        result = function_send_slack_notification()
        
        if result and 'sent' in str(result).lower():
            log_integration_test_to_airtable(
                integration_name="Slack Notifier",
                passed=True,
                notes="Successfully sent Slack notification",
                module_type="Communication"
            )
            return True
        else:
            log_integration_test_to_airtable(
                integration_name="Slack Notifier",
                passed=False,
                notes=f"Slack notification failed: {result}",
                module_type="Communication"
            )
            return False
            
    except Exception as e:
        log_integration_test_to_airtable(
            integration_name="Slack Notifier",
            passed=False,
            notes=f"Exception in Slack test: {str(e)}",
            module_type="Communication"
        )
        return False

def run_all_tests():
    """Run all function tests and log real results"""
    print("Starting Production Test Runner...")
    print(f"Target: Base {base_id}, Table {table_id}")
    print(f"Timestamp: {datetime.now()}")
    
    test_functions = [
        test_function_log_to_crm,
        test_function_create_invoice,
        test_function_send_slack_notification
    ]
    
    results = {
        'total_tests': len(test_functions),
        'passed': 0,
        'failed': 0
    }
    
    for test_func in test_functions:
        try:
            if test_func():
                results['passed'] += 1
            else:
                results['failed'] += 1
        except Exception as e:
            print(f"Test runner error: {e}")
            results['failed'] += 1
    
    print(f"\nTest Results:")
    print(f"Total: {results['total_tests']}")
    print(f"Passed: {results['passed']}")
    print(f"Failed: {results['failed']}")
    print(f"Success Rate: {(results['passed']/results['total_tests']*100):.1f}%")
    
    return results

if __name__ == "__main__":
    # Set correct base and table IDs
    base_id = "appbFDTqB2WtRNV1H" 
    table_id = "tbl7K5RthCtD69BE1"
    
    run_all_tests()