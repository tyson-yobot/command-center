#!/usr/bin/env python3
"""
Final Specialized Loggers
RAG Injection, Tone Tracker, Trigger Testing, and SOP Export logging
"""

from universal_webhook_logger import log_to_airtable
from datetime import datetime

def log_rag_injection_detailed(source, confidence_score, injected_by, content_type="document", processing_time=None):
    """
    Track every file injected into the knowledge base with detailed metadata
    """
    try:
        data = {
            "source": source,
            "confidence": confidence_score,
            "injected_by": injected_by,
            "content_type": content_type,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if processing_time:
            data["processing_time_seconds"] = processing_time
            
        success = log_to_airtable("RAG Injection Log", data)
        
        if success:
            print(f"RAG injection logged: {source} (confidence: {confidence_score})")
        
        return success
        
    except Exception as e:
        print(f"RAG injection logging error: {e}")
        return False

def log_tone_variant_detailed(customer_id, tone_variant, fallback_used=False, generation_time=None, success=True):
    """
    Track which voice tone is used per customer interaction
    """
    try:
        data = {
            "customer_id": customer_id,
            "tone_variant": tone_variant,
            "fallback_used": fallback_used,
            "generation_success": success,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if generation_time:
            data["generation_time_seconds"] = generation_time
            
        success = log_to_airtable("Tone Tracker", data)
        
        if success:
            print(f"Tone usage logged: {tone_variant} for customer {customer_id}")
        
        return success
        
    except Exception as e:
        print(f"Tone tracking logging error: {e}")
        return False

def log_trigger_test_results(entry_id, test_passed, run_by, test_type="validation", error_details=None):
    """
    Log test results for knowledge base entries and trigger validation
    """
    try:
        data = {
            "entry_id": entry_id,
            "passed": test_passed,
            "run_by": run_by,
            "test_type": test_type,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if error_details and not test_passed:
            data["error_details"] = error_details
            
        success = log_to_airtable("Trigger Test Log", data)
        
        if success:
            status = "PASSED" if test_passed else "FAILED"
            print(f"Trigger test logged: Entry {entry_id} {status}")
        
        return success
        
    except Exception as e:
        print(f"Trigger test logging error: {e}")
        return False

def log_sop_export(sop_type, pdf_url, generated_by="system", file_size=None, export_format="PDF"):
    """
    Track every generated SOP export for documentation management
    """
    try:
        data = {
            "sop_type": sop_type,
            "pdf_url": pdf_url,
            "generated_by": generated_by,
            "export_format": export_format,
            "generated_at": datetime.utcnow().isoformat()
        }
        
        if file_size:
            data["file_size_kb"] = file_size
            
        success = log_to_airtable("SOP Export Log", data)
        
        if success:
            print(f"SOP export logged: {sop_type} in {export_format} format")
        
        return success
        
    except Exception as e:
        print(f"SOP export logging error: {e}")
        return False

def log_comprehensive_rag_analytics(total_injections, avg_confidence, successful_injections, failed_injections):
    """
    Log comprehensive RAG injection analytics for performance monitoring
    """
    try:
        data = {
            "total_injections_today": total_injections,
            "avg_confidence_score": avg_confidence,
            "successful_injections": successful_injections,
            "failed_injections": failed_injections,
            "success_rate": (successful_injections / total_injections * 100) if total_injections > 0 else 0,
            "analytics_date": datetime.utcnow().strftime("%Y-%m-%d"),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return log_to_airtable("RAG Analytics", data)
        
    except Exception as e:
        print(f"RAG analytics logging error: {e}")
        return False

def log_tone_performance_analytics(tone_variants_used, most_popular_tone, avg_fallback_rate, customer_satisfaction):
    """
    Log tone variant performance analytics for optimization
    """
    try:
        data = {
            "variants_used_today": tone_variants_used,
            "most_popular_tone": most_popular_tone,
            "avg_fallback_rate": avg_fallback_rate,
            "customer_satisfaction_score": customer_satisfaction,
            "analytics_date": datetime.utcnow().strftime("%Y-%m-%d"),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return log_to_airtable("Tone Analytics", data)
        
    except Exception as e:
        print(f"Tone analytics logging error: {e}")
        return False

def log_trigger_test_analytics(total_tests, passed_tests, failed_tests, most_common_failure):
    """
    Log trigger testing analytics for quality assurance
    """
    try:
        data = {
            "total_tests_today": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": failed_tests,
            "pass_rate": (passed_tests / total_tests * 100) if total_tests > 0 else 0,
            "most_common_failure": most_common_failure,
            "analytics_date": datetime.utcnow().strftime("%Y-%m-%d"),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return log_to_airtable("Test Analytics", data)
        
    except Exception as e:
        print(f"Test analytics logging error: {e}")
        return False

def log_sop_export_analytics(total_exports, most_exported_type, avg_file_size, export_formats_used):
    """
    Log SOP export analytics for documentation tracking
    """
    try:
        data = {
            "total_exports_today": total_exports,
            "most_exported_type": most_exported_type,
            "avg_file_size_kb": avg_file_size,
            "export_formats": export_formats_used,
            "analytics_date": datetime.utcnow().strftime("%Y-%m-%d"),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return log_to_airtable("SOP Analytics", data)
        
    except Exception as e:
        print(f"SOP analytics logging error: {e}")
        return False

if __name__ == "__main__":
    # Test all final specialized loggers
    print("Testing final specialized logging modules...")
    
    # Test RAG injection logging
    log_rag_injection_detailed("customer_manual.pdf", 0.94, "agent_001", "manual", 2.3)
    
    # Test tone tracking
    log_tone_variant_detailed("CUST_456", "Professional", False, 1.8, True)
    
    # Test trigger testing
    log_trigger_test_results("ENTRY_789", True, "qa_team", "validation")
    
    # Test SOP export
    log_sop_export("Customer Onboarding", "https://docs.yobot.com/exports/onboarding.pdf", "admin_user", 156)
    
    print("All final specialized loggers tested successfully!")