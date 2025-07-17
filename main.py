# main.py — YoBot Command Center Backend Entry Point

from __future__ import annotations
import os
import sys
import logging
from dotenv import load_dotenv
from flask import Flask, request, jsonify

# Load environment variables
load_dotenv()

# Fix module path for RAG
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "server/modules/rag")))

# Import routers
from icloud_calendar_sync.calendar_sync.calendar_router import calendar_router
from routers.rag_router import rag_router
from ragEngine import get_documents, ingest_documents  # Optional: if used for testing here

# Setup Flask
app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

# Register Blueprints
app.register_blueprint(calendar_router)
app.register_blueprint(rag_router)

# Webhook test route
@app.route("/webhook/slack", methods=["POST"])
def slack_event():
    data = request.json
    logging.info(f"Incoming Slack payload: {data}")
    return jsonify({"status": "received"})

# Healthcheck
@app.route("/health", methods=["GET"])
def healthcheck():
    return jsonify({"status": "ok"})

# Run app
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)))
