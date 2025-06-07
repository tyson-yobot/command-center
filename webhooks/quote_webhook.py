#!/usr/bin/env python3
"""
Quote Signing Webhook Handler
Coordinates all quote signing automation: Slack alerts, metrics logging, and RAG injection
"""

from flask import Flask, request, jsonify
import os
from datetime import datetime
import traceback

# Import our automation modules
from quote_slack_alert import send_quote_signed_alert
from quote_to_metrics import log_quote_to_metrics
from quote_to_rag import inject_quote_to_rag

app = Flask(__name__)

@app.route("/quote-signed", methods=["POST"])
def quote_signed():
    """
    Handle quote signing webhook events
    Triggers all automation workflows: Slack, Airtable metrics, and RAG injection
    """
    try:
        data = request.json
        
        # Extract required fields
        name = data.get("name")
        quote_id = data.get("quote_id")
        amount = data.get("amount")
        timestamp = data.get("timestamp")
        
        # Validate required fields
        if not name or not quote_id or not amount:
            return jsonify({
                "error": "Missing required fields: name, quote_id, amount"
            }), 400
            
        # Use current timestamp if not provided
        if not timestamp:
            timestamp = datetime.now().isoformat()
            
        # Convert amount to float if it's a string
        try:
            amount = float(amount)
        except ValueError:
            return jsonify({
                "error": "Amount must be a valid number"
            }), 400
            
        # Execute all automation workflows
        results = {}
        
        # 1. Send Slack alert
        try:
            results['slack_alert'] = send_quote_signed_alert(name, quote_id, amount)
        except Exception as e:
            results['slack_alert'] = False
            print(f"Slack alert failed: {e}")
            
        # 2. Log to metrics tracker
        try:
            results['metrics_logged'] = log_quote_to_metrics(name, quote_id, amount, timestamp)
        except Exception as e:
            results['metrics_logged'] = False
            print(f"Metrics logging failed: {e}")
            
        # 3. Inject into RAG knowledge base
        try:
            results['rag_injected'] = inject_quote_to_rag(name, quote_id, amount, timestamp)
        except Exception as e:
            results['rag_injected'] = False
            print(f"RAG injection failed: {e}")
            
        # Log successful processing
        print(f"Quote signing processed for {name} - Quote #{quote_id} - ${amount:,.2f}")
        
        return jsonify({
            "message": "Quote signing processed successfully",
            "quote_id": quote_id,
            "customer": name,
            "amount": amount,
            "timestamp": timestamp,
            "automation_results": results
        }), 200
        
    except Exception as e:
        error_msg = f"Error processing quote signing webhook: {str(e)}"
        print(error_msg)
        print(traceback.format_exc())
        
        return jsonify({
            "error": error_msg
        }), 500

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Quote Signing Webhook",
        "timestamp": datetime.now().isoformat()
    }), 200

@app.route("/test-quote", methods=["POST"])
def test_quote():
    """Test endpoint for quote signing automation"""
    test_data = {
        "name": "Test Customer",
        "quote_id": f"TEST-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
        "amount": 1000.00,
        "timestamp": datetime.now().isoformat()
    }
    
    # Forward to main quote signing handler
    request.json = test_data
    return quote_signed()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5002))
    app.run(host="0.0.0.0", port=port, debug=True)