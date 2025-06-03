import os
from openai import OpenAI

# === SETUP ===
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# === TRIGGERS ===
ESCALATION_KEYWORDS = ["angry", "cancel", "lawsuit", "not working", "refund"]
NEGATIVE_SENTIMENTS = ["frustrated", "angry", "upset", "disappointed"]

# === MAIN FUNCTION ===
def generate_ai_reply(ticket):
    try:
        prompt = f"""
Respond professionally to this support issue:

Client: {ticket['clientName']}
Topic: {ticket['topic']}
Sentiment: {ticket['sentiment']}

Give a concise but helpful reply:
"""

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are YoBot's support AI, friendly and helpful."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.6,
            max_tokens=250
        )

        ai_reply = response.choices[0].message.content

        # Escalation check
        escalation_flag = (
            any(word in (ai_reply or "").lower() for word in ESCALATION_KEYWORDS)
            or (ticket.get("sentiment", "").lower() in NEGATIVE_SENTIMENTS)
        )

        return {
            "aiReply": ai_reply,
            "escalationFlag": escalation_flag
        }

    except Exception as e:
        print(f"[AI Agent Error] {e}")
        return {
            "aiReply": "We're looking into your issue and will follow up shortly.",
            "escalationFlag": True
        }

def test_ai_support_agent():
    """Test AI support agent with sample ticket"""
    test_ticket = {
        "clientName": "Test User",
        "topic": "Bot not responding",
        "sentiment": "frustrated"
    }
    
    result = generate_ai_reply(test_ticket)
    return result is not None and "aiReply" in result

if __name__ == "__main__":
    test_ai_support_agent()