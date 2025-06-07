#!/usr/bin/env python3
"""
Command Center Integration Functions
Wires 9 core functions to Command Center Airtable tables (appRt8V3tH4g5Z51f)
"""

import os
import requests
from datetime import datetime

# Command Center Base Configuration
COMMAND_CENTER_BASE_ID = "appRt8V3tH4g5Z51f"

def get_api_key():
    """Get the appropriate API key for Command Center"""
    return os.getenv("AIRTABLE_PERSONAL_ACCESS_TOKEN") or os.getenv("AIRTABLE_COMMAND_CENTER_TOKEN") or os.getenv("AIRTABLE_COMMAND_CENTER_BASE_TOKEN") or os.getenv("AIRTABLE_VALID_TOKEN") or os.getenv("AIRTABLE_API_KEY")

def log_to_test_log(function_name, status, notes=""):
    """Log function execution to Integration Test Log for internal documentation"""
    api_key = get_api_key()
    if not api_key:
        return {"error": "No API key for test logging"}
    
    test_data = {
        "Integration Name": function_name,
        "Pass/Fail": "Pass" if status == "success" else "Fail",
        "Notes / Debug": notes,
        "Test Date": datetime.now().strftime("%Y-%m-%d"),
        "QA Owner": "Auto-Logger"
    }
    
    url = "https://api.airtable.com/v0/appCoAtCZdARb4AM2/Integration Test Log 2"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    try:
        requests.post(url, headers=headers, json={"fields": test_data})
    except:
        pass  # Don't fail main function if test logging fails

def log_to_command_center_table(table_name, data, function_name=""):
    """Generic function to log data to Command Center tables with test logging"""
    api_key = get_api_key()
    if not api_key:
        return {"error": "No API key available"}
    
    url = f"https://api.airtable.com/v0/{COMMAND_CENTER_BASE_ID}/{table_name}"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {"fields": data}
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        if response.status_code == 200:
            # Log success to test log
            log_to_test_log(function_name, "success", f"Successfully logged to {table_name}")
            return {"status": "success", "record": response.json()}
        else:
            # Log failure to test log
            error_msg = f"HTTP {response.status_code}: {response.text}"
            log_to_test_log(function_name, "fail", error_msg)
            return {"error": error_msg}
    except Exception as e:
        # Log exception to test log
        log_to_test_log(function_name, "fail", f"Exception: {str(e)}")
        return {"error": str(e)}

# 1. Support Ticket Summary
def log_support_ticket(ticket_id, client_name, topic, ai_reply, escalation_flag=False):
    """Log support ticket to Command Center"""
    data = {
        "Ticket ID": ticket_id,
        "Client Name": client_name,
        "Topic": topic,
        "AI Reply": ai_reply,
        "Escalation Flag": "Yes" if escalation_flag else "No",
        "Date": datetime.now().strftime("%Y-%m-%d"),
        "Time": datetime.now().strftime("%H:%M:%S")
    }
    
    return log_to_command_center_table("Support Ticket Log", data, "log_support_ticket")

# 2. Call Recording Tracker
def log_call_recording(call_id, contact_name, phone_number, recording_url, duration_minutes=0):
    """Log call recording to Command Center"""
    data = {
        "Call ID": call_id,
        "Contact Name": contact_name,
        "Phone Number": phone_number,
        "Recording URL": recording_url,
        "Duration (min)": str(duration_minutes),
        "Date": datetime.now().strftime("%Y-%m-%d"),
        "Time": datetime.now().strftime("%H:%M:%S")
    }
    
    return log_to_command_center_table("Call Recording Tracker", data, "log_call_recording")

# 3. Call Sentiment Analysis
def log_sentiment(call_id, sentiment_rating, confidence_score, transcript_snippet=""):
    """Log sentiment analysis to Command Center"""
    data = {
        "Call ID": call_id,
        "Sentiment Rating": sentiment_rating,
        "Confidence Score": str(confidence_score),
        "Transcript Snippet": transcript_snippet,
        "Call Date": datetime.now().strftime("%Y-%m-%d"),
        "Analysis Time": datetime.now().strftime("%H:%M:%S")
    }
    
    return log_to_command_center_table("Call Sentiment Log", data, "log_sentiment")

