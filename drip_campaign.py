"""
Drip Campaign - Automated Follow-up Communications
Sends follow-up messages and schedules additional touchpoints for voicemail contacts
"""
import os
import requests
from datetime import datetime, timezone, timedelta
import json

def run_drip_campaign():
    """
    Execute daily drip campaign for voicemail follow-ups
    """
    try:
        # Get contacts who received voicemails in the last 7 days
        contacts = get_recent_voicemail_contacts()
        
        # Process each contact for appropriate follow-up
        for contact in contacts:
            process_contact_followup(contact)
        
        print(f"✅ Drip campaign processed {len(contacts)} contacts")
        
    except Exception as e:
        print(f"❌ Drip campaign error: {e}")

def get_recent_voicemail_contacts():
    """
    Get contacts who left voicemails in the last 7 days
    """
    try:
        airtable_url = f"https://api.airtable.com/v0/{os.getenv('AIRTABLE_BASE_ID')}/{os.getenv('TABLE_ID')}"
        headers = {
            "Authorization": f"Bearer {os.getenv('AIRTABLE_KEY')}",
            "Content-Type": "application/json"
        }
        
        # Get voicemails from last 7 days
        seven_days_ago = (datetime.now(timezone.utc) - timedelta(days=7)).strftime("%Y-%m-%d")
        
        params = {
            "filterByFormula": f"AND({{📄 Call Outcome}} = '📩 Voicemail', IS_AFTER(CREATED_TIME(), '{seven_days_ago}'))",
            "sort[0][field]": "📞 Caller Phone",
            "sort[0][direction]": "asc"
        }
        
        response = requests.get(airtable_url, headers=headers, params=params)
        
        if response.status_code == 200:
            records = response.json().get('records', [])
            
            # Group by phone number to avoid duplicate follow-ups
            contacts = {}
            for record in records:
                fields = record['fields']
                phone = fields.get('📞 Caller Phone', '')
                created_time = record.get('createdTime', '')
                
                if phone and phone not in contacts:
                    contacts[phone] = {
                        'phone': phone,
                        'message': fields.get('📝 Caller Message', ''),
                        'created_time': created_time,
                        'record_id': record['id'],
                        'days_since': calculate_days_since(created_time)
                    }
            
            return list(contacts.values())
            
        else:
            print(f"❌ Contact fetch error: {response.status_code}")
            return []
            
    except Exception as e:
        print(f"❌ Contact retrieval error: {e}")
        return []

def calculate_days_since(created_time_str):
    """
    Calculate days since record creation
    """
    try:
        created_time = datetime.fromisoformat(created_time_str.replace('Z', '+00:00'))
        current_time = datetime.now(timezone.utc)
        return (current_time - created_time).days
    except:
        return 0

def process_contact_followup(contact):
    """
    Process follow-up actions based on contact timeline
    """
    try:
        days_since = contact['days_since']
        phone = contact['phone']
        
        # Day 1: Thank you + callback confirmation
        if days_since == 1:
            send_followup_sms(phone, "day_1_thanks")
            
        # Day 3: Status update request
        elif days_since == 3:
            send_followup_sms(phone, "day_3_update")
            
        # Day 7: Final follow-up
        elif days_since == 7:
            send_followup_sms(phone, "day_7_final")
            
        # Log the follow-up action
        log_followup_action(contact, days_since)
        
    except Exception as e:
        print(f"❌ Contact follow-up error: {e}")

def send_followup_sms(phone_number, message_type):
    """
    Send appropriate follow-up SMS based on message type
    """
    try:
        messages = {
            "day_1_thanks": "Thank you for your message yesterday. We're working on getting back to you soon. Reply STOP to opt out.",
            
            "day_3_update": "Hi! We wanted to check in about your recent message. Is there anything urgent we can help with? Reply STOP to opt out.",
            
            "day_7_final": "This is our final follow-up regarding your message from last week. If you still need assistance, please call us directly. Reply STOP to opt out."
        }
        
        message_body = messages.get(message_type, "Thank you for contacting us.")
        
        sms_url = f"https://api.twilio.com/2010-04-01/Accounts/{os.getenv('TWILIO_ACCOUNT_SID')}/Messages.json"
        
        sms_data = {
            "To": phone_number,
            "From": os.getenv('TWILIO_PHONE_NUMBER'),
            "Body": message_body
        }
        
        response = requests.post(
            sms_url,
            auth=(os.getenv('TWILIO_ACCOUNT_SID'), os.getenv('TWILIO_AUTH_TOKEN')),
            data=sms_data
        )
        
        if response.status_code == 201:
            print(f"📱 {message_type} SMS sent to {phone_number}")
            return True
        else:
            print(f"❌ SMS failed for {phone_number}: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ SMS send error: {e}")
        return False

