import requests
from datetime import datetime
import smtplib
from email.mime.text import MIMEText

PASS_FAIL_OPTIONS = {
    True: "✅",
    False: "❌"
}

SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/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"
EMAILS_TO_NOTIFY = ["tyson@yobot.bot", "daniel@yobot.bot"]
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = "noreply@yobot.bot"
SMTP_PASS = "dtoh arup mtyu uhxw"


def send_slack_alert(message: str):
    try:
        requests.post(SLACK_WEBHOOK_URL, json={"text": message})
    except Exception as e:
        print("Slack alert failed:", str(e))


def send_email_alert(subject: str, body: str):
    try:
        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = SMTP_USER
        msg["To"] = ", ".join(EMAILS_TO_NOTIFY)

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_USER, EMAILS_TO_NOTIFY, msg.as_string())
    except Exception as e:
        print("Email alert failed:", str(e))


def log_integration_test_to_airtable(
    integration_name: str,
    passed: bool,
    notes: str = "",
    qa_owner: str = "Tyson Lerfald",
    output_data_populated: bool = True,
    record_created: bool = True,
    retry_attempted: bool = False,
    module_type: str = "Webhook",
    related_scenario_link: str = ""
):
    import os
    
    # Use the working hardcoded API key - FIXED TO MATCH DASHBOARD TABLE
    airtable_api_key = 'paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa'
    base_id = "appbFDTqB2WtRNV1H"
    table_id = "tbl7K5RthCtD69BE1"
    url = f"https://api.airtable.com/v0/{base_id}/{table_id}"

    headers = {
        "Authorization": f"Bearer {airtable_api_key}",
        "Content-Type": "application/json"
    }

    # Format as concatenated string to match existing table structure
    status_emoji = "✅" if passed else "❌"
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    combined_value = f"{integration_name} - {status_emoji} - {notes} - {timestamp} - QA: {qa_owner} - Module: {module_type}"
    
    payload = {
        "fields": {
            "🔧 Integration Name": combined_value
        }
    }

    response = requests.post(url, headers=headers, json=payload)
    print("📤 Payload:", payload)
    print("🌐 Response:", response.status_code, response.text)

    if response.status_code in [200, 201]:
        print("✅ Logged to Airtable.")
        if not passed:
            slack_msg = f"🚨 *FAILED INTEGRATION:* {integration_name}\n{notes}"
            email_subject = f"FAILED: {integration_name}"
            email_body = f"Failure logged for {integration_name}\n\n{notes}"
            send_slack_alert(slack_msg)
            send_email_alert(email_subject, email_body)
        return True
    else:
        print("❌ Airtable log failed.")
        return False