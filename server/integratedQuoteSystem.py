import subprocess
import sys
import os
import datetime
import tempfile
from string import Template

def generate_quote_with_html_template(company_name, quote_number, email, package, total, add_ons=None, contact_name=None, contact_phone=None):
    """
    Generate professional PDF quote using the HTML template and Python subprocess to call Node.js
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
        
        # Calculate tax (8.5% tax rate)
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
        
        # Create temporary HTML file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False, encoding='utf-8') as temp_file:
            temp_file.write(html_content)
            temp_html_path = temp_file.name
        
        try:
            # Use puppeteer through Node.js to generate PDF
            node_script = f"""
const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {{
  const browser = await puppeteer.launch({{
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }});
  
  const page = await browser.newPage();
  await page.goto('file://{temp_html_path}', {{ waitUntil: 'networkidle0' }});
  
  await page.pdf({{
    path: '{pdf_path}',
    format: 'A4',
    printBackground: true,
    margin: {{
      top: '0.75in',
      right: '0.75in',
      bottom: '0.75in',
      left: '0.75in'
    }}
  }});
  
  await browser.close();
  console.log('PDF generated successfully');
}})();
"""
            
            # Write Node.js script to temporary file
            with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False) as node_file:
                node_file.write(node_script)
                node_script_path = node_file.name
            
            # Execute Node.js script
            result = subprocess.run(['node', node_script_path], capture_output=True, text=True)
            
            if result.returncode == 0:
                # Clean up temporary files
                os.unlink(temp_html_path)
                os.unlink(node_script_path)
                
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
            else:
                return {
                    "success": False,
                    "error": f"PDF generation failed: {result.stderr}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"PDF generation error: {str(e)}"
            }
            
        finally:
            # Clean up temporary files
            try:
                os.unlink(temp_html_path)
                os.unlink(node_script_path)
            except:
                pass
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def test_integrated_quote_system():
    """Test the integrated quote generation system"""
    try:
        result = generate_quote_with_html_template(
            company_name="Integration Test Corp",
            quote_number=None,  # Auto-generate
            email="test@integration.com",
            package="YoBot Enterprise Package",
            total=185000,
            add_ons=["SmartSpend", "Advanced Analytics"],
            contact_name="Test Manager",
            contact_phone="(555) 999-0000"
        )
        
        if result["success"]:
            print(f"✅ Integrated Quote PDF generated successfully!")
            print(f"📁 File: {result['filename']}")
            print(f"💰 Total: ${result['calculated_total']:,}")
            print(f"📋 Quote #: {result['quote_number']}")
        else:
            print(f"❌ Quote generation failed: {result['error']}")
            
        return result
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    test_integrated_quote_system()