from ai_support_agent_refactored import generate_ai_reply
from elevenlabs_voice_generator_refactored import generate_voice_reply
from support_dispatcher import dispatch_support_response

# === SAMPLE TICKET ===
ticket = {
    "ticketId": "TCK-2001",
    "clientName": "Tina Sanchez",
    "topic": "Voice bot loops back to intro",
    "sentiment": "Frustrated"
}

# === RUN FULL FLOW ===
print("🔄 Generating AI reply...")
ai_result = generate_ai_reply(ticket)

ticket.update(ai_result)

print("🔄 Generating MP3...")
mp3_path = generate_voice_reply(ticket["aiReply"])

if mp3_path:
    print("📤 Dispatching to Slack + Airtable...")
    dispatch_support_response(ticket)
else:
    print("❌ MP3 generation failed. Ticket logged to fallback log.")

print(f"✅ Support ticket {ticket['ticketId']} processed successfully!")
print(f"AI Reply: {ticket.get('aiReply', 'No reply generated')}")
print(f"Escalation Flag: {ticket.get('escalationFlag', False)}")