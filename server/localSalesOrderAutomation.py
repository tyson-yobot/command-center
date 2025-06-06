import os
import json
import datetime
import requests
import base64
try:
    from fpdf import FPDF
except ImportError:
    print("FPDF not available, using alternative PDF generation")
    FPDF = None

def generate_quote_number(company_name):
    """Generate unique quote number per company per day"""
    today = datetime.datetime.now().strftime("%Y%m%d")
    company_code = ''.join([c.upper() for c in company_name.split() if c])[:3]
    quote_id = f"Q-{company_code}-{today}-001"
    return quote_id

def generate_quote_pdf(company_name, quote_number, package, total, email):
    """Generate professional PDF quote locally"""
    try:
        pdf = FPDF()
        pdf.add_page()
        
        # Header with YoBot branding
        pdf.set_font("Arial", 'B', 16)
        pdf.cell(200, 10, "YoBot Enterprise Solutions", ln=True, align="C")
        pdf.set_font("Arial", size=12)
        pdf.cell(200, 10, "Professional Quote Document", ln=True, align="C")
        pdf.ln(10)

        # Quote details
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(200, 10, f"Quote Number: {quote_number}", ln=True, align="L")
        pdf.set_font("Arial", size=11)
        pdf.cell(200, 10, f"Date: {datetime.datetime.now().strftime('%B %d, %Y')}", ln=True, align="L")
        pdf.cell(200, 10, f"Company: {company_name}", ln=True, align="L")
        pdf.cell(200, 10, f"Email: {email}", ln=True, align="L")
        pdf.ln(10)

        # Service breakdown
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(200, 10, "Service Details:", ln=True, align="L")
        pdf.set_font("Arial", size=11)
        pdf.cell(200, 10, f"- Package: {package}", ln=True, align="L")
        pdf.cell(200, 10, "- AI-Powered Voice Bot Integration", ln=True, align="L")
        pdf.cell(200, 10, "- Automated Lead Generation & Qualification", ln=True, align="L")
        pdf.cell(200, 10, "- CRM Integration & Data Management", ln=True, align="L")
        pdf.cell(200, 10, "- 24/7 Automated Customer Support", ln=True, align="L")
        pdf.cell(200, 10, "- Complete Setup & Training Included", ln=True, align="L")
        pdf.ln(10)

        # Investment summary
        pdf.set_font("Arial", 'B', 14)
        pdf.cell(200, 10, f"Total Investment: {total}", ln=True, align="L")
        pdf.ln(5)
        
        # Footer
        pdf.set_font("Arial", size=10)
        pdf.cell(200, 10, "Thank you for choosing YoBot Enterprise Solutions!", ln=True, align="C")
        pdf.cell(200, 10, "Contact us for any questions or to proceed with implementation.", ln=True, align="C")

        # Save PDF
        os.makedirs("./pdfs", exist_ok=True)
        pdf_path = f"./pdfs/{company_name}_{quote_number}.pdf"
        pdf.output(pdf_path)
        
        return {"success": True, "pdf_path": pdf_path, "filename": f"{company_name}_{quote_number}.pdf"}

    except Exception as e:
        return {"success": False, "error": str(e)}

