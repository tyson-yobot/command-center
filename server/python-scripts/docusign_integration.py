#!/usr/bin/env python3
"""
DocuSign Integration from Your 8-Day Code
Implements signature request and document archiving functionality
"""

import os, requests, base64, json
from datetime import datetime

def send_docusign_signature(client_email, client_name, pdf_path, company_name):
    """Send DocuSign signature request from your code"""
    
    # Check for DocuSign credentials
    docusign_token = os.getenv('DOCUSIGN_ACCESS_TOKEN')
    account_id = os.getenv('DOCUSIGN_ACCOUNT_ID')
    
    if not docusign_token or not account_id:
        return {
            'success': False,
            'error': 'DocuSign credentials required (DOCUSIGN_ACCESS_TOKEN, DOCUSIGN_ACCOUNT_ID)',
            'setup_needed': True
        }
    
    try:
        url = f"https://demo.docusign.net/restapi/v2.1/accounts/{account_id}/envelopes"
        
        headers = {
            "Authorization": f"Bearer {docusign_token}",
            "Content-Type": "application/json"
        }
        
        # Read and encode PDF
        with open(pdf_path, "rb") as file:
            file_bytes = file.read()
            file_base64 = base64.b64encode(file_bytes).decode()
        
        envelope_data = {
            "emailSubject": f"Please sign the YoBot Quote - {company_name}",
            "documents": [{
                "documentBase64": file_base64,
                "name": f"{company_name} Quote",
                "fileExtension": "pdf",
                "documentId": "1"
            }],
            "recipients": {
                "signers": [{
                    "email": client_email,
                    "name": client_name,
                    "recipientId": "1",
                    "routingOrder": "1",
                    "tabs": {
                        "signHereTabs": [{
                            "anchorString": "/sig1/",
                            "anchorUnits": "pixels",
                            "anchorYOffset": "10",
                            "anchorXOffset": "20"
                        }]
                    }
                }]
            },
            "status": "sent"
        }
        
        response = requests.post(url, headers=headers, json=envelope_data)
        
        if response.status_code == 201:
            envelope_id = response.json().get('envelopeId')
            print(f"✅ DocuSign envelope sent: {envelope_id}")
            return {
                'success': True,
                'envelope_id': envelope_id,
                'signing_url': f"https://demo.docusign.net/signing/{envelope_id}",
                'status': 'sent'
            }
        else:
            print(f"❌ DocuSign request failed: {response.status_code}")
            return {
                'success': False,
                'error': f"DocuSign API error: {response.status_code}",
                'response': response.text
            }
            
    except Exception as e:
        print(f"❌ DocuSign error: {e}")
        return {
            'success': False,
            'error': str(e)
        }

def check_docusign_status(envelope_id):
    """Check DocuSign envelope status"""
    
    docusign_token = os.getenv('DOCUSIGN_ACCESS_TOKEN')
    account_id = os.getenv('DOCUSIGN_ACCOUNT_ID')
    
    if not docusign_token or not account_id:
        return {'success': False, 'error': 'DocuSign credentials required'}
    
    try:
        url = f"https://demo.docusign.net/restapi/v2.1/accounts/{account_id}/envelopes/{envelope_id}"
        headers = {"Authorization": f"Bearer {docusign_token}"}
        
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            status_data = response.json()
            return {
                'success': True,
                'status': status_data.get('status'),
                'completed_date': status_data.get('completedDateTime'),
                'envelope_id': envelope_id
            }
        else:
            return {
                'success': False,
                'error': f"Status check failed: {response.status_code}"
            }
            
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def test_docusign_integration():
    """Test DocuSign integration"""
    print("🔍 Testing DocuSign integration...")
    
    # Check credentials
    docusign_token = os.getenv('DOCUSIGN_ACCESS_TOKEN')
    account_id = os.getenv('DOCUSIGN_ACCOUNT_ID')
    
    if not docusign_token or not account_id:
        print("⚠️ DocuSign credentials not configured")
        return {
            'success': False,
            'error': 'DocuSign credentials required',
            'setup_needed': True
        }
    
    print("✅ DocuSign credentials found")
    return {
        'success': True,
        'credentials_configured': True
    }

if __name__ == "__main__":
    test_docusign_integration()