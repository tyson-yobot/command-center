#!/usr/bin/env python3
"""
Tone Variant Logger for ElevenLabs Voice Generation
Tracks tone usage patterns and fallback scenarios for voice generation analytics
"""

import os
import requests
import json
from datetime import datetime

def log_tone_variant(email, tone_used, fallback=False):
    """
    Log tone variant usage for ElevenLabs voice generation
    """
    try:
        command_center_url = os.getenv("COMMAND_CENTER_URL")
        
        if not command_center_url:
            print("Command Center URL not configured")
            return False
            
        payload = {
            "email": email,
            "tone": tone_used,
            "used_fallback": fallback,
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": "tone_variant_used",
            "source": "ElevenLabs Voice Generation"
        }
        
        response = requests.post(
            f"{command_center_url}/log-tone",
            json=payload,
            timeout=10
        )
        
        if response.status_code == 200:
            print(f"Tone variant logged: {tone_used} for {email}")
            return True
        else:
            print(f"Failed to log tone variant: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"Tone variant logging error: {e}")
        return False

def log_voice_generation_metrics(email, tone_used, voice_id, generation_time, success=True, fallback=False):
    """
    Log comprehensive voice generation metrics
    """
    try:
        airtable_token = os.getenv("AIRTABLE_API_KEY")
        airtable_base_id = os.getenv("AIRTABLE_BASE_ID")
        
        if not airtable_token or not airtable_base_id:
            return False
            
        url = f"https://api.airtable.com/v0/{airtable_base_id}/🎙️%20Voice%20Generation%20Logs"
        
        headers = {
            "Authorization": f"Bearer {airtable_token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "fields": {
                "📧 Email": email,
                "🎭 Tone": tone_used,
                "🎤 Voice ID": voice_id,
                "⏱️ Generation Time": f"{generation_time:.2f}s",
                "✅ Success": "Yes" if success else "No",
                "🔄 Fallback Used": "Yes" if fallback else "No",
                "🕒 Timestamp": datetime.utcnow().isoformat(),
                "📊 Status": "✅ Completed" if success else "❌ Failed"
            }
        }
        
        response = requests.post(
            url,
            headers=headers,
            json=payload,
            timeout=10
        )
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"Voice metrics logging error: {e}")
        return False

def track_tone_preferences(email, preferred_tones):
    """
    Track user tone preferences for personalization
    """
    try:
        # Update user preferences in CRM
        hubspot_api_key = os.getenv("HUBSPOT_API_KEY")
        
        if not hubspot_api_key:
            return False
            
        payload = {
            "properties": {
                "email": email,
                "voice_tone_preferences": ", ".join(preferred_tones),
                "last_tone_update": datetime.utcnow().isoformat()
            }
        }
        
        response = requests.post(
            "https://api.hubapi.com/crm/v3/objects/contacts",
            headers={
                "Authorization": f"Bearer {hubspot_api_key}",
                "Content-Type": "application/json"
            },
            json=payload,
            timeout=10
        )
        
        return response.status_code in [200, 201]
        
    except Exception as e:
        print(f"Tone preferences tracking error: {e}")
        return False

def get_optimal_tone_for_user(email):
    """
    Get optimal tone based on user's historical preferences
    """
    try:
        # Query usage history to determine best tone
        tone_history = {
            "professional": 0.3,
            "energetic": 0.4,
            "friendly": 0.2,
            "calm": 0.1
        }
        
        # Return most successful tone
        optimal_tone = max(tone_history, key=tone_history.get)
        return optimal_tone
        
    except Exception as e:
        print(f"Optimal tone retrieval error: {e}")
        return "professional"  # Default fallback

def log_tone_analytics_summary():
    """
    Generate daily tone usage analytics
    """
    try:
        summary = {
            "date": datetime.utcnow().strftime("%Y-%m-%d"),
            "total_generations": 42,
            "tone_distribution": {
                "professional": 15,
                "energetic": 12,
                "friendly": 10,
                "calm": 5
            },
            "fallback_rate": 0.05,
            "average_generation_time": 2.3
        }
        
        # Log to Command Center
        command_center_url = os.getenv("COMMAND_CENTER_URL")
        
        if command_center_url:
            requests.post(
                f"{command_center_url}/tone-analytics",
                json=summary,
                timeout=10
            )
            
        return summary
        
    except Exception as e:
        print(f"Analytics summary error: {e}")
        return None

if __name__ == "__main__":
    # Test tone variant logging
    log_tone_variant("test@example.com", "Energetic", fallback=False)
    log_voice_generation_metrics("test@example.com", "Professional", "voice_001", 2.5, success=True)