# 4. Escalation Tracker
def log_escalation(escalation_id, contact_name, urgency_level, issue_description, assigned_to=""):
    """Log escalation event to Command Center"""
    data = {
        "Escalation ID": escalation_id,
        "Contact Name": contact_name,
        "Urgency Level": urgency_level,
        "Issue Description": issue_description,
        "Assigned To": assigned_to,
        "Date": datetime.now().strftime("%Y-%m-%d"),
        "Time": datetime.now().strftime("%H:%M:%S")
    }
    
    return log_to_command_center_table("Escalation Tracker", data, "log_escalation")

# 5. Client Touchpoint Log
def log_client_touchpoint(contact_name, company, channel, interaction_type, notes=""):
    """Log client interaction to Command Center"""
    data = {
        "Contact Name": contact_name,
        "Company": company,
        "Channel": channel,
        "Interaction Type": interaction_type,
        "Notes": notes,
        "Date": datetime.now().strftime("%Y-%m-%d"),
        "Time": datetime.now().strftime("%H:%M:%S")
    }
    
    return log_to_command_center_table("Client Touchpoint Log", data, "log_client_touchpoint")

# 6. Missed Call Log
def log_missed_call(caller_name, phone_number, source, follow_up_required=True):
    """Log missed call to Command Center"""
    data = {
        "Caller Name": caller_name,
        "Phone Number": phone_number,
        "Source": source,
        "Missed Date & Time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "Follow-up Required": "Yes" if follow_up_required else "No"
    }
    
    return log_to_command_center_table("Missed Call Log", data, "log_missed_call")

# 7. QA Call Review Log
def log_qa_review(call_id, reviewed_by, qa_tag, score, notes=""):
    """Log QA review to Command Center"""
    data = {
        "Call ID": call_id,
        "Reviewed By": reviewed_by,
        "QA Tag": qa_tag,
        "Score": str(score),
        "Notes": notes,
        "Review Date": datetime.now().strftime("%Y-%m-%d"),
        "Review Time": datetime.now().strftime("%H:%M:%S")
    }
    
    return log_to_command_center_table("QA Call Review Log", data, "log_qa_review")

# 8. NLP Keyword Tracker
def log_keywords(event_id, keywords_detected, confidence_level, context=""):
    """Log NLP keywords to Command Center"""
    data = {
        "Event ID": event_id,
        "Keywords Detected": keywords_detected,
        "Confidence Level": str(confidence_level),
        "Context": context,
        "Detection Date": datetime.now().strftime("%Y-%m-%d"),
        "Detection Time": datetime.now().strftime("%H:%M:%S")
    }
    
    return log_to_command_center_table("NLP Keyword Tracker", data, "log_keywords")

# 9. Command Center Metrics
def log_command_center_metrics(daily_calls, success_rate, error_count, api_usage_percent, avg_response_time=0):
    """Log daily metrics to Command Center"""
    data = {
        "Date": datetime.now().strftime("%Y-%m-%d"),
        "Daily Calls": str(daily_calls),
        "Success Rate %": str(success_rate),
        "Error Count": str(error_count),
        "API Usage %": str(api_usage_percent),
        "Avg Response Time (s)": str(avg_response_time)
    }
    
    return log_to_command_center_table("Ops Metrics Log", data, "log_command_center_metrics")

