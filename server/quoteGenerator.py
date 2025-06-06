import datetime
from fpdf import FPDF
import os
import glob
import sys
import json

def generate_quote_pdf(form_data):
    """
    Generate a professional PDF quote from Tally form data
    """
    try:
        # === DYNAMIC INPUTS FROM TALLY/MAKE ===
        company_name = form_data.get('company_name', 'Unknown Company')
        contact_name = form_data.get('contact_name', 'Unknown Contact')
        client_email = form_data.get('client_email', '')
        client_phone = form_data.get('client_phone', '')
        
        # Items from sales order
        items = form_data.get('items', [
            {"name": "Enterprise Bot", "desc": "All Pro + Lead Scoring, Quoting Engine, Performance Dashboards, Multi-Platform Sync", "qty": 1, "price": 12500.00},
            {"name": "Enterprise Bot Monthly Service Fee", "desc": "Monthly Service Fee", "qty": 1, "price": 1499.00},
        ])

        # === AUTO-GENERATE QUOTE NUMBER ===
        today = datetime.datetime.now()
        date_str = today.strftime("%Y-%m-%d")
        quote_prefix = today.strftime("%Y%m%d")

        # Create client folder structure
        base_dir = os.path.dirname(os.path.abspath(__file__))
        client_folder = os.path.join(base_dir, "..", "client_folders", company_name.replace(" ", "_"))
        os.makedirs(client_folder, exist_ok=True)
        
        existing_quotes = glob.glob(f"{client_folder}/Q-{quote_prefix}-*.pdf")
        quote_num = len(existing_quotes) + 1
        quote_id = f"Q-{quote_prefix}-{quote_num:03d}"

        # === BUILD PDF ===
        pdf = FPDF()
        pdf.add_page()
        
        # Header
        pdf.set_font("Arial", 'B', 16)
        pdf.cell(0, 12, "YoBot, Inc.", ln=1)
        pdf.set_font("Arial", '', 11)
        pdf.cell(0, 6, "Enterprise AI Voice & Automation Solutions", ln=1)
        pdf.cell(0, 6, "https://yobot.bot | support@yobot.bot", ln=1)
        pdf.ln(5)
        
        # Quote details
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(0, 8, f"QUOTE #{quote_id}", ln=1)
        pdf.set_font("Arial", '', 10)
        pdf.cell(0, 6, f"Date: {date_str}", ln=1)
        pdf.ln(8)

        # Client Information
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(0, 8, "CLIENT INFORMATION", ln=1)
        pdf.set_font("Arial", '', 10)
        pdf.cell(0, 6, f"Company: {company_name}", ln=1)
        pdf.cell(0, 6, f"Contact: {contact_name}", ln=1)
        pdf.cell(0, 6, f"Email: {client_email}", ln=1)
        pdf.cell(0, 6, f"Phone: {client_phone}", ln=1)
        pdf.ln(10)

        # Items table header
        pdf.set_font("Arial", 'B', 10)
        pdf.cell(80, 8, "ITEM", 1)
        pdf.cell(70, 8, "DESCRIPTION", 1)
        pdf.cell(20, 8, "QTY", 1)
        pdf.cell(30, 8, "PRICE", 1, ln=1)

        # Items
        subtotal = 0.0
        pdf.set_font("Arial", '', 9)
        
        for item in items:
            name = item['name'][:35] + "..." if len(item['name']) > 35 else item['name']
            desc = item['desc'][:35] + "..." if len(item['desc']) > 35 else item['desc']
            qty = item.get('qty', 1)
            unit_price = item['price']
            line_total = unit_price * qty
            subtotal += line_total
            
            pdf.cell(80, 8, name, 1)
            pdf.cell(70, 8, desc, 1)
            pdf.cell(20, 8, str(qty), 1)
            pdf.cell(30, 8, f"${line_total:,.2f}", 1, ln=1)

        # Totals
        tax_rate = 0.063  # 6.3% tax
        tax = round(subtotal * tax_rate, 2)
        total = round(subtotal + tax, 2)
        deposit = round(total / 2, 2)

        pdf.ln(5)
        pdf.set_font("Arial", 'B', 11)
        pdf.cell(170, 8, f"Subtotal: ${subtotal:,.2f}", 0, 1, 'R')
        pdf.cell(170, 8, f"Tax (6.3%): ${tax:,.2f}", 0, 1, 'R')
        pdf.cell(170, 8, f"TOTAL: ${total:,.2f}", 0, 1, 'R')
        pdf.cell(170, 8, f"50% Deposit Required: ${deposit:,.2f}", 0, 1, 'R')

        pdf.ln(10)
        
        # Terms & Conditions
        pdf.set_font("Arial", 'B', 10)
        pdf.cell(0, 8, "TERMS & CONDITIONS", ln=1)
        pdf.set_font("Arial", '', 9)
        terms = [
            "• Payment due within 30 days of invoice date",
            "• Late payments subject to 1.5% monthly late fee",
            "• 50% deposit required to begin work",
            "• Services begin upon receipt of signed agreement",
            "• All prices valid for 30 days from quote date"
        ]
        
        for term in terms:
            pdf.cell(0, 5, term, ln=1)

        # Footer
        pdf.ln(10)
        pdf.set_font("Arial", 'I', 8)
        pdf.cell(0, 5, "Thank you for choosing YoBot for your enterprise automation needs!", ln=1)

        # Save PDF
        pdf_filename = f"{company_name.replace(' ', '_')}_{quote_id}.pdf"
        pdf_output_path = os.path.join(client_folder, pdf_filename)
        pdf.output(pdf_output_path)
        
        return {
            "success": True,
            "pdf_path": pdf_output_path,
            "quote_id": quote_id,
            "client_folder": client_folder,
            "total_amount": total,
            "deposit_amount": deposit
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    # Test data for standalone execution
    test_data = {
        "company_name": "Acme Robotics",
        "contact_name": "John Smith",
        "client_email": "john@acmerobotics.com",
        "client_phone": "555-123-4567",
        "items": [
            {"name": "Enterprise Bot", "desc": "All Pro + Lead Scoring, Quoting Engine, Performance Dashboards", "qty": 1, "price": 12500.00},
            {"name": "Enterprise Bot Monthly Service Fee", "desc": "Monthly Service Fee", "qty": 1, "price": 1499.00},
            {"name": "SmartSpend™ Dashboard Add-On Setup Fee", "desc": "Setup Fee", "qty": 1, "price": 499.00},
            {"name": "SmartSpend™ Dashboard Monthly Add-On Fee", "desc": "Monthly Fee", "qty": 1, "price": 49.00},
        ]
    }
    
    result = generate_quote_pdf(test_data)
    print(json.dumps(result, indent=2))