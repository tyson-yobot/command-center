"""
Enhanced CRM Integration for YoBot Sales Order Automation
Creates HubSpot contacts and manages CRM data
"""

import os
import requests
import json
from datetime import datetime

def create_enhanced_hubspot_contact(form_data, pdf_result=None, folder_result=None):
    """
    Create HubSpot contact with enhanced data from sales order
    """
    HUBSPOT_API_KEY = os.getenv('HUBSPOT_API_KEY')
    
    if not HUBSPOT_API_KEY:
        return {
            'success': False,
            'error': 'HubSpot API key not configured',
            'message': 'Please provide HUBSPOT_API_KEY environment variable'
        }
    
    try:
        # Extract contact information
        email = form_data.get('contact_email', '')
        full_name = form_data.get('contact_name', '')
        company = form_data.get('company_name', '')
        phone = form_data.get('contact_phone', '')
        
        # Split name into first and last
        name_parts = full_name.split(' ', 1)
        first_name = name_parts[0] if name_parts else ''
        last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        # Prepare contact properties
        properties = {
            "email": email,
            "firstname": first_name,
            "lastname": last_name,
            "company": company,
            "phone": phone,
            "lifecyclestage": "lead",
            "lead_status": "new",
            "hs_lead_status": "NEW"
        }
        
        # Add package and pricing information
        if form_data.get('bot_package'):
            properties["yobot_package"] = form_data.get('bot_package')
        
        if form_data.get('total_price'):
            properties["deal_amount"] = str(form_data.get('total_price'))
        
        # Add quote information if available
        if pdf_result and pdf_result.get('quote_number'):
            properties["quote_number"] = pdf_result.get('quote_number')
        
        # Add Google Drive folder URL if available
        if folder_result and folder_result.get('folder_url'):
            properties["google_drive_folder"] = folder_result.get('folder_url')
        
        # Add selected add-ons
        selected_addons = form_data.get('selected_addons', [])
        if isinstance(selected_addons, str):
            selected_addons = [selected_addons]
        if selected_addons:
            properties["selected_addons"] = '; '.join(selected_addons)
        
        # Create HubSpot contact
        url = "https://api.hubapi.com/crm/v3/objects/contacts"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {HUBSPOT_API_KEY}"
        }
        data = {
            "properties": properties
        }
        
        response = requests.post(url, headers=headers, json=data)
        
        if response.status_code == 201:
            contact_data = response.json()
            contact_id = contact_data.get('id')
            
            print(f"✅ HubSpot contact created: {email} (ID: {contact_id})")
            
            return {
                'success': True,
                'contact_id': contact_id,
                'contact_email': email,
                'contact_name': full_name,
                'company': company,
                'message': f'HubSpot contact created successfully for {email}'
            }
        else:
            error_message = f"HubSpot API error: {response.status_code} - {response.text}"
            print(f"❌ HubSpot contact creation failed: {error_message}")
            
            return {
                'success': False,
                'error': error_message,
                'status_code': response.status_code,
                'message': 'Failed to create HubSpot contact'
            }
            
    except Exception as e:
        error_message = f"HubSpot integration error: {str(e)}"
        print(f"❌ {error_message}")
        
        return {
            'success': False,
            'error': str(e),
            'message': error_message
        }

