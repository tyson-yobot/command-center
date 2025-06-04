"""
Apollo.io Lead Generation Integration
Advanced lead generation and scoring system for YoBot
"""
import requests
import os
from datetime import datetime

class ApolloLeadGeneration:
    def __init__(self, api_key=None):
        self.api_key = api_key or os.getenv("APOLLO_API_KEY")
        self.base_url = "https://api.apollo.io/v1"
        
    def launch_apollo_scrape(self, title, location, company_keywords, page=1, per_page=25):
        """Searches Apollo.io for leads"""
        if not self.api_key:
            return {"error": "Apollo API key required"}
            
        url = f"{self.base_url}/mixed_people/search"
        headers = {
            "Cache-Control": "no-cache",
            "Content-Type": "application/json",
            "x-api-key": self.api_key
        }
        payload = {
            "q_organization_keywords": company_keywords,
            "person_titles": [title],
            "locations": [location],
            "page": page,
            "per_page": per_page
        }
        
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            if response.status_code == 200:
                data = response.json()
                print(f"Apollo search returned {len(data.get('people', []))} leads")
                return data
            else:
                return {"error": f"Apollo API error: {response.status_code}"}
        except Exception as e:
            return {"error": f"Apollo request failed: {str(e)}"}
    
    def log_apollo_results_to_airtable(self, base_id, table_name, airtable_api_key, leads):
        """Posts Apollo leads to Airtable"""
        headers = {
            "Authorization": f"Bearer {airtable_api_key}",
            "Content-Type": "application/json"
        }
        url = f"https://api.airtable.com/v0/{base_id}/{table_name}"
        responses = []

        for lead in leads:
            record = {
                "fields": {
                    "🧑 Name": f"{lead.get('first_name', '')} {lead.get('last_name', '')}",
                    "📧 Email": lead.get("email", ""),
                    "📞 Phone": lead.get("phone_number", ""),
                    "🏢 Company": lead.get("organization_name", ""),
                    "🌍 Location": lead.get("city", ""),
                    "💼 Title": lead.get("title", ""),
                    "🔗 LinkedIn": lead.get("linkedin_url", ""),
                    "📅 Added": datetime.now().isoformat(),
                    "⭐ Priority Score": self.score_apollo_lead(
                        lead.get("title", ""), 
                        lead.get("organization_name", "")
                    )
                }
            }
            
            try:
                res = requests.post(url, headers=headers, json=record, timeout=30)
                responses.append(res.json())
            except Exception as e:
                responses.append({"error": str(e)})

        print(f"Logged {len(responses)} leads to Airtable")
        return responses
    
    def score_apollo_lead(self, title, company):
        """Gives a quick score for call priority"""
        score = 0
        title_lower = title.lower() if title else ""
        company_lower = company.lower() if company else ""
        
        # High-value titles
        if any(term in title_lower for term in ["owner", "founder", "ceo", "president"]):
            score += 50
        elif any(term in title_lower for term in ["manager", "director", "vp"]):
            score += 30
        elif any(term in title_lower for term in ["coordinator", "specialist"]):
            score += 15
        
        # Industry-specific scoring
        if any(term in company_lower for term in ["roof", "roofing", "hvac", "solar", "construction"]):
            score += 20
        elif any(term in company_lower for term in ["real estate", "insurance", "finance"]):
            score += 15
        
        # Company size indicators
        if any(term in company_lower for term in ["inc", "corp", "llc", "limited"]):
            score += 10
            
        return min(score, 100)  # Cap at 100
    
    def send_sms_followup(self, to_number, from_number, twilio_sid, twilio_token, message):
        """SMS follow-up from Twilio after a call attempt"""
        try:
            from twilio.rest import Client
            client = Client(twilio_sid, twilio_token)
            sms = client.messages.create(
                to=to_number,
                from_=from_number,
                body=message
            )
            print(f"SMS sent to {to_number}: {sms.sid}")
            return sms.sid
        except ImportError:
            return {"error": "Twilio package not available"}
        except Exception as e:
            return {"error": f"SMS failed: {str(e)}"}
    
    def update_lead_sentiment_score(self, base_id, table_name, airtable_api_key, record_id, sentiment_score):
        """Updates call sentiment score in Airtable"""
        url = f"https://api.airtable.com/v0/{base_id}/{table_name}/{record_id}"
        headers = {
            "Authorization": f"Bearer {airtable_api_key}",
            "Content-Type": "application/json"
        }
        payload = {"fields": {"🔊 Sentiment Score": sentiment_score}}
        
        try:
            response = requests.patch(url, headers=headers, json=payload, timeout=30)
            print(f"Updated sentiment score for record {record_id}")
            return response.json()
        except Exception as e:
            return {"error": f"Sentiment update failed: {str(e)}"}
    
    def run_complete_lead_generation_pipeline(self, search_params, airtable_config):
        """Run complete Apollo lead generation pipeline"""
        print("="*60)
        print("APOLLO LEAD GENERATION PIPELINE")
        print("="*60)
        
        # Step 1: Search Apollo for leads
        print("\n1. Searching Apollo.io for leads...")
        search_results = self.launch_apollo_scrape(
            title=search_params.get("title", "Owner"),
            location=search_params.get("location", "United States"),
            company_keywords=search_params.get("keywords", "roofing"),
            page=search_params.get("page", 1),
            per_page=search_params.get("per_page", 10)
        )
        
        if "error" in search_results:
            print(f"   Search failed: {search_results['error']}")
            return search_results
        
        leads = search_results.get("people", [])
        print(f"   Found {len(leads)} leads")
        
        # Step 2: Score and filter leads
        print("\n2. Scoring leads for priority...")
        scored_leads = []
        for lead in leads:
            score = self.score_apollo_lead(
                lead.get("title", ""), 
                lead.get("organization_name", "")
            )
            lead["priority_score"] = score
            if score >= 30:  # Only high-value leads
                scored_leads.append(lead)
        
        print(f"   {len(scored_leads)} high-priority leads identified")
        
        # Step 3: Log to Airtable
        if scored_leads and airtable_config:
            print("\n3. Logging leads to Airtable...")
            airtable_results = self.log_apollo_results_to_airtable(
                base_id=airtable_config.get("base_id"),
                table_name=airtable_config.get("table_name", "Apollo Leads"),
                airtable_api_key=airtable_config.get("api_key"),
                leads=scored_leads
            )
            print(f"   Logged {len(airtable_results)} records")
        
        # Results summary
        pipeline_results = {
            "total_found": len(leads),
            "high_priority": len(scored_leads),
            "logged_to_airtable": len(scored_leads) if airtable_config else 0,
            "top_leads": sorted(scored_leads, key=lambda x: x["priority_score"], reverse=True)[:5],
            "timestamp": datetime.now().isoformat()
        }
        
        print(f"\n📊 Pipeline Results:")
        print(f"   Total leads found: {pipeline_results['total_found']}")
        print(f"   High-priority leads: {pipeline_results['high_priority']}")
        print(f"   Logged to Airtable: {pipeline_results['logged_to_airtable']}")
        
        return pipeline_results

def test_apollo_integration():
    """Test Apollo lead generation system"""
    apollo = ApolloLeadGeneration()
    
    # Test search parameters
    search_params = {
        "title": "Owner",
        "location": "Texas",
        "keywords": "roofing contractor",
        "page": 1,
        "per_page": 5
    }
    
    # Test Airtable configuration
    airtable_config = {
        "base_id": os.getenv("AIRTABLE_BASE_ID"),
        "table_name": "Apollo Leads",
        "api_key": os.getenv("AIRTABLE_API_KEY")
    }
    
    # Run pipeline
    results = apollo.run_complete_lead_generation_pipeline(
        search_params, 
        airtable_config if airtable_config["api_key"] else None
    )
    
    return results

if __name__ == "__main__":
    print("Testing Apollo Lead Generation Integration...")
    test_results = test_apollo_integration()
    
    if "error" not in test_results:
        print("\n✅ Apollo integration ready for production")
    else:
        print(f"\n❌ Apollo integration needs API key: {test_results.get('error')}")