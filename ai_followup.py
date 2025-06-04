"""
AI Followup Auto-Escalation System
Automatically escalates leads to human reps with Airtable tracking
"""

import requests
import os
from datetime import datetime
from command_center_dispatcher import CommandCenterDispatcher
from slack_alerts import alert_system

class AIFollowupSystem:
    def __init__(self):
        self.slack_webhook_url = os.getenv("SLACK_WEBHOOK_URL")
        self.airtable_api_key = os.getenv("AIRTABLE_API_KEY")
        self.airtable_base_id = os.getenv("AIRTABLE_BASE_ID")
        self.dispatcher = CommandCenterDispatcher()
        
    def escalate_to_rep(self, lead_info):
        """Escalate lead to human representative"""
        try:
            # Create escalation record in Airtable
            escalation_result = self._create_escalation_record(lead_info)
            
            # Send Slack alert
            alert_result = self._send_escalation_alert(lead_info)
            
            # Log to command center
            self.dispatcher.log_command_center_event(
                "lead_escalation",
                f"🚨 Escalated lead: {lead_info.get('name')} ({lead_info.get('email')})"
            )
            
            return {
                "success": True,
                "escalation_id": escalation_result.get("record_id"),
                "alert_sent": alert_result,
                "lead_name": lead_info.get("name"),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            error_msg = f"Lead escalation failed: {str(e)}"
            alert_system.alert_system_failure("AI Followup", str(e))
            return {"error": error_msg}
    
    def _create_escalation_record(self, lead_info):
        """Create escalation record in Airtable"""
        if not self.airtable_api_key or not self.airtable_base_id:
            raise Exception("Airtable credentials not configured")
        
        url = f"https://api.airtable.com/v0/{self.airtable_base_id}/📌%20Project%20Roadmap%20Tracker"
        headers = {
            "Authorization": f"Bearer {self.airtable_api_key}",
            "Content-Type": "application/json"
        }
        
        fields = {
            "🧠 Project Name": f"Follow-Up: {lead_info.get('name', 'Unknown Lead')}",
            "🎯 Triggered By": "AI Escalation",
            "📞 Contact Number": lead_info.get("phone", ""),
            "📩 Contact Email": lead_info.get("email", ""),
            "⚠️ Priority": lead_info.get("priority", "High"),
            "📅 Escalated Date": datetime.now().isoformat(),
            "🤖 AI Score": lead_info.get("score", 0),
            "📝 Escalation Reason": lead_info.get("reason", "AI-triggered escalation")
        }
        
        response = requests.post(
            url,
            json={"records": [{"fields": fields}]},
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            record_id = result.get("records", [{}])[0].get("id", "unknown")
            return {"success": True, "record_id": record_id}
        else:
            raise Exception(f"Airtable error: {response.status_code} - {response.text}")
    
    def _send_escalation_alert(self, lead_info):
        """Send Slack alert for escalation"""
        if not self.slack_webhook_url:
            return False
        
        try:
            alert_msg = f"🛎️ AI escalated {lead_info.get('name', 'Unknown')} ({lead_info.get('email', 'No email')}) for manual follow-up."
            
            payload = {
                "text": alert_msg,
                "attachments": [{
                    "color": "warning",
                    "fields": [
                        {
                            "title": "Lead Name",
                            "value": lead_info.get("name", "Unknown"),
                            "short": True
                        },
                        {
                            "title": "Email",
                            "value": lead_info.get("email", "Not provided"),
                            "short": True
                        },
                        {
                            "title": "Phone",
                            "value": lead_info.get("phone", "Not provided"),
                            "short": True
                        },
                        {
                            "title": "AI Score",
                            "value": str(lead_info.get("score", "N/A")),
                            "short": True
                        }
                    ]
                }]
            }
            
            response = requests.post(self.slack_webhook_url, json=payload, timeout=10)
            return response.status_code == 200
            
        except Exception as e:
            print(f"Slack alert failed: {str(e)}")
            return False

def handler(request):
    """Handle escalation requests"""
    followup_system = AIFollowupSystem()
    
    try:
        lead_data = request.json if hasattr(request, 'json') else {}
        
        # Validate required fields
        if not lead_data.get("name") and not lead_data.get("email"):
            return {"error": "Lead name or email required"}
        
        result = followup_system.escalate_to_rep(lead_data)
        
        if result.get("success"):
            return {
                "status": "escalated",
                "escalation_id": result.get("escalation_id"),
                "lead_name": result.get("lead_name"),
                "timestamp": result.get("timestamp")
            }
        else:
            return {"error": result.get("error")}
            
    except Exception as e:
        return {"error": f"Escalation handler failed: {str(e)}"}

# Global followup system
followup_system = AIFollowupSystem()

def escalate_lead(name, email, phone=None, score=None, reason=None):
    """Quick function for lead escalation"""
    lead_info = {
        "name": name,
        "email": email,
        "phone": phone,
        "score": score,
        "reason": reason or "AI-triggered escalation"
    }
    return followup_system.escalate_to_rep(lead_info)

if __name__ == "__main__":
    # Test escalation system
    test_request = type('Request', (), {
        'json': {
            "name": "John Smith",
            "email": "john@example.com",
            "phone": "+15559998888",
            "score": 85,
            "reason": "High-value lead detected"
        }
    })()
    
    result = handler(test_request)
    print(f"Escalation test result: {result}")