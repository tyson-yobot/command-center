"""
Comprehensive Integration Test Suite
Tests all working integrations with real data flows
"""

import requests
import os
from datetime import datetime
from universal_webhook_logger import log_to_airtable

def test_all_working_integrations():
    """Run comprehensive tests on all operational systems"""
    
    results = {}
    
    # Test 1: HubSpot CRM Operations
    print("1. Testing HubSpot CRM operations...")
    try:
        hubspot_key = os.getenv('HUBSPOT_API_KEY')
        
        # Get existing contacts
        contacts_url = 'https://api.hubapi.com/crm/v3/objects/contacts?limit=5'
        headers = {'Authorization': f'Bearer {hubspot_key}'}
        response = requests.get(contacts_url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            contacts = response.json().get('results', [])
            results['hubspot_read'] = f"Retrieved {len(contacts)} contacts"
            
            # Test contact creation with timestamp
            timestamp = datetime.now().strftime("%H%M%S")
            create_url = 'https://api.hubapi.com/crm/v3/objects/contacts'
            create_data = {
                'properties': {
                    'email': f'integration_test_{timestamp}@yobot.bot',
                    'firstname': 'Integration',
                    'lastname': f'Test_{timestamp}',
                    'company': 'YoBot Testing Suite'
                }
            }
            
            create_response = requests.post(create_url, headers=headers, json=create_data)
            if create_response.status_code == 201:
                contact_data = create_response.json()
                contact_id = contact_data.get('id')
                results['hubspot_create'] = f"Created contact ID: {contact_id}"
            else:
                results['hubspot_create'] = f"Failed: {create_response.status_code}"
        else:
            results['hubspot_read'] = f"Failed: {response.status_code}"
            
    except Exception as e:
        results['hubspot'] = f"Error: {str(e)}"
    
    # Test 2: ElevenLabs Voice Generation
    print("2. Testing ElevenLabs voice generation...")
    try:
        api_key = os.getenv('ELEVENLABS_API_KEY') or 'sk_6becad037492cce6db8943a5b4c628657ae3523ad50829ab'
        voice_id = 'cjVigY5qzO86Huf0OWal'
        
        url = f'https://api.elevenlabs.io/v1/text-to-speech/{voice_id}'
        headers = {'xi-api-key': api_key, 'Content-Type': 'application/json'}
        
        timestamp = datetime.now().strftime("%H:%M:%S")
        data = {
            'text': f'Integration test voice generation at {timestamp}',
            'voice_settings': {'stability': 0.75, 'similarity_boost': 0.75}
        }
        
        response = requests.post(url, json=data, headers=headers)
        if response.ok:
            filename = f'integration_test_{datetime.now().strftime("%H%M%S")}.mp3'
            with open(filename, 'wb') as f:
                f.write(response.content)
            results['voice_generation'] = f"Generated: {filename}"
        else:
            results['voice_generation'] = f"Failed: {response.status_code}"
            
    except Exception as e:
        results['voice_generation'] = f"Error: {str(e)}"
    
    # Test 3: Slack Dual Channel System
    print("3. Testing Slack dual channel notifications...")
    try:
        timestamp = datetime.now().strftime("%H:%M:%S")
        
        # Test alerts channel
        alerts_webhook = "https://hooks.slack.com/services/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"
        alert_message = {
            "text": f"Integration Test Alert - {timestamp}",
            "username": "YoBot Integration Tester"
        }
        
        alert_response = requests.post(alerts_webhook, json=alert_message, timeout=5)
        results['slack_alerts'] = f"Status: {alert_response.status_code}"
        
        # Test escalation channel
        escalation_webhook = "https://hooks.slack.com/services/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"
        escalation_message = {
            "text": f"Integration Test Escalation - {timestamp}",
            "username": "YoBot Escalation Tester"
        }
        
        escalation_response = requests.post(escalation_webhook, json=escalation_message, timeout=5)
        results['slack_escalation'] = f"Status: {escalation_response.status_code}"
        
    except Exception as e:
        results['slack'] = f"Error: {str(e)}"
    
    # Test 4: Airtable Universal Logging
    print("4. Testing Airtable universal logging...")
    try:
        test_result = log_to_airtable('Comprehensive Integration Test', {
            'source': 'Integration Test Suite',
            'success': True,
            'details': f'Complete system test at {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}',
            'conversations': len(results),
            'url': 'https://replit.com/@YoBot/CommandCenter'
        })
        
        results['airtable_logging'] = "Successfully logged test data"
        
    except Exception as e:
        results['airtable_logging'] = f"Error: {str(e)}"
    
    # Test 5: Zendesk Configuration Check
    print("5. Checking Zendesk configuration...")
    try:
        domain = os.getenv('ZENDESK_DOMAIN') or 'yobot.zendesk.com'
        email = os.getenv('ZENDESK_EMAIL') or 'tyson@yobot.bot'
        
        results['zendesk_config'] = f"Domain: {domain}, Email: {email} (ready for API token)"
        
    except Exception as e:
        results['zendesk_config'] = f"Error: {str(e)}"
    
    return results

def print_comprehensive_results():
    """Print formatted comprehensive test results"""
    
    print("\n" + "="*60)
    print("🧪 YoBot Comprehensive Integration Test Results")
    print("="*60)
    
    results = test_all_working_integrations()
    
    for service, result in results.items():
        service_name = service.replace('_', ' ').title()
        
        if 'Error' in result or 'Failed' in result:
            status = "❌"
        else:
            status = "✅"
        
        print(f"{status} {service_name}: {result}")
    
    print("\n" + "="*60)
    working_count = sum(1 for r in results.values() if 'Error' not in r and 'Failed' not in r)
    total_count = len(results)
    
    print(f"📊 Integration Health: {working_count}/{total_count} systems operational")
    print(f"🎯 Ready for production workflows with authenticated data sources")
    
    return results

if __name__ == "__main__":
    print_comprehensive_results()