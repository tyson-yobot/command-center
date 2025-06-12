#!/usr/bin/env python3
"""
Real Email Integration - Actual SendGrid API implementation
Function 4: Email Receipt System
"""

import os
import requests
from datetime import datetime
import json

def log_integration_test_to_airtable(integration_name: str, passed: bool, notes: str, module_type: str = "Email System"):
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

def test_sendgrid_api_connection():
    """Test actual SendGrid API connectivity"""
    sendgrid_api_key = os.getenv('SENDGRID_API_KEY')
    
    if not sendgrid_api_key:
        notes = "FAILED: SENDGRID_API_KEY environment variable not set"
        log_integration_test_to_airtable("Email Receipt System", False, notes)
        return False
    
    # Test SendGrid API endpoint
    url = "https://api.sendgrid.com/v3/user/profile"
    headers = {
        'Authorization': f'Bearer {sendgrid_api_key}',
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        if response.status_code == 200:
            data = response.json()
            user_email = data.get('email', 'unknown')
            notes = f"SUCCESS: SendGrid API connected successfully. Account email: {user_email}. Test completed at {datetime.now().isoformat()}"
            log_integration_test_to_airtable("Email Receipt System", True, notes)
            print("✅ SendGrid Email test PASSED")
            return True
        else:
            notes = f"FAILED: SendGrid API returned status {response.status_code}: {response.text}"
            log_integration_test_to_airtable("Email Receipt System", False, notes)
            return False
            
    except requests.exceptions.Timeout:
        notes = "FAILED: SendGrid API request timed out after 10 seconds"
        log_integration_test_to_airtable("Email Receipt System", False, notes)
        return False
    except requests.exceptions.RequestException as e:
        notes = f"FAILED: SendGrid API request error: {str(e)}"
        log_integration_test_to_airtable("Email Receipt System", False, notes)
        return False
    except Exception as e:
        notes = f"FAILED: Unexpected error during SendGrid test: {str(e)}"
        log_integration_test_to_airtable("Email Receipt System", False, notes)
        return False

def function_send_email_receipt(email_data: dict):
    """Real email sending function - actual SendGrid implementation"""
    sendgrid_api_key = os.getenv('SENDGRID_API_KEY')
    
    if not sendgrid_api_key:
        print("ERROR: SENDGRID_API_KEY not configured")
        return False
    
    url = "https://api.sendgrid.com/v3/mail/send"
    headers = {
        'Authorization': f'Bearer {sendgrid_api_key}',
        'Content-Type': 'application/json'
    }
    
    # Construct email payload
    email_payload = {
        "personalizations": [
            {
                "to": [
                    {
                        "email": email_data.get('to_email'),
                        "name": email_data.get('to_name', '')
                    }
                ],
                "subject": email_data.get('subject', 'YoBot Receipt')
            }
        ],
        "from": {
            "email": email_data.get('from_email', 'noreply@yobot.bot'),
            "name": email_data.get('from_name', 'YoBot')
        },
        "content": [
            {
                "type": "text/html",
                "value": email_data.get('html_content', email_data.get('content', ''))
            }
        ]
    }
    
    # Add reply-to if specified
    if email_data.get('reply_to'):
        email_payload["reply_to"] = {
            "email": email_data.get('reply_to'),
            "name": email_data.get('reply_to_name', '')
        }
    
    try:
        response = requests.post(url, headers=headers, json=email_payload, timeout=10)
        response.raise_for_status()
        
        if response.status_code == 202:  # SendGrid returns 202 for accepted
            print(f"✅ Email sent successfully via SendGrid")
            return {
                'success': True,
                'message_id': response.headers.get('X-Message-Id'),
                'timestamp': datetime.now().isoformat(),
                'to_email': email_data.get('to_email')
            }
        else:
            print(f"❌ SendGrid email failed: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ SendGrid API error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    print("Testing real Email integration...")
    test_sendgrid_api_connection()