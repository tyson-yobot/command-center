"""
Slack & SMS Alert Validation System
Real-time testing of critical alert channels with live webhook verification
"""
import requests
import json
import time
from datetime import datetime
import os

class SlackSMSAlertValidator:
    def __init__(self):
        self.results = []
        self.slack_webhook_url = os.getenv('SLACK_WEBHOOK_URL')
        self.slack_bot_token = os.getenv('SLACK_BOT_TOKEN')
        self.twilio_account_sid = os.getenv('TWILIO_ACCOUNT_SID')
        self.twilio_auth_token = os.getenv('TWILIO_AUTH_TOKEN')
        self.twilio_phone_number = os.getenv('TWILIO_PHONE_NUMBER')
        
    def simulate_critical_error(self, error_type="system_failure"):
        """Simulate a critical error scenario"""
        error_scenarios = {
            "system_failure": {
                "severity": "CRITICAL",
                "system": "payment_processor",
                "message": "Payment processing system down - immediate action required",
                "impact": "High - all transactions failing"
            },
            "security_breach": {
                "severity": "EMERGENCY",
                "system": "security",
                "message": "Potential security breach detected - unauthorized access attempt",
                "impact": "Critical - immediate investigation required"
            },
            "database_corruption": {
                "severity": "CRITICAL",
                "system": "database",
                "message": "Database integrity issue detected - data corruption possible",
                "impact": "High - data loss risk"
            }
        }
        
        return error_scenarios.get(error_type, error_scenarios["system_failure"])

    def send_slack_alert(self, alert_data):
        """Send alert to Slack #yobot-ops-alerts channel"""
        try:
            # Try webhook first
            if self.slack_webhook_url:
                webhook_payload = {
                    "channel": "#yobot-ops-alerts",
                    "username": "YoBot Alert System",
                    "icon_emoji": ":rotating_light:",
                    "attachments": [
                        {
                            "color": "danger" if alert_data["severity"] in ["CRITICAL", "EMERGENCY"] else "warning",
                            "title": f"🚨 {alert_data['severity']} ALERT - {alert_data['system'].upper()}",
                            "text": alert_data["message"],
                            "fields": [
                                {
                                    "title": "Impact",
                                    "value": alert_data["impact"],
                                    "short": True
                                },
                                {
                                    "title": "Timestamp",
                                    "value": datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC"),
                                    "short": True
                                }
                            ],
                            "footer": "YoBot Alert System"
                        }
                    ]
                }
                
                response = requests.post(
                    self.slack_webhook_url,
                    json=webhook_payload,
                    timeout=10
                )
                
                if response.status_code == 200:
                    return {"success": True, "method": "webhook", "response": "Alert sent successfully"}
                else:
                    return {"success": False, "method": "webhook", "error": f"HTTP {response.status_code}"}
            
            # Fallback to bot token
            elif self.slack_bot_token:
                headers = {
                    "Authorization": f"Bearer {self.slack_bot_token}",
                    "Content-Type": "application/json"
                }
                
                payload = {
                    "channel": "#yobot-ops-alerts",
                    "text": f"🚨 {alert_data['severity']} ALERT - {alert_data['system'].upper()}",
                    "attachments": [
                        {
                            "color": "danger",
                            "text": alert_data["message"],
                            "fields": [
                                {"title": "Impact", "value": alert_data["impact"], "short": True},
                                {"title": "Timestamp", "value": datetime.now().isoformat(), "short": True}
                            ]
                        }
                    ]
                }
                
                response = requests.post(
                    "https://slack.com/api/chat.postMessage",
                    headers=headers,
                    json=payload,
                    timeout=10
                )
                
                if response.status_code == 200 and response.json().get("ok"):
                    return {"success": True, "method": "bot_token", "response": "Alert sent successfully"}
                else:
                    return {"success": False, "method": "bot_token", "error": response.json()}
            
            else:
                return {"success": False, "error": "No Slack credentials configured"}
                
        except Exception as e:
            return {"success": False, "error": str(e)}

    def send_sms_alert(self, alert_data, admin_phone=None):
        """Send SMS alert to admin number"""
        try:
            if not all([self.twilio_account_sid, self.twilio_auth_token, self.twilio_phone_number]):
                return {"success": False, "error": "Twilio credentials not configured"}
            
            # Default admin phone for testing
            if not admin_phone:
                admin_phone = "+1234567890"  # This would be your actual admin number
            
            message_body = (
                f"🚨 YOBOT {alert_data['severity']} ALERT\n"
                f"System: {alert_data['system'].upper()}\n"
                f"Issue: {alert_data['message']}\n"
                f"Time: {datetime.now().strftime('%H:%M UTC')}\n"
                f"Immediate action required!"
            )
            
            # Use Twilio API
            from twilio.rest import Client
            client = Client(self.twilio_account_sid, self.twilio_auth_token)
            
            message = client.messages.create(
                body=message_body,
                from_=self.twilio_phone_number,
                to=admin_phone
            )
            
            return {
                "success": True, 
                "message_sid": message.sid,
                "to": admin_phone,
                "response": "SMS sent successfully"
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}

    def escalate_to_admin(self, alert_data):
        """Main escalation function - sends both Slack and SMS"""
        print(f"\n🚨 ESCALATING {alert_data['severity']} ALERT TO ADMIN...")
        print(f"System: {alert_data['system']}")
        print(f"Message: {alert_data['message']}")
        
        results = {"slack": None, "sms": None}
        
        # Send Slack alert
        print("\n📱 Sending Slack alert to #yobot-ops-alerts...")
        slack_result = self.send_slack_alert(alert_data)
        results["slack"] = slack_result
        
        if slack_result["success"]:
            print(f"   ✅ Slack alert sent successfully via {slack_result.get('method', 'unknown')}")
        else:
            print(f"   ❌ Slack alert failed: {slack_result['error']}")
        
        # Send SMS alert
        print("\n📲 Sending SMS alert to admin...")
        sms_result = self.send_sms_alert(alert_data)
        results["sms"] = sms_result
        
        if sms_result["success"]:
            print(f"   ✅ SMS alert sent successfully to {sms_result.get('to', 'admin')}")
        else:
            print(f"   ❌ SMS alert failed: {sms_result['error']}")
        
        return results

    def validate_alert_channels(self):
        """Validate both Slack and SMS alert channels with test scenarios"""
        print("="*80)
        print("SLACK & SMS ALERT VALIDATION")
        print("="*80)
        
        test_scenarios = [
            "system_failure",
            "security_breach", 
            "database_corruption"
        ]
        
        for scenario in test_scenarios:
            print(f"\n🧪 Testing scenario: {scenario}")
            
            # Simulate the error
            alert_data = self.simulate_critical_error(scenario)
            
            # Escalate to admin (sends both Slack and SMS)
            results = self.escalate_to_admin(alert_data)
            
            # Log results
            test_result = {
                "scenario": scenario,
                "timestamp": datetime.now().isoformat(),
                "alert_data": alert_data,
                "slack_success": results["slack"]["success"],
                "sms_success": results["sms"]["success"],
                "slack_error": results["slack"].get("error") if not results["slack"]["success"] else None,
                "sms_error": results["sms"].get("error") if not results["sms"]["success"] else None
            }
            
            self.results.append(test_result)
            
            time.sleep(2)  # Brief pause between tests
        
        self.generate_validation_report()

    def generate_validation_report(self):
        """Generate comprehensive validation report"""
        print(f"\n" + "="*80)
        print("ALERT VALIDATION SUMMARY")
        print("="*80)
        
        total_tests = len(self.results)
        slack_successes = sum(1 for r in self.results if r["slack_success"])
        sms_successes = sum(1 for r in self.results if r["sms_success"])
        
        print(f"📊 Validation Results:")
        print(f"   Total Scenarios Tested: {total_tests}")
        print(f"   Slack Channel Success: {slack_successes}/{total_tests} ({(slack_successes/total_tests)*100:.1f}%)")
        print(f"   SMS Alert Success: {sms_successes}/{total_tests} ({(sms_successes/total_tests)*100:.1f}%)")
        
        print(f"\n📱 Channel Status:")
        if slack_successes == total_tests:
            print("   ✅ Slack #yobot-ops-alerts: OPERATIONAL")
        else:
            print("   ❌ Slack #yobot-ops-alerts: ISSUES DETECTED")
            
        if sms_successes == total_tests:
            print("   ✅ SMS Admin Alerts: OPERATIONAL")
        else:
            print("   ❌ SMS Admin Alerts: ISSUES DETECTED")
        
        # Configuration check
        print(f"\n🔧 Configuration Status:")
        print(f"   Slack Webhook URL: {'✅ Configured' if self.slack_webhook_url else '❌ Missing'}")
        print(f"   Slack Bot Token: {'✅ Configured' if self.slack_bot_token else '❌ Missing'}")
        print(f"   Twilio Account SID: {'✅ Configured' if self.twilio_account_sid else '❌ Missing'}")
        print(f"   Twilio Auth Token: {'✅ Configured' if self.twilio_auth_token else '❌ Missing'}")
        print(f"   Twilio Phone Number: {'✅ Configured' if self.twilio_phone_number else '❌ Missing'}")
        
        # Troubleshooting guidance
        if slack_successes < total_tests or sms_successes < total_tests:
            print(f"\n🔍 Troubleshooting Guidance:")
            if slack_successes < total_tests:
                print("   Slack Issues:")
                print("   • Check SLACK_WEBHOOK_URL in environment variables")
                print("   • Verify webhook permissions for #yobot-ops-alerts channel")
                print("   • Test SLACK_BOT_TOKEN authentication")
                
            if sms_successes < total_tests:
                print("   SMS Issues:")
                print("   • Verify TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER")
                print("   • Check Twilio account balance and phone number verification")
                print("   • Ensure admin phone number is correctly formatted")
        
        # Save results
        with open('alert_validation_results.json', 'w') as f:
            json.dump({
                "validation_summary": {
                    "total_tests": total_tests,
                    "slack_success_rate": f"{(slack_successes/total_tests)*100:.1f}%",
                    "sms_success_rate": f"{(sms_successes/total_tests)*100:.1f}%",
                    "overall_status": "OPERATIONAL" if (slack_successes + sms_successes) == (total_tests * 2) else "NEEDS_ATTENTION"
                },
                "detailed_results": self.results
            }, f, indent=2)
        
        print(f"\n📄 Detailed results saved to: alert_validation_results.json")

if __name__ == "__main__":
    validator = SlackSMSAlertValidator()
    validator.validate_alert_channels()