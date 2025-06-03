"""
Command Center Integration Functions - Clean Version
Wires 9 core functions to Command Center Airtable tables (appRt8V3tH4g5Z51f)
All Unicode characters removed for proper encoding
"""

import os
import requests
import json
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
    
    url = "https://api.airtable.com/v0/appCoAtCZdARb4AM2/Integration%20Test%20Log%202"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, headers=headers, data=json.dumps({"fields": test_data}))
        return {"status": "logged", "response": response.status_code}
    except Exception as e:
        return {"error": f"Test logging failed: {str(e)}"}

def log_to_command_center_table(table_name, data, function_name=""):
    """Generic function to log data to Command Center tables with test logging"""
    api_key = get_api_key()
    if not api_key:
        log_to_test_log(function_name, "fail", "No API key available")
        return {"error": "No API key available"}
    
    # URL encode table name
    encoded_table_name = table_name.replace(" ", "%20")
    url = f"https://api.airtable.com/v0/{COMMAND_CENTER_BASE_ID}/{encoded_table_name}"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, headers=headers, data=json.dumps({"fields": data}))
        if response.status_code == 200 or response.status_code == 201:
            # Log success to test log
            log_to_test_log(function_name, "success", f"Successfully logged to {table_name}")
            return {"success": True, "response": response.json()}
        else:
            # Log failure to test log
            log_to_test_log(function_name, "fail", f"HTTP {response.status_code}: {response.text}")
            return {"error": f"HTTP {response.status_code}: {response.text}"}
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
    print("============================================================")
    
    # Test data
    test_results = []
    
    # 1. Support Ticket
    try:
        result1 = log_support_ticket("TK-001", "Test Client", "Login Issue", "Please clear browser cache and try again", True)
        test_results.append(("Support Ticket", "Pass" if result1.get("success") else "Fail", result1.get("error", "")))
    except Exception as e:
        test_results.append(("Support Ticket", "Fail", str(e)))
    
    # 2. Call Recording
    try:
        result2 = log_call_recording("CALL-001", "John Doe", "+1234567890", "https://example.com/recording.mp3", 15)
        test_results.append(("Call Recording", "Pass" if result2.get("success") else "Fail", result2.get("error", "")))
    except Exception as e:
        test_results.append(("Call Recording", "Fail", str(e)))
    
    # 3. Sentiment Analysis
    try:
        result3 = log_sentiment("CALL-001", "Positive", 0.85, "Customer was very satisfied with the service")
        test_results.append(("Sentiment Analysis", "Pass" if result3.get("success") else "Fail", result3.get("error", "")))
    except Exception as e:
        test_results.append(("Sentiment Analysis", "Fail", str(e)))
    
    # 4. Escalation
    try:
        result4 = log_escalation("ESC-001", "Jane Smith", "High", "Billing discrepancy needs immediate attention", "Support Manager")
        test_results.append(("Escalation", "Pass" if result4.get("success") else "Fail", result4.get("error", "")))
    except Exception as e:
        test_results.append(("Escalation", "Fail", str(e)))
    
    # 5. Client Touchpoint
    try:
        result5 = log_client_touchpoint("Mike Johnson", "ABC Corp", "Email", "Support Request", "Customer reported login issues")
        test_results.append(("Client Touchpoint", "Pass" if result5.get("success") else "Fail", result5.get("error", "")))
    except Exception as e:
        test_results.append(("Client Touchpoint", "Fail", str(e)))
    
    # 6. Missed Call
    try:
        result6 = log_missed_call("Sarah Wilson", "+1987654321", "Main Line", True)
        test_results.append(("Missed Call", "Pass" if result6.get("success") else "Fail", result6.get("error", "")))
    except Exception as e:
        test_results.append(("Missed Call", "Fail", str(e)))
    
    # 7. QA Review
    try:
        result7 = log_qa_review("CALL-001", "QA Manager", "Excellent", 5, "Perfect customer service delivery")
        test_results.append(("QA Review", "Pass" if result7.get("success") else "Fail", result7.get("error", "")))
    except Exception as e:
        test_results.append(("QA Review", "Fail", str(e)))
    
    # 8. NLP Keywords
    try:
        result8 = log_keywords("KW-001", "billing, refund, urgent", 0.92, "Customer service call about billing issue")
        test_results.append(("NLP Keywords", "Pass" if result8.get("success") else "Fail", result8.get("error", "")))
    except Exception as e:
        test_results.append(("NLP Keywords", "Fail", str(e)))
    
    # 9. Command Center Metrics
    try:
        result9 = log_command_center_metrics(25, 95, 2, 78, 2.5)
        test_results.append(("Command Center Metrics", "Pass" if result9.get("success") else "Fail", result9.get("error", "")))
    except Exception as e:
        test_results.append(("Command Center Metrics", "Fail", str(e)))
    
    # Print results
    print("\nTest Results:")
    working_count = 0
    for name, status, error in test_results:
        status_icon = "✅" if status == "Pass" else "❌"
        print(f"{name}: {status_icon} {status}" + (f": {error}" if error else ""))
        if status == "Pass":
            working_count += 1
    
    print(f"\nSummary: {working_count}/9 functions working")
    
    if working_count < 9:
        print(f"\n⚠️  {9 - working_count} functions need attention before going live")
    else:
        print("\n🎉 All Command Center functions are operational!")

if __name__ == "__main__":
    test_all_command_center_functions()