#!/usr/bin/env python3
import json
import sys
from datetime import datetime

def analyze_tally_payload():
    """Analyze and display Tally webhook payload structure"""
    
    try:
        # Read webhook data from stdin
        raw_input = sys.stdin.read().strip()
        if not raw_input:
            print("No payload received")
            return
        
        payload = json.loads(raw_input)
        timestamp = datetime.now().isoformat()
        
        print("=" * 80)
        print("TALLY FORM PAYLOAD ANALYSIS")
        print("=" * 80)
        print(f"Timestamp: {timestamp}")
        print(f"Payload Type: {type(payload)}")
        print(f"Total Keys: {len(payload) if isinstance(payload, dict) else 'N/A'}")
        print()
        
        # Analyze structure
        if isinstance(payload, dict):
            print("PAYLOAD STRUCTURE:")
            for key, value in payload.items():
                print(f"  {key}: {type(value).__name__} = {value}")
            print()
            
            # Check for common Tally structures
            if 'fields' in payload:
                print("FIELDS ARRAY DETECTED:")
                for i, field in enumerate(payload['fields']):
                    print(f"  Field {i+1}: {field}")
                print()
            
            if 'data' in payload:
                print("DATA OBJECT DETECTED:")
                print(f"  Data content: {payload['data']}")
                print()
        
        # Save detailed analysis
        analysis_file = f"tally_analysis_{int(datetime.now().timestamp())}.json"
        with open(analysis_file, 'w') as f:
            json.dump({
                "timestamp": timestamp,
                "payload_type": str(type(payload)),
                "raw_payload": payload,
                "analysis": {
                    "has_fields_array": 'fields' in payload if isinstance(payload, dict) else False,
                    "has_data_object": 'data' in payload if isinstance(payload, dict) else False,
                    "field_count": len(payload) if isinstance(payload, dict) else 0
                }
            }, f, indent=2)
        
        print(f"Analysis saved to: {analysis_file}")
        print("=" * 80)
        
        return payload
        
    except json.JSONDecodeError as e:
        print(f"Invalid JSON: {e}")
        print(f"Raw data: {raw_input}")
    except Exception as e:
        print(f"Error: {e}")
        
    return None

if __name__ == "__main__":
    analyze_tally_payload()