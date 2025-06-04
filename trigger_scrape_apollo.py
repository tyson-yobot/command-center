"""
Apollo.io Lead Scraper
Scrapes leads from Apollo and pushes to Airtable
"""

import requests
import os
from datetime import datetime
from command_center_dispatcher import CommandCenterDispatcher
from slack_alerts import alert_system

class ApolloScraperSystem:
    def __init__(self):
        self.apollo_api_key = os.getenv("APOLLO_API_KEY")
        self.airtable_api_key = os.getenv("AIRTABLE_API_KEY")
        self.airtable_base_id = os.getenv("AIRTABLE_BASE_ID")
        self.dispatcher = CommandCenterDispatcher()
        
    def scrape_leads_from_apollo(self, query="construction", limit=10):
        """Scrape leads from Apollo.io API"""
        if not self.apollo_api_key:
            return {"error": "Apollo API key not configured"}
        
        try:
            headers = {
                "Authorization": f"Bearer {self.apollo_api_key}",
                "Content-Type": "application/json"
            }
            
            url = f"https://api.apollo.io/v1/contacts/search?query={query}&limit={limit}"
            response = requests.get(url, headers=headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                contacts = data.get("contacts", [])
                
                self.dispatcher.log_command_center_event(
                    "apollo_scrape",
                    f"🧲 Scraped {len(contacts)} leads from Apollo"
                )
                
                return {"success": True, "contacts": contacts, "count": len(contacts)}
            else:
                error_msg = f"Apollo API error: {response.status_code} - {response.text}"
                alert_system.alert_api_failure("Apollo", response.status_code, response.text)
                return {"error": error_msg}
                
        except Exception as e:
            error_msg = f"Apollo scraping failed: {str(e)}"
            alert_system.alert_system_failure("Apollo Scraper", str(e))
            return {"error": error_msg}
    
    def push_to_airtable(self, lead):
        """Push lead to Airtable CRM table"""
        if not self.airtable_api_key or not self.airtable_base_id:
            return {"error": "Airtable credentials not configured"}
        
        try:
            url = f"https://api.airtable.com/v0/{self.airtable_base_id}/🧠%20Lead%20Engine"
            headers = {
                "Authorization": f"Bearer {self.airtable_api_key}",
                "Content-Type": "application/json"
            }
            
            fields = {
                "👤 Full Name": lead.get("name", "Unknown"),
                "📧 Email": lead.get("email", ""),
                "📞 Phone": lead.get("phone", ""),
                "🏢 Company": lead.get("organization", ""),
                "💼 Title": lead.get("title", ""),
                "📊 Lead Source": "Apollo.io",
                "📅 Date Added": datetime.now().isoformat(),
                "🏷️ Status": "New Lead"
            }
            
            response = requests.post(
                url,
                json={"records": [{"fields": fields}]},
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                record_id = result.get("records", [{}])[0].get("id", "unknown")
                return {"success": True, "record_id": record_id}
            else:
                return {"error": f"Airtable error: {response.status_code}"}
                
        except Exception as e:
            return {"error": f"Airtable push failed: {str(e)}"}
    
    def scrape_and_push_leads(self, query="construction", limit=10):
        """Complete scrape and push workflow"""
        try:
            # Scrape leads from Apollo
            scrape_result = self.scrape_leads_from_apollo(query, limit)
            
            if not scrape_result.get("success"):
                return scrape_result
            
            contacts = scrape_result.get("contacts", [])
            pushed_count = 0
            errors = []
            
            # Push each lead to Airtable
            for lead in contacts:
                push_result = self.push_to_airtable(lead)
                if push_result.get("success"):
                    pushed_count += 1
                    self.dispatcher.log_command_center_event(
                        "lead_added",
                        f"🧲 Apollo lead added: {lead.get('name', 'Unknown')}"
                    )
                else:
                    errors.append(push_result.get("error"))
            
            return {
                "success": True,
                "scraped": len(contacts),
                "pushed": pushed_count,
                "errors": errors,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            error_msg = f"Scrape and push workflow failed: {str(e)}"
            alert_system.alert_system_failure("Apollo Workflow", str(e))
            return {"error": error_msg}

def handler(request):
    """Handle Apollo scraping requests"""
    scraper = ApolloScraperSystem()
    
    try:
        data = request.json if hasattr(request, 'json') else {}
        query = data.get("query", "construction")
        limit = data.get("limit", 10)
        
        result = scraper.scrape_and_push_leads(query, limit)
        
        if result.get("success"):
            return {
                "scraped": result.get("scraped"),
                "pushed": result.get("pushed"),
                "timestamp": result.get("timestamp")
            }
        else:
            return {"error": result.get("error")}
            
    except Exception as e:
        return {"error": f"Apollo handler failed: {str(e)}"}

# Global scraper system
apollo_scraper = ApolloScraperSystem()

def scrape_apollo_leads(query="construction", limit=10):
    """Quick function for Apollo lead scraping"""
    return apollo_scraper.scrape_and_push_leads(query, limit)

if __name__ == "__main__":
    # Test Apollo scraper
    test_request = type('Request', (), {
        'json': {
            "query": "roofing contractor",
            "limit": 5
        }
    })()
    
    result = handler(test_request)
    print(f"Apollo scraper test result: {result}")