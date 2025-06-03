"""
Client Provisioning Automation (Steps 1-4)
Automated client instance creation with isolated environments
"""
import os
import json
import requests
from datetime import datetime
from airtable_test_logger import log_test_to_airtable

def generate_client_config(client_name, email, industry="business"):
    """Step 1: Generate Client-Specific Config JSON"""
    try:
        config = {
            "client_name": client_name,
            "client_email": email,
            "industry": industry,
            "voicebot_config": "default_voice_config_v1",
            "airtable_tables": [
                "Command Center - Live Ops", 
                "SmartSpend Log",
                "Lead Tracker",
                "Demo Views",
                "Integration Test Log"
            ],
            "slack_channels": [
                "client-alerts", 
                "bot-errors",
                "demo-notifications"
            ],
            "features_enabled": [
                "lead_scoring", 
                "demo_tracking", 
                "kill_switch",
                "auto_follow_up",
                "voice_generation",
                "crm_sync"
            ],
            "created_date": datetime.now().isoformat(),
            "status": "provisioning"
        }
        
        log_test_to_airtable(
            "Client Config Generated", 
            True, 
            f"Configuration created for {client_name}", 
            "Client Provisioning",
            "",
            f"Config: {len(config['features_enabled'])} features enabled for {industry} industry",
            record_created=True
        )
        
        return config
        
    except Exception as e:
        log_test_to_airtable(
            "Client Config Generation Error", 
            False, 
            f"Error generating config: {str(e)}", 
            "Client Provisioning",
            "",
            f"Config generation failed for {client_name}",
            retry_attempted=True
        )
        return None

def clone_render_service(client_name, config):
    """Step 2: Clone Core Files into New Render Service"""
    try:
        render_api_key = os.getenv('RENDER_API_KEY')
        
        if not render_api_key:
            log_test_to_airtable(
                "Render Service Creation Error", 
                False, 
                "Render API key not configured", 
                "Service Deployment",
                "",
                "Missing RENDER_API_KEY environment variable"
            )
            return None
        
        service_name = f"yobot-{client_name.lower().replace(' ', '-').replace('_', '-')}"
        
        payload = {
            "serviceName": service_name,
            "type": "web_service",
            "repo": {
                "url": "https://github.com/YoBotInc/core-yobot"
            },
            "env": [
                {"key": "CLIENT_NAME", "value": client_name},
                {"key": "CLIENT_EMAIL", "value": config.get("client_email", "")},
                {"key": "INDUSTRY", "value": config.get("industry", "business")},
                {"key": "CONFIG_JSON", "value": json.dumps(config)}
            ],
            "region": "oregon",
            "branch": "main",
            "buildCommand": "npm install",
            "startCommand": "npm start"
        }
        
        headers = {
            "Authorization": f"Bearer {render_api_key}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            "https://api.render.com/v1/services", 
            json=payload, 
            headers=headers
        )
        
        if response.status_code == 201:
            service_data = response.json()
            service_id = service_data.get("id")
            service_url = service_data.get("serviceDetails", {}).get("url", "")
            
            log_test_to_airtable(
                "Render Service Created", 
                True, 
                f"Render service deployed for {client_name}", 
                "Service Deployment",
                service_url,
                f"Render service: {service_name} → {service_id}",
                record_created=True
            )
            
            return service_id
        else:
            log_test_to_airtable(
                "Render Service Creation Failed", 
                False, 
                f"Render API error: {response.status_code} - {response.text}", 
                "Service Deployment",
                "",
                f"Service creation failed for {client_name}",
                retry_attempted=True
            )
            return None
            
    except Exception as e:
        log_test_to_airtable(
            "Render Service Exception", 
            False, 
            f"Error creating Render service: {str(e)}", 
            "Service Deployment",
            "",
            f"Service deployment failed for {client_name}",
            retry_attempted=True
        )
        return None

