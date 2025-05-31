#!/usr/bin/env python3
"""
ElevenLabs Voice Generation for YoBot Support System
Converts AI-generated text responses into high-quality MP3 audio files
"""

import os
import requests
import json
from pathlib import Path
from datetime import datetime

class ElevenLabsVoiceGenerator:
    def __init__(self):
        self.api_key = os.getenv("ELEVENLABS_API_KEY")
        self.voice_id = os.getenv("ELEVENLABS_VOICE_ID", "cjVigY5qzO86Huf0OWal")  # Default YoBot voice
        self.base_url = "https://api.elevenlabs.io/v1"
        
        if not self.api_key:
            raise ValueError("ELEVENLABS_API_KEY environment variable is required")
    
    def generate_voice(self, text: str, filename: str = None) -> dict:
        """
        Generate voice from text using ElevenLabs API
        
        Args:
            text (str): The text to convert to speech
            filename (str): Optional filename for the output MP3
            
        Returns:
            dict: Response with success status, message, and file path
        """
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"support_reply_{timestamp}.mp3"
        
        # Ensure uploads directory exists
        uploads_dir = Path("uploads")
        uploads_dir.mkdir(exist_ok=True)
        
        filepath = uploads_dir / filename
        
        # ElevenLabs API endpoint
        url = f"{self.base_url}/text-to-speech/{self.voice_id}"
        
        headers = {
            "xi-api-key": self.api_key,
            "Content-Type": "application/json"
        }
        
        # Voice generation parameters
        payload = {
            "text": text,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {
                "stability": 0.4,
                "similarity_boost": 0.8,
                "style": 0.0,
                "use_speaker_boost": True
            }
        }
        
        try:
            print(f"🎤 Generating voice for: {text[:50]}...")
            
            response = requests.post(
                url, 
                json=payload, 
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                # Save the audio file
                with open(filepath, "wb") as f:
                    f.write(response.content)
                
                print(f"✅ Voice generated successfully: {filepath}")
                
                return {
                    "success": True,
                    "message": f"Audio saved as {filename}",
                    "filename": str(filepath),
                    "file_size": len(response.content)
                }
            else:
                error_msg = f"HTTP {response.status_code}: {response.text}"
                print(f"❌ ElevenLabs API error: {error_msg}")
                
                return {
                    "success": False,
                    "message": "Voice generation failed",
                    "error": error_msg
                }
                
        except requests.exceptions.Timeout:
            return {
                "success": False,
                "message": "Voice generation timed out",
                "error": "Request timeout after 30 seconds"
            }
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "message": "Voice generation failed",
                "error": str(e)
            }
    
    def test_connection(self) -> dict:
        """Test connection to ElevenLabs API"""
        url = f"{self.base_url}/voices"
        headers = {"xi-api-key": self.api_key}
        
        try:
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                voice_count = len(data.get("voices", []))
                return {
                    "success": True,
                    "message": f"Connected successfully. Found {voice_count} available voices."
                }
            else:
                return {
                    "success": False,
                    "message": f"Connection failed with status {response.status_code}"
                }
        except Exception as e:
            return {
                "success": False,
                "message": f"Connection test failed: {str(e)}"
            }
    
    def get_available_voices(self) -> list:
        """Get list of available voices from ElevenLabs"""
        url = f"{self.base_url}/voices"
        headers = {"xi-api-key": self.api_key}
        
        try:
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                return response.json().get("voices", [])
            else:
                raise Exception(f"API request failed: {response.status_code}")
        except Exception as e:
            print(f"Error fetching voices: {e}")
            return []

def main():
    """Example usage of the ElevenLabs Voice Generator"""
    try:
        # Initialize the voice generator
        voice_gen = ElevenLabsVoiceGenerator()
        
        # Test connection
        print("Testing ElevenLabs connection...")
        connection_test = voice_gen.test_connection()
        print(f"Connection test: {connection_test['message']}")
        
        if connection_test["success"]:
            # Generate voice for sample support response
            sample_text = """Hi Sarah Johnson, thank you for contacting YoBot support. 
            We've received your message regarding voice integration issues and our team 
            will respond within 24 hours. For urgent issues, please call our support hotline."""
            
            result = voice_gen.generate_voice(sample_text, "test_support_reply.mp3")
            
            if result["success"]:
                print(f"✅ Voice file generated: {result['filename']}")
                print(f"File size: {result['file_size']} bytes")
            else:
                print(f"❌ Voice generation failed: {result['error']}")
    
    except ValueError as e:
        print(f"❌ Configuration error: {e}")
        print("Please set ELEVENLABS_API_KEY environment variable")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    main()