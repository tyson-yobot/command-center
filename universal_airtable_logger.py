"""
Universal Airtable Logger - Standardized Production Logger
Owner: Tyson Lerfald
Purpose: Single source of truth for all Airtable logging operations
Date: 2025-06-11

This is the ONLY logger function that should be used across all automation scripts.
It provides consistent field mapping and error handling for all test logging.
"""

import requests
from datetime import datetime
import smtplib
from email.mime.text import MIMEText

def log_integration_test_to_airtable(
    integration_name: str,
    passed: bool,
    notes: str = "",
    qa_owner: str = "Tyson Lerfald",
    output_data_populated: bool = True,
    record_created: bool = True,
    retry_attempted: bool = False,
    module_type: str = "Automation Test",
    related_scenario_link: str = ""
):
    """
    Universal Airtable Logger - Production Ready
    
    This function provides standardized logging to Airtable with complete field mapping.
    All automation scripts should use this function for consistent data integrity.
    
    Args:
        integration_name: Name of the automation function being tested
        passed: Boolean indicating if test passed (True) or failed (False)
        notes: Additional test notes or error details
        qa_owner: QA owner responsible for the test (default: Tyson Lerfald)
        output_data_populated: Boolean indicating if output data was populated
        record_created: Boolean indicating if record was created successfully
        retry_attempted: Boolean indicating if retry was attempted
        module_type: Type of module being tested (default: Automation Test)
        related_scenario_link: Optional link to related scenario
    
    Returns:
        str: Record ID if successful, None if failed
    """
    
    # Production Airtable Configuration - LOCKED BY ADMIN
    from logger_config import AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_ID
    
    # Safety check to prevent base mismatches
    if AIRTABLE_BASE_ID != "appbFDTqB2WtRNV1H":
        raise Exception("❌ Invalid Airtable Base ID in use – logger misconfigured.")
    
    airtable_api_key = AIRTABLE_API_KEY
    base_id = AIRTABLE_BASE_ID
    table_id = AIRTABLE_TABLE_ID
    url = f"https://api.airtable.com/v0/{base_id}/{table_id}"

    headers = {
        "Authorization": f"Bearer {airtable_api_key}",
        "Content-Type": "application/json"
    }

    # Format data with complete field mapping
    status_emoji = "✅" if passed else "❌"
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Create comprehensive combined value for main field
    combined_value = f"{integration_name} - {status_emoji} - {notes} - {timestamp} - QA: {qa_owner} - Module: {module_type}"
    
    # Complete payload with all required fields
    payload = {
        "fields": {
            "🔧 Integration Name": combined_value,
            "✅ Pass/Fail": status_emoji,
            "📅 Test Date": datetime.now().isoformat(),
            "🧑‍💻 QA Owner": qa_owner,
            "🧠 Notes / Debug": notes,
            "🧩 Module Type": module_type,
            "📤 Output Data Populated": output_data_populated,
            "🗃️ Record Created?": record_created,
            "🔁 Retry Attempted?": retry_attempted,
            "🛡️ Logger Source": "🧠 AI Locked Logger v1.0"
        }
    }
    
    # Add optional related scenario link if provided
    if related_scenario_link:
        payload["fields"]["📂 Related Scenario Link"] = related_scenario_link

    try:
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code in [200, 201]:
            record_id = response.json().get('id', 'Unknown')
            print(f"✅ LOGGED: {integration_name} - {status_emoji} - {record_id}")
            
            # Send alerts for failed tests
            if not passed:
                send_failure_alerts(integration_name, notes)
            
            return record_id
        else:
            print(f"❌ Airtable logging failed: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Logger exception: {str(e)}")
        return None


def send_failure_alerts(integration_name: str, notes: str):
    """Send Slack and email alerts for failed tests"""
    try:
        # Slack alert
        slack_webhook_url = "https://hooks.slack.com/services/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"
        slack_message = f"🚨 *FAILED INTEGRATION:* {integration_name}\n{notes}"
        requests.post(slack_webhook_url, json={"text": slack_message})
        
        # Email alert
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        smtp_user = "noreply@yobot.bot"
        smtp_pass = "dtoh arup mtyu uhxw"
        recipients = ["tyson@yobot.bot", "daniel@yobot.bot"]
        
        msg = MIMEText(f"Failure logged for {integration_name}\n\n{notes}")
        msg["Subject"] = f"FAILED: {integration_name}"
        msg["From"] = smtp_user
        msg["To"] = ", ".join(recipients)

        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_user, recipients, msg.as_string())
            
    except Exception as e:
        print(f"Alert sending failed: {str(e)}")


# Usage Examples:
#
# from universal_airtable_logger import log_integration_test_to_airtable
#
# # Success example
# log_integration_test_to_airtable(
#     integration_name="Function 123 - CRM Sync Test",
#     passed=True,
#     notes="QA Test #123 passed successfully"
# )
#
# # Failure example
# log_integration_test_to_airtable(
#     integration_name="Function 124 - Payment Gateway",
#     passed=False,
#     notes="QA Test #124 failed - timeout error"
# )