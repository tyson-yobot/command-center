"""
PhantomBuster Lead Processing Handler
Processes leads from PhantomBuster, cleans data, and pushes to Airtable CRM
"""
import os
import requests
from datetime import datetime, timedelta
from phantombuster_request_module import get_phantom_results, download_csv_from_phantom
from airtable_test_logger import log_test_to_airtable

# LinkedIn Agent Configuration
LINKEDIN_MSG_AGENT_ID = os.getenv('LINKEDIN_MSG_AGENT_ID')

def clean_lead_row(row):
    """Clean and format lead data for CRM entry"""
    name = row.get("name", "").strip()
    company = row.get("company", "").strip()
    
    return {
        "👤 Name": name,
        "🏢 Company": company,
        "📧 Email": row.get("email", "").lower(),
        "🔗 LinkedIn": row.get("linkedin", ""),
        "🧠 Source": "PhantomBuster",
        "🕵️‍♂️ Lead Status": "🆕 New – Needs Contact",
        "💬 Intro Message": f"Hi {name}, I came across {company} and thought YoBot® could help automate your ops. Can I show you a demo?"
    }

def send_lead_to_airtable(lead):
    """Send cleaned lead data to Airtable CRM"""
    base_id = os.getenv('AIRTABLE_BASE_ID')
    api_key = os.getenv('AIRTABLE_API_KEY')
    
    if not base_id or not api_key:
        log_test_to_airtable("Airtable CRM Push", False, "Missing AIRTABLE_BASE_ID or AIRTABLE_API_KEY", "Lead Generation")
        return False
    
    url = f"https://api.airtable.com/v0/{base_id}/🧑‍💼%20CRM%20Contacts"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    data = { "fields": lead }
    
    try:
        res = requests.post(url, headers=headers, json=data)
        if res.status_code == 200:
            log_test_to_airtable("Airtable CRM Push", True, f"Lead added: {lead['👤 Name']}", "Lead Generation")
            return True
        else:
            log_test_to_airtable("Airtable CRM Push", False, f"Error {res.status_code}: {res.text}", "Lead Generation")
            return False
    except Exception as e:
        log_test_to_airtable("Airtable CRM Push", False, f"Exception: {str(e)}", "Lead Generation")
        return False

def is_hot_lead(lead):
    """Determine if lead is high-priority based on keywords"""
    keywords = ["CTO", "Founder", "AI", "Innovation", "Automation", "CEO", "VP", "Director"]
    company = lead.get("🏢 Company", "").upper()
    name = lead.get("👤 Name", "").upper()
    return any(k.upper() in company or k.upper() in name for k in keywords)

def post_to_slack(message):
    """Send notification to Slack"""
    webhook_url = os.getenv('SLACK_WEBHOOK_URL')
    if not webhook_url:
        log_test_to_airtable("Slack Notification", False, "Missing SLACK_WEBHOOK_URL", "Lead Generation")
        return False
    
    try:
        payload = {"text": message}
        res = requests.post(webhook_url, json=payload)
        if res.status_code == 200:
            log_test_to_airtable("Slack Notification", True, f"Sent: {message}", "Lead Generation")
            return True
        else:
            log_test_to_airtable("Slack Notification", False, f"Error {res.status_code}", "Lead Generation")
            return False
    except Exception as e:
        log_test_to_airtable("Slack Notification", False, f"Exception: {str(e)}", "Lead Generation")
        return False

def process_phantom_leads(container_id):
    """Process leads from PhantomBuster container"""
    print(f"Processing leads from container: {container_id}")
    
    # Get results from PhantomBuster
    results = get_phantom_results(container_id)
    if not results:
        log_test_to_airtable("Lead Processing", False, "No results from PhantomBuster", "Lead Generation")
        return 0
    
    # Process each lead
    processed_count = 0
    hot_leads_count = 0
    
    # Handle both JSON array and single object responses
    leads_data = results if isinstance(results, list) else [results]
    
    for row in leads_data:
        try:
            # Clean the lead data
            cleaned = clean_lead_row(row)
            
            # Check if it's a hot lead
            if is_hot_lead(cleaned):
                cleaned["🔥 Priority Tag"] = "🔥 High-Intent"
                hot_leads_count += 1
                
                # Send Slack notification for hot leads
                post_to_slack(f"🔥 New hot lead: {cleaned['👤 Name']} @ {cleaned['🏢 Company']}")
            
            # Send to Airtable CRM
            if send_lead_to_airtable(cleaned):
                processed_count += 1
                
        except Exception as e:
            log_test_to_airtable("Lead Processing", False, f"Error processing lead: {str(e)}", "Lead Generation")
    
    # Log final results
    log_test_to_airtable(
        "Lead Processing Complete", 
        True, 
        f"Processed {processed_count} leads, {hot_leads_count} hot leads identified", 
        "Lead Generation"
    )
    
    return processed_count

