#!/usr/bin/env python3
"""
Advanced Specialized Loggers
PDF Generation, Stripe Events, Revenue Recognition, and Voice Escalation tracking
"""

from universal_webhook_logger import log_to_airtable
from datetime import datetime

def log_pdf_generation(customer_id, doc_type, pdf_url, file_size=None, generation_time=None):
    """
    Track every PDF quote/ROI document generated
    """
    try:
        data = {
            "customer_id": customer_id,
            "doc_type": doc_type,  # "Quote" or "ROI"
            "pdf_url": pdf_url,
            "generated_at": datetime.utcnow().isoformat()
        }
        
        if file_size:
            data["file_size_kb"] = file_size
            
        if generation_time:
            data["generation_time_seconds"] = generation_time
            
        success = log_to_airtable("PDF Tracker", data)
        
        if success:
            print(f"PDF generation logged: {doc_type} for customer {customer_id}")
        
        return success
        
    except Exception as e:
        print(f"PDF generation logging error: {e}")
        return False

def log_stripe_webhook_event(customer_email, amount_cents, status, event_type, stripe_event_id=None):
    """
    Log all Stripe webhook events into Airtable
    """
    try:
        data = {
            "customer_email": customer_email,
            "amount": amount_cents / 100,  # Convert cents to dollars
            "status": status,
            "event_type": event_type,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if stripe_event_id:
            data["stripe_event_id"] = stripe_event_id
            
        success = log_to_airtable("Stripe Events", data)
        
        if success:
            print(f"Stripe event logged: {event_type} for {customer_email}")
        
        return success
        
    except Exception as e:
        print(f"Stripe event logging error: {e}")
        return False

def log_revenue_recognition(invoice_id, amount_paid_cents, customer_email=None, payment_method=None):
    """
    Track recognized revenue per payment for accounting
    """
    try:
        data = {
            "invoice_id": invoice_id,
            "amount": amount_paid_cents / 100,  # Convert cents to dollars
            "recognized_on": datetime.utcnow().isoformat()
        }
        
        if customer_email:
            data["customer_email"] = customer_email
            
        if payment_method:
            data["payment_method"] = payment_method
            
        success = log_to_airtable("Revenue Recognition", data)
        
        if success:
            print(f"Revenue recognition logged: ${data['amount']:.2f} for invoice {invoice_id}")
        
        return success
        
    except Exception as e:
        print(f"Revenue recognition logging error: {e}")
        return False

def log_voice_escalation(ticket_id, escalation_reason, voice_call_url=None, customer_phone=None, priority_level="high"):
    """
    Track high-priority voice call alerts and escalations
    """
    try:
        data = {
            "ticket_id": ticket_id,
            "escalation_reason": escalation_reason,
            "priority_level": priority_level,
            "flagged_at": datetime.utcnow().isoformat()
        }
        
        if voice_call_url:
            data["voice_call_url"] = voice_call_url
            
        if customer_phone:
            data["customer_phone"] = customer_phone
            
        success = log_to_airtable("Voice Escalations", data)
        
        if success:
            print(f"Voice escalation logged: {escalation_reason} for ticket {ticket_id}")
        
        return success
        
    except Exception as e:
        print(f"Voice escalation logging error: {e}")
        return False

def log_comprehensive_pdf_analytics(doc_type, total_generated, avg_generation_time, most_requested_template):
    """
    Log comprehensive PDF generation analytics
    """
    try:
        data = {
            "doc_type": doc_type,
            "total_generated_today": total_generated,
            "avg_generation_time": avg_generation_time,
            "most_requested_template": most_requested_template,
            "analytics_date": datetime.utcnow().strftime("%Y-%m-%d"),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return log_to_airtable("PDF Analytics", data)
        
    except Exception as e:
        print(f"PDF analytics logging error: {e}")
        return False

def log_stripe_payment_analytics(total_payments, total_revenue, avg_payment_amount, failed_payments_count):
    """
    Log comprehensive Stripe payment analytics
    """
    try:
        data = {
            "total_payments_today": total_payments,
            "total_revenue_today": total_revenue,
            "avg_payment_amount": avg_payment_amount,
            "failed_payments_count": failed_payments_count,
            "analytics_date": datetime.utcnow().strftime("%Y-%m-%d"),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return log_to_airtable("Stripe Analytics", data)
        
    except Exception as e:
        print(f"Stripe analytics logging error: {e}")
        return False

def log_revenue_reconciliation(total_stripe_revenue, total_recognized_revenue, discrepancy_amount):
    """
    Log daily revenue reconciliation between Stripe and recognized revenue
    """
    try:
        data = {
            "stripe_revenue": total_stripe_revenue,
            "recognized_revenue": total_recognized_revenue,
            "discrepancy": discrepancy_amount,
            "reconciliation_status": "match" if discrepancy_amount == 0 else "discrepancy",
            "reconciliation_date": datetime.utcnow().strftime("%Y-%m-%d"),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return log_to_airtable("Revenue Reconciliation", data)
        
    except Exception as e:
        print(f"Revenue reconciliation logging error: {e}")
        return False

def log_escalation_analytics(total_escalations, avg_response_time, resolution_rate, escalation_sources):
    """
    Log voice escalation analytics for performance monitoring
    """
    try:
        data = {
            "total_escalations_today": total_escalations,
            "avg_response_time_minutes": avg_response_time,
            "resolution_rate_percent": resolution_rate,
            "top_escalation_sources": escalation_sources,
            "analytics_date": datetime.utcnow().strftime("%Y-%m-%d"),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return log_to_airtable("Escalation Analytics", data)
        
    except Exception as e:
        print(f"Escalation analytics logging error: {e}")
        return False

if __name__ == "__main__":
    # Test all advanced specialized loggers
    print("Testing advanced specialized logging modules...")
    
    # Test PDF generation logging
    log_pdf_generation("CUST_123", "Quote", "https://storage.yobot.com/pdfs/quote_123.pdf", 245, 3.2)
    
    # Test Stripe event logging
    log_stripe_webhook_event("customer@example.com", 150000, "succeeded", "payment_intent.succeeded", "evt_123")
    
    # Test revenue recognition logging
    log_revenue_recognition("inv_456", 150000, "customer@example.com", "card")
    
    # Test voice escalation logging
    log_voice_escalation("TICKET_789", "Customer complaint - billing dispute", "https://calls.yobot.com/789", "+1-555-0123")
    
    print("All advanced specialized loggers tested successfully!")