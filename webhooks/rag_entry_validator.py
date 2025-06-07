#!/usr/bin/env python3
"""
RAG Entry Validator
Validates RAG entries before injection to ensure data integrity
"""

import os
import requests
from datetime import datetime

def validate_rag_entry(entry):
    """
    Validate RAG entry has all required fields before injection
    """
    required_fields = ["title", "body", "tags"]
    
    # Check if all required fields exist and are not empty
    for field in required_fields:
        if field not in entry:
            print(f"Missing required field: {field}")
            return False
        
        if not entry[field] or (isinstance(entry[field], str) and entry[field].strip() == ""):
            print(f"Empty required field: {field}")
            return False
    
    # Additional validation rules
    if len(entry["title"]) < 3:
        print("Title too short (minimum 3 characters)")
        return False
    
    if len(entry["body"]) < 10:
        print("Body too short (minimum 10 characters)")
        return False
    
    if not isinstance(entry["tags"], list) or len(entry["tags"]) == 0:
        print("Tags must be a non-empty list")
        return False
    
    print(f"RAG entry validation passed: {entry['title']}")
    return True

def sanitize_rag_entry(entry):
    """
    Sanitize and clean RAG entry data
    """
    sanitized = {}
    
    # Clean title
    sanitized["title"] = entry["title"].strip()[:200]  # Max 200 chars
    
    # Clean body
    sanitized["body"] = entry["body"].strip()[:5000]  # Max 5000 chars
    
    # Clean tags
    if isinstance(entry["tags"], list):
        sanitized["tags"] = [tag.strip().lower() for tag in entry["tags"] if tag.strip()]
    else:
        sanitized["tags"] = []
    
    # Copy other fields
    for key, value in entry.items():
        if key not in ["title", "body", "tags"]:
            sanitized[key] = value
    
    return sanitized

def inject_rag_with_validation(entry):
    """
    Inject RAG entry with validation and sanitization
    """
    try:
        # Sanitize entry
        sanitized_entry = sanitize_rag_entry(entry)
        
        # Validate entry
        if not validate_rag_entry(sanitized_entry):
            return {
                "success": False,
                "message": "RAG entry validation failed",
                "entry": sanitized_entry
            }
        
        # Proceed with injection
        rag_api_url = os.getenv("RAG_INDEX_URL")
        rag_api_key = os.getenv("RAG_API_KEY")
        
        if not rag_api_url or not rag_api_key:
            return {
                "success": False,
                "message": "RAG service not configured"
            }
        
        headers = {
            "Authorization": f"Bearer {rag_api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "content": sanitized_entry["body"],
            "title": sanitized_entry["title"],
            "tags": sanitized_entry["tags"],
            "timestamp": datetime.now().isoformat(),
            "source": "validated_injection"
        }
        
        response = requests.post(
            rag_api_url,
            headers=headers,
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            print(f"RAG entry injected successfully: {sanitized_entry['title']}")
            return {
                "success": True,
                "message": "RAG entry injected successfully",
                "entry": sanitized_entry
            }
        else:
            return {
                "success": False,
                "message": f"RAG injection failed: {response.status_code}",
                "entry": sanitized_entry
            }
        
    except Exception as e:
        return {
            "success": False,
            "message": f"RAG injection error: {str(e)}",
            "entry": entry
        }

if __name__ == "__main__":
    # Test validation
    test_entry = {
        "title": "Test Knowledge Entry",
        "body": "This is a test knowledge entry for the RAG system validation.",
        "tags": ["test", "validation", "rag"]
    }
    
    if validate_rag_entry(test_entry):
        print("Test entry is valid")
    else:
        print("Test entry is invalid")