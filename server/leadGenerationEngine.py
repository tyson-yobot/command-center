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
                print(f"Retrieved {len(hubspot_leads)} leads from HubSpot")
        
        # Try Airtable for existing lead database
        if self.airtable_key:
            airtable_leads = self._get_airtable_leads(company_name, industry, location)
            if airtable_leads:
                results['leads'].extend(airtable_leads)
                results['sources_used'].append('Airtable')
                print(f"Retrieved {len(airtable_leads)} leads from Airtable")
        
        # If we have leads from authenticated sources
        if results['leads']:
            # Enhance with job title filtering
            if job_titles:
                filtered_leads = []
                for lead in results['leads']:
                    lead_title = lead.get('title') or ''
                    if any(title.lower() in lead_title.lower() for title in job_titles if title):
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
            # Use the main CRM base with proper table name
            base_id = os.environ.get('AIRTABLE_BASE_ID', 'appMbVQJ0n3nWR11N')
            
            # Try multiple table names that might exist
            table_names = ['CRM Contacts', 'Contacts', 'Leads', 'tblJOqKu9Zk0fXZVr']
            
            for table_name in table_names:
                try:
                    url = f"https://api.airtable.com/v0/{base_id}/{table_name.replace(' ', '%20')}"
                    headers = {
                        'Authorization': f'Bearer {self.airtable_key}',
                        'Content-Type': 'application/json'
                    }
                    
                    # Simple request without filters first to test table access
                    params = {
                        'maxRecords': 20,
                        'pageSize': 20
                    }
                    
                    response = requests.get(url, headers=headers, params=params, timeout=30)
                    
                    if response.status_code == 200:
                        data = response.json()
                        leads = []
                        
                        for record in data.get('records', []):
                            fields = record.get('fields', {})
                            
                            # Extract data using flexible field mapping
                            name = (fields.get('Name') or fields.get('Full Name') or 
                                   fields.get('Contact Name') or fields.get('Client Name') or '')
                            
                            title = (fields.get('Title') or fields.get('Job Title') or 
                                    fields.get('Position') or fields.get('Role') or '')
                            
                            company = (fields.get('Company') or fields.get('Organization') or 
                                      fields.get('Account') or fields.get('Business') or '')
                            
                            email = (fields.get('Email') or fields.get('Email Address') or 
                                    fields.get('Contact Email') or '')
                            
                            phone = (fields.get('Phone') or fields.get('Phone Number') or 
                                    fields.get('Mobile') or fields.get('Contact Phone') or '')
                            
                            location_field = (fields.get('Location') or fields.get('City') or 
                                            fields.get('Address') or fields.get('Region') or '')
                            
                            # Apply filters if any data exists
                            if name or email or company:
                                # Basic filtering
                                include_record = True
                                if company_name and company:
                                    include_record = company_name.lower() in company.lower()
                                if industry and include_record:
                                    industry_fields = str(fields.get('Industry', '') + ' ' + 
                                                        fields.get('Sector', '') + ' ' +
                                                        fields.get('Business Type', '')).lower()
                                    include_record = industry.lower() in industry_fields
                                if location and location_field and include_record:
                                    include_record = location.lower() in location_field.lower()
                                
                                if include_record:
                                    lead = {
                                        'name': name,
                                        'title': title,
                                        'company': company,
                                        'email': email,
                                        'phone': phone,
                                        'location': location_field,
                                        'source': f'Airtable {table_name}',
                                        'verified': bool(email and '@' in email)
                                    }
                                    leads.append(lead)
                        
                        if leads:
                            print(f"Successfully retrieved {len(leads)} leads from Airtable table: {table_name}")
                            return leads
                            
                except Exception as table_error:
                    print(f"Failed to access table {table_name}: {table_error}")
                    continue
                    
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