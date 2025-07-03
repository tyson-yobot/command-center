# icloud_to_airtable_sync/app.py
from flask import Flask
import os
from sync import sync_calendar_to_airtable
import threading
import time

app = Flask(__name__)

@app.route('/')
def index():
    return "YoBot® iCloud Calendar Sync is live."

# Background thread that runs every 15 minutes
def run_scheduler():
    while True:
        sync_calendar_to_airtable()
        time.sleep(900)  # 15 minutes

if __name__ == '__main__':
    thread = threading.Thread(target=run_scheduler)
    thread.daemon = True
    thread.start()
    app.run(host='0.0.0.0', port=10000)