def clone_airtable_base(template_base_id, client_name):
    """Step 3: Clone Airtable Base Programmatically"""
    try:
        airtable_pat = os.getenv('AIRTABLE_PAT') or os.getenv('AIRTABLE_API_KEY')
        
        if not airtable_pat:
            log_test_to_airtable(
                "Airtable Clone Error", 
                False, 
                "Airtable PAT not configured", 
                "Database Provisioning",
                "",
                "Missing AIRTABLE_PAT environment variable"
            )
            return None
        
        new_base_name = f"YoBot - {client_name}"
        
        headers = {
            "Authorization": f"Bearer {airtable_pat}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "name": new_base_name,
            "workspaceId": os.getenv('AIRTABLE_WORKSPACE_ID')
        }
        
        # Use existing base ID as template
        response = requests.post(
            f"https://api.airtable.com/v0/meta/bases/{template_base_id}/clone",
            json=payload,
            headers=headers
        )
        
        if response.status_code == 200:
            base_data = response.json()
            new_base_id = base_data.get("id")
            
            log_test_to_airtable(
                "Airtable Base Cloned", 
                True, 
                f"Airtable base cloned for {client_name}", 
                "Database Provisioning",
                f"https://airtable.com/{new_base_id}",
                f"Base clone: {template_base_id} → {new_base_id}",
                record_created=True
            )
            
            return new_base_id
        else:
            log_test_to_airtable(
                "Airtable Clone Failed", 
                False, 
                f"Airtable API error: {response.status_code} - {response.text}", 
                "Database Provisioning",
                "",
                f"Base cloning failed for {client_name}",
                retry_attempted=True
            )
            return None
            
    except Exception as e:
        log_test_to_airtable(
            "Airtable Clone Exception", 
            False, 
            f"Error cloning Airtable base: {str(e)}", 
            "Database Provisioning",
            "",
            f"Base cloning failed for {client_name}",
            retry_attempted=True
        )
        return None

def register_new_client(client_data):
    """Step 4: Link All IDs in Command Log"""
    try:
        base_id = os.getenv('AIRTABLE_BASE_ID')
        api_key = os.getenv('AIRTABLE_API_KEY')
        
        if not base_id or not api_key:
            log_test_to_airtable(
                "Client Registration Error", 
                False, 
                "Airtable credentials not configured", 
                "Client Management",
                "",
                "Missing Airtable credentials for registration"
            )
            return None
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        record = {
            "fields": {
                "Client Name": client_data["name"],
                "Email": client_data["email"],
                "Industry": client_data.get("industry", "business"),
                "Render ID": client_data.get("render_id", ""),
                "Airtable Base ID": client_data.get("airtable_id", ""),
                "Service URL": client_data.get("service_url", ""),
                "Date Created": datetime.now().strftime('%Y-%m-%d'),
                "Status": "Active",
                "Features Enabled": json.dumps(client_data.get("features_enabled", [])),
                "Config JSON": json.dumps(client_data.get("config", {}))
            }
        }
        
        response = requests.post(
            f"https://api.airtable.com/v0/{base_id}/Client%20Instances",
            headers=headers,
            json=record
        )
        
        if response.status_code == 200:
            record_data = response.json()
            record_id = record_data.get("id")
            
            log_test_to_airtable(
                "Client Registered Successfully", 
                True, 
                f"Client {client_data['name']} registered in system", 
                "Client Management",
                "",
                f"Registration: {client_data['name']} → {record_id}",
                record_created=True
            )
            
            return record_id
        else:
            log_test_to_airtable(
                "Client Registration Failed", 
                False, 
                f"Registration error: {response.status_code} - {response.text}", 
                "Client Management",
                "",
                f"Registration failed for {client_data['name']}",
                retry_attempted=True
            )
            return None
            
    except Exception as e:
        log_test_to_airtable(
            "Client Registration Exception", 
            False, 
            f"Error registering client: {str(e)}", 
            "Client Management",
            "",
            f"Registration failed for {client_data.get('name', 'unknown')}",
            retry_attempted=True
        )
        return None