def log_followup_action(contact, days_since):
    """
    Log follow-up action to Airtable
    """
    try:
        airtable_url = f"https://api.airtable.com/v0/{os.getenv('AIRTABLE_BASE_ID')}/{os.getenv('TABLE_ID')}"
        headers = {
            "Authorization": f"Bearer {os.getenv('AIRTABLE_KEY')}",
            "Content-Type": "application/json"
        }
        
        data = {
            "fields": {
                "📄 Call Outcome": f"📧 Day {days_since} Follow-up",
                "📞 Caller Phone": contact['phone'],
                "📝 Caller Message": f"Automated follow-up sent (Day {days_since})",
                "📅 Callback Scheduled": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")
            }
        }
        
        response = requests.post(airtable_url, headers=headers, json=data)
        
        if response.status_code == 200:
            print(f"📝 Follow-up logged for {contact['phone']}")
        else:
            print(f"❌ Logging failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Follow-up logging error: {e}")

def generate_drip_report():
    """
    Generate daily report of drip campaign activities
    """
    try:
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        
        # Get today's follow-up activities
        airtable_url = f"https://api.airtable.com/v0/{os.getenv('AIRTABLE_BASE_ID')}/{os.getenv('TABLE_ID')}"
        headers = {
            "Authorization": f"Bearer {os.getenv('AIRTABLE_KEY')}",
            "Content-Type": "application/json"
        }
        
        params = {
            "filterByFormula": f"AND(SEARCH('Follow-up', {{📄 Call Outcome}}) > 0, IS_AFTER(CREATED_TIME(), '{today}'))"
        }
        
        response = requests.get(airtable_url, headers=headers, params=params)
        
        if response.status_code == 200:
            records = response.json().get('records', [])
            
            # Categorize follow-ups
            day_1_count = len([r for r in records if 'Day 1' in r['fields'].get('📄 Call Outcome', '')])
            day_3_count = len([r for r in records if 'Day 3' in r['fields'].get('📄 Call Outcome', '')])
            day_7_count = len([r for r in records if 'Day 7' in r['fields'].get('📄 Call Outcome', '')])
            
            report = f"""
📧 Drip Campaign Daily Report - {today}

📊 Follow-ups Sent Today:
• Day 1 Thank You: {day_1_count}
• Day 3 Check-in: {day_3_count}  
• Day 7 Final: {day_7_count}
• Total: {len(records)}

🎯 Campaign Performance:
• Active contacts in pipeline
• Automated touchpoints maintaining engagement
• Professional follow-up sequence completed

📈 Next Actions:
• Continue monitoring response rates
• Update message templates based on feedback
• Track conversion metrics
"""
            
            # Send report summary
            send_drip_report_sms(report)
            
            return report
            
    except Exception as e:
        print(f"❌ Report generation error: {e}")
        return "Report generation failed"

def send_drip_report_sms(report_content):
    """
    Send drip campaign summary via SMS
    """
    try:
        # Extract key metrics for SMS
        lines = report_content.split('\n')
        sms_summary = f"📧 Drip Campaign Summary\n"
        
        for line in lines:
            if 'Day 1 Thank You:' in line or 'Day 3 Check-in:' in line or 'Day 7 Final:' in line or 'Total:' in line:
                sms_summary += line.strip() + '\n'
        
        sms_url = f"https://api.twilio.com/2010-04-01/Accounts/{os.getenv('TWILIO_ACCOUNT_SID')}/Messages.json"
        
        sms_data = {
            "To": "+17013718391",
            "From": os.getenv('TWILIO_PHONE_NUMBER'),
            "Body": sms_summary[:1500]
        }
        
        response = requests.post(
            sms_url,
            auth=(os.getenv('TWILIO_ACCOUNT_SID'), os.getenv('TWILIO_AUTH_TOKEN')),
            data=sms_data
        )
        
        if response.status_code == 201:
            print("📱 Drip campaign report sent")
        
    except Exception as e:
        print(f"❌ Report SMS error: {e}")

def check_opt_out_requests():
    """
    Process any STOP requests and update contact preferences
    """
    try:
        # This would integrate with Twilio webhook to process incoming STOP messages
        # For now, we'll implement the framework
        print("🚫 Checking for opt-out requests...")
        
        # In production, this would:
        # 1. Check for incoming "STOP" messages
        # 2. Add phone numbers to opt-out list
        # 3. Update contact preferences in Airtable
        # 4. Send confirmation of opt-out
        
    except Exception as e:
        print(f"❌ Opt-out check error: {e}")

if __name__ == "__main__":
    print("📧 Starting drip campaign...")
    run_drip_campaign()
    
    print("📊 Generating campaign report...")
    generate_drip_report()
    
    print("🚫 Checking opt-out requests...")
    check_opt_out_requests()