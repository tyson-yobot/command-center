"""
Enhanced PDF Quote Generator for YoBot Sales Order Automation
Generates professional quotes with YoBot branding and structured pricing
"""

import os
from datetime import datetime
from reportlab.lib.pagesizes import LETTER
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
import json

def generate_professional_quote_pdf(client_data, package_info, addon_list, pdf_path):
    """
    Generate a professional PDF quote styled like the YoBot template
    """
    try:
        # Extract client information
        company_name = client_data.get('company_name', 'Client Company')
        contact_name = client_data.get('contact_name', 'Contact Name')
        contact_email = client_data.get('contact_email', 'contact@email.com')
        contact_phone = client_data.get('contact_phone', '(555) 123-4567')
        
        # Extract package information
        bot_package = package_info.get('package_name', 'Standard Bot')
        package_price = package_info.get('setup_fee', 0)
        monthly_fee = package_info.get('monthly_fee', 0)
        
        # Generate quote details
        date_str = datetime.today().strftime('%Y-%m-%d')
        quote_id = f"Q-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # Calculate pricing
        subtotal = package_price
        addon_total = 0
        addon_monthly_total = 0
        
        for addon in addon_list:
            addon_total += addon.get('setup_fee', 0)
            addon_monthly_total += addon.get('monthly_fee', 0)
        
        subtotal += addon_total
        tax_rate = 0.063  # 6.3% tax
        tax_amount = round(subtotal * tax_rate, 2)
        total_price = round(subtotal + tax_amount, 2)
        upfront_payment = round(total_price * 0.5, 2)
        
        # Create PDF
        c = canvas.Canvas(pdf_path, pagesize=LETTER)
        width, height = LETTER
        
        # Header section
        c.setFont("Helvetica-Bold", 16)
        c.drawString(30, height - 50, "YoBot, Inc.")
        
        c.setFont("Helvetica", 11)
        c.drawString(30, height - 70, "YoBot Turnkey Solutions")
        c.drawString(30, height - 85, "https://yobot.bot")
        c.drawString(30, height - 100, f"Date: {date_str}")
        c.drawString(30, height - 115, f"Quote #: {quote_id}")
        
        # Add YoBot logo placeholder (if available)
        try:
            logo_path = "./static/yobot-logo.png"
            if os.path.exists(logo_path):
                c.drawImage(logo_path, width - 150, height - 100, width=100, height=50)
        except:
            c.setFont("Helvetica-Bold", 12)
            c.drawString(width - 150, height - 75, "YoBot Logo")
        
        # Client information section
        c.setFont("Helvetica-Bold", 12)
        c.drawString(30, height - 150, "Client Information:")
        
        c.setFont("Helvetica", 10)
        c.drawString(30, height - 170, f"Company: {company_name}")
        c.drawString(30, height - 185, f"Contact: {contact_name}")
        c.drawString(30, height - 200, f"Email: {contact_email}")
        c.drawString(30, height - 215, f"Phone: {contact_phone}")
        
        # Quote details section
        c.setFont("Helvetica-Bold", 12)
        c.drawString(30, height - 250, "Quote Details:")
        
        # Table headers
        c.setFont("Helvetica-Bold", 10)
        y_position = height - 280
        c.drawString(30, y_position, "Item")
        c.drawString(200, y_position, "Description")
        c.drawString(400, y_position, "Qty")
        c.drawString(450, y_position, "Price")
        
        # Draw line under headers
        c.line(30, y_position - 5, width - 30, y_position - 5)
        
        # Table content
        c.setFont("Helvetica", 9)
        y_position -= 25
        
        # Bot package setup
        c.drawString(30, y_position, bot_package)
        c.drawString(200, y_position, "Bot Package Setup")
        c.drawString(400, y_position, "1")
        c.drawString(450, y_position, f"${package_price:,.2f}")
        
        y_position -= 15
        c.drawString(30, y_position, bot_package)
        c.drawString(200, y_position, "Monthly Service Fee")
        c.drawString(400, y_position, "1")
        c.drawString(450, y_position, f"${monthly_fee:,.2f}")
        
        # Add-ons
        for addon in addon_list:
            addon_name = addon.get('name', 'Add-on')
            addon_setup = addon.get('setup_fee', 0)
            addon_monthly = addon.get('monthly_fee', 0)
            
            y_position -= 15
            c.drawString(30, y_position, addon_name)
            c.drawString(200, y_position, "Add-On Setup Fee")
            c.drawString(400, y_position, "1")
            c.drawString(450, y_position, f"${addon_setup:,.2f}")
            
            y_position -= 15
            c.drawString(30, y_position, addon_name)
            c.drawString(200, y_position, "Monthly Add-On Fee")
            c.drawString(400, y_position, "1")
            c.drawString(450, y_position, f"${addon_monthly:,.2f}")
        
        # Totals section
        y_position -= 40
        c.line(30, y_position, width - 30, y_position)
        
        y_position -= 20
        c.setFont("Helvetica", 10)
        c.drawString(350, y_position, f"Subtotal: ${subtotal:,.2f}")
        
        y_position -= 15
        c.drawString(350, y_position, f"Tax (6.3%): ${tax_amount:,.2f}")
        
        y_position -= 15
        c.setFont("Helvetica-Bold", 12)
        c.drawString(350, y_position, f"Total: ${total_price:,.2f}")
        
        y_position -= 20
        c.setFont("Helvetica-Bold", 11)
        c.drawString(350, y_position, f"Upfront Payment (50%): ${upfront_payment:,.2f}")
        
        # Terms and conditions
        y_position -= 50
        c.setFont("Helvetica-Bold", 10)
        c.drawString(30, y_position, "Terms & Conditions:")
        
        c.setFont("Helvetica", 9)
        terms = [
            "• Payment due within 30 days of invoice date.",
            "• Late payments subject to a 1.5% monthly late fee.",
            "• 50% upfront payment required to begin project.",
            "• Monthly service fees begin after successful deployment.",
            "• Please contact us with any questions regarding this quote."
        ]
        
        for term in terms:
            y_position -= 15
            c.drawString(30, y_position, term)
        
        # Footer
        y_position -= 40
        c.setFont("Helvetica", 8)
        c.drawString(30, y_position, "Thank you for choosing YoBot! We look forward to working with you.")
        
        c.save()
        
        return {
            'success': True,
            'pdf_path': pdf_path,
            'quote_number': quote_id,
            'total_amount': total_price,
            'upfront_payment': upfront_payment,
            'message': f'Professional quote PDF generated: {quote_id}'
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'message': 'Failed to generate quote PDF'
        }

