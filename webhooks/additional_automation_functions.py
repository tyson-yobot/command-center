"""
Additional Automation Functions Integration
PhantomBuster scraping, voice generation, and Twilio calling
"""
import requests
import os
from datetime import datetime

def launch_scraper_phantombuster(phantom_id, api_key=None):
    """Launch PhantomBuster scraper agent"""
    if not api_key:
        api_key = os.getenv('PHANTOMBUSTER_API_KEY')
    
    if not api_key:
        print("⚠️ PHANTOMBUSTER_API_KEY not configured")
        return {"error": "API key required", "status": "needs_credentials"}
    
    try:
        url = f"https://api.phantombuster.com/api/v2/agents/launch?id={phantom_id}&output=first-result-object"
        headers = {
            "X-Phantombuster-Key-1": api_key,
            "Content-Type": "application/json"
        }
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code == 200:
            print(f"✅ PhantomBuster scraper {phantom_id} launched successfully")
            return response.json()
        else:
            print(f"❌ PhantomBuster launch failed: {response.status_code}")
            return {"error": f"Launch failed: {response.status_code}", "response": response.text}
            
    except Exception as e:
        print(f"❌ PhantomBuster error: {str(e)}")
        return {"error": str(e), "status": "connection_failed"}

def log_scrape_to_airtable(base_id, table_name, record, api_key=None):
    """Log scraping results to Airtable"""
    if not api_key:
        api_key = os.getenv('AIRTABLE_API_KEY') or os.getenv('AIRTABLE_PERSONAL_ACCESS_TOKEN')
    
    if not api_key:
        print("⚠️ AIRTABLE_API_KEY not configured")
        return {"error": "API key required", "status": "needs_credentials"}
    
    try:
        airtable_url = f"https://api.airtable.com/v0/{base_id}/{table_name}"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {"fields": record}
        response = requests.post(airtable_url, headers=headers, json=payload, timeout=30)
        
        if response.status_code in [200, 201]:
            print(f"✅ Scrape data logged to Airtable successfully")
            return response.json()
        else:
            print(f"❌ Airtable logging failed: {response.status_code}")
            return {"error": f"Logging failed: {response.status_code}", "response": response.text}
            
    except Exception as e:
        print(f"❌ Airtable logging error: {str(e)}")
        return {"error": str(e), "status": "connection_failed"}

def get_scrape_status(phantom_id, api_key=None):
    """Get PhantomBuster scraper status"""
    if not api_key:
        api_key = os.getenv('PHANTOMBUSTER_API_KEY')
    
    if not api_key:
        print("⚠️ PHANTOMBUSTER_API_KEY not configured")
        return {"error": "API key required", "status": "needs_credentials"}
    
    try:
        url = f"https://api.phantombuster.com/api/v2/agents/fetch?id={phantom_id}"
        headers = {"X-Phantombuster-Key-1": api_key}
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code == 200:
            status_data = response.json()
            print(f"✅ PhantomBuster status retrieved for {phantom_id}")
            return status_data
        else:
            print(f"❌ Status check failed: {response.status_code}")
            return {"error": f"Status check failed: {response.status_code}", "response": response.text}
            
    except Exception as e:
        print(f"❌ Status check error: {str(e)}")
        return {"error": str(e), "status": "connection_failed"}

def generate_voice_clip(text, voice_id="21m00Tcm4TlvDq8ikWAM", elevenlabs_key=None):
    """Generate voice clip using ElevenLabs"""
    if not elevenlabs_key:
        elevenlabs_key = os.getenv('ELEVENLABS_API_KEY')
    
    if not elevenlabs_key:
        print("⚠️ ELEVENLABS_API_KEY not configured")
        return {"error": "API key required", "status": "needs_credentials"}
    
    try:
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
        headers = {
            "xi-api-key": elevenlabs_key,
            "Content-Type": "application/json"
        }
        payload = {
            "text": text,
            "voice_settings": {"stability": 0.4, "similarity_boost": 0.75}
        }
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        if response.status_code == 200:
            print(f"✅ Voice clip generated successfully")
            return {"audio_data": response.content, "status": "success"}
        else:
            print(f"❌ Voice generation failed: {response.status_code}")
            return {"error": f"Voice generation failed: {response.status_code}", "response": response.text}
            
    except Exception as e:
        print(f"❌ Voice generation error: {str(e)}")
        return {"error": str(e), "status": "connection_failed"}

