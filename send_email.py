from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
import smtplib
import os

def send_email_with_pdf(to, subject, body, pdf_path):
    msg = MIMEMultipart()
    msg['Subject'] = subject
    msg['To'] = to
    msg['From'] = 'admin@yobot.com'

    msg.attach(MIMEText(body, 'plain'))

    with open(pdf_path, "rb") as f:
        pdf_attachment = MIMEApplication(f.read(), _subtype="pdf")
        pdf_attachment.add_header('Content-Disposition', 'attachment', filename="YoBot_Order.pdf")
        msg.attach(pdf_attachment)

    # SendGrid SMTP configuration with proper error handling
    try:
        sendgrid_api_key = os.getenv('SENDGRID_API_KEY')
        if not sendgrid_api_key:
            print("Email sending failed: SENDGRID_API_KEY not configured")
            return False
            
        server = smtplib.SMTP('smtp.sendgrid.net', 587)
        server.set_debuglevel(0)  # Disable debug output
        server.starttls()
        server.login('apikey', sendgrid_api_key)
        
        # Send the message
        text = msg.as_string()
        server.sendmail(msg['From'], [to], text)
        server.quit()
        print(f"Email successfully sent to {to}")
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        print(f"Email authentication failed: {e}")
        return False
    except smtplib.SMTPConnectError as e:
        print(f"Email connection failed: {e}")
        return False
    except smtplib.SMTPException as e:
        print(f"SMTP error: {e}")
        return False
    except Exception as e:
        print(f"Email sending failed: {e}")
        return False