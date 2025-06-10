from flask import Flask, request, jsonify
from datetime import datetime
import json
import sys

def handle_sales_order():
    """
    Handle incoming sales order webhook from Tally forms
    """
    try:
        # Read data from stdin for integration with Node.js server
        if len(sys.argv) > 1:
            # Called with data as argument
            data = json.loads(sys.argv[1])
        else:
            # Read from stdin
            data = json.load(sys.stdin)
        
        fields = {item['label']: item['value'] for item in data.get('fieldsArray', [])}

        # Extract core fields with improved Tally parsing
        company_name = fields.get('Company Name')
        contact_name = fields.get('Full Name')
        email = fields.get('Email Address')
        phone = fields.get('Phone Number')
        website = fields.get('Website')
        bot_package = fields.get('Which YoBot® Package would you like to start with?')
        selected_addons = [label for label, value in fields.items() if value is True and 'Add-On' in label]
        custom_notes = fields.get('Custom Notes or Special Requests (Optional)')
        requested_start_date = fields.get('Requested Start Date (Optional)')
        payment_method = fields.get('Preferred Payment Method')
        one_time_payment = fields.get('💳 One-Time Payment Amount')
        monthly_recurring = fields.get('📆 Monthly Recurring Cost')
        grand_total = fields.get('💰 Final Quote Total')

        # Timestamp & Quote ID
        current_date = datetime.now().strftime('%Y-%m-%d')
        quote_id = f"Q-{datetime.now().strftime('%Y%m%d')}-001"

        # Log extracted info with enhanced data structure including pricing
        result = {
            "status": "success",
            "message": "Sales order processed successfully",
            "data": {
                "company": company_name,
                "contact": contact_name,
                "email": email,
                "phone": phone,
                "website": website,
                "package": bot_package,
                "addons": selected_addons,
                "custom_notes": custom_notes,
                "requested_start_date": requested_start_date,
                "payment_method": payment_method,
                "one_time_payment": one_time_payment,
                "monthly_recurring": monthly_recurring,
                "grand_total": grand_total,
                "date": current_date,
                "quote_id": quote_id
            }
        }

        print(json.dumps(result))
        return result

    except Exception as e:
        error_result = {
            "status": "error", 
            "message": str(e)
        }
        print(json.dumps(error_result))
        return error_result

if __name__ == "__main__":
    handle_sales_order()