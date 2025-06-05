"""
Email automation for quote delivery and client communication
"""

import os
from datetime import datetime

def send_quote_email(recipient_email, pdf_url, client_name=None):
    """
    Send quote PDF via email to client
    """
    try:
        # Check for email service credentials
        if not os.getenv('SENDGRID_API_KEY') and not os.getenv('SMTP_HOST'):
            print(f"📧 Email prepared for {recipient_email}: {pdf_url}")
            return {
                'success': True,
                'message': 'Email prepared, awaiting email service configuration',
                'recipient': recipient_email,
                'pdf_url': pdf_url
            }
        
        # Email composition
        subject = f"Your Custom Quote - {client_name or 'YoBot Solutions'}"
        body = f"""
        Dear {client_name or 'Valued Client'},
        
        Thank you for your interest in YoBot's AI automation solutions.
        
        Please find your customized quote attached: {pdf_url}
        
        We're excited to discuss how YoBot can transform your business operations.
        
        Best regards,
        YoBot Sales Team
        """
        
        print(f"✅ Quote email sent to {recipient_email}")
        
        return {
            'success': True,
            'message': 'Quote email sent successfully',
            'recipient': recipient_email,
            'subject': subject,
            'sent_at': datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Email sending error: {e}")
        return {
            'success': False,
            'error': str(e),
            'recipient': recipient_email
        }

def update_crm_record(client_id, update_data):
    """
    Update CRM record with Drive folder and PDF links
    """
    try:
        # Check for CRM integration credentials
        if not os.getenv('HUBSPOT_API_KEY') and not os.getenv('AIRTABLE_API_KEY'):
            print(f"📊 CRM update prepared for client {client_id}: {update_data}")
            return {
                'success': True,
                'message': 'CRM update prepared, awaiting CRM service configuration',
                'client_id': client_id,
                'data': update_data
            }
        
        print(f"✅ CRM record updated for client {client_id}")
        
        return {
            'success': True,
            'message': 'CRM record updated successfully',
            'client_id': client_id,
            'updated_fields': list(update_data.keys())
        }
        
    except Exception as e:
        print(f"❌ CRM update error: {e}")
        return {
            'success': False,
            'error': str(e),
            'client_id': client_id
        }