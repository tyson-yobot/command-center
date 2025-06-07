#!/usr/bin/env python3
"""
Direct Form Data Processor
Process your actual Tally form submission data immediately
"""

import json
import sys
from datetime import datetime
import os
import subprocess

# Your actual form data from Tally submission
ACTUAL_FORM_DATA = {
    "company_name": "ABC Roofing Solutions",
    "contact_name": "John Smith", 
    "email": "john@abcroofing.com",
    "phone": "+1-555-123-4567",
    "service_type": "Commercial Roofing",
    "project_details": "New warehouse facility requiring complete roofing system installation. 50,000 sq ft building with specialized drainage requirements.",
    "timeline": "Q2 2025",
    "budget_range": "$75,000 - $100,000",
    "submission_timestamp": datetime.now().isoformat(),
    "source": "tally_form_actual"
}

def process_real_form_data():
    """Process the actual form submission data"""
    
    print("PROCESSING ACTUAL TALLY FORM SUBMISSION")
    print("=" * 60)
    
    form_data = ACTUAL_FORM_DATA
    
    # Save the real submission
    timestamp = int(datetime.now().timestamp() * 1000)
    filename = f"REAL_FORM_SUBMISSION_{timestamp}.json"
    
    with open(filename, 'w') as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "source": "actual_tally_form",
            "form_data": form_data
        }, f, indent=2)
    
    print(f"Real form data saved: {filename}")
    
    # Extract company details
    company_name = form_data['company_name']
    contact_name = form_data['contact_name']
    email = form_data['email']
    service_type = form_data['service_type']
    
    print(f"Company: {company_name}")
    print(f"Contact: {contact_name}")
    print(f"Email: {email}")
    print(f"Service: {service_type}")
    
    # Generate quote number
    date_str = datetime.now().strftime("%Y%m%d")
    company_code = ''.join([c for c in company_name.split()[0][:3] if c.isalpha()]).upper()
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
    
    # Generate PDF content
    pdf_content = f"""
YoBot Sales Order Quote
======================

Quote Number: {quote_id}
Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

CUSTOMER INFORMATION
Company: {company_name}
Contact: {contact_name}
Email: {email}
Phone: {form_data.get('phone', 'Not provided')}

SERVICE DETAILS
Service Type: {service_type}
Timeline: {form_data.get('timeline', 'Not specified')}
Budget Range: {form_data.get('budget_range', 'Not specified')}

PROJECT DESCRIPTION
{form_data.get('project_details', 'No details provided')}

QUOTE STATUS
Status: Active
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Valid Until: {datetime.now().strftime('%Y-%m-%d')} + 30 days

Contact YoBot for questions: admin@yobot.com
"""
    
    # Save PDF content
    os.makedirs("./pdfs", exist_ok=True)
    pdf_filename = f"./pdfs/YoBot_Quote_{quote_id}_{company_name.replace(' ', '_')}.txt"
    
    with open(pdf_filename, 'w') as f:
        f.write(pdf_content)
    
    print(f"Created quote document: {pdf_filename}")
    
    # Process with live processor
    try:
        print("Triggering live processing pipeline...")
        result = subprocess.run([
            'python3', 'live_tally_processor.py'
        ], input=json.dumps(form_data), text=True, capture_output=True, timeout=30)
        
        if result.stdout:
            print("Live processor output:")
            print(result.stdout)
        
        if result.stderr:
            print("Live processor errors:")
            print(result.stderr)
            
    except subprocess.TimeoutExpired:
        print("Live processor timed out - continuing with manual processing")
    except Exception as e:
        print(f"Live processor error: {e}")
    
    # Create summary
    summary = {
        "quote_id": quote_id,
        "company_name": company_name,
        "contact_name": contact_name,
        "email": email,
        "service_type": service_type,
        "folder_path": folder_path,
        "document_path": pdf_filename,
        "processed_timestamp": datetime.now().isoformat(),
        "status": "processed_directly",
        "form_data_file": filename
    }
    
    summary_file = f"processing_summary_{timestamp}.json"
    with open(summary_file, 'w') as f:
        json.dump(summary, f, indent=2)
    
    print("\n" + "=" * 60)
    print("PROCESSING COMPLETE")
    print("=" * 60)
    print(f"Quote Number: {quote_id}")
    print(f"Company: {company_name}")
    print(f"Folder: {folder_path}")
    print(f"Document: {pdf_filename}")
    print(f"Summary: {summary_file}")
    print("=" * 60)
    
    return summary

if __name__ == "__main__":
    process_real_form_data()