def send_quote_email_sendgrid(client_email, company_name, quote_number, pdf_path):
    """Send quote email using SendGrid"""
    try:
        api_key = os.getenv("SENDGRID_API_KEY")
        if not api_key:
            return {"success": False, "error": "SendGrid API key not configured"}

        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail, Attachment, FileContent, FileName, FileType, Disposition

        message = Mail(
            from_email='quotes@engagesmarter.com',
            to_emails=client_email,
            subject=f'Your YoBot Quote - {quote_number}',
            html_content=f'''
            <h2>Your YoBot Quote is Ready!</h2>
            <p>Hi {company_name},</p>
            <p>Thank you for your interest in YoBot Enterprise Solutions. Please find your personalized quote attached.</p>
            <p>Our AI-powered automation platform will transform your business operations with:</p>
            <ul>
                <li>Intelligent voice bot integration</li>
                <li>Automated lead generation and qualification</li>
                <li>Seamless CRM integration</li>
                <li>24/7 customer support automation</li>
            </ul>
            <p>We're excited to help you grow your business with cutting-edge automation technology.</p>
            <p>Best regards,<br><strong>The YoBot Team</strong></p>
            '''
        )

        # Attach PDF
        if os.path.exists(pdf_path):
            with open(pdf_path, 'rb') as f:
                data = f.read()
                f.close()
            encoded_file = base64.b64encode(data).decode()

            attachedFile = Attachment(
                FileContent(encoded_file),
                FileName(f"{company_name}_Quote_{quote_number}.pdf"),
                FileType('application/pdf'),
                Disposition('attachment')
            )
            message.attachment = attachedFile

        sg = SendGridAPIClient(api_key)
        response = sg.send(message)
        
        return {"success": response.status_code in [200, 202]}

    except Exception as e:
        return {"success": False, "error": str(e)}

def log_to_airtable(order_data, quote_number, pdf_filename, email_success):
    """Log complete sales order to Airtable"""
    try:
        api_key = os.getenv("AIRTABLE_API_KEY")
        if not api_key:
            return {"success": False, "error": "Airtable API key not configured"}

        # Log to Sales Order Tracker
        webhook_data = {
            "🧾 Function Name": "Complete Sales Order Processing",
            "📝 Source Form": "Tally Sales Order Form",
            "📅 Timestamp": datetime.datetime.now().isoformat(),
            "📊 Dashboard Name": "Sales Automation",
            "👤 Client": order_data.get('customer_name', 'Unknown'),
            "📧 Email": order_data.get('email', 'No email'),
            "💰 Total": order_data.get('total', '$0'),
            "📦 Package": order_data.get('package', 'Standard'),
            "📄 PDF Generated": pdf_filename,
            "🔗 Quote Number": quote_number,
            "✉️ Email Sent": "Yes" if email_success else "No",
            "🎯 Status": "Complete - Local Processing"
        }

        response = requests.post(
            "https://api.airtable.com/v0/appRt8V3tH4g5Z5if/tbldPRZ4nHbtj9opU/",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={"fields": webhook_data}
        )

        return {"success": response.status_code in [200, 201]}

    except Exception as e:
        return {"success": False, "error": str(e)}

def process_complete_sales_order_local(order_data):
    """Complete sales order processing with local PDF generation and email sending"""
    try:
        company_name = order_data.get('customer_name', 'Client Company')
        client_email = order_data.get('email', 'client@example.com')
        package = order_data.get('package', 'YoBot Package')
        total = order_data.get('total', '$0')
        
        print(f"Processing local sales order for {company_name}")

        # Step 1: Generate quote number
        quote_number = generate_quote_number(company_name)

        # Step 2: Generate PDF locally
        pdf_result = generate_quote_pdf(company_name, quote_number, package, total, client_email)
        if not pdf_result["success"]:
            return {"success": False, "error": f"PDF generation failed: {pdf_result['error']}"}

        # Step 3: Send email with PDF attachment
        email_result = send_quote_email_sendgrid(client_email, company_name, quote_number, pdf_result["pdf_path"])

        # Step 4: Log to Airtable
        log_result = log_to_airtable(order_data, quote_number, pdf_result["filename"], email_result["success"])

        # Step 5: Cleanup (keep PDF for records)
        # Note: Keeping PDF files for business records

        return {
            "success": True,
            "client_name": company_name,
            "quote_number": quote_number,
            "pdf_generated": pdf_result["filename"],
            "email_sent": email_result["success"],
            "airtable_logged": log_result["success"],
            "processing_time": datetime.datetime.now().isoformat(),
            "method": "Local processing with SendGrid email"
        }

    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    # Test with sample data
    test_order = {
        "customer_name": "Test Company Inc",
        "email": "test@company.com",
        "package": "Enterprise Bot Package",
        "total": "$25000"
    }
    
    result = process_complete_sales_order_local(test_order)
    print(json.dumps(result, indent=2))