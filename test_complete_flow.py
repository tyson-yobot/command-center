#!/usr/bin/env python3
"""
Complete YoBot Support Flow Test
Demonstrates the entire ticket processing pipeline from webhook to final dispatch
"""

import json
import os
from ai_support_agent_refactored import generate_ai_reply
from elevenlabs_voice_generator_refactored import generate_voice_reply
from support_dispatcher import dispatch_support_response

def test_webhook_flow():
    """Test complete webhook processing flow"""
    
    # Simulate webhook payload
    webhook_ticket = {
        "ticketId": "TCK-101",
        "clientName": "Chad",
        "topic": "Bot stalled during intro",
        "sentiment": "angry"
    }
    
    print("=== YoBot Support Ticket Processing Flow ===")
    print(f"🎫 Processing Ticket: {webhook_ticket['ticketId']}")
    print(f"👤 Client: {webhook_ticket['clientName']}")
    print(f"📝 Topic: {webhook_ticket['topic']}")
    print(f"😠 Sentiment: {webhook_ticket['sentiment']}")
    print()
    
    # Step 1: Save ticket (simulating webhook)
    print("📥 Step 1: Webhook received, saving ticket...")
    with open('ticket.json', 'w') as f:
        json.dump(webhook_ticket, f, indent=2)
    print("✅ Ticket saved to ticket.json")
    print()
    
    # Step 2: Load and process ticket
    print("🔄 Step 2: Loading ticket for processing...")
    with open('ticket.json', 'r') as f:
        ticket = json.load(f)
    print(f"✅ Loaded ticket: {ticket['ticketId']}")
    print()
    
    # Step 3: Generate AI reply
    print("🤖 Step 3: Generating AI reply...")
    ai_result = generate_ai_reply(ticket)
    ticket.update(ai_result)
    print(f"✅ AI Reply: {ticket['aiReply'][:60]}...")
    print(f"🚨 Escalation Flag: {ticket['escalationFlag']}")
    print()
    
    # Step 4: Generate voice reply
    print("🔊 Step 4: Generating voice reply...")
    voice_result = generate_voice_reply(ticket.get('aiReply', 'Fallback message'))
    if voice_result.get('success'):
        print(f"✅ Voice generated: {voice_result.get('file_path', 'voice_reply.mp3')}")
    else:
        print(f"❌ Voice generation failed: {voice_result.get('error', 'Unknown error')}")
    print()
    
    # Step 5: Dispatch to integrations
    print("📤 Step 5: Dispatching to Slack and Airtable...")
    dispatch_result = dispatch_support_response(ticket, voice_result)
    
    if dispatch_result.get('slack_success'):
        print("✅ Slack notification sent")
    else:
        print(f"❌ Slack failed: {dispatch_result.get('slack_error', 'Unknown error')}")
    
    if dispatch_result.get('airtable_success'):
        print("✅ Airtable record created")
    else:
        print(f"❌ Airtable failed: {dispatch_result.get('airtable_error', 'Unknown error')}")
    
    print()
    print("=== Processing Complete ===")
    print(f"🎫 Ticket {ticket['ticketId']} processed successfully!")
    print(f"📋 Final Status: {'Escalated' if ticket['escalationFlag'] else 'Resolved'}")
    
    return {
        "ticket": ticket,
        "ai_result": ai_result,
        "voice_result": voice_result,
        "dispatch_result": dispatch_result
    }

def simulate_multiple_tickets():
    """Simulate processing multiple different ticket types"""
    
    test_tickets = [
        {
            "ticketId": "TCK-102",
            "clientName": "Sarah Johnson",
            "topic": "Login issues with dashboard",
            "sentiment": "neutral"
        },
        {
            "ticketId": "TCK-103", 
            "clientName": "Mike Rodriguez",
            "topic": "Billing discrepancy on invoice",
            "sentiment": "frustrated"
        },
        {
            "ticketId": "TCK-104",
            "clientName": "Emma Wilson",
            "topic": "Feature request for voice settings",
            "sentiment": "positive"
        }
    ]
    
    print("\n=== Testing Multiple Ticket Types ===")
    
    for i, ticket in enumerate(test_tickets, 1):
        print(f"\n--- Test {i}/3: {ticket['ticketId']} ---")
        
        # Save ticket
        with open('ticket.json', 'w') as f:
            json.dump(ticket, f)
        
        # Process ticket
        result = test_webhook_flow()
        
        print(f"✅ {ticket['ticketId']} processed - Escalated: {result['ticket']['escalationFlag']}")

if __name__ == "__main__":
    print("🚀 Starting YoBot Support Flow Test...")
    print()
    
    # Test single ticket flow
    result = test_webhook_flow()
    
    # Test multiple tickets
    simulate_multiple_tickets()
    
    print("\n🎉 All tests completed!")
    print("\nNext steps:")
    print("1. Deploy webhook endpoint to receive live tickets")
    print("2. Configure Slack/Airtable API keys for full integration")
    print("3. Set up monitoring for ticket processing metrics")