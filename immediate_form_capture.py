#!/usr/bin/env python3
"""
Immediate Form Data Capture
Copy your Tally form submission data here for instant processing
"""

import json
import sys
from datetime import datetime
import subprocess

def process_immediate_submission():
    """Process your actual Tally form submission immediately"""
    
    print("IMMEDIATE FORM DATA PROCESSING")
    print("Paste your Tally form submission data below and press Enter:")
    
    # Get the actual form data from user
    form_input = input().strip()
    
    if not form_input:
        print("No data provided. Please paste your form submission.")
        return
    
    try:
        # Try parsing as JSON first
        form_data = json.loads(form_input)
    except json.JSONDecodeError:
        # If not JSON, treat as company name for quick processing
        form_data = {
            "company_name": form_input,
            "contact_name": "Contact Person",
            "email": "contact@company.com",
            "service_type": "Business Service",
            "project_details": "Submitted via immediate processing",
            "timestamp": datetime.now().isoformat()
        }
    
    # Save the actual submission
    timestamp = int(datetime.now().timestamp() * 1000)
    filename = f"ACTUAL_SUBMISSION_{timestamp}.json"
    
    with open(filename, 'w') as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "source": "immediate_capture",
            "actual_form_data": form_data
        }, f, indent=2)
    
    print(f"Saved actual submission to: {filename}")
    
    # Process with the live processor
    try:
        result = subprocess.run([
            'python3', 'live_tally_processor.py'
        ], input=json.dumps(form_data), text=True, capture_output=True)
        
        print("Processing output:")
        print(result.stdout)
        
        if result.stderr:
            print("Processing errors:")
            print(result.stderr)
            
    except Exception as e:
        print(f"Processing failed: {e}")
    
    return form_data

if __name__ == "__main__":
    process_immediate_submission()