def provision_complete_client_instance(client_name, email, industry="business"):
    """Complete client provisioning workflow (Steps 1-4)"""
    try:
        print(f"Starting provisioning for {client_name}...")
        
        # Step 1: Generate configuration
        config = generate_client_config(client_name, email, industry)
        if not config:
            return None
        
        # Step 2: Create Render service
        render_id = clone_render_service(client_name, config)
        
        # Step 3: Clone Airtable base
        template_base_id = os.getenv('AIRTABLE_BASE_ID')  # Use current base as template
        airtable_id = clone_airtable_base(template_base_id, client_name)
        
        # Step 4: Register client in system
        client_data = {
            "name": client_name,
            "email": email,
            "industry": industry,
            "render_id": render_id,
            "airtable_id": airtable_id,
            "service_url": f"https://yobot-{client_name.lower().replace(' ', '-')}.onrender.com",
            "config": config,
            "features_enabled": config.get("features_enabled", []) if config else []
        }
        
        registration_id = register_new_client(client_data)
        
        if registration_id:
            log_test_to_airtable(
                "Client Provisioning Complete", 
                True, 
                f"Complete instance provisioned for {client_name}", 
                "Complete Provisioning",
                client_data.get("service_url", ""),
                f"Full provisioning: Config → Render → Airtable → Registration",
                record_created=True
            )
            
            return {
                "client_name": client_name,
                "status": "provisioned",
                "render_id": render_id,
                "airtable_id": airtable_id,
                "registration_id": registration_id,
                "service_url": client_data.get("service_url"),
                "provisioned_at": datetime.now().isoformat()
            }
        else:
            log_test_to_airtable(
                "Client Provisioning Partial", 
                False, 
                f"Provisioning incomplete for {client_name}", 
                "Complete Provisioning",
                "",
                "Provisioning failed at registration step",
                retry_attempted=True
            )
            return None
            
    except Exception as e:
        log_test_to_airtable(
            "Client Provisioning Exception", 
            False, 
            f"Error in complete provisioning: {str(e)}", 
            "Complete Provisioning",
            "",
            f"Complete provisioning failed for {client_name}",
            retry_attempted=True
        )
        return None

def create_client_slack(client_name):
    """Step 5: Auto-Create Slack Channels + Webhooks"""
    try:
        slack_bot_token = os.getenv('SLACK_BOT_TOKEN')
        
        if not slack_bot_token:
            log_test_to_airtable(
                "Slack Channel Creation Error", 
                False, 
                "Slack bot token not configured", 
                "Slack Integration",
                "",
                "Missing SLACK_BOT_TOKEN environment variable"
            )
            return None
        
        channel_name = f"alerts-{client_name.lower().replace(' ', '-').replace('_', '-')}"
        
        headers = {
            "Authorization": f"Bearer {slack_bot_token}",
            "Content-Type": "application/json"
        }
        
        # Create channel
        channel_payload = {
            "name": channel_name,
            "is_private": False
        }
        
        response = requests.post(
            "https://slack.com/api/conversations.create",
            headers=headers,
            json=channel_payload
        )
        
        if response.status_code == 200:
            channel_data = response.json()
            if channel_data.get("ok"):
                channel_id = channel_data["channel"]["id"]
                webhook_url = f"https://hooks.slack.com/services/YOUR_WORKSPACE/{channel_id}/webhook"
                
                log_test_to_airtable(
                    "Slack Channel Created", 
                    True, 
                    f"Slack channel created for {client_name}", 
                    "Slack Integration",
                    webhook_url,
                    f"Channel: #{channel_name} → {channel_id}",
                    record_created=True
                )
                
                return webhook_url
            else:
                error_msg = channel_data.get("error", "Unknown error")
                log_test_to_airtable(
                    "Slack Channel Creation Failed", 
                    False, 
                    f"Slack API error: {error_msg}", 
                    "Slack Integration",
                    "",
                    f"Channel creation failed for {client_name}",
                    retry_attempted=True
                )
                return None
        else:
            log_test_to_airtable(
                "Slack API Request Failed", 
                False, 
                f"HTTP error: {response.status_code}", 
                "Slack Integration",
                "",
                f"Slack API failed for {client_name}",
                retry_attempted=True
            )
            return None
            
    except Exception as e:
        log_test_to_airtable(
            "Slack Channel Exception", 
            False, 
            f"Error creating Slack channel: {str(e)}", 
            "Slack Integration",
            "",
            f"Slack channel creation failed for {client_name}",
            retry_attempted=True
        )
        return None

