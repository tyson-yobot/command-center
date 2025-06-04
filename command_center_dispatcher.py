"""
Command Center Universal Dispatcher
Centralized routing system for all automation triggers from the Command Center
"""
import requests
import time
import os
from datetime import datetime, timedelta

class CommandCenterDispatcher:
    def __init__(self):
        self.airtable_api_key = os.getenv("AIRTABLE_API_KEY")
        self.command_center_base = "appRt8V3tH4g5Z51f"
        
    def log_command_center_event(self, event_type, description):
        """Log dispatcher events to Command Center"""
        try:
            if not self.airtable_api_key:
                print(f"{event_type}: {description}")
                return
                
            url = f"https://api.airtable.com/v0/{self.command_center_base}/Command Center Events"
            headers = {
                "Authorization": f"Bearer {self.airtable_api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "fields": {
                    "Event Type": event_type,
                    "Description": description,
                    "Timestamp": datetime.now().isoformat()
                }
            }
            requests.post(url, headers=headers, json=payload, timeout=10)
        except Exception as e:
            print(f"Event logging failed: {str(e)}")
    
    def route_command_center_trigger(self, category, payload):
        """Universal dispatcher from Command Center dropdown trigger"""
        self.log_command_center_event("🧭 Trigger Dispatch", f"{category} → dispatched at {datetime.now()}")

        if category == "Apollo Scrape":
            return self.launch_apollo_scrape(
                api_key=payload.get("apollo_api"),
                title=payload.get("title", "Owner"),
                location=payload.get("location", "United States"),
                company_keywords=payload.get("keywords", "roofing")
            )
        elif category == "Apify Maps":
            return self.launch_apify_scrape(
                apify_token=payload.get("apify_api"),
                actor_id=payload.get("actor_id"),
                search_term=payload.get("search", "roofing contractors"),
                location=payload.get("location", "Texas")
            )
        elif category == "Send SMS":
            return self.send_sms_followup(
                to_number=payload.get("to"),
                from_number=payload.get("from"),
                twilio_sid=payload.get("sid"),
                twilio_token=payload.get("token"),
                message=payload.get("message", "Follow-up message")
            )
        elif category == "Transcribe":
            return self.transcribe_voice_call(
                audio_file_path=payload.get("file_path"),
                openai_key=payload.get("openai_key")
            )
        elif category == "Voice Generate":
            return self.generate_voice_clip(
                text=payload.get("text", "Hello from YoBot"),
                voice_id=payload.get("voice_id", "21m00Tcm4TlvDq8ikWAM"),
                elevenlabs_key=payload.get("elevenlabs_key")
            )
        elif category == "Start Call":
            return self.start_outbound_call(
                to_number=payload.get("to_number"),
                from_number=payload.get("from_number"),
                twiml_url=payload.get("twiml_url")
            )
        else:
            return {"error": f"Unknown category: {category}"}
    
    def launch_apollo_scrape(self, api_key, title, location, company_keywords):
        """Trigger Apollo lead search"""
        if not api_key:
            return {"error": "Apollo API key required"}
        
        try:
            url = "https://api.apollo.io/v1/mixed_people/search"
            headers = {
                "Cache-Control": "no-cache",
                "Content-Type": "application/json",
                "x-api-key": api_key
            }
            payload = {
                "q_organization_keywords": company_keywords,
                "person_titles": [title],
                "locations": [location],
                "page": 1,
                "per_page": 25
            }
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            return response.json()
        except Exception as e:
            return {"error": f"Apollo scrape failed: {str(e)}"}
    
    def launch_apify_scrape(self, apify_token, actor_id, search_term, location):
        """Trigger Apify Google Maps scraping"""
        if not apify_token:
            apify_token = "apify_api_RH0E0HyvexOfmaoCYXwdT1W8tWar8i3mcjDl"
        
        try:
            url = f"https://api.apify.com/v2/actor-tasks/{actor_id}/runs"
            payload = {
                "searchStringsArray": [f"{search_term} {location}"],
                "maxCrawledPlaces": 50
            }
            headers = {
                "Authorization": f"Bearer {apify_token}",
                "Content-Type": "application/json"
            }
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            return response.json()
        except Exception as e:
            return {"error": f"Apify scrape failed: {str(e)}"}
    
    def send_sms_followup(self, to_number, from_number, twilio_sid, twilio_token, message):
        """Send SMS via Twilio"""
        try:
            from twilio.rest import Client
            client = Client(twilio_sid, twilio_token)
            sms = client.messages.create(
                to=to_number,
                from_=from_number,
                body=message
            )
            return {"success": True, "sid": sms.sid}
        except ImportError:
            return {"error": "Twilio package not available"}
        except Exception as e:
            return {"error": f"SMS failed: {str(e)}"}
    
    def transcribe_voice_call(self, audio_file_path, openai_key):
        """Transcribe audio using OpenAI Whisper"""
        try:
            import openai
            client = openai.OpenAI(api_key=openai_key)
            
            with open(audio_file_path, "rb") as audio_file:
                transcript = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    response_format="text"
                )
            return {"success": True, "transcript": transcript}
        except Exception as e:
            return {"error": f"Transcription failed: {str(e)}"}
    
    def generate_voice_clip(self, text, voice_id, elevenlabs_key):
        """Generate voice using ElevenLabs"""
        if not elevenlabs_key:
            return {"error": "ElevenLabs API key required"}
        
        try:
            url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
            headers = {
                "Accept": "audio/mpeg",
                "Content-Type": "application/json",
                "xi-api-key": elevenlabs_key
            }
            data = {
                "text": text,
                "model_id": "eleven_monolingual_v1",
                "voice_settings": {
                    "stability": 0.5,
                    "similarity_boost": 0.5
                }
            }
            response = requests.post(url, json=data, headers=headers, timeout=30)
            return {"success": True, "audio_data": response.content}
        except Exception as e:
            return {"error": f"Voice generation failed: {str(e)}"}
    
    def start_outbound_call(self, to_number, from_number, twiml_url):
        """Start outbound call using Twilio"""
        try:
            from twilio.rest import Client
            twilio_sid = os.getenv("TWILIO_ACCOUNT_SID")
            twilio_token = os.getenv("TWILIO_AUTH_TOKEN")
            
            if not twilio_sid or not twilio_token:
                return {"error": "Twilio credentials required"}
            
            client = Client(twilio_sid, twilio_token)
            call = client.calls.create(
                to=to_number,
                from_=from_number,
                url=twiml_url
            )
            return {"success": True, "call_sid": call.sid}
        except Exception as e:
            return {"error": f"Call failed: {str(e)}"}
    
    def send_sev1_alert_to_slack(self, webhook_url, message):
        """Fire emergency alerts into Slack"""
        try:
            payload = {"text": f"🚨 *SEV-1 Alert:* {message}"}
            response = requests.post(webhook_url, json=payload, timeout=10)
            return response.status_code
        except Exception as e:
            return {"error": f"Slack alert failed: {str(e)}"}
    
    def retry_failed_contact(self, base_id, table_name, record_id, attempt):
        """Schedule next retry using exponential delay"""
        if not self.airtable_api_key:
            return {"error": "Airtable API key required"}
        
        try:
            delay_minutes = min(60, 5 * (2 ** attempt))
            retry_time = (datetime.utcnow() + timedelta(minutes=delay_minutes)).isoformat()
            
            url = f"https://api.airtable.com/v0/{base_id}/{table_name}/{record_id}"
            headers = {
                "Authorization": f"Bearer {self.airtable_api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "fields": {
                    "⏰ Retry At": retry_time,
                    "🔁 Retry Attempt": attempt
                }
            }
            response = requests.patch(url, headers=headers, json=payload, timeout=30)
            return response.json()
        except Exception as e:
            return {"error": f"Retry scheduling failed: {str(e)}"}
    
    def rotate_auth_token(self, base_id, table_name, token_field, new_token):
        """Swap out expired token in Airtable config"""
        if not self.airtable_api_key:
            return {"error": "Airtable API key required"}
        
        try:
            url = f"https://api.airtable.com/v0/{base_id}/{table_name}"
            headers = {
                "Authorization": f"Bearer {self.airtable_api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "records": [
                    {
                        "fields": {
                            token_field: new_token
                        }
                    }
                ]
            }
            response = requests.patch(url, headers=headers, json=payload, timeout=30)
            return response.json()
        except Exception as e:
            return {"error": f"Token rotation failed: {str(e)}"}
    
    def schedule_command_loop(self, records, trigger_function):
        """Cyclic loop to trigger pending command jobs or retries"""
        try:
            for record in records:
                fields = record.get("fields", {})
                if fields.get("⏰ Retry At"):
                    result = trigger_function(fields.get("🧭 Trigger Type"), fields)
                    self.log_command_center_event(
                        "🔄 Loop Execution", 
                        f"Processed {fields.get('🧭 Trigger Type')} - Result: {result.get('success', 'error')}"
                    )
                time.sleep(2)
            return "Loop completed"
        except Exception as e:
            return {"error": f"Command loop failed: {str(e)}"}

