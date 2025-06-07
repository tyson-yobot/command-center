#!/usr/bin/env python3
import json
import os
import glob
from datetime import datetime

def show_latest_tally_data():
    """Show the actual payload data from the latest Tally submission"""
    
    # Look for recent payload files
    payload_files = glob.glob("tally_payload_*.json")
    
    if payload_files:
        # Get the most recent one
        latest_file = max(payload_files, key=os.path.getctime)
        print(f"=== LATEST TALLY PAYLOAD: {latest_file} ===")
        
        with open(latest_file, 'r') as f:
            data = json.load(f)
        
        print(f"Timestamp: {data.get('timestamp')}")
        print(f"URL: {data.get('url')}")
        print("\nRAW PAYLOAD DATA:")
        print(json.dumps(data.get('raw_payload', {}), indent=2))
        
        return data.get('raw_payload', {})
    
    # Fallback: check processing logs for field information
    log_files = glob.glob("processing_logs/submission_*.json")
    if log_files:
        latest_log = max(log_files, key=os.path.getctime)
        print(f"=== PROCESSING LOG: {latest_log} ===")
        
        with open(latest_log, 'r') as f:
            log_data = json.load(f)
        
        print(json.dumps(log_data, indent=2))
        return log_data
    
    # Check webhook handler for recent raw captures
    try:
        import subprocess
        result = subprocess.run(['python3', 'webhook_handler.py', '--show-last'], 
                              capture_output=True, text=True)
        if result.stdout:
            print("=== WEBHOOK HANDLER OUTPUT ===")
            print(result.stdout)
    except:
        pass
    
    print("No recent Tally payload data found")
    return None

if __name__ == "__main__":
    show_latest_tally_data()