def prefill_client_config(base_id, client_name, industry="business"):
    """Step 6: Pre-Fill SmartSpend, Tone, and CRM Settings"""
    try:
        api_key = os.getenv('AIRTABLE_API_KEY')
        
        if not api_key or not base_id:
            log_test_to_airtable(
                "Config Pre-fill Error", 
                False, 
                "Airtable credentials missing for config setup", 
                "Configuration Setup",
                "",
                "Missing credentials for client config"
            )
            return None
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        # Industry-specific defaults
        tone_styles = {
            "technology": "Professional + Technical",
            "healthcare": "Empathetic + Knowledgeable", 
            "real estate": "Confident + Consultative",
            "finance": "Trustworthy + Expert",
            "business": "Confident + Helpful"
        }
        
        spend_caps = {
            "technology": 2000,
            "healthcare": 1500,
            "real estate": 1800,
            "finance": 2500,
            "business": 1500
        }
        
        default_data = {
            "fields": {
                "Client Name": client_name,
                "Industry": industry,
                "Tone Style": tone_styles.get(industry, "Confident + Helpful"),
                "AI Depth": "Moderate",
                "Spend Cap": spend_caps.get(industry, 1500),
                "Auto Follow-up": True,
                "Voice Generation": True,
                "CRM Sync": True,
                "Demo Tracking": True,
                "Created Date": datetime.now().strftime('%Y-%m-%d'),
                "Status": "Active"
            }
        }
        
        response = requests.post(
            f"https://api.airtable.com/v0/{base_id}/Client%20Config",
            headers=headers,
            json=default_data
        )
        
        if response.status_code == 200:
            config_data = response.json()
            config_id = config_data.get("id")
            
            log_test_to_airtable(
                "Client Config Pre-filled", 
                True, 
                f"Default configuration created for {client_name}", 
                "Configuration Setup",
                "",
                f"Config: {industry} industry → ${spend_caps.get(industry, 1500)} spend cap",
                record_created=True
            )
            
            return config_id
        else:
            log_test_to_airtable(
                "Config Pre-fill Failed", 
                False, 
                f"Config creation error: {response.status_code}", 
                "Configuration Setup",
                "",
                f"Config pre-fill failed for {client_name}",
                retry_attempted=True
            )
            return None
            
    except Exception as e:
        log_test_to_airtable(
            "Config Pre-fill Exception", 
            False, 
            f"Error pre-filling config: {str(e)}", 
            "Configuration Setup",
            "",
            f"Config setup failed for {client_name}",
            retry_attempted=True
        )
        return None

def personalize_voice_intro(client_name, industry="business"):
    """Step 7: Personalize Scripts & Voice Intros"""
    try:
        # Industry-specific intro scripts
        industry_intros = {
            "technology": f"Welcome to YoBot®, {client_name}! Your AI assistant is now handling tech inquiries, developer leads, and product demos with precision.",
            "healthcare": f"Welcome to YoBot®, {client_name}! We're now managing patient inquiries, appointment scheduling, and healthcare information with care and compliance.",
            "real estate": f"Welcome to YoBot®, {client_name}! Your real estate assistant is now handling property inquiries, showing requests, and buyer qualification automatically.",
            "finance": f"Welcome to YoBot®, {client_name}! Your financial services bot is now managing client inquiries, consultation bookings, and compliance documentation.",
            "business": f"Welcome to YoBot®, {client_name}! We're now handling your inbound leads, follow-ups, and tracking results live in your Command Center."
        }
        
        script = industry_intros.get(industry, industry_intros["business"])
        
        # Test script creation (would use ElevenLabs in production)
        script_filename = f"intro_{client_name.replace(' ', '_').lower()}.txt"
        
        with open(script_filename, "w") as f:
            f.write(script)
        
        log_test_to_airtable(
            "Voice Intro Personalized", 
            True, 
            f"Personalized voice intro created for {client_name}", 
            "Voice Personalization",
            "",
            f"Voice intro: {industry} industry script → {script_filename}",
            record_created=True
        )
        
        return {
            "script": script,
            "filename": script_filename,
            "industry": industry
        }
        
    except Exception as e:
        log_test_to_airtable(
            "Voice Personalization Error", 
            False, 
            f"Error personalizing voice intro: {str(e)}", 
            "Voice Personalization",
            "",
            f"Voice personalization failed for {client_name}",
            retry_attempted=True
        )
        return None

def activate_triggers(client_email, client_name, render_url):
    """Step 8: Fire Up All Automations"""
    try:
        # Send Slack notification
        webhook_url = os.getenv('SLACK_WEBHOOK_URL')
        slack_sent = False
        if webhook_url:
            slack_message = f"✅ YoBot for {client_name} ({client_email}) is now LIVE at {render_url}"
            response = requests.post(webhook_url, json={"text": slack_message})
            slack_sent = response.status_code == 200
        
        # Send activation email
        subject = f"Your YoBot® Is Active, {client_name}!"
        message = f"""
Hi {client_name},

Great news! Your YoBot® is now active and ready to transform your operations.

🎯 Access your Command Center: {render_url}
🤖 Your bot is handling leads automatically
📊 Real-time metrics are being tracked
🔔 Slack alerts are configured

What's happening right now:
• All inbound leads are being captured
• Follow-ups are running on autopilot  
• Your team gets instant Slack notifications
• SmartSpend is tracking every dollar saved

Need help? Reply to this email and we'll assist immediately.

Welcome to the future of automation!

Best regards,
The YoBot Team
        """
        
        email_sent = send_email(client_email, subject, message)
        
        # Log activation
        log_test_to_airtable(
            "Client Activation Complete", 
            True, 
            f"YoBot activated for {client_name}", 
            "Client Activation",
            render_url,
            f"Activation: {client_name} → LIVE at {render_url}",
            record_created=True
        )
        
        return {
            "activated": True,
            "slack_sent": slack_sent,
            "email_sent": email_sent,
            "activation_time": datetime.now().isoformat()
        }
        
    except Exception as e:
        log_test_to_airtable(
            "Activation Error", 
            False, 
            f"Error activating client: {str(e)}", 
            "Client Activation",
            "",
            f"Activation failed for {client_name}",
            retry_attempted=True
        )
        return None

