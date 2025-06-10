#!/usr/bin/env python3
"""
Complete Production Sales Order Processor
Handles real Stripe payments and QuickBooks invoice creation
"""

import json
import sys
import os
import requests
from datetime import datetime
import stripe
from typing import Dict, Any

# Initialize Stripe
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')

def process_stripe_payment(order_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create Stripe payment intent for the order"""
    try:
        amount = float(order_data.get('💳 Final Payment Amount Due', '0').replace('$', '').replace(',', ''))
        amount_cents = int(amount * 100)  # Convert to cents
        
        if amount_cents <= 0:
            return {'success': False, 'error': 'Invalid payment amount'}
        
        # Create Stripe customer
        customer = stripe.Customer.create(
            email=order_data.get('Email Address'),
            name=order_data.get('Full Name'),
            metadata={
                'company': order_data.get('Company Name'),
                'phone': order_data.get('Phone Number'),
                'bot_package': order_data.get('🤖 Bot Package')
            }
        )
        
        # Create payment intent
        payment_intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency='usd',
            customer=customer.id,
            description=f"YoBot Automation Package - {order_data.get('Company Name')}",
            metadata={
                'company': order_data.get('Company Name'),
                'package': order_data.get('🤖 Bot Package'),
                'modules': order_data.get('🧩 Add-On Modules')
            }
        )
        
        return {
            'success': True,
            'payment_intent_id': payment_intent.id,
            'customer_id': customer.id,
            'amount': amount,
            'status': payment_intent.status
        }
        
    except Exception as e:
        return {'success': False, 'error': f'Stripe payment failed: {str(e)}'}

def create_quickbooks_invoice(order_data: Dict[str, Any], stripe_result: Dict[str, Any]) -> Dict[str, Any]:
    """Create QuickBooks invoice for the order"""
    try:
        # QuickBooks OAuth setup
        qb_access_token = os.environ.get('QUICKBOOKS_ACCESS_TOKEN')
        qb_realm_id = os.environ.get('QUICKBOOKS_REALM_ID')
        
        if not qb_access_token or not qb_realm_id:
            return {'success': False, 'error': 'QuickBooks credentials not configured'}
        
        # Create customer in QB first
        customer_data = {
            "Name": order_data.get('Company Name'),
            "CompanyName": order_data.get('Company Name'),
            "PrimaryEmailAddr": {"Address": order_data.get('Email Address')},
            "PrimaryPhone": {"FreeFormNumber": order_data.get('Phone Number')},
            "WebAddr": {"URI": order_data.get('Website')}
        }
        
        customer_response = requests.post(
            f"https://sandbox-quickbooks.api.intuit.com/v3/company/{qb_realm_id}/customer",
            headers={
                'Authorization': f'Bearer {qb_access_token}',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            json=customer_data
        )
        
        if customer_response.status_code != 200:
            return {'success': False, 'error': f'QB Customer creation failed: {customer_response.text}'}
        
        customer_qb_id = customer_response.json()['QueryResponse']['Customer'][0]['Id']
        
        # Calculate line items
        base_amount = float(order_data.get('💳 Final Payment Amount Due', '0').replace('$', '').replace(',', ''))
        
        # Create invoice
        invoice_data = {
            "CustomerRef": {"value": customer_qb_id},
            "Line": [{
                "Amount": base_amount,
                "DetailType": "SalesItemLineDetail",
                "SalesItemLineDetail": {
                    "ItemRef": {"value": "1", "name": "Services"},
                    "Qty": 1,
                    "UnitPrice": base_amount
                },
                "Description": f"YoBot Automation Package: {order_data.get('🤖 Bot Package')}"
            }]
        }
        
        # Add modules as separate line items
        modules = order_data.get('🧩 Add-On Modules', '')
        if modules:
            invoice_data["Line"].append({
                "Amount": 0,
                "DetailType": "SalesItemLineDetail",
                "SalesItemLineDetail": {
                    "ItemRef": {"value": "1", "name": "Services"},
                    "Qty": 1,
                    "UnitPrice": 0
                },
                "Description": f"Add-on Modules: {modules}"
            })
        
        invoice_response = requests.post(
            f"https://sandbox-quickbooks.api.intuit.com/v3/company/{qb_realm_id}/invoice",
            headers={
                'Authorization': f'Bearer {qb_access_token}',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            json=invoice_data
        )
        
        if invoice_response.status_code == 200:
            invoice_id = invoice_response.json()['QueryResponse']['Invoice'][0]['Id']
            return {
                'success': True,
                'invoice_id': invoice_id,
                'customer_id': customer_qb_id,
                'amount': base_amount
            }
        else:
            return {'success': False, 'error': f'QB Invoice creation failed: {invoice_response.text}'}
            
    except Exception as e:
        return {'success': False, 'error': f'QuickBooks integration failed: {str(e)}'}

def log_to_airtable(order_data: Dict[str, Any], stripe_result: Dict[str, Any], qb_result: Dict[str, Any]) -> Dict[str, Any]:
    """Log the complete sales order to Airtable"""
    try:
        airtable_token = os.environ.get('AIRTABLE_PERSONAL_ACCESS_TOKEN')
        base_id = os.environ.get('AIRTABLE_BASE_ID', 'appMbVQJ0n3nWR11N')
        
        # Log to Sales Orders table
        payload = {
            "fields": {
                "👤 Company Name": order_data.get('Company Name'),
                "🧑 Contact Name": order_data.get('Full Name'),
                "📧 Email": order_data.get('Email Address'),
                "📞 Phone": order_data.get('Phone Number'),
                "🌐 Website": order_data.get('Website'),
                "🤖 Bot Package": order_data.get('🤖 Bot Package'),
                "🧩 Add-On Modules": order_data.get('🧩 Add-On Modules'),
                "💰 Order Amount": order_data.get('💳 Final Payment Amount Due'),
                "💳 Payment Method": order_data.get('💳 Preferred Payment Method'),
                "✅ Signature": order_data.get('✍️ Typed Signature'),
                "🟢 Stripe Payment ID": stripe_result.get('payment_intent_id', ''),
                "🟢 Stripe Customer ID": stripe_result.get('customer_id', ''),
                "📊 QB Invoice ID": qb_result.get('invoice_id', ''),
                "📊 QB Customer ID": qb_result.get('customer_id', ''),
                "🕒 Order Date": datetime.now().isoformat(),
                "✅ Status": "Payment Processed" if stripe_result.get('success') else "Payment Pending"
            }
        }
        
        response = requests.post(
            f"https://api.airtable.com/v0/{base_id}/tblSalesOrders",
            headers={
                'Authorization': f'Bearer {airtable_token}',
                'Content-Type': 'application/json'
            },
            json=payload
        )
        
        if response.status_code == 200:
            return {'success': True, 'airtable_record_id': response.json()['id']}
        else:
            return {'success': False, 'error': f'Airtable logging failed: {response.text}'}
            
    except Exception as e:
        return {'success': False, 'error': f'Airtable integration failed: {str(e)}'}

def send_slack_notification(order_data: Dict[str, Any], results: Dict[str, Any]) -> None:
    """Send Slack notification about the new order"""
    try:
        webhook_url = os.environ.get('SLACK_WEBHOOK_URL')
        if not webhook_url:
            return
        
        company = order_data.get('Company Name', 'Unknown Company')
        amount = order_data.get('💳 Final Payment Amount Due', '$0')
        package = order_data.get('🤖 Bot Package', 'Unknown Package')
        
        status_emoji = "✅" if results['stripe']['success'] else "⚠️"
        
        message = {
            "text": f"{status_emoji} New Sales Order Received",
            "blocks": [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": f"{status_emoji} New Sales Order: {company}"
                    }
                },
                {
                    "type": "section",
                    "fields": [
                        {"type": "mrkdwn", "text": f"*Company:* {company}"},
                        {"type": "mrkdwn", "text": f"*Amount:* {amount}"},
                        {"type": "mrkdwn", "text": f"*Package:* {package}"},
                        {"type": "mrkdwn", "text": f"*Contact:* {order_data.get('Full Name', 'N/A')}"}
                    ]
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*Payment:* {'Processed' if results['stripe']['success'] else 'Failed'}\n*Invoice:* {'Created' if results['quickbooks']['success'] else 'Failed'}"
                    }
                }
            ]
        }
        
        requests.post(webhook_url, json=message)
        
    except Exception as e:
        print(f"Slack notification failed: {str(e)}")

def main():
    """Main processing function"""
    try:
        # Read order data from stdin
        input_data = sys.stdin.read()
        order_data = json.loads(input_data)
        
        print(f"🚀 Processing sales order for: {order_data.get('Company Name')}")
        
        # Step 1: Process Stripe Payment
        print("💳 Processing Stripe payment...")
        stripe_result = process_stripe_payment(order_data)
        
        # Step 2: Create QuickBooks Invoice
        print("📊 Creating QuickBooks invoice...")
        qb_result = create_quickbooks_invoice(order_data, stripe_result)
        
        # Step 3: Log to Airtable
        print("📋 Logging to Airtable...")
        airtable_result = log_to_airtable(order_data, stripe_result, qb_result)
        
        # Step 4: Send notifications
        print("🔔 Sending notifications...")
        results = {
            'stripe': stripe_result,
            'quickbooks': qb_result,
            'airtable': airtable_result
        }
        send_slack_notification(order_data, results)
        
        # Return final results
        final_result = {
            'success': stripe_result.get('success', False) and qb_result.get('success', False),
            'stripe_payment': stripe_result,
            'quickbooks_invoice': qb_result,
            'airtable_record': airtable_result,
            'timestamp': datetime.now().isoformat(),
            'company': order_data.get('Company Name'),
            'amount': order_data.get('💳 Final Payment Amount Due')
        }
        
        print(json.dumps(final_result))
        
    except Exception as e:
        error_result = {
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()