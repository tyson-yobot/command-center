from __future__ import annotations
from flask import Flask
from icloud_calendar_sync.calendar_sync.calendar_router import calendar_router
import os
import logging
from flask import Flask, request, jsonify, Blueprint
from dotenv import load_dotenv
from routers.rag_router import rag_router

app = Flask(__name__)  # ⬅️ must come before register_blueprint
app.register_blueprint(calendar_router)
# Custom router imports (after __future__)
from icloud_calendar_sync.calendar_sync.calendar_router import calendar_router
app.register_blueprint(calendar_router)
# Load env
load_dotenv()

# Setup Flask
app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

# Register Blueprints
app.register_blueprint(calendar_router)

# Webhook route example
@app.route("/webhook/slack", methods=["POST"])
def slack_event():
    data = request.json
    logging.info(f"Incoming Slack payload: {data}")
    return jsonify({"status": "received"})

# Healthcheck
@app.route("/health", methods=["GET"])
def healthcheck():
    return jsonify({"status": "ok"})

# Run Flask
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)))
