"""
Voice Transfer Handler
Handles fake transfers with realistic delays for YoBot voice calls
"""
import time
import re

def perform_fake_transfer(name):
    """
    Simulates transfer to specified person with 5-second delay
    Returns unavailable message for realistic handling
    """
    print(f"⏳ Simulating transfer to {name.title()}...")
    time.sleep(5)
    return f"Sorry, {name.title()} is currently unavailable. Would you like to leave a message for them?"

def check_transfer_command(text):
    """
    Checks if user is requesting a transfer to someone
    Returns the name if transfer detected, None otherwise
    """
    text_lower = text.lower()
    
    # Common transfer patterns
    transfer_patterns = [
        r"transfer me to (\w+)",
        r"can i speak to (\w+)",
        r"i need to talk to (\w+)",
        r"put me through to (\w+)",
        r"connect me to (\w+)",
        r"i want to speak with (\w+)",
        r"is (\w+) available",
        r"can you get (\w+)",
        r"let me talk to (\w+)"
    ]
    
    for pattern in transfer_patterns:
        match = re.search(pattern, text_lower)
        if match:
            return match.group(1)
    
    return None

def handle_voice_transfer(conversation, reply):
    """
    Handles transfer logic within voice conversation
    Returns tuple: (should_continue, updated_conversation)
    """
    transfer_target = check_transfer_command(reply)
    if transfer_target:
        print(f"🎭 Faking transfer to {transfer_target}")
        fake_reply = perform_fake_transfer(transfer_target)
        conversation.append({"role": "assistant", "content": fake_reply})
        return True, conversation  # Should continue with fake reply instead of GPT
    
    return False, conversation  # No transfer, proceed normally

def test_transfer_handler():
    """Test the transfer detection and handling"""
    test_phrases = [
        "Can you transfer me to Mike?",
        "I need to speak with Sarah",
        "Is John available?",
        "Put me through to the manager",
        "Hello, how are you today?"  # Should not trigger transfer
    ]
    
    for phrase in test_phrases:
        target = check_transfer_command(phrase)
        if target:
            print(f"✅ Transfer detected: '{phrase}' -> {target}")
            fake_response = perform_fake_transfer(target)
            print(f"   Response: {fake_response}")
        else:
            print(f"❌ No transfer: '{phrase}'")
        print()

if __name__ == "__main__":
    test_transfer_handler()