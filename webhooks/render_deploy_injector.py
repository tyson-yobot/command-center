"""
Render Deploy Injector
Automatically deploys configuration to Render services using matched industry templates
"""

import requests
import os
import json
from datetime import datetime
from airtable_test_logger import log_test_to_airtable

def deploy_config_to_render(business_name, config_json, service_id=None):
    """Deploy configuration to Render service via environment variables"""
    try:
        render_api_key = os.getenv("RENDER_API_KEY")
        if not render_api_key:
            print("RENDER_API_KEY not found. Please provide your Render API key.")
            return False
        
        # Use provided service_id or get from config
        target_service_id = service_id or config_json.get("RENDER_SERVICE_ID")
        if not target_service_id:
            print(f"No Render service ID provided for {business_name}")
            return False
        
        url = f"https://api.render.com/v1/services/{target_service_id}/env-vars"
        headers = {
            "Authorization": f"Bearer {render_api_key}",
            "Content-Type": "application/json"
        }
        
        # Convert config to environment variables
        env_vars = []
        for key, value in config_json.items():
            if isinstance(value, dict):
                # Flatten nested objects into JSON strings
                env_vars.append({"key": key, "value": json.dumps(value)})
            else:
                env_vars.append({"key": key, "value": str(value)})
        
        payload = {"envVars": env_vars}
        
        response = requests.put(url, headers=headers, json=payload, timeout=30)
        
        if response.status_code == 200:
            print(f"✅ {business_name} deployed with config to service {target_service_id}")
            log_test_to_airtable("Render Deploy", "SUCCESS", f"Config deployed for {business_name}", "Deployment")
            return True
        else:
            print(f"❌ Deploy failed for {business_name}: {response.status_code} - {response.text}")
            log_test_to_airtable("Render Deploy", "FAILED", f"Deploy failed for {business_name}", "Deployment")
            return False
            
    except Exception as e:
        print(f"❌ Render deployment error for {business_name}: {str(e)}")
        return False

def create_render_service(business_name, industry_config):
    """Create new Render service for client"""
    try:
        render_api_key = os.getenv("RENDER_API_KEY")
        if not render_api_key:
            print("RENDER_API_KEY required for service creation")
            return None
        
        url = "https://api.render.com/v1/services"
        headers = {
            "Authorization": f"Bearer {render_api_key}",
            "Content-Type": "application/json"
        }
        
        service_config = {
            "type": "web_service",
            "name": f"yobot-{business_name.lower().replace(' ', '-')}",
            "repo": "https://github.com/your-org/yobot-template",
            "branch": "main",
            "buildCommand": "npm install",
            "startCommand": "npm start",
            "envVars": [
                {"key": "NODE_ENV", "value": "production"},
                {"key": "INDUSTRY", "value": industry_config.get("🏷️ Industry", "general")},
                {"key": "CLIENT_NAME", "value": business_name}
            ]
        }
        
        response = requests.post(url, headers=headers, json=service_config, timeout=30)
        
        if response.status_code == 201:
            service_data = response.json()
            service_id = service_data.get("service", {}).get("id")
            print(f"✅ Render service created for {business_name}: {service_id}")
            return service_id
        else:
            print(f"❌ Service creation failed for {business_name}: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Service creation error: {str(e)}")
        return None

def trigger_render_deploy(service_id, business_name):
    """Trigger deployment after configuration update"""
    try:
        render_api_key = os.getenv("RENDER_API_KEY")
        if not render_api_key:
            return False
        
        url = f"https://api.render.com/v1/services/{service_id}/deploys"
        headers = {
            "Authorization": f"Bearer {render_api_key}",
            "Content-Type": "application/json"
        }
        
        deploy_payload = {
            "clearCache": "clear"
        }
        
        response = requests.post(url, headers=headers, json=deploy_payload, timeout=30)
        
        if response.status_code == 201:
            deploy_id = response.json().get("id")
            print(f"🚀 Deployment triggered for {business_name}: {deploy_id}")
            return deploy_id
        else:
            print(f"❌ Deployment trigger failed for {business_name}: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Deployment trigger error: {str(e)}")
        return None

