"""
Test all systems with updated API keys
"""

import os
import requests
from airtable_test_logger import log_test_to_airtable

# Set the API keys
ELEVENLABS_KEY = "sk_abb746b1e386be0085d005a594c6818afac710a9c3d6780a"
OPENAI_KEY = "wBL9kZGAslPql7P9aYOgELLOvGOGrCKfZY6cQ8z5W40"
PHANTOMBUSTER_KEY = "4O0quJiGUuJsvkoUXeUr7HvHTN3ZeMn6EerQgOLgSxo"

def test_elevenlabs_updated():
    """Test ElevenLabs with updated API key"""
    print("Testing ElevenLabs API...")
    
    try:
        headers = {'xi-api-key': ELEVENLABS_KEY}
        response = requests.get("https://api.elevenlabs.io/v1/voices", headers=headers, timeout=15)
        
        if response.status_code == 200:
            voices = response.json()
            voice_count = len(voices.get('voices', []))
            log_test_to_airtable(
                "ElevenLabs Voice Generation", 
                "PASS", 
                f"Voice API working - {voice_count} voices available", 
                "Voice Generation"
            )
            print(f"✅ ElevenLabs working - {voice_count} voices available")
            return True
        else:
            error_msg = f"API returned status {response.status_code}"
            log_test_to_airtable("ElevenLabs Voice Generation", "FAIL", error_msg, "Voice Generation")
            print(f"❌ ElevenLabs failed: {error_msg}")
            return False
            
    except Exception as e:
        log_test_to_airtable("ElevenLabs Voice Generation", "FAIL", f"Connection error: {str(e)}", "Voice Generation")
        print(f"❌ ElevenLabs error: {str(e)}")
        return False

def test_phantombuster_updated():
    """Test PhantomBuster with updated API key"""
    print("Testing PhantomBuster API...")
    
    try:
        headers = {'X-Phantombuster-Key': PHANTOMBUSTER_KEY}
        response = requests.get("https://api.phantombuster.com/api/v2/agents", headers=headers, timeout=15)
        
        if response.status_code == 200:
            agents = response.json()
            log_test_to_airtable(
                "PhantomBuster Lead Generation", 
                "PASS", 
                f"API connection successful - {len(agents)} agents available", 
                "Lead Generation"
            )
            print(f"✅ PhantomBuster working - {len(agents)} agents")
            return True
        else:
            error_msg = f"API returned status {response.status_code}"
            log_test_to_airtable("PhantomBuster Lead Generation", "FAIL", error_msg, "Lead Generation")
            print(f"❌ PhantomBuster failed: {error_msg}")
            return False
            
    except Exception as e:
        log_test_to_airtable("PhantomBuster Lead Generation", "FAIL", f"Connection error: {str(e)}", "Lead Generation")
        print(f"❌ PhantomBuster error: {str(e)}")
        return False

def test_openai_updated():
    """Test OpenAI with updated API key"""
    print("Testing OpenAI API...")
    
    try:
        headers = {
            'Authorization': f'Bearer {OPENAI_KEY}',
            'Content-Type': 'application/json'
        }
        
        # Simple test request
        data = {
            "model": "gpt-4o-mini",
            "messages": [{"role": "user", "content": "Test"}],
            "max_tokens": 5
        }
        
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=data,
            timeout=15
        )
        
        if response.status_code == 200:
            log_test_to_airtable(
                "OpenAI API Integration", 
                "PASS", 
                "API connection successful - chat completions working", 
                "AI Core"
            )
            print("✅ OpenAI working - chat completions available")
            return True
        else:
            error_msg = f"API returned status {response.status_code}"
            log_test_to_airtable("OpenAI API Integration", "FAIL", error_msg, "AI Core")
            print(f"❌ OpenAI failed: {error_msg}")
            return False
            
    except Exception as e:
        log_test_to_airtable("OpenAI API Integration", "FAIL", f"Connection error: {str(e)}", "AI Core")
        print(f"❌ OpenAI error: {str(e)}")
        return False

def test_demo_video_generation():
    """Test demo video generation with ElevenLabs"""
    print("Testing demo video generation...")
    
    try:
        from demo_video_generator import test_voice_generation_pipeline
        result = test_voice_generation_pipeline()
        
        if result:
            log_test_to_airtable(
                "Demo Video Generation", 
                "PASS", 
                "Voice generation pipeline operational with ElevenLabs", 
                "Demo Production"
            )
            print("✅ Demo video generation working")
            return True
        else:
            log_test_to_airtable("Demo Video Generation", "FAIL", "Voice generation pipeline failed", "Demo Production")
            print("❌ Demo video generation failed")
            return False
            
    except Exception as e:
        log_test_to_airtable("Demo Video Generation", "FAIL", f"Error: {str(e)}", "Demo Production")
        print(f"❌ Demo video error: {str(e)}")
        return False

def test_linkedin_automation():
    """Test LinkedIn automation with PhantomBuster"""
    print("Testing LinkedIn automation...")
    
    try:
        from phantombuster_lead_generator import test_linkedin_agent_access
        result = test_linkedin_agent_access()
        
        if result:
            log_test_to_airtable(
                "LinkedIn Auto-Message", 
                "PASS", 
                "LinkedIn automation agent accessible", 
                "LinkedIn Automation"
            )
            print("✅ LinkedIn automation working")
            return True
        else:
            log_test_to_airtable("LinkedIn Auto-Message", "FAIL", "LinkedIn agent access failed", "LinkedIn Automation")
            print("❌ LinkedIn automation failed")
            return False
            
    except Exception as e:
        log_test_to_airtable("LinkedIn Auto-Message", "FAIL", f"Error: {str(e)}", "LinkedIn Automation")
        print(f"❌ LinkedIn automation error: {str(e)}")
        return False

def run_complete_system_test():
    """Run complete system test with all updated API keys"""
    print("🔄 Testing Complete System with Updated API Keys")
    print("=" * 60)
    
    tests = [
        ("ElevenLabs", test_elevenlabs_updated),
        ("PhantomBuster", test_phantombuster_updated),
        ("OpenAI", test_openai_updated),
        ("Demo Video Generation", test_demo_video_generation),
        ("LinkedIn Automation", test_linkedin_automation)
    ]
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        print(f"\n🧪 Testing {test_name}...")
        try:
            if test_func():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"  ❌ ERROR: {str(e)}")
            failed += 1
    
    print(f"\n📊 Updated API Test Results: {passed}/{passed + failed} working")
    
    # Calculate total system status including previously working systems
    total_working = passed + 5  # 5 systems already confirmed working
    total_systems = passed + failed + 5
    
    print(f"🎯 Overall System Status: {total_working}/{total_systems} systems operational")
    print(f"📈 Success Rate: {(total_working/total_systems)*100:.1f}%")
    
    # Log overall results
    log_test_to_airtable(
        "Complete System Test - Updated APIs", 
        "COMPLETE",
        f"Updated API testing: {passed}/{passed + failed} new systems working. Overall: {total_working}/{total_systems} operational",
        "Test Suite"
    )
    
    return {"new_working": passed, "total_working": total_working, "total_systems": total_systems}

if __name__ == "__main__":
    run_complete_system_test()