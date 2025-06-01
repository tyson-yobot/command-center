#!/usr/bin/env python3
"""
Stripe Webhook Handler
Coordinates all Stripe payment automation: QBO recording, Airtable logging, and Slack alerts
"""

from flask import Flask, request, jsonify
import os
import json
from datetime import datetime
import traceback

# Import automation modules
from stripe_to_qbo import record_stripe_payment
from stripe_to_airtable import log_stripe_to_airtable, log_stripe_metrics
from stripe_slack_alert import send_stripe_payment_alert

app = Flask(__name__)

@app.route("/stripe-webhook", methods=["POST"])
def stripe_webhook():
    """
    Handle Stripe webhook events and trigger all automation workflows
    """
    try:
        data = request.json
        
        # Handle payment_intent.succeeded events
        if data.get('type') == 'payment_intent.succeeded':
            payment_intent = data['data']['object']
            
            # Extract payment details
            amount = payment_intent['amount'] / 100  # Convert from cents
            customer_email = payment_intent.get('receipt_email', '')
            payment_id = payment_intent['id']
            timestamp = datetime.now().isoformat()
            
            # Get invoice ID from metadata if available
            invoice_id = payment_intent.get('metadata', {}).get('invoice_id')
            
            # Execute all automation workflows
            results = {}
            
            # 1. Send Slack alert
            try:
                results['slack_alert'] = send_stripe_payment_alert(customer_email, amount)
            except Exception as e:
                results['slack_alert'] = False
                print(f"Slack alert failed: {e}")
                
            # 2. Log to Airtable payments table
            try:
                results['airtable_logged'] = log_stripe_to_airtable(customer_email, amount, payment_id, timestamp)
            except Exception as e:
                results['airtable_logged'] = False
                print(f"Airtable logging failed: {e}")
                
            # 3. Log to metrics tracker
            try:
                results['metrics_logged'] = log_stripe_metrics(customer_email, amount, payment_id, timestamp)
            except Exception as e:
                results['metrics_logged'] = False
                print(f"Metrics logging failed: {e}")
                
            # 4. Record payment in QuickBooks (if invoice ID is available)
            if invoice_id:
                try:
                    results['qbo_recorded'] = record_stripe_payment(invoice_id, amount, customer_email)
                except Exception as e:
                    results['qbo_recorded'] = False
                    print(f"QuickBooks recording failed: {e}")
            else:
                results['qbo_recorded'] = "skipped - no invoice_id"
            
            print(f"Stripe payment processed: {payment_id} - ${amount:,.2f} from {customer_email}")
            
            return jsonify({
                "status": "success",
                "payment_id": payment_id,
                "amount": amount,
                "customer": customer_email,
                "timestamp": timestamp,
                "automation_results": results
            }), 200
            
        # Handle other Stripe events
        elif data.get('type') == 'invoice.payment_succeeded':
            invoice = data['data']['object']
            
            amount = invoice['amount_paid'] / 100
            customer_email = invoice['customer_email']
            invoice_id = invoice['id']
            timestamp = datetime.now().isoformat()
            
            # Execute automation workflows for invoice payments
            send_stripe_payment_alert(customer_email, amount)
            log_stripe_to_airtable(customer_email, amount, invoice_id, timestamp)
            log_stripe_metrics(customer_email, amount, invoice_id, timestamp)
            
            return jsonify({
                "status": "success", 
                "type": "invoice_payment",
                "amount": amount,
                "customer": customer_email
            }), 200
            
        else:
            event_type = data.get('type', 'unknown')
            print(f"Unhandled Stripe event type: {event_type}")
            return jsonify({
                "status": "ignored", 
                "event_type": event_type
            }), 200
        
    except Exception as e:
        error_msg = f"Error processing Stripe webhook: {str(e)}"
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
        "service": "Stripe Webhook Handler",
        "timestamp": datetime.now().isoformat()
    }), 200

@app.route("/test-stripe-payment", methods=["POST"])
def test_stripe_payment():
    """Test endpoint for Stripe payment automation"""
    test_data = {
        "type": "payment_intent.succeeded",
        "data": {
            "object": {
                "id": f"pi_test_{datetime.now().strftime('%Y%m%d%H%M%S')}",
                "amount": 500000,  # $5000.00 in cents
                "receipt_email": "customer@example.com",
                "metadata": {
                    "invoice_id": "INV-TEST-001"
                }
            }
        }
    }
    
    # Forward to main webhook handler
    request.json = test_data
    return stripe_webhook()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5003))
    app.run(host="0.0.0.0", port=port, debug=True)