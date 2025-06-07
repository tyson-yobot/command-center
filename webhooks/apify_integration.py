"""
Apify Lead Generation Integration
Web scraping and data extraction automation for YoBot
"""
import requests
import os
import time
from datetime import datetime

class ApifyScraper:
    def __init__(self, api_key=None):
        self.api_key = api_key or os.getenv("APIFY_API_KEY") or "apify_api_RH0E0HyvexOfmaoCYXwdT1W8tWar8i3mcjDl"
        self.base_url = "https://api.apify.com/v2"
        
    def launch_apify_scrape(self, actor_id, input_data, wait_for_completion=True):
        """Launch an Apify actor for scraping"""
        if not self.api_key:
            return {"error": "Apify API key required"}
            
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        url = f"{self.base_url}/acts/{actor_id}/runs"
        
        try:
            response = requests.post(url, headers=headers, json=input_data, timeout=30)
            if response.status_code in [200, 201]:
                data = response.json()
                run_id = data.get("data", {}).get("id")
                
                if wait_for_completion and run_id:
                    return self.wait_for_completion(run_id)
                return data
            else:
                return {"error": f"Apify API error: {response.status_code}"}
        except Exception as e:
            return {"error": f"Apify request failed: {str(e)}"}
    
    def wait_for_completion(self, run_id, max_wait=300):
        """Wait for Apify run completion"""
        headers = {
            "Authorization": f"Bearer {self.api_key}"
        }
        
        start_time = time.time()
        while time.time() - start_time < max_wait:
            try:
                url = f"{self.base_url}/actor-runs/{run_id}"
                response = requests.get(url, headers=headers)
                
                if response.status_code == 200:
                    data = response.json()
                    status = data.get("data", {}).get("status")
                    
                    if status in ["SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"]:
                        return self.get_results(run_id)
                    
                    time.sleep(10)  # Wait 10 seconds before next check
                else:
                    return {"error": f"Status check failed: {response.status_code}"}
            except Exception as e:
                return {"error": f"Status check error: {str(e)}"}
        
        return {"error": "Timeout waiting for completion"}
    
    def get_results(self, run_id):
        """Get results from completed Apify run"""
        headers = {
            "Authorization": f"Bearer {self.api_key}"
        }
        
        try:
            url = f"{self.base_url}/actor-runs/{run_id}/dataset/items"
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                results = response.json()
                return {
                    "status": "completed",
                    "results": results,
                    "run_id": run_id,
                    "total_items": len(results) if isinstance(results, list) else 0
                }
            else:
                return {"error": f"Results fetch failed: {response.status_code}"}
        except Exception as e:
            return {"error": f"Results fetch error: {str(e)}"}
    
    def get_actor_list(self):
        """Get list of available Apify actors"""
        if not self.api_key:
            return {"error": "Apify API key required"}
            
        headers = {
            "Authorization": f"Bearer {self.api_key}"
        }
        
        try:
            url = f"{self.base_url}/acts"
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                return response.json()
            else:
                return {"error": f"Actor list fetch failed: {response.status_code}"}
        except Exception as e:
            return {"error": f"Actor list error: {str(e)}"}

def launch_google_maps_apify(search_query, location="United States", results_limit=25):
    """Launch Google Maps scraping with Apify"""
    apify = ApifyScraper()
    
    # Google Maps actor input
    input_data = {
        "searchStringsArray": [f"{search_query} {location}"],
        "maxCrawledPlacesPerSearch": results_limit,
        "language": "en",
        "exportPlaceUrls": False,
        "additionalInfo": True,
        "includeImages": False
    }
    
    # Popular Google Maps scraper actor ID
    actor_id = "nwua9Gu5YrADL7ZDj"  # Google Maps Scraper by apify
    
    return apify.launch_apify_scrape(actor_id, input_data)

def launch_yellow_pages_apify(business_type, location="United States", results_limit=25):
    """Launch Yellow Pages scraping with Apify"""
    apify = ApifyScraper()
    
    input_data = {
        "searchTerms": [business_type],
        "locations": [location],
        "maxItems": results_limit,
        "includeReviews": False,
        "includeImages": False
    }
    
    # Yellow Pages scraper actor ID (example)
    actor_id = "yellow-pages-scraper"
    
    return apify.launch_apify_scrape(actor_id, input_data)

def launch_linkedin_apify(search_query, location="United States", results_limit=25):
    """Launch LinkedIn scraping with Apify"""
    apify = ApifyScraper()
    
    input_data = {
        "searchTerms": [search_query],
        "locationFilter": location,
        "maxResults": results_limit,
        "includeProfiles": True
    }
    
    # LinkedIn scraper actor ID (example)
    actor_id = "linkedin-scraper"
    
    return apify.launch_apify_scrape(actor_id, input_data)

if __name__ == "__main__":
    # Test Apify integration
    apify = ApifyScraper()
    
    # Get available actors
    actors = apify.get_actor_list()
    print("Available Apify actors:", actors)
    
    # Test Google Maps scraping
    gmaps_results = launch_google_maps_apify("roofing contractor", "Texas", 10)
    print("Google Maps scraping results:", gmaps_results)