def send_linkedin_message(profile_url, message_text):
    """Send LinkedIn message via PhantomBuster"""
    url = "https://api.phantombuster.com/api/v2/agents/launch"
    headers = {
        "X-Phantombuster-Key-1": os.getenv('PHANTOMBUSTER_API_KEY'),
        "Content-Type": "application/json"
    }
    payload = {
        "id": LINKEDIN_MSG_AGENT_ID,
        "arguments": {
            "sessionCookie": os.getenv("LINKEDIN_SESSION_COOKIE"),
            "profileUrls": [profile_url],
            "message": message_text
        }
    }
    try:
        res = requests.post(url, headers=headers, json=payload)
        success = res.status_code == 200
        log_test_to_airtable("LinkedIn Auto-Message", success, f"Message sent to {profile_url}", "LinkedIn Automation")
        return success
    except Exception as e:
        log_test_to_airtable("LinkedIn Auto-Message", False, f"Error: {str(e)}", "LinkedIn Automation")
        return False

def create_follow_up_task(lead):
    """Create follow-up task in Airtable"""
    base_id = os.getenv('AIRTABLE_BASE_ID')
    api_key = os.getenv('AIRTABLE_API_KEY')
    
    if not base_id or not api_key:
        return False
        
    url = f"https://api.airtable.com/v0/{base_id}/Follow-Up%20Reminder%20Tracker"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    data = {
        "fields": {
            "Contact Name": lead["👤 Name"],
            "Company": lead["🏢 Company"],
            "Follow-Up Date": (datetime.now() + timedelta(days=3)).strftime('%Y-%m-%d'),
            "Task": f"Follow up with {lead['👤 Name']} from {lead['🏢 Company']}",
            "Priority": "🔥 High-Intent" if lead.get("🔥 Priority Tag") else "📋 Standard",
            "Status": "⏳ Pending"
        }
    }
    try:
        res = requests.post(url, headers=headers, json=data)
        success = res.status_code == 200
        log_test_to_airtable("Follow-Up Task Created", success, f"Task for {lead['👤 Name']}", "Task Automation")
        return success
    except Exception as e:
        log_test_to_airtable("Follow-Up Task Created", False, f"Error: {str(e)}", "Task Automation")
        return False

def track_email_open(lead_email):
    """Generate email tracking pixel"""
    tracking_pixel_url = f"https://yourdomain.com/track?email={lead_email}"
    return f'<img src="{tracking_pixel_url}" width="1" height="1" style="display:none;" />'

def trigger_voicebot_call(phone_number, message):
    """Trigger VoiceBot call for follow-up"""
    payload = {
        "to": phone_number,
        "message": message
    }
    try:
        res = requests.post("https://your-voicebot-endpoint.com/call", json=payload)
        success = res.status_code == 200
        log_test_to_airtable("VoiceBot Call", success, f"Call to {phone_number}", "VoiceBot Automation")
        return success
    except Exception as e:
        log_test_to_airtable("VoiceBot Call", False, f"Error: {str(e)}", "VoiceBot Automation")
        return False

def send_sms_fallback(phone_number, text):
    """Send SMS fallback if VoiceBot fails"""
    payload = {
        "to": phone_number,
        "body": text
    }
    try:
        res = requests.post("https://your-sms-endpoint.com/send", json=payload)
        success = res.status_code == 200
        log_test_to_airtable("SMS Fallback", success, f"SMS to {phone_number}", "SMS Automation")
        return success
    except Exception as e:
        log_test_to_airtable("SMS Fallback", False, f"Error: {str(e)}", "SMS Automation")
        return False

def log_contact_attempt(method, lead_name):
    """Log contact attempt to Airtable"""
    log_test_to_airtable(
        "Follow-Up Contact", 
        True, 
        f"Attempted via {method} for {lead_name}", 
        "Contact Tracking"
    )

def update_crm_notes(lead_record_id, note):
    """Update CRM notes with contact timeline"""
    base_id = os.getenv('AIRTABLE_BASE_ID')
    api_key = os.getenv('AIRTABLE_API_KEY')
    
    if not base_id or not api_key or not lead_record_id:
        return False
        
    url = f"https://api.airtable.com/v0/{base_id}/CRM%20Contacts/{lead_record_id}"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    data = {
        "fields": {
            "Notes": f"{timestamp}: {note}"
        }
    }
    try:
        res = requests.patch(url, headers=headers, json=data)
        success = res.status_code == 200
        log_test_to_airtable("CRM Notes Update", success, f"Updated notes: {note}", "CRM Automation")
        return success
    except Exception as e:
        log_test_to_airtable("CRM Notes Update", False, f"Error: {str(e)}", "CRM Automation")
        return False