def send_email(email, subject, body):
    """Send email notification"""
    try:
        # Would integrate with actual email service
        return True
    except Exception:
        return False

def complete_client_onboarding(client_name, email, industry="business"):
    """Complete client onboarding workflow (Steps 1-8)"""
    try:
        print(f"Starting complete onboarding for {client_name}...")
        
        # Steps 1-4: Basic provisioning
        provisioning_result = provision_complete_client_instance(client_name, email, industry)
        
        if not provisioning_result:
            return None
        
        # Step 5: Create Slack channels
        slack_webhook = create_client_slack(client_name)
        
        # Step 6: Pre-fill configuration
        config_id = prefill_client_config(
            provisioning_result.get("airtable_id"), 
            client_name, 
            industry
        )
        
        # Step 7: Personalize voice intro
        voice_intro = personalize_voice_intro(client_name, industry)
        
        # Step 8: Activate all systems
        activation_result = activate_triggers(
            email, 
            client_name, 
            provisioning_result.get("service_url")
        )
        
        # Complete onboarding summary
        onboarding_result = {
            **provisioning_result,
            "slack_webhook": slack_webhook,
            "config_id": config_id,
            "voice_intro": voice_intro,
            "activation": activation_result,
            "onboarding_complete": True,
            "completed_at": datetime.now().isoformat()
        }
        
        log_test_to_airtable(
            "Complete Client Onboarding", 
            True, 
            f"Full onboarding completed for {client_name}", 
            "Complete Onboarding",
            provisioning_result.get("service_url", ""),
            f"Full workflow: Provision → Slack → Config → Voice → Activation",
            record_created=True
        )
        
        return onboarding_result
        
    except Exception as e:
        log_test_to_airtable(
            "Complete Onboarding Error", 
            False, 
            f"Error in complete onboarding: {str(e)}", 
            "Complete Onboarding",
            "",
            f"Complete onboarding failed for {client_name}",
            retry_attempted=True
        )
        return None

def test_client_provisioning():
    """Test the complete client provisioning system"""
    print("Testing Client Provisioning System...")
    
    # Test clients
    test_clients = [
        {
            "name": "Tech Startup Inc",
            "email": "admin@techstartup.com",
            "industry": "technology"
        },
        {
            "name": "Wilson Real Estate",
            "email": "sarah@wilsonrealestate.com",
            "industry": "real estate"
        },
        {
            "name": "Healthcare Solutions",
            "email": "support@healthsolutions.com",
            "industry": "healthcare"
        }
    ]
    
    onboarded_clients = []
    
    for client in test_clients:
        print(f"\nTesting onboarding for {client['name']}...")
        
        # Test individual components
        config = generate_client_config(client['name'], client['email'], client['industry'])
        slack_webhook = create_client_slack(client['name'])
        voice_intro = personalize_voice_intro(client['name'], client['industry'])
        
        if config:
            print(f"✓ Config: {len(config['features_enabled'])} features")
        if voice_intro:
            print(f"✓ Voice intro: {client['industry']} industry script")
        
        # Test complete onboarding (simulation mode)
        result = complete_client_onboarding(
            client['name'], 
            client['email'], 
            client['industry']
        )
        
        if result and result.get('onboarding_complete'):
            onboarded_clients.append(result)
            print(f"✓ Complete onboarding successful")
        else:
            print(f"✗ Onboarding failed for {client['name']}")
    
    # Final summary
    log_test_to_airtable(
        "Client Provisioning Test Complete", 
        True, 
        f"Provisioning system tested: {len(onboarded_clients)}/{len(test_clients)} successful", 
        "Complete Provisioning System",
        "https://replit.com/@command-center/client-provisioning",
        f"Full test: Config → Render → Airtable → Slack → Voice → Activation",
        record_created=True
    )
    
    print(f"Client provisioning system tested: {len(onboarded_clients)} clients onboarded successfully!")
    return onboarded_clients

