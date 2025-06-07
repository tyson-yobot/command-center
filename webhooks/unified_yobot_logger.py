#!/usr/bin/env python3
"""
Unified YoBot Logger - Single logger for all YoBot Command Center tables
"""

import os
import requests
from datetime import datetime

def get_api_token():
    """Get API token with fallback options"""
    return (os.getenv('AIRTABLE_API_KEY') or 
            os.getenv('AIRTABLE_PERSONAL_ACCESS_TOKEN') or 
            os.getenv('AIRTABLE_SUPPORT_LOG_ACCESS_TOKEN') or
            os.getenv('AIRTABLE_CALL_RECORDINGS_ACCESS_TOKEN') or
            os.getenv('AIRTABLE_NLP_KEYWORDS_ACCESS_TOKEN'))

def test_table_access():
    """Test access to all YoBot Command Center tables"""
    
    api_key = get_api_token()
    if not api_key:
        print("❌ No API token found")
        return False
    
    base_id = 'appRt8V3tH4g5Z51f'
    
    # Test tables with known IDs
    test_tables = [
        ("Support Ticket Log", "tblbU2C2F6YPMgLjx"),
        ("Call Recording Tracker", "tblqHLnXLcfq7kCdA"),
        ("NLP Keyword Tracker", "tblOtH99S7uFbYHga"),
        ("Call Sentiment Log", "tblWlCR2jU9u9lP4L")
    ]
    
    accessible_tables = []
    
    print("Testing table access...")
    print("=" * 50)
    
    for table_name, table_id in test_tables:
        try:
            response = requests.get(
                f"https://api.airtable.com/v0/{base_id}/{table_id}?maxRecords=1",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code == 200:
                print(f"✅ {table_name} - ACCESSIBLE")
                accessible_tables.append((table_name, table_id))
            else:
                print(f"❌ {table_name} - ACCESS DENIED")
                print(f"   Error: {response.text}")
                
        except Exception as e:
            print(f"❌ {table_name} - ERROR: {str(e)}")
    
    print("=" * 50)
    print(f"Accessible tables: {len(accessible_tables)}/{len(test_tables)}")
    
    return len(accessible_tables) > 0

def log_support_ticket(ticket_id, submitted_by, channel, ticket_type, description, assigned_rep=None, resolved=False, resolution_notes=""):
    """Log support tickets"""
    api_key = get_api_token()
    if not api_key:
        return False
    
    payload = {
        "fields": {
            "Ticket ID": ticket_id,
            "Submitted By": submitted_by,
            "Submission Channel": channel,
            "Ticket Type": ticket_type,
            "Description": description,
            "Submitted Date": datetime.utcnow().isoformat(),
            "Resolution Status": "Resolved" if resolved else "Pending",
            "Resolution Notes": resolution_notes,
            "Resolved Date": datetime.utcnow().isoformat() if resolved else None,
            "Assigned Rep": assigned_rep or ""
        }
    }

    response = requests.post(
        f"https://api.airtable.com/v0/appRt8V3tH4g5Z51f/tblbU2C2F6YPMgLjx",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json=payload
    )
    
    if response.status_code != 200:
        print(f"❌ Support ticket failed: {response.text}")
        return False
    else:
        print("✅ Support ticket logged")
        return True

def log_call_recording(call_id, bot_name, start_time, duration, recording_url, qa_status, review_notes="", assigned_agent=None, related_ticket_id=None):
    """Log call recordings"""
    api_key = get_api_token()
    if not api_key:
        return False

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
        f"https://api.airtable.com/v0/appRt8V3tH4g5Z51f/tblqHLnXLcfq7kCdA",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json=payload
    )
    
    if response.status_code != 200:
        print(f"❌ Call recording failed: {response.text}")
        return False
    else:
        print("✅ Call recording logged")
        return True

