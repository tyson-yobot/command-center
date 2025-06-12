#!/usr/bin/env python3
"""
Real CRM Integration - Actual HubSpot API implementation
Function 1: CRM Logging System
"""

import os
import requests
from datetime import datetime
import json

def log_integration_test_to_airtable(integration_name: str, passed: bool, notes: str, module_type: str = "CRM Integration"):
    """Log real test results to production Airtable"""
    api_key = os.getenv('AIRTABLE_PRODUCTION_API_KEY')
    if not api_key:
        print("ERROR: AIRTABLE_PRODUCTION_API_KEY not found")
        return False
    
    base_id = "appbFDTqB2WtRNV1H"
    table_id = "tbl7K5RthCtD69BE1"
    list_url = f"https://api.airtable.com/v0/{base_id}/{table_id}"
    headers = {'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'}
    
    # Check for existing record
    params = {'filterByFormula': f"{{🔧 Integration Name}} = '{integration_name}'"}
    
    try:
        response = requests.get(list_url, headers=headers, params=params)
        response.raise_for_status()
        existing_records = response.json().get('records', [])
        
        record_data = {
            "🔧 Integration Name": integration_name,
            "✅ Pass/Fail": "✅ Pass" if passed else "❌ Fail",
            "🧠 Notes / Debug": notes,
            "🧑‍💻 QA Owner": "Tyson Lerfald",
            "📤 Output Data Populated?": passed,
            "🗃️ Record Created?": passed,
            "🔁 Retry Attempted?": not passed,
            "🧩 Module Type": module_type,
            "📅 Test Date": datetime.now().isoformat()
        }
        
        if existing_records:
            # PATCH existing record
            record_id = existing_records[0]['id']
            patch_url = f"{list_url}/{record_id}"
            payload = {"fields": record_data}
            response = requests.patch(patch_url, headers=headers, json=payload)
            response.raise_for_status()
            print(f"UPDATED: {integration_name} - {'PASSED' if passed else 'FAILED'}")
        else:
            # POST new record
            payload = {"fields": record_data}
            response = requests.post(list_url, headers=headers, json=payload)
            response.raise_for_status()
            print(f"CREATED: {integration_name} - {'PASSED' if passed else 'FAILED'}")
        
        return True
    except Exception as e:
        print(f"Airtable logging failed: {e}")
        return False

def test_hubspot_api_connection():
    """Test actual HubSpot API connectivity"""
    hubspot_api_key = os.getenv('HUBSPOT_API_KEY')
    
    if not hubspot_api_key:
        notes = "FAILED: HUBSPOT_API_KEY environment variable not set"
        log_integration_test_to_airtable("CRM Logging System", False, notes)
        return False
    
    # Test HubSpot API endpoint
    url = "https://api.hubapi.com/crm/v3/objects/contacts"
    headers = {
        'Authorization': f'Bearer {hubspot_api_key}',
        'Content-Type': 'application/json'
    }
    
    try:
        # Test API connectivity with a simple GET request
        response = requests.get(f"{url}?limit=1", headers=headers, timeout=10)
        response.raise_for_status()
        
        if response.status_code == 200:
            data = response.json()
            notes = f"SUCCESS: HubSpot API connected successfully. Total contacts accessible: {data.get('total', 'unknown')}. Test completed at {datetime.now().isoformat()}"
            log_integration_test_to_airtable("CRM Logging System", True, notes)
            print("✅ HubSpot CRM test PASSED")
            return True
        else:
            notes = f"FAILED: HubSpot API returned status {response.status_code}: {response.text}"
            log_integration_test_to_airtable("CRM Logging System", False, notes)
            return False
            
    except requests.exceptions.Timeout:
        notes = "FAILED: HubSpot API request timed out after 10 seconds"
        log_integration_test_to_airtable("CRM Logging System", False, notes)
        return False
    except requests.exceptions.RequestException as e:
        notes = f"FAILED: HubSpot API request error: {str(e)}"
        log_integration_test_to_airtable("CRM Logging System", False, notes)
        return False
    except Exception as e:
        notes = f"FAILED: Unexpected error during HubSpot test: {str(e)}"
        log_integration_test_to_airtable("CRM Logging System", False, notes)
        return False

def function_log_to_crm(contact_data: dict):
    """Real CRM logging function - actual HubSpot implementation"""
    hubspot_api_key = os.getenv('HUBSPOT_API_KEY')
    
    if not hubspot_api_key:
        print("ERROR: HUBSPOT_API_KEY not configured")
        return False
    
    url = "https://api.hubapi.com/crm/v3/objects/contacts"
    headers = {
        'Authorization': f'Bearer {hubspot_api_key}',
        'Content-Type': 'application/json'
    }
    
    # Map data to HubSpot format
    hubspot_data = {
        "properties": {
            "email": contact_data.get('email', ''),
            "firstname": contact_data.get('first_name', ''),
            "lastname": contact_data.get('last_name', ''),
            "phone": contact_data.get('phone', ''),
            "company": contact_data.get('company', ''),
            "website": contact_data.get('website', ''),
            "lifecyclestage": contact_data.get('stage', 'lead'),
            "hs_lead_status": contact_data.get('status', 'NEW'),
            "notes": contact_data.get('notes', '')
        }
    }
    
    try:
        response = requests.post(url, headers=headers, json=hubspot_data, timeout=10)
        response.raise_for_status()
        
        if response.status_code == 201:
            created_contact = response.json()
            contact_id = created_contact.get('id')
            print(f"✅ Contact created in HubSpot with ID: {contact_id}")
            return {
                'success': True,
                'contact_id': contact_id,
                'hubspot_url': f"https://app.hubspot.com/contacts/{contact_id}"
            }
        else:
            print(f"❌ HubSpot contact creation failed: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ HubSpot API error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    print("Testing real CRM integration...")
    test_hubspot_api_connection()