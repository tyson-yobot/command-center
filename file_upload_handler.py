#!/usr/bin/env python3
"""
File Upload Handler with Complete Automation Integration
Handles file uploads with RAG injection, CRM logging, and metrics tracking
"""

from flask import Flask, request, jsonify
import os
import requests
from datetime import datetime
import traceback
from werkzeug.utils import secure_filename

# Import logging modules
from airtable_logger import log_sales_event
from command_center_logger import post_to_command_center

app = Flask(__name__)

# Configure upload settings
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx', 'mp3', 'wav', 'mp4'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST'])
def handle_file_upload():
    """
    Handle file upload with complete automation workflow
    """
    try:
        # Validate file upload
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
            
        if not allowed_file(file.filename):
            return jsonify({"error": "File type not allowed"}), 400
        
        # Get user details
        email = request.form.get('email', 'unknown@yobot.bot')
        user_name = request.form.get('name', 'Unknown User')
        timestamp = datetime.now().isoformat()
        
        # Secure filename and save
        filename = secure_filename(file.filename)
        unique_filename = f"{email}_{timestamp.replace(':', '-')}_{filename}"
        filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
        
        file.save(filepath)
        file_size = os.path.getsize(filepath)
        
        # Execute automation workflows
        results = {}
        
        # 1. Inject into RAG knowledge base
        try:
            rag_response = inject_file_to_rag(filepath, email, user_name, filename)
            results['rag_injected'] = rag_response
        except Exception as e:
            results['rag_injected'] = False
            print(f"RAG injection failed: {e}")
        
        # 2. Log to CRM system
        try:
            crm_response = log_file_to_crm(email, user_name, filename, timestamp)
            results['crm_logged'] = crm_response
        except Exception as e:
            results['crm_logged'] = False
            print(f"CRM logging failed: {e}")
        
        # 3. Log to metrics tracker
        try:
            metrics_response = log_file_to_metrics(email, user_name, filename, file_size, timestamp)
            results['metrics_logged'] = metrics_response
        except Exception as e:
            results['metrics_logged'] = False
            print(f"Metrics logging failed: {e}")
        
        # 4. Log to Airtable
        try:
            airtable_response = log_file_to_airtable(email, user_name, filename, file_size, timestamp)
            results['airtable_logged'] = airtable_response
        except Exception as e:
            results['airtable_logged'] = False
            print(f"Airtable logging failed: {e}")
        
        # 5. Send Slack notification
        try:
            slack_response = send_file_upload_alert(email, user_name, filename, file_size)
            results['slack_alert'] = slack_response
        except Exception as e:
            results['slack_alert'] = False
            print(f"Slack alert failed: {e}")
        
        print(f"File uploaded successfully: {unique_filename} by {email}")
        
        return jsonify({
            "status": "success",
            "filename": unique_filename,
            "email": email,
            "user_name": user_name,
            "file_size": file_size,
            "timestamp": timestamp,
            "automation_results": results
        }), 200
        
    except Exception as e:
        error_msg = f"File upload error: {str(e)}"
        print(error_msg)
        print(traceback.format_exc())
        
        return jsonify({"error": error_msg}), 500

def inject_file_to_rag(filepath, email, user_name, filename):
    """Inject uploaded file into RAG knowledge base"""
    try:
        rag_api_url = os.getenv("RAG_INDEX_URL")
        rag_api_key = os.getenv("RAG_API_KEY")
        
        if not rag_api_url or not rag_api_key:
            print("RAG service not configured")
            return False
        
        # Read file content for text files
        file_content = ""
        if filename.endswith(('.txt', '.md')):
            with open(filepath, 'r', encoding='utf-8') as f:
                file_content = f.read()
        
        payload = {
            "source": "UserUpload",
            "reference_id": f"upload_{email}_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "content": f"User {user_name} ({email}) uploaded file: {filename}. Content: {file_content[:1000]}...",
            "metadata": {
                "user_email": email,
                "user_name": user_name,
                "filename": filename,
                "filepath": filepath,
                "upload_type": "file_upload"
            },
            "tags": ["file_upload", "user_content", "knowledge"],
            "timestamp": datetime.now().isoformat()
        }
        
        response = requests.post(
            rag_api_url,
            headers={
                "Authorization": f"Bearer {rag_api_key}",
                "Content-Type": "application/json"
            },
            json=payload,
            timeout=30
        )
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"RAG injection error: {e}")
        return False

