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

    # SendGrid SMTP configuration
    try:
        server = smtplib.SMTP('smtp.sendgrid.net', 587)
        server.starttls()
        server.login('apikey', os.getenv('SENDGRID_API_KEY'))
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Email sending failed: {e}")
        return False