import requests
import os

HUBSPOT_API_KEY = os.getenv('HUBSPOT_API_KEY')
HUBSPOT_URL = "https://api.hubapi.com/crm/v3/objects/contacts"

def create_hubspot_contact(contact_name, email, company_name, phone, selected_package, selected_addons):
    """Create HubSpot contact with YoBot package information"""
    
    if not HUBSPOT_API_KEY:
        raise Exception("HubSpot API key not configured")
    
    # Split name into first and last
    name_parts = contact_name.split(" ")
    firstname = name_parts[0] if name_parts else contact_name
    lastname = name_parts[-1] if len(name_parts) > 1 else ""
    
    hubspot_payload = {
        "properties": {
            "email": email,
            "firstname": firstname,
            "lastname": lastname,
            "company": company_name,
            "phone": phone,
            "yobot_package": selected_package,
            "addons": ", ".join(selected_addons) if selected_addons else "",
        }
    }

    hubspot_headers = {
        "Authorization": f"Bearer {HUBSPOT_API_KEY}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(HUBSPOT_URL, headers=hubspot_headers, json=hubspot_payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise Exception(f"HubSpot contact creation failed: {str(e)}")

def push_to_hubspot(quote_data):
    """Create HubSpot contact and deal from quote data"""
    
    if not HUBSPOT_API_KEY:
        raise Exception("HubSpot API key not configured")
    
    hubspot_headers = {
        "Authorization": f"Bearer {HUBSPOT_API_KEY}",
        "Content-Type": "application/json"
    }

    # Create contact
    contact_payload = {
        "properties": {
            "email": quote_data["email"],
            "firstname": quote_data["contact_name"].split()[0],
            "lastname": quote_data["contact_name"].split()[-1],
            "company": quote_data["company_name"]
        }
    }

    contact_res = requests.post(
        "https://api.hubapi.com/crm/v3/objects/contacts",
        headers=hubspot_headers,
        json=contact_payload
    )
    
    if not contact_res.ok:
        raise Exception(f"HubSpot contact creation failed: {contact_res.text}")

    contact_id = contact_res.json()["id"]

    # Create deal
    deal_payload = {
        "properties": {
            "dealname": f"YoBot Quote – {quote_data['company_name']}",
            "amount": quote_data["total"],
            "dealstage": "presentationscheduled",
            "pipeline": "default"
        },
        "associations": [
            {
                "to": {"id": contact_id},
                "types": [{"associationCategory": "HUBSPOT_DEFINED", "associationTypeId": 3}]
            }
        ]
    }

    deal_res = requests.post(
        "https://api.hubapi.com/crm/v3/objects/deals",
        headers=hubspot_headers,
        json=deal_payload
    )
    
    if not deal_res.ok:
        raise Exception(f"HubSpot deal creation failed: {deal_res.text}")

    return {
        "contact_id": contact_id,
        "deal_id": deal_res.json()["id"],
        "status": "success"
    }

def update_hubspot_contact(contact_id, updates):
    """Update existing HubSpot contact"""
    
    if not HUBSPOT_API_KEY:
        raise Exception("HubSpot API key not configured")
    
    url = f"{HUBSPOT_URL}/{contact_id}"
    
    hubspot_headers = {
        "Authorization": f"Bearer {HUBSPOT_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {"properties": updates}
    
    try:
        response = requests.patch(url, headers=hubspot_headers, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise Exception(f"HubSpot contact update failed: {str(e)}")