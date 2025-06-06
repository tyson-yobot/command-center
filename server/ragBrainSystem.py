"""
YoBot RAG Brain System
Complete knowledge processing and voice response system
"""

import os
import requests
import json
from datetime import datetime
import openai
from elevenlabs import generate, set_api_key

# Set API keys
openai.api_key = os.getenv("OPENAI_API_KEY")
if os.getenv("ELEVENLABS_API_KEY"):
    set_api_key(os.getenv("ELEVENLABS_API_KEY"))

class YoBotRAGBrain:
    def __init__(self):
        self.knowledge_base = {
            "company_info": {
                "name": "YoBot",
                "mission": "AI-powered automation for business growth",
                "packages": ["Standard", "Professional", "Platinum", "Enterprise"],
                "features": ["VoiceBot", "SMS", "Email", "Call Recording", "Analytics"]
            },
            "common_questions": {
                "pricing": "Our packages start at $150/month for Standard up to $1000/month for Enterprise",
                "setup_time": "Most implementations are complete within 2-5 business days",
                "integrations": "We support HubSpot, QuickBooks, Slack, Calendly, and 50+ other platforms",
                "support": "24/7 support included with all packages, priority support for Enterprise"
            }
        }
    
    def process_query(self, query, context=""):
        """Process RAG query with OpenAI and return enhanced response"""
        try:
            # Enhance query with knowledge base context
            enhanced_prompt = f"""
You are YoBot's AI assistant. Use this knowledge base to answer questions:

Company Info: {json.dumps(self.knowledge_base['company_info'])}
Common Questions: {json.dumps(self.knowledge_base['common_questions'])}

User Query: {query}
Additional Context: {context}

Provide a helpful, professional response that represents YoBot's capabilities and services.
Keep responses conversational but informative.
"""

            response = openai.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are YoBot's intelligent assistant, helping potential clients understand our AI automation services."},
                    {"role": "user", "content": enhanced_prompt}
                ],
                max_tokens=500,
                temperature=0.7
            )
            
            return {
                "success": True,
                "response": response.choices[0].message.content,
                "timestamp": datetime.now().isoformat(),
                "tokens_used": response.usage.total_tokens if hasattr(response, 'usage') else 0
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "response": "I'm experiencing technical difficulties. Please contact our support team for assistance."
            }
    
    def generate_voice_response(self, text, voice_id="21m00Tcm4TlvDq8ikWAM"):
        """Generate voice response using ElevenLabs"""
        try:
            if not os.getenv("ELEVENLABS_API_KEY"):
                return {
                    "success": False,
                    "error": "ElevenLabs API key not configured"
                }
            
            # Generate audio
            audio = generate(
                text=text,
                voice=voice_id,
                model="eleven_monolingual_v1"
            )
            
            # Save audio file
            filename = f"voice_response_{int(datetime.now().timestamp())}.mp3"
            filepath = f"./uploads/{filename}"
            
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            
            with open(filepath, "wb") as f:
                f.write(audio)
            
            return {
                "success": True,
                "audio_file": filepath,
                "filename": filename,
                "text": text
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def initiate_call(self, phone_number, message):
        """Initiate outbound call using Twilio"""
        try:
            from twilio.rest import Client
            
            account_sid = os.getenv("TWILIO_ACCOUNT_SID")
            auth_token = os.getenv("TWILIO_AUTH_TOKEN")
            from_number = os.getenv("TWILIO_PHONE_NUMBER")
            
            if not all([account_sid, auth_token, from_number]):
                return {
                    "success": False,
                    "error": "Twilio credentials not configured"
                }
            
            client = Client(account_sid, auth_token)
            
            # Create TwiML for the call
            twiml_url = "https://your-domain.com/api/twiml/voice"  # You'll need to implement this
            
            call = client.calls.create(
                to=phone_number,
                from_=from_number,
                url=twiml_url,
                method='POST'
            )
            
            return {
                "success": True,
                "call_sid": call.sid,
                "status": call.status,
                "to": phone_number,
                "message": message
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def log_interaction(self, query, response, interaction_type="rag_query"):
        """Log interactions to Airtable for analytics"""
        try:
            api_key = os.getenv("AIRTABLE_API_KEY")
            base_id = os.getenv("AIRTABLE_BASE_ID")
            
            if not api_key or not base_id:
                return {"success": False, "error": "Airtable credentials not available"}
            
            payload = {
                "fields": {
                    "🧠 Query": query,
                    "💬 Response": response.get("response", ""),
                    "📅 Timestamp": datetime.now().isoformat(),
                    "🎯 Type": interaction_type,
                    "✅ Success": response.get("success", False),
                    "🔢 Tokens": response.get("tokens_used", 0)
                }
            }
            
            response = requests.post(
                f"https://api.airtable.com/v0/{base_id}/RAG Interactions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json=payload
            )
            
            return {"success": response.status_code == 200}
            
        except Exception as e:
            return {"success": False, "error": str(e)}

def test_rag_brain_system():
    """Test the complete RAG brain system"""
    brain = YoBotRAGBrain()
    
    print("🧠 Testing YoBot RAG Brain System")
    print("=" * 50)
    
    # Test RAG query
    print("\n1. Testing RAG Query Processing...")
    query_result = brain.process_query("What packages do you offer and what are the pricing options?")
    print(f"Query Success: {query_result['success']}")
    if query_result['success']:
        print(f"Response: {query_result['response'][:200]}...")
    else:
        print(f"Error: {query_result['error']}")
    
    # Test voice generation
    print("\n2. Testing Voice Generation...")
    if query_result['success']:
        voice_result = brain.generate_voice_response(query_result['response'][:200])
        print(f"Voice Success: {voice_result['success']}")
        if voice_result['success']:
            print(f"Audio File: {voice_result['filename']}")
        else:
            print(f"Voice Error: {voice_result['error']}")
    
    # Test interaction logging
    print("\n3. Testing Interaction Logging...")
    log_result = brain.log_interaction("Test query", query_result, "test")
    print(f"Logging Success: {log_result['success']}")
    
    print("\n🎯 RAG Brain System Test Complete")
    return {
        "rag_query": query_result['success'],
        "voice_generation": voice_result['success'] if 'voice_result' in locals() else False,
        "interaction_logging": log_result['success']
    }

if __name__ == "__main__":
    results = test_rag_brain_system()
    print(f"\nTest Results: {results}")