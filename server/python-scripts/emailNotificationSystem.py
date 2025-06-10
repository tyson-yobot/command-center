import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import json

def send_enhanced_email_notifications(quote_data):
    """
    Send enhanced email notifications to tyson@yobot.bot and daniel@yobot.bot
    """
    try:
        # Extract data from quote result
        company_name = quote_data.get('company_name', 'Unknown Company')
        contact_name = quote_data.get('contact_name', 'Unknown Contact')
        quote_id = quote_data.get('quote_id', 'Q-UNKNOWN')
        total_amount = quote_data.get('total_amount', 0)
        deposit_amount = quote_data.get('deposit_amount', 0)
        pdf_path = quote_data.get('pdf_path', '')
        
        # Email configuration
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        sender_email = os.getenv('GMAIL_USER', 'noreply@yobot.bot')
        sender_password = os.getenv('GMAIL_APP_PASSWORD', '')
        
        recipients = ['tyson@yobot.bot', 'daniel@yobot.bot']
        
        # Create email subject
        subject = f"New Quote for {company_name} – {quote_id}"
        
        # Create email body
        email_body = f"""Hey team –

A new quote has been generated for {company_name}.

Contact: {contact_name}
Quote #: {quote_id}
Total: ${total_amount:,.2f}
✅ 50% Deposit Required: ${deposit_amount:,.2f}

📄 PDF is saved to the client folder in Google Drive.

– YoBot Automation"""

        # Create message
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = ', '.join(recipients)
        msg['Subject'] = subject
        
        # Add body to email
        msg.attach(MIMEText(email_body, 'plain'))
        
        # Attach PDF if it exists
        if pdf_path and os.path.exists(pdf_path):
            with open(pdf_path, "rb") as attachment:
                part = MIMEBase('application', 'octet-stream')
                part.set_payload(attachment.read())
                
            encoders.encode_base64(part)
            part.add_header(
                'Content-Disposition',
                f'attachment; filename= {os.path.basename(pdf_path)}'
            )
            msg.attach(part)
        
        # Send email
        if sender_password:
            server = smtplib.SMTP(smtp_server, smtp_port)
            server.starttls()
            server.login(sender_email, sender_password)
            text = msg.as_string()
            server.sendmail(sender_email, recipients, text)
            server.quit()
            
            return {
                "success": True,
                "message": f"Email sent successfully to {', '.join(recipients)}",
                "recipients": recipients
            }
        else:
            return {
                "success": False,
                "message": "Gmail credentials not configured"
            }
            
    except Exception as e:
        return {
            "success": False,
            "message": f"Email sending failed: {str(e)}"
        }

def send_slack_notification(quote_data):
    """
    Send enhanced Slack notification
    """
    try:
        import requests
        
        slack_webhook_url = os.getenv('SLACK_WEBHOOK_URL', '')
        
        if not slack_webhook_url:
            return {
                "success": False,
                "message": "Slack webhook URL not configured"
            }
        
        # Extract data
        company_name = quote_data.get('company_name', 'Unknown Company')
        contact_name = quote_data.get('contact_name', 'Unknown Contact')
        quote_id = quote_data.get('quote_id', 'Q-UNKNOWN')
        total_amount = quote_data.get('total_amount', 0)
        deposit_amount = quote_data.get('deposit_amount', 0)
        
        # Create Slack message
        slack_message = {
            "text": "📩 New Quote Generated",
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*📩 New Quote Generated*\n\n*Client:* {company_name}\n*Contact:* {contact_name}\n*Quote #:* {quote_id}\n*💰 Total:* ${total_amount:,.2f}\n*✅ 50% Deposit Required:* ${deposit_amount:,.2f}\n\n*📄 Saved to:* Google Drive → 1. Clients → {company_name}"
                    }
                }
            ]
        }
        
        response = requests.post(slack_webhook_url, json=slack_message)
        
        if response.status_code == 200:
            return {
                "success": True,
                "message": "Slack notification sent successfully"
            }
        else:
            return {
                "success": False,
                "message": f"Slack notification failed: {response.status_code}"
            }
            
    except Exception as e:
        return {
            "success": False,
            "message": f"Slack notification failed: {str(e)}"
        }

if __name__ == "__main__":
    # Test data
    test_quote_data = {
        "company_name": "Acme Robotics",
        "contact_name": "John Smith",
        "quote_id": "Q-20250106-001",
        "total_amount": 15047.00,
        "deposit_amount": 7523.50,
        "pdf_path": "/path/to/quote.pdf"
    }
    
    # Test email
    email_result = send_enhanced_email_notifications(test_quote_data)
    print("Email Result:", json.dumps(email_result, indent=2))
    
    # Test Slack
    slack_result = send_slack_notification(test_quote_data)
    print("Slack Result:", json.dumps(slack_result, indent=2))