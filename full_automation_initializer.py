#!/usr/bin/env python3
"""
Full Automation Initializer
Complete system initialization and configuration for YoBot automation platform
"""

import os
import sys
import json
import subprocess
from datetime import datetime

class FullAutomationInitializer:
    def __init__(self):
        self.initialization_log = []
        self.automation_modules = [
            "master_automation_config.py",
            "automation_webhook_manager.py", 
            "calendar_automation.py",
            "form_automation.py",
            "automation_status_monitor.py",
            "ai_support_agent_refactored.py",
            "elevenlabs_voice_generator_refactored.py",
            "support_dispatcher.py"
        ]
        
    def initialize_full_automation(self):
        """Initialize complete automation system"""
        print("🚀 Initializing YoBot Full Automation System...")
        
        results = {
            "timestamp": datetime.now().isoformat(),
            "initialization_steps": {},
            "automation_status": {},
            "webhook_endpoints": {},
            "api_integrations": {},
            "overall_status": "unknown"
        }
        
        # Step 1: Verify automation modules
        print("📋 Step 1: Verifying automation modules...")
        module_status = self.verify_automation_modules()
        results["initialization_steps"]["module_verification"] = module_status
        
        # Step 2: Test webhook endpoints
        print("🔗 Step 2: Testing webhook endpoints...")
        webhook_status = self.test_webhook_endpoints()
        results["webhook_endpoints"] = webhook_status
        
        # Step 3: Check API integrations
        print("🔌 Step 3: Checking API integrations...")
        api_status = self.check_api_readiness()
        results["api_integrations"] = api_status
        
        # Step 4: Initialize automation workflows
        print("⚙️ Step 4: Initializing automation workflows...")
        workflow_status = self.initialize_workflows()
        results["initialization_steps"]["workflow_initialization"] = workflow_status
        
        # Step 5: Run comprehensive tests
        print("🧪 Step 5: Running automation tests...")
        test_status = self.run_automation_tests()
        results["initialization_steps"]["automation_tests"] = test_status
        
        # Step 6: Generate system report
        print("📊 Step 6: Generating system report...")
        system_report = self.generate_system_report()
        results["automation_status"] = system_report
        
        # Determine overall status
        results["overall_status"] = self.calculate_overall_status(results)
        
        # Display results
        self.display_initialization_results(results)
        
        return results
    
    def verify_automation_modules(self):
        """Verify all automation modules are present and functional"""
        module_status = {}
        
        for module in self.automation_modules:
            if os.path.exists(module):
                try:
                    # Test module import
                    result = subprocess.run([
                        sys.executable, "-c", f"import {module.replace('.py', '')}"
                    ], capture_output=True, text=True, timeout=10)
                    
                    if result.returncode == 0:
                        module_status[module] = {
                            "status": "functional",
                            "size": os.path.getsize(module)
                        }
                    else:
                        module_status[module] = {
                            "status": "import_error",
                            "error": result.stderr
                        }
                except Exception as e:
                    module_status[module] = {
                        "status": "test_failed",
                        "error": str(e)
                    }
            else:
                module_status[module] = {"status": "missing"}
        
        return module_status
    
    def test_webhook_endpoints(self):
        """Test all webhook endpoints"""
        import requests
        
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
                # Test with OPTIONS request to check if endpoint exists
                response = requests.options(f"{base_url}{endpoint}", timeout=5)
                endpoint_status[endpoint] = {
                    "status": "available",
                    "response_code": response.status_code,
                    "response_time": response.elapsed.total_seconds()
                }
            except requests.exceptions.ConnectionError:
                endpoint_status[endpoint] = {
                    "status": "server_unavailable",
                    "error": "Cannot connect to server"
                }
            except Exception as e:
                endpoint_status[endpoint] = {
                    "status": "error", 
                    "error": str(e)
                }
        
        return endpoint_status
    
    def check_api_readiness(self):
        """Check API integration readiness"""
        required_apis = {
            "OPENAI_API_KEY": "OpenAI",
            "ELEVENLABS_API_KEY": "ElevenLabs", 
            "SLACK_BOT_TOKEN": "Slack",
            "AIRTABLE_API_KEY": "Airtable",
            "HUBSPOT_API_KEY": "HubSpot",
            "STRIPE_SECRET_KEY": "Stripe",
            "QUICKBOOKS_ACCESS_TOKEN": "QuickBooks",
            "MAKE_WEBHOOK_URL": "Make.com"
        }
        
        api_status = {}
        
        for env_var, service_name in required_apis.items():
            api_key = os.getenv(env_var)
            if api_key:
                api_status[service_name] = {
                    "status": "configured",
                    "key_length": len(api_key),
                    "key_prefix": api_key[:8] + "..." if len(api_key) > 8 else "short"
                }
            else:
                api_status[service_name] = {
                    "status": "not_configured",
                    "env_var": env_var
                }
        
        return api_status
    
    def initialize_workflows(self):
        """Initialize automation workflows"""
        workflow_results = {}
        
        # Test master automation config
        try:
            result = subprocess.run([
                sys.executable, "master_automation_config.py", "--test"
            ], capture_output=True, text=True, timeout=30)
            
            workflow_results["master_config"] = {
                "status": "success" if result.returncode == 0 else "failed",
                "output": result.stdout,
                "error": result.stderr if result.returncode != 0 else None
            }
        except Exception as e:
            workflow_results["master_config"] = {
                "status": "failed",
                "error": str(e)
            }
        
        # Test webhook manager
        try:
            test_payload = {"test": "data", "type": "initialization"}
            result = subprocess.run([
                sys.executable, "automation_webhook_manager.py", "lead-capture", json.dumps(test_payload)
            ], capture_output=True, text=True, timeout=15)
            
            workflow_results["webhook_manager"] = {
                "status": "success" if result.returncode == 0 else "failed",
                "output": result.stdout,
                "error": result.stderr if result.returncode != 0 else None
            }
        except Exception as e:
            workflow_results["webhook_manager"] = {
                "status": "failed",
                "error": str(e)
            }
        
        return workflow_results
    
    def run_automation_tests(self):
        """Run comprehensive automation tests"""
        test_results = {}
        
        # Test support ticket processing
        test_ticket = {
            "ticketId": "TEST-INIT-001",
            "clientName": "System Test",
            "topic": "Automation initialization test",
            "sentiment": "neutral"
        }
        
        try:
            result = subprocess.run([
                sys.executable, "ai_support_agent.py", json.dumps(test_ticket)
            ], capture_output=True, text=True, timeout=15)
            
            test_results["support_processing"] = {
                "status": "success" if result.returncode == 0 else "failed",
                "response": result.stdout.strip(),
                "error": result.stderr if result.returncode != 0 else None
            }
        except Exception as e:
            test_results["support_processing"] = {
                "status": "failed",
                "error": str(e)
            }
        
        # Test voice generation
        test_voice = {"text": "Automation system initialization test"}
        
        try:
            result = subprocess.run([
                sys.executable, "elevenlabs_voice_generator.py", json.dumps(test_voice)
            ], capture_output=True, text=True, timeout=15)
            
            test_results["voice_generation"] = {
                "status": "success" if "Voice generation" in result.stdout else "failed",
                "response": result.stdout.strip(),
                "error": result.stderr if result.returncode != 0 else None
            }
        except Exception as e:
            test_results["voice_generation"] = {
                "status": "failed",
                "error": str(e)
            }
        
        # Test calendar automation
        test_booking = {
            "attendee_name": "Test User",
            "attendee_email": "test@example.com",
            "meeting_type": "demo",
            "scheduled_time": datetime.now().isoformat()
        }
        
        try:
            result = subprocess.run([
                sys.executable, "calendar_automation.py", "process-booking", json.dumps(test_booking)
            ], capture_output=True, text=True, timeout=15)
            
            test_results["calendar_automation"] = {
                "status": "success" if result.returncode == 0 else "failed",
                "response": result.stdout.strip(),
                "error": result.stderr if result.returncode != 0 else None
            }
        except Exception as e:
            test_results["calendar_automation"] = {
                "status": "failed",
                "error": str(e)
            }
        
        return test_results
    
    def generate_system_report(self):
        """Generate comprehensive system status report"""
        try:
            result = subprocess.run([
                sys.executable, "automation_status_monitor.py"
            ], capture_output=True, text=True, timeout=30)
            
            return {
                "status": "generated",
                "report": result.stdout,
                "error": result.stderr if result.returncode != 0 else None
            }
        except Exception as e:
            return {
                "status": "failed",
                "error": str(e)
            }
    
    def calculate_overall_status(self, results):
        """Calculate overall system status"""
        # Count successful components
        module_success = sum(1 for status in results["initialization_steps"]["module_verification"].values() 
                           if status.get("status") == "functional")
        total_modules = len(self.automation_modules)
        
        webhook_success = sum(1 for status in results["webhook_endpoints"].values() 
                            if status.get("status") == "available")
        total_webhooks = len(results["webhook_endpoints"])
        
        api_configured = sum(1 for status in results["api_integrations"].values() 
                           if status.get("status") == "configured")
        total_apis = len(results["api_integrations"])
        
        test_success = sum(1 for status in results["initialization_steps"]["automation_tests"].values() 
                         if status.get("status") == "success")
        total_tests = len(results["initialization_steps"]["automation_tests"])
        
        # Calculate success rates
        module_rate = module_success / total_modules if total_modules > 0 else 0
        webhook_rate = webhook_success / total_webhooks if total_webhooks > 0 else 0
        api_rate = api_configured / total_apis if total_apis > 0 else 0
        test_rate = test_success / total_tests if total_tests > 0 else 0
        
        overall_rate = (module_rate + webhook_rate + api_rate + test_rate) / 4
        
        if overall_rate >= 0.9:
            return "fully_operational"
        elif overall_rate >= 0.7:
            return "mostly_operational"
        elif overall_rate >= 0.5:
            return "partially_operational"
        else:
            return "requires_configuration"
    
    def display_initialization_results(self, results):
        """Display comprehensive initialization results"""
        print("\n" + "="*60)
        print("🎯 YoBot Full Automation Initialization Complete")
        print("="*60)
        print(f"⏰ Timestamp: {results['timestamp']}")
        print(f"🎚️ Overall Status: {results['overall_status'].upper()}")
        print()
        
        # Module status
        print("📋 Automation Modules:")
        for module, status in results["initialization_steps"]["module_verification"].items():
            status_icon = "✅" if status["status"] == "functional" else "❌"
            print(f"  {status_icon} {module}: {status['status']}")
        
        print()
        
        # Webhook status
        print("🔗 Webhook Endpoints:")
        for endpoint, status in results["webhook_endpoints"].items():
            status_icon = "✅" if status["status"] == "available" else "❌"
            print(f"  {status_icon} {endpoint}: {status['status']}")
        
        print()
        
        # API status
        print("🔌 API Integrations:")
        for api, status in results["api_integrations"].items():
            status_icon = "✅" if status["status"] == "configured" else "⚠️"
            print(f"  {status_icon} {api}: {status['status']}")
        
        print()
        
        # Test results
        print("🧪 Automation Tests:")
        for test, status in results["initialization_steps"]["automation_tests"].items():
            status_icon = "✅" if status["status"] == "success" else "❌"
            print(f"  {status_icon} {test}: {status['status']}")
        
        print()
        print("="*60)
        
        # Recommendations
        unconfigured_apis = [api for api, status in results["api_integrations"].items() 
                           if status["status"] == "not_configured"]
        
        if unconfigured_apis:
            print("📋 Next Steps:")
            print("Configure the following API keys for full functionality:")
            for api in unconfigured_apis:
                env_var = results["api_integrations"][api]["env_var"]
                print(f"  • {api}: Set {env_var} environment variable")
            print()
        
        if results["overall_status"] == "fully_operational":
            print("🎉 System is fully operational and ready for production use!")
        elif results["overall_status"] == "mostly_operational":
            print("✨ System is mostly operational with minor configuration needed")
        else:
            print("⚙️ System requires additional configuration for full automation")

def main():
    """Run full automation initialization"""
    initializer = FullAutomationInitializer()
    return initializer.initialize_full_automation()

if __name__ == "__main__":
    main()