import requests
import json
import os

# === CONFIG ===
VOICE_ID = "cjVigY5qzO86Huf0OWal"
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY") or "YOUR_ELEVENLABS_KEY"  # replace or use .env
OUTPUT_PATH = "./uploads/test_yobot_voice.mp3"

# === MAIN FUNCTION ===
def generate_voice_reply(text):
    try:
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"

        payload = {
            "text": text,
            "voice_settings": {
                "stability": 0.4,
                "similarity_boost": 0.8
            }
        }

        headers = {
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json"
        }

        response = requests.post(url, json=payload, headers=headers)

        if response.status_code != 200:
            print(f"[VoiceGen Error] {response.status_code}: {response.text}")
            return None

        # Ensure uploads directory exists
        os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

        with open(OUTPUT_PATH, "wb") as f:
            f.write(response.content)

        print(f"[VoiceGen ✅] MP3 saved to {OUTPUT_PATH}")
        return OUTPUT_PATH

    except Exception as e:
        print(f"[VoiceGen Exception] {e}")
        return None

def test_voice_generation():
    """Test voice generation with sample text"""
    test_text = "Hello, this is YoBot. Your support ticket has been processed and we've resolved the issue."
    result = generate_voice_reply(test_text)
    return result is not None

if __name__ == "__main__":
    test_voice_generation()