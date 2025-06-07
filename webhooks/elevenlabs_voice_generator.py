#!/usr/bin/env python3
"""
ElevenLabs Voice Generator - Command Line Version
Generates voice files from text via command line arguments
"""

import sys
import json
import os
import requests

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
OUTPUT_PATH = "./uploads/test_yobot_voice.mp3"

def generate_voice_reply(text):
    """Generate voice file from text"""
    try:
        if not ELEVENLABS_API_KEY:
            return None
            
        # Ensure uploads directory exists
        os.makedirs("./uploads", exist_ok=True)
        
        url = "https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL"
        headers = {
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json"
        }
        payload = {
            "text": text,
            "voice_settings": {
                "stability": 0.4,
                "similarity_boost": 0.75
            }
        }

        response = requests.post(url, headers=headers, json=payload)

        if response.status_code == 200:
            with open(OUTPUT_PATH, 'wb') as f:
                f.write(response.content)
            return OUTPUT_PATH
        else:
            return None

    except Exception:
        return None

if __name__ == "__main__":
    if len(sys.argv) > 1:
        try:
            data = json.loads(sys.argv[1])
            text = data.get('text', '')
            if text:
                result = generate_voice_reply(text)
                if result:
                    print(f"Voice generated: {result}")
                else:
                    print("Voice generation failed")
            else:
                print("No text provided")
        except json.JSONDecodeError:
            print("Invalid JSON input")
        except Exception:
            print("Voice generation failed")
    else:
        print("No input provided")