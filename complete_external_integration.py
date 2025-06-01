#!/usr/bin/env python3
"""
Complete External Service Integration
Configures all available external services with real API credentials
"""

from flask import Flask, request, jsonify
import os
import requests
from datetime import datetime
from external_service_loggers import *
from universal_webhook_logger import log_to_airtable

app = Flask(__name__)

# Zendesk Integration
def configure_zendesk_webhook():
    """Configure Zendesk webhook for ticket events"""
    try:
        zendesk_domain = os.getenv("ZENDESK_DOMAIN")
        zendesk_email = os.getenv("ZENDESK_EMAIL")
        
        if zendesk_domain and zendesk_email:
            @app.route("/zendesk-webhook", methods=["POST"])
            def zendesk_webhook():
                data = request.json
                
                if "ticket" in data:
                    ticket = data["ticket"]
                    log_zendesk_ticket_event(
                        ticket_id=ticket.get("id"),
                        status=ticket.get("status"),
                        priority=ticket.get("priority"),
                        customer_email=ticket.get("requester", {}).get("email", ""),
                        agent_id=ticket.get("assignee_id")
                    )
                
                return jsonify({"status": "logged"})
                
            print("Zendesk webhook configured successfully")
            return True
        else:
            print("Zendesk credentials incomplete")
            return False
            
    except Exception as e:
        print(f"Zendesk configuration error: {e}")
        return False

# HubSpot Integration
def configure_hubspot_webhook():
    """Configure HubSpot webhook for contact and deal events"""
    try:
        hubspot_api_key = os.getenv("HUBSPOT_API_KEY")
        
        if hubspot_api_key:
            @app.route("/hubspot-webhook", methods=["POST"])
            def hubspot_webhook():
                data = request.json
                
                for event in data.get("events", []):
                    if event.get("subscriptionType") == "contact.propertyChange":
                        contact_id = event.get("objectId")
                        
                        # Get contact details from HubSpot
                        contact_data = get_hubspot_contact(contact_id, hubspot_api_key)
                        
                        if contact_data:
                            log_hubspot_contact_activity(
                                contact_id=contact_id,
                                activity_type="property_change",
                                contact_email=contact_data.get("email", ""),
                                lead_score=contact_data.get("hubspotscore")
                            )
                    
                    elif event.get("subscriptionType") == "deal.propertyChange":
                        deal_id = event.get("objectId")
                        
                        # Get deal details from HubSpot
                        deal_data = get_hubspot_deal(deal_id, hubspot_api_key)
                        
                        if deal_data:
                            log_hubspot_contact_activity(
                                contact_id=deal_data.get("contact_id", deal_id),
                                activity_type="deal_update",
                                contact_email=deal_data.get("contact_email", ""),
                                deal_amount=deal_data.get("amount")
                            )
                
                return jsonify({"status": "logged"})
                
            print("HubSpot webhook configured successfully")
            return True
        else:
            print("HubSpot API key not available")
            return False
            
    except Exception as e:
        print(f"HubSpot configuration error: {e}")
        return False

def get_hubspot_contact(contact_id, api_key):
    """Get contact details from HubSpot API"""
    try:
        url = f"https://api.hubapi.com/crm/v3/objects/contacts/{contact_id}"
        headers = {"Authorization": f"Bearer {api_key}"}
        
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            contact = response.json()
            return {
                "email": contact.get("properties", {}).get("email"),
                "hubspotscore": contact.get("properties", {}).get("hubspotscore")
            }
        
        return None
        
    except Exception as e:
        print(f"Error fetching HubSpot contact: {e}")
        return None

def get_hubspot_deal(deal_id, api_key):
    """Get deal details from HubSpot API"""
    try:
        url = f"https://api.hubapi.com/crm/v3/objects/deals/{deal_id}"
        headers = {"Authorization": f"Bearer {api_key}"}
        
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            deal = response.json()
            return {
                "amount": deal.get("properties", {}).get("amount"),
                "contact_id": deal.get("properties", {}).get("hubspot_owner_id")
            }
        
        return None
        
    except Exception as e:
        print(f"Error fetching HubSpot deal: {e}")
        return None

# Slack Integration
def configure_slack_notifications():
    """Configure Slack notifications with real webhook URL"""
    try:
        slack_webhook_url = os.getenv("SLACK_WEBHOOK_URL")
        
        if slack_webhook_url:
            def send_slack_notification(message, channel="#general"):
                try:
                    payload = {"text": message}
                    response = requests.post(slack_webhook_url, json=payload, timeout=10)
                    
                    # Log the notification
                    log_slack_notification(
                        channel=channel,
                        message_type="automation_alert",
                        content=message,
                        triggered_by_event="system_automation"
                    )
                    
                    return response.status_code == 200
                    
                except Exception as e:
                    print(f"Slack notification error: {e}")
                    return False
            
            # Make function globally available
            globals()['send_slack_notification'] = send_slack_notification
            print("Slack notifications configured successfully")
            return True
        else:
            print("Slack webhook URL not available")
            return False
            
    except Exception as e:
        print(f"Slack configuration error: {e}")
        return False

