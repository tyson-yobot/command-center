#!/usr/bin/env python3
"""
Fix All Webhook Endpoints to Use Working Airtable Table
Updates all webhook endpoints to use the existing tbldPRZ4nHbtj9opU table
"""

import re

def update_webhook_endpoints():
    """Update server/routes.ts to fix all webhook endpoints"""
    
    # Read the current routes file
    with open('server/routes.ts', 'r') as f:
        content = f.read()
    
    # Define replacement patterns for each endpoint type
    replacements = [
        # Awarded Project endpoint
        (
            r'await axios\.post\(\s*`https://api\.airtable\.com/v0/appRt8V3tH4g5Z5if/tblAwardedProjects`,\s*{\s*fields:\s*{\s*"📋 Project Name":[^}]+}\s*},',
            '''await axios.post(
        `https://api.airtable.com/v0/appRt8V3tH4g5Z5if/tbldPRZ4nHbtj9opU/`,
        {
          fields: {
            "👤 Full Name": client_name,
            "📧 Email": "project@awarded.com",
            "📞 Phone": "Project",
            "📥 Lead Source": `Awarded Project - ${project_name} - $${project_value}`
          }
        },'''
        ),
        
        # Feature Request endpoint
        (
            r'await axios\.post\(\s*`https://api\.airtable\.com/v0/appRt8V3tH4g5Z5if/tblFeatureRequests`,\s*{\s*fields:\s*{\s*"💡 Feature Name":[^}]+}\s*},',
            '''await axios.post(
        `https://api.airtable.com/v0/appRt8V3tH4g5Z5if/tbldPRZ4nHbtj9opU/`,
        {
          fields: {
            "👤 Full Name": requester_name,
            "📧 Email": "feature@request.com",
            "📞 Phone": priority,
            "📥 Lead Source": `Feature Request - ${feature_name}`
          }
        },'''
        ),
        
        # Dashboard Intake endpoint
        (
            r'await axios\.post\(\s*`https://api\.airtable\.com/v0/appRt8V3tH4g5Z5if/tblDashboardIntake`,\s*{\s*fields:\s*{\s*"👤 Client Name":[^}]+}\s*},',
            '''await axios.post(
        `https://api.airtable.com/v0/appRt8V3tH4g5Z5if/tbldPRZ4nHbtj9opU/`,
        {
          fields: {
            "👤 Full Name": client_name,
            "📧 Email": "dashboard@intake.com",
            "📞 Phone": "Dashboard",
            "📥 Lead Source": `Dashboard Intake - ${dashboard_type}`
          }
        },'''
        ),
        
        # Contact Form endpoint
        (
            r'await axios\.post\(\s*`https://api\.airtable\.com/v0/appRt8V3tH4g5Z5if/tblContactForms`,\s*{\s*fields:\s*{\s*"👤 Name":[^}]+}\s*},',
            '''await axios.post(
        `https://api.airtable.com/v0/appRt8V3tH4g5Z5if/tbldPRZ4nHbtj9opU/`,
        {
          fields: {
            "👤 Full Name": name,
            "📧 Email": email,
            "📞 Phone": contact_type || "General",
            "📥 Lead Source": `Contact Form - ${subject}`
          }
        },'''
        ),
        
        # SmartSpend Charge endpoint
        (
            r'await axios\.post\(\s*`https://api\.airtable\.com/v0/appRt8V3tH4g5Z5if/tblSmartSpendCharges`,\s*{\s*fields:\s*{\s*"👤 Client Name":[^}]+}\s*},',
            '''await axios.post(
        `https://api.airtable.com/v0/appRt8V3tH4g5Z5if/tbldPRZ4nHbtj9opU/`,
        {
          fields: {
            "👤 Full Name": client_name,
            "📧 Email": "smartspend@charge.com",
            "📞 Phone": category,
            "📥 Lead Source": `SmartSpend Charge - $${charge_amount}`
          }
        },'''
        )
    ]
    
    # Apply all replacements
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    # Write back to file
    with open('server/routes.ts', 'w') as f:
        f.write(content)
    
    print("✅ All webhook endpoints updated to use working Airtable table")

if __name__ == "__main__":
    update_webhook_endpoints()