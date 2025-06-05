"""
PhantomBuster Lead Generation Integration
Social media and web scraping automation for YoBot
"""
import requests
import os
import time
from datetime import datetime

class PhantomBusterScraper:
    def __init__(self, api_key=None):
        self.api_key = api_key or os.getenv("PHANTOMBUSTER_API_KEY")
        self.base_url = "https://api.phantombuster.com/api/v2"
        
    def launch_phantom_scrape(self, phantom_id, arguments=None, wait_for_completion=True):
        """Launch a PhantomBuster automation"""
        if not self.api_key:
            return {"error": "PhantomBuster API key required"}
            
        headers = {
            "X-Phantombuster-Key": self.api_key,
            "Content-Type": "application/json"
        }
        
        url = f"{self.base_url}/agents/{phantom_id}/launch"
        payload = {
            "arguments": arguments or {}
        }
        
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            if response.status_code == 200:
                data = response.json()
                container_id = data.get("containerId")
                
                if wait_for_completion and container_id:
                    return self.wait_for_completion(container_id)
                return data
            else:
                return {"error": f"PhantomBuster API error: {response.status_code}"}
        except Exception as e:
            return {"error": f"PhantomBuster request failed: {str(e)}"}
    
    def wait_for_completion(self, container_id, max_wait=300):
        """Wait for PhantomBuster job completion"""
        headers = {
            "X-Phantombuster-Key": self.api_key
        }
        
        start_time = time.time()
        while time.time() - start_time < max_wait:
            try:
                url = f"{self.base_url}/containers/{container_id}/fetch"
                response = requests.get(url, headers=headers)
                
                if response.status_code == 200:
                    data = response.json()
                    status = data.get("status")
                    
                    if status in ["finished", "error"]:
                        return self.get_results(container_id)
                    
                    time.sleep(10)  # Wait 10 seconds before next check
                else:
                    return {"error": f"Status check failed: {response.status_code}"}
            except Exception as e:
                return {"error": f"Status check error: {str(e)}"}
        
        return {"error": "Timeout waiting for completion"}
    
    def get_results(self, container_id):
        """Get results from completed PhantomBuster job"""
        headers = {
            "X-Phantombuster-Key": self.api_key
        }
        
        try:
            url = f"{self.base_url}/containers/{container_id}/fetch"
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                output = data.get("output", "")
                result_object = data.get("resultObject", {})
                
                return {
                    "status": "completed",
                    "output": output,
                    "results": result_object,
                    "container_id": container_id
                }
            else:
                return {"error": f"Results fetch failed: {response.status_code}"}
        except Exception as e:
            return {"error": f"Results fetch error: {str(e)}"}
    
    def get_agent_list(self):
        """Get list of available PhantomBuster agents"""
        if not self.api_key:
            return {"error": "PhantomBuster API key required"}
            
        headers = {
            "X-Phantombuster-Key": self.api_key
        }
        
        try:
            url = f"{self.base_url}/agents/fetch-all"
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                return response.json()
            else:
                return {"error": f"Agent list fetch failed: {response.status_code}"}
        except Exception as e:
            return {"error": f"Agent list error: {str(e)}"}

def launch_linkedin_scraper(search_query, location="United States", results_limit=25):
    """Launch LinkedIn lead scraping with PhantomBuster"""
    phantom = PhantomBusterScraper()
    
    # LinkedIn Sales Navigator scraper arguments
    arguments = {
        "searches": search_query,
        "numberOfResultsPerSearch": results_limit,
        "location": location,
        "removeDuplicateProfiles": True
    }
    
    # Use a common LinkedIn scraper phantom ID (replace with actual ID)
    phantom_id = "linkedin-sales-navigator-scraper"
    
    return phantom.launch_phantom_scrape(phantom_id, arguments)

def launch_google_maps_scraper(business_type, location, results_limit=25):
    """Launch Google Maps business scraping with PhantomBuster"""
    phantom = PhantomBusterScraper()
    
    arguments = {
        "searchKeyword": business_type,
        "location": location,
        "maxResults": results_limit,
        "extractEmails": True,
        "extractPhones": True
    }
    
    # Use a Google Maps scraper phantom ID (replace with actual ID)
    phantom_id = "google-maps-scraper"
    
    return phantom.launch_phantom_scrape(phantom_id, arguments)

if __name__ == "__main__":
    # Test PhantomBuster integration
    phantom = PhantomBusterScraper()
    
    # Get available agents
    agents = phantom.get_agent_list()
    print("Available PhantomBuster agents:", agents)
    
    # Test LinkedIn scraping
    linkedin_results = launch_linkedin_scraper("roofing contractor", "Texas", 10)
    print("LinkedIn scraping results:", linkedin_results)