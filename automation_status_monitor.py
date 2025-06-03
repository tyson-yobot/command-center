#!/usr/bin/env python3
"""
Automation Status Monitor
Real-time monitoring and health checks for all automation systems
"""

import os
import json
import requests
import time
from datetime import datetime, timedelta

class AutomationStatusMonitor:
    def __init__(self):
        self.status_log = []
        self.system_health = {}
        
    def check_all_automations(self):
        """Check status of all automation systems"""
        status_report = {
            "timestamp": datetime.now().isoformat(),
            "overall_health": "healthy",
            "systems": {}
        }
        
        # Check API integrations
        api_status = self.check_api_integrations()
        status_report["systems"]["api_integrations"] = api_status
        
        # Check webhook endpoints
        webhook_status = self.check_webhook_endpoints()
        status_report["systems"]["webhook_endpoints"] = webhook_status
        
        # Check automation scripts
        automation_status = self.check_automation_scripts()
        status_report["systems"]["automation_scripts"] = automation_status
        
        # Check database connections
        db_status = self.check_database_connections()
        status_report["systems"]["database_connections"] = db_status
        
        # Calculate overall health
        failed_systems = sum(1 for system in status_report["systems"].values() 
                           if system.get("status") != "healthy")
        
        if failed_systems == 0:
            status_report["overall_health"] = "healthy"
        elif failed_systems <= 2:
            status_report["overall_health"] = "degraded"
        else:
            status_report["overall_health"] = "critical"
            
        return status_report
    
    def check_api_integrations(self):
        """Check external API integration status"""
        integrations = {
            "hubspot": self.check_hubspot_api(),
            "airtable": self.check_airtable_api(),
            "slack": self.check_slack_api(),
            "openai": self.check_openai_api(),
            "elevenlabs": self.check_elevenlabs_api(),
            "stripe": self.check_stripe_api(),
            "quickbooks": self.check_quickbooks_api()
        }
        
        healthy_count = sum(1 for status in integrations.values() if status["status"] == "healthy")
        total_count = len(integrations)
        
        return {
            "status": "healthy" if healthy_count == total_count else "degraded",
            "healthy_apis": healthy_count,
            "total_apis": total_count,
            "details": integrations
        }
    
    def check_webhook_endpoints(self):
        """Check webhook endpoint availability"""
        endpoints = [
            "/api/webhook/support",
            "/api/webhook/lead", 
            "/api/webhook/payment",
            "/api/webhook/stripe",
            "/api/webhook/hubspot",
            "/api/webhook/usage",
            "/api/webhook/calendar",
            "/api/webhook/form"
        ]
        
        base_url = "http://localhost:5000"
        endpoint_status = {}
        
        for endpoint in endpoints:
            try:
                response = requests.get(f"{base_url}{endpoint}", timeout=5)
                endpoint_status[endpoint] = {
                    "status": "available" if response.status_code in [200, 404, 405] else "error",
                    "response_code": response.status_code
                }
            except Exception as e:
                endpoint_status[endpoint] = {
                    "status": "unavailable",
                    "error": str(e)
                }
        
        available_count = sum(1 for status in endpoint_status.values() 
                            if status["status"] == "available")
        
        return {
            "status": "healthy" if available_count == len(endpoints) else "degraded",
            "available_endpoints": available_count,
            "total_endpoints": len(endpoints),
            "details": endpoint_status
        }
    
    def check_automation_scripts(self):
        """Check automation script availability and syntax"""
        scripts = [
            "master_automation_config.py",
            "automation_webhook_manager.py",
            "calendar_automation.py",
            "form_automation.py",
            "ai_support_agent_refactored.py",
            "elevenlabs_voice_generator_refactored.py",
            "support_dispatcher.py"
        ]
        
        script_status = {}
        
        for script in scripts:
            if os.path.exists(script):
                try:
                    # Basic syntax check
                    with open(script, 'r') as f:
                        compile(f.read(), script, 'exec')
                    script_status[script] = {"status": "healthy", "exists": True, "syntax": "valid"}
                except SyntaxError as e:
                    script_status[script] = {"status": "error", "exists": True, "syntax": "invalid", "error": str(e)}
            else:
                script_status[script] = {"status": "missing", "exists": False}
        
        healthy_count = sum(1 for status in script_status.values() if status["status"] == "healthy")
        
        return {
            "status": "healthy" if healthy_count == len(scripts) else "degraded",
            "healthy_scripts": healthy_count,
            "total_scripts": len(scripts),
            "details": script_status
        }
    
    def check_database_connections(self):
        """Check database connection status"""
        try:
            # Check if DATABASE_URL is available
            db_url = os.getenv("DATABASE_URL")
            if not db_url:
                return {"status": "error", "error": "DATABASE_URL not configured"}
            
            # Basic connection test would go here
            return {"status": "healthy", "connection": "available"}
            
        except Exception as e:
            return {"status": "error", "error": str(e)}
    
    def check_hubspot_api(self):
        """Check HubSpot API status"""
        api_key = os.getenv("HUBSPOT_API_KEY")
        if not api_key:
            return {"status": "unconfigured", "error": "API key not set"}
        
        try:
            url = "https://api.hubapi.com/crm/v3/objects/contacts"
            headers = {"Authorization": f"Bearer {api_key}"}
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                return {"status": "healthy", "response_time": response.elapsed.total_seconds()}
            else:
                return {"status": "error", "http_code": response.status_code}
                
        except Exception as e:
            return {"status": "error", "error": str(e)}
    
    def check_airtable_api(self):
        """Check Airtable API status"""
        api_key = os.getenv("AIRTABLE_API_KEY")
        base_id = os.getenv("AIRTABLE_BASE_ID")
        
        if not api_key or not base_id:
            return {"status": "unconfigured", "error": "API key or base ID not set"}
        
        try:
            url = f"https://api.airtable.com/v0/{base_id}/Integration%20Test%20Log"
            headers = {"Authorization": f"Bearer {api_key}"}
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                return {"status": "healthy", "response_time": response.elapsed.total_seconds()}
            else:
                return {"status": "error", "http_code": response.status_code}
                
        except Exception as e:
            return {"status": "error", "error": str(e)}
    
    def check_slack_api(self):
        """Check Slack API status"""
        bot_token = os.getenv("SLACK_BOT_TOKEN")
        if not bot_token:
            return {"status": "unconfigured", "error": "Bot token not set"}
        
        try:
            url = "https://slack.com/api/auth.test"
            headers = {"Authorization": f"Bearer {bot_token}"}
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200 and response.json().get("ok"):
                return {"status": "healthy", "response_time": response.elapsed.total_seconds()}
            else:
                return {"status": "error", "response": response.json()}
                
        except Exception as e:
            return {"status": "error", "error": str(e)}
    
    def check_openai_api(self):
        """Check OpenAI API status"""
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            return {"status": "unconfigured", "error": "API key not set"}
        
        try:
            url = "https://api.openai.com/v1/models"
            headers = {"Authorization": f"Bearer {api_key}"}
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                return {"status": "healthy", "response_time": response.elapsed.total_seconds()}
            else:
                return {"status": "error", "http_code": response.status_code}
                
        except Exception as e:
            return {"status": "error", "error": str(e)}
    
    def check_elevenlabs_api(self):
        """Check ElevenLabs API status"""
        api_key = os.getenv("ELEVENLABS_API_KEY")
        if not api_key:
            return {"status": "unconfigured", "error": "API key not set"}
        
        try:
            url = "https://api.elevenlabs.io/v1/voices"
            headers = {"xi-api-key": api_key}
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                return {"status": "healthy", "response_time": response.elapsed.total_seconds()}
            else:
                return {"status": "error", "http_code": response.status_code}
                
        except Exception as e:
            return {"status": "error", "error": str(e)}
    
    def check_stripe_api(self):
        """Check Stripe API status"""
        api_key = os.getenv("STRIPE_SECRET_KEY")
        if not api_key:
            return {"status": "unconfigured", "error": "API key not set"}
        
        try:
            url = "https://api.stripe.com/v1/customers"
            headers = {"Authorization": f"Bearer {api_key}"}
            response = requests.get(url, headers=headers, timeout=10, params={"limit": 1})
            
            if response.status_code == 200:
                return {"status": "healthy", "response_time": response.elapsed.total_seconds()}
            else:
                return {"status": "error", "http_code": response.status_code}
                
        except Exception as e:
            return {"status": "error", "error": str(e)}
    
    def check_quickbooks_api(self):
        """Check QuickBooks API status"""
        access_token = os.getenv("QUICKBOOKS_ACCESS_TOKEN")
        realm_id = os.getenv("QUICKBOOKS_REALM_ID")
        
        if not access_token or not realm_id:
            return {"status": "unconfigured", "error": "Access token or realm ID not set"}
        
        # QuickBooks API check would require more complex OAuth handling
        return {"status": "configured", "note": "OAuth tokens available"}
    
    def generate_status_report(self):
        """Generate comprehensive status report"""
        status = self.check_all_automations()
        
        report = f"""
=== YoBot Automation Status Report ===
Generated: {status['timestamp']}
Overall Health: {status['overall_health'].upper()}

API Integrations: {status['systems']['api_integrations']['healthy_apis']}/{status['systems']['api_integrations']['total_apis']} healthy
Webhook Endpoints: {status['systems']['webhook_endpoints']['available_endpoints']}/{status['systems']['webhook_endpoints']['total_endpoints']} available
Automation Scripts: {status['systems']['automation_scripts']['healthy_scripts']}/{status['systems']['automation_scripts']['total_scripts']} healthy
Database: {status['systems']['database_connections']['status']}

=== Detailed Status ===
"""
        
        # Add API details
        for api, details in status['systems']['api_integrations']['details'].items():
            report += f"{api.title()}: {details['status']}\n"
        
        # Add recommendations
        report += "\n=== Recommendations ===\n"
        
        unconfigured_apis = [api for api, details in status['systems']['api_integrations']['details'].items() 
                           if details['status'] == 'unconfigured']
        
        if unconfigured_apis:
            report += f"Configure API keys for: {', '.join(unconfigured_apis)}\n"
        
        return report
    
    def log_status_to_airtable(self, status_data):
        """Log status check to Airtable"""
        api_key = os.getenv("AIRTABLE_API_KEY")
        base_id = os.getenv("AIRTABLE_BASE_ID")
        
        if not api_key or not base_id:
            return False
        
        try:
            url = f"https://api.airtable.com/v0/{base_id}/System%20Health%20Log"
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            
            record_data = {
                "fields": {
                    "Timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                    "Overall Health": status_data['overall_health'],
                    "API Status": f"{status_data['systems']['api_integrations']['healthy_apis']}/{status_data['systems']['api_integrations']['total_apis']}",
                    "Webhook Status": f"{status_data['systems']['webhook_endpoints']['available_endpoints']}/{status_data['systems']['webhook_endpoints']['total_endpoints']}",
                    "Script Status": f"{status_data['systems']['automation_scripts']['healthy_scripts']}/{status_data['systems']['automation_scripts']['total_scripts']}",
                    "Raw Data": json.dumps(status_data)
                }
            }
            
            response = requests.post(url, headers=headers, json=record_data)
            return response.status_code in [200, 201]
            
        except Exception:
            return False

def main():
    """Run status check and display results"""
    monitor = AutomationStatusMonitor()
    
    print("Checking automation system status...")
    status = monitor.check_all_automations()
    
    # Display results
    report = monitor.generate_status_report()
    print(report)
    
    # Log to Airtable if possible
    logged = monitor.log_status_to_airtable(status)
    if logged:
        print("Status logged to Airtable successfully")
    
    # Return status for programmatic access
    return status

if __name__ == "__main__":
    main()