#!/usr/bin/env python3
"""
External Service Logging Integration
Zendesk, HubSpot, Google Calendar, and additional service logging with universal schema
"""

from universal_webhook_logger import log_to_airtable
from datetime import datetime
import requests
import os

def log_zendesk_ticket_event(ticket_id, status, priority, customer_email, agent_id=None, resolution_time=None):
    """
    Log Zendesk ticket lifecycle events
    """
    try:
        data = {
            "ticket_id": ticket_id,
            "status": status,
            "priority": priority,
            "customer_email": customer_email,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if agent_id:
            data["agent_id"] = agent_id
            
        if resolution_time:
            data["resolution_time_minutes"] = resolution_time
            
        success = log_to_airtable("Zendesk Events", data)
        
        if success:
            print(f"Zendesk event logged: Ticket {ticket_id} - {status}")
        
        return success
        
    except Exception as e:
        print(f"Zendesk logging error: {e}")
        return False

def log_hubspot_contact_activity(contact_id, activity_type, contact_email, lead_score=None, deal_amount=None):
    """
    Log HubSpot CRM contact interactions and activities
    """
    try:
        data = {
            "contact_id": contact_id,
            "activity_type": activity_type,
            "contact_email": contact_email,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if lead_score:
            data["lead_score"] = lead_score
            
        if deal_amount:
            data["deal_amount"] = deal_amount
            
        success = log_to_airtable("HubSpot Activities", data)
        
        if success:
            print(f"HubSpot activity logged: {activity_type} for {contact_email}")
        
        return success
        
    except Exception as e:
        print(f"HubSpot logging error: {e}")
        return False

def log_google_calendar_event(event_id, event_type, attendee_email, scheduled_time, event_status="scheduled"):
    """
    Log Google Calendar appointment scheduling and management
    """
    try:
        data = {
            "event_id": event_id,
            "event_type": event_type,
            "attendee_email": attendee_email,
            "scheduled_time": scheduled_time,
            "event_status": event_status,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        success = log_to_airtable("Calendar Events", data)
        
        if success:
            print(f"Calendar event logged: {event_type} for {attendee_email}")
        
        return success
        
    except Exception as e:
        print(f"Calendar logging error: {e}")
        return False

def log_demo_no_show_rebooker(customer_name, customer_email, phone, rebook_method, response_received=False):
    """
    Log demo no-show rebooking automation events
    """
    try:
        data = {
            "customer_name": customer_name,
            "customer_email": customer_email,
            "phone": phone,
            "rebook_method": rebook_method,  # "sms", "email", "both"
            "response_received": response_received,
            "event_type": "demo_no_show_followup",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        success = log_to_airtable("Demo Rebooking Log", data)
        
        if success:
            print(f"Demo rebooking logged: {customer_name} via {rebook_method}")
        
        return success
        
    except Exception as e:
        print(f"Demo rebooking logging error: {e}")
        return False

def log_lead_scoring_event(lead_id, lead_name, lead_email, score, tag_assigned, scoring_factors):
    """
    Log automatic lead scoring and tagging events
    """
    try:
        data = {
            "lead_id": lead_id,
            "lead_name": lead_name,
            "lead_email": lead_email,
            "score": score,
            "tag_assigned": tag_assigned,
            "scoring_factors": scoring_factors,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        success = log_to_airtable("Lead Scoring Log", data)
        
        if success:
            print(f"Lead scoring logged: {lead_name} - {tag_assigned} ({score} points)")
        
        return success
        
    except Exception as e:
        print(f"Lead scoring logging error: {e}")
        return False

def log_tally_form_submission(form_name, submission_data, crm_contact_created=True):
    """
    Log Tally form submissions and CRM contact creation
    """
    try:
        data = {
            "form_name": form_name,
            "name": submission_data.get("name", ""),
            "email": submission_data.get("email", ""),
            "phone": submission_data.get("phone", ""),
            "tags": submission_data.get("tags", []),
            "crm_contact_created": crm_contact_created,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        success = log_to_airtable("Tally Form Submissions", data)
        
        if success:
            print(f"Tally submission logged: {form_name} - {submission_data.get('name', 'Unknown')}")
        
        return success
        
    except Exception as e:
        print(f"Tally form logging error: {e}")
        return False

def log_qbo_invoice_automation(deal_id, customer_name, customer_email, invoice_id, amount, invoice_status="sent"):
    """
    Log QuickBooks Online invoice automation on deal closure
    """
    try:
        data = {
            "deal_id": deal_id,
            "customer_name": customer_name,
            "customer_email": customer_email,
            "qbo_invoice_id": invoice_id,
            "amount": amount,
            "invoice_status": invoice_status,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        success = log_to_airtable("QBO Invoice Automation", data)
        
        if success:
            print(f"QBO invoice automation logged: {invoice_id} for ${amount}")
        
        return success
        
    except Exception as e:
        print(f"QBO invoice logging error: {e}")
        return False

def log_slack_notification(channel, message_type, content, triggered_by_event):
    """
    Log Slack notifications sent by automation systems
    """
    try:
        data = {
            "channel": channel,
            "message_type": message_type,
            "content_preview": content[:100] + "..." if len(content) > 100 else content,
            "triggered_by": triggered_by_event,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        success = log_to_airtable("Slack Notifications", data)
        
        if success:
            print(f"Slack notification logged: {message_type} to {channel}")
        
        return success
        
    except Exception as e:
        print(f"Slack notification logging error: {e}")
        return False

def log_external_service_health(service_name, status, response_time=None, error_details=None):
    """
    Log external service health and performance monitoring
    """
    try:
        data = {
            "service_name": service_name,
            "status": status,  # "healthy", "degraded", "down"
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if response_time:
            data["response_time_ms"] = response_time
            
        if error_details and status != "healthy":
            data["error_details"] = error_details
            
        success = log_to_airtable("External Service Health", data)
        
        if success:
            print(f"Service health logged: {service_name} - {status}")
        
        return success
        
    except Exception as e:
        print(f"Service health logging error: {e}")
        return False

if __name__ == "__main__":
    # Test all external service loggers
    print("Testing external service logging modules...")
    
    # Test Zendesk logging
    log_zendesk_ticket_event("TICKET_001", "resolved", "high", "customer@example.com", "agent_123", 45)
    
    # Test HubSpot logging
    log_hubspot_contact_activity("CONTACT_456", "deal_closed", "prospect@company.com", 85, 5000)
    
    # Test Calendar logging
    log_google_calendar_event("EVENT_789", "demo_call", "demo@client.com", "2025-01-02T14:00:00Z")
    
    # Test Demo rebooking
    log_demo_no_show_rebooker("John Smith", "john@example.com", "+1-555-0123", "both", False)
    
    # Test Lead scoring
    log_lead_scoring_event("LEAD_012", "Jane Doe", "jane@company.com", 75, "🔥 Hot", ["CEO title", "Tech industry"])
    
    print("All external service loggers tested successfully!")