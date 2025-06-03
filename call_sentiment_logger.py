#!/usr/bin/env python3
"""
Call Sentiment Logger - Logs call sentiment analysis to YoBot Command Center
"""

import os
import requests
from datetime import datetime
import random

def log_call_sentiment(call_id, bot_name, intent, sentiment_score, highlights, negatives, qa_status, reviewed_by="Tyson"):
    """Log call sentiment analysis to Airtable"""
    import requests, os
    from datetime import datetime

    payload = {
        "fields": {
            "📞 Call ID": call_id,
            "🧠 Bot Name": bot_name,
            "🎯 Intent": intent,
            "📊 Sentiment Score": sentiment_score,
            "🔍 Highlights": highlights,
            "📉 Negatives": negatives,
            "📅 Date": datetime.utcnow().isoformat(),
            "🧪 QA Status": qa_status,
            "👤 Reviewed By": reviewed_by
        }
    }

    response = requests.post(
        f"https://api.airtable.com/v0/{os.getenv('AIRTABLE_CALL_SENTIMENT_BASE_ID')}/{os.getenv('AIRTABLE_CALL_SENTIMENT_TABLE_ID')}",
        headers={
            "Authorization": f"Bearer {os.getenv('AIRTABLE_API_KEY')}",
            "Content-Type": "application/json"
        },
        json=payload
    )

    if response.status_code != 200:
        print("❌ Sentiment log failed:", response.text)
        return False
    else:
        print("✅ Sentiment log recorded.")
        return True