def start_outbound_call(to_number, from_number=None, twiml_url=None, twilio_sid=None, twilio_token=None):
    """Start outbound call using Twilio"""
    # Check for Twilio credentials
    if not twilio_sid:
        twilio_sid = os.getenv('TWILIO_ACCOUNT_SID')
    if not twilio_token:
        twilio_token = os.getenv('TWILIO_AUTH_TOKEN')
    if not from_number:
        from_number = os.getenv('TWILIO_PHONE_NUMBER')
    
    if not all([twilio_sid, twilio_token, from_number]):
        print("⚠️ Twilio credentials not fully configured")
        return {"error": "Twilio credentials required", "status": "needs_credentials"}
    
    try:
        # Check if twilio is installed
        try:
            from twilio.rest import Client
        except ImportError:
            print("⚠️ Twilio package not installed - installing now...")
            import subprocess
            subprocess.check_call(["pip", "install", "twilio"])
            from twilio.rest import Client
        
        client = Client(twilio_sid, twilio_token)
        
        # Default TwiML URL if not provided
        if not twiml_url:
            twiml_url = "http://demo.twilio.com/docs/voice.xml"  # Default demo TwiML
        
        call = client.calls.create(
            to=to_number,
            from_=from_number,
            url=twiml_url
        )
        
        print(f"✅ Outbound call initiated: {call.sid}")
        return {"call_sid": call.sid, "status": "call_initiated", "to": to_number}
        
    except Exception as e:
        print(f"❌ Twilio call error: {str(e)}")
        return {"error": str(e), "status": "call_failed"}

def test_all_functions():
    """Test all automation functions"""
    print("="*60)
    print("TESTING ADDITIONAL AUTOMATION FUNCTIONS")
    print("="*60)
    
    # Test 1: PhantomBuster Scraper
    print("\n1. Testing PhantomBuster Scraper...")
    phantom_result = launch_scraper_phantombuster("test_agent_id")
    
    # Test 2: Airtable Logging
    print("\n2. Testing Airtable Logging...")
    test_record = {
        "Name": "Test Scrape",
        "Status": "Active",
        "Timestamp": datetime.now().isoformat()
    }
    airtable_result = log_scrape_to_airtable("appTestBase", "tblTestTable", test_record)
    
    # Test 3: PhantomBuster Status
    print("\n3. Testing PhantomBuster Status...")
    status_result = get_scrape_status("test_agent_id")
    
    # Test 4: Voice Generation
    print("\n4. Testing Voice Generation...")
    voice_result = generate_voice_clip("Hello, this is a test voice message from YoBot.")
    
    # Test 5: Twilio Call
    print("\n5. Testing Twilio Outbound Call...")
    call_result = start_outbound_call("+1234567890")  # Test number
    
    # Summary
    print(f"\n📊 Test Results Summary:")
    print(f"   PhantomBuster Launch: {'✅' if 'error' not in phantom_result else '❌'}")
    print(f"   Airtable Logging: {'✅' if 'error' not in airtable_result else '❌'}")
    print(f"   Status Check: {'✅' if 'error' not in status_result else '❌'}")
    print(f"   Voice Generation: {'✅' if 'error' not in voice_result else '❌'}")
    print(f"   Twilio Calling: {'✅' if 'error' not in call_result else '❌'}")
    
    # Check which credentials are needed
    needed_credentials = []
    if 'needs_credentials' in str(phantom_result):
        needed_credentials.append('PHANTOMBUSTER_API_KEY')
    if 'needs_credentials' in str(airtable_result):
        needed_credentials.append('AIRTABLE_API_KEY')
    if 'needs_credentials' in str(voice_result):
        needed_credentials.append('ELEVENLABS_API_KEY')
    if 'needs_credentials' in str(call_result):
        needed_credentials.extend(['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'])
    
    if needed_credentials:
        print(f"\n🔑 Required Credentials:")
        for cred in set(needed_credentials):
            print(f"   • {cred}")
    else:
        print(f"\n✅ All functions operational with existing credentials")

if __name__ == "__main__":
    test_all_functions()