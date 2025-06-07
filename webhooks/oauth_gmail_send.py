import os
import sys
import json
import base64
from email.mime.text import MIMEText
try:
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
    from google.auth.transport.requests import Request
    import pickle
    GMAIL_AVAILABLE = True
except ImportError:
    GMAIL_AVAILABLE = False

# 🔐 SCOPES
SCOPES = ['https://www.googleapis.com/auth/gmail.send']

def authenticate_gmail():
    if not GMAIL_AVAILABLE:
        raise Exception("Gmail API libraries not available")
    
    creds = None
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists('client_secret.json'):
                raise Exception("client_secret.json not found")
            flow = InstalledAppFlow.from_client_secrets_file(
                'client_secret.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)
    return build('gmail', 'v1', credentials=creds)

def send_followup_email(recipient_email, subject, message_text):
    try:
        service = authenticate_gmail()
        message = MIMEText(message_text)
        message['to'] = recipient_email
        message['from'] = "tyson@yobot.bot"
        message['subject'] = subject

        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
        body = {'raw': raw_message}

        result = service.users().messages().send(userId='me', body=body).execute()
        return {"status": "sent", "id": result['id']}
    except Exception as e:
        return {"status": "error", "error": str(e)}

def check_auth_status():
    try:
        if not GMAIL_AVAILABLE:
            return {"authenticated": False, "error": "Gmail API libraries not installed"}
        
        if not os.path.exists('client_secret.json'):
            return {"authenticated": False, "error": "client_secret.json not found"}
        
        if os.path.exists('token.pickle'):
            return {"authenticated": True, "message": "Gmail OAuth token exists"}
        else:
            return {"authenticated": False, "error": "Gmail OAuth token not found - need to authenticate"}
    except Exception as e:
        return {"authenticated": False, "error": str(e)}

# Command line interface
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No command provided"}))
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "check-auth":
        result = check_auth_status()
        print(json.dumps(result))
    
    elif command == "send-email" and len(sys.argv) > 2:
        try:
            email_data = json.loads(sys.argv[2])
            result = send_followup_email(
                email_data['recipient_email'],
                email_data['subject'],
                email_data['message_text']
            )
            print(json.dumps(result))
        except Exception as e:
            print(json.dumps({"status": "error", "error": str(e)}))
    
    else:
        print(json.dumps({"error": "Invalid command or missing parameters"}))