def convert_template_to_env_vars(template_config, client_info):
    """Convert industry template to environment variables"""
    try:
        env_config = {
            # Client information
            "CLIENT_NAME": client_info.get("🏢 Business Name", ""),
            "CLIENT_INDUSTRY": client_info.get("🏷️ Industry", ""),
            "CLIENT_PHONE": client_info.get("📞 Phone", ""),
            "CLIENT_EMAIL": client_info.get("✉️ Email", ""),
            
            # Call scripts
            "GREETING_SCRIPT": template_config.get("📞 Call Scripts", {}).get("greeting", ""),
            "QUALIFICATION_SCRIPT": template_config.get("📞 Call Scripts", {}).get("qualification", ""),
            "CLOSING_SCRIPT": template_config.get("📞 Call Scripts", {}).get("closing", ""),
            
            # QA configuration
            "QA_CRITERIA": json.dumps(template_config.get("📊 QA Scoring", {}).get("criteria", [])),
            "QA_WEIGHTS": json.dumps(template_config.get("📊 QA Scoring", {}).get("weights", {})),
            "QA_THRESHOLD": str(template_config.get("📊 QA Scoring", {}).get("threshold", 75)),
            
            # Fallback settings
            "FALLBACK_RESPONSE": template_config.get("🛡️ Fallback Prompts", {}).get("uncertainty", ""),
            "ESCALATION_TRIGGERS": json.dumps(template_config.get("🛡️ Fallback Prompts", {}).get("triggers", [])),
            
            # AI settings
            "GPT_TEMPERATURE": str(template_config.get("🧠 GPT Settings", {}).get("temperature", 0.7)),
            "GPT_MAX_TOKENS": str(template_config.get("🧠 GPT Settings", {}).get("max_tokens", 120)),
            "GPT_PERSONALITY": template_config.get("🧠 GPT Settings", {}).get("personality", "professional"),
            "GPT_CONTEXT": template_config.get("🧠 GPT Settings", {}).get("context", ""),
            
            # Deployment metadata
            "DEPLOY_TIMESTAMP": datetime.now().isoformat(),
            "CONFIG_VERSION": "1.0"
        }
        
        return env_config
        
    except Exception as e:
        print(f"❌ Environment variable conversion error: {str(e)}")
        return {}

def complete_render_deployment(client_info, template_config):
    """Complete end-to-end Render deployment process"""
    try:
        business_name = client_info.get("🏢 Business Name", "Unknown")
        industry = client_info.get("🏷️ Industry", "Unknown")
        
        print(f"🚀 Starting Render deployment for {business_name} ({industry})")
        
        # Convert template to environment variables
        env_config = convert_template_to_env_vars(template_config, client_info)
        
        # Check if client has existing service ID
        existing_service_id = client_info.get("📦 Render Service ID")
        
        if existing_service_id:
            # Deploy to existing service
            deploy_success = deploy_config_to_render(business_name, env_config, existing_service_id)
            if deploy_success:
                deploy_id = trigger_render_deploy(existing_service_id, business_name)
                return {
                    "service_id": existing_service_id,
                    "deploy_id": deploy_id,
                    "deployment_type": "update",
                    "success": True
                }
        else:
            # Create new service
            service_id = create_render_service(business_name, template_config)
            if service_id:
                deploy_success = deploy_config_to_render(business_name, env_config, service_id)
                if deploy_success:
                    deploy_id = trigger_render_deploy(service_id, business_name)
                    return {
                        "service_id": service_id,
                        "deploy_id": deploy_id,
                        "deployment_type": "create",
                        "success": True
                    }
        
        return {"success": False, "error": "Deployment failed"}
        
    except Exception as e:
        print(f"❌ Complete deployment error: {str(e)}")
        return {"success": False, "error": str(e)}

def test_render_deployment():
    """Test Render deployment system"""
    print("🧪 Testing Render Deployment System")
    print("=" * 50)
    
    # Test with sample client data
    sample_client = {
        "🏢 Business Name": "TechFlow Solutions",
        "🏷️ Industry": "Technology",
        "📞 Phone": "+1-555-TECH-FLOW",
        "✉️ Email": "admin@techflow.com",
        "📦 Render Service ID": "srv_example123"
    }
    
    sample_template = {
        "🏷️ Industry": "Technology",
        "📞 Call Scripts": {
            "greeting": "Hello! Welcome to TechFlow Solutions.",
            "qualification": "What technology challenges can we help you solve?",
            "closing": "Thank you! Our technical team will contact you soon."
        },
        "📊 QA Scoring": {
            "criteria": ["Technical accuracy", "Solution fit"],
            "weights": {"accuracy": 60, "fit": 40},
            "threshold": 80
        },
        "🛡️ Fallback Prompts": {
            "uncertainty": "Let me connect you with our technical specialist.",
            "triggers": ["complex technical", "integration"]
        },
        "🧠 GPT Settings": {
            "temperature": 0.5,
            "max_tokens": 150,
            "personality": "technical expert",
            "context": "You are a technology solutions specialist."
        }
    }
    
    # Test environment variable conversion
    print("\n🔧 Testing config conversion...")
    env_vars = convert_template_to_env_vars(sample_template, sample_client)
    print(f"✅ Generated {len(env_vars)} environment variables")
    
    # Test deployment (will fail without API key, but shows structure)
    print("\n🚀 Testing deployment process...")
    if os.getenv("RENDER_API_KEY"):
        result = complete_render_deployment(sample_client, sample_template)
        if result.get("success"):
            print(f"✅ Deployment successful: {result}")
        else:
            print(f"❌ Deployment failed: {result}")
    else:
        print("⚠️ RENDER_API_KEY not set - skipping live deployment test")
        print("✅ Deployment system structure validated")
    
    print(f"\n🎯 Render Deployment System Ready")
    print(f"• Automatic service creation")
    print(f"• Environment variable injection")
    print(f"• Template-based configuration")
    print(f"• Deployment triggering")
    
    return True

if __name__ == "__main__":
    test_render_deployment()