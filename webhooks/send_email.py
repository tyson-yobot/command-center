#!/usr/bin/env python3
"""
Email Handler for Tally Form Submissions
Logs email details for manual sending
"""
import json
import os
from datetime import datetime

def send_email_with_pdf(recipient_email, subject, pdf_path, company_name="Unknown Company"):
    """Log email details and send to tyson@yobot.bot"""
    
    # Create emails directory if it doesn't exist
    emails_dir = "../emails"
    os.makedirs(emails_dir, exist_ok=True)
    
    # Always send to tyson@yobot.bot for YoBot orders
    tyson_email = "tyson@yobot.bot"
    
    # Email details
    email_data = {
        "timestamp": datetime.now().isoformat(),
        "original_recipient": recipient_email,
        "actual_recipient": tyson_email,
        "subject": subject,
        "pdf_attachment": pdf_path,
        "company": company_name,
        "status": "ready_for_tyson",
        "body": f"""
New YoBot Sales Order Submission

Company: {company_name}
Original Contact: {recipient_email}
PDF Attachment: {pdf_path}
Timestamp: {datetime.now().isoformat()}

This order has been automatically processed and organized.
PDF contains complete submission details.
        """
    }
    
    # Save email log
    email_filename = f"{emails_dir}/email_{int(datetime.now().timestamp())}.json"
    with open(email_filename, 'w') as f:
        json.dump(email_data, f, indent=2)
    
    print(f"Email prepared for: {tyson_email}")
    print(f"Company: {company_name}")
    print(f"Subject: {subject}")
    print(f"PDF: {pdf_path}")
    
    return True

if __name__ == "__main__":
    # Test email logging
    send_email_with_pdf("test@example.com", "Test Subject", "test.pdf", "Test Company")