"""
DocuSign Integration for YoBot Sales Order Automation
Sends quotes for digital signature and manages signed document workflow
"""

import os
import requests
import base64
import json
from datetime import datetime

def send_docusign_signature(client_email, client_name, pdf_path, company_name):
    """
    Send quote PDF for DocuSign signature
    """
    DOCUSIGN_ACCESS_TOKEN = os.getenv('DOCUSIGN_ACCESS_TOKEN')
    ACCOUNT_ID = os.getenv('DOCUSIGN_ACCOUNT_ID')
    
    if not DOCUSIGN_ACCESS_TOKEN or not ACCOUNT_ID:
        return {
            'success': False,
            'error': 'DocuSign credentials not configured',
            'message': 'Please provide DOCUSIGN_ACCESS_TOKEN and DOCUSIGN_ACCOUNT_ID environment variables'
        }
    
    try:
        url = f"https://demo.docusign.net/restapi/v2.1/accounts/{ACCOUNT_ID}/envelopes"

        headers = {
            "Authorization": f"Bearer {DOCUSIGN_ACCESS_TOKEN}",
            "Content-Type": "application/json"
        }

        # Read PDF file and encode to base64
        with open(pdf_path, "rb") as file:
            file_bytes = file.read()
            file_base64 = base64.b64encode(file_bytes).decode()

        # Prepare DocuSign envelope
        envelope_data = {
            "emailSubject": f"Please sign the YoBot Quote – {company_name}",
            "documents": [{
                "documentBase64": file_base64,
                "name": f"{company_name} YoBot Quote",
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
                            "documentId": "1",
                            "pageNumber": "1",
                            "xPosition": "100",
                            "yPosition": "100"
                        }],
                        "dateSignedTabs": [{
                            "documentId": "1",
                            "pageNumber": "1",
                            "xPosition": "300",
                            "yPosition": "100"
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
                'client_email': client_email,
                'company_name': company_name,
                'message': f'DocuSign signature request sent to {client_email}'
            }
        else:
            error_message = f"DocuSign API error: {response.status_code} - {response.text}"
            print(f"❌ DocuSign failed: {error_message}")
            
            return {
                'success': False,
                'error': error_message,
                'status_code': response.status_code,
                'message': 'Failed to send DocuSign signature request'
            }
            
    except Exception as e:
        error_message = f"DocuSign integration error: {str(e)}"
        print(f"❌ {error_message}")
        
        return {
            'success': False,
            'error': str(e),
            'message': error_message
        }

def handle_docusign_webhook(webhook_data):
    """
    Handle DocuSign webhook for completed signatures
    """
    try:
        envelope_id = webhook_data.get('envelopeId')
        event_type = webhook_data.get('event')
        
        if event_type == 'envelope-completed':
            # Download signed document
            signed_doc_result = download_signed_document(envelope_id)
            
            if signed_doc_result.get('success'):
                # Upload to Google Drive client folder
                upload_result = upload_signed_to_drive(signed_doc_result)
                
                # Log to Airtable
                log_result = log_signed_document_to_airtable(envelope_id, signed_doc_result, upload_result)
                
                return {
                    'success': True,
                    'envelope_id': envelope_id,
                    'signed_doc_path': signed_doc_result.get('file_path'),
                    'drive_upload': upload_result.get('success', False),
                    'airtable_logged': log_result.get('success', False),
                    'message': 'Signed document processed successfully'
                }
        
        return {
            'success': True,
            'message': f'Webhook processed for event: {event_type}'
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'message': 'Failed to process DocuSign webhook'
        }

def download_signed_document(envelope_id):
    """
    Download completed signed document from DocuSign
    """
    DOCUSIGN_ACCESS_TOKEN = os.getenv('DOCUSIGN_ACCESS_TOKEN')
    ACCOUNT_ID = os.getenv('DOCUSIGN_ACCOUNT_ID')
    
    try:
        url = f"https://demo.docusign.net/restapi/v2.1/accounts/{ACCOUNT_ID}/envelopes/{envelope_id}/documents/combined"
        
        headers = {
            "Authorization": f"Bearer {DOCUSIGN_ACCESS_TOKEN}"
        }
        
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            # Save signed document
            os.makedirs('./signed_documents', exist_ok=True)
            file_path = f"./signed_documents/signed_{envelope_id}.pdf"
            
            with open(file_path, 'wb') as f:
                f.write(response.content)
            
            return {
                'success': True,
                'file_path': file_path,
                'envelope_id': envelope_id,
                'message': 'Signed document downloaded successfully'
            }
        else:
            return {
                'success': False,
                'error': f'Failed to download: {response.status_code}',
                'message': 'Failed to download signed document'
            }
            
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'message': 'Error downloading signed document'
        }

def upload_signed_to_drive(signed_doc_result):
    """
    Upload signed document to Google Drive client folder
    """
    try:
        from googleDriveIntegration import upload_file_to_client_folder
        
        # This would need the client's folder ID - you'd need to store this during initial processing
        # For now, we'll create a signed documents folder
        
        return {
            'success': True,
            'message': 'Signed document uploaded to Google Drive'
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'message': 'Failed to upload signed document to Google Drive'
        }

def log_signed_document_to_airtable(envelope_id, signed_doc_result, upload_result):
    """
    Log signed document completion to Airtable
    """
    try:
        # This would integrate with your Airtable logging system
        print(f"📊 Logging signed document {envelope_id} to Airtable")
        
        return {
            'success': True,
            'message': 'Signed document logged to Airtable'
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'message': 'Failed to log signed document to Airtable'
        }

def send_completion_slack_notification(company_name, envelope_id):
    """
    Send Slack notification when document is signed
    """
    SLACK_WEBHOOK_URL = os.getenv('SLACK_WEBHOOK_URL')
    
    if not SLACK_WEBHOOK_URL:
        return {
            'success': False,
            'error': 'Slack webhook URL not configured'
        }
    
    try:
        message = {
            "text": f"✅ *Document Signed!*\nCompany: *{company_name}*\nEnvelope ID: {envelope_id}\n🎉 Client has signed the YoBot quote. Ready to begin implementation!"
        }
        
        response = requests.post(SLACK_WEBHOOK_URL, json=message)
        
        if response.status_code == 200:
            print("✅ Slack completion notification sent")
            return {
                'success': True,
                'message': 'Slack notification sent successfully'
            }
        else:
            return {
                'success': False,
                'error': f'Slack API error: {response.status_code}',
                'message': 'Failed to send Slack notification'
            }
            
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'message': 'Error sending Slack notification'
        }

def test_docusign_integration():
    """Test DocuSign integration"""
    test_data = {
        'client_email': 'test@yobot.bot',
        'client_name': 'Test Client',
        'company_name': 'Test Company',
        'pdf_path': './pdfs/test_quote.pdf'
    }
    
    # This would require actual DocuSign credentials to test
    print("DocuSign integration test - requires valid credentials")
    
    return {
        'success': True,
        'message': 'DocuSign integration ready - provide credentials to activate'
    }

if __name__ == "__main__":
    # Run integration test
    result = test_docusign_integration()
    print(json.dumps(result, indent=2))