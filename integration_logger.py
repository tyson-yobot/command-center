# ========== FILE: integration_logger.py ==========

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
    airtable_api_key = "paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa"
    base_id = "appRt8V3tH4g5Z5if"
    table_id = "tbly0fjE2M5uHET9X"
    url = f"https://api.airtable.com/v0/{base_id}/{table_id}"

    headers = {
        "Authorization": f"Bearer {airtable_api_key}",
        "Content-Type": "application/json"
    }

    # Match exact field names from your Airtable screenshot
    payload = {
        "fields": {
            "Integration Name": integration_name,
            "Pass/Fail": PASS_FAIL_OPTIONS[passed],
            "Notes / Debug": notes,
            "Test Date": datetime.now().isoformat(),
            "QA Owner": qa_owner,
            "Output Data Populated": output_data_populated,
            "Record Created?": record_created,
            "Retry Attempted?": retry_attempted,
            "Module Type": module_type,
            "Related Scenario Link": related_scenario_link
        }
    }

    response = requests.post(url, headers=headers, json=payload)
    print("📤 Payload:", payload)
    print("🌐 Response:", response.status_code, response.text)

    if response.status_code in [200, 201]:
        print("✅ Logged.")
    else:
        print("❌ Log failed.")

    if not passed:
        slack_msg = f"🚨 *FAILED INTEGRATION:* {integration_name}\n{notes}"
        email_subject = f"FAILED: {integration_name}"
        email_body = f"Failure logged for {integration_name}\n\n{notes}"
        send_slack_alert(slack_msg)
        send_email_alert(email_subject, email_body)