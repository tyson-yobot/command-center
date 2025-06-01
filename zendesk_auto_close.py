import os
import requests
from datetime import datetime, timedelta
from airtable_logger import log_sales_event
from zendesk_closure_logger import log_zendesk_closure
from hubspot_logger import log_to_hubspot

ZENDESK_DOMAIN = os.getenv("ZENDESK_DOMAIN")  # e.g., yoursubdomain.zendesk.com
ZENDESK_EMAIL = os.getenv("ZENDESK_EMAIL")
ZENDESK_API_TOKEN = os.getenv("ZENDESK_API_TOKEN")

def auto_close_solved_tickets():
    """
    Find and automatically close tickets that have been solved for 48+ hours
    """
    if not all([ZENDESK_DOMAIN, ZENDESK_EMAIL, ZENDESK_API_TOKEN]):
        print("❌ Zendesk credentials missing - cannot auto-close tickets")
        return
        
    url = f"https://{ZENDESK_DOMAIN}/api/v2/search.json?query=type:ticket status:solved updated<{get_cutoff()}"
    auth = (f"{ZENDESK_EMAIL}/token", ZENDESK_API_TOKEN)

    try:
        res = requests.get(url, auth=auth)
        tickets = res.json().get("results", [])
        
        closed_count = 0
        for ticket in tickets:
            ticket_id = ticket["id"]
            subject = ticket.get("subject", "No subject")
            
            # Close the ticket
            close_url = f"https://{ZENDESK_DOMAIN}/api/v2/tickets/{ticket_id}.json"
            payload = {
                "ticket": {
                    "status": "closed",
                    "comment": {
                        "body": "This ticket has been automatically closed after being solved for 48 hours. If you need further assistance, please reply to reopen.",
                        "public": False
                    }
                }
            }
            
            close_res = requests.put(close_url, auth=auth, json=payload)
            
            if close_res.status_code == 200:
                print(f"✅ Ticket {ticket_id} auto-closed successfully")
                closed_count += 1
                
                # Log the closure to Airtable
                log_sales_event(
                    event_type="🎟️ Zendesk Auto-Close",
                    sales_order_id=str(ticket_id),
                    source_id=f"zendesk_{ticket_id}",
                    amount=0,
                    notes=f"Auto-closed after 48h solved - Subject: {subject[:100]}"
                )
                
                # Send Slack alert for the closure
                send_slack_alert(ticket_id, subject)
                
                # Log closure to dedicated Airtable table
                log_zendesk_closure(ticket_id, subject, ticket.get("updated_at", ""))
                
                # Log closure activity to HubSpot CRM
                log_to_hubspot(ticket_id, subject, ticket.get("updated_at", ""))
                
            else:
                print(f"❌ Failed to close ticket {ticket_id}: {close_res.status_code}")
        
        print(f"📊 Auto-close completed: {closed_count} tickets closed")
        
        # Log summary
        if closed_count > 0:
            log_sales_event(
                event_type="📊 Auto-Close Summary",
                sales_order_id="batch_operation",
                source_id="zendesk_automation",
                amount=closed_count,
                notes=f"Batch auto-close completed - {closed_count} tickets processed"
            )
            
    except Exception as e:
        print(f"❌ Auto-close operation failed: {e}")
        log_sales_event(
            event_type="❌ Auto-Close Error",
            sales_order_id="",
            source_id="zendesk_automation",
            amount=0,
            notes=f"Auto-close failed: {str(e)}"
        )

def get_cutoff():
    """
    Get cutoff timestamp for tickets solved 48+ hours ago
    """
    cutoff = datetime.utcnow() - timedelta(hours=48)
    return cutoff.strftime('%Y-%m-%dT%H:%M:%SZ')

def send_slack_alert(ticket_id, subject):
    """
    Send Slack notification for auto-closed ticket
    """
    webhook_url = os.getenv("SLACK_WEBHOOK_URL")
    
    if not webhook_url:
        print("⚠️ Slack webhook URL not configured")
        return
        
    message = {
        "text": f"🎯 *Zendesk Ticket Auto-Closed*\nTicket ID: {ticket_id}\nSubject: {subject[:100]}...\nReason: Solved for 48+ hours"
    }
    
    try:
        response = requests.post(webhook_url, json=message)
        if response.status_code == 200:
            print(f"✅ Slack alert sent for ticket {ticket_id}")
        else:
            print(f"⚠️ Slack alert failed: {response.status_code}")
    except Exception as e:
        print(f"⚠️ Slack alert error: {e}")

if __name__ == "__main__":
    print("🔄 Starting Zendesk auto-close process...")
    auto_close_solved_tickets()
    print("✅ Auto-close process completed")