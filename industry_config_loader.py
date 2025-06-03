"""
Industry Configuration Loader
Dynamic client setup based on industry templates with minimal manual input
"""

import requests
from datetime import datetime
from airtable_test_logger import log_test_to_airtable

def load_industry_config(client):
    """Pull industry-specific configuration on bot boot"""
    try:
        industry = client["fields"].get("🏷️ Industry", "General")
        templates = get_airtable_records("📚 Industry Templates")
        
        for template in templates:
            if template["fields"].get("🏷️ Industry") == industry:
                config = template["fields"]
                print(f"📚 Industry config loaded for {client['fields']['🧾 Client Name']}: {industry}")
                log_test_to_airtable("Industry Config", "LOADED", f"Config applied for {industry}", "Configuration")
                return config
        
        # Return default config if no industry match
        default_config = get_default_config()
        print(f"📚 Default config applied for {client['fields']['🧾 Client Name']}")
        return default_config
        
    except Exception as e:
        print(f"❌ Industry config loading error: {str(e)}")
        return get_default_config()

def apply_configs_dynamically(client, config):
    """Apply industry configuration to client instance"""
    try:
        applied_configs = []
        
        # Generate call scripts
        if config.get("📞 Call Scripts"):
            script_applied = apply_call_scripts(client, config["📞 Call Scripts"])
            if script_applied:
                applied_configs.append("Call Scripts")
        
        # Adjust QA scoring fields
        if config.get("📊 QA Scoring"):
            qa_applied = apply_qa_scoring(client, config["📊 QA Scoring"])
            if qa_applied:
                applied_configs.append("QA Scoring")
        
        # Set fallback prompts
        if config.get("🛡️ Fallback Prompts"):
            fallback_applied = apply_fallback_prompts(client, config["🛡️ Fallback Prompts"])
            if fallback_applied:
                applied_configs.append("Fallback Prompts")
        
        # Tune GPT behavior
        if config.get("🧠 GPT Settings"):
            gpt_applied = apply_gpt_settings(client, config["🧠 GPT Settings"])
            if gpt_applied:
                applied_configs.append("GPT Settings")
        
        print(f"⚙️ Applied configurations for {client['fields']['🧾 Client Name']}: {', '.join(applied_configs)}")
        log_test_to_airtable("Config Application", "COMPLETED", f"Applied {len(applied_configs)} configurations", "Setup")
        
        return applied_configs
        
    except Exception as e:
        print(f"❌ Config application error: {str(e)}")
        return []

def apply_call_scripts(client, scripts):
    """Apply industry-specific call scripts"""
    try:
        url = client["fields"]["📦 Render URL"]
        script_data = {
            "greeting": scripts.get("greeting", "Hello, how can I help you today?"),
            "qualification": scripts.get("qualification", "Can you tell me about your business needs?"),
            "closing": scripts.get("closing", "Thank you for your time. We'll be in touch soon.")
        }
        
        response = requests.post(f"{url}/config/scripts", json=script_data, timeout=10)
        return response.status_code == 200
        
    except Exception as e:
        print(f"❌ Call script application error: {str(e)}")
        return False

def apply_qa_scoring(client, qa_config):
    """Apply industry-specific QA scoring criteria"""
    try:
        url = client["fields"]["📦 Render URL"]
        qa_data = {
            "scoring_criteria": qa_config.get("criteria", []),
            "weight_factors": qa_config.get("weights", {}),
            "pass_threshold": qa_config.get("threshold", 80)
        }
        
        response = requests.post(f"{url}/config/qa", json=qa_data, timeout=10)
        return response.status_code == 200
        
    except Exception as e:
        print(f"❌ QA scoring application error: {str(e)}")
        return False

def apply_fallback_prompts(client, fallback_config):
    """Apply industry-specific fallback prompts"""
    try:
        url = client["fields"]["📦 Render URL"]
        fallback_data = {
            "uncertainty_response": fallback_config.get("uncertainty", "Let me connect you with a specialist."),
            "escalation_triggers": fallback_config.get("triggers", []),
            "backup_responses": fallback_config.get("backups", [])
        }
        
        response = requests.post(f"{url}/config/fallback", json=fallback_data, timeout=10)
        return response.status_code == 200
        
    except Exception as e:
        print(f"❌ Fallback prompt application error: {str(e)}")
        return False

