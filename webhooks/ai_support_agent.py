#!/usr/bin/env python3
"""
AI Support Agent - Command Line Version
Generates AI replies for support tickets via command line arguments
"""

import sys
import json
import os
import openai

# Configure OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

ESCALATION_KEYWORDS = ["angry", "cancel", "lawsuit", "not working", "refund"]
NEGATIVE_SENTIMENTS = ["frustrated", "angry", "upset", "disappointed"]

def generate_ai_reply(ticket):
    """Generate AI reply for support ticket"""
    try:
        prompt = f"""
Respond professionally to this support issue:

Client: {ticket['clientName']}
Topic: {ticket['topic']}
Sentiment: {ticket['sentiment']}

Give a concise but helpful reply:
"""
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are YoBot's support AI, friendly and helpful."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.6,
            max_tokens=250
        )

        ai_reply = response['choices'][0]['message']['content']
        escalation_flag = (
            any(word in ai_reply.lower() for word in ESCALATION_KEYWORDS)
            or ticket["sentiment"].lower() in NEGATIVE_SENTIMENTS
        )

        return ai_reply

    except Exception as e:
        # Return fallback reply for API errors
        return "We're looking into your issue and will follow up shortly."

if __name__ == "__main__":
    if len(sys.argv) > 1:
        try:
            ticket_data = json.loads(sys.argv[1])
            reply = generate_ai_reply(ticket_data)
            print(reply)
        except json.JSONDecodeError:
            print("We're looking into your issue and will follow up shortly.")
        except Exception:
            print("We're looking into your issue and will follow up shortly.")
    else:
        print("We're looking into your issue and will follow up shortly.")