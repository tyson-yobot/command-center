#!/usr/bin/env python3
"""
Enhanced Automation Workflows
Implements specific automation patterns with logging integration
"""

import requests
import os
from datetime import datetime
from universal_webhook_logger import log_to_airtable
from external_service_loggers import log_qbo_invoice_automation, log_slack_notification

class QuickBooksAutomation:
    def __init__(self):
        self.access_token = os.getenv("QUICKBOOKS_ACCESS_TOKEN")
        self.realm_id = os.getenv("QUICKBOOKS_REALM_ID")
        self.base_url = f"https://quickbooks.api.intuit.com/v3/company/{self.realm_id}"
    
    def create_invoice_from_crm(self, customer_data, item_data, amount):
        """Create QuickBooks invoice from CRM deal closure"""
        try:
            url = f"{self.base_url}/invoice"
            headers = {
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
            
            invoice_data = {
                "CustomerRef": {"value": customer_data.get("qb_customer_id", "1")},
                "Line": [{
                    "Amount": amount,
                    "DetailType": "SalesItemLineDetail",
                    "SalesItemLineDetail": {
                        "ItemRef": {"value": item_data.get("qb_item_id", "1")}
                    }
                }]
            }
            
            response = requests.post(url, headers=headers, json=invoice_data, timeout=15)
            
            if response.status_code == 200:
                invoice = response.json()
                invoice_id = invoice.get("QueryResponse", {}).get("Invoice", [{}])[0].get("Id")
                
                # Log successful invoice creation
                log_qbo_invoice_automation(
                    deal_id=customer_data.get("deal_id"),
                    customer_name=customer_data.get("name"),
                    customer_email=customer_data.get("email"),
                    invoice_id=invoice_id,
                    amount=amount
                )
                
                return {"success": True, "invoice_id": invoice_id}
            else:
                # Log failed invoice creation
                log_to_airtable("QBO Invoice Errors", {
                    "customer_name": customer_data.get("name"),
                    "amount": amount,
                    "error": f"API Error: {response.status_code}",
                    "timestamp": datetime.utcnow().isoformat()
                })
                
                return {"success": False, "error": f"QB API Error: {response.status_code}"}
                
        except Exception as e:
            log_to_airtable("QBO Invoice Errors", {
                "customer_name": customer_data.get("name", "Unknown"),
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            })
            
            return {"success": False, "error": str(e)}
    
    def get_qbo_entities(self):
        """Fetch QuickBooks customers and products"""
        try:
            headers = {
                "Authorization": f"Bearer {self.access_token}",
                "Accept": "application/json"
            }
            
            # Get customers
            customers_response = requests.get(
                f"{self.base_url}/query?query=SELECT * FROM Customer MAXRESULTS 100",
                headers=headers,
                timeout=10
            )
            
            # Get items/products
            items_response = requests.get(
                f"{self.base_url}/query?query=SELECT * FROM Item MAXRESULTS 100",
                headers=headers,
                timeout=10
            )
            
            customers = customers_response.json() if customers_response.status_code == 200 else {}
            items = items_response.json() if items_response.status_code == 200 else {}
            
            # Log entity fetch
            log_to_airtable("QBO Entity Fetches", {
                "customers_count": len(customers.get("QueryResponse", {}).get("Customer", [])),
                "items_count": len(items.get("QueryResponse", {}).get("Item", [])),
                "timestamp": datetime.utcnow().isoformat()
            })
            
            return {"customers": customers, "items": items}
            
        except Exception as e:
            log_to_airtable("QBO Entity Fetch Errors", {
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            })
            
            return {"error": str(e)}

class SlackAutomation:
    def __init__(self):
        self.webhook_url = os.getenv("SLACK_WEBHOOK_URL")
    
    def post_lead_summary(self, lead_info):
        """Post lead summary to Slack channel"""
        try:
            message = {
                "text": f"🎯 *New Lead Captured*",
                "attachments": [{
                    "color": "good",
                    "fields": [
                        {"title": "Name", "value": lead_info.get("name", "N/A"), "short": True},
                        {"title": "Email", "value": lead_info.get("email", "N/A"), "short": True},
                        {"title": "Source", "value": lead_info.get("source", "Web"), "short": True},
                        {"title": "Score", "value": str(lead_info.get("score", 0)), "short": True}
                    ]
                }]
            }
            
            response = requests.post(self.webhook_url, json=message, timeout=10)
            
            # Log Slack notification
            log_slack_notification(
                channel="#leads",
                message_type="lead_capture",
                content=f"New lead: {lead_info.get('name')}",
                triggered_by_event="crm_lead_creation"
            )
            
            return response.status_code == 200
            
        except Exception as e:
            log_to_airtable("Slack Notification Errors", {
                "lead_name": lead_info.get("name", "Unknown"),
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            })
            
            return False

class ChatToCRMAutomation:
    def __init__(self):
        self.hubspot_api_key = os.getenv("HUBSPOT_API_KEY")
    
    def capture_chat_to_crm(self, chat_data):
        """Capture web chat data to CRM system"""
        try:
            url = "https://api.hubapi.com/crm/v3/objects/contacts"
            headers = {
                "Authorization": f"Bearer {self.hubspot_api_key}",
                "Content-Type": "application/json"
            }
            
            contact_data = {
                "properties": {
                    "firstname": chat_data.get("name", ""),
                    "email": chat_data.get("email", ""),
                    "last_chat_message": chat_data.get("message", ""),
                    "hs_lead_status": "NEW",
                    "lifecyclestage": "lead",
                    "lead_source": "Live Chat"
                }
            }
            
            response = requests.post(url, headers=headers, json=contact_data, timeout=10)
            
            if response.status_code in [200, 201]:
                contact = response.json()
                contact_id = contact.get("id")
                
                # Log successful chat capture
                log_to_airtable("Chat to CRM Captures", {
                    "name": chat_data.get("name"),
                    "email": chat_data.get("email"),
                    "contact_id": contact_id,
                    "message_preview": chat_data.get("message", "")[:100],
                    "timestamp": datetime.utcnow().isoformat()
                })
                
                return {"success": True, "contact_id": contact_id}
            else:
                # Log failed capture
                log_to_airtable("Chat to CRM Errors", {
                    "name": chat_data.get("name"),
                    "error": f"HubSpot API Error: {response.status_code}",
                    "timestamp": datetime.utcnow().isoformat()
                })
                
                return {"success": False, "error": f"HubSpot API Error: {response.status_code}"}
                
        except Exception as e:
            log_to_airtable("Chat to CRM Errors", {
                "name": chat_data.get("name", "Unknown"),
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            })
            
            return {"success": False, "error": str(e)}

class LeadScoringAutomation:
    def score_lead(self, lead_data):
        """Score lead based on activity and behavior"""
        try:
            score = 0
            scoring_factors = []
            
            # Activity-based scoring
            if lead_data.get("visited_pricing"):
                score += 50
                scoring_factors.append("visited_pricing")
            
            if lead_data.get("opened_emails", 0) > 3:
                score += 30
                scoring_factors.append("email_engagement")
            
            if lead_data.get("clicked_demo"):
                score += 20
                scoring_factors.append("demo_interest")
            
            if lead_data.get("downloaded_content"):
                score += 15
                scoring_factors.append("content_download")
            
            if lead_data.get("visited_multiple_pages", 0) > 5:
                score += 10
                scoring_factors.append("site_engagement")
            
            # Demographic scoring
            if lead_data.get("company_size", 0) > 50:
                score += 25
                scoring_factors.append("company_size")
            
            if lead_data.get("job_title", "").lower() in ["ceo", "founder", "vp", "director"]:
                score += 20
                scoring_factors.append("decision_maker")
            
            # Assign score category
            if score >= 80:
                category = "🔥 Hot"
            elif score >= 50:
                category = "🟡 Warm"
            elif score >= 20:
                category = "🧊 Cold"
            else:
                category = "❄️ Frozen"
            
            # Log lead scoring
            log_to_airtable("Lead Scoring Results", {
                "lead_name": lead_data.get("name", "Unknown"),
                "lead_email": lead_data.get("email", ""),
                "score": score,
                "category": category,
                "scoring_factors": ", ".join(scoring_factors),
                "timestamp": datetime.utcnow().isoformat()
            })
            
            return {
                "score": score,
                "category": category,
                "factors": scoring_factors
            }
            
        except Exception as e:
            log_to_airtable("Lead Scoring Errors", {
                "lead_name": lead_data.get("name", "Unknown"),
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            })
            
            return {"error": str(e)}

# Initialize automation classes
qb_automation = QuickBooksAutomation()
slack_automation = SlackAutomation()
chat_automation = ChatToCRMAutomation()
scoring_automation = LeadScoringAutomation()

if __name__ == "__main__":
    print("Enhanced automation workflows initialized successfully")
    
    # Test lead scoring
    test_lead = {
        "name": "John Smith",
        "email": "john@company.com",
        "visited_pricing": True,
        "opened_emails": 5,
        "clicked_demo": True,
        "company_size": 100,
        "job_title": "CEO"
    }
    
    result = scoring_automation.score_lead(test_lead)
    print(f"Lead scoring result: {result}")