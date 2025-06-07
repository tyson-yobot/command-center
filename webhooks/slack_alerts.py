"""
Slack Alert System for Critical Failures
Sends real-time alerts to Slack for YoBot automation failures
"""

import requests
import os
import json
from datetime import datetime
from command_center_dispatcher import CommandCenterDispatcher

class SlackAlertSystem:
    def __init__(self):
        self.webhook_url = os.getenv("SLACK_WEBHOOK_URL")
        self.bot_token = os.getenv("SLACK_BOT_TOKEN")
        self.dispatcher = CommandCenterDispatcher()
        
    def send_slack_alert(self, message, severity="MEDIUM", channel=None):
        """Send critical alert to Slack"""
        if not self.webhook_url:
            print("⚠️ No Slack webhook URL configured")
            return False
            
        try:
            # Format alert with severity and timestamp
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            severity_emoji = {
                "LOW": "⚠️",
                "MEDIUM": "🚨", 
                "HIGH": "🔥",
                "CRITICAL": "💀"
            }.get(severity, "🚨")
            
            payload = {
                "text": f"{severity_emoji} YoBot Alert [{severity}]",
                "attachments": [{
                    "color": "danger" if severity in ["HIGH", "CRITICAL"] else "warning",
                    "fields": [
                        {
                            "title": "Alert Message",
                            "value": message,
                            "short": False
                        },
                        {
                            "title": "Timestamp",
                            "value": timestamp,
                            "short": True
                        },
                        {
                            "title": "Severity",
                            "value": severity,
                            "short": True
                        }
                    ]
                }]
            }
            
            response = requests.post(self.webhook_url, json=payload, timeout=10)
            
            # Log to command center
            self.dispatcher.log_command_center_event(
                "slack_alert", 
                f"Alert sent: {message} (Severity: {severity})"
            )
            
            return response.status_code == 200
            
        except Exception as e:
            print(f"❌ Slack alert failed: {str(e)}")
            return False

    def alert_lead_scraping_failure(self, source, error_details):
        """Alert: Lead scraping failure"""
        message = f"Lead scraping failed on {source}. Error: {error_details}"
        return self.send_slack_alert(message, "HIGH")
    
    def alert_call_no_answer(self, contact_name, phone_number):
        """Alert: No answer on call"""
        message = f"No answer from {contact_name} at {phone_number}"
        return self.send_slack_alert(message, "MEDIUM")
    
    def alert_missed_calendly_appointment(self, appointment_details):
        """Alert: Missed Calendly appointment"""
        message = f"Missed appointment: {appointment_details}"
        return self.send_slack_alert(message, "HIGH")
    
    def alert_low_lead_score(self, lead_name, score, threshold=60):
        """Alert: Lead score below threshold"""
        message = f"Low lead score: {lead_name} scored {score}% (threshold: {threshold}%)"
        return self.send_slack_alert(message, "MEDIUM")
    
    def alert_system_failure(self, component, error_message):
        """Alert: Critical system failure"""
        message = f"System failure in {component}: {error_message}"
        return self.send_slack_alert(message, "CRITICAL")
    
    def alert_api_failure(self, api_name, status_code, error):
        """Alert: API integration failure"""
        message = f"API failure: {api_name} returned {status_code} - {error}"
        return self.send_slack_alert(message, "HIGH")
    
    def alert_voice_bot_failure(self, call_id, error_details):
        """Alert: VoiceBot failure"""
        message = f"VoiceBot failure on call {call_id}: {error_details}"
        return self.send_slack_alert(message, "HIGH")
    
    def alert_automation_stuck(self, function_name, duration_minutes):
        """Alert: Automation function stuck"""
        message = f"Automation stuck: {function_name} running for {duration_minutes} minutes"
        return self.send_slack_alert(message, "HIGH")
    
    def test_slack_alerts(self):
        """Test all alert types"""
        print("🧪 Testing Slack Alert System...")
        
        results = {
            "lead_scraping": self.alert_lead_scraping_failure("Apollo", "API key expired"),
            "no_answer": self.alert_call_no_answer("John Smith", "+15551234567"),
            "missed_appointment": self.alert_missed_calendly_appointment("Demo call with ABC Corp"),
            "low_score": self.alert_low_lead_score("Jane Doe", 45),
            "system_failure": self.alert_system_failure("Database", "Connection timeout"),
            "test_alert": self.send_slack_alert("Alert system test completed", "LOW")
        }
        
        success_count = sum(1 for result in results.values() if result)
        print(f"✅ {success_count}/{len(results)} alerts sent successfully")
        
        return results

# Global alert instance
alert_system = SlackAlertSystem()

def send_slack_alert(message, severity="MEDIUM"):
    """Quick function for sending alerts"""
    return alert_system.send_slack_alert(message, severity)

def alert_lead_failure(source, error):
    """Quick function for lead scraping failures"""
    return alert_system.alert_lead_scraping_failure(source, error)

def alert_call_failure(contact, phone):
    """Quick function for call failures"""
    return alert_system.alert_call_no_answer(contact, phone)

def alert_low_score(lead, score):
    """Quick function for low lead scores"""
    return alert_system.alert_low_lead_score(lead, score)

if __name__ == "__main__":
    # Test the alert system
    test_results = alert_system.test_slack_alerts()
    print("\n📊 Slack Alert System Test Results:")
    for alert_type, success in test_results.items():
        status = "✅ Sent" if success else "❌ Failed"
        print(f"   {alert_type}: {status}")