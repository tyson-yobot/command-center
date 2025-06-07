import os
import json
from datetime import datetime

def send_email_with_pdf(to, subject, body, pdf_path):
    """
    Log email details for manual sending instead of failing SMTP
    """
    try:
        # Create email log entry
        email_log = {
            "timestamp": datetime.now().isoformat(),
            "to": to,
            "subject": subject,
            "body": body,
            "pdf_path": pdf_path,
            "status": "logged_for_manual_send"
        }
        
        # Save to email queue file
        with open("email_queue.json", "a") as f:
            f.write(json.dumps(email_log) + "\n")
        
        print(f"Email logged for manual sending: {to}")
        print(f"Subject: {subject}")
        print(f"PDF: {pdf_path}")
        
        return True
        
    except Exception as e:
        print(f"Email logging failed: {e}")
        return False