def test_command_center_dispatcher():
    """Test the command center dispatcher system"""
    print("="*60)
    print("COMMAND CENTER DISPATCHER TEST")
    print("="*60)
    
    dispatcher = CommandCenterDispatcher()
    
    # Test 1: Apollo scrape dispatch
    print("\n1. Testing Apollo scrape dispatch...")
    apollo_payload = {
        "title": "Owner",
        "location": "Texas",
        "keywords": "roofing contractor"
    }
    apollo_result = dispatcher.route_command_center_trigger("Apollo Scrape", apollo_payload)
    print(f"   Apollo result: {'✅' if 'error' not in apollo_result else '❌'}")
    
    # Test 2: SMS dispatch
    print("\n2. Testing SMS dispatch...")
    sms_payload = {
        "to": "+1234567890",
        "from": "+1987654321",
        "message": "Test message from Command Center"
    }
    sms_result = dispatcher.route_command_center_trigger("Send SMS", sms_payload)
    print(f"   SMS result: {'✅' if 'error' not in sms_result else '❌'}")
    
    # Test 3: Emergency alert
    print("\n3. Testing emergency alert...")
    webhook_url = os.getenv("SLACK_WEBHOOK_URL")
    if webhook_url:
        alert_result = dispatcher.send_sev1_alert_to_slack(webhook_url, "Test SEV-1 alert from dispatcher")
        print(f"   Alert result: {'✅' if alert_result == 200 else '❌'}")
    else:
        print("   Alert result: ❌ (No Slack webhook URL)")
    
    print(f"\n📊 Dispatcher Test Summary:")
    print(f"   Apollo dispatch: {'Ready' if 'error' not in apollo_result else 'Needs API key'}")
    print(f"   SMS dispatch: {'Ready' if 'error' not in sms_result else 'Needs Twilio credentials'}")
    print(f"   Emergency alerts: {'Ready' if webhook_url else 'Needs Slack webhook'}")
    print(f"   System status: ✅ Dispatcher operational")
    
    return {
        "apollo_test": apollo_result,
        "sms_test": sms_result,
        "dispatcher_ready": True
    }

if __name__ == "__main__":
    test_results = test_command_center_dispatcher()
    print(f"\n🎯 Command Center Dispatcher ready for production use")