def post_task_to_airtable(task_name, phase, owner_type, applies_to, automation_notes):
    """
    Post automation tasks to Airtable roadmap
    """
    import requests
    
    AIRTABLE_API_KEY = os.getenv('AIRTABLE_PERSONAL_ACCESS_TOKEN')
    BASE_ID = 'appe0OSJtB1In1kn5'
    TABLE_ID = 'tblakvT7m2dQOjlPC'
    
    if not AIRTABLE_API_KEY:
        return {
            'success': False,
            'error': 'Airtable API key not configured'
        }
    
    try:
        url = f'https://api.airtable.com/v0/{BASE_ID}/{TABLE_ID}'
        headers = {
            'Authorization': f'Bearer {AIRTABLE_API_KEY}',
            'Content-Type': 'application/json'
        }
        data = {
            "fields": {
                "Task Name": task_name,
                "Phase": phase,
                "Owner Type": owner_type,
                "Applies To": applies_to,
                "Automation Notes": automation_notes
            }
        }
        
        response = requests.post(url, headers=headers, json=data)
        
        if response.status_code in [200, 201]:
            return {
                'success': True,
                'task_name': task_name,
                'message': f'Task posted to Airtable: {task_name}'
            }
        else:
            return {
                'success': False,
                'error': response.text,
                'message': 'Failed to post task to Airtable'
            }
            
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'message': 'Failed to post task to Airtable'
        }

def create_roadmap_tasks_for_package(package_name, addon_list):
    """
    Create automation-first roadmap tasks based on selected package and add-ons
    """
    tasks_created = []
    
    # Base tasks for all packages
    base_tasks = [
        {
            'task_name': 'Client folder creation and setup',
            'phase': 'Setup',
            'owner_type': '✅ SYSTEM',
            'applies_to': package_name,
            'automation_notes': 'Auto-create Google Drive folder and initial file structure'
        },
        {
            'task_name': 'Environment configuration',
            'phase': 'Setup', 
            'owner_type': '✅ SYSTEM',
            'applies_to': package_name,
            'automation_notes': 'Deploy environment variables and API keys via automation'
        }
    ]
    
    # Package-specific tasks
    if 'Pro' in package_name:
        base_tasks.extend([
            {
                'task_name': 'Slack webhook integration',
                'phase': 'Setup',
                'owner_type': '✅ SYSTEM',
                'applies_to': package_name,
                'automation_notes': 'Replace Slack webhook using slack_webhook_swap(client_id)'
            },
            {
                'task_name': 'Command Center controls update',
                'phase': 'Branding',
                'owner_type': '✅ SYSTEM',
                'applies_to': package_name,
                'automation_notes': 'Update control JSON in Replit DB under /client/configs'
            }
        ])
    
    # Add-on specific tasks
    for addon in addon_list:
        addon_name = addon.get('name', '')
        if 'SmartSpend' in addon_name:
            base_tasks.append({
                'task_name': 'SmartSpend integration setup',
                'phase': 'Add-on Configuration',
                'owner_type': '✅ SYSTEM',
                'applies_to': addon_name,
                'automation_notes': 'Configure SmartSpend API and budget controls'
            })
        elif 'Analytics' in addon_name:
            base_tasks.append({
                'task_name': 'Advanced analytics dashboard',
                'phase': 'Add-on Configuration',
                'owner_type': '✅ SYSTEM',
                'applies_to': addon_name,
                'automation_notes': 'Deploy analytics tracking and reporting system'
            })
    
    # Post all tasks to Airtable
    for task in base_tasks:
        result = post_task_to_airtable(**task)
        tasks_created.append(result)
    
    return {
        'success': True,
        'tasks_created': len(tasks_created),
        'tasks': tasks_created,
        'message': f'Created {len(tasks_created)} roadmap tasks for {package_name}'
    }

def test_enhanced_quote_generation():
    """Test the enhanced quote generation system"""
    
    # Sample client data
    client_data = {
        'company_name': 'Acme Corporation',
        'contact_name': 'John Smith',
        'contact_email': 'john@acme.com',
        'contact_phone': '(555) 123-4567'
    }
    
    # Sample package info
    package_info = {
        'package_name': 'Professional Bot',
        'setup_fee': 2500,
        'monthly_fee': 497
    }
    
    # Sample add-ons
    addon_list = [
        {
            'name': 'SmartSpend',
            'setup_fee': 500,
            'monthly_fee': 97
        }
    ]
    
    # Generate test quote
    pdf_path = f"./pdfs/test_quote_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    os.makedirs('./pdfs', exist_ok=True)
    
    result = generate_professional_quote_pdf(client_data, package_info, addon_list, pdf_path)
    
    return result

if __name__ == "__main__":
    # Run test
    result = test_enhanced_quote_generation()
    print(json.dumps(result, indent=2))