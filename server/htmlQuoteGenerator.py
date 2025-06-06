import os
import datetime
import pdfkit
from string import Template
import tempfile

def generate_html_quote_pdf(company_name, quote_number, email, package, total, add_ons=None, contact_name=None, contact_phone=None):
    """
    Generate professional PDF quote using the provided HTML template and pdfkit
    """
    try:
        # Ensure pdfs directory exists
        pdf_dir = "/home/runner/workspace/pdfs"
        os.makedirs(pdf_dir, exist_ok=True)
        
        # Package pricing and descriptions
        package_data = {
            "YoBot Standard Package": {
                "price": 25000,
                "description": "AI Voice Bot System with CRM Integration"
            },
            "YoBot Professional Package": {
                "price": 75000,
                "description": "Advanced AI Voice Bot with Analytics & Automation"
            },
            "YoBot Platinum Package": {
                "price": 125000,
                "description": "Enterprise AI Voice Bot with Custom Integrations"
            },
            "YoBot Enterprise Package": {
                "price": 185000,
                "description": "Full-Scale AI Automation Platform"
            }
        }
        
        # Add-on pricing and descriptions
        addon_data = {
            "SmartSpend": {
                "price": 15000,
                "description": "Intelligent Budget Optimization System"
            },
            "Advanced Analytics": {
                "price": 10000,
                "description": "Comprehensive Performance Analytics Dashboard"
            },
            "A/B Testing": {
                "price": 8000,
                "description": "Automated A/B Testing Framework"
            },
            "Custom Integration": {
                "price": 20000,
                "description": "Bespoke API Integration Services"
            }
        }
        
        # Load HTML template
        template_path = "/home/runner/workspace/attached_assets/quote_template.html"
        with open(template_path, 'r', encoding='utf-8') as file:
            html_template = file.read()
        
        # Calculate pricing
        base_price = package_data.get(package, {}).get("price", 0)
        package_description = package_data.get(package, {}).get("description", "Custom AI Solution")
        
        # Build line items
        line_items_html = ""
        subtotal = base_price
        
        # Add main package line item
        line_items_html += f"""
            <tr>
                <td>{package}</td>
                <td>{package_description}</td>
                <td>1</td>
                <td>${base_price:,}</td>
            </tr>
        """
        
        # Add addon line items
        if add_ons:
            for addon in add_ons:
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
        
        # Calculate tax (assuming 8.5% tax rate)
        tax_rate = 8.5
        tax_amount = int(subtotal * (tax_rate / 100))
        total_with_tax = subtotal + tax_amount
        
        # Generate quote number if not provided
        if not quote_number:
            quote_number = f"Q-{datetime.datetime.now().strftime('%Y%m%d')}-{datetime.datetime.now().strftime('%H%M')}"
        
        # Prepare template variables
        template_vars = {
            'Date': datetime.datetime.now().strftime('%B %d, %Y'),
            'QuoteNumber': quote_number,
            'ClientName': company_name,
            'ContactName': contact_name or 'Primary Contact',
            'ContactEmail': email,
            'ContactPhone': contact_phone or 'On File',
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
        
        # Generate PDF filename
        filename = f"YoBot_Quote_{quote_number}_{company_name.replace(' ', '_')}.pdf"
        pdf_path = os.path.join(pdf_dir, filename)
        
        # PDF generation options
        options = {
            'page-size': 'A4',
            'margin-top': '0.75in',
            'margin-right': '0.75in',
            'margin-bottom': '0.75in',
            'margin-left': '0.75in',
            'encoding': "UTF-8",
            'no-outline': None,
            'enable-local-file-access': None
        }
        
        # Create temporary HTML file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False, encoding='utf-8') as temp_file:
            temp_file.write(html_content)
            temp_html_path = temp_file.name
        
        try:
            # Generate PDF from HTML using pdfkit
            pdfkit.from_file(temp_html_path, pdf_path, options=options)
        finally:
            # Clean up temporary file
            os.unlink(temp_html_path)
        
        return {
            "success": True,
            "pdf_path": pdf_path,
            "filename": filename,
            "calculated_total": total_with_tax,
            "base_price": base_price,
            "tax_amount": tax_amount,
            "subtotal": subtotal,
            "quote_number": quote_number
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def test_html_quote_generation():
    """Test the HTML quote generation system"""
    try:
        result = generate_html_quote_pdf(
            company_name="Test Healthcare Corp",
            quote_number=None,  # Auto-generate
            email="test@healthcare.com",
            package="YoBot Professional Package",
            total=75000,
            add_ons=["SmartSpend"],
            contact_name="John Smith",
            contact_phone="(555) 123-4567"
        )
        
        if result["success"]:
            print(f"✅ HTML Quote PDF generated successfully!")
            print(f"📁 File: {result['filename']}")
            print(f"💰 Total: ${result['calculated_total']:,}")
            print(f"📋 Quote #: {result['quote_number']}")
        else:
            print(f"❌ HTML Quote generation failed: {result['error']}")
            
        return result
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    test_html_quote_generation()