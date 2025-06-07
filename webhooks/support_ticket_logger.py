#!/usr/bin/env python3
"""
Support Ticket Logger - Logs support tickets to YoBot Command Center
"""

import os
import requests
from datetime import datetime

def log_support_ticket(ticket_id, submitted_by, channel, ticket_type, description, assigned_rep=None, resolved=False, resolution_notes=""):
    """Log support tickets to Airtable"""
    from datetime import datetime
    import requests
    import os

    payload = {
        "fields": {
            "Ticket ID": ticket_id,
            "Submitted By": submitted_by,
            "Submission Channel": channel,
            "Ticket Type": ticket_type,
            "Description": description,
            "Submitted Date": datetime.utcnow().isoformat(),
            "Resolution Status": "Resolved" if resolved else "Pending",
            "Resolution Notes": resolution_notes,
            "Resolved Date": datetime.utcnow().isoformat() if resolved else None,
            "Assigned Rep": assigned_rep or ""
        }
    }

    response = requests.post(
        f"https://api.airtable.com/v0/{os.getenv('AIRTABLE_SUPPORT_LOG_BASE_ID')}/{os.getenv('AIRTABLE_SUPPORT_LOG_TABLE_ID')}",
        headers={
            "Authorization": f"Bearer {os.getenv('AIRTABLE_API_KEY')}",
            "Content-Type": "application/json"
        },
        json=payload
    )

    if response.status_code != 200:
        print("❌ Support log failed:", response.text)
        return False
    else:
        print("✅ Support ticket logged.")
        return True

def create_sample_support_tickets():
    """Create sample support tickets to demonstrate the system"""
    
    # Set environment variables
    os.environ['AIRTABLE_SUPPORT_LOG_BASE_ID'] = 'appRt8V3tH4g5Z51f'
    os.environ['AIRTABLE_SUPPORT_LOG_TABLE_ID'] = 'tblbU2C2F6YPMgLjx'
    
    api_key = os.getenv('AIRTABLE_API_KEY') or os.getenv('AIRTABLE_PERSONAL_ACCESS_TOKEN')
    if not api_key:
        print("Missing AIRTABLE_API_KEY or AIRTABLE_PERSONAL_ACCESS_TOKEN")
        return False
    
    os.environ['AIRTABLE_API_KEY'] = api_key
    
    # Sample support tickets representing real scenarios
    sample_tickets = [
        {
            "ticket_id": "TKT-001",
            "submitted_by": "client@enterprise.com",
            "channel": "Voice",
            "ticket_type": "Bug",
            "description": "Payment processing webhook not receiving Stripe events consistently. Some transactions are missing from the dashboard.",
            "assigned_rep": "Support Team",
            "resolved": True,
            "resolution_notes": "Issue resolved by updating webhook endpoint URL and verifying SSL certificate. All payment events now processing correctly."
        },
        {
            "ticket_id": "TKT-002", 
            "submitted_by": "admin@yobot.com",
            "channel": "Form",
            "ticket_type": "Feature Request",
            "description": "Request to add real-time analytics dashboard with custom KPI tracking and exportable reports.",
            "assigned_rep": "Development Team",
            "resolved": False,
            "resolution_notes": ""
        },
        {
            "ticket_id": "TKT-003",
            "submitted_by": "user@client.org",
            "channel": "Voice",
            "ticket_type": "Bug",
            "description": "AI support agent not generating responses for tickets containing special characters or emojis.",
            "assigned_rep": "AI Team",
            "resolved": True,
            "resolution_notes": "Fixed UTF-8 encoding issue in prompt processing. AI agent now handles all character sets correctly."
        },
        {
            "ticket_id": "TKT-004",
            "submitted_by": "manager@business.net",
            "channel": "Form",
            "ticket_type": "Feature Request",
            "description": "Need integration with Microsoft Teams for notifications and bot responses within Teams channels.",
            "assigned_rep": "Integration Team",
            "resolved": False,
            "resolution_notes": ""
        },
        {
            "ticket_id": "TKT-005",
            "submitted_by": "support@company.com",
            "channel": "Voice",
            "ticket_type": "Bug",
            "description": "Voice synthesis failing for certain text inputs containing technical terms and acronyms.",
            "assigned_rep": "Voice Team",
            "resolved": True,
            "resolution_notes": "Updated ElevenLabs model and added technical dictionary for improved pronunciation of industry terms."
        },
        {
            "ticket_id": "TKT-006",
            "submitted_by": "ops@enterprise.co",
            "channel": "Form",
            "ticket_type": "Feature Request",
            "description": "Request for batch contact import functionality with CSV upload and field mapping interface.",
            "assigned_rep": "Backend Team",
            "resolved": False,
            "resolution_notes": ""
        },
        {
            "ticket_id": "TKT-007",
            "submitted_by": "tech@startup.io",
            "channel": "Voice",
            "ticket_type": "Bug",
            "description": "Database connection pool exhaustion during high-traffic periods causing timeout errors.",
            "assigned_rep": "Database Team",
            "resolved": True,
            "resolution_notes": "Increased connection pool size and implemented connection recycling. Added monitoring for pool utilization."
        },
        {
            "ticket_id": "TKT-008",
            "submitted_by": "ceo@business.com",
            "channel": "Form",
            "ticket_type": "Feature Request",
            "description": "Need white-label customization options including logo, colors, and domain branding.",
            "assigned_rep": "UI/UX Team",
            "resolved": False,
            "resolution_notes": ""
        }
    ]
    
    success_count = 0
    
    print("Creating sample support tickets...")
    print("=" * 60)
    
    for i, ticket in enumerate(sample_tickets, 1):
        try:
            success = log_support_ticket(
                ticket_id=ticket["ticket_id"],
                submitted_by=ticket["submitted_by"],
                channel=ticket["channel"],
                ticket_type=ticket["ticket_type"],
                description=ticket["description"],
                assigned_rep=ticket["assigned_rep"],
                resolved=ticket["resolved"],
                resolution_notes=ticket["resolution_notes"]
            )
            
            if success:
                success_count += 1
                status = "RESOLVED" if ticket["resolved"] else "PENDING"
                print(f"SUCCESS {i:2d}/8: {ticket['ticket_id']} - {status}")
            else:
                print(f"FAILED  {i:2d}/8: {ticket['ticket_id']}")
                
        except Exception as e:
            print(f"ERROR   {i:2d}/8: {ticket['ticket_id']} - {str(e)}")
    
    print("=" * 60)
    print(f"Support ticket logging complete: {success_count}/8 tickets created")
    
    if success_count > 0:
        print(f"View tickets: https://airtable.com/appRt8V3tH4g5Z51f")
        return True
    else:
        print("No tickets created - check authentication token")
        return False

