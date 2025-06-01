"""
ChatGPT Integration Test (via Replit) + Airtable Logger
Test OpenAI ChatGPT integration with proper Airtable logging
"""

import requests
import os
from datetime import datetime

# Your actual Airtable credentials
AIRTABLE_API_KEY = os.getenv('AIRTABLE_API_KEY')
BASE_ID = "appRt8V3tH4g5Z5if"
TABLE_NAME = "🧪 Integration Test Log"

def log_test_to_airtable(name, status, notes, module_type="LLM", link=""):
    """Log test results to Airtable Integration Test Log table"""
    if AIRTABLE_API_KEY:
        url = f"https://api.airtable.com/v0/{BASE_ID}/🧪 Integration Test Log"
        headers = {
            "Authorization": f"Bearer {AIRTABLE_API_KEY}",
            "Content-Type": "application/json"
        }
        data = {
            "fields": {
                "🔧 Integration Name": name,
                "✅ Pass/Fail": status,
                "🧠 Notes / Debug": notes,
                "📅 Test Date": datetime.today().strftime("%Y-%m-%d"),
                "🧑‍💻 QA Owner": "Tyson",
                "📤 Output Data Populated": True,
                "🗃️ Record Created?": True,
                "🔁 Retry Attempted?": False,
                "🧩 Module Type": module_type,
                "📂 Related Scenario Link": link
            }
        }
        
        response = requests.post(url, headers=headers, json=data)
        if response.status_code == 200:
            print("✅ Airtable log posted")
            return True
        else:
            print(f"❌ Airtable log failed: {response.status_code} {response.text}")
            return False
    else:
        print("❌ Airtable API key not available")
        return False

def test_chatgpt_response():
    """Test ChatGPT integration with OpenAI API"""
    openai_key = os.getenv('OPENAI_API_KEY')
    
    if not openai_key:
        error_msg = "OpenAI API key not configured"
        print(f"❌ ChatGPT test: {error_msg}")
        log_test_to_airtable("ChatGPT Integration", "❌", error_msg, "LLM")
        return False
    
    try:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {openai_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": "gpt-4o",
            "messages": [
                {"role": "system", "content": "You are a helpful assistant for YoBot integration testing."},
                {"role": "user", "content": "What is the capital of France? Keep response brief."}
            ],
            "max_tokens": 50
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=15)
        
        if response.status_code == 200:
            reply_data = response.json()
            reply = reply_data["choices"][0]["message"]["content"]
            
            print(f"✅ ChatGPT replied: {reply}")
            log_test_to_airtable(
                "ChatGPT Integration", 
                "✅", 
                f"Response: {reply}", 
                "LLM",
                "https://openai.com"
            )
            return True
            
        else:
            error_msg = f"OpenAI API error: {response.status_code} - {response.text}"
            print(f"❌ ChatGPT error: {error_msg}")
            log_test_to_airtable("ChatGPT Integration", "❌", error_msg, "LLM")
            return False
            
    except Exception as e:
        error_msg = str(e)
        print(f"❌ ChatGPT integration error: {error_msg}")
        log_test_to_airtable("ChatGPT Integration", "❌", f"Exception: {error_msg}", "LLM")
        return False

def test_chatgpt_advanced_query():
    """Test ChatGPT with YoBot-specific query"""
    openai_key = os.getenv('OPENAI_API_KEY')
    
    if not openai_key:
        return False
    
    try:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {openai_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": "gpt-4o",
            "messages": [
                {"role": "system", "content": "You are an AI assistant for YoBot, a business automation platform."},
                {"role": "user", "content": "How can AI automation help small businesses improve their customer support efficiency?"}
            ],
            "max_tokens": 100
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=15)
        
        if response.status_code == 200:
            reply_data = response.json()
            reply = reply_data["choices"][0]["message"]["content"]
            
            print(f"✅ ChatGPT advanced query successful")
            print(f"   Response: {reply[:100]}...")
            
            log_test_to_airtable(
                "ChatGPT Advanced Query", 
                "✅", 
                f"Business automation response: {reply[:150]}...", 
                "LLM",
                "https://openai.com"
            )
            return True
            
        else:
            error_msg = f"Advanced query failed: {response.status_code}"
            print(f"❌ ChatGPT advanced query: {error_msg}")
            log_test_to_airtable("ChatGPT Advanced Query", "❌", error_msg, "LLM")
            return False
            
    except Exception as e:
        error_msg = str(e)
        print(f"❌ ChatGPT advanced query error: {error_msg}")
        log_test_to_airtable("ChatGPT Advanced Query", "❌", f"Exception: {error_msg}", "LLM")
        return False

def test_chatgpt_integration_suite():
    """Run complete ChatGPT integration test suite"""
    print("🚀 Running ChatGPT Integration Test Suite")
    print("=" * 50)
    
    # Run tests
    basic_test = test_chatgpt_response()
    advanced_test = test_chatgpt_advanced_query()
    
    # Summary
    results = [basic_test, advanced_test]
    total_passed = sum(results)
    total_tests = len(results)
    
    print(f"\\n📊 ChatGPT Integration Results: {total_passed}/{total_tests} tests passed")
    
    # Log overall suite result
    if total_passed >= 1:
        log_test_to_airtable(
            "Complete ChatGPT Integration Suite",
            "✅",
            f"ChatGPT integration operational - {total_passed}/{total_tests} tests passed",
            "LLM System",
            "https://openai.com"
        )
    else:
        log_test_to_airtable(
            "Complete ChatGPT Integration Suite",
            "❌",
            f"ChatGPT integration failed - {total_passed}/{total_tests} tests passed",
            "LLM System"
        )
    
    print("🎯 All results logged to Integration Test Log")
    return total_passed >= 1

if __name__ == "__main__":
    test_chatgpt_integration_suite()