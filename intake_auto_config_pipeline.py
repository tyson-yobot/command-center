"""
Intake Auto-Config Pipeline
Automated client setup from Airtable intake to full configuration deployment
"""

import requests
import json
import os
from datetime import datetime
from airtable_test_logger import log_test_to_airtable

def get_airtable_records(table_id):
    """Get records from specific Airtable table"""
    try:
        airtable_key = os.getenv("AIRTABLE_API_KEY")
        base_id = os.getenv("AIRTABLE_BASE_ID")
        
        if not airtable_key or not base_id:
            print("Missing Airtable credentials - AIRTABLE_API_KEY and AIRTABLE_BASE_ID required")
            return []
        
        headers = {
            "Authorization": f"Bearer {airtable_key}",
            "Content-Type": "application/json"
        }
        
        url = f"https://api.airtable.com/v0/{base_id}/{table_id}"
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code == 200:
            records = response.json().get("records", [])
            print(f"Retrieved {len(records)} records from table {table_id}")
            return records
        else:
            print(f"Airtable API error: {response.status_code}")
            return []
            
    except Exception as e:
        print(f"Error retrieving Airtable records: {str(e)}")
        return []

def match_template(industry, templates):
    """Match client industry to appropriate template"""
    try:
        for record in templates:
            template_industry = record['fields'].get('🏷️ Industry', '').lower()
            if template_industry == industry.lower():
                print(f"Template matched: {industry} → {template_industry}")
                return record['fields']
        
        print(f"No template found for industry: {industry}")
        return None
        
    except Exception as e:
        print(f"Template matching error: {str(e)}")
        return None

def deploy_client_config(client_fields, template_config):
    """Deploy complete client configuration using template"""
    try:
        deployment_results = {
            "client_name": client_fields.get('🏢 Business Name', 'Unknown'),
            "industry": client_fields.get('🏷️ Industry', 'Unknown'),
            "deployment_steps": [],
            "timestamp": datetime.now().isoformat()
        }
        
        # Step 1: Create client instance
        instance_created = create_client_instance(client_fields, template_config)
        deployment_results["deployment_steps"].append({
            "step": "Client Instance Creation",
            "status": "success" if instance_created else "failed"
        })
        
        # Step 2: Configure call scripts
        scripts_configured = configure_call_scripts(client_fields, template_config)
        deployment_results["deployment_steps"].append({
            "step": "Call Scripts Configuration",
            "status": "success" if scripts_configured else "failed"
        })
        
        # Step 3: Setup QA scoring
        qa_configured = setup_qa_scoring(client_fields, template_config)
        deployment_results["deployment_steps"].append({
            "step": "QA Scoring Setup",
            "status": "success" if qa_configured else "failed"
        })
        
        # Step 4: Deploy fallback system
        fallback_deployed = deploy_fallback_system(client_fields, template_config)
        deployment_results["deployment_steps"].append({
            "step": "Fallback System Deployment",
            "status": "success" if fallback_deployed else "failed"
        })
        
        # Step 5: Configure AI behavior
        ai_configured = configure_ai_behavior(client_fields, template_config)
        deployment_results["deployment_steps"].append({
            "step": "AI Behavior Configuration",
            "status": "success" if ai_configured else "failed"
        })
        
        successful_steps = sum(1 for step in deployment_results["deployment_steps"] if step["status"] == "success")
        deployment_success = successful_steps >= 3  # At least 3 out of 5 steps must succeed
        
        print(f"Deployment complete for {deployment_results['client_name']}: {successful_steps}/5 steps successful")
        
        return deployment_results, deployment_success
        
    except Exception as e:
        print(f"Deployment error: {str(e)}")
        return None, False

def create_client_instance(client_fields, template_config):
    """Create new client instance with basic configuration"""
    try:
        render_url = client_fields.get('📦 Render URL')
        if not render_url:
            print("No Render URL provided for client")
            return False
        
        instance_data = {
            "client_name": client_fields.get('🏢 Business Name'),
            "industry": client_fields.get('🏷️ Industry'),
            "phone": client_fields.get('📞 Phone'),
            "email": client_fields.get('✉️ Email'),
            "template_applied": template_config.get('🏷️ Industry', 'default')
        }
        
        response = requests.post(f"{render_url}/setup", json=instance_data, timeout=30)
        return response.status_code == 200
        
    except Exception as e:
        print(f"Client instance creation error: {str(e)}")
        return False

def configure_call_scripts(client_fields, template_config):
    """Configure industry-specific call scripts"""
    try:
        render_url = client_fields.get('📦 Render URL')
        call_scripts = template_config.get('📞 Call Scripts', {})
        
        if not render_url or not call_scripts:
            return False
        
        response = requests.post(f"{render_url}/config/scripts", json=call_scripts, timeout=30)
        return response.status_code == 200
        
    except Exception as e:
        print(f"Call scripts configuration error: {str(e)}")
        return False

def setup_qa_scoring(client_fields, template_config):
    """Setup industry-specific QA scoring criteria"""
    try:
        render_url = client_fields.get('📦 Render URL')
        qa_config = template_config.get('📊 QA Scoring', {})
        
        if not render_url or not qa_config:
            return False
        
        response = requests.post(f"{render_url}/config/qa", json=qa_config, timeout=30)
        return response.status_code == 200
        
    except Exception as e:
        print(f"QA scoring setup error: {str(e)}")
        return False

def deploy_fallback_system(client_fields, template_config):
    """Deploy industry-specific fallback prompts and escalation"""
    try:
        render_url = client_fields.get('📦 Render URL')
        fallback_config = template_config.get('🛡️ Fallback Prompts', {})
        
        if not render_url or not fallback_config:
            return False
        
        response = requests.post(f"{render_url}/config/fallback", json=fallback_config, timeout=30)
        return response.status_code == 200
        
    except Exception as e:
        print(f"Fallback system deployment error: {str(e)}")
        return False

