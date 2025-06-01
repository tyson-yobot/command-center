import requests
import os
from universal_webhook_logger import log_to_airtable

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
VOICE_ID = "cjVigY5qzO86Huf0OWal"  # Your fallback voice

def generate_voice(text):
    if not ELEVENLABS_API_KEY:
        print("❌ ElevenLabs API key not configured")
        return False
        
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json"
    }
    data = {
        "text": text,
        "voice_settings": {
            "stability": 0.75,
            "similarity_boost": 0.75
        }
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        if response.ok:
            with open("voice_output.mp3", "wb") as f:
                f.write(response.content)
            print("✅ Voice generated and saved as voice_output.mp3")
            
            # Log successful voice generation
            log_to_airtable('ElevenLabs Voice Generation', {
                'source': 'Voice Generation Test',
                'success': True,
                'details': f'Generated voice for text: {text[:50]}...',
                'url': 'https://replit.com/@YoBot/CommandCenter'
            })
            return True
        else:
            print("❌ Failed:", response.status_code, response.text)
            
            # Log failed voice generation
            log_to_airtable('ElevenLabs Voice Generation', {
                'source': 'Voice Generation Test',
                'success': False,
                'errors': f'HTTP {response.status_code}: {response.text}',
                'details': f'Failed to generate voice for: {text[:50]}...',
                'url': 'https://replit.com/@YoBot/CommandCenter'
            })
            return False
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        return False

if __name__ == "__main__":
    generate_voice("Hi there! This is a test of YoBot's voice system.")