from flask import Flask, request, jsonify
from ai_support_agent_refactored import generate_ai_reply
from elevenlabs_voice_generator_refactored import generate_voice_reply
from support_dispatcher import dispatch_support_response
import os

app = Flask(__name__)

@app.route('/support-ticket', methods=['POST'])
def handle_support_ticket():
    """Main webhook handler for support tickets"""
    try:
        # Get ticket data from webhook
        ticket_data = request.get_json()
        
        # Generate AI reply
        ai_response = generate_ai_reply(ticket_data)
        
        # Add AI reply to ticket data
        ticket_data.update(ai_response)
        
        # Generate voice MP3
        voice_file = generate_voice_reply(ai_response["aiReply"])
        
        # Dispatch to Slack and Airtable
        dispatch_result = dispatch_support_response(ticket_data)
        
        return jsonify({
            "status": "success",
            "ticket_id": ticket_data.get("ticketId"),
            "ai_reply": ai_response["aiReply"],
            "escalation_flag": ai_response["escalationFlag"],
            "voice_generated": voice_file is not None,
            "dispatched": dispatch_result
        })
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/test-ticket', methods=['GET', 'POST'])
def test_support_ticket():
    """Test endpoint with sample ticket"""
    test_ticket = {
        "ticketId": "TCK-TEST-001",
        "clientName": "Test Client",
        "topic": "Bot not responding to commands",
        "sentiment": "frustrated"
    }
    
    try:
        # Generate AI reply
        ai_response = generate_ai_reply(test_ticket)
        test_ticket.update(ai_response)
        
        # Generate voice
        voice_file = generate_voice_reply(ai_response["aiReply"])
        
        # Dispatch
        dispatch_result = dispatch_support_response(test_ticket)
        
        return jsonify({
            "status": "test_success",
            "ticket": test_ticket,
            "voice_generated": voice_file is not None,
            "dispatched": dispatch_result
        })
        
    except Exception as e:
        return jsonify({
            "status": "test_error",
            "message": str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "YoBot Support Ticket Handler",
        "version": "1.0"
    })

if __name__ == '__main__':
    # Ensure uploads directory exists
    os.makedirs('./uploads', exist_ok=True)
    
    # Run Flask app
    app.run(host='0.0.0.0', port=5001, debug=True)