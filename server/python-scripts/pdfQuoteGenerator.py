from PyPDF2 import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from io import BytesIO
import os

def generate_quote_pdf(company_name, contact_name, quote_number, date, line_items, one_time_payment=None, monthly_recurring=None, grand_total=None):
    """Generate YoBot quote PDF with overlay on base template"""
    buffer = BytesIO()

    # Draw overlay text
    c = canvas.Canvas(buffer, pagesize=letter)

    # Header fields
    c.drawString(400, 710, f"Quote #: {quote_number}")
    c.drawString(400, 690, f"Date: {date}")
    c.drawString(75, 710, f"{company_name}")
    c.drawString(75, 695, f"Attention: {contact_name}")

    # Thank-you note for paid deposit
    c.drawString(75, 670, "Deposit Received – Thank You!")

    # Line Items (5 max – adjust Y if needed)
    y = 640
    for item in line_items:
        c.drawString(75, y, item["name"])
        c.drawString(250, y, item["description"])
        c.drawRightString(530, y, f"${item['price']:,}")
        y -= 18

    # Add pricing summary if provided
    if one_time_payment or monthly_recurring or grand_total:
        y -= 20
        c.drawString(75, y, "PRICING SUMMARY:")
        y -= 15
        
        if one_time_payment:
            c.drawString(75, y, f"One-Time Payment: ${one_time_payment}")
            y -= 15
            
        if monthly_recurring:
            c.drawString(75, y, f"Monthly Recurring: ${monthly_recurring}")
            y -= 15
            
        if grand_total:
            c.drawString(75, y, f"TOTAL: ${grand_total}")

    c.save()

    # Merge overlay into base PDF
    buffer.seek(0)
    overlay_pdf = PdfReader(buffer)
    
    # Use base template if available
    base_template_path = "YoBot_Quote_FINAL_LOGO_ALIGNED.pdf"
    if not os.path.exists(base_template_path):
        # Use fallback template if main one doesn't exist
        base_template_path = "YoBot_Quote_Test_Client_TEST-001.pdf"
    
    if os.path.exists(base_template_path):
        base_pdf = PdfReader(open(base_template_path, "rb"))
        output_pdf = PdfWriter()

        base_page = base_pdf.pages[0]
        base_page.merge_page(overlay_pdf.pages[0])
        output_pdf.add_page(base_page)
    else:
        # Create standalone PDF if no template found
        output_pdf = PdfWriter()
        overlay_pdf = PdfReader(buffer)
        output_pdf.add_page(overlay_pdf.pages[0])

    # Export to pdfs directory
    output_dir = "pdfs"
    os.makedirs(output_dir, exist_ok=True)
    output_path = f"{output_dir}/{quote_number}_Quote.pdf"
    
    with open(output_path, "wb") as f:
        output_pdf.write(f)

    print(f"{quote_number}_Quote.pdf generated successfully in {output_dir}/")
    return output_path

def create_line_items_from_package(bot_package, selected_addons):
    """Create line items based on package and add-ons"""
    line_items = []
    
    # Base package pricing
    package_prices = {
        "Starter": {"price": 2500, "description": "Basic YoBot package with core features"},
        "Professional": {"price": 5000, "description": "Enhanced YoBot with advanced capabilities"},
        "Enterprise": {"price": 10000, "description": "Full-featured YoBot with premium support"},
        "Custom": {"price": 15000, "description": "Custom YoBot solution tailored to needs"}
    }
    
    if bot_package in package_prices:
        line_items.append({
            "name": f"{bot_package} Package",
            "description": package_prices[bot_package]["description"],
            "price": package_prices[bot_package]["price"]
        })
    
    # Add-on pricing
    addon_prices = {
        "Voice Recording Add-On": {"price": 500, "description": "Advanced voice recording capabilities"},
        "Analytics Dashboard Add-On": {"price": 750, "description": "Comprehensive analytics and reporting"},
        "Multi-Language Add-On": {"price": 1000, "description": "Support for multiple languages"},
        "API Integration Add-On": {"price": 1250, "description": "Custom API integrations"},
        "Priority Support Add-On": {"price": 300, "description": "24/7 priority customer support"}
    }
    
    for addon in selected_addons:
        if addon in addon_prices:
            line_items.append({
                "name": addon,
                "description": addon_prices[addon]["description"],
                "price": addon_prices[addon]["price"]
            })
    
    return line_items

if __name__ == "__main__":
    # Test PDF generation
    test_line_items = [
        {"name": "Enterprise Package", "description": "Full-featured YoBot solution", "price": 10000},
        {"name": "Voice Recording Add-On", "description": "Advanced voice capabilities", "price": 500},
        {"name": "Analytics Dashboard", "description": "Comprehensive reporting", "price": 750}
    ]
    
    generate_quote_pdf(
        "Test Company Inc.",
        "John Doe", 
        "Q-20250106-001",
        "2025-01-06",
        test_line_items,
        "11250",
        "299",
        "11549"
    )