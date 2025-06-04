"""
Project Creation Trigger Handler
Handles voice-triggered project creation with Airtable integration
"""

import requests
import os
from datetime import datetime
from command_center_dispatcher import CommandCenterDispatcher

def handler(request):
    """Handle new project creation request"""
    dispatcher = CommandCenterDispatcher()
    
    try:
        # Get request data
        data = request.json if hasattr(request, 'json') else {}
        project_name = data.get("project_name", "New Client Project")
        triggered_by = data.get("triggered_by", "VoiceBot")
        client_name = data.get("client_name", "")
        
        # Airtable configuration
        airtable_api_key = os.getenv("AIRTABLE_API_KEY")
        airtable_base_id = os.getenv("AIRTABLE_BASE_ID")
        
        if not airtable_api_key or not airtable_base_id:
            return {"error": "Airtable credentials not configured"}
        
        # Create project record
        url = f"https://api.airtable.com/v0/{airtable_base_id}/📌%20Project%20Roadmap%20Tracker"
        headers = {
            "Authorization": f"Bearer {airtable_api_key}",
            "Content-Type": "application/json"
        }
        
        record_data = {
            "fields": {
                "🧠 Project Name": project_name,
                "🚀 Status": "Queued",
                "🎯 Triggered By": triggered_by,
                "📅 Created": datetime.now().isoformat(),
                "👤 Client": client_name,
                "🏷️ Priority": "Medium",
                "📝 Source": "Voice Command"
            }
        }
        
        response = requests.post(
            url, 
            json={"records": [record_data]}, 
            headers=headers, 
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            record_id = result.get("records", [{}])[0].get("id", "unknown")
            
            # Log success to command center
            dispatcher.log_command_center_event(
                "project_creation",
                f"Project created: {project_name} (ID: {record_id})"
            )
            
            return {
                "success": True,
                "project_name": project_name,
                "record_id": record_id,
                "airtable_url": f"https://airtable.com/{airtable_base_id}/{record_id}",
                "timestamp": datetime.now().isoformat()
            }
        else:
            error_msg = f"Airtable API error: {response.status_code} - {response.text}"
            dispatcher.log_command_center_event("project_creation_error", error_msg)
            return {"error": error_msg}
            
    except Exception as e:
        error_msg = f"Project creation failed: {str(e)}"
        dispatcher.log_command_center_event("project_creation_error", error_msg)
        return {"error": error_msg}

def create_project_from_voice(project_details):
    """Create project from voice command details"""
    return handler(type('Request', (), {'json': project_details})())

if __name__ == "__main__":
    # Test project creation
    test_request = type('Request', (), {
        'json': {
            "project_name": "Test Voice Project",
            "triggered_by": "Voice Test",
            "client_name": "Test Client"
        }
    })()
    
    result = handler(test_request)
    print(f"Test result: {result}")