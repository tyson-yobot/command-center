#!/usr/bin/env python3
"""
HTML Quote Generator Integration for YoBot Sales Order Processing
Integrates with Tally form submissions and generates professional PDF quotes
"""

import sys
import json
import os
import datetime
import tempfile
from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration

def process_sales_order_with_html_quote(order_data):
    """
    Process complete sales order with HTML quote generation
    Handles data from Tally form and generates professional PDF
    """
    try:
        # Extract order data
        company_name = order_data.get('customer_name', order_data.get('client_name', 'Valued Client'))
        email = order_data.get('email', order_data.get('client_email', ''))
        package = order_data.get('package', 'YoBot Package')
        total = order_data.get('total', '$0')
        order_id = order_data.get('order_id', f"ORD-{datetime.datetime.now().strftime('%Y%m%d')}")
        addons = order_data.get('addons', [])
        phone = order_data.get('phone', 'On File')
        
        # Parse total amount (remove $ and commas)
        try:
            if isinstance(total, str):
                total_amount = float(total.replace('$', '').replace(',', ''))
            else:
                total_amount = float(total)
        except:
            total_amount = 0
        
        # Package data with pricing
        package_data = {
            "YoBot Standard Package": {"price": 25000, "description": "AI Voice Bot System with CRM Integration"},
            "YoBot Professional Package": {"price": 75000, "description": "Advanced AI Voice Bot with Analytics & Automation"},
            "YoBot Platinum Package": {"price": 125000, "description": "Enterprise AI Voice Bot with Custom Integrations"},
            "YoBot Enterprise Package": {"price": 185000, "description": "Full-Scale AI Automation Platform"},
            "Standard": {"price": 25000, "description": "AI Voice Bot System with CRM Integration"},
            "Professional": {"price": 75000, "description": "Advanced AI Voice Bot with Analytics & Automation"},
            "Platinum": {"price": 125000, "description": "Enterprise AI Voice Bot with Custom Integrations"},
            "Enterprise": {"price": 185000, "description": "Full-Scale AI Automation Platform"}
        }
        
        # Add-on pricing
        addon_data = {
            "SmartSpend": {"price": 15000, "description": "Intelligent Budget Optimization System"},
            "Advanced Analytics": {"price": 10000, "description": "Comprehensive Performance Analytics Dashboard"},
            "A/B Testing": {"price": 8000, "description": "Automated A/B Testing Framework"},
            "Custom Integration": {"price": 20000, "description": "Bespoke API Integration Services"}
        }
        
        # Load HTML template
        template_path = "/home/runner/workspace/attached_assets/quote_template.html"
        if not os.path.exists(template_path):
            return {
                "success": False,
                "error": "Quote template not found"
            }
        
        with open(template_path, 'r', encoding='utf-8') as file:
            html_template = file.read()
        
        # Calculate pricing
        base_price = package_data.get(package, {}).get("price", total_amount)
        package_description = package_data.get(package, {}).get("description", "Custom AI Solution")
        
        # Build line items HTML
        line_items_html = f"""
            <tr>
                <td>{package}</td>
                <td>{package_description}</td>
                <td>1</td>
                <td>${base_price:,}</td>
            </tr>
        """
        
        subtotal = base_price
        
        # Add addon line items
        if addons and isinstance(addons, list):
            for addon in addons:
                if addon in addon_data:
                    addon_price = addon_data[addon]["price"]
                    addon_desc = addon_data[addon]["description"]
                    subtotal += addon_price
                    line_items_html += f"""
                        <tr>
                            <td>{addon}</td>
                            <td>{addon_desc}</td>
                            <td>1</td>
                            <td>${addon_price:,}</td>
                        </tr>
                    """
        
        # Calculate tax (8.5% tax rate)
        tax_rate = 8.5
        tax_amount = int(subtotal * (tax_rate / 100))
        total_with_tax = subtotal + tax_amount
        
        # Generate quote number
        quote_number = f"Q-{datetime.datetime.now().strftime('%Y%m%d')}-{datetime.datetime.now().strftime('%H%M')}"
        
        # Prepare template variables
        template_vars = {
            'Date': datetime.datetime.now().strftime('%B %d, %Y'),
            'QuoteNumber': quote_number,
            'ClientName': company_name,
            'ContactName': company_name.split()[0] if company_name.split() else 'Contact',
            'ContactEmail': email,
            'ContactPhone': phone,
            'LineItems': line_items_html,
            'Subtotal': f"{subtotal:,}",
            'TaxRate': f"{tax_rate}%",
            'TaxAmount': f"{tax_amount:,}",
            'TotalPrice': f"{total_with_tax:,}"
        }
        
        # Replace template placeholders
        html_content = html_template
        for key, value in template_vars.items():
            html_content = html_content.replace(f"{{{{{key}}}}}", str(value))
        
        # Ensure pdfs directory exists
        pdf_dir = "/home/runner/workspace/pdfs"
        os.makedirs(pdf_dir, exist_ok=True)
        
        # Generate PDF filename
        filename = f"YoBot_Quote_{quote_number}_{company_name.replace(' ', '_').replace('/', '_')}.pdf"
        pdf_path = os.path.join(pdf_dir, filename)
        
        # Create temporary HTML file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False, encoding='utf-8') as temp_file:
            temp_file.write(html_content)
            temp_html_path = temp_file.name
        
        try:
            # Generate PDF using WeasyPrint
            font_config = FontConfiguration()
            html_doc = HTML(filename=temp_html_path)
            html_doc.write_pdf(pdf_path, font_config=font_config)
            
            # Clean up temporary file
            os.unlink(temp_html_path)
            
            return {
                "success": True,
                "pdf_path": pdf_path,
                "filename": filename,
                "quote_number": quote_number,
                "calculated_total": total_with_tax,
                "base_price": base_price,
                "tax_amount": tax_amount,
                "subtotal": subtotal,
                "client_name": company_name,
                "email": email,
                "order_id": order_id,
                "pdf_url": f"/pdfs/{filename}",
                "message": f"Professional quote {quote_number} generated for {company_name}"
            }
            
        except Exception as pdf_error:
            return {
                "success": False,
                "error": f"PDF generation failed: {str(pdf_error)}"
            }
        
        finally:
            # Clean up temporary file
            try:
                os.unlink(temp_html_path)
            except:
                pass
                
    except Exception as e:
        return {
            "success": False,
            "error": f"Quote processing failed: {str(e)}"
        }

def main():
    """Main function to process sales order from command line"""
    try:
        if len(sys.argv) > 1:
            # Parse JSON data from command line argument
            order_data = json.loads(sys.argv[1])
        else:
            # Read from stdin
            order_data = json.loads(sys.stdin.read())
        
        result = process_sales_order_with_html_quote(order_data)
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": f"Script execution failed: {str(e)}"
        }
        print(json.dumps(error_result))

if __name__ == "__main__":
    main()