def check_follow_ups():
    """Check overdue follow-ups and escalate to VoiceBot"""
    base_id = os.getenv('AIRTABLE_BASE_ID')
    api_key = os.getenv('AIRTABLE_API_KEY')
    
    if not base_id or not api_key:
        return
        
    today = datetime.now().date()
    url = f"https://api.airtable.com/v0/{base_id}/Follow-Up%20Reminder%20Tracker"
    headers = {
        "Authorization": f"Bearer {api_key}"
    }
    
    try:
        res = requests.get(url, headers=headers)
        overdue_count = 0
        
        for record in res.json().get("records", []):
            fields = record.get("fields", {})
            due_date_str = fields.get("Follow-Up Date")
            
            if due_date_str:
                due = datetime.strptime(due_date_str, '%Y-%m-%d').date()
                if due <= today and fields.get("Status") != "✅ Completed":
                    name = fields.get("Contact Name", "Unknown")
                    phone = fields.get("Phone", "")
                    
                    overdue_count += 1
                    
                    # Escalate to VoiceBot
                    if phone:
                        message = f"Hi, this is YoBot following up on our automation discussion. Just checking in!"
                        if trigger_voicebot_call(phone, message):
                            log_contact_attempt("VoiceBot", name)
                            update_crm_notes(record["id"], "VoiceBot follow-up call attempted")
                        else:
                            # Fallback to SMS
                            sms_text = "Sorry I missed you! Just wanted to follow up on YoBot automation."
                            if send_sms_fallback(phone, sms_text):
                                log_contact_attempt("SMS", name)
                                update_crm_notes(record["id"], "SMS fallback sent")
        
        log_test_to_airtable("Follow-Up Check", True, f"Processed {overdue_count} overdue follow-ups", "Follow-Up Automation")
        
    except Exception as e:
        log_test_to_airtable("Follow-Up Check", False, f"Error: {str(e)}", "Follow-Up Automation")

def update_lead_status(lead_record_id, new_status):
    """Update lead status based on response activity"""
    base_id = os.getenv('AIRTABLE_BASE_ID')
    api_key = os.getenv('AIRTABLE_API_KEY')
    
    if not base_id or not api_key or not lead_record_id:
        return False
        
    url = f"https://api.airtable.com/v0/{base_id}/CRM%20Contacts/{lead_record_id}"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    data = {
        "fields": {
            "Lead Status": new_status
        }
    }
    try:
        res = requests.patch(url, headers=headers, json=data)
        success = res.status_code == 200
        log_test_to_airtable("Lead Status Update", success, f"Status changed to: {new_status}", "CRM Automation")
        return success
    except Exception as e:
        log_test_to_airtable("Lead Status Update", False, f"Error: {str(e)}", "CRM Automation")
        return False

def process_hot_lead_automation(lead):
    """Process hot lead with full automation workflow"""
    if lead.get("🔥 Priority Tag") == "🔥 High-Intent":
        # Step 1: Send LinkedIn message
        if lead.get("🔗 LinkedIn"):
            intro_message = lead.get("💬 Intro Message", "")
            # Add email tracking pixel
            intro_message += track_email_open(lead.get("📧 Email", ""))
            send_linkedin_message(lead["🔗 LinkedIn"], intro_message)
        
        # Step 2: Create follow-up task
        create_follow_up_task(lead)
        
        # Step 3: Log the automation
        log_test_to_airtable("Hot Lead Automation", True, f"Full automation triggered for {lead['👤 Name']}", "Lead Automation")

def test_lead_processing_system():
    """Test the complete lead processing system"""
    print("Testing Lead Processing System...")
    
    # Test with sample lead data
    sample_lead = {
        "name": "Sarah Chen",
        "company": "AI Innovation Corp",
        "email": "sarah.chen@aiinnovation.com",
        "linkedin": "https://linkedin.com/in/sarahchen"
    }
    
    # Test lead cleaning
    cleaned = clean_lead_row(sample_lead)
    print(f"Cleaned lead: {cleaned}")
    
    # Test hot lead detection
    is_hot = is_hot_lead(cleaned)
    print(f"Is hot lead: {is_hot}")
    
    if is_hot:
        cleaned["🔥 Priority Tag"] = "🔥 High-Intent"
        # Test hot lead automation
        process_hot_lead_automation(cleaned)
    
    # Test Airtable push
    result = send_lead_to_airtable(cleaned)
    print(f"Airtable push result: {result}")
    
    # Test follow-up checker
    check_follow_ups()
    
    return result

if __name__ == "__main__":
    test_lead_processing_system()