def update_hubspot_contact_with_deal(contact_id, deal_data):
    """
    Update HubSpot contact with deal information
    """
    HUBSPOT_API_KEY = os.getenv('HUBSPOT_API_KEY')
    
    if not HUBSPOT_API_KEY:
        return {
            'success': False,
            'error': 'HubSpot API key not configured'
        }
    
    try:
        # Create deal
        deal_url = "https://api.hubapi.com/crm/v3/objects/deals"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {HUBSPOT_API_KEY}"
        }
        
        deal_properties = {
            "dealname": f"{deal_data.get('company_name', 'Unknown Company')} - YoBot Implementation",
            "amount": str(deal_data.get('total_price', 0)),
            "dealstage": "qualifiedtobuy",
            "pipeline": "default",
            "closedate": deal_data.get('close_date', ''),
            "hubspot_owner_id": deal_data.get('owner_id', '')
        }
        
        deal_payload = {
            "properties": deal_properties
        }
        
        deal_response = requests.post(deal_url, headers=headers, json=deal_payload)
        
        if deal_response.status_code == 201:
            deal_id = deal_response.json().get('id')
            
            # Associate deal with contact
            association_url = f"https://api.hubapi.com/crm/v3/objects/contacts/{contact_id}/associations/deals/{deal_id}/3"
            association_response = requests.put(association_url, headers=headers)
            
            if association_response.status_code == 200:
                return {
                    'success': True,
                    'deal_id': deal_id,
                    'message': f'Deal created and associated with contact {contact_id}'
                }
            else:
                return {
                    'success': False,
                    'error': f'Failed to associate deal with contact: {association_response.text}'
                }
        else:
            return {
                'success': False,
                'error': f'Failed to create deal: {deal_response.text}'
            }
            
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def build_roadmap_for_client(package, selected_addons):
    """
    Build automated roadmap tasks for client based on package and add-ons
    """
    package_tasks = {
        "YoBot Standard Package": [
            {
                "task_name": "Basic bot setup and configuration",
                "phase": "Setup",
                "owner_type": "✅ SYSTEM",
                "applies_to": "Standard Package",
                "automation_notes": "automated_standard_setup(client_id)"
            }
        ],
        "YoBot Professional Package": [
            {
                "task_name": "Enable VoiceBot capabilities",
                "phase": "Setup",
                "owner_type": "✅ SYSTEM",
                "applies_to": "Pro Package",
                "automation_notes": "trigger_voicebot_enable(client_id)"
            },
            {
                "task_name": "Connect calendar integration tools",
                "phase": "Setup",
                "owner_type": "✅ SYSTEM",
                "applies_to": "Pro Package",
                "automation_notes": "calendar_integration(client_config)"
            },
            {
                "task_name": "Swap Slack webhook to client channel",
                "phase": "Setup",
                "owner_type": "✅ SYSTEM",
                "applies_to": "Pro Package",
                "automation_notes": "slack_webhook_swap(client_id)"
            }
        ],
        "YoBot Platinum Package": [
            {
                "task_name": "Advanced analytics dashboard setup",
                "phase": "Setup",
                "owner_type": "✅ SYSTEM",
                "applies_to": "Platinum Package",
                "automation_notes": "analytics_dashboard_init(client_id)"
            },
            {
                "task_name": "Custom integration framework",
                "phase": "Setup",
                "owner_type": "✅ SYSTEM",
                "applies_to": "Platinum Package",
                "automation_notes": "custom_integration_setup(client_id)"
            }
        ],
        "YoBot Enterprise Package": [
            {
                "task_name": "Activate smart quoting engine",
                "phase": "Setup",
                "owner_type": "✅ SYSTEM",
                "applies_to": "Enterprise Package",
                "automation_notes": "smart_quote_sync(client_id)"
            },
            {
                "task_name": "Enterprise security configuration",
                "phase": "Setup",
                "owner_type": "✅ SYSTEM",
                "applies_to": "Enterprise Package",
                "automation_notes": "enterprise_security_init(client_id)"
            }
        ]
    }

    addon_tasks = {
        "SmartSpend": [{
            "task_name": "SmartSpend budget optimization setup",
            "phase": "Add-on Configuration",
            "owner_type": "✅ SYSTEM",
            "applies_to": "SmartSpend",
            "automation_notes": "smartspend_integration(client_id)"
        }],
        "Advanced Analytics": [{
            "task_name": "Advanced analytics and reporting setup",
            "phase": "Add-on Configuration",
            "owner_type": "✅ SYSTEM",
            "applies_to": "Advanced Analytics",
            "automation_notes": "analytics_setup(client_id)"
        }],
        "A/B Testing": [{
            "task_name": "A/B testing framework initialization",
            "phase": "Add-on Configuration",
            "owner_type": "✅ SYSTEM",
            "applies_to": "A/B Testing",
            "automation_notes": "ab_testing_init(client_id)"
        }],
        "Custom Integration": [{
            "task_name": "Custom API integration development",
            "phase": "Add-on Configuration",
            "owner_type": "👤 HUMAN",
            "applies_to": "Custom Integration",
            "automation_notes": "custom_api_development(client_id)"
        }]
    }

    # Collect all applicable tasks
    tasks = package_tasks.get(package, [])
    
    if isinstance(selected_addons, str):
        selected_addons = [selected_addons]
    
    for addon in selected_addons:
        if addon in addon_tasks:
            tasks.extend(addon_tasks[addon])

    return {
        'success': True,
        'tasks': tasks,
        'tasks_count': len(tasks),
        'message': f'Generated {len(tasks)} roadmap tasks for {package} with {len(selected_addons)} add-ons'
    }

def test_hubspot_integration():
    """Test HubSpot integration"""
    test_data = {
        'contact_email': 'test@yobot.bot',
        'contact_name': 'Test User',
        'company_name': 'Test Company',
        'contact_phone': '(555) 123-4567',
        'bot_package': 'YoBot Professional Package',
        'total_price': 5000,
        'selected_addons': ['SmartSpend']
    }
    
    result = create_enhanced_hubspot_contact(test_data)
    return result

if __name__ == "__main__":
    # Run integration test
    result = test_hubspot_integration()
    print(json.dumps(result, indent=2))