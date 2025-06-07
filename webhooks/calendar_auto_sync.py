#!/usr/bin/env python3
"""
Calendar Auto-Sync for Tasks
Automatically syncs follow-up tasks to Google Calendar when leads close or tickets escalate
"""

import os
import requests
import json
from datetime import datetime, timedelta

def create_calendar_event(summary, start_time, end_time, description=None, attendees=None):
    """
    Create calendar event for follow-up tasks
    """
    try:
        calendar_api_url = os.getenv("GOOGLE_CALENDAR_API_URL", "https://google-calendar-api.yobot.com")
        calendar_api_key = os.getenv("GOOGLE_CALENDAR_API_KEY")
        
        if not calendar_api_key:
            print("Google Calendar API key not configured")
            return False
            
        headers = {
            "Authorization": f"Bearer {calendar_api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "summary": summary,
            "start": {
                "dateTime": start_time,
                "timeZone": "America/New_York"
            },
            "end": {
                "dateTime": end_time,
                "timeZone": "America/New_York"
            },
            "description": description or f"Auto-generated follow-up task: {summary}",
            "attendees": attendees or [],
            "reminders": {
                "useDefault": False,
                "overrides": [
                    {"method": "email", "minutes": 24 * 60},
                    {"method": "popup", "minutes": 30}
                ]
            }
        }
        
        response = requests.post(
            f"{calendar_api_url}/create",
            headers=headers,
            json=payload,
            timeout=15
        )
        
        if response.status_code == 200:
            event_data = response.json()
            print(f"Calendar event created: {summary}")
            return {
                "success": True,
                "event_id": event_data.get("id"),
                "summary": summary
            }
        else:
            print(f"Failed to create calendar event: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"Calendar event creation error: {e}")
        return False

def schedule_lead_followup(customer_name, customer_email, lead_status):
    """
    Schedule follow-up task when lead closes
    """
    try:
        if lead_status.lower() == "closed_won":
            # Schedule onboarding follow-up
            start_time = (datetime.now() + timedelta(days=1)).isoformat()
            end_time = (datetime.now() + timedelta(days=1, hours=1)).isoformat()
            
            summary = f"Onboarding Follow-up: {customer_name}"
            description = f"Follow up with {customer_name} ({customer_email}) for onboarding process after successful lead closure."
            
            return create_calendar_event(
                summary=summary,
                start_time=start_time,
                end_time=end_time,
                description=description,
                attendees=[{"email": customer_email}]
            )
            
        elif lead_status.lower() == "closed_lost":
            # Schedule nurture follow-up
            start_time = (datetime.now() + timedelta(weeks=2)).isoformat()
            end_time = (datetime.now() + timedelta(weeks=2, hours=1)).isoformat()
            
            summary = f"Nurture Follow-up: {customer_name}"
            description = f"Follow up with {customer_name} ({customer_email}) to maintain relationship after lead closure."
            
            return create_calendar_event(
                summary=summary,
                start_time=start_time,
                end_time=end_time,
                description=description
            )
            
        return False
        
    except Exception as e:
        print(f"Lead follow-up scheduling error: {e}")
        return False

def schedule_ticket_escalation_followup(ticket_id, customer_name, customer_email, escalation_reason):
    """
    Schedule follow-up task when support ticket escalates
    """
    try:
        # Schedule escalation follow-up within 4 hours
        start_time = (datetime.now() + timedelta(hours=4)).isoformat()
        end_time = (datetime.now() + timedelta(hours=4, minutes=30)).isoformat()
        
        summary = f"Escalation Follow-up: Ticket #{ticket_id}"
        description = f"""
        Escalated ticket follow-up required:
        - Customer: {customer_name} ({customer_email})
        - Ticket ID: {ticket_id}
        - Escalation Reason: {escalation_reason}
        - Priority: High
        """
        
        return create_calendar_event(
            summary=summary,
            start_time=start_time,
            end_time=end_time,
            description=description,
            attendees=[{"email": customer_email}]
        )
        
    except Exception as e:
        print(f"Ticket escalation scheduling error: {e}")
        return False

def schedule_quote_followup(customer_name, customer_email, quote_id, days_ahead=3):
    """
    Schedule follow-up task for quote responses
    """
    try:
        start_time = (datetime.now() + timedelta(days=days_ahead)).isoformat()
        end_time = (datetime.now() + timedelta(days=days_ahead, minutes=30)).isoformat()
        
        summary = f"Quote Follow-up: {customer_name} - Quote #{quote_id}"
        description = f"Follow up with {customer_name} ({customer_email}) regarding Quote #{quote_id}"
        
        return create_calendar_event(
            summary=summary,
            start_time=start_time,
            end_time=end_time,
            description=description,
            attendees=[{"email": customer_email}]
        )
        
    except Exception as e:
        print(f"Quote follow-up scheduling error: {e}")
        return False

def schedule_recurring_check_in(customer_name, customer_email, frequency="monthly"):
    """
    Schedule recurring check-in events
    """
    try:
        frequency_map = {
            "weekly": 7,
            "monthly": 30,
            "quarterly": 90
        }
        
        days_ahead = frequency_map.get(frequency, 30)
        
        start_time = (datetime.now() + timedelta(days=days_ahead)).isoformat()
        end_time = (datetime.now() + timedelta(days=days_ahead, minutes=45)).isoformat()
        
        summary = f"Customer Check-in: {customer_name}"
        description = f"Scheduled {frequency} check-in with {customer_name} ({customer_email})"
        
        return create_calendar_event(
            summary=summary,
            start_time=start_time,
            end_time=end_time,
            description=description,
            attendees=[{"email": customer_email}]
        )
        
    except Exception as e:
        print(f"Recurring check-in scheduling error: {e}")
        return False

if __name__ == "__main__":
    # Test calendar event creation
    test_start = (datetime.now() + timedelta(hours=2)).isoformat()
    test_end = (datetime.now() + timedelta(hours=3)).isoformat()
    
    result = create_calendar_event(
        summary="Test Follow-up Task",
        start_time=test_start,
        end_time=test_end,
        description="Test calendar integration"
    )
    
    print(f"Test result: {result}")