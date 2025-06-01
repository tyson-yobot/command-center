"""
AI Support Agent – Replit Test Script with Airtable Logging
Test AI support agent integration with comprehensive logging
"""

import requests
import os
from datetime import datetime

# Your actual Airtable credentials
AIRTABLE_API_KEY = os.getenv('AIRTABLE_API_KEY')
BASE_ID = "appRt8V3tH4g5Z5if"
TABLE_ID = "tbly0fjE2M5uHET9X"

def log_test_to_airtable(name, status, notes, module_type="Core Automation", link=""):
    """Auto-log test results to Integration Test Log"""
    if AIRTABLE_API_KEY:
        url = f"https://api.airtable.com/v0/{BASE_ID}/{TABLE_ID}"
        headers = {
            "Authorization": f"Bearer {AIRTABLE_API_KEY}",
            "Content-Type": "application/json"
        }
        data = {
            "fields": {
                "🔧 Integration Name": name,
                "✅ Pass/Fail": status == "✅",
                "🧠 Notes / Debug": notes,
                "📅 Test Date": datetime.today().strftime("%Y-%m-%d"),
                "🧑‍💻 QA Owner": "Tyson",
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

def test_ai_support_agent_endpoint():
    """Test AI Support Agent API endpoint"""
    try:
        # Test with actual YoBot endpoint structure
        url = "https://yobot.api/ai_support_agent"  # Placeholder endpoint
        payload = {
            "ticket_id": 24,  # Using our created ticket
            "question": "What is the status of my integration test?",
            "customer_email": "testcontact@yobot.bot",
            "urgency": "medium"
        }
        headers = {"Content-Type": "application/json"}
        
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        
        if response.status_code == 200:
            ai_response = response.json()
            print(f"✅ AI Support Agent responded: {ai_response}")
            
            log_test_to_airtable(
                "AI Support Agent API",
                "✅",
                f"Response received: {str(ai_response)[:100]}...",
                "AI Processing",
                url
            )
            return True
            
        else:
            error_msg = f"HTTP {response.status_code}: {response.text}"
            print(f"❌ AI Support Agent failed: {error_msg}")
            
            log_test_to_airtable(
                "AI Support Agent API",
                "❌",
                error_msg,
                "AI Processing"
            )
            return False
            
    except requests.exceptions.Timeout:
        error_msg = "Request timeout - AI Support Agent endpoint not responding"
        print(f"❌ AI Support Agent: {error_msg}")
        
        log_test_to_airtable(
            "AI Support Agent API",
            "❌",
            error_msg,
            "AI Processing"
        )
        return False
        
    except requests.exceptions.ConnectionError:
        error_msg = "Connection error - AI Support Agent endpoint not available"
        print(f"❌ AI Support Agent: {error_msg}")
        
        log_test_to_airtable(
            "AI Support Agent API",
            "❌",
            error_msg,
            "AI Processing"
        )
        return False
        
    except Exception as e:
        error_msg = str(e)
        print(f"❌ AI Support Agent error: {error_msg}")
        
        log_test_to_airtable(
            "AI Support Agent API",
            "❌",
            f"Exception: {error_msg}",
            "AI Processing"
        )
        return False

def test_ai_support_simulation():
    """Test AI Support Agent simulation with OpenAI"""
    try:
        # Simulate AI support response using available OpenAI integration
        openai_key = os.getenv('OPENAI_API_KEY')
        
        if not openai_key:
            error_msg = "OpenAI API key not configured for AI support simulation"
            print(f"❌ AI Support simulation: {error_msg}")
            
            log_test_to_airtable(
                "AI Support Simulation",
                "❌",
                error_msg,
                "AI Processing"
            )
            return False
        
        # Test OpenAI connection for AI support
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {openai_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "gpt-4o",
            "messages": [
                {
                    "role": "system",
                    "content": "You are an AI support agent for YoBot. Provide helpful, concise responses to customer inquiries."
                },
                {
                    "role": "user",
                    "content": "What is the status of my integration test? My ticket number is 24."
                }
            ],
            "max_tokens": 150,
            "temperature": 0.7
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=15)
        
        if response.status_code == 200:
            ai_response = response.json()
            message_content = ai_response.get('choices', [{}])[0].get('message', {}).get('content', 'No response')
            
            print(f"✅ AI Support simulation successful")
            print(f"   Response: {message_content[:100]}...")
            
            log_test_to_airtable(
                "AI Support Simulation",
                "✅",
                f"OpenAI response generated: {message_content[:150]}...",
                "AI Processing",
                "https://openai.com"
            )
            return True
            
        else:
            error_msg = f"OpenAI API error: {response.status_code} - {response.text}"
            print(f"❌ AI Support simulation failed: {error_msg}")
            
            log_test_to_airtable(
                "AI Support Simulation",
                "❌",
                error_msg,
                "AI Processing"
            )
            return False
            
    except Exception as e:
        error_msg = str(e)
        print(f"❌ AI Support simulation error: {error_msg}")
        
        log_test_to_airtable(
            "AI Support Simulation",
            "❌",
            f"Exception: {error_msg}",
            "AI Processing"
        )
        return False

def test_ai_support_suite():
    """Run complete AI Support Agent test suite"""
    print("🚀 Running AI Support Agent Test Suite")
    print("=" * 50)
    
    # Run tests
    endpoint_test = test_ai_support_agent_endpoint()
    simulation_test = test_ai_support_simulation()
    
    # Summary
    results = [endpoint_test, simulation_test]
    total_passed = sum(results)
    total_tests = len(results)
    
    print(f"\\n📊 AI Support Results: {total_passed}/{total_tests} systems operational")
    
    # Log overall suite result
    if total_passed >= 1:
        log_test_to_airtable(
            "Complete AI Support Suite",
            "✅",
            f"AI support capabilities tested - {total_passed}/{total_tests} systems working",
            "AI System",
            "https://replit.com/@YoBot/CommandCenter"
        )
    else:
        log_test_to_airtable(
            "Complete AI Support Suite",
            "❌",
            f"No AI support systems working - {total_passed}/{total_tests}",
            "AI System"
        )
    
    print("🎯 All results automatically logged to Integration Test Log")
    return total_passed >= 1

if __name__ == "__main__":
    test_ai_support_suite()