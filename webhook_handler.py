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

def is_authentic_tally_submission(webhook_data):
    """Validate that this is a real Tally form submission"""
    
    # Require authentic Tally webhook structure
    if not isinstance(webhook_data, dict):
        return False
        
    # Must have eventType from Tally
    if webhook_data.get('eventType') != 'FORM_RESPONSE':
        return False
        
    # Must have real Tally event ID format
    event_id = webhook_data.get('eventId', '')
    if not event_id or not event_id.startswith('evt_'):
        return False
        
    return True

def process_tally_webhook(webhook_data):
    """Process authentic Tally webhook data only"""
    
    # Validate authentic submission
    if not is_authentic_tally_submission(webhook_data):
        print("❌ BLOCKED: Invalid submission format")
        return {"error": "Invalid submission format"}
    
    submission_id = str(uuid.uuid4())[:8]
    timestamp = datetime.now().isoformat()
    
    # Save complete raw payload
    raw_payload_file = f"tally_submission_{submission_id}.json"
    with open(raw_payload_file, 'w') as f:
        json.dump({
            "submission_id": submission_id,
            "timestamp": timestamp,
            "tally_data": webhook_data
        }, f, indent=2)
    
    print(f"✅ Processing Tally submission: {submission_id}")
    print(f"📋 Payload saved: {raw_payload_file}")
    
    # Extract fields array from webhook data
    fields_array = []
    
    # Handle different webhook data formats - prioritize rich field structure
    if isinstance(webhook_data, dict):
        # First check for Tally's rich field structure in data.fields
        if 'data' in webhook_data and 'fields' in webhook_data['data']:
            for field in webhook_data['data']['fields']:
                if is_display_field(field.get('label', field.get('key', ''))):
                    fields_array.append({
                        "name": field.get('label', field.get('key', 'Unknown Field')),
                        "value": field.get('value', ''),
                        "type": field.get('type', 'TEXT')
                    })
        # Fallback to direct fields array
        elif 'fields' in webhook_data:
            fields_array = webhook_data['fields']
        else:
            # Convert flat dict to fields array (last resort)
            for key, value in webhook_data.items():
                if is_display_field(key) and key not in ['data', 'eventId', 'eventType', 'createdAt']:
                    fields_array.append({"name": key, "value": value})
    
    # Generate clean summary for email
    summary_lines = []
    company_name = "Unknown Company"
    contact_email = "admin@yobot.com"
    
    for field in fields_array:
        name = field.get("name", "")
        value = field.get("value", "")
        field_type = field.get("type", "TEXT")
        
        # Skip hidden logic fields
        if not is_display_field(name):
            continue
            
        # Format array values properly
        if isinstance(value, list):
            value = ", ".join(str(v) for v in value)
            
        # Extract key info with better matching
        name_lower = name.lower()
        if "company" in name_lower or "business" in name_lower:
            company_name = value
        elif "email" in name_lower or field_type == "INPUT_EMAIL":
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