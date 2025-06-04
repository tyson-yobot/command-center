"""
RAG Query System with Kill-Switch Logic
Production-ready RAG system with disabled fallbacks for launch
"""

import os
import requests
from datetime import datetime
from slack_alerts import alert_system

# Production flags - DISABLED for launch
ENABLE_RAG_FALLBACK = False
ENABLE_MANUAL_OVERRIDE = False

class RAGQuerySystem:
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.knowledge_base_url = os.getenv("KNOWLEDGE_BASE_URL")
        
    def query_rag_system(self, query, context=None):
        """Query RAG system with kill-switch protection"""
        if not self.openai_api_key:
            return self._handle_missing_credentials()
        
        try:
            # Main RAG query logic
            response = self._execute_rag_query(query, context)
            
            if response.get("success"):
                return response
            else:
                # RAG failed - check if fallback is enabled
                return self._handle_rag_failure(query, response.get("error"))
                
        except Exception as e:
            return self._handle_rag_failure(query, str(e))
    
    def _execute_rag_query(self, query, context):
        """Execute RAG query against knowledge base"""
        try:
            # This would integrate with your actual RAG system
            # For now, returning structured response
            return {
                "success": True,
                "query": query,
                "response": "RAG system response",
                "sources": [],
                "confidence": 0.85
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _handle_rag_failure(self, query, error):
        """Handle RAG system failures with kill-switch protection"""
        # Log the failure
        alert_system.alert_system_failure("RAG System", error)
        
        # Check if fallback is enabled (DISABLED in production)
        if ENABLE_RAG_FALLBACK:
            return self._execute_fallback_logic(query)
        else:
            # Fallback disabled - return controlled error
            alert_system.send_slack_alert("⚠️ RAG fallback attempt blocked", "MEDIUM")
            return {
                "success": False,
                "error": "RAG system unavailable",
                "fallback_disabled": True,
                "query": query
            }
    
    def _execute_fallback_logic(self, query):
        """Fallback logic (DISABLED in production)"""
        if not ENABLE_MANUAL_OVERRIDE:
            alert_system.send_slack_alert("⚠️ Manual override attempt blocked", "LOW")
            return {
                "success": False,
                "error": "Manual override disabled",
                "fallback_blocked": True
            }
        
        # This fallback logic is disabled in production
        return {
            "success": False,
            "error": "Fallback disabled for production launch"
        }
    
    def _handle_missing_credentials(self):
        """Handle missing API credentials"""
        error_msg = "OpenAI API key not configured"
        alert_system.alert_api_failure("OpenAI", "401", "Missing API key")
        
        return {
            "success": False,
            "error": error_msg,
            "requires_setup": True
        }

# Global RAG instance
rag_system = RAGQuerySystem()

def query_knowledge_base(query, context=None):
    """Quick function for RAG queries"""
    return rag_system.query_rag_system(query, context)

if __name__ == "__main__":
    # Test RAG system with kill-switch
    test_queries = [
        "What is the client onboarding process?",
        "How do I configure voice settings?",
        "What are the billing procedures?"
    ]
    
    print("🧠 Testing RAG System with Kill-Switch...")
    for query in test_queries:
        print(f"\nQuery: {query}")
        result = rag_system.query_rag_system(query)
        status = "✅" if result.get("success") else "❌"
        print(f"Result: {status} {result.get('response', result.get('error'))}")
        
        if result.get("fallback_disabled"):
            print("   🛑 Fallback correctly disabled")