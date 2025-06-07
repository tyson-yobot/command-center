#!/usr/bin/env python3
"""
Logging Dashboard Integration
Integrates all specialized loggers with the Command Center dashboard
"""

from specialized_loggers import (
    log_voicebot_mp3,
    log_rag_injection,
    log_tone_variant_usage,
    log_ocr_capture
)
from universal_webhook_logger import log_to_airtable
from datetime import datetime
import requests
import os

def update_command_center_metrics():
    """
    Push real-time logging metrics to Command Center dashboard
    """
    try:
        command_center_url = os.getenv("COMMAND_CENTER_URL")
        
        if not command_center_url:
            return False
            
        # Aggregate today's logging activity
        today = datetime.now().strftime("%Y-%m-%d")
        
        metrics = {
            "voicebot_interactions": get_daily_count("VoiceBot Logs", today),
            "rag_injections": get_daily_count("RAG Injection Tracker", today),
            "tone_variants_used": get_daily_count("Tone Logs", today),
            "ocr_captures": get_daily_count("OCR Logs", today),
            "last_updated": datetime.utcnow().isoformat()
        }
        
        response = requests.post(
            f"{command_center_url}/update-logging-metrics",
            json=metrics,
            timeout=10
        )
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"Command Center metrics update error: {e}")
        return False

def get_daily_count(table_name, date):
    """
    Get count of records for a specific date from Airtable
    """
    try:
        # This would normally query Airtable for actual counts
        # Using sample data for demonstration
        sample_counts = {
            "VoiceBot Logs": 23,
            "RAG Injection Tracker": 8,
            "Tone Logs": 42,
            "OCR Logs": 15
        }
        return sample_counts.get(table_name, 0)
        
    except Exception as e:
        print(f"Daily count retrieval error: {e}")
        return 0

def create_logging_alert(alert_type, message, severity="info"):
    """
    Create alerts for logging system issues
    """
    try:
        alert_data = {
            "alert_type": alert_type,
            "message": message,
            "severity": severity,
            "created_at": datetime.utcnow().isoformat()
        }
        
        return log_to_airtable("System Alerts", alert_data)
        
    except Exception as e:
        print(f"Alert creation error: {e}")
        return False

def monitor_logging_health():
    """
    Monitor health of all logging systems
    """
    try:
        health_status = {
            "voicebot_logger": test_logger_connection("VoiceBot Logs"),
            "rag_logger": test_logger_connection("RAG Injection Tracker"),
            "tone_logger": test_logger_connection("Tone Logs"),
            "ocr_logger": test_logger_connection("OCR Logs"),
            "universal_logger": test_logger_connection("System Events"),
            "checked_at": datetime.utcnow().isoformat()
        }
        
        # Log health status
        log_to_airtable("Logging Health Monitor", health_status)
        
        # Create alerts for any failed loggers
        for logger, status in health_status.items():
            if logger != "checked_at" and not status:
                create_logging_alert(
                    alert_type="logger_failure",
                    message=f"{logger} is not responding",
                    severity="warning"
                )
        
        return health_status
        
    except Exception as e:
        print(f"Logging health monitoring error: {e}")
        return None

def test_logger_connection(table_name):
    """
    Test connection to specific logging table
    """
    try:
        test_data = {
            "test": True,
            "table": table_name,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Attempt to log test data
        return log_to_airtable(f"{table_name}_Health_Test", test_data)
        
    except Exception as e:
        print(f"Logger connection test failed for {table_name}: {e}")
        return False

def generate_daily_logging_report():
    """
    Generate comprehensive daily logging report
    """
    try:
        today = datetime.now().strftime("%Y-%m-%d")
        
        report = {
            "report_date": today,
            "total_voicebot_interactions": get_daily_count("VoiceBot Logs", today),
            "total_rag_injections": get_daily_count("RAG Injection Tracker", today),
            "total_tone_variants": get_daily_count("Tone Logs", today),
            "total_ocr_captures": get_daily_count("OCR Logs", today),
            "most_used_tone": get_most_used_tone(today),
            "top_rag_source": get_top_rag_source(today),
            "ocr_accuracy_rate": calculate_ocr_accuracy(today),
            "report_generated_at": datetime.utcnow().isoformat()
        }
        
        # Log the daily report
        log_to_airtable("Daily Logging Reports", report)
        
        return report
        
    except Exception as e:
        print(f"Daily report generation error: {e}")
        return None

def get_most_used_tone(date):
    """
    Get the most frequently used voice tone for the day
    """
    # This would query actual data from Airtable
    # Using sample data for demonstration
    return "Professional"

def get_top_rag_source(date):
    """
    Get the top source for RAG injections
    """
    # This would query actual data from Airtable
    # Using sample data for demonstration
    return "Customer Support Documents"

def calculate_ocr_accuracy(date):
    """
    Calculate average OCR accuracy for the day
    """
    # This would calculate from actual OCR confidence scores
    # Using sample data for demonstration
    return 0.94

if __name__ == "__main__":
    print("Testing logging dashboard integration...")
    
    # Test Command Center metrics update
    update_command_center_metrics()
    
    # Test logging health monitoring
    health = monitor_logging_health()
    print(f"Logging health status: {health}")
    
    # Generate daily report
    report = generate_daily_logging_report()
    print(f"Daily report generated: {report}")
    
    print("Dashboard integration testing completed!")