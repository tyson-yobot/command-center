#!/usr/bin/env python3
"""
Integration Examples for Universal Webhook Logger
Shows how to wire the drop-in logger into all existing modules
"""

from universal_webhook_logger import (
    log_to_airtable, 
    log_voice_generation, 
    log_stripe_payment,
    log_chat_interaction,
    log_quote_activity,
    quick_log
)
from datetime import datetime

# Example 1: Voice Generation Module Integration
def generate_voice_with_logging(text, user_email, tone="professional"):
    """
    Voice generation with integrated logging
    """
    start_time = datetime.now()
    
    try:
        # Your existing voice generation logic here
        voice_result = {"success": True, "file_path": "voice_output.mp3"}
        
        generation_time = (datetime.now() - start_time).total_seconds()
        
        # Drop-in logging
        log_voice_generation(
            user_email=user_email,
            variant=tone,
            voice_id="voice_001",
            generation_time=generation_time,
            success=voice_result["success"]
        )
        
        return voice_result
        
    except Exception as e:
        # Log failure
        log_voice_generation(
            user_email=user_email,
            variant=tone,
            voice_id="voice_001", 
            generation_time=0,
            success=False
        )
        raise e

# Example 2: Stripe Payment Integration
def process_stripe_payment_with_logging(customer_email, amount, payment_id):
    """
    Stripe payment processing with integrated logging
    """
    try:
        # Your existing Stripe processing logic
        payment_success = True
        
        # Drop-in logging
        log_stripe_payment(
            customer_email=customer_email,
            amount=amount,
            payment_id=payment_id
        )
        
        return {"success": payment_success}
        
    except Exception as e:
        # Log failed payment attempt
        log_to_airtable("Payment Errors", {
            "email": customer_email,
            "amount": amount,
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        })
        raise e

# Example 3: Chat Interaction Integration
def handle_chat_with_logging(customer_email, customer_name, message):
    """
    Chat handling with integrated logging
    """
    start_time = datetime.now()
    
    try:
        # Your existing chat processing logic
        response = "Thank you for your message!"
        
        response_time = (datetime.now() - start_time).total_seconds()
        
        # Drop-in logging
        log_chat_interaction(
            customer_email=customer_email,
            customer_name=customer_name,
            message_length=len(message),
            response_time=response_time
        )
        
        return response
        
    except Exception as e:
        log_to_airtable("Chat Errors", {
            "email": customer_email,
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        })
        raise e

# Example 4: OCR Processing Integration
def process_ocr_with_logging(user_email, filename, image_data):
    """
    OCR processing with integrated logging
    """
    try:
        # Your existing OCR logic
        extracted_text = "Sample extracted text"
        confidence = 0.95
        
        # Drop-in logging
        log_to_airtable("OCR Logs", {
            "email": user_email,
            "filename": filename,
            "text_length": len(extracted_text),
            "confidence": confidence,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        return {"text": extracted_text, "confidence": confidence}
        
    except Exception as e:
        log_to_airtable("OCR Errors", {
            "email": user_email,
            "filename": filename,
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        })
        raise e

# Example 5: Quote Activity Integration
def handle_quote_signing_with_logging(customer_email, quote_id, amount):
    """
    Quote signing with integrated logging
    """
    try:
        # Your existing quote processing logic
        signing_success = True
        
        # Drop-in logging
        log_quote_activity(
            customer_email=customer_email,
            quote_id=quote_id,
            action="signed",
            amount=amount
        )
        
        return {"success": signing_success}
        
    except Exception as e:
        log_to_airtable("Quote Errors", {
            "email": customer_email,
            "quote_id": quote_id,
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        })
        raise e

# Example 6: System Event Integration
def system_startup_with_logging():
    """
    System startup with integrated logging
    """
    try:
        # Your system startup logic
        startup_success = True
        
        # Drop-in logging
        log_to_airtable("System Events", {
            "event": "system_startup",
            "status": "success",
            "timestamp": datetime.utcnow().isoformat()
        })
        
        return startup_success
        
    except Exception as e:
        log_to_airtable("System Events", {
            "event": "system_startup",
            "status": "failed",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        })
        raise e

# Example 7: Quick Logging Pattern
def any_module_quick_log(user_email, action_performed, additional_data=None):
    """
    Universal quick logging for any module
    """
    return quick_log(
        table="General Activity",
        email=user_email,
        action=action_performed,
        details=additional_data
    )

if __name__ == "__main__":
    # Test integrations
    print("Testing universal logger integrations...")
    
    # Test voice generation logging
    generate_voice_with_logging("Hello world", "test@yobot.com", "energetic")
    
    # Test payment logging  
    process_stripe_payment_with_logging("customer@example.com", 299.99, "pi_test123")
    
    # Test chat logging
    handle_chat_with_logging("user@example.com", "John Doe", "I need help with my account")
    
    print("Integration tests completed!")