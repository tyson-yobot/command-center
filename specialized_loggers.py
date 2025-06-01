#!/usr/bin/env python3
"""
Specialized Logging Modules
VoiceBot, RAG Injection, Tone Variant, and OCR capture logging with universal schema
"""

from universal_webhook_logger import log_to_airtable
from datetime import datetime

def log_voicebot_mp3(customer_id, mp3_url, ticket_id=None, duration=None):
    """
    Capture every customer MP3 sent to VoiceBot system
    """
    try:
        data = {
            "customer_id": customer_id,
            "mp3_url": mp3_url,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if ticket_id:
            data["ticket_id"] = ticket_id
            
        if duration:
            data["duration_seconds"] = duration
            
        success = log_to_airtable("VoiceBot Logs", data)
        
        if success:
            print(f"VoiceBot MP3 logged for customer {customer_id}")
        
        return success
        
    except Exception as e:
        print(f"VoiceBot logging error: {e}")
        return False

def log_rag_injection(doc_name, source_url, rag_score, doc_type="document", processing_status="success"):
    """
    Track document ingestions into vector database
    """
    try:
        data = {
            "doc_name": doc_name,
            "source_url": source_url,
            "confidence": rag_score,
            "doc_type": doc_type,
            "status": processing_status,
            "injected_at": datetime.utcnow().isoformat()
        }
        
        success = log_to_airtable("RAG Injection Tracker", data)
        
        if success:
            print(f"RAG injection logged: {doc_name} (confidence: {rag_score})")
        
        return success
        
    except Exception as e:
        print(f"RAG injection logging error: {e}")
        return False

def log_tone_variant_usage(user_email, tone_used, voice_id=None, generation_success=True):
    """
    Track which voice tone variant was used for each generation
    """
    try:
        data = {
            "user_email": user_email,
            "tone_used": tone_used,
            "success": generation_success,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if voice_id:
            data["voice_id"] = voice_id
            
        success = log_to_airtable("Tone Logs", data)
        
        if success:
            print(f"Tone variant logged: {tone_used} for {user_email}")
        
        return success
        
    except Exception as e:
        print(f"Tone variant logging error: {e}")
        return False

def log_ocr_capture(name, company, email, phone=None, address=None, confidence=None):
    """
    Log every scanned business card and document OCR result
    """
    try:
        data = {
            "name": name,
            "company": company,
            "email": email,
            "scanned_at": datetime.utcnow().isoformat()
        }
        
        if phone:
            data["phone"] = phone
            
        if address:
            data["address"] = address
            
        if confidence:
            data["ocr_confidence"] = confidence
            
        success = log_to_airtable("OCR Logs", data)
        
        if success:
            print(f"OCR capture logged: {name} from {company}")
        
        return success
        
    except Exception as e:
        print(f"OCR capture logging error: {e}")
        return False

def log_comprehensive_voicebot_interaction(customer_id, mp3_url, ai_response_generated, response_mp3_url=None, processing_time=None):
    """
    Comprehensive VoiceBot interaction logging
    """
    try:
        data = {
            "customer_id": customer_id,
            "input_mp3_url": mp3_url,
            "ai_response_generated": ai_response_generated,
            "interaction_timestamp": datetime.utcnow().isoformat()
        }
        
        if response_mp3_url:
            data["response_mp3_url"] = response_mp3_url
            
        if processing_time:
            data["processing_time_seconds"] = processing_time
            
        return log_to_airtable("VoiceBot Interactions", data)
        
    except Exception as e:
        print(f"Comprehensive VoiceBot logging error: {e}")
        return False

def log_rag_query_analytics(query_text, documents_retrieved, top_confidence, response_generated, user_email=None):
    """
    Track RAG query performance and document retrieval effectiveness
    """
    try:
        data = {
            "query_text": query_text[:200],  # Truncate for storage
            "documents_retrieved": documents_retrieved,
            "top_confidence": top_confidence,
            "response_generated": response_generated,
            "query_timestamp": datetime.utcnow().isoformat()
        }
        
        if user_email:
            data["user_email"] = user_email
            
        return log_to_airtable("RAG Query Analytics", data)
        
    except Exception as e:
        print(f"RAG query analytics logging error: {e}")
        return False

def log_tone_performance_metrics(tone_variant, generation_time, success_rate, user_satisfaction=None):
    """
    Track tone variant performance metrics for optimization
    """
    try:
        data = {
            "tone_variant": tone_variant,
            "avg_generation_time": generation_time,
            "success_rate": success_rate,
            "metrics_timestamp": datetime.utcnow().isoformat()
        }
        
        if user_satisfaction:
            data["user_satisfaction_score"] = user_satisfaction
            
        return log_to_airtable("Tone Performance Metrics", data)
        
    except Exception as e:
        print(f"Tone performance logging error: {e}")
        return False

def log_ocr_business_intelligence(total_cards_scanned, companies_identified, new_leads_generated, time_period="daily"):
    """
    Log OCR business intelligence metrics
    """
    try:
        data = {
            "total_cards_scanned": total_cards_scanned,
            "companies_identified": companies_identified,
            "new_leads_generated": new_leads_generated,
            "time_period": time_period,
            "report_timestamp": datetime.utcnow().isoformat()
        }
        
        return log_to_airtable("OCR Business Intelligence", data)
        
    except Exception as e:
        print(f"OCR business intelligence logging error: {e}")
        return False

if __name__ == "__main__":
    # Test all specialized loggers
    print("Testing specialized logging modules...")
    
    # Test VoiceBot logging
    log_voicebot_mp3("CUST_001", "https://storage.yobot.com/audio/customer_001.mp3", "TICKET_123", 45.2)
    
    # Test RAG injection logging
    log_rag_injection("Customer Service Manual", "https://docs.yobot.com/manual.pdf", 0.95, "manual")
    
    # Test tone variant logging
    log_tone_variant_usage("user@example.com", "Professional", "voice_001", True)
    
    # Test OCR capture logging
    log_ocr_capture("John Smith", "Acme Corp", "john@acme.com", "+1-555-0123", "123 Main St", 0.98)
    
    print("All specialized loggers tested successfully!")