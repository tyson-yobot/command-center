import os
import requests

def inject_rag_memory(ticket_id, subject, closed_time, notes=""):
    """
    Inject ticket closure information into RAG knowledge base for future bot conversations
    """
    url = os.getenv("RAG_INDEX_URL")  # e.g. https://voicebot.yobot.bot/api/rag/inject
    api_key = os.getenv('RAG_API_KEY')
    
    if not url or not api_key:
        print("RAG system credentials not configured - cannot inject memory")
        return

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "source": "Zendesk Auto-Close",
        "reference_id": str(ticket_id),
        "content": f"Support ticket #{ticket_id} with subject '{subject}' was automatically closed on {closed_time}. {notes}",
        "tags": ["zendesk", "auto-close", "support", "resolved"],
        "timestamp": closed_time,
        "priority": "low",
        "searchable": True
    }

    try:
        res = requests.post(url, headers=headers, json=payload)
        if res.status_code == 200:
            print(f"✅ RAG memory injected for ticket {ticket_id}")
        else:
            print(f"❌ RAG memory injection failed: {res.status_code}")
    except Exception as e:
        print(f"❌ RAG memory injection error: {e}")

if __name__ == "__main__":
    # Test the RAG memory injection
    from datetime import datetime
    test_time = datetime.utcnow().isoformat() + 'Z'
    inject_rag_memory(
        ticket_id=12345,
        subject="Test ticket subject",
        closed_time=test_time,
        notes="Test injection for RAG memory system"
    )