def log_nlp_keyword(keyword, category, sample_phrase, target_action, used_in_training=False, bot_name=None, owner="Tyson"):
    """Log NLP keywords"""
    api_key = get_api_token()
    if not api_key:
        return False

    payload = {
        "fields": {
            "🔑 Keyword": keyword,
            "🗂 Category": category,
            "💬 Sample Phrase": sample_phrase,
            "🎯 Target Action": target_action,
            "🔁 Used in Training?": used_in_training,
            "📅 Date Added": datetime.utcnow().isoformat(),
            "🧠 Bot Name": bot_name or "",
            "👤 Owner": owner
        }
    }

    response = requests.post(
        f"https://api.airtable.com/v0/appRt8V3tH4g5Z51f/tblOtH99S7uFbYHga",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json=payload
    )
    
    if response.status_code != 200:
        print(f"❌ NLP keyword failed: {response.text}")
        return False
    else:
        print("✅ NLP keyword logged")
        return True

def log_call_sentiment(call_id, bot_name, intent, sentiment_score, highlights, negatives, qa_status, reviewed_by="Tyson"):
    """Log call sentiment analysis"""
    api_key = get_api_token()
    if not api_key:
        return False

    payload = {
        "fields": {
            "📞 Call ID": call_id,
            "🧠 Bot Name": bot_name,
            "🎯 Intent": intent,
            "📊 Sentiment Score": sentiment_score,
            "🔍 Highlights": highlights,
            "📉 Negatives": negatives,
            "📅 Date": datetime.utcnow().isoformat(),
            "🧪 QA Status": qa_status,
            "👤 Reviewed By": reviewed_by
        }
    }

    response = requests.post(
        f"https://api.airtable.com/v0/appRt8V3tH4g5Z51f/tblWlCR2jU9u9lP4L",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json=payload
    )
    
    if response.status_code != 200:
        print(f"❌ Sentiment log failed: {response.text}")
        return False
    else:
        print("✅ Sentiment log recorded")
        return True

def create_sample_data():
    """Create sample data for all accessible tables"""
    
    print("Creating sample data for YoBot Command Center...")
    print("=" * 60)
    
    success_count = 0
    total_attempts = 0
    
    # Test Support Ticket
    total_attempts += 1
    if log_support_ticket(
        ticket_id="TKT-TEST-001",
        submitted_by="test@yobot.com",
        channel="Form",
        ticket_type="Bug",
        description="Test support ticket for validation",
        assigned_rep="Test Team",
        resolved=True,
        resolution_notes="Test ticket resolved successfully"
    ):
        success_count += 1
    
    # Test Call Recording
    total_attempts += 1
    if log_call_recording(
        call_id="CALL-TEST-001",
        bot_name="YoBot Test",
        start_time=datetime.utcnow().isoformat(),
        duration=120,
        recording_url="https://test.com/recording.mp3",
        qa_status="Pass",
        review_notes="Test call recording",
        assigned_agent="Test Agent",
        related_ticket_id="TKT-TEST-001"
    ):
        success_count += 1
    
    # Test NLP Keyword
    total_attempts += 1
    if log_nlp_keyword(
        keyword="test_keyword",
        category="FAQ",
        sample_phrase="This is a test phrase",
        target_action="Test action",
        used_in_training=True,
        bot_name="YoBot Test",
        owner="Test Owner"
    ):
        success_count += 1
    
    # Test Call Sentiment
    total_attempts += 1
    if log_call_sentiment(
        call_id="CALL-TEST-001",
        bot_name="YoBot Test",
        intent="Sales",
        sentiment_score=0.85,
        highlights="Test highlights",
        negatives="Test negatives",
        qa_status="Pass",
        reviewed_by="Test Reviewer"
    ):
        success_count += 1
    
    print("=" * 60)
    print(f"Sample data creation complete: {success_count}/{total_attempts} successful")
    
    if success_count > 0:
        print(f"✅ {success_count} tables are accessible and working")
        print("View data: https://airtable.com/appRt8V3tH4g5Z51f")
    else:
        print("❌ No tables accessible - token permissions needed")
    
    return success_count > 0

if __name__ == '__main__':
    print("YoBot Unified Logger - Testing Access")
    print()
    
    # Test table access
    if test_table_access():
        print()
        create_sample_data()
    else:
        print("❌ No tables accessible")
        print("Need Personal Access Token with permissions for base appRt8V3tH4g5Z51f")