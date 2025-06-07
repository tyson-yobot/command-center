#!/usr/bin/env python3
"""
Email Handler for Tally Form Submissions
Logs email details for manual sending
"""
import json
import os
from datetime import datetime

def send_email_with_pdf(recipient_email, subject, pdf_path, company_name="Unknown Company"):
    """Log email details for manual sending"""
    
    # Create emails directory if it doesn't exist
    emails_dir = "../emails"
    os.makedirs(emails_dir, exist_ok=True)
    
    # Email details
    email_data = {
        "timestamp": datetime.now().isoformat(),
        "to": recipient_email,
        "subject": subject,
        "pdf_attachment": pdf_path,
        "company": company_name,
        "status": "logged_for_manual_send"
    }
    
    # Save email log
    email_filename = f"{emails_dir}/email_{int(datetime.now().timestamp())}.json"
    with open(email_filename, 'w') as f:
        json.dump(email_data, f, indent=2)
    
    print(f"Email logged for manual sending: {recipient_email}")
    print(f"Subject: {subject}")
    print(f"PDF: {pdf_path}")
    
    return True

if __name__ == "__main__":
    # Test email logging
    send_email_with_pdf("test@example.com", "Test Subject", "test.pdf", "Test Company")