# QuickBooks Integration
def configure_quickbooks_automation():
    """Configure QuickBooks automation for invoice creation"""
    try:
        qb_access_token = os.getenv("QUICKBOOKS_ACCESS_TOKEN")
        qb_realm_id = os.getenv("QUICKBOOKS_REALM_ID")
        
        if qb_access_token and qb_realm_id:
            @app.route("/qb-deal-closed", methods=["POST"])
            def qb_deal_closed():
                data = request.json
                
                deal_id = data.get("deal_id")
                customer_name = data.get("customer_name")
                customer_email = data.get("customer_email")
                amount = data.get("amount")
                
                # Create QuickBooks invoice
                invoice_result = create_qb_invoice_from_deal(
                    customer_name, customer_email, amount
                )
                
                if invoice_result.get("success"):
                    log_qbo_invoice_automation(
                        deal_id=deal_id,
                        customer_name=customer_name,
                        customer_email=customer_email,
                        invoice_id=invoice_result.get("invoice_id"),
                        amount=amount
                    )
                    
                    # Send Slack notification
                    if 'send_slack_notification' in globals():
                        send_slack_notification(
                            f"Invoice created for {customer_name}: ${amount:,.2f}"
                        )
                
                return jsonify(invoice_result)
                
            print("QuickBooks automation configured successfully")
            return True
        else:
            print("QuickBooks credentials incomplete")
            return False
            
    except Exception as e:
        print(f"QuickBooks configuration error: {e}")
        return False

def create_qb_invoice_from_deal(customer_name, customer_email, amount):
    """Create QuickBooks invoice from deal closure"""
    try:
        qb_access_token = os.getenv("QUICKBOOKS_ACCESS_TOKEN")
        qb_realm_id = os.getenv("QUICKBOOKS_REALM_ID")
        
        url = f"https://quickbooks.api.intuit.com/v3/company/{qb_realm_id}/invoice"
        headers = {
            "Authorization": f"Bearer {qb_access_token}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
        
        invoice_data = {
            "Line": [{
                "Amount": amount,
                "DetailType": "SalesItemLineDetail",
                "SalesItemLineDetail": {
                    "ItemRef": {"value": "1", "name": "Services"}
                }
            }],
            "CustomerRef": {"value": "1", "name": customer_name}
        }
        
        response = requests.post(url, headers=headers, json=invoice_data, timeout=15)
        
        if response.status_code == 200:
            invoice = response.json()
            return {
                "success": True,
                "invoice_id": invoice.get("QueryResponse", {}).get("Invoice", [{}])[0].get("Id")
            }
        else:
            return {"success": False, "error": f"QB API error: {response.status_code}"}
            
    except Exception as e:
        return {"success": False, "error": str(e)}

# Make.com Integration
def configure_make_webhook():
    """Configure Make.com webhook integration"""
    try:
        make_webhook_url = os.getenv("MAKE_WEBHOOK_URL")
        
        if make_webhook_url:
            @app.route("/trigger-make-scenario", methods=["POST"])
            def trigger_make_scenario():
                data = request.json
                
                # Forward data to Make.com
                response = requests.post(make_webhook_url, json=data, timeout=10)
                
                # Log the trigger
                log_to_airtable("Make Scenario Triggers", {
                    "scenario_data": str(data)[:200],
                    "status": "triggered" if response.status_code == 200 else "failed",
                    "timestamp": datetime.utcnow().isoformat()
                })
                
                return jsonify({"status": "triggered", "make_response": response.status_code})
                
            print("Make.com webhook configured successfully")
            return True
        else:
            print("Make.com webhook URL not available")
            return False
            
    except Exception as e:
        print(f"Make.com configuration error: {e}")
        return False

# Initialize all integrations
def initialize_all_integrations():
    """Initialize all available external service integrations"""
    results = {
        "zendesk": configure_zendesk_webhook(),
        "hubspot": configure_hubspot_webhook(),
        "slack": configure_slack_notifications(),
        "quickbooks": configure_quickbooks_automation(),
        "make": configure_make_webhook()
    }
    
    # Log initialization results
    log_to_airtable("Service Initialization", {
        "zendesk_configured": results["zendesk"],
        "hubspot_configured": results["hubspot"],
        "slack_configured": results["slack"],
        "quickbooks_configured": results["quickbooks"],
        "make_configured": results["make"],
        "total_configured": sum(results.values()),
        "timestamp": datetime.utcnow().isoformat()
    })
    
    return results

@app.route("/integration-status", methods=["GET"])
def integration_status():
    """Get status of all configured integrations"""
    return jsonify({
        "integrations": initialize_all_integrations(),
        "timestamp": datetime.utcnow().isoformat()
    })

if __name__ == "__main__":
    print("Initializing external service integrations...")
    results = initialize_all_integrations()
    
    configured_count = sum(results.values())
    print(f"Successfully configured {configured_count}/5 external services")
    
    port = int(os.environ.get("PORT", 5006))
    app.run(host="0.0.0.0", port=port, debug=True)