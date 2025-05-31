"""
ElevenLabs Voice Generation for YoBot Support System
Converts AI-generated text responses into high-quality MP3 audio files
"""

import os
from pathlib import Path
from datetime import datetime
from elevenlabs.client import ElevenLabs

class ElevenLabsVoiceGenerator:
    def __init__(self):
        # Use working API key directly until environment is updated
        self.api_key = os.getenv("ELEVENLABS_API_KEY", "sk_2f92a9d46c884493a304aa02e74efb80ff4894ff514a777e")
        self.voice_id = os.getenv("ELEVENLABS_VOICE_ID", "nPczCjzI2devNBz1zQrb")  # Default YoBot voice
        
        self.client = ElevenLabs(api_key=self.api_key)
    
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
        
        try:
            print(f"🎤 Generating voice for: {text[:50]}...")
            
            # Generate audio using the ElevenLabs client
            audio = self.client.text_to_speech.convert(
                voice_id=self.voice_id,
                text=text,
                model_id="eleven_monolingual_v1"
            )
            
            # Save the audio file
            with open(filepath, "wb") as f:
                for chunk in audio:
                    f.write(chunk)
            
            file_size = filepath.stat().st_size
            print(f"✅ Voice generated successfully: {filepath}")
            
            return {
                "success": True,
                "message": f"Audio saved as {filename}",
                "filename": str(filepath),
                "file_size": file_size
            }
                
        except Exception as e:
            error_msg = str(e)
            print(f"❌ ElevenLabs API error: {error_msg}")
            
            return {
                "success": False,
                "message": "Voice generation failed",
                "error": error_msg
            }
    
    def test_connection(self) -> dict:
        """Test connection to ElevenLabs API"""
        try:
            print("Testing ElevenLabs connection...")
            voices = self.client.voices.get_all()
            
            voice_count = len(voices.voices) if hasattr(voices, 'voices') else 0
            print(f"✅ Connection successful! Found {voice_count} voices")
            
            return {
                "success": True,
                "message": f"Connected successfully. {voice_count} voices available",
                "voices": voices.voices if hasattr(voices, 'voices') else []
            }
        
        except Exception as e:
            error_msg = f"Connection failed: {str(e)}"
            print(f"❌ {error_msg}")
            return {
                "success": False,
                "message": error_msg,
                "error": str(e)
            }
    
    def get_available_voices(self) -> list:
        """Get list of available voices from ElevenLabs"""
        try:
            voices = self.client.voices.get_all()
            return voices.voices if hasattr(voices, 'voices') else []
        except Exception as e:
            print(f"Error getting voices: {str(e)}")
            return []


def main():
    """Example usage of the ElevenLabs Voice Generator"""
    try:
        generator = ElevenLabsVoiceGenerator()
        
        # Test connection
        connection_result = generator.test_connection()
        print(f"Connection test: {connection_result['message']}")
        
        if connection_result['success']:
            # Generate a test voice message
            test_text = "Hello! This is YoBot's AI support system. Your ticket has been processed and a team member will follow up with you shortly."
            
            result = generator.generate_voice(test_text, "test_support_reply.mp3")
            
            if result['success']:
                print(f"🎉 Test voice generation completed: {result['filename']}")
                print(f"File size: {result['file_size']} bytes")
            else:
                print(f"❌ Voice generation failed: {result['error']}")
        
    except ValueError as e:
        print(f"❌ Configuration error: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")


if __name__ == "__main__":
    main()