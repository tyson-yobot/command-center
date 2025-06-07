#!/usr/bin/env python3
"""
Working Lead Scraper - Direct Apollo API Integration
Handles authentic lead data from Apollo.io with proper error handling
"""

import os
import requests
import json
import sys
from datetime import datetime

def scrape_apollo_leads(company_name="", industry="", location="", job_titles=None, max_contacts=25):
    """
    Scrape authentic leads from Apollo.io API
    """
    api_key = os.environ.get('APOLLO_API_KEY')
    if not api_key:
        return {
            'success': False,
            'error': 'Apollo API key not configured',
            'leads': []
        }
    
    # Prepare search parameters
    search_params = {
        'page': 1,
        'per_page': min(int(max_contacts), 100)
    }
    
    # Add filters if provided
    if company_name:
        search_params['q_organization_name'] = company_name
    
    if industry:
        search_params['q_organization_industry_tag_names'] = [industry]
    
    if location:
        search_params['q_organization_locations'] = [location]
    
    # Handle job titles properly
    if job_titles:
        if isinstance(job_titles, list):
            search_params['person_titles'] = job_titles
        elif isinstance(job_titles, str):
            # Split comma-separated string
            search_params['person_titles'] = [t.strip() for t in job_titles.split(',')]
        else:
            search_params['person_titles'] = ['Director']
    
    try:
        # Make Apollo API request
        response = requests.post(
            'https://api.apollo.io/v1/mixed_people/search',
            headers={
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                'X-Api-Key': api_key
            },
            json=search_params,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            people = data.get('people', [])
            
            # Format leads consistently
            formatted_leads = []
            for person in people:
                lead = {
                    'name': f"{person.get('first_name', '')} {person.get('last_name', '')}".strip(),
                    'title': person.get('title', ''),
                    'company': person.get('organization', {}).get('name', ''),
                    'email': person.get('email', ''),
                    'phone': person.get('phone_numbers', [{}])[0].get('sanitized_number', '') if person.get('phone_numbers') else '',
                    'location': f"{person.get('city', '')}, {person.get('state', '')}".strip(', '),
                    'linkedin_url': person.get('linkedin_url', ''),
                    'verified': person.get('email_status') == 'verified',
                    'source': 'Apollo.io'
                }
                formatted_leads.append(lead)
            
            return {
                'success': True,
                'leads': formatted_leads,
                'total_found': data.get('pagination', {}).get('total_entries', len(formatted_leads)),
                'source': 'Apollo.io',
                'timestamp': datetime.now().isoformat()
            }
            
        elif response.status_code == 401:
            return {
                'success': False,
                'error': 'Apollo API authentication failed - please check API key',
                'leads': []
            }
        elif response.status_code == 429:
            return {
                'success': False,
                'error': 'Apollo API rate limit exceeded - please try again later',
                'leads': []
            }
        else:
            return {
                'success': False,
                'error': f'Apollo API error: {response.status_code} - {response.text}',
                'leads': []
            }
            
    except requests.exceptions.Timeout:
        return {
            'success': False,
            'error': 'Apollo API request timed out',
            'leads': []
        }
    except requests.exceptions.RequestException as e:
        return {
            'success': False,
            'error': f'Apollo API connection failed: {str(e)}',
            'leads': []
        }
    except Exception as e:
        return {
            'success': False,
            'error': f'Unexpected error: {str(e)}',
            'leads': []
        }

def main():
    """Main function for command line usage"""
    if len(sys.argv) > 1:
        try:
            # Parse JSON input from command line
            params = json.loads(sys.argv[1])
        except json.JSONDecodeError:
            print(json.dumps({
                'success': False,
                'error': 'Invalid JSON input'
            }))
            return
    else:
        # Default test parameters
        params = {
            'company_name': 'Microsoft',
            'job_titles': ['CEO', 'CTO', 'Director'],
            'max_contacts': 10
        }
    
    # Execute lead scraping
    result = scrape_apollo_leads(
        company_name=params.get('company_name', ''),
        industry=params.get('industry', ''),
        location=params.get('location', ''),
        job_titles=params.get('job_titles', []),
        max_contacts=params.get('max_contacts', 25)
    )
    
    # Output results
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()