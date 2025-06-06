import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication

def send_quote_email(sender_email, app_password, receiver_email, subject, body, pdf_path=None):
    """
    Send quote notification email with optional PDF attachment
    """
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = ', '.join(receiver_email) if isinstance(receiver_email, list) else receiver_email
        msg['Subject'] = subject
        
        # Add body
        msg.attach(MIMEText(body, 'plain'))
        
        # Add PDF attachment if provided
        if pdf_path and os.path.exists(pdf_path):
            with open(pdf_path, 'rb') as attachment:
                part = MIMEApplication(attachment.read(), _subtype='pdf')
                part.add_header('Content-Disposition', 'attachment', filename=os.path.basename(pdf_path))
                msg.attach(part)
        
        # Gmail SMTP configuration
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, app_password)
        
        # Send email
        recipients = receiver_email if isinstance(receiver_email, list) else [receiver_email]
        server.sendmail(sender_email, recipients, msg.as_string())
        server.quit()
        
        return {
            "success": True,
            "message": f"Email sent successfully to {recipients}",
            "recipients": recipients
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def send_sales_order_notification(company_name, quote_number, email, package, total, pdf_path=None):
    """
    Send sales order notification to daniel@yobot.bot and tyson@yobot.bot
    """
    sender_email = os.getenv("GMAIL_USER")
    app_password = os.getenv("GMAIL_APP_PASSWORD")
    
    if not sender_email or not app_password:
        return {
            "success": False,
            "error": "Gmail credentials not configured"
        }
    
    recipients = ["daniel@yobot.bot", "tyson@yobot.bot"]
    subject = f"🚀 New Sales Order: {company_name} - {quote_number}"
    
    body = f"""New Sales Order Received

Company: {company_name}
Email: {email}
Package: {package}
Total: {total}
Quote Number: {quote_number}

The complete CRM integration has been executed:
✓ HubSpot contact created
✓ PDF quote generated
✓ Client folder organized
✓ Task templates loaded

Action Required: Review and follow up with the client.

YoBot Automation System
"""
    
    return send_quote_email(
        sender_email=sender_email,
        app_password=app_password,
        receiver_email=recipients,
        subject=subject,
        body=body,
        pdf_path=pdf_path
    )

def send_docusign_notification(company_name, pdf_path=None):
    """
    Send DocuSign signed notification to daniel@yobot.bot and tyson@yobot.bot
    """
    sender_email = os.getenv("GMAIL_USER")
    app_password = os.getenv("GMAIL_APP_PASSWORD")
    
    if not sender_email or not app_password:
        return {
            "success": False,
            "error": "Gmail credentials not configured"
        }
    
    recipients = ["daniel@yobot.bot", "tyson@yobot.bot"]
    subject = f"✅ Signed DocuSign Received – {company_name}"
    
    body = f"""{company_name} has signed their agreement.

The signed document has been processed and uploaded to their client folder.

Next Steps:
- Review signed agreement
- Initiate project onboarding
- Schedule kickoff meeting

YoBot Automation System
"""
    
    return send_quote_email(
        sender_email=sender_email,
        app_password=app_password,
        receiver_email=recipients,
        subject=subject,
        body=body,
        pdf_path=pdf_path
    )