import smtplib
import os
import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders

def send_quote_email(sender_email, app_password, receiver_email, subject, body, pdf_path=None):
    """
    Send quote notification email with optional PDF attachment
    """
    try:
        # Setup email
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = receiver_email
        msg['Subject'] = subject
        
        # Add body to email
        msg.attach(MIMEText(body, 'plain'))
        
        # Add PDF attachment if provided
        if pdf_path and os.path.exists(pdf_path):
            with open(pdf_path, "rb") as attachment:
                part = MIMEBase('application', 'octet-stream')
                part.set_payload(attachment.read())
                encoders.encode_base64(part)
                part.add_header(
                    'Content-Disposition',
                    f'attachment; filename= {os.path.basename(pdf_path)}',
                )
                msg.attach(part)
        
        # Gmail SMTP configuration
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, app_password)
        text = msg.as_string()
        server.sendmail(sender_email, receiver_email, text)
        server.quit()
        
        return {
            "success": True,
            "message": f"Email sent successfully to {receiver_email}",
            "sender": sender_email
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
    # Gmail accounts with app passwords (removed spaces)
    gmail_accounts = [
        {
            "email": "daniel@yobot.bot",
            "password": "pdsmlopbcchbcvpo"  # pdsm lbop cchb cvpo
        },
        {
            "email": "tyson@yobot.bot", 
            "password": "ewdwkwgbgunrhqid"  # ewdw kwgb gunr hqid
        }
    ]
    
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
    
    # Try each Gmail account until one works
    for account in gmail_accounts:
        sender_email = account["email"]
        app_password = account["password"]
        
        try:
            # Send to both recipients
            success_count = 0
            for recipient in recipients:
                result = send_quote_email(
                    sender_email=sender_email,
                    app_password=app_password,
                    receiver_email=recipient,
                    subject=subject,
                    body=body,
                    pdf_path=pdf_path
                )
                
                if result.get("success"):
                    success_count += 1
            
            if success_count > 0:
                return {
                    "success": True,
                    "message": f"Emails sent successfully to {success_count}/{len(recipients)} recipients",
                    "sender": sender_email,
                    "sent_to": recipients[:success_count]
                }
                
        except Exception as e:
            continue
    
    return {
        "success": False,
        "error": "All Gmail accounts failed to authenticate"
    }

def send_docusign_notification(company_name, pdf_path=None):
    """
    Send DocuSign signed notification to daniel@yobot.bot and tyson@yobot.bot
    """
    sender_email = "daniel@yobot.bot"
    app_password = "pdsmlopbcchbcvpo"
    
    recipients = ["daniel@yobot.bot", "tyson@yobot.bot"]
    subject = f"✅ Signed DocuSign Received – {company_name}"
    
    body = f"""{company_name} has signed their agreement.

The signed document is attached to this email.

Next Steps:
1. Review the signed agreement
2. Process the order in QuickBooks
3. Send welcome email to client
4. Schedule onboarding call

YoBot Automation System
"""
    
    success_count = 0
    for recipient in recipients:
        result = send_quote_email(
            sender_email=sender_email,
            app_password=app_password,
            receiver_email=recipient,
            subject=subject,
            body=body,
            pdf_path=pdf_path
        )
        
        if result.get("success"):
            success_count += 1
    
    return {
        "success": success_count > 0,
        "message": f"DocuSign notification sent to {success_count}/{len(recipients)} recipients",
        "sent_to": recipients[:success_count]
    }