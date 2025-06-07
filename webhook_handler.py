#!/usr/bin/env python3
import json
import uuid
import sys
from datetime import datetime
from pdf_generator import generate_pdf_from_fields
from send_email import send_email_with_pdf

HIDDEN_FIELD_KEYWORDS = [
    "Multiplier", "Trigger", "Test Mode", "Always On", "First Month Total", "Bot Package Base Price", "Initialize"
]

def is_display_field(field_name):
    return not any(keyword in field_name for keyword in HIDDEN_FIELD_KEYWORDS)

def process_tally_webhook(webhook_data):
    """Process incoming Tally webhook data with clean output"""
    
    submission_id = str(uuid.uuid4())[:8]
    timestamp = datetime.now().isoformat()
    
    # Save complete raw payload for analysis
    raw_payload_file = f"raw_tally_payload_{submission_id}.json"
    with open(raw_payload_file, 'w') as f:
        json.dump({
            "submission_id": submission_id,
            "timestamp": timestamp,
            "complete_raw_data": webhook_data
        }, f, indent=2)
    
    print(f"🎯 Processing Tally submission: {submission_id}")
    print(f"📋 Raw payload saved: {raw_payload_file}")
    
    # Extract fields array from webhook data
    fields_array = []
    
    # Handle different webhook data formats
    if isinstance(webhook_data, dict):
        if 'fields' in webhook_data:
            fields_array = webhook_data['fields']
        elif 'data' in webhook_data and 'fields' in webhook_data['data']:
            fields_array = webhook_data['data']['fields']
        else:
            # Convert flat dict to fields array
            for key, value in webhook_data.items():
                if is_display_field(key):
                    fields_array.append({"name": key, "value": value})
    
    # Generate clean summary for email
    summary_lines = []
    company_name = "Unknown Company"
    contact_email = "admin@yobot.com"
    
    for field in fields_array:
        name = field["name"]
        value = field["value"]
        
        # Skip hidden logic fields
        if not is_display_field(name):
            continue
            
        # Extract key info
        if "company" in name.lower() or "business" in name.lower():
            company_name = value
        elif "email" in name.lower():
            contact_email = value
            
        summary_lines.append(f"{name}\n{value}\n")
    
    # Generate PDF and save to folder
    try:
        pdf_path = generate_pdf_from_fields(submission_id, fields_array)
        print(f"📄 PDF generated: {pdf_path}")
    except Exception as e:
        print(f"❌ PDF generation failed: {e}")
        pdf_path = None
    
    # Send clean email with PDF attachment
    email_body = f"""
New YoBot Sales Order Submission

Submission ID: {submission_id}
Company: {company_name}
Timestamp: {timestamp}

Details:
{''.join(summary_lines)}

PDF attached with complete submission details.
"""
    
    if pdf_path:
        try:
            email_sent = send_email_with_pdf(
                to=contact_email,
                subject=f"YoBot Order - {company_name} ({submission_id})",
                body=email_body,
                pdf_path=pdf_path
            )
            print(f"📧 Email sent: {email_sent}")
        except Exception as e:
            print(f"❌ Email sending failed: {e}")
    
    # Save processing log
    log_data = {
        "submission_id": submission_id,
        "timestamp": timestamp,
        "company_name": company_name,
        "contact_email": contact_email,
        "pdf_path": pdf_path,
        "fields_processed": len([f for f in fields_array if is_display_field(f["name"])]),
        "fields_hidden": len([f for f in fields_array if not is_display_field(f["name"])]),
        "status": "processed"
    }
    
    log_file = f"processing_logs/submission_{submission_id}.json"
    import os
    os.makedirs("processing_logs", exist_ok=True)
    
    with open(log_file, 'w') as f:
        json.dump(log_data, f, indent=2)
    
    print(f"📋 Processing complete: {submission_id}")
    print(f"📁 Folder: submissions/{submission_id}")
    print(f"📄 PDF: {pdf_path}")
    print(f"📧 Email: {contact_email}")
    
    return {
        "success": True,
        "submission_id": submission_id,
        "pdf_path": pdf_path,
        "company_name": company_name,
        "timestamp": timestamp
    }

if __name__ == "__main__":
    # Read webhook data from stdin
    try:
        webhook_data = json.loads(sys.stdin.read())
        result = process_tally_webhook(webhook_data)
        print(json.dumps(result))
    except Exception as e:
        print(f"Error processing webhook: {e}")
        sys.exit(1)