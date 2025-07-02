from flask import Flask, request
import os
import threading
import time

# 🗓 iCloud Calendar Sync
from sync import sync_calendar_to_airtable

# 🧾 Zendesk Ticket Integration
from integrations.zendesk_ticket_router import create_ticket

app = Flask(__name__)

# 🌐 Root endpoint
@app.route('/')
def index():
    return "YoBot® iCloud Calendar Sync + Support Ticket API is live."

# 🔁 Background iCloud Calendar sync every 15 minutes
def run_scheduler():
    while True:
        sync_calendar_to_airtable()
        time.sleep(900)

# 🧾 Support ticket endpoint
@app.route("/api/submit-ticket", methods=["POST"])
def submit_ticket():
    data = request.json
    subject = data.get("subject")
    description = data.get("description")
    name = data.get("name")
    email = data.get("email")
    tags = data.get("tags", [])

    result = create_ticket(subject, description, name, email, tags)
    return result

# 🚀 Run Flask app and background scheduler
if __name__ == '__main__':
    thread = threading.Thread(target=run_scheduler)
    thread.daemon = True
    thread.start()
    app.run(host='0.0.0.0', port=10000)
