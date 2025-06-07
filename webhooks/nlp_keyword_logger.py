#!/usr/bin/env python3
"""
NLP Keyword Logger - Logs NLP keywords and training data to YoBot Command Center
"""

import os
import requests
from datetime import datetime

def log_nlp_keyword(keyword, category, sample_phrase, target_action, used_in_training=False, bot_name=None, owner="Tyson"):
    """Log NLP keywords to Airtable"""
    import requests, os
    from datetime import datetime

    payload = {
        "fields": {
            "🔑 Keyword": keyword,
            "🗂 Category": category,
            "💬 Sample Phrase": sample_phrase,
            "🎯 Target Action": target_action,
            "🔁 Used in Training?": used_in_training,
            "📅 Date Added": datetime.utcnow().isoformat(),
            "🧠 Bot Name": bot_name or "",
            "👤 Owner": owner
        }
    }

    response = requests.post(
        f"https://api.airtable.com/v0/{os.getenv('AIRTABLE_NLP_KEYWORDS_BASE_ID')}/{os.getenv('AIRTABLE_NLP_KEYWORDS_TABLE_ID')}",
        headers={
            "Authorization": f"Bearer {os.getenv('AIRTABLE_API_KEY')}",
            "Content-Type": "application/json"
        },
        json=payload
    )

    if response.status_code != 200:
        print("❌ NLP keyword log failed:", response.text)
        return False
    else:
        print("✅ NLP keyword logged.")
        return True

