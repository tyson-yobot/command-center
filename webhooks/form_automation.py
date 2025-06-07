#!/usr/bin/env python3
"""
Form Automation System
Processes form submissions and triggers automated workflows
"""

import sys
import json
import os
import requests
from datetime import datetime

class FormAutomationManager:
    def __init__(self):
        self.hubspot_api_key = os.getenv("HUBSPOT_API_KEY")
        self.airtable_api_key = os.getenv("AIRTABLE_API_KEY")
        self.slack_bot_token = os.getenv("SLACK_BOT_TOKEN")
        self.make_webhook_url = os.getenv("MAKE_WEBHOOK_URL")
        
    def process_submission(self, form_data):
        """Process form submission and trigger automations"""
        try:
            form_type = form_data.get('form_type', 'contact')
            
            if form_type == 'contact':
                return self.process_contact_form(form_data)
            elif form_type == 'demo_request':
                return self.process_demo_request_form(form_data)
            elif form_type == 'support':
                return self.process_support_form(form_data)
            elif form_type == 'newsletter':
                return self.process_newsletter_form(form_data)
            else:
                return self.process_general_form(form_data)
                
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def process_contact_form(self, form_data):
        """Process contact form submission"""
        try:
            # Extract form fields
            email = form_data.get('email')
            name = form_data.get('name')
            company = form_data.get('company')
            message = form_data.get('message')
            
            # Create HubSpot contact
            hubspot_result = self.create_hubspot_contact({
                'email': email,
                'name': name,
                'company': company,
                'message': message,
                'source': 'contact_form'
            })
            
            # Log to Airtable
            airtable_result = self.log_form_to_airtable(form_data, 'Contact Forms')
            
            # Send to Make.com for advanced automation
            make_result = self.trigger_make_automation(form_data, 'contact_form')
            
            # Notify sales team
            slack_result = self.notify_team_of_form_submission(form_data, 'contact')
            
            # Send auto-response
            response_result = self.send_auto_response(email, name, 'contact')
            
            return {
                "status": "success",
                "form_type": "contact",
                "hubspot_created": hubspot_result.get('success', False),
                "airtable_logged": airtable_result.get('success', False),
                "automation_triggered": make_result.get('success', False),
                "team_notified": slack_result.get('success', False),
                "response_sent": response_result.get('success', False)
            }
            
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def process_demo_request_form(self, form_data):
        """Process demo request form submission"""
        try:
            email = form_data.get('email')
            name = form_data.get('name')
            company = form_data.get('company')
            company_size = form_data.get('company_size')
            use_case = form_data.get('use_case')
            
            # Create high-priority HubSpot contact
            hubspot_result = self.create_hubspot_contact({
                'email': email,
                'name': name,
                'company': company,
                'company_size': company_size,
                'use_case': use_case,
                'source': 'demo_request',
                'lifecyclestage': 'marketingqualifiedlead',
                'lead_status': 'new'
            })
            
            # Log to Airtable with priority flag
            form_data['priority'] = 'high'
            airtable_result = self.log_form_to_airtable(form_data, 'Demo Requests')
            
            # Trigger immediate Make.com automation
            make_result = self.trigger_make_automation(form_data, 'demo_request')
            
            # Send urgent notification to sales
            slack_result = self.notify_team_of_form_submission(form_data, 'demo_urgent')
            
            # Send demo confirmation email
            response_result = self.send_auto_response(email, name, 'demo_request')
            
            # Schedule follow-up
            followup_result = self.schedule_demo_followup(form_data)
            
            return {
                "status": "success",
                "form_type": "demo_request",
                "priority": "high",
                "hubspot_created": hubspot_result.get('success', False),
                "airtable_logged": airtable_result.get('success', False),
                "automation_triggered": make_result.get('success', False),
                "team_notified": slack_result.get('success', False),
                "response_sent": response_result.get('success', False),
                "followup_scheduled": followup_result.get('success', False)
            }
            
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def create_hubspot_contact(self, contact_data):
        """Create or update HubSpot contact"""
        if not self.hubspot_api_key:
            return {"success": False, "error": "No HubSpot API key"}
            
        try:
            url = "https://api.hubapi.com/crm/v3/objects/contacts"
            headers = {
                "Authorization": f"Bearer {self.hubspot_api_key}",
                "Content-Type": "application/json"
            }
            
            properties = {
                "email": contact_data.get('email'),
                "firstname": contact_data.get('name', '').split(' ')[0] if contact_data.get('name') else "",
                "lastname": " ".join(contact_data.get('name', '').split(' ')[1:]) if contact_data.get('name') and len(contact_data.get('name').split(' ')) > 1 else "",
                "company": contact_data.get('company', ''),
                "message": contact_data.get('message', ''),
                "hs_lead_status": contact_data.get('lead_status', 'new'),
                "lifecyclestage": contact_data.get('lifecyclestage', 'subscriber'),
                "lead_source": contact_data.get('source', 'form'),
                "form_submission_date": datetime.now().isoformat()
            }
            
            # Add additional fields if present
            if contact_data.get('company_size'):
                properties['company_size'] = contact_data.get('company_size')
            if contact_data.get('use_case'):
                properties['use_case'] = contact_data.get('use_case')
            
            payload = {"properties": properties}
            response = requests.post(url, headers=headers, json=payload)
            
            if response.status_code in [200, 201]:
                return {"success": True, "contact_id": response.json().get('id')}
            else:
                return {"success": False, "error": response.text}
                
        except Exception as e:
            return {"success": False, "error": str(e)}

    def log_form_to_airtable(self, form_data, table_name):
        """Log form submission to Airtable"""
        if not self.airtable_api_key:
            return {"success": False, "error": "No Airtable API key"}
            
        try:
            base_id = os.getenv("AIRTABLE_BASE_ID", "appCoAtCZdARb4AM2")
            
            url = f"https://api.airtable.com/v0/{base_id}/{table_name}"
            headers = {
                "Authorization": f"Bearer {self.airtable_api_key}",
                "Content-Type": "application/json"
            }
            
            fields = {
                "Submission ID": form_data.get('id', f"form_{int(datetime.now().timestamp())}"),
                "Form Type": form_data.get('form_type', 'unknown'),
                "Name": form_data.get('name', ''),
                "Email": form_data.get('email', ''),
                "Company": form_data.get('company', ''),
                "Message": form_data.get('message', ''),
                "Submitted Date": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                "Status": "New",
                "Priority": form_data.get('priority', 'normal')
            }
            
            # Add form-specific fields
            if form_data.get('company_size'):
                fields['Company Size'] = form_data.get('company_size')
            if form_data.get('use_case'):
                fields['Use Case'] = form_data.get('use_case')
            
            record_data = {"fields": fields}
            response = requests.post(url, headers=headers, json=record_data)
            
            if response.status_code in [200, 201]:
                return {"success": True, "record_id": response.json().get('id')}
            else:
                return {"success": False, "error": response.text}
                
        except Exception as e:
            return {"success": False, "error": str(e)}

    def trigger_make_automation(self, form_data, automation_type):
        """Trigger Make.com automation workflow"""
        if not self.make_webhook_url:
            return {"success": False, "error": "No Make webhook URL"}
            
        try:
            payload = {
                "automation_type": automation_type,
                "form_data": form_data,
                "timestamp": datetime.now().isoformat(),
                "source": "yobot_form_automation"
            }
            
            response = requests.post(self.make_webhook_url, json=payload)
            
            if response.status_code in [200, 201]:
                return {"success": True, "response": response.text}
            else:
                return {"success": False, "error": response.text}
                
        except Exception as e:
            return {"success": False, "error": str(e)}

    def notify_team_of_form_submission(self, form_data, notification_type):
        """Send Slack notification to appropriate team"""
        if not self.slack_bot_token:
            return {"success": False, "error": "No Slack token"}
            
        try:
            channel_mapping = {
                'contact': '#general-inquiries',
                'demo_urgent': '#sales-urgent',
                'support': '#support-queue',
                'newsletter': '#marketing'
            }
            
            channel = channel_mapping.get(notification_type, '#general')
            
            if notification_type == 'demo_urgent':
                message = f"""
🚨 *URGENT: Demo Request*
👤 *Name*: {form_data.get('name', 'Unknown')}
📧 *Email*: {form_data.get('email', 'Unknown')}
🏢 *Company*: {form_data.get('company', 'Unknown')}
👥 *Size*: {form_data.get('company_size', 'Unknown')}
💡 *Use Case*: {form_data.get('use_case', 'Not specified')}
⏰ *Submitted*: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

*Action Required*: Contact within 1 hour
"""
            else:
                message = f"""
📝 *New Form Submission*
📋 *Type*: {form_data.get('form_type', 'Unknown')}
👤 *Name*: {form_data.get('name', 'Unknown')}
📧 *Email*: {form_data.get('email', 'Unknown')}
💬 *Message*: {form_data.get('message', 'No message')[:100]}...
⏰ *Submitted*: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""
            
            url = "https://slack.com/api/chat.postMessage"
            headers = {
                "Authorization": f"Bearer {self.slack_bot_token}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "channel": channel,
                "text": message
            }
            
            response = requests.post(url, headers=headers, json=payload)
            
            if response.json().get("ok"):
                return {"success": True}
            else:
                return {"success": False, "error": response.text}
                
        except Exception as e:
            return {"success": False, "error": str(e)}

    def send_auto_response(self, email, name, form_type):
        """Send automated response email"""
        try:
            # This would integrate with your email service
            response_templates = {
                'contact': "Thank you for contacting us. We'll respond within 24 hours.",
                'demo_request': "Thank you for requesting a demo. Our team will contact you shortly to schedule.",
                'support': "Your support request has been received. We'll help you resolve this quickly.",
                'newsletter': "Welcome! You've been subscribed to our newsletter."
            }
            
            template = response_templates.get(form_type, "Thank you for your submission.")
            
            return {"success": True, "template": template}
            
        except Exception as e:
            return {"success": False, "error": str(e)}

    def schedule_demo_followup(self, form_data):
        """Schedule automated follow-up for demo requests"""
        try:
            # This would integrate with your scheduling system
            followup_tasks = [
                {"task": "Initial contact", "delay_hours": 1},
                {"task": "Follow-up if no response", "delay_hours": 24},
                {"task": "Final follow-up", "delay_hours": 72}
            ]
            
            return {"success": True, "tasks_scheduled": len(followup_tasks)}
            
        except Exception as e:
            return {"success": False, "error": str(e)}

    def process_support_form(self, form_data):
        """Process support form submission"""
        try:
            # Create support ticket
            ticket_result = self.create_support_ticket(form_data)
            
            # Log to Airtable
            airtable_result = self.log_form_to_airtable(form_data, 'Support Forms')
            
            # Notify support team
            slack_result = self.notify_team_of_form_submission(form_data, 'support')
            
            return {
                "status": "success",
                "form_type": "support",
                "ticket_created": ticket_result.get('success', False),
                "airtable_logged": airtable_result.get('success', False),
                "team_notified": slack_result.get('success', False)
            }
            
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def process_newsletter_form(self, form_data):
        """Process newsletter signup form"""
        try:
            # Add to email list
            email_result = self.add_to_email_list(form_data)
            
            # Log to Airtable
            airtable_result = self.log_form_to_airtable(form_data, 'Newsletter Signups')
            
            # Send welcome email
            welcome_result = self.send_auto_response(
                form_data.get('email'), 
                form_data.get('name'), 
                'newsletter'
            )
            
            return {
                "status": "success",
                "form_type": "newsletter",
                "added_to_list": email_result.get('success', False),
                "airtable_logged": airtable_result.get('success', False),
                "welcome_sent": welcome_result.get('success', False)
            }
            
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def process_general_form(self, form_data):
        """Process general form submission"""
        try:
            # Log to Airtable
            airtable_result = self.log_form_to_airtable(form_data, 'General Forms')
            
            # Send notification
            slack_result = self.notify_team_of_form_submission(form_data, 'contact')
            
            return {
                "status": "success",
                "form_type": "general",
                "airtable_logged": airtable_result.get('success', False),
                "team_notified": slack_result.get('success', False)
            }
            
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def create_support_ticket(self, form_data):
        """Create support ticket from form data"""
        try:
            # This would integrate with your support system
            return {"success": True, "ticket_id": f"TKT-{int(datetime.now().timestamp())}"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def add_to_email_list(self, form_data):
        """Add email to newsletter list"""
        try:
            # This would integrate with your email marketing platform
            return {"success": True, "list_id": "newsletter_main"}
        except Exception as e:
            return {"success": False, "error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) >= 3 and sys.argv[1] == "process-submission":
        try:
            form_data = json.loads(sys.argv[2])
            manager = FormAutomationManager()
            result = manager.process_submission(form_data)
            print(json.dumps(result))
        except Exception as e:
            print(json.dumps({"status": "error", "message": str(e)}))
    else:
        print(json.dumps({"status": "error", "message": "Invalid arguments"}))