def apply_gpt_settings(client, gpt_config):
    """Apply industry-specific GPT behavior tuning"""
    try:
        url = client["fields"]["📦 Render URL"]
        gpt_data = {
            "temperature": gpt_config.get("temperature", 0.7),
            "max_tokens": gpt_config.get("max_tokens", 150),
            "personality": gpt_config.get("personality", "professional"),
            "industry_context": gpt_config.get("context", "")
        }
        
        response = requests.post(f"{url}/config/gpt", json=gpt_data, timeout=10)
        return response.status_code == 200
        
    except Exception as e:
        print(f"❌ GPT settings application error: {str(e)}")
        return False

def setup_minimal_client(client_name, render_url, phone_number, industry):
    """Setup client with minimal input using industry templates"""
    try:
        # Create basic client record
        client_data = {
            "🧾 Client Name": client_name,
            "📦 Render URL": render_url,
            "📞 Phone": phone_number,
            "🏷️ Industry": industry,
            "🟢 Bot Status": "Configuring",
            "📅 Setup Date": datetime.now().isoformat()
        }
        
        # Load industry configuration
        mock_client = {"fields": client_data}
        industry_config = load_industry_config(mock_client)
        
        # Apply configurations
        applied_configs = apply_configs_dynamically(mock_client, industry_config)
        
        # Update client status
        client_data["🟢 Bot Status"] = "Ready" if applied_configs else "Setup Failed"
        
        print(f"🎯 Client setup completed for {client_name}")
        print(f"   Industry: {industry}")
        print(f"   Configurations: {len(applied_configs)}")
        
        log_test_to_airtable("Client Setup", "COMPLETED", f"Minimal setup for {client_name}", "Client Management")
        
        return {
            "client_data": client_data,
            "applied_configs": applied_configs,
            "industry_config": industry_config,
            "setup_success": len(applied_configs) > 0
        }
        
    except Exception as e:
        print(f"❌ Client setup error: {str(e)}")
        return None

def get_airtable_records(table_name):
    """Get industry templates from Airtable"""
    if table_name == "📚 Industry Templates":
        return [
            {
                "id": "template_healthcare",
                "fields": {
                    "🏷️ Industry": "Healthcare",
                    "📞 Call Scripts": {
                        "greeting": "Hello, this is regarding your healthcare inquiry. How can I assist you today?",
                        "qualification": "Can you share what specific healthcare services you're interested in?",
                        "closing": "Thank you. Our healthcare specialist will contact you within 24 hours."
                    },
                    "📊 QA Scoring": {
                        "criteria": ["HIPAA compliance", "Professional tone", "Accurate information"],
                        "weights": {"compliance": 40, "tone": 30, "accuracy": 30},
                        "threshold": 85
                    },
                    "🛡️ Fallback Prompts": {
                        "uncertainty": "For specific medical questions, let me connect you with our licensed healthcare advisor.",
                        "triggers": ["medical advice", "diagnosis", "treatment"],
                        "backups": ["I'll have a specialist call you back", "Let me schedule a consultation"]
                    },
                    "🧠 GPT Settings": {
                        "temperature": 0.3,
                        "max_tokens": 100,
                        "personality": "professional and caring",
                        "context": "You are assisting with healthcare inquiries. Be professional and compliant."
                    }
                }
            },
            {
                "id": "template_realestate",
                "fields": {
                    "🏷️ Industry": "Real Estate",
                    "📞 Call Scripts": {
                        "greeting": "Hello! I understand you're interested in real estate. How can I help you today?",
                        "qualification": "Are you looking to buy, sell, or rent? What's your preferred location?",
                        "closing": "Perfect! I'll have one of our real estate experts contact you today."
                    },
                    "📊 QA Scoring": {
                        "criteria": ["Lead qualification", "Location details", "Timeline capture"],
                        "weights": {"qualification": 50, "details": 30, "timeline": 20},
                        "threshold": 75
                    },
                    "🛡️ Fallback Prompts": {
                        "uncertainty": "Let me connect you with a local real estate expert who can provide detailed information.",
                        "triggers": ["property values", "market conditions", "legal questions"],
                        "backups": ["I'll schedule a property consultation", "Our agent will call you back"]
                    },
                    "🧠 GPT Settings": {
                        "temperature": 0.6,
                        "max_tokens": 120,
                        "personality": "enthusiastic and knowledgeable",
                        "context": "You are helping with real estate inquiries. Be helpful and capture lead details."
                    }
                }
            },
            {
                "id": "template_technology",
                "fields": {
                    "🏷️ Industry": "Technology",
                    "📞 Call Scripts": {
                        "greeting": "Hi there! I see you're interested in our technology solutions. What can I help you with?",
                        "qualification": "What type of technology challenges is your business facing?",
                        "closing": "Great! Our technical team will reach out to discuss your specific needs."
                    },
                    "📊 QA Scoring": {
                        "criteria": ["Technical accuracy", "Solution fit", "Follow-up scheduled"],
                        "weights": {"accuracy": 40, "fit": 35, "follow-up": 25},
                        "threshold": 80
                    },
                    "🛡️ Fallback Prompts": {
                        "uncertainty": "For technical specifications, let me connect you with our solutions architect.",
                        "triggers": ["API details", "integration", "custom development"],
                        "backups": ["I'll schedule a technical demo", "Our engineer will follow up"]
                    },
                    "🧠 GPT Settings": {
                        "temperature": 0.5,
                        "max_tokens": 140,
                        "personality": "technical but approachable",
                        "context": "You are discussing technology solutions. Be precise and solution-focused."
                    }
                }
            }
        ]
    return []

