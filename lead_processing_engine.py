"""
Lead Processing Engine
Handles lead data validation, deduplication, and multi-platform integration
"""
import requests
import os
import json
from datetime import datetime
import hashlib

class LeadProcessor:
    def __init__(self):
        self.airtable_api_key = os.getenv("AIRTABLE_API_KEY")
        self.hubspot_api_key = os.getenv("HUBSPOT_API_KEY")
        self.airtable_base_id = "appRt8V3tH4g5Z5if"
        self.leads_table = "tbldPRZ4nHbtj9opU"
        self.processed_leads = set()  # In-memory deduplication cache
        
    def validate_lead(self, lead):
        """Validate lead has required email or phone"""
        email = lead.get('email', '').strip()
        phone = lead.get('phone', '').strip()
        
        # Must have either valid email or phone
        has_email = email and '@' in email and '.' in email
        has_phone = phone and len(phone.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')) >= 10
        
        return has_email or has_phone
    
    def generate_lead_hash(self, lead):
        """Generate unique hash for duplicate detection"""
        # Use email or phone + company name for deduplication
        email = lead.get('email', '').lower().strip()
        phone = lead.get('phone', '').strip()
        company = lead.get('company', '').lower().strip()
        
        # Create unique identifier
        identifier = f"{email}|{phone}|{company}"
        return hashlib.md5(identifier.encode()).hexdigest()
    
    def is_duplicate(self, lead):
        """Check if lead is duplicate"""
        lead_hash = self.generate_lead_hash(lead)
        if lead_hash in self.processed_leads:
            return True
        self.processed_leads.add(lead_hash)
        return False
    
    def clean_lead_data(self, lead):
        """Clean and standardize lead data"""
        return {
            'name': lead.get('name', f"{lead.get('first_name', '')} {lead.get('last_name', '')}").strip(),
            'email': lead.get('email', '').lower().strip(),
            'phone': lead.get('phone', '').strip(),
            'company': lead.get('company', lead.get('organization', {}).get('name', '')).strip(),
            'title': lead.get('title', lead.get('job_title', '')).strip(),
            'source': lead.get('source', 'Unknown'),
            'timestamp': datetime.now().isoformat()
        }

# Standalone functions for backward compatibility
def validate_lead(lead):
    """Validate lead has required email or phone"""
    processor = LeadProcessor()
    return processor.validate_lead(lead)

def check_duplicate(lead):
    """Check if lead is duplicate"""
    processor = LeadProcessor()
    return processor.is_duplicate(lead)

def process_apollo_leads(data, source='Apollo'):
    """Process Apollo lead data"""
    processor = LeadProcessor()
    results = {
        'total_leads': 0,
        'processed': 0,
        'skipped_invalid': 0,
        'skipped_duplicate': 0,
        'airtable_success': 0,
        'hubspot_success': 0,
        'errors': []
    }
    
    people = data.get('people', [])
    results['total_leads'] = len(people)
    
    for person in people:
        # Clean the lead data
        lead = {
            'name': f"{person.get('first_name', '')} {person.get('last_name', '')}".strip(),
            'email': person.get('email', ''),
            'phone': person.get('phone', ''),
            'company': person.get('organization', {}).get('name', ''),
            'title': person.get('title', ''),
            'source': source
        }
        
        # Validate lead
        if not processor.validate_lead(lead):
            results['skipped_invalid'] += 1
            continue
            
        # Check for duplicates
        if processor.is_duplicate(lead):
            results['skipped_duplicate'] += 1
            continue
            
        results['processed'] += 1
        
        # Try to send to Airtable
        try:
            airtable_result = processor.send_to_airtable(lead)
            if airtable_result.get('success'):
                results['airtable_success'] += 1
        except Exception as e:
            results['errors'].append(f"Airtable: {str(e)}")
            
        # Try to send to HubSpot
        try:
            hubspot_result = processor.send_to_hubspot(lead)
            if hubspot_result.get('success'):
                results['hubspot_success'] += 1
        except Exception as e:
            results['errors'].append(f"HubSpot: {str(e)}")
    
    return results

def process_phantombuster_leads(data, source='PhantomBuster'):
    """Process PhantomBuster lead data"""
    processor = LeadProcessor()
    results = {
        'total_leads': 0,
        'processed': 0,
        'skipped_invalid': 0,
        'skipped_duplicate': 0,
        'airtable_success': 0,
        'hubspot_success': 0,
        'errors': []
    }
    
    phantom_results = data.get('results', [])
    results['total_leads'] = len(phantom_results)
    
    for result in phantom_results:
        # Clean the lead data
        lead = {
            'name': f"{result.get('firstName', '')} {result.get('lastName', '')}".strip(),
            'email': result.get('email', ''),
            'phone': result.get('phone', ''),
            'company': result.get('companyName', ''),
            'title': result.get('currentJobTitle', ''),
            'source': source
        }
        
        # Validate lead
        if not processor.validate_lead(lead):
            results['skipped_invalid'] += 1
            continue
            
        # Check for duplicates
        if processor.is_duplicate(lead):
            results['skipped_duplicate'] += 1
            continue
            
        results['processed'] += 1
        
        # Try to send to platforms
        try:
            airtable_result = processor.send_to_airtable(lead)
            if airtable_result.get('success'):
                results['airtable_success'] += 1
        except Exception as e:
            results['errors'].append(f"Airtable: {str(e)}")
            
        try:
            hubspot_result = processor.send_to_hubspot(lead)
            if hubspot_result.get('success'):
                results['hubspot_success'] += 1
        except Exception as e:
            results['errors'].append(f"HubSpot: {str(e)}")
    
    return results

def process_apify_leads(data, source='Apify'):
    """Process Apify lead data"""
    processor = LeadProcessor()
    results = {
        'total_leads': 0,
        'processed': 0,
        'skipped_invalid': 0,
        'skipped_duplicate': 0,
        'airtable_success': 0,
        'hubspot_success': 0,
        'errors': []
    }
    
    apify_results = data.get('results', [])
    results['total_leads'] = len(apify_results)
    
    for result in apify_results:
        # Clean the lead data
        lead = {
            'name': f"{result.get('firstName', '')} {result.get('lastName', '')}".strip(),
            'email': result.get('email', ''),
            'phone': result.get('phone', ''),
            'company': result.get('company', ''),
            'title': result.get('title', ''),
            'source': source
        }
        
        # Validate lead
        if not processor.validate_lead(lead):
            results['skipped_invalid'] += 1
            continue
            
        # Check for duplicates
        if processor.is_duplicate(lead):
            results['skipped_duplicate'] += 1
            continue
            
        results['processed'] += 1
        
        # Try to send to platforms
        try:
            airtable_result = processor.send_to_airtable(lead)
            if airtable_result.get('success'):
                results['airtable_success'] += 1
        except Exception as e:
            results['errors'].append(f"Airtable: {str(e)}")
            
        try:
            hubspot_result = processor.send_to_hubspot(lead)
            if hubspot_result.get('success'):
                results['hubspot_success'] += 1
        except Exception as e:
            results['errors'].append(f"HubSpot: {str(e)}")
    
    return results
    
    def send_to_airtable(self, lead):
        """Send validated lead to Airtable"""
        if not self.airtable_api_key:
            return {"success": False, "error": "Airtable API key not configured"}
        
        headers = {
            "Authorization": f"Bearer {self.airtable_api_key}",
            "Content-Type": "application/json"
        }
        
        # Map to Airtable field names
        airtable_fields = {
            "👤 Full Name": lead.get('name', ''),
            "📧 Email": lead.get('email', ''),
            "📱 Phone": lead.get('phone', ''),
            "🏢 Company": lead.get('company', ''),
            "💼 Title": lead.get('title', ''),
            "🔗 Source": lead.get('source', 'Unknown'),
            "📅 Date Added": datetime.now().isoformat(),
            "✅ Status": "New Lead"
        }
        
        # Remove empty fields
        airtable_fields = {k: v for k, v in airtable_fields.items() if v}
        
        try:
            url = f"https://api.airtable.com/v0/{self.airtable_base_id}/{self.leads_table}"
            response = requests.post(
                url,
                headers=headers,
                json={"fields": airtable_fields},
                timeout=30
            )
            
            if response.status_code == 200:
                return {"success": True, "airtable_id": response.json().get("id")}
            else:
                return {"success": False, "error": f"Airtable error: {response.status_code}"}
        except Exception as e:
            return {"success": False, "error": f"Airtable request failed: {str(e)}"}
    
    def send_to_hubspot(self, lead):
        """Send validated lead to HubSpot"""
        if not self.hubspot_api_key:
            return {"success": False, "error": "HubSpot API key not configured"}
        
        headers = {
            "Authorization": f"Bearer {self.hubspot_api_key}",
            "Content-Type": "application/json"
        }
        
        # Map to HubSpot properties
        hubspot_properties = {
            "email": lead.get('email', ''),
            "firstname": lead.get('name', '').split(' ')[0] if lead.get('name') else '',
            "lastname": ' '.join(lead.get('name', '').split(' ')[1:]) if lead.get('name') and len(lead.get('name', '').split(' ')) > 1 else '',
            "phone": lead.get('phone', ''),
            "company": lead.get('company', ''),
            "jobtitle": lead.get('title', ''),
            "lead_source": lead.get('source', 'Unknown')
        }
        
        # Remove empty properties
        hubspot_properties = {k: v for k, v in hubspot_properties.items() if v}
        
        try:
            url = "https://api.hubapi.com/crm/v3/objects/contacts"
            response = requests.post(
                url,
                headers=headers,
                json={"properties": hubspot_properties},
                timeout=30
            )
            
            if response.status_code == 201:
                return {"success": True, "hubspot_id": response.json().get("id")}
            else:
                return {"success": False, "error": f"HubSpot error: {response.status_code}"}
        except Exception as e:
            return {"success": False, "error": f"HubSpot request failed: {str(e)}"}
    
    def process_leads_batch(self, leads, source="Unknown"):
        """Process batch of leads with validation and deduplication"""
        results = {
            'total_leads': len(leads),
            'processed': 0,
            'skipped_invalid': 0,
            'skipped_duplicate': 0,
            'airtable_success': 0,
            'hubspot_success': 0,
            'errors': []
        }
        
        for lead in leads:
            # Clean the lead data
            cleaned_lead = self.clean_lead_data({**lead, 'source': source})
            
            # Validate lead
            if not self.validate_lead(cleaned_lead):
                results['skipped_invalid'] += 1
                continue
                
            # Check for duplicates
            if self.is_duplicate(cleaned_lead):
                results['skipped_duplicate'] += 1
                continue
                
            results['processed'] += 1
            
            # Try to send to Airtable
            airtable_result = self.send_to_airtable(cleaned_lead)
            if airtable_result.get('success'):
                results['airtable_success'] += 1
            else:
                results['errors'].append(f"Airtable: {airtable_result.get('error')}")
                
            # Try to send to HubSpot
            hubspot_result = self.send_to_hubspot(cleaned_lead)
            if hubspot_result.get('success'):
                results['hubspot_success'] += 1
            else:
                results['errors'].append(f"HubSpot: {hubspot_result.get('error')}")
        
        return results
    
    def send_to_airtable(self, lead):
        """Send validated lead to Airtable"""
        if not self.airtable_api_key:
            return {"error": "Airtable API key not configured"}
        
        headers = {
            "Authorization": f"Bearer {self.airtable_api_key}",
            "Content-Type": "application/json"
        }
        
        # Map to Airtable field names
        airtable_fields = {
            "👤 Full Name": f"{lead['first_name']} {lead['last_name']}".strip(),
            "📧 Email": lead['email'],
            "📱 Phone": lead['phone'],
            "🏢 Company": lead['company'],
            "💼 Title": lead['title'],
            "📍 Location": lead['location'],
            "🔗 Source": lead['source'],
            "🌐 LinkedIn": lead['linkedin_url'],
            "🌍 Website": lead['company_website'],
            "🏭 Industry": lead['industry'],
            "📊 Company Size": lead['company_size'],
            "📅 Date Added": lead['timestamp'],
            "✅ Status": "New Lead"
        }
        
        # Remove empty fields
        airtable_fields = {k: v for k, v in airtable_fields.items() if v}
        
        try:
            url = f"https://api.airtable.com/v0/{self.airtable_base_id}/{self.leads_table}"
            response = requests.post(
                url,
                headers=headers,
                json={"fields": airtable_fields},
                timeout=30
            )
            
            if response.status_code == 200:
                return {"success": True, "airtable_id": response.json().get("id")}
            else:
                return {"error": f"Airtable error: {response.status_code}"}
        except Exception as e:
            return {"error": f"Airtable request failed: {str(e)}"}
    
    def send_to_hubspot(self, lead):
        """Send validated lead to HubSpot"""
        if not self.hubspot_api_key:
            return {"error": "HubSpot API key not configured"}
        
        headers = {
            "Authorization": f"Bearer {self.hubspot_api_key}",
            "Content-Type": "application/json"
        }
        
        # Map to HubSpot properties
        hubspot_properties = {
            "firstname": lead['first_name'],
            "lastname": lead['last_name'],
            "email": lead['email'],
            "phone": lead['phone'],
            "company": lead['company'],
            "jobtitle": lead['title'],
            "city": lead['location'],
            "lifecyclestage": "lead",
            "lead_source": lead['source'],
            "linkedin_url": lead['linkedin_url'],
            "website": lead['company_website'],
            "industry": lead['industry']
        }
        
        # Remove empty properties
        hubspot_properties = {k: v for k, v in hubspot_properties.items() if v}
        
        try:
            url = "https://api.hubapi.com/crm/v3/objects/contacts"
            response = requests.post(
                url,
                headers=headers,
                json={"properties": hubspot_properties},
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                return {"success": True, "hubspot_id": response.json().get("id")}
            else:
                return {"error": f"HubSpot error: {response.status_code}"}
        except Exception as e:
            return {"error": f"HubSpot request failed: {str(e)}"}
    
    def process_leads_batch(self, leads, source="Unknown"):
        """Process batch of leads with validation and deduplication"""
        results = {
            "total_leads": len(leads),
            "processed": 0,
            "skipped_invalid": 0,
            "skipped_duplicate": 0,
            "airtable_success": 0,
            "hubspot_success": 0,
            "errors": []
        }
        
        for lead in leads:
            # Add source if not present
            if 'source' not in lead:
                lead['source'] = source
            
            # Validate lead has email or phone
            if not self.validate_lead(lead):
                results["skipped_invalid"] += 1
                continue
            
            # Check for duplicates
            if self.is_duplicate(lead):
                results["skipped_duplicate"] += 1
                continue
            
            # Clean lead data
            cleaned_lead = self.clean_lead_data(lead)
            
            # Send to Airtable
            airtable_result = self.send_to_airtable(cleaned_lead)
            if airtable_result.get("success"):
                results["airtable_success"] += 1
            else:
                results["errors"].append(f"Airtable: {airtable_result.get('error')}")
            
            # Send to HubSpot
            hubspot_result = self.send_to_hubspot(cleaned_lead)
            if hubspot_result.get("success"):
                results["hubspot_success"] += 1
            else:
                results["errors"].append(f"HubSpot: {hubspot_result.get('error')}")
            
            results["processed"] += 1
        
        return results

def process_apollo_leads(apollo_data, source="Apollo"):
    """Process Apollo.io lead data"""
    processor = LeadProcessor()
    
    # Extract leads from Apollo response
    leads = []
    if isinstance(apollo_data, dict) and 'people' in apollo_data:
        for person in apollo_data['people']:
            lead = {
                'first_name': person.get('first_name', ''),
                'last_name': person.get('last_name', ''),
                'email': person.get('email', ''),
                'phone': person.get('phone', ''),
                'title': person.get('title', ''),
                'company': person.get('organization', {}).get('name', '') if person.get('organization') else '',
                'linkedin_url': person.get('linkedin_url', ''),
                'location': person.get('city', ''),
                'industry': person.get('organization', {}).get('industry', '') if person.get('organization') else '',
                'company_website': person.get('organization', {}).get('website_url', '') if person.get('organization') else '',
                'source': source
            }
            leads.append(lead)
    
    return processor.process_leads_batch(leads, source)

def process_phantombuster_leads(phantom_data, source="PhantomBuster"):
    """Process PhantomBuster lead data"""
    processor = LeadProcessor()
    
    # Extract leads from PhantomBuster response
    leads = []
    if isinstance(phantom_data, dict) and 'results' in phantom_data:
        for result in phantom_data['results']:
            lead = {
                'first_name': result.get('firstName', ''),
                'last_name': result.get('lastName', ''),
                'email': result.get('email', ''),
                'phone': result.get('phone', ''),
                'title': result.get('currentJobTitle', ''),
                'company': result.get('companyName', ''),
                'linkedin_url': result.get('profileUrl', ''),
                'location': result.get('location', ''),
                'source': source
            }
            leads.append(lead)
    
    return processor.process_leads_batch(leads, source)

def process_apify_leads(apify_data, source="Apify"):
    """Process Apify lead data"""
    processor = LeadProcessor()
    
    # Extract leads from Apify response
    leads = []
    if isinstance(apify_data, dict) and 'results' in apify_data:
        for result in apify_data['results']:
            lead = {
                'first_name': result.get('firstName', ''),
                'last_name': result.get('lastName', ''),
                'email': result.get('email', ''),
                'phone': result.get('phone', ''),
                'title': result.get('title', ''),
                'company': result.get('title', ''),  # Business name for Google Maps
                'location': result.get('address', ''),
                'company_website': result.get('website', ''),
                'source': source
            }
            leads.append(lead)
    
    return processor.process_leads_batch(leads, source)

if __name__ == "__main__":
    # Test lead processing
    test_leads = [
        {
            'first_name': 'John',
            'last_name': 'Smith',
            'email': 'john@roofingco.com',
            'phone': '555-123-4567',
            'company': 'Smith Roofing',
            'title': 'Owner'
        }
    ]
    
    processor = LeadProcessor()
    results = processor.process_leads_batch(test_leads, "Test")
    print(json.dumps(results, indent=2))