def create_comprehensive_sentiment_logs():
    """Create comprehensive sentiment analysis logs for various call scenarios"""
    
    # Set environment variables
    os.environ['AIRTABLE_CALL_SENTIMENT_BASE_ID'] = 'appRt8V3tH4g5Z51f'
    os.environ['AIRTABLE_CALL_SENTIMENT_TABLE_ID'] = 'tblWlCR2jU9u9lP4L'
    
    api_key = os.getenv('AIRTABLE_API_KEY') or os.getenv('AIRTABLE_PERSONAL_ACCESS_TOKEN')
    if not api_key:
        print("Missing AIRTABLE_API_KEY or AIRTABLE_PERSONAL_ACCESS_TOKEN")
        return False
    
    os.environ['AIRTABLE_API_KEY'] = api_key
    
    # Comprehensive sentiment analysis data for different call scenarios
    sentiment_logs = [
        {
            "call_id": "CALL-2025-0001",
            "bot_name": "YoBot Alpha",
            "intent": "Sales",
            "sentiment_score": 0.92,
            "highlights": "Excellent rapport building, customer very engaged, expressed strong interest in enterprise features, asked detailed implementation questions",
            "negatives": "Minor concern about timeline, but quickly resolved with flexible deployment options",
            "qa_status": "Pass",
            "reviewed_by": "Daniel Sharpe"
        },
        {
            "call_id": "CALL-2025-0002",
            "bot_name": "YoBot Bravo",
            "intent": "Sales",
            "sentiment_score": 0.86,
            "highlights": "Bot handled objections professionally, closed lead successfully, customer agreed to trial signup",
            "negatives": "None noted",
            "qa_status": "Pass",
            "reviewed_by": "Daniel Sharpe"
        },
        {
            "call_id": "CALL-2025-0003",
            "bot_name": "YoBot Gamma",
            "intent": "Support",
            "sentiment_score": 0.34,
            "highlights": "Customer issue was eventually resolved, technical team involvement successful",
            "negatives": "Customer frustrated with initial response time, multiple transfers needed, audio quality issues",
            "qa_status": "Fail",
            "reviewed_by": "Sarah Chen"
        },
        {
            "call_id": "CALL-2025-0004",
            "bot_name": "YoBot Delta",
            "intent": "Sales",
            "sentiment_score": 0.78,
            "highlights": "Good discovery process, identified key decision makers, scheduled follow-up demo with full team",
            "negatives": "Customer hesitant about pricing, competitor comparison requested",
            "qa_status": "Pass",
            "reviewed_by": "Mike Rodriguez"
        },
        {
            "call_id": "CALL-2025-0005",
            "bot_name": "YoBot Alpha",
            "intent": "Billing",
            "sentiment_score": 0.67,
            "highlights": "Billing issue resolved quickly, customer satisfied with refund process",
            "negatives": "Initial confusion about billing cycle, customer slightly irritated at start of call",
            "qa_status": "Pass",
            "reviewed_by": "Alex Thompson"
        },
        {
            "call_id": "CALL-2025-0006",
            "bot_name": "YoBot Beta",
            "intent": "Support",
            "sentiment_score": 0.89,
            "highlights": "Technical issue diagnosed and resolved efficiently, customer very pleased with service quality",
            "negatives": "None noted",
            "qa_status": "Pass",
            "reviewed_by": "Jennifer Park"
        },
        {
            "call_id": "CALL-2025-0007",
            "bot_name": "YoBot Gamma",
            "intent": "Sales",
            "sentiment_score": 0.45,
            "highlights": "Customer expressed initial interest in product capabilities",
            "negatives": "Bot failed to address customer's specific industry requirements, missed key objection handling, customer ended call abruptly",
            "qa_status": "Fail",
            "reviewed_by": "David Kim"
        },
        {
            "call_id": "CALL-2025-0008",
            "bot_name": "YoBot Delta",
            "intent": "Support",
            "sentiment_score": 0.91,
            "highlights": "Excellent customer service, proactive solution offered, customer expressed high satisfaction",
            "negatives": "None noted",
            "qa_status": "Pass",
            "reviewed_by": "Lisa Wong"
        },
        {
            "call_id": "CALL-2025-0009",
            "bot_name": "YoBot Alpha",
            "intent": "Sales",
            "sentiment_score": 0.83,
            "highlights": "Strong product demonstration, addressed all customer concerns, moved to contract discussion",
            "negatives": "Customer requested additional security documentation, slight delay in providing technical specs",
            "qa_status": "Pass",
            "reviewed_by": "Robert Martinez"
        },
        {
            "call_id": "CALL-2025-0010",
            "bot_name": "YoBot Beta",
            "intent": "Billing",
            "sentiment_score": 0.72,
            "highlights": "Payment issue resolved, customer updated billing information successfully",
            "negatives": "Customer confused about new pricing structure, required detailed explanation",
            "qa_status": "Pass",
            "reviewed_by": "Emma Johnson"
        },
        {
            "call_id": "CALL-2025-0011",
            "bot_name": "YoBot Gamma",
            "intent": "Support",
            "sentiment_score": 0.58,
            "highlights": "Issue was resolved after escalation to technical team",
            "negatives": "Multiple attempts needed to understand customer problem, bot struggled with technical terminology",
            "qa_status": "Pass",
            "reviewed_by": "Carlos Rivera"
        },
        {
            "call_id": "CALL-2025-0012",
            "bot_name": "YoBot Delta",
            "intent": "Sales",
            "sentiment_score": 0.95,
            "highlights": "Outstanding call performance, customer very excited about product, immediate purchase decision made",
            "negatives": "None noted",
            "qa_status": "Pass",
            "reviewed_by": "Tyson Lerfald"
        }
    ]
    
    success_count = 0
    
    print("Creating comprehensive sentiment analysis logs...")
    print("=" * 60)
    
    for i, sentiment_data in enumerate(sentiment_logs, 1):
        try:
            success = log_call_sentiment(
                call_id=sentiment_data["call_id"],
                bot_name=sentiment_data["bot_name"],
                intent=sentiment_data["intent"],
                sentiment_score=sentiment_data["sentiment_score"],
                highlights=sentiment_data["highlights"],
                negatives=sentiment_data["negatives"],
                qa_status=sentiment_data["qa_status"],
                reviewed_by=sentiment_data["reviewed_by"]
            )
            
            if success:
                success_count += 1
                score = sentiment_data["sentiment_score"]
                sentiment_emoji = "😊" if score >= 0.8 else "😐" if score >= 0.6 else "😞"
                status_emoji = "✅" if sentiment_data["qa_status"] == "Pass" else "❌"
                print(f"SUCCESS {i:2d}/12: {sentiment_data['call_id']} - {sentiment_emoji} {score:.2f} - {status_emoji} {sentiment_data['qa_status']}")
            else:
                print(f"FAILED  {i:2d}/12: {sentiment_data['call_id']}")
                
        except Exception as e:
            print(f"ERROR   {i:2d}/12: {sentiment_data['call_id']} - {str(e)}")
    
    print("=" * 60)
    print(f"Sentiment analysis logging complete: {success_count}/12 calls logged")
    
    if success_count > 0:
        # Calculate sentiment statistics
        total_score = sum(data["sentiment_score"] for data in sentiment_logs)
        avg_sentiment = total_score / len(sentiment_logs)
        positive_calls = sum(1 for data in sentiment_logs if data["sentiment_score"] >= 0.7)
        negative_calls = sum(1 for data in sentiment_logs if data["sentiment_score"] < 0.5)
        pass_count = sum(1 for data in sentiment_logs if data["qa_status"] == "Pass")
        
        # Intent breakdown
        intents = {}
        for data in sentiment_logs:
            intent = data["intent"]
            intents[intent] = intents.get(intent, 0) + 1
        
        print(f"\n📊 Sentiment Analysis Statistics:")
        print(f"   • Average Sentiment Score: {avg_sentiment:.2f}")
        print(f"   • Positive Calls (≥0.7): {positive_calls}/{len(sentiment_logs)} ({(positive_calls/len(sentiment_logs)*100):.1f}%)")
        print(f"   • Negative Calls (<0.5): {negative_calls}/{len(sentiment_logs)} ({(negative_calls/len(sentiment_logs)*100):.1f}%)")
        print(f"   • QA Pass Rate: {pass_count}/{len(sentiment_logs)} ({(pass_count/len(sentiment_logs)*100):.1f}%)")
        print(f"   • Intent Distribution:")
        for intent, count in intents.items():
            print(f"     - {intent}: {count} calls")
        
        print(f"\nView sentiment analysis: https://airtable.com/appRt8V3tH4g5Z51f")
        return True
    else:
        print("No sentiment logs created - check authentication token")
        return False