def create_comprehensive_nlp_keywords():
    """Create comprehensive NLP keyword database for YoBot training"""
    
    # Set environment variables
    os.environ['AIRTABLE_NLP_KEYWORDS_BASE_ID'] = 'appRt8V3tH4g5Z51f'
    os.environ['AIRTABLE_NLP_KEYWORDS_TABLE_ID'] = 'tblOtH99S7uFbYHga'
    
    api_key = os.getenv('AIRTABLE_API_KEY') or os.getenv('AIRTABLE_PERSONAL_ACCESS_TOKEN')
    if not api_key:
        print("Missing AIRTABLE_API_KEY or AIRTABLE_PERSONAL_ACCESS_TOKEN")
        return False
    
    os.environ['AIRTABLE_API_KEY'] = api_key
    
    # Comprehensive keyword database for bot training
    keyword_database = [
        # FAQ Keywords
        {
            "keyword": "pricing",
            "category": "FAQ",
            "sample_phrase": "How much does this cost? What are your pricing plans?",
            "target_action": "Route to pricing module and display pricing tiers",
            "used_in_training": True,
            "bot_name": "YoBot Alpha",
            "owner": "Daniel Sharpe"
        },
        {
            "keyword": "implementation",
            "category": "FAQ", 
            "sample_phrase": "How long does implementation take? What's the setup process?",
            "target_action": "Provide implementation timeline and next steps",
            "used_in_training": True,
            "bot_name": "YoBot Beta",
            "owner": "Sarah Chen"
        },
        {
            "keyword": "integration",
            "category": "FAQ",
            "sample_phrase": "Does this integrate with our existing CRM? What about Salesforce?",
            "target_action": "Show integration capabilities and supported platforms",
            "used_in_training": True,
            "bot_name": "YoBot Gamma",
            "owner": "Mike Rodriguez"
        },
        
        # Objection Keywords
        {
            "keyword": "expensive",
            "category": "Objection",
            "sample_phrase": "This seems too expensive for our budget. We can't afford this right now.",
            "target_action": "Address price objection with ROI calculation and payment options",
            "used_in_training": True,
            "bot_name": "YoBot Alpha",
            "owner": "Alex Thompson"
        },
        {
            "keyword": "competitor",
            "category": "Objection",
            "sample_phrase": "We're already looking at HubSpot. How are you different from Salesforce?",
            "target_action": "Highlight unique value propositions and competitive advantages",
            "used_in_training": True,
            "bot_name": "YoBot Delta",
            "owner": "Jennifer Park"
        },
        {
            "keyword": "decision_maker",
            "category": "Objection",
            "sample_phrase": "I need to talk to my boss. The decision isn't up to me.",
            "target_action": "Gather stakeholder information and schedule group demo",
            "used_in_training": True,
            "bot_name": "YoBot Beta",
            "owner": "David Kim"
        },
        
        # Intent Keywords
        {
            "keyword": "demo",
            "category": "Intent",
            "sample_phrase": "Can I see a demo? I'd like to schedule a demonstration.",
            "target_action": "Schedule demo and collect contact information",
            "used_in_training": True,
            "bot_name": "YoBot Alpha",
            "owner": "Lisa Wong"
        },
        {
            "keyword": "trial",
            "category": "Intent",
            "sample_phrase": "Do you offer a free trial? Can we test this first?",
            "target_action": "Initiate trial signup process and set expectations",
            "used_in_training": True,
            "bot_name": "YoBot Gamma",
            "owner": "Robert Martinez"
        },
        {
            "keyword": "buy_now",
            "category": "Intent",
            "sample_phrase": "How do we get started? I want to purchase this today.",
            "target_action": "Route to sales representative for immediate purchase",
            "used_in_training": True,
            "bot_name": "YoBot Delta",
            "owner": "Emma Johnson"
        },
        
        # Support Keywords
        {
            "keyword": "technical_issue",
            "category": "Support",
            "sample_phrase": "The system isn't working. I'm having technical problems.",
            "target_action": "Escalate to technical support and collect error details",
            "used_in_training": True,
            "bot_name": "YoBot Beta",
            "owner": "Carlos Rivera"
        },
        {
            "keyword": "account_access",
            "category": "Support",
            "sample_phrase": "I can't log in. I forgot my password.",
            "target_action": "Initiate password reset and verify account information",
            "used_in_training": True,
            "bot_name": "YoBot Alpha",
            "owner": "Tyson Lerfald"
        },
        
        # Industry-Specific Keywords
        {
            "keyword": "healthcare_compliance",
            "category": "Industry",
            "sample_phrase": "Is this HIPAA compliant? We need healthcare-specific features.",
            "target_action": "Highlight healthcare compliance features and security measures",
            "used_in_training": True,
            "bot_name": "YoBot Gamma",
            "owner": "Daniel Sharpe"
        },
        {
            "keyword": "financial_regulation",
            "category": "Industry",
            "sample_phrase": "Do you meet SOX compliance? We're in banking and need strict security.",
            "target_action": "Discuss financial industry compliance and security certifications",
            "used_in_training": True,
            "bot_name": "YoBot Delta",
            "owner": "Sarah Chen"
        },
        
        # Feature Keywords
        {
            "keyword": "automation",
            "category": "Feature",
            "sample_phrase": "Can this automate our workflow? What processes can be automated?",
            "target_action": "Demonstrate automation capabilities and workflow examples",
            "used_in_training": True,
            "bot_name": "YoBot Alpha",
            "owner": "Mike Rodriguez"
        },
        {
            "keyword": "reporting",
            "category": "Feature",
            "sample_phrase": "What kind of reports can we generate? Do you have analytics?",
            "target_action": "Show reporting dashboard and analytics features",
            "used_in_training": True,
            "bot_name": "YoBot Beta",
            "owner": "Alex Thompson"
        },
        
        # Urgency Keywords
        {
            "keyword": "urgent",
            "category": "Urgency",
            "sample_phrase": "This is urgent. We need to implement something immediately.",
            "target_action": "Prioritize as high-priority lead and expedite response",
            "used_in_training": True,
            "bot_name": "YoBot Gamma",
            "owner": "Jennifer Park"
        },
        {
            "keyword": "deadline",
            "category": "Urgency",
            "sample_phrase": "We have a deadline next month. Can you deliver by then?",
            "target_action": "Assess timeline feasibility and create implementation plan",
            "used_in_training": True,
            "bot_name": "YoBot Delta",
            "owner": "David Kim"
        }
    ]
    
    success_count = 0
    
    print("Creating comprehensive NLP keyword database...")
    print("=" * 60)
    
    for i, keyword_data in enumerate(keyword_database, 1):
        try:
            success = log_nlp_keyword(
                keyword=keyword_data["keyword"],
                category=keyword_data["category"],
                sample_phrase=keyword_data["sample_phrase"],
                target_action=keyword_data["target_action"],
                used_in_training=keyword_data["used_in_training"],
                bot_name=keyword_data["bot_name"],
                owner=keyword_data["owner"]
            )
            
            if success:
                success_count += 1
                training_status = "🎯 TRAINED" if keyword_data["used_in_training"] else "⏳ PENDING"
                print(f"SUCCESS {i:2d}/18: {keyword_data['keyword']} ({keyword_data['category']}) - {training_status}")
            else:
                print(f"FAILED  {i:2d}/18: {keyword_data['keyword']}")
                
        except Exception as e:
            print(f"ERROR   {i:2d}/18: {keyword_data['keyword']} - {str(e)}")
    
    print("=" * 60)
    print(f"NLP keyword database complete: {success_count}/18 keywords logged")
    
    if success_count > 0:
        # Calculate statistics by category
        categories = {}
        for keyword_data in keyword_database:
            category = keyword_data["category"]
            categories[category] = categories.get(category, 0) + 1
        
        trained_count = sum(1 for kw in keyword_database if kw["used_in_training"])
        
        print(f"\n📊 Keyword Statistics:")
        print(f"   • Total Keywords: {len(keyword_database)}")
        print(f"   • Trained Keywords: {trained_count}/{len(keyword_database)} ({(trained_count/len(keyword_database)*100):.1f}%)")
        print(f"   • Categories:")
        for category, count in categories.items():
            print(f"     - {category}: {count} keywords")
        
        print(f"\nView keywords: https://airtable.com/appRt8V3tH4g5Z51f")
        return True
    else:
        print("No keywords logged - check authentication token")
        return False