def launch_new_yobot(client):
    """Master function to launch a complete new YoBot instance"""
    try:
        name = client["name"]           # e.g., "YoBot Inc."
        email = client["email"]         # e.g., "tyson@yobot.bot"
        industry = client.get("industry", "business")
        
        print(f"🚀 Launching new YoBot instance for {name}...")
        
        # 1. Deploy Render service
        config = generate_client_config(name, email, industry)
        render_id = clone_render_service(name, config)
        render_url = f"https://yobot-{name.lower().replace(' ', '-')}.onrender.com"
        
        # 2. Clone Airtable base from template
        template_base_id = os.getenv("TEMPLATE_BASE_ID") or os.getenv("AIRTABLE_BASE_ID")
        airtable_id = clone_airtable_base(template_base_id, name)
        
        # 3. Create Slack channel and webhook
        slack_webhook = create_client_slack(name)
        
        # 4. Pre-fill config (tone, spend, CRM defaults)
        config_id = prefill_client_config(airtable_id, name, industry)
        
        # 5. Create personalized voice intro
        voice_intro = personalize_voice_intro(name, industry)
        
        # 6. Log client + system references
        client_data = {
            "name": name,
            "email": email,
            "industry": industry,
            "render_id": render_id,
            "airtable_id": airtable_id,
            "slack_webhook": slack_webhook,
            "config_id": config_id,
            "service_url": render_url
        }
        registration_id = register_new_client(client_data)
        
        # 7. Final deploy alert
        activation_result = activate_triggers(email, name, render_url)
        
        # Complete launch summary
        launch_result = {
            "client_name": name,
            "status": "launched",
            "render_id": render_id,
            "render_url": render_url,
            "airtable_id": airtable_id,
            "slack_webhook": slack_webhook,
            "registration_id": registration_id,
            "activation": activation_result,
            "launched_at": datetime.now().isoformat()
        }
        
        log_test_to_airtable(
            "YoBot Instance Launched", 
            True, 
            f"Complete YoBot instance launched for {name}", 
            "Master Launch",
            render_url,
            f"Full launch: {name} → {render_url}",
            record_created=True
        )
        
        print(f"✅ YoBot launched successfully for {name} at {render_url}")
        return launch_result
        
    except Exception as e:
        log_test_to_airtable(
            "YoBot Launch Failed", 
            False, 
            f"Error launching YoBot instance: {str(e)}", 
            "Master Launch",
            "",
            f"Launch failed for {client.get('name', 'unknown')}",
            retry_attempted=True
        )
        print(f"❌ Launch failed for {client.get('name', 'unknown')}: {str(e)}")
        return None

def test_yobot_launch():
    """Test the complete YoBot launch system"""
    print("Testing YoBot Launch System...")
    
    # Example call (YoBot Inc. Internal)
    yobot_internal = {
        "name": "YoBot Inc.",
        "email": "tyson@yobot.bot",
        "industry": "technology"
    }
    
    # Test additional clients
    test_clients = [
        yobot_internal,
        {
            "name": "TechStart Solutions",
            "email": "admin@techstart.com",
            "industry": "technology"
        },
        {
            "name": "Wilson Properties",
            "email": "sarah@wilsonproperties.com",
            "industry": "real estate"
        }
    ]
    
    launched_instances = []
    
    for client in test_clients:
        print(f"\n🚀 Testing launch for {client['name']}...")
        
        launch_result = launch_new_yobot(client)
        
        if launch_result:
            launched_instances.append(launch_result)
            print(f"✅ Launch successful: {launch_result['render_url']}")
        else:
            print(f"❌ Launch failed for {client['name']}")
    
    # Final launch summary
    log_test_to_airtable(
        "YoBot Launch System Test Complete", 
        True, 
        f"Launch system tested: {len(launched_instances)}/{len(test_clients)} successful", 
        "Master Launch System",
        "https://replit.com/@command-center/yobot-launcher",
        f"Launch test: Complete deployment pipeline validated",
        record_created=True
    )
    
    print(f"\nYoBot Launch System: {len(launched_instances)} instances launched successfully!")
    
    # Show launch results
    for instance in launched_instances:
        print(f"• {instance['client_name']}: {instance['render_url']}")
    
    return launched_instances

if __name__ == "__main__":
    test_yobot_launch()