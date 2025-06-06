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

        # Extract core fields
        company_name = fields.get('Company Name')
        contact_name = fields.get('Contact Name')
        email = fields.get('Email')
        phone = fields.get('Phone Number')
        bot_package = fields.get('🤖 Bot Package Selected')
        selected_addons = [label for label, value in fields.items() if value is True and 'Add-On' in label]

        # Timestamp & Quote ID
        current_date = datetime.now().strftime('%Y-%m-%d')
        quote_id = f"Q-{datetime.now().strftime('%Y%m%d')}-001"

        # Log extracted info
        result = {
            "status": "success",
            "message": "Sales order processed successfully",
            "data": {
                "company": company_name,
                "contact": contact_name,
                "email": email,
                "phone": phone,
                "package": bot_package,
                "addons": selected_addons,
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