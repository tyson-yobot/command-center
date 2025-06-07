#!/usr/bin/env python3
"""
Comprehensive Lead Generation Engine
Uses multiple authenticated sources to generate authentic lead data
"""

import os
import requests
import json
import sys
from datetime import datetime
import random

class LeadGenerationEngine:
    def __init__(self):
        self.airtable_key = os.environ.get('AIRTABLE_API_KEY')
        self.hubspot_key = os.environ.get('HUBSPOT_API_KEY')
        self.apollo_key = os.environ.get('APOLLO_API_KEY')
        
    def generate_leads(self, company_name="", industry="", location="", job_titles=None, max_contacts=25):
        """
        Generate authentic leads using available data sources
        """
        results = {
            'success': False,
            'leads': [],
            'total_found': 0,
            'sources_used': [],
            'timestamp': datetime.now().isoformat()
        }
        
        # Try HubSpot first for existing contacts
        if self.hubspot_key:
            hubspot_leads = self._get_hubspot_contacts(company_name, industry, location)
            if hubspot_leads:
                results['leads'].extend(hubspot_leads)
                results['sources_used'].append('HubSpot')
        
        # Try Airtable for existing lead database
        if self.airtable_key:
            airtable_leads = self._get_airtable_leads(company_name, industry, location)
            if airtable_leads:
                results['leads'].extend(airtable_leads)
                results['sources_used'].append('Airtable')
        
        # If we have leads from authenticated sources
        if results['leads']:
            # Enhance with job title filtering
            if job_titles:
                filtered_leads = []
                for lead in results['leads']:
                    if any(title.lower() in lead.get('title', '').lower() for title in job_titles):
                        filtered_leads.append(lead)
                results['leads'] = filtered_leads
            
            # Limit results
            results['leads'] = results['leads'][:max_contacts]
            results['total_found'] = len(results['leads'])
            results['success'] = True
            
            return results
        
        # If no authenticated sources available, return error
        return {
            'success': False,
            'error': 'No authenticated lead sources available. Please configure HubSpot, Airtable, or Apollo API keys.',
            'leads': [],
            'suggestion': 'Set up your HubSpot API key or Airtable credentials to access existing contact databases.'
        }
    
    def _get_hubspot_contacts(self, company_name, industry, location):
        """Get contacts from HubSpot"""
        if not self.hubspot_key:
            return []
            
        try:
            url = "https://api.hubapi.com/crm/v3/objects/contacts"
            headers = {
                'Authorization': f'Bearer {self.hubspot_key}',
                'Content-Type': 'application/json'
            }
            
            # Build search filters
            filters = []
            if company_name:
                filters.append({
                    'propertyName': 'company',
                    'operator': 'CONTAINS_TOKEN',
                    'value': company_name
                })
            
            if industry:
                filters.append({
                    'propertyName': 'industry',
                    'operator': 'CONTAINS_TOKEN',
                    'value': industry
                })
            
            search_data = {
                'filterGroups': [{'filters': filters}] if filters else [],
                'properties': ['firstname', 'lastname', 'email', 'phone', 'company', 'jobtitle', 'city', 'state'],
                'limit': 100
            }
            
            response = requests.post(f'{url}/search', headers=headers, json=search_data, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                leads = []
                
                for contact in data.get('results', []):
                    props = contact.get('properties', {})
                    lead = {
                        'name': f"{props.get('firstname', '')} {props.get('lastname', '')}".strip(),
                        'title': props.get('jobtitle', ''),
                        'company': props.get('company', ''),
                        'email': props.get('email', ''),
                        'phone': props.get('phone', ''),
                        'location': f"{props.get('city', '')}, {props.get('state', '')}".strip(', '),
                        'source': 'HubSpot',
                        'verified': True
                    }
                    leads.append(lead)
                
                return leads
                
        except Exception as e:
            print(f"HubSpot API error: {e}")
            
        return []
    
    def _get_airtable_leads(self, company_name, industry, location):
        """Get leads from Airtable CRM database"""
        if not self.airtable_key:
            return []
            
        try:
            # Use the main CRM base
            base_id = os.environ.get('AIRTABLE_BASE_ID', 'appMbVQJ0n3nWR11N')
            table_name = 'CRM Contacts'
            
            url = f"https://api.airtable.com/v0/{base_id}/{table_name}"
            headers = {
                'Authorization': f'Bearer {self.airtable_key}',
                'Content-Type': 'application/json'
            }
            
            # Build filter formula
            filters = []
            if company_name:
                filters.append(f"SEARCH('{company_name}', {{Company}})")
            if industry:
                filters.append(f"SEARCH('{industry}', {{Industry}})")
            if location:
                filters.append(f"SEARCH('{location}', {{Location}})")
            
            params = {
                'maxRecords': 100,
                'view': 'Grid view'
            }
            
            if filters:
                filter_formula = 'AND(' + ', '.join(filters) + ')'
                params['filterByFormula'] = filter_formula
            
            response = requests.get(url, headers=headers, params=params, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                leads = []
                
                for record in data.get('records', []):
                    fields = record.get('fields', {})
                    lead = {
                        'name': fields.get('Full Name', ''),
                        'title': fields.get('Job Title', ''),
                        'company': fields.get('Company', ''),
                        'email': fields.get('Email', ''),
                        'phone': fields.get('Phone', ''),
                        'location': fields.get('Location', ''),
                        'source': 'Airtable CRM',
                        'verified': fields.get('Email Verified', False)
                    }
                    leads.append(lead)
                
                return leads
                
        except Exception as e:
            print(f"Airtable API error: {e}")
            
        return []

def main():
    """Main function for command line usage"""
    if len(sys.argv) > 1:
        try:
            params = json.loads(sys.argv[1])
        except json.JSONDecodeError:
            print(json.dumps({
                'success': False,
                'error': 'Invalid JSON input'
            }))
            return
    else:
        params = {
            'company_name': '',
            'industry': 'Technology',
            'job_titles': ['CEO', 'CTO', 'Director'],
            'max_contacts': 25
        }
    
    engine = LeadGenerationEngine()
    result = engine.generate_leads(
        company_name=params.get('company_name', ''),
        industry=params.get('industry', ''),
        location=params.get('location', ''),
        job_titles=params.get('job_titles', []),
        max_contacts=params.get('max_contacts', 25)
    )
    
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()