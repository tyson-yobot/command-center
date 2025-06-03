"""
Re-test PhantomBuster and ElevenLabs with current API keys
"""

import os
import requests
from airtable_test_logger import log_test_to_airtable

def test_phantombuster_with_current_key():
    """Test PhantomBuster with current API key"""
    print("Testing PhantomBuster API...")
    
    api_key = os.getenv('PHANTOMBUSTER_API_KEY')
    if not api_key:
        log_test_to_airtable("PhantomBuster API", "FAIL", "API key not found", "Lead Generation")
        return False
    
    try:
        headers = {'X-Phantombuster-Key': api_key}
        response = requests.get("https://api.phantombuster.com/api/v2/agents", headers=headers, timeout=15)
        
        if response.status_code == 200:
            agents = response.json()
            log_test_to_airtable(
                "PhantomBuster API", 
                "PASS", 
                f"API connection successful - {len(agents)} agents available", 
                "Lead Generation"
            )
            print(f"✅ PhantomBuster working - {len(agents)} agents")
            return True
        else:
            error_msg = f"API returned status {response.status_code}"
            try:
                error_data = response.json()
                error_msg = f"API error: {error_data.get('error', error_msg)}"
            except:
                pass
            
            log_test_to_airtable("PhantomBuster API", "FAIL", error_msg, "Lead Generation")
            print(f"❌ PhantomBuster failed: {error_msg}")
            return False
            
    except Exception as e:
        log_test_to_airtable("PhantomBuster API", "FAIL", f"Connection error: {str(e)}", "Lead Generation")
        print(f"❌ PhantomBuster error: {str(e)}")
        return False

def test_elevenlabs_with_current_key():
    """Test ElevenLabs with current API key"""
    print("Testing ElevenLabs API...")
    
    api_key = os.getenv('ELEVENLABS_API_KEY')
    if not api_key:
        log_test_to_airtable("ElevenLabs API", "FAIL", "API key not found", "Voice Generation")
        return False
    
    try:
        headers = {'xi-api-key': api_key}
        response = requests.get("https://api.elevenlabs.io/v1/voices", headers=headers, timeout=15)
        
        if response.status_code == 200:
            voices = response.json()
            voice_count = len(voices.get('voices', []))
            log_test_to_airtable(
                "ElevenLabs API", 
                "PASS", 
                f"Voice API working - {voice_count} voices available", 
                "Voice Generation"
            )
            print(f"✅ ElevenLabs working - {voice_count} voices")
            return True
        else:
            error_msg = f"API returned status {response.status_code}"
            try:
                error_data = response.json()
                error_msg = f"API error: {error_data.get('detail', {}).get('message', error_msg)}"
            except:
                pass
            
            log_test_to_airtable("ElevenLabs API", "FAIL", error_msg, "Voice Generation")
            print(f"❌ ElevenLabs failed: {error_msg}")
            return False
            
    except Exception as e:
        log_test_to_airtable("ElevenLabs API", "FAIL", f"Connection error: {str(e)}", "Voice Generation")
        print(f"❌ ElevenLabs error: {str(e)}")
        return False

def run_api_retests():
    """Re-run tests for APIs that should be working"""
    print("🔄 Re-testing APIs with current keys")
    print("=" * 40)
    
    phantom_result = test_phantombuster_with_current_key()
    elevenlabs_result = test_elevenlabs_with_current_key()
    
    working_count = sum([phantom_result, elevenlabs_result])
    total_count = 2
    
    print(f"\n📊 API Re-test Results: {working_count}/{total_count} working")
    
    if working_count == total_count:
        print("✅ All APIs now operational")
    elif working_count > 0:
        print(f"✅ {working_count} API(s) working, {total_count - working_count} still need attention")
    else:
        print("❌ APIs still experiencing issues")
    
    return {"phantom": phantom_result, "elevenlabs": elevenlabs_result}

if __name__ == "__main__":
    run_api_retests()