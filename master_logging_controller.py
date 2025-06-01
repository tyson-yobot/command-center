#!/usr/bin/env python3
"""
Master Logging Controller
Orchestrates all specialized loggers with existing webhook infrastructure
"""

from flask import Flask, request, jsonify
import os
from datetime import datetime
import traceback

# Import all specialized loggers
from universal_webhook_logger import log_to_airtable, quick_log
from specialized_loggers import (
    log_voicebot_mp3,
    log_rag_injection, 
    log_tone_variant_usage,
    log_ocr_capture
)
from advanced_specialized_loggers import (
    log_pdf_generation,
    log_stripe_webhook_event,
    log_revenue_recognition,
    log_voice_escalation
)
from logging_dashboard_integration import (
    update_command_center_metrics,
    monitor_logging_health,
    generate_daily_logging_report
)

app = Flask(__name__)

@app.route("/log-voicebot", methods=["POST"])
def handle_voicebot_logging():
    """Handle VoiceBot interaction logging"""
    try:
        data = request.json
        
        success = log_voicebot_mp3(
            customer_id=data.get("customer_id"),
            mp3_url=data.get("mp3_url"),
            ticket_id=data.get("ticket_id"),
            duration=data.get("duration")
        )
        
        return jsonify({"success": success, "logged_to": "VoiceBot Logs"})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/log-rag-injection", methods=["POST"])
def handle_rag_injection_logging():
    """Handle RAG document injection logging"""
    try:
        data = request.json
        
        success = log_rag_injection(
            doc_name=data.get("doc_name"),
            source_url=data.get("source_url"),
            rag_score=data.get("confidence", 0.0),
            doc_type=data.get("doc_type", "document")
        )
        
        return jsonify({"success": success, "logged_to": "RAG Injection Tracker"})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/log-tone-usage", methods=["POST"])
def handle_tone_usage_logging():
    """Handle voice tone variant logging"""
    try:
        data = request.json
        
        success = log_tone_variant_usage(
            user_email=data.get("user_email"),
            tone_used=data.get("tone"),
            voice_id=data.get("voice_id"),
            generation_success=data.get("success", True)
        )
        
        return jsonify({"success": success, "logged_to": "Tone Logs"})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/log-ocr-capture", methods=["POST"])
def handle_ocr_logging():
    """Handle OCR business card capture logging"""
    try:
        data = request.json
        
        success = log_ocr_capture(
            name=data.get("name"),
            company=data.get("company"),
            email=data.get("email"),
            phone=data.get("phone"),
            address=data.get("address"),
            confidence=data.get("confidence")
        )
        
        return jsonify({"success": success, "logged_to": "OCR Logs"})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/log-pdf-generation", methods=["POST"])
def handle_pdf_logging():
    """Handle PDF document generation logging"""
    try:
        data = request.json
        
        success = log_pdf_generation(
            customer_id=data.get("customer_id"),
            doc_type=data.get("doc_type"),
            pdf_url=data.get("pdf_url"),
            file_size=data.get("file_size"),
            generation_time=data.get("generation_time")
        )
        
        return jsonify({"success": success, "logged_to": "PDF Tracker"})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/log-stripe-event", methods=["POST"])
def handle_stripe_logging():
    """Handle Stripe webhook event logging"""
    try:
        data = request.json
        event = data.get("stripe_event", {})
        
        if event.get("type") == "payment_intent.succeeded":
            payment_intent = event["data"]["object"]
            
            success = log_stripe_webhook_event(
                customer_email=payment_intent.get("receipt_email", ""),
                amount_cents=payment_intent.get("amount", 0),
                status=payment_intent.get("status", ""),
                event_type=event.get("type"),
                stripe_event_id=event.get("id")
            )
            
            # Also log revenue recognition
            if payment_intent.get("status") == "succeeded":
                log_revenue_recognition(
                    invoice_id=payment_intent.get("id"),
                    amount_paid_cents=payment_intent.get("amount", 0),
                    customer_email=payment_intent.get("receipt_email"),
                    payment_method="card"
                )
            
            return jsonify({"success": success, "logged_to": "Stripe Events"})
        
        return jsonify({"message": "Event type not handled"})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/log-voice-escalation", methods=["POST"])
def handle_voice_escalation_logging():
    """Handle voice escalation event logging"""
    try:
        data = request.json
        
        success = log_voice_escalation(
            ticket_id=data.get("ticket_id"),
            escalation_reason=data.get("reason"),
            voice_call_url=data.get("call_url"),
            customer_phone=data.get("phone"),
            priority_level=data.get("priority", "high")
        )
        
        return jsonify({"success": success, "logged_to": "Voice Escalations"})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/universal-log", methods=["POST"])
def handle_universal_logging():
    """Universal logging endpoint for any module"""
    try:
        data = request.json
        table_name = data.get("table")
        log_data = data.get("data", {})
        
        if not table_name:
            return jsonify({"error": "table name required"}), 400
        
        success = log_to_airtable(table_name, log_data)
        
        return jsonify({
            "success": success, 
            "logged_to": table_name,
            "timestamp": datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/logging-health", methods=["GET"])
def check_logging_health():
    """Check health status of all logging systems"""
    try:
        health_status = monitor_logging_health()
        
        return jsonify({
            "status": "healthy" if all(health_status.values()) else "degraded",
            "details": health_status,
            "checked_at": datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/update-metrics", methods=["POST"])
def update_dashboard_metrics():
    """Update Command Center dashboard with latest metrics"""
    try:
        success = update_command_center_metrics()
        
        return jsonify({
            "success": success,
            "updated_at": datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/daily-report", methods=["GET"])
def get_daily_report():
    """Generate and return daily logging report"""
    try:
        report = generate_daily_logging_report()
        
        return jsonify({
            "report": report,
            "generated_at": datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/bulk-log", methods=["POST"])
def handle_bulk_logging():
    """Handle bulk logging operations"""
    try:
        data = request.json
        events = data.get("events", [])
        results = []
        
        for event in events:
            table = event.get("table")
            event_data = event.get("data", {})
            
            if table and event_data:
                success = log_to_airtable(table, event_data)
                results.append({
                    "table": table,
                    "success": success
                })
        
        return jsonify({
            "total_events": len(events),
            "results": results,
            "processed_at": datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/health", methods=["GET"])
def health_check():
    """Health check for the master logging controller"""
    return jsonify({
        "status": "healthy",
        "service": "Master Logging Controller",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5005))
    app.run(host="0.0.0.0", port=port, debug=True)