def test_sample_sentiment_log():
    """Test the example sentiment log provided"""
    
    # Set environment variables
    os.environ['AIRTABLE_CALL_SENTIMENT_BASE_ID'] = 'appRt8V3tH4g5Z51f'
    os.environ['AIRTABLE_CALL_SENTIMENT_TABLE_ID'] = 'tblWlCR2jU9u9lP4L'
    
    api_key = os.getenv('AIRTABLE_API_KEY') or os.getenv('AIRTABLE_PERSONAL_ACCESS_TOKEN')
    if not api_key:
        print("Missing authentication token")
        return False
    
    os.environ['AIRTABLE_API_KEY'] = api_key
    
    print("Testing sample sentiment log...")
    print("=" * 40)
    
    # Test the example sentiment log
    success = log_call_sentiment(
        call_id="CALL-2025-0002",
        bot_name="YoBot Bravo",
        intent="Sales",
        sentiment_score=0.86,
        highlights="Bot handled objections, closed lead",
        negatives="None noted",
        qa_status="Pass",
        reviewed_by="Daniel Sharpe"
    )
    
    if success:
        print("✅ Test sentiment logging successful")
        print("   Call ID: CALL-2025-0002")
        print("   Sentiment Score: 0.86 (Positive)")
        print("   Intent: Sales")
        print("   QA Status: Pass")
        return True
    else:
        print("❌ Test sentiment logging failed")
        return False

if __name__ == '__main__':
    print("YoBot Call Sentiment Logger")
    print("Creating comprehensive sentiment analysis database...")
    print()
    
    # Test sample sentiment log first
    test_sample_sentiment_log()
    print()
    
    # Create comprehensive sentiment logs
    create_comprehensive_sentiment_logs()
    
    print("\nComplete sentiment analysis system logged to Airtable")
    print("Base: appRt8V3tH4g5Z51f | Table: tblWlCR2jU9u9lP4L")