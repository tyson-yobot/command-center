#!/usr/bin/env python3
"""
Manual Form Data Processor
Process Tally form data directly when webhook fails
"""

import json
import sys
from datetime import datetime
import os

def process_manual_form_data(form_data):
    """Process form data manually when webhook fails"""
    
    print("=" * 60)
    print("MANUAL FORM DATA PROCESSING")
    print("=" * 60)
    
    # Save the manual submission
    timestamp = int(datetime.now().timestamp() * 1000)
    filename = f"MANUAL_TALLY_{timestamp}.json"
    
    with open(filename, 'w') as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "source": "manual_processing",
            "form_data": form_data
        }, f, indent=2)
    
    print(f"Form data saved to: {filename}")
    
    # Extract key fields
    company_name = form_data.get('company_name', 'Unknown Company')
    contact_name = form_data.get('contact_name', 'Unknown Contact')
    email = form_data.get('email', 'no-email@provided.com')
    service_type = form_data.get('service_type', 'General Service')
    
    print(f"Processing order for: {company_name}")
    print(f"Contact: {contact_name}")
    print(f"Email: {email}")
    print(f"Service: {service_type}")
    
    # Generate quote number
    from datetime import datetime
    date_str = datetime.now().strftime("%Y%m%d")
    company_code = company_name[:3].upper().replace(' ', '')
    quote_id = f"YQ-{date_str}-{company_code}"
    
    print(f"Quote ID: {quote_id}")
    
    # Create folder structure
    folder_name = f"{company_name}_{quote_id}"
    safe_folder_name = "".join(c for c in folder_name if c.isalnum() or c in (' ', '-', '_')).rstrip()
    folder_path = f"./client_folders/{safe_folder_name}"
    
    os.makedirs(folder_path, exist_ok=True)
    os.makedirs(f"{folder_path}/documents", exist_ok=True)
    os.makedirs(f"{folder_path}/images", exist_ok=True)
    os.makedirs(f"{folder_path}/contracts", exist_ok=True)
    
    print(f"Created folder: {folder_path}")
    
    # Create basic PDF
    pdf_filename = f"./pdfs/YoBot_Quote_{quote_id}_{company_name.replace(' ', '_')}.pdf"
    os.makedirs("./pdfs", exist_ok=True)
    
    # Simple text-based PDF content
    with open(pdf_filename.replace('.pdf', '.txt'), 'w') as f:
        f.write(f"""
YoBot Sales Order Quote
======================

Quote Number: {quote_id}
Date: {datetime.now().strftime('%Y-%m-%d')}
Company: {company_name}
Contact: {contact_name}
Email: {email}
Service Type: {service_type}

Project Details:
{form_data.get('project_details', 'No details provided')}

Status: Generated from Manual Processing
""")
    
    print(f"Created document: {pdf_filename.replace('.pdf', '.txt')}")
    
    # Save to manual processing log
    manual_log = {
        "quote_id": quote_id,
        "company_name": company_name,
        "contact_name": contact_name,
        "email": email,
        "service_type": service_type,
        "folder_path": folder_path,
        "document_path": pdf_filename.replace('.pdf', '.txt'),
        "processed_timestamp": datetime.now().isoformat(),
        "status": "manually_processed"
    }
    
    manual_log_file = f"manual_processing_log_{timestamp}.json"
    with open(manual_log_file, 'w') as f:
        json.dump(manual_log, f, indent=2)
    
    print("=" * 60)
    print("MANUAL PROCESSING COMPLETE")
    print("=" * 60)
    print(f"Quote Number: {quote_id}")
    print(f"Folder: {folder_path}")
    print(f"Document: {pdf_filename.replace('.pdf', '.txt')}")
    print(f"Log: {manual_log_file}")
    
    return manual_log

def get_user_input():
    """Get form data from user input"""
    
    print("Enter your Tally form data:")
    print("(Press Enter twice when finished)")
    
    lines = []
    while True:
        line = input()
        if line == "" and len(lines) > 0 and lines[-1] == "":
            break
        lines.append(line)
    
    # Try to parse as JSON first
    full_input = "\n".join(lines).strip()
    
    try:
        return json.loads(full_input)
    except json.JSONDecodeError:
        # Parse as key-value pairs
        form_data = {}
        for line in lines:
            if line.strip() and ':' in line:
                key, value = line.split(':', 1)
                form_data[key.strip().lower().replace(' ', '_')] = value.strip()
        return form_data

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Process from command line argument
        try:
            form_data = json.loads(sys.argv[1])
            process_manual_form_data(form_data)
        except json.JSONDecodeError:
            print("Invalid JSON provided")
    else:
        # Interactive mode
        form_data = get_user_input()
        if form_data:
            process_manual_form_data(form_data)
        else:
            print("No form data provided")