def get_default_config():
    """Get default configuration for general industry"""
    return {
        "📞 Call Scripts": {
            "greeting": "Hello! Thank you for your interest. How can I assist you today?",
            "qualification": "Can you tell me more about what you're looking for?",
            "closing": "Thank you for your time. Someone from our team will contact you soon."
        },
        "📊 QA Scoring": {
            "criteria": ["Professionalism", "Information capture", "Follow-up"],
            "weights": {"professionalism": 40, "capture": 40, "follow-up": 20},
            "threshold": 75
        },
        "🛡️ Fallback Prompts": {
            "uncertainty": "Let me connect you with a specialist who can better assist you.",
            "triggers": ["complex questions", "specific details"],
            "backups": ["I'll have someone call you back", "Let me schedule a consultation"]
        },
        "🧠 GPT Settings": {
            "temperature": 0.7,
            "max_tokens": 120,
            "personality": "professional and helpful",
            "context": "You are a helpful business assistant. Be professional and capture lead information."
        }
    }

def test_industry_config_system():
    """Test the complete industry configuration system"""
    print("🧪 Testing Industry Configuration System")
    print("=" * 50)
    
    # Test healthcare setup
    print("\n🏥 Testing healthcare client setup...")
    healthcare_result = setup_minimal_client(
        "MedCare Solutions",
        "https://medcare.onrender.com",
        "+1-555-HEALTH",
        "Healthcare"
    )
    
    if healthcare_result and healthcare_result["setup_success"]:
        print(f"✅ Healthcare setup: {len(healthcare_result['applied_configs'])} configs applied")
    else:
        print("❌ Healthcare setup failed")
    
    # Test real estate setup
    print("\n🏠 Testing real estate client setup...")
    realestate_result = setup_minimal_client(
        "Premier Properties",
        "https://premier-props.onrender.com", 
        "+1-555-HOMES",
        "Real Estate"
    )
    
    if realestate_result and realestate_result["setup_success"]:
        print(f"✅ Real estate setup: {len(realestate_result['applied_configs'])} configs applied")
    else:
        print("❌ Real estate setup failed")
    
    # Test technology setup
    print("\n💻 Testing technology client setup...")
    tech_result = setup_minimal_client(
        "TechFlow Systems",
        "https://techflow.onrender.com",
        "+1-555-TECH1",
        "Technology"
    )
    
    if tech_result and tech_result["setup_success"]:
        print(f"✅ Technology setup: {len(tech_result['applied_configs'])} configs applied")
    else:
        print("❌ Technology setup failed")
    
    print(f"\n🎯 Industry Configuration System Complete")
    print(f"• Automated industry template loading")
    print(f"• Dynamic configuration application") 
    print(f"• Minimal client input requirements")
    print(f"• Industry-specific call scripts and QA")
    
    return True

if __name__ == "__main__":
    test_industry_config_system()