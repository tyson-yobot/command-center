"""
OpenAI Multi-Agent Fallback System for YoBot
Provides robust error handling and fallback responses for AI interactions
"""
import os
from openai import OpenAI
from airtable_test_logger import log_test_to_airtable

# Configure OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def handle_openai_call(input_text, agent_type="general"):
    """
    Handle OpenAI calls with fallback logic
    
    Args:
        input_text (str): The user input to process
        agent_type (str): Type of agent (general, support, sales)
    
    Returns:
        str: AI response or fallback message
    """
    try:
        # Primary OpenAI agent call
        response = client.chat.completions.create(
            model="gpt-4o",  # the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
            messages=[
                {
                    "role": "system", 
                    "content": get_system_prompt(agent_type)
                },
                {
                    "role": "user", 
                    "content": input_text
                }
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        ai_response = response.choices[0].message.content
        
        # Log successful interaction
        log_test_to_airtable(
            f"OpenAI {agent_type.title()} Agent", 
            True, 
            f"Successful response generated for: {input_text[:50]}...",
            "AI System"
        )
        
        return ai_response
        
    except Exception as e:
        error_message = str(e)
        if "rate_limit" in error_message.lower():
            log_test_to_airtable("OpenAI Fallback", True, f"Rate limit triggered: {error_message}", "AI System")
            return get_rate_limit_fallback(agent_type)
        elif "invalid_request" in error_message.lower():
            log_test_to_airtable("OpenAI Fallback", True, f"Invalid request triggered: {error_message}", "AI System")
            return get_invalid_request_fallback(agent_type)
        elif "authentication" in error_message.lower():
            log_test_to_airtable("OpenAI Fallback", True, f"Auth error triggered: {error_message}", "AI System")
            return get_auth_error_fallback(agent_type)
        else:
            log_test_to_airtable("OpenAI Fallback", True, f"General fallback triggered: {error_message}", "AI System")
            return get_general_fallback(agent_type)

def get_system_prompt(agent_type):
    """Get system prompt based on agent type"""
    prompts = {
        "general": "You are YoBot, a helpful AI assistant for business automation. Provide clear, professional responses.",
        "support": "You are YoBot Support Agent. Help customers with their questions about YoBot services professionally.",
        "sales": "You are YoBot Sales Agent. Help prospects understand YoBot's value proposition and guide them toward solutions."
    }
    return prompts.get(agent_type, prompts["general"])

def get_rate_limit_fallback(agent_type):
    """Fallback response for rate limiting"""
    fallbacks = {
        "general": "I'm experiencing high demand right now. Let me get back to you in just a moment with a detailed response.",
        "support": "Our AI system is currently at capacity. A human support agent will assist you shortly. Your request is important to us.",
        "sales": "Thank you for your interest in YoBot. Due to high inquiry volume, I'll connect you with a sales specialist who can provide detailed information."
    }
    return fallbacks.get(agent_type, fallbacks["general"])

def get_invalid_request_fallback(agent_type):
    """Fallback response for invalid requests"""
    fallbacks = {
        "general": "I need a bit more information to help you effectively. Could you please rephrase your question?",
        "support": "To provide the best assistance, could you please provide more details about your specific issue?",
        "sales": "I'd love to help you learn more about YoBot. Could you tell me more about what you're looking for?"
    }
    return fallbacks.get(agent_type, fallbacks["general"])

def get_auth_error_fallback(agent_type):
    """Fallback response for authentication errors"""
    fallbacks = {
        "general": "I'm having trouble accessing our AI system. Let me connect you with a human agent who can assist you immediately.",
        "support": "Our AI support system is temporarily unavailable. I'm escalating your request to our human support team.",
        "sales": "I'm connecting you with one of our sales specialists who can provide immediate assistance with your inquiry."
    }
    return fallbacks.get(agent_type, fallbacks["general"])

def get_general_fallback(agent_type):
    """General fallback response"""
    fallbacks = {
        "general": "I'm having trouble understanding that. Let me get back to you with a proper response.",
        "support": "I'm experiencing a technical issue. Let me escalate this to our support team for immediate assistance.",
        "sales": "I want to make sure I give you accurate information. Let me connect you with a sales specialist right away."
    }
    return fallbacks.get(agent_type, fallbacks["general"])

def test_openai_fallback():
    """Test OpenAI fallback system with simulated failures"""
    print("Testing OpenAI Multi-Agent Fallback System...")
    
    # Test 1: Normal operation
    try:
        response = handle_openai_call("Hello, what is YoBot?", "general")
        print(f"Normal Response: {response}")
    except Exception as e:
        print(f"Normal test failed: {e}")
    
    # Test 2: Simulate failure by using invalid API key
    original_key = openai.api_key
    openai.api_key = "invalid_key_test"
    
    try:
        response = handle_openai_call("Test failure scenario", "support")
        print(f"Fallback Response: {response}")
    except Exception as e:
        print(f"Fallback test failed: {e}")
    finally:
        openai.api_key = original_key
    
    # Test 3: Test different agent types
    agent_types = ["general", "support", "sales"]
    for agent_type in agent_types:
        openai.api_key = "invalid_key_test"
        response = handle_openai_call("Test message", agent_type)
        print(f"{agent_type.title()} Fallback: {response}")
        openai.api_key = original_key

def main():
    """Run OpenAI fallback tests"""
    test_openai_fallback()

if __name__ == "__main__":
    main()