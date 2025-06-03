#!/usr/bin/env python3
"""
Simple webhook test server to validate YoBot support ticket processing
"""

from flask import Flask, request, jsonify
import json
import subprocess
import os

app = Flask(__name__)

@app.route('/webhook', methods=['POST'])
def webhook_handler():
    """Handle incoming support ticket webhooks"""
    try:
        ticket = request.get_json()
        print(f"🔥 Webhook received: {ticket}")
        
        # Validate required fields
        if not ticket or not ticket.get('ticketId') or not ticket.get('clientName') or not ticket.get('topic'):
            return jsonify({
                "error": "Missing required fields",
                "required": ["ticketId", "clientName", "topic"]
            }), 400
        
        # Save ticket to file for Python processing
        with open('ticket.json', 'w') as f:
            json.dump(ticket, f)
        
        # Trigger Python support dispatcher
        result = subprocess.run(['python', 'run_yobot_support.py'], 
                              capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print("✅ Support processing completed successfully")
            print(result.stdout)
            return jsonify({
                "status": "success",
                "message": "Ticket processed successfully",
                "ticketId": ticket['ticketId'],
                "output": result.stdout
            })
        else:
            print(f"❌ Support processing failed: {result.stderr}")
            return jsonify({
                "status": "error",
                "message": "Ticket processing failed",
                "error": result.stderr
            }), 500
            
    except subprocess.TimeoutExpired:
        return jsonify({
            "status": "error",
            "message": "Ticket processing timeout"
        }), 500
    except Exception as e:
        print(f"❌ Webhook error: {e}")
        return jsonify({
            "status": "error",
            "message": f"Webhook processing failed: {str(e)}"
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "YoBot Support Webhook"
    })

if __name__ == '__main__':
    print("🎧 Starting YoBot Support Webhook Server...")
    app.run(host='0.0.0.0', port=8080, debug=True)