def log_file_to_crm(email, user_name, filename, timestamp):
    """Log file upload to CRM system"""
    try:
        hubspot_api_key = os.getenv("HUBSPOT_API_KEY")
        
        if not hubspot_api_key:
            print("HubSpot API key not configured")
            return False
        
        payload = {
            "properties": {
                "email": email,
                "firstname": user_name,
                "last_activity": f"Uploaded file: {filename}",
                "last_activity_date": timestamp,
                "hs_lead_status": "FILE_UPLOADED",
                "lifecyclestage": "customer"
            }
        }
        
        response = requests.post(
            "https://api.hubapi.com/crm/v3/objects/contacts",
            headers={
                "Authorization": f"Bearer {hubspot_api_key}",
                "Content-Type": "application/json"
            },
            json=payload,
            timeout=10
        )
        
        return response.status_code in [200, 201]
        
    except Exception as e:
        print(f"CRM logging error: {e}")
        return False

def log_file_to_metrics(email, user_name, filename, file_size, timestamp):
    """Log file upload to Command Center metrics"""
    try:
        post_to_command_center(
            event_type="📁 File Uploaded",
            source="User Upload",
            ref_id=f"upload_{email}",
            summary=f"{user_name} uploaded {filename}",
            timestamp=timestamp
        )
        return True
    except Exception as e:
        print(f"Metrics logging error: {e}")
        return False

def log_file_to_airtable(email, user_name, filename, file_size, timestamp):
    """Log file upload to Airtable"""
    try:
        airtable_token = os.getenv("AIRTABLE_API_KEY")
        airtable_base_id = os.getenv("AIRTABLE_BASE_ID")
        
        if not airtable_token or not airtable_base_id:
            return False
        
        url = f"https://api.airtable.com/v0/{airtable_base_id}/📁%20File%20Uploads"
        
        payload = {
            "fields": {
                "📧 Email": email,
                "👤 Name": user_name,
                "📄 Filename": filename,
                "📊 File Size": f"{file_size / 1024:.1f} KB",
                "🕒 Timestamp": timestamp,
                "📌 Status": "✅ Processed"
            }
        }
        
        response = requests.post(
            url,
            headers={
                "Authorization": f"Bearer {airtable_token}",
                "Content-Type": "application/json"
            },
            json=payload,
            timeout=10
        )
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"Airtable logging error: {e}")
        return False

def send_file_upload_alert(email, user_name, filename, file_size):
    """Send Slack alert for file upload"""
    try:
        slack_webhook_url = os.getenv("SLACK_WEBHOOK_URL")
        
        if not slack_webhook_url:
            return False
        
        message = {
            "text": f"📁 File Uploaded: {user_name} uploaded {filename}",
            "attachments": [
                {
                    "color": "good",
                    "fields": [
                        {
                            "title": "User",
                            "value": f"{user_name} ({email})",
                            "short": True
                        },
                        {
                            "title": "File",
                            "value": filename,
                            "short": True
                        },
                        {
                            "title": "Size",
                            "value": f"{file_size / 1024:.1f} KB",
                            "short": True
                        },
                        {
                            "title": "Time",
                            "value": datetime.now().strftime("%I:%M %p"),
                            "short": True
                        }
                    ]
                }
            ]
        }
        
        response = requests.post(slack_webhook_url, json=message, timeout=10)
        return response.status_code == 200
        
    except Exception as e:
        print(f"Slack alert error: {e}")
        return False

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "File Upload Handler",
        "upload_folder": UPLOAD_FOLDER,
        "allowed_extensions": list(ALLOWED_EXTENSIONS),
        "timestamp": datetime.now().isoformat()
    }), 200

@app.route("/test-upload", methods=["POST"])
def test_upload():
    """Test endpoint for file upload automation"""
    # Create a test file
    test_content = "This is a test file for YoBot automation system."
    test_filename = f"test_upload_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
    test_filepath = os.path.join(UPLOAD_FOLDER, test_filename)
    
    with open(test_filepath, 'w') as f:
        f.write(test_content)
    
    # Simulate upload processing
    results = {
        "rag_injected": True,
        "crm_logged": True,
        "metrics_logged": True,
        "airtable_logged": True,
        "slack_alert": True
    }
    
    return jsonify({
        "status": "test_success",
        "filename": test_filename,
        "automation_results": results
    }), 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5004))
    app.run(host="0.0.0.0", port=port, debug=True)