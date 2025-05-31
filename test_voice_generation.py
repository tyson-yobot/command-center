#!/usr/bin/env python3
"""
Quick test for ElevenLabs voice generation with direct API key
"""

import os
from pathlib import Path
from elevenlabs.client import ElevenLabs

# Use the working API key directly
API_KEY = "sk_2f92a9d46c884493a304aa02e74efb80ff4894ff514a777e"
VOICE_ID = "nPczCjzI2devNBz1zQrb"

def test_voice_generation():
    try:
        print("🎤 Testing voice generation with working API key...")
        
        client = ElevenLabs(api_key=API_KEY)
        
        # Test text
        test_text = "Hello! This is YoBot's AI support system. Your ticket has been processed successfully."
        
        # Generate audio
        audio = client.generate(
            text=test_text,
            voice=VOICE_ID,
            model="eleven_monolingual_v1"
        )
        
        # Save to uploads directory
        uploads_dir = Path("uploads")
        uploads_dir.mkdir(exist_ok=True)
        
        filepath = uploads_dir / "test_yobot_voice.mp3"
        
        with open(filepath, "wb") as f:
            for chunk in audio:
                f.write(chunk)
        
        file_size = filepath.stat().st_size
        print(f"✅ Voice generation successful!")
        print(f"📁 File saved: {filepath}")
        print(f"📊 File size: {file_size} bytes")
        
        return {
            "success": True,
            "filepath": str(filepath),
            "file_size": file_size
        }
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    result = test_voice_generation()
    if result["success"]:
        print("🎉 Voice generation is working correctly!")
    else:
        print(f"⚠️ Voice generation failed: {result['error']}")