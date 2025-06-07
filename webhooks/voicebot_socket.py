"""
VoiceBot Socket Server
Handles Twilio stream → transcribes audio → gets GPT reply → converts to ElevenLabs voice → streams back
"""
import asyncio
import websockets
import json
import base64
import os
import openai
import requests
from datetime import datetime

# Config
ELEVENLABS_VOICE_ID = "cjVigY5qzO86Huf0OWal"
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Optional prompt memory
conversation_history = []

async def handle_stream(websocket, path):
    """Handle WebSocket connection for voice streaming"""
    global conversation_history

    print("🔌 VoiceBot WebSocket connected")
    call_sid = None
    
    try:
        async for message in websocket:
            data = json.loads(message)
            
            # Handle Twilio WebSocket events
            if data.get("event") == "connected":
                print("📞 Twilio stream connected")
                call_sid = data.get("streamSid")
                
            elif data.get("event") == "start":
                print("🎙️ Audio stream started")
                conversation_history = []  # Reset conversation for new call
                
            elif data.get("event") == "media" and "media" in data:
                audio_data = base64.b64decode(data["media"]["payload"])

                # Send to transcription (OpenAI Whisper)
                transcript = transcribe_audio(audio_data)

                if transcript and transcript.strip():
                    print(f"🗣️ User said: {transcript}")
                    conversation_history.append({"role": "user", "content": transcript})

                    # GPT response with YoBot personality
                    reply = get_gpt_response(conversation_history)
                    print(f"🤖 Bot: {reply}")
                    conversation_history.append({"role": "assistant", "content": reply})

                    # Generate and stream voice response
                    await stream_voice_response(websocket, reply, call_sid)
                    
            elif data.get("event") == "stop":
                print("📞 Call ended")
                conversation_history = []

    except websockets.exceptions.ConnectionClosed:
        print("❌ WebSocket connection closed")
        conversation_history = []
    except Exception as e:
        print(f"❌ Error in voice stream: {e}")

def transcribe_audio(audio_bytes):
    """Transcribe audio using OpenAI Whisper"""
    if not OPENAI_API_KEY:
        print("❌ OpenAI API key not configured")
        return None
        
    try:
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}"
        }
        files = {
            'file': ("audio.wav", audio_bytes, 'audio/wav')
        }
        data = {
            "model": "whisper-1"
        }
        
        response = requests.post(
            "https://api.openai.com/v1/audio/transcriptions", 
            headers=headers, 
            files=files, 
            data=data,
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json().get("text")
        else:
            print(f"❌ Transcription failed: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Transcription error: {e}")
        return None

def get_gpt_response(history):
    """Get GPT response with YoBot personality"""
    if not OPENAI_API_KEY:
        return "I'm sorry, I'm having technical difficulties right now."
    
    try:
        # Add YoBot system prompt
        system_prompt = {
            "role": "system", 
            "content": "You are YoBot, a helpful AI assistant for Engage Smarter. You help with business automation, lead generation, and customer support. Keep responses concise and professional. Always try to help solve the caller's business challenges."
        }
        
        messages = [system_prompt] + history[-10:]  # Keep last 10 exchanges
        
        headers = {"Authorization": f"Bearer {OPENAI_API_KEY}"}
        json_data = {
            "model": "gpt-4o",  # Using latest model
            "messages": messages,
            "max_tokens": 150,  # Keep responses concise for voice
            "temperature": 0.7
        }
        
        response = requests.post(
            "https://api.openai.com/v1/chat/completions", 
            headers=headers, 
            json=json_data,
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()['choices'][0]['message']['content']
        else:
            print(f"❌ GPT request failed: {response.status_code}")
            return "I'm sorry, I'm having some technical difficulties. How can I help you?"
            
    except Exception as e:
        print(f"❌ GPT error: {e}")
        return "I apologize for the technical issue. Can you please repeat your question?"

async def stream_voice_response(websocket, text, call_sid):
    """Generate voice with ElevenLabs and stream back to Twilio"""
    if not ELEVENLABS_API_KEY:
        print("❌ ElevenLabs API key not configured")
        return
    
    try:
        headers = {
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json"
        }
        body = {
            "text": text,
            "voice_settings": {
                "stability": 0.4,
                "similarity_boost": 0.75,
                "style": 0.2,
                "use_speaker_boost": True
            }
        }

        url = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}/stream"
        response = requests.post(url, headers=headers, json=body, stream=True, timeout=30)

        if response.status_code == 200:
            # Save audio file
            audio_path = f"/tmp/reply_{datetime.now().timestamp()}.mp3"
            with open(audio_path, "wb") as f:
                for chunk in response.iter_content(chunk_size=1024):
                    if chunk:
                        f.write(chunk)
            
            # Convert to base64 and send back to Twilio
            with open(audio_path, "rb") as f:
                audio_data = base64.b64encode(f.read()).decode()
            
            # Send audio back to Twilio stream
            media_message = {
                "event": "media",
                "streamSid": call_sid,
                "media": {
                    "payload": audio_data
                }
            }
            
            await websocket.send(json.dumps(media_message))
            print("🔊 Voice response sent to caller")
            
            # Clean up temp file
            os.remove(audio_path)
        else:
            print(f"❌ ElevenLabs request failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Voice generation error: {e}")

def start_voicebot_server():
    """Start the VoiceBot WebSocket server"""
    print("🚀 Starting VoiceBot WebSocket server on port 8765...")
    
    start_server = websockets.serve(handle_stream, "0.0.0.0", 8765)
    
    loop = asyncio.get_event_loop()
    loop.run_until_complete(start_server)
    print("✅ VoiceBot server running")
    loop.run_forever()

if __name__ == "__main__":
    start_voicebot_server()