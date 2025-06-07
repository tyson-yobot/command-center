#!/usr/bin/env python3
import json
import sys
import os
from datetime import datetime

def extract_raw_payload():
    """Extract and display the raw payload from stdin"""
    
    try:
        # Read the raw webhook data
        raw_data = sys.stdin.read().strip()
        
        if not raw_data:
            print("No payload data received")
            return
        
        # Parse JSON payload
        payload = json.loads(raw_data)
        
        # Save raw payload with timestamp
        timestamp = int(datetime.now().timestamp() * 1000)
        filename = f"raw_payload_{timestamp}.json"
        
        with open(filename, 'w') as f:
            json.dump({
                "timestamp": datetime.now().isoformat(),
                "raw_payload": payload,
                "payload_size": len(raw_data),
                "field_count": len(payload) if isinstance(payload, dict) else 0
            }, f, indent=2)
        
        print("=" * 80)
        print("RAW TALLY FORM PAYLOAD")
        print("=" * 80)
        print(f"Timestamp: {datetime.now().isoformat()}")
        print(f"Payload size: {len(raw_data)} characters")
        print(f"Field count: {len(payload) if isinstance(payload, dict) else 0}")
        print()
        print("COMPLETE PAYLOAD:")
        print(json.dumps(payload, indent=2))
        print("=" * 80)
        print(f"Raw payload saved to: {filename}")
        
        return payload
        
    except json.JSONDecodeError as e:
        print(f"Invalid JSON payload: {e}")
        print(f"Raw data: {raw_data}")
        return None
    except Exception as e:
        print(f"Error processing payload: {e}")
        return None

if __name__ == "__main__":
    extract_raw_payload()