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

def test_lead_processing_system():
    """Test the complete lead processing system"""
    print("Testing Lead Processing System...")
    
    # Test with sample lead data
    sample_lead = {
        "name": "John Smith",
        "company": "AI Innovation Corp",
        "email": "john.smith@aiinnovation.com",
        "linkedin": "https://linkedin.com/in/johnsmith"
    }
    
    # Test lead cleaning
    cleaned = clean_lead_row(sample_lead)
    print(f"Cleaned lead: {cleaned}")
    
    # Test hot lead detection
    is_hot = is_hot_lead(cleaned)
    print(f"Is hot lead: {is_hot}")
    
    if is_hot:
        cleaned["🔥 Priority Tag"] = "🔥 High-Intent"
    
    # Test Airtable push
    result = send_lead_to_airtable(cleaned)
    print(f"Airtable push result: {result}")
    
    return result

if __name__ == "__main__":
    test_lead_processing_system()