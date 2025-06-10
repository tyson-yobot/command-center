import requests
import smtplib
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

PASS_FAIL_OPTIONS = {
    True: "✅",
    False: "❌"
}

# Configuration
SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL", "")
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
ALERT_EMAILS = ["tyson@yobot.bot", "daniel@yobot.bot"]

def log_integration_test_to_airtable(
    integration_name: str,
    passed: bool,
    notes: str = "",
    qa_owner: str = "Daniel Sharpe",
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

    # Populate ALL fields with correct field names from Airtable schema
    status = PASS_FAIL_OPTIONS[passed]
    
    payload = {
        "fields": {
            "🔧 Integration Name": integration_name,
            "✅ Pass/Fail": status,
            "🧠 Notes / Debug": notes,
            "📅 Test Date": datetime.now().isoformat(),
            "🧑‍💻 QA Owner": qa_owner,
            "📤 Output Data Populated": output_data_populated,
            "🗃️ Record Created?": record_created,
            "🔁 Retry Attempted?": retry_attempted,
            "🧩 Module Type": module_type,
            "📂 Related Scenario Link": related_scenario_link
        }
    }

    response = requests.post(url, headers=headers, json=payload)
    print("📤 Payload:", payload)
    print("🌐 Response:", response.status_code, response.text)

    if response.status_code in [200, 201]:
        print("✅ Logged.")
        
        # Send alerts only on failure
        if not passed:
            send_slack_alert(integration_name, notes)
            send_email_alert(integration_name, notes)
    else:
        print("❌ Log failed.")

def send_slack_alert(integration_name: str, notes: str):
    """Send Slack alert for failed integration tests"""
    try:
        slack_payload = {
            "text": f"🚨 Integration Test FAILED",
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*Integration Test Failed*\n\n*Integration:* {integration_name}\n*Time:* {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n*Notes:* {notes}"
                    }
                }
            ]
        }
        
        response = requests.post(SLACK_WEBHOOK_URL, json=slack_payload)
        if response.status_code == 200:
            print("✅ Slack alert sent.")
        else:
            print(f"❌ Slack alert failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Slack alert error: {str(e)}")

def send_email_alert(integration_name: str, notes: str):
    """Send email alert for failed integration tests"""
    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USER
        msg['To'] = ", ".join(ALERT_EMAILS)
        msg['Subject'] = f"YoBot Integration Test Failed: {integration_name}"
        
        body = f"""
        Integration Test Failed
        
        Integration: {integration_name}
        Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        Notes: {notes}
        
        Please check the system and investigate the issue.
        
        YoBot Automation System
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Use Google Workspace SMTP settings
        if SMTP_USER and SMTP_PASS:
            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
        else:
            print("❌ Email credentials not configured - skipping email alert")
            return
        text = msg.as_string()
        server.sendmail(SMTP_USER, ALERT_EMAILS, text)
        server.quit()
        
        print("✅ Email alert sent.")
    except Exception as e:
        print(f"❌ Email alert error: {str(e)}")