def test_sample_keyword():
    """Test the example keyword provided"""
    
    # Set environment variables
    os.environ['AIRTABLE_NLP_KEYWORDS_BASE_ID'] = 'appRt8V3tH4g5Z51f'
    os.environ['AIRTABLE_NLP_KEYWORDS_TABLE_ID'] = 'tblOtH99S7uFbYHga'
    
    api_key = os.getenv('AIRTABLE_API_KEY') or os.getenv('AIRTABLE_PERSONAL_ACCESS_TOKEN')
    if not api_key:
        print("Missing authentication token")
        return False
    
    os.environ['AIRTABLE_API_KEY'] = api_key
    
    print("Testing sample keyword...")
    print("=" * 40)
    
    # Test the example keyword
    success = log_nlp_keyword(
        keyword="pricing",
        category="FAQ",
        sample_phrase="How much does this cost?",
        target_action="Route to pricing module",
        used_in_training=True,
        bot_name="YoBot Alpha",
        owner="Daniel Sharpe"
    )
    
    if success:
        print("✅ Test keyword logging successful")
        print("   Keyword: pricing (FAQ)")
        print("   Training Status: Used in Training")
        print("   Owner: Daniel Sharpe")
        return True
    else:
        print("❌ Test keyword logging failed")
        return False

if __name__ == '__main__':
    print("YoBot NLP Keyword Logger")
    print("Creating comprehensive keyword training database...")
    print()
    
    # Test sample keyword first
    test_sample_keyword()
    print()
    
    # Create comprehensive keyword database
    create_comprehensive_nlp_keywords()
    
    print("\nComplete NLP keyword system logged to Airtable")
    print("Base: appRt8V3tH4g5Z51f | Table: tblOtH99S7uFbYHga")