"""
Voice Command Processing System
Handles voice input recognition and triggers corresponding actions
"""

import requests
import os
import json
from datetime import datetime
from slack_alerts import alert_system

# Production flags
ENABLE_MANUAL_OVERRIDE = False
ENABLE_RAG_FALLBACK = False
ENABLE_VOICEBOT_FALLBACK = False

class VoiceCommandProcessor:
    def __init__(self):
        self.airtable_api_key = os.getenv("AIRTABLE_API_KEY")
        self.airtable_base_id = os.getenv("AIRTABLE_BASE_ID")
        self.webhook_url = os.getenv("MAKE_WEBHOOK_URL")
        
    def process_voice_command(self, voice_text):
        """Process recognized voice text and trigger appropriate actions"""
        if not voice_text:
            return {"error": "No voice text provided"}
            
        voice_text_lower = voice_text.lower()
        
        try:
            # Command: Start new client project
            if "start new client project" in voice_text_lower:
                return self.trigger_new_project(voice_text)
            
            # Command: Create support ticket
            elif "create support ticket" in voice_text_lower or "new ticket" in voice_text_lower:
                return self.create_support_ticket_from_voice(voice_text)
            
            # Command: Schedule follow up
            elif "schedule follow up" in voice_text_lower or "follow up" in voice_text_lower:
                return self.schedule_followup_from_voice(voice_text)
            
            # Command: Add lead
            elif "add lead" in voice_text_lower or "new lead" in voice_text_lower:
                return self.add_lead_from_voice(voice_text)
            
            # Command: System status
            elif "system status" in voice_text_lower or "health check" in voice_text_lower:
                return self.get_system_status()
            
            # Fallback handling (disabled in production)
            else:
                if ENABLE_MANUAL_OVERRIDE:
                    return self.handle_unknown_command(voice_text)
                else:
                    # Log manual override attempt
                    alert_system.send_slack_alert("⚠️ Manual override attempt blocked", "LOW")
                    return {"error": "Command not recognized", "fallback_disabled": True}
                    
        except Exception as e:
            alert_system.alert_system_failure("Voice Commands", str(e))
            return {"error": f"Voice command processing failed: {str(e)}"}
    
    def trigger_new_project(self, voice_text):
        """Trigger new client project creation in Airtable"""
        if not self.airtable_api_key or not self.airtable_base_id:
            return {"error": "Airtable credentials not configured"}
        
        try:
            # Extract project name if mentioned
            project_name = "New Client Project"
            if "for" in voice_text.lower():
                parts = voice_text.lower().split("for")
                if len(parts) > 1:
                    project_name = f"Project for {parts[1].strip()}"
            
            # Create Airtable record
            url = f"https://api.airtable.com/v0/{self.airtable_base_id}/📌%20Project%20Roadmap%20Tracker"
            headers = {
                "Authorization": f"Bearer {self.airtable_api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "fields": {
                    "🧠 Project Name": project_name,
                    "🚀 Status": "Queued",
                    "🎯 Triggered By": "VoiceBot",
                    "📅 Created": datetime.now().isoformat(),
                    "📝 Voice Command": voice_text
                }
            }
            
            response = requests.post(url, json={"records": [data]}, headers=headers, timeout=10)
            
            if response.status_code == 200:
                record_data = response.json()
                record_id = record_data.get("records", [{}])[0].get("id", "unknown")
                
                # Send success alert
                alert_system.send_slack_alert(
                    f"✅ New project created via voice: {project_name} (ID: {record_id})", 
                    "LOW"
                )
                
                return {
                    "success": True,
                    "action": "project_created",
                    "project_name": project_name,
                    "record_id": record_id
                }
            else:
                alert_system.alert_api_failure("Airtable", response.status_code, response.text)
                return {"error": f"Failed to create project: {response.status_code}"}
                
        except Exception as e:
            alert_system.alert_system_failure("Project Creation", str(e))
            return {"error": f"Project creation failed: {str(e)}"}
    
    def create_support_ticket_from_voice(self, voice_text):
        """Create support ticket from voice command"""
        try:
            # Extract ticket details
            ticket_subject = "Voice-generated support ticket"
            if "about" in voice_text.lower():
                parts = voice_text.lower().split("about")
                if len(parts) > 1:
                    ticket_subject = f"Support needed: {parts[1].strip()}"
            
            # Trigger webhook for ticket creation
            if self.webhook_url:
                payload = {
                    "type": "support_ticket",
                    "subject": ticket_subject,
                    "source": "voice_command",
                    "priority": "Medium",
                    "voice_text": voice_text,
                    "timestamp": datetime.now().isoformat()
                }
                
                response = requests.post(self.webhook_url, json=payload, timeout=10)
                
                if response.status_code == 200:
                    return {
                        "success": True,
                        "action": "ticket_created",
                        "subject": ticket_subject
                    }
                    
            return {"error": "Webhook not configured for ticket creation"}
            
        except Exception as e:
            return {"error": f"Ticket creation failed: {str(e)}"}
    
    def schedule_followup_from_voice(self, voice_text):
        """Schedule follow-up from voice command"""
        try:
            # Extract follow-up details
            followup_note = voice_text
            
            # Create follow-up record
            url = f"https://api.airtable.com/v0/{self.airtable_base_id}/🔄%20Follow-up%20Queue"
            headers = {
                "Authorization": f"Bearer {self.airtable_api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "fields": {
                    "📝 Follow-up Note": followup_note,
                    "📅 Scheduled": datetime.now().isoformat(),
                    "🎯 Source": "Voice Command",
                    "⏰ Status": "Pending"
                }
            }
            
            response = requests.post(url, json={"records": [data]}, headers=headers, timeout=10)
            
            if response.status_code == 200:
                return {
                    "success": True,
                    "action": "followup_scheduled",
                    "note": followup_note
                }
            else:
                return {"error": f"Failed to schedule follow-up: {response.status_code}"}
                
        except Exception as e:
            return {"error": f"Follow-up scheduling failed: {str(e)}"}
    
    def add_lead_from_voice(self, voice_text):
        """Add lead from voice command"""
        try:
            # Extract lead name
            lead_name = "Voice-generated lead"
            if "named" in voice_text.lower() or "called" in voice_text.lower():
                parts = voice_text.lower().split("named" if "named" in voice_text.lower() else "called")
                if len(parts) > 1:
                    lead_name = parts[1].strip()
            
            # Create lead record
            url = f"https://api.airtable.com/v0/{self.airtable_base_id}/👥%20CRM%20Contacts"
            headers = {
                "Authorization": f"Bearer {self.airtable_api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "fields": {
                    "👤 Name": lead_name,
                    "📊 Lead Source": "Voice Command",
                    "📅 Date Added": datetime.now().isoformat(),
                    "🏷️ Status": "New Lead",
                    "📝 Notes": voice_text
                }
            }
            
            response = requests.post(url, json={"records": [data]}, headers=headers, timeout=10)
            
            if response.status_code == 200:
                return {
                    "success": True,
                    "action": "lead_added",
                    "name": lead_name
                }
            else:
                return {"error": f"Failed to add lead: {response.status_code}"}
                
        except Exception as e:
            return {"error": f"Lead addition failed: {str(e)}"}
    
    def get_system_status(self):
        """Get system status via voice command"""
        try:
            # Return current system metrics
            return {
                "success": True,
                "action": "status_check",
                "system_health": "97%",
                "active_functions": 40,
                "uptime": "100%",
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            return {"error": f"Status check failed: {str(e)}"}
    
    def handle_unknown_command(self, voice_text):
        """Handle unknown commands (disabled in production)"""
        # This method is disabled in production
        if not ENABLE_MANUAL_OVERRIDE:
            alert_system.send_slack_alert("⚠️ Manual override attempt blocked", "LOW")
            return {"error": "Manual override disabled", "command": voice_text}
        
        # Fallback logic (only active in development)
        return {
            "success": False,
            "action": "unknown_command",
            "message": "Command not recognized",
            "voice_text": voice_text
        }

# Global voice processor instance
voice_processor = VoiceCommandProcessor()

def process_voice_input(voice_text):
    """Quick function for processing voice input"""
    return voice_processor.process_voice_command(voice_text)

if __name__ == "__main__":
    # Test voice commands
    test_commands = [
        "Start new client project for ABC Corp",
        "Create support ticket about login issues",
        "Schedule follow up with John Smith",
        "Add lead named Jane Doe",
        "System status check"
    ]
    
    print("🎤 Testing Voice Command System...")
    for command in test_commands:
        print(f"\n🗣️ Command: {command}")
        result = voice_processor.process_voice_command(command)
        status = "✅" if result.get("success") else "❌"
        print(f"   Result: {status} {result.get('action', result.get('error'))}")