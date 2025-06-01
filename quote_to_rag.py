#!/usr/bin/env python3
"""
Quote Signing RAG Memory Injection
Injects quote signature data into RAG knowledge base for future AI conversations
"""

import os
import requests
import json
from datetime import datetime

def inject_quote_to_rag(name, quote_id, amount, timestamp):
    """
    Inject quote signing information into RAG knowledge base
    """
    try:
        rag_index_url = os.getenv("RAG_INDEX_URL")
        rag_api_key = os.getenv("RAG_API_KEY")
        
        if not rag_index_url or not rag_api_key:
            print("RAG service credentials not configured")
            return False
            
        # Format timestamp if not provided
        if not timestamp:
            timestamp = datetime.now().isoformat()
            
        headers = {
            "Authorization": f"Bearer {rag_api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "source": "Quote Engine",
            "reference_id": str(quote_id),
            "content": f"{name} signed Quote #{quote_id} for ${amount:,.2f} at {timestamp}. This customer has completed the sales process and signed their quote successfully.",
            "metadata": {
                "customer_name": name,
                "quote_id": quote_id,
                "amount": amount,
                "timestamp": timestamp,
                "event_type": "quote_signed",
                "status": "completed"
            },
            "tags": ["quote", "sales", "signed", "customer", "completed"],
            "timestamp": timestamp,
            "priority": "high",
            "category": "sales_event"
        }
        
        response = requests.post(
            rag_index_url,
            headers=headers,
            json=payload,
            timeout=10
        )
        
        if response.status_code == 200:
            print(f"Quote data injected into RAG for {name}")
            return True
        else:
            print(f"Failed to inject quote into RAG: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"Error injecting quote into RAG: {e}")
        return False

def format_quote_summary(name, quote_id, amount, timestamp):
    """
    Format quote information for RAG injection
    """
    date_formatted = datetime.fromisoformat(timestamp.replace('Z', '+00:00')).strftime('%B %d, %Y at %I:%M %p')
    
    return f"""
    Quote Signature Event:
    - Customer: {name}
    - Quote ID: {quote_id}
    - Amount: ${amount:,.2f}
    - Signed: {date_formatted}
    - Status: Successfully completed
    
    This information can be referenced in future customer interactions to provide context about their purchase history and quote completion.
    """

if __name__ == "__main__":
    # Test the function
    inject_quote_to_rag("Mike Johnson", "Q-2025-003", 12000.00, datetime.now().isoformat())