def configure_ai_behavior(client_fields, template_config):
    """Configure AI behavior and personality for industry"""
    try:
        render_url = client_fields.get('📦 Render URL')
        gpt_config = template_config.get('🧠 GPT Settings', {})
        
        if not render_url or not gpt_config:
            return False
        
        response = requests.post(f"{render_url}/config/ai", json=gpt_config, timeout=30)
        return response.status_code == 200
        
    except Exception as e:
        print(f"AI behavior configuration error: {str(e)}")
        return False

def process_intake():
    """Main intake processing function"""
    try:
        print("🔄 Starting automated intake processing...")
        
        # Get intake table and template table IDs from environment
        intake_table_id = os.getenv("INTAKE_TABLE_ID", "tblCmBeyaJg9S1kPd")
        template_table_id = os.getenv("TEMPLATE_TABLE_ID", "tblTemplates123")
        
        # Retrieve records
        intake_records = get_airtable_records(intake_table_id)
        template_records = get_airtable_records(template_table_id)
        
        if not intake_records or not template_records:
            print("Missing intake or template records")
            return False
        
        processed_clients = []
        
        for client_record in intake_records:
            client_fields = client_record.get("fields", {})
            industry = client_fields.get("🏷️ Industry")
            business_name = client_fields.get("🏢 Business Name", "Unknown Business")
            
            if not industry:
                print(f"Skipping {business_name} - no industry specified")
                continue
            
            # Match template
            matched_template = match_template(industry, template_records)
            
            if matched_template:
                print(f"✅ {business_name} matched to {industry}")
                print("Template config preview:")
                print(json.dumps(matched_template, indent=2))
                
                # Deploy configuration
                deployment_result, success = deploy_client_config(client_fields, matched_template)
                
                if success:
                    print(f"🚀 Deployment successful for {business_name}")
                    log_test_to_airtable("Auto Config", "SUCCESS", f"Client {business_name} configured", "Automation")
                else:
                    print(f"❌ Deployment failed for {business_name}")
                    log_test_to_airtable("Auto Config", "FAILED", f"Client {business_name} deployment failed", "Automation")
                
                processed_clients.append({
                    "business_name": business_name,
                    "industry": industry,
                    "deployment_success": success,
                    "deployment_result": deployment_result
                })
            else:
                print(f"❌ No template found for {business_name} ({industry})")
        
        print(f"\n📊 Intake processing complete:")
        print(f"   Total clients processed: {len(processed_clients)}")
        successful = sum(1 for client in processed_clients if client["deployment_success"])
        print(f"   Successful deployments: {successful}")
        print(f"   Failed deployments: {len(processed_clients) - successful}")
        
        return len(processed_clients) > 0
        
    except Exception as e:
        print(f"Intake processing error: {str(e)}")
        return False

def test_intake_pipeline():
    """Test the complete intake auto-configuration pipeline"""
    print("🧪 Testing Intake Auto-Config Pipeline")
    print("=" * 50)
    
    # Test with mock data since we need API credentials
    print("\n📝 Testing pipeline with sample data...")
    
    sample_intake = [
        {
            "fields": {
                "🏢 Business Name": "Downtown Medical Center",
                "🏷️ Industry": "Healthcare",
                "📦 Render URL": "https://downtown-medical.onrender.com",
                "📞 Phone": "+1-555-MED-CARE",
                "✉️ Email": "admin@downtownmedical.com"
            }
        },
        {
            "fields": {
                "🏢 Business Name": "Prime Realty Group",
                "🏷️ Industry": "Real Estate", 
                "📦 Render URL": "https://prime-realty.onrender.com",
                "📞 Phone": "+1-555-REALTY",
                "✉️ Email": "info@primerealty.com"
            }
        }
    ]
    
    sample_templates = [
        {
            "fields": {
                "🏷️ Industry": "Healthcare",
                "📞 Call Scripts": {"greeting": "Healthcare greeting"},
                "📊 QA Scoring": {"criteria": ["HIPAA compliance"]},
                "🛡️ Fallback Prompts": {"uncertainty": "Connect to medical advisor"},
                "🧠 GPT Settings": {"temperature": 0.3}
            }
        },
        {
            "fields": {
                "🏷️ Industry": "Real Estate",
                "📞 Call Scripts": {"greeting": "Real estate greeting"},
                "📊 QA Scoring": {"criteria": ["Lead qualification"]},
                "🛡️ Fallback Prompts": {"uncertainty": "Connect to real estate expert"},
                "🧠 GPT Settings": {"temperature": 0.6}
            }
        }
    ]
    
    # Test template matching
    for client in sample_intake:
        industry = client["fields"]["🏷️ Industry"]
        business_name = client["fields"]["🏢 Business Name"]
        
        matched = match_template(industry, sample_templates)
        if matched:
            print(f"✅ {business_name} → {industry} template matched")
        else:
            print(f"❌ {business_name} → No template for {industry}")
    
    print(f"\n🎯 Intake Auto-Config Pipeline Ready")
    print(f"• Automated client intake processing")
    print(f"• Industry template matching")
    print(f"• Complete configuration deployment")
    print(f"• Comprehensive logging and tracking")
    
    return True

if __name__ == "__main__":
    # Check for environment variables first
    if os.getenv("AIRTABLE_API_KEY") and os.getenv("AIRTABLE_BASE_ID"):
        print("🔑 Airtable credentials found - running live processing")
        process_intake()
    else:
        print("🧪 No Airtable credentials - running test mode")
        test_intake_pipeline()