def test_all_command_center_functions():
    """Test all 9 Command Center functions"""
    print("Testing Command Center Integration Functions")
    print("=" * 60)
    
    test_results = []
    
    # Test 1: Support Ticket
    try:
        result = log_support_ticket("TK001", "Test Client", "Login Issue", "Please try clearing cache", True)
        test_results.append(("Support Ticket", "✅ Pass" if result.get("status") == "success" else f"❌ Fail: {result.get('error', '')}"))
    except Exception as e:
        test_results.append(("Support Ticket", f"❌ Error: {str(e)[:50]}"))
    
    # Test 2: Call Recording
    try:
        result = log_call_recording("CALL001", "John Doe", "+1234567890", "https://example.com/recording1.mp3", 15)
        test_results.append(("Call Recording", "✅ Pass" if result.get("status") == "success" else f"❌ Fail: {result.get('error', '')}"))
    except Exception as e:
        test_results.append(("Call Recording", f"❌ Error: {str(e)[:50]}"))
    
    # Test 3: Sentiment Analysis
    try:
        result = log_sentiment("CALL001", "Positive", 0.85, "Customer was very satisfied")
        test_results.append(("Sentiment Analysis", "✅ Pass" if result.get("status") == "success" else f"❌ Fail: {result.get('error', '')}"))
    except Exception as e:
        test_results.append(("Sentiment Analysis", f"❌ Error: {str(e)[:50]}"))
    
    # Test 4: Escalation
    try:
        result = log_escalation("ESC001", "Jane Smith", "High", "Billing dispute requires immediate attention", "Manager")
        test_results.append(("Escalation", "✅ Pass" if result.get("status") == "success" else f"❌ Fail: {result.get('error', '')}"))
    except Exception as e:
        test_results.append(("Escalation", f"❌ Error: {str(e)[:50]}"))
    
    # Test 5: Client Touchpoint
    try:
        result = log_client_touchpoint("Bob Johnson", "Acme Corp", "Phone", "Follow-up call", "Discussed new features")
        test_results.append(("Client Touchpoint", "✅ Pass" if result.get("status") == "success" else f"❌ Fail: {result.get('error', '')}"))
    except Exception as e:
        test_results.append(("Client Touchpoint", f"❌ Error: {str(e)[:50]}"))
    
    # Test 6: Missed Call
    try:
        result = log_missed_call("Sarah Wilson", "+1987654321", "Main Line", True)
        test_results.append(("Missed Call", "✅ Pass" if result.get("status") == "success" else f"❌ Fail: {result.get('error', '')}"))
    except Exception as e:
        test_results.append(("Missed Call", f"❌ Error: {str(e)[:50]}"))
    
    # Test 7: QA Review
    try:
        result = log_qa_review("CALL001", "QA Manager", "Excellent", 9, "Perfect customer handling")
        test_results.append(("QA Review", "✅ Pass" if result.get("status") == "success" else f"❌ Fail: {result.get('error', '')}"))
    except Exception as e:
        test_results.append(("QA Review", f"❌ Error: {str(e)[:50]}"))
    
    # Test 8: NLP Keywords
    try:
        result = log_keywords("NLP001", "billing, cancel, refund", 0.92, "Customer expressing dissatisfaction")
        test_results.append(("NLP Keywords", "✅ Pass" if result.get("status") == "success" else f"❌ Fail: {result.get('error', '')}"))
    except Exception as e:
        test_results.append(("NLP Keywords", f"❌ Error: {str(e)[:50]}"))
    
    # Test 9: Metrics
    try:
        result = log_command_center_metrics(45, 94.5, 3, 78, 2)
        test_results.append(("Command Center Metrics", "✅ Pass" if result.get("status") == "success" else f"❌ Fail: {result.get('error', '')}"))
    except Exception as e:
        test_results.append(("Command Center Metrics", f"❌ Error: {str(e)[:50]}"))
    
    # Print results
    print("\nTest Results:")
    for function_name, result in test_results:
        print(f"{function_name}: {result}")
    
    passed = len([r for r in test_results if "✅" in r[1]])
    total = len(test_results)
    print(f"\nSummary: {passed}/{total} functions working")
    
    if passed == total:
        print("\n🎯 ALL COMMAND CENTER FUNCTIONS ACTIVE AND READY!")
        print("✅ Ready for live voice call testing and scraping")
    else:
        print(f"\n⚠️  {total-passed} functions need attention before going live")

if __name__ == "__main__":
    test_all_command_center_functions()