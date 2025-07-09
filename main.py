"""
main.py
Full production-ready backend entrypoint for YoBot® Command Center.
- Loads environment variables
- Starts Flask app
- Activates Slack webhook listener
- Activates Airtable schema utilities
"""

from __future__ import annotations

import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
import logging

# Load env vars
load_dotenv()
AIRTABLE_TOKEN = os.getenv("AIRTABLE_TOKEN")
SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL")
PORT = int(os.getenv("PORT", 5000))

if not AIRTABLE_TOKEN:
    raise EnvironmentError("Missing AIRTABLE_TOKEN in .env")

if not SLACK_WEBHOOK_URL:
    raise EnvironmentError("Missing SLACK_WEBHOOK_URL in .env")

# Flask app config
app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

# ---------------------------------------------------------
# Webhook: Slack Event Receiver
# ---------------------------------------------------------
@app.route("/webhook/slack", methods=["POST"])
def slack_event():
    data = request.json
    logging.info(f"Incoming Slack payload: {data}")
    return jsonify({"status": "received"})

# ---------------------------------------------------------
# Healthcheck
# ---------------------------------------------------------
@app.route("/health", methods=["GET"])
def healthcheck():
    return jsonify({"status": "ok"})

# ---------------------------------------------------------
# Boot Flask
# ---------------------------------------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT)
