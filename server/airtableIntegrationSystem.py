import requests
from datetime import datetime
import json
import os

class AirtableIntegrationSystem:
    def __init__(self):
        self.api_key = os.getenv('AIRTABLE_API_KEY', '')
        self.base_id = os.getenv('AIRTABLE_BASE_ID', 'appRt8V3tH4g5Z5if')
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # Table IDs from your specification
        self.crm_table_id = "tblNduMZl17CL4VvJ"
        self.sales_table_id = "tbl1Rp3OIH8r8sIkC"
        self.roadmap_table_id = "tblbeUZzSBQnQdi7r"
        self.template_table_id = "tblR33FZs0xF44sZk"
        
    def upsert_crm_contact(self, quote_data):
        """
        Upsert contact to CRM Contacts table with duplicate prevention
        """
        try:
            email = quote_data.get('email', '').strip()
            
            # First, check if contact exists
            filter_formula = f"{{📧 Email}} = '{email}'"
            existing_url = f"https://api.airtable.com/v0/{self.base_id}/{self.crm_table_id}?filterByFormula={filter_formula}"
            
            existing_response = requests.get(existing_url, headers=self.headers)
            existing_records = existing_response.json().get('records', [])
            
            contact_data = {
                "👤 Full Name": quote_data.get('contact_name', ''),
                "📧 Email": email,
                "🏢 Company Name": quote_data.get('company_name', ''),
                "📞 Phone": quote_data.get('phone', ''),
                "🔢 Quote #": quote_data.get('quote_number', ''),
                "📆 Quote Date": quote_data.get('quote_date', datetime.now().strftime("%Y-%m-%d"))
            }
            
            if existing_records:
                # Update existing record
                record_id = existing_records[0]['id']
                update_url = f"https://api.airtable.com/v0/{self.base_id}/{self.crm_table_id}/{record_id}"
                response = requests.patch(update_url, headers=self.headers, json={"fields": contact_data})
                return {
                    "success": True,
                    "action": "updated",
                    "record_id": record_id,
                    "message": f"Updated existing contact for {email}"
                }
            else:
                # Create new record
                create_url = f"https://api.airtable.com/v0/{self.base_id}/{self.crm_table_id}"
                response = requests.post(create_url, headers=self.headers, json={"fields": contact_data})
                
                if response.status_code == 200:
                    record_id = response.json()['id']
                    return {
                        "success": True,
                        "action": "created",
                        "record_id": record_id,
                        "message": f"Created new contact for {email}"
                    }
                else:
                    return {
                        "success": False,
                        "error": f"Failed to create contact: {response.text}"
                    }
                    
        except Exception as e:
            return {
                "success": False,
                "error": f"CRM contact upsert failed: {str(e)}"
            }
    
    def create_sales_order(self, quote_data):
        """
        Create sales order record
        """
        try:
            sales_data = {
                "🏢 Company Name": quote_data.get('company_name', ''),
                "👤 Contact Name": quote_data.get('contact_name', ''),
                "💬 Selected Add-Ons": ", ".join(quote_data.get('add_ons', [])),
                "🤖 Bot Package Selected": quote_data.get('bot_package', ''),
                "💳 Monthly Total": quote_data.get('monthly_total', 0),
                "💰 One-Time Total": quote_data.get('one_time_total', 0),
                "🧾 Quote Number": quote_data.get('quote_number', ''),
                "📆 Quote Date": quote_data.get('quote_date', datetime.now().strftime("%Y-%m-%d")),
                "✅ 50% Deposit Received": "✅" if quote_data.get('deposit_received', False) else ""
            }
            
            url = f"https://api.airtable.com/v0/{self.base_id}/{self.sales_table_id}"
            response = requests.post(url, headers=self.headers, json={"fields": sales_data})
            
            if response.status_code == 200:
                record_id = response.json()['id']
                return {
                    "success": True,
                    "record_id": record_id,
                    "message": f"Created sales order {quote_data.get('quote_number', '')}"
                }
            else:
                return {
                    "success": False,
                    "error": f"Failed to create sales order: {response.text}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Sales order creation failed: {str(e)}"
            }
    
    def create_roadmap_tasks(self, quote_data):
        """
        Create project roadmap tasks from template table
        """
        try:
            created_tasks = []
            
            # Get all items to process (bot package + add-ons)
            all_items = [quote_data.get('bot_package', '')] + quote_data.get('add_ons', [])
            
            for item in all_items:
                if not item:
                    continue
                    
                # Search for matching tasks in template table
                filter_formula = f"FIND('{item}', {{📦 Package or Add-On}})"
                template_url = f"https://api.airtable.com/v0/{self.base_id}/{self.template_table_id}?filterByFormula={filter_formula}"
                
                template_response = requests.get(template_url, headers=self.headers)
                template_records = template_response.json().get('records', [])
                
                for record in template_records:
                    task_name = record['fields'].get('📌 Task', '')
                    
                    if task_name:
                        # Create roadmap task
                        roadmap_data = {
                            "📌 Task": task_name,
                            "🏢 Company": quote_data.get('company_name', ''),
                            "🧾 Quote Number": quote_data.get('quote_number', ''),
                            "👤 Assigned To": "Daniel Sharpe",
                            "📥 Source": "Quote Automation"
                        }
                        
                        roadmap_url = f"https://api.airtable.com/v0/{self.base_id}/{self.roadmap_table_id}"
                        roadmap_response = requests.post(roadmap_url, headers=self.headers, json={"fields": roadmap_data})
                        
                        if roadmap_response.status_code == 200:
                            created_tasks.append({
                                "task": task_name,
                                "record_id": roadmap_response.json()['id']
                            })
            
            return {
                "success": True,
                "created_tasks": created_tasks,
                "message": f"Created {len(created_tasks)} roadmap tasks"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Roadmap task creation failed: {str(e)}"
            }
    
    def create_hubspot_contact(self, quote_data):
        """
        Create HubSpot contact
        """
        try:
            hubspot_token = os.getenv('HUBSPOT_API_KEY', '')
            
            if not hubspot_token:
                return {
                    "success": False,
                    "error": "HubSpot API key not configured"
                }
            
            contact_name = quote_data.get('contact_name', '')
            name_parts = contact_name.split()
            
            hubspot_data = {
                "properties": {
                    "email": quote_data.get('email', ''),
                    "firstname": name_parts[0] if name_parts else '',
                    "lastname": name_parts[-1] if len(name_parts) > 1 else '',
                    "company": quote_data.get('company_name', ''),
                    "phone": quote_data.get('phone', ''),
                    "quote_number": quote_data.get('quote_number', ''),
                    "bot_package": quote_data.get('bot_package', '')
                }
            }
            
            hubspot_headers = {
                "Authorization": f"Bearer {hubspot_token}",
                "Content-Type": "application/json"
            }
            
            url = "https://api.hubapi.com/crm/v3/objects/contacts"
            response = requests.post(url, headers=hubspot_headers, json=hubspot_data)
            
            if response.status_code == 201:
                return {
                    "success": True,
                    "contact_id": response.json()['id'],
                    "message": "HubSpot contact created successfully"
                }
            else:
                return {
                    "success": False,
                    "error": f"HubSpot contact creation failed: {response.text}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"HubSpot integration failed: {str(e)}"
            }
    
    def process_complete_quote_automation(self, quote_data):
        """
        Execute complete quote automation workflow
        """
        results = {
            "quote_number": quote_data.get('quote_number', ''),
            "company_name": quote_data.get('company_name', ''),
            "crm_contact": None,
            "sales_order": None,
            "roadmap_tasks": None,
            "hubspot_contact": None,
            "overall_success": True,
            "errors": []
        }
        
        # 1. CRM Contact (with upsert)
        crm_result = self.upsert_crm_contact(quote_data)
        results["crm_contact"] = crm_result
        if not crm_result["success"]:
            results["overall_success"] = False
            results["errors"].append(f"CRM: {crm_result['error']}")
        
        # 2. Sales Order
        sales_result = self.create_sales_order(quote_data)
        results["sales_order"] = sales_result
        if not sales_result["success"]:
            results["overall_success"] = False
            results["errors"].append(f"Sales: {sales_result['error']}")
        
        # 3. Roadmap Tasks
        roadmap_result = self.create_roadmap_tasks(quote_data)
        results["roadmap_tasks"] = roadmap_result
        if not roadmap_result["success"]:
            results["overall_success"] = False
            results["errors"].append(f"Roadmap: {roadmap_result['error']}")
        
        # 4. HubSpot Contact
        hubspot_result = self.create_hubspot_contact(quote_data)
        results["hubspot_contact"] = hubspot_result
        if not hubspot_result["success"]:
            results["overall_success"] = False
            results["errors"].append(f"HubSpot: {hubspot_result['error']}")
        
        return results

def main():
    """
    Test the complete automation system
    """
    # Test data matching your specification
    test_quote_data = {
        "company_name": "AMT66",
        "contact_name": "Tyson B.",
        "email": "tyson@yobot.bot",
        "phone": "701-371-8391",
        "quote_number": "Q-20250106-001",
        "quote_date": datetime.now().strftime("%Y-%m-%d"),
        "bot_package": "🤖 Platinum Bot Package",
        "monthly_total": 2247,  # 1999 + 149 + 99
        "one_time_total": 27498,  # 25000 + 1499 + 999
        "add_ons": ["📊 SmartSpend™ Dashboard", "🧠 AI Content Studio"],
        "deposit_received": True
    }
    
    # Execute complete automation
    integration = AirtableIntegrationSystem()
    result = integration.process_complete_quote_automation(test_quote_data)
    
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()