#!/usr/bin/env python3
"""
Call Recording Logger - Logs call recordings to YoBot Command Center
"""

import os
import requests
from datetime import datetime, timedelta
import random

def log_call_recording(call_id, bot_name, start_time, duration, recording_url, qa_status, review_notes="", assigned_agent=None, related_ticket_id=None):
    """Log call recordings to Airtable"""
    import requests, os

    payload = {
        "fields": {
            "📞 Call ID": call_id,
            "🧠 Bot Name": bot_name,
            "🕒 Call Start Time": start_time,
            "📍 Call Duration": duration,
            "🔊 Recording URL": recording_url,
            "🧪 QA Status": qa_status,
            "📝 Review Notes": review_notes,
            "👤 Agent Assigned": assigned_agent or "",
            "📂 Related Ticket ID": related_ticket_id or ""
        }
    }

    response = requests.post(
        f"https://api.airtable.com/v0/{os.getenv('AIRTABLE_CALL_RECORDINGS_BASE_ID')}/{os.getenv('AIRTABLE_CALL_RECORDINGS_TABLE_ID')}",
        headers={
            "Authorization": f"Bearer {os.getenv('AIRTABLE_API_KEY')}",
            "Content-Type": "application/json"
        },
        json=payload
    )

    if response.status_code != 200:
        print("❌ Call log failed:", response.text)
        return False
    else:
        print("✅ Call recording logged.")
        return True

def create_sample_call_recordings():
    """Create sample call recordings to demonstrate the system"""
    
    # Set environment variables
    os.environ['AIRTABLE_CALL_RECORDINGS_BASE_ID'] = 'appRt8V3tH4g5Z51f'
    os.environ['AIRTABLE_CALL_RECORDINGS_TABLE_ID'] = 'tblqHLnXLcfq7kCdA'
    
    api_key = os.getenv('AIRTABLE_API_KEY') or os.getenv('AIRTABLE_PERSONAL_ACCESS_TOKEN')
    if not api_key:
        print("Missing AIRTABLE_API_KEY or AIRTABLE_PERSONAL_ACCESS_TOKEN")
        return False
    
    os.environ['AIRTABLE_API_KEY'] = api_key
    
    # Generate realistic call recording data
    base_time = datetime.now() - timedelta(days=7)
    
    sample_calls = [
        {
            "call_id": "CALL-2025-0001",
            "bot_name": "YoBot Alpha",
            "start_time": (base_time + timedelta(hours=1)).isoformat(),
            "duration": 185,
            "recording_url": "https://yobot-recordings.s3.amazonaws.com/call-2025-0001.mp3",
            "qa_status": "Pass",
            "review_notes": "Excellent call handling. Bot identified customer pain points quickly and provided relevant solutions. Voice quality clear throughout.",
            "assigned_agent": "Daniel Sharpe",
            "related_ticket_id": "TKT-001"
        },
        {
            "call_id": "CALL-2025-0002",
            "bot_name": "YoBot Beta",
            "start_time": (base_time + timedelta(hours=3)).isoformat(),
            "duration": 342,
            "recording_url": "https://yobot-recordings.s3.amazonaws.com/call-2025-0002.mp3",
            "qa_status": "Pass",
            "review_notes": "Strong objection handling. Customer initially resistant but bot successfully addressed concerns about pricing and implementation timeline.",
            "assigned_agent": "Sarah Chen",
            "related_ticket_id": "TKT-002"
        },
        {
            "call_id": "CALL-2025-0003",
            "bot_name": "YoBot Gamma",
            "start_time": (base_time + timedelta(hours=6)).isoformat(),
            "duration": 128,
            "recording_url": "https://yobot-recordings.s3.amazonaws.com/call-2025-0003.mp3",
            "qa_status": "Fail",
            "review_notes": "Call quality issues. Audio dropped out multiple times. Bot struggled with customer's accent and requested multiple clarifications.",
            "assigned_agent": "Mike Rodriguez",
            "related_ticket_id": "TKT-URGENT-001"
        },
        {
            "call_id": "CALL-2025-0004",
            "bot_name": "YoBot Alpha",
            "start_time": (base_time + timedelta(hours=12)).isoformat(),
            "duration": 267,
            "recording_url": "https://yobot-recordings.s3.amazonaws.com/call-2025-0004.mp3",
            "qa_status": "Pass",
            "review_notes": "Professional presentation of enterprise features. Bot effectively explained ROI calculations and integration capabilities.",
            "assigned_agent": "Alex Thompson",
            "related_ticket_id": "TKT-004"
        },
        {
            "call_id": "CALL-2025-0005",
            "bot_name": "YoBot Delta",
            "start_time": (base_time + timedelta(days=1, hours=2)).isoformat(),
            "duration": 156,
            "recording_url": "https://yobot-recordings.s3.amazonaws.com/call-2025-0005.mp3",
            "qa_status": "Pass",
            "review_notes": "Good rapport building. Bot asked thoughtful discovery questions and tailored pitch to customer's specific industry needs.",
            "assigned_agent": "Jennifer Park",
            "related_ticket_id": "TKT-005"
        },
        {
            "call_id": "CALL-2025-0006",
            "bot_name": "YoBot Beta",
            "start_time": (base_time + timedelta(days=1, hours=8)).isoformat(),
            "duration": 412,
            "recording_url": "https://yobot-recordings.s3.amazonaws.com/call-2025-0006.mp3",
            "qa_status": "Pass",
            "review_notes": "Extended technical discussion. Bot handled complex integration questions and provided detailed implementation timeline.",
            "assigned_agent": "David Kim",
            "related_ticket_id": "TKT-006"
        },
        {
            "call_id": "CALL-2025-0007",
            "bot_name": "YoBot Gamma",
            "start_time": (base_time + timedelta(days=2, hours=4)).isoformat(),
            "duration": 93,
            "recording_url": "https://yobot-recordings.s3.amazonaws.com/call-2025-0007.mp3",
            "qa_status": "Fail",
            "review_notes": "Bot failed to handle customer's urgent escalation request. Inappropriate transfer to voicemail instead of live agent.",
            "assigned_agent": "Lisa Wong",
            "related_ticket_id": "TKT-CRITICAL-003"
        },
        {
            "call_id": "CALL-2025-0008",
            "bot_name": "YoBot Alpha",
            "start_time": (base_time + timedelta(days=3, hours=1)).isoformat(),
            "duration": 298,
            "recording_url": "https://yobot-recordings.s3.amazonaws.com/call-2025-0008.mp3",
            "qa_status": "Pass",
            "review_notes": "Excellent follow-up call. Bot referenced previous conversation details and addressed outstanding concerns effectively.",
            "assigned_agent": "Robert Martinez",
            "related_ticket_id": "TKT-007"
        },
        {
            "call_id": "CALL-2025-0009",
            "bot_name": "YoBot Delta",
            "start_time": (base_time + timedelta(days=4, hours=6)).isoformat(),
            "duration": 224,
            "recording_url": "https://yobot-recordings.s3.amazonaws.com/call-2025-0009.mp3",
            "qa_status": "Pass",
            "review_notes": "Strong closing technique. Bot successfully guided customer through trial signup and scheduled onboarding call.",
            "assigned_agent": "Emma Johnson",
            "related_ticket_id": "TKT-008"
        },
        {
            "call_id": "CALL-2025-0010",
            "bot_name": "YoBot Beta",
            "start_time": (base_time + timedelta(days=5, hours=3)).isoformat(),
            "duration": 376,
            "recording_url": "https://yobot-recordings.s3.amazonaws.com/call-2025-0010.mp3",
            "qa_status": "Pass",
            "review_notes": "Comprehensive needs assessment. Bot identified decision-making process and key stakeholders for enterprise deal.",
            "assigned_agent": "Carlos Rivera",
            "related_ticket_id": "TKT-002"
        }
    ]
    
    success_count = 0
    
    print("Creating call recording logs...")
    print("=" * 60)
    
    for i, call in enumerate(sample_calls, 1):
        try:
            success = log_call_recording(
                call_id=call["call_id"],
                bot_name=call["bot_name"],
                start_time=call["start_time"],
                duration=call["duration"],
                recording_url=call["recording_url"],
                qa_status=call["qa_status"],
                review_notes=call["review_notes"],
                assigned_agent=call["assigned_agent"],
                related_ticket_id=call["related_ticket_id"]
            )
            
            if success:
                success_count += 1
                status_emoji = "✅" if call["qa_status"] == "Pass" else "❌"
                print(f"SUCCESS {i:2d}/10: {call['call_id']} - {status_emoji} {call['qa_status']} - {call['duration']}s")
            else:
                print(f"FAILED  {i:2d}/10: {call['call_id']}")
                
        except Exception as e:
            print(f"ERROR   {i:2d}/10: {call['call_id']} - {str(e)}")
    
    print("=" * 60)
    print(f"Call recording logging complete: {success_count}/10 calls logged")
    
    if success_count > 0:
        # Calculate statistics
        total_duration = sum(call["duration"] for call in sample_calls)
        pass_count = sum(1 for call in sample_calls if call["qa_status"] == "Pass")
        pass_rate = (pass_count / len(sample_calls)) * 100
        avg_duration = total_duration / len(sample_calls)
        
        print(f"\n📊 Call Statistics:")
        print(f"   • Total Calls: {len(sample_calls)}")
        print(f"   • Pass Rate: {pass_rate:.1f}% ({pass_count}/{len(sample_calls)})")
        print(f"   • Average Duration: {avg_duration:.0f} seconds")
        print(f"   • Total Call Time: {total_duration//60} minutes {total_duration%60} seconds")
        print(f"\nView recordings: https://airtable.com/appRt8V3tH4g5Z51f")
        return True
    else:
        print("No calls logged - check authentication token")
        return False

def test_single_call_recording():
    """Test the example call recording provided"""
    
    # Set environment variables
    os.environ['AIRTABLE_CALL_RECORDINGS_BASE_ID'] = 'appRt8V3tH4g5Z51f'
    os.environ['AIRTABLE_CALL_RECORDINGS_TABLE_ID'] = 'tblqHLnXLcfq7kCdA'
    
    api_key = os.getenv('AIRTABLE_API_KEY') or os.getenv('AIRTABLE_PERSONAL_ACCESS_TOKEN')
    if not api_key:
        print("Missing authentication token")
        return False
    
    os.environ['AIRTABLE_API_KEY'] = api_key
    
    print("Testing single call recording...")
    print("=" * 40)
    
    # Test the example call recording
    success = log_call_recording(
        call_id="CALL-2025-0001",
        bot_name="YoBot Alpha",
        start_time="2025-06-03T14:32:00Z",
        duration=185,
        recording_url="https://example.com/recordings/yobot-call-0001.mp3",
        qa_status="Pass",
        review_notes="Call clear, bot handled objections correctly.",
        assigned_agent="Daniel Sharpe",
        related_ticket_id="TCK-442"
    )
    
    if success:
        print("✅ Test call recording successful")
        print("   Call ID: CALL-2025-0001")
        print("   Duration: 185 seconds (3:05)")
        print("   QA Status: Pass")
        print("   Assigned: Daniel Sharpe")
        return True
    else:
        print("❌ Test call recording failed")
        return False

if __name__ == '__main__':
    print("YoBot Call Recording Logger")
    print("Creating comprehensive call recording logs...")
    print()
    
    # Test single call first
    test_single_call_recording()
    print()
    
    # Create sample call recordings
    create_sample_call_recordings()
    
    print("\nComplete call recording system logged to Airtable")
    print("Base: appRt8V3tH4g5Z51f | Table: tblqHLnXLcfq7kCdA")