def create_escalated_tickets():
    """Create additional escalated and priority tickets"""
    
    # Set environment variables
    os.environ['AIRTABLE_SUPPORT_LOG_BASE_ID'] = 'appRt8V3tH4g5Z51f'
    os.environ['AIRTABLE_SUPPORT_LOG_TABLE_ID'] = 'tblbU2C2F6YPMgLjx'
    
    api_key = os.getenv('AIRTABLE_API_KEY') or os.getenv('AIRTABLE_PERSONAL_ACCESS_TOKEN')
    if not api_key:
        print("Missing authentication token")
        return False
    
    os.environ['AIRTABLE_API_KEY'] = api_key
    
    # Escalated and priority tickets
    escalated_tickets = [
        {
            "ticket_id": "TKT-URGENT-001",
            "submitted_by": "cto@enterprise.com",
            "channel": "Voice",
            "ticket_type": "Bug",
            "description": "URGENT: Complete system outage affecting all client services. Authentication system down.",
            "assigned_rep": "Emergency Response Team",
            "resolved": True,
            "resolution_notes": "Emergency patch deployed. Root cause: SSL certificate expiration. New cert installed and monitoring added."
        },
        {
            "ticket_id": "TKT-HIGH-002",
            "submitted_by": "operations@bigcorp.com",
            "channel": "Form",
            "ticket_type": "Bug",
            "description": "HIGH PRIORITY: Payment processing delays causing customer complaints and revenue impact.",
            "assigned_rep": "Payment Team Lead",
            "resolved": True,
            "resolution_notes": "Stripe webhook timeout increased and retry logic improved. Processing delays eliminated."
        },
        {
            "ticket_id": "TKT-CRITICAL-003",
            "submitted_by": "security@company.net",
            "channel": "Voice",
            "ticket_type": "Bug",
            "description": "CRITICAL: Potential security vulnerability in API authentication allowing unauthorized access.",
            "assigned_rep": "Security Team",
            "resolved": True,
            "resolution_notes": "Security patch deployed immediately. JWT validation strengthened and audit logs reviewed."
        }
    ]
    
    success_count = 0
    
    print("Creating escalated support tickets...")
    print("=" * 60)
    
    for i, ticket in enumerate(escalated_tickets, 1):
        try:
            success = log_support_ticket(
                ticket_id=ticket["ticket_id"],
                submitted_by=ticket["submitted_by"],
                channel=ticket["channel"],
                ticket_type=ticket["ticket_type"],
                description=ticket["description"],
                assigned_rep=ticket["assigned_rep"],
                resolved=ticket["resolved"],
                resolution_notes=ticket["resolution_notes"]
            )
            
            if success:
                success_count += 1
                print(f"SUCCESS {i:2d}/3: {ticket['ticket_id']} - RESOLVED")
            else:
                print(f"FAILED  {i:2d}/3: {ticket['ticket_id']}")
                
        except Exception as e:
            print(f"ERROR   {i:2d}/3: {ticket['ticket_id']} - {str(e)}")
    
    print("=" * 60)
    print(f"Escalated tickets complete: {success_count}/3 tickets created")
    
    return success_count > 0

if __name__ == '__main__':
    print("YoBot Support Ticket Logger")
    print("Creating comprehensive support ticket log...")
    print()
    
    # Create sample tickets
    create_sample_support_tickets()
    print()
    
    # Create escalated tickets
    create_escalated_tickets()
    
    print("\nComplete support ticket system logged to Airtable")
    print("Base: appRt8V3tH4g5Z51f | Table: tblbU2C2F6YPMgLjx")