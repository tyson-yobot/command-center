from __future__ import annotations
import os
import base64
import logging
from flask import Blueprint, request, jsonify
import requests
from dotenv import load_dotenv

load_dotenv()

bp = Blueprint("zendesk_ticket", __name__)

ZENDESK_DOMAIN = os.getenv("ZENDESK_DOMAIN")
ZENDESK_EMAIL = os.getenv("ZENDESK_EMAIL")
ZENDESK_API_TOKEN = os.getenv("ZENDESK_API_TOKEN")

logger = logging.getLogger("yobot.zendesk_ticket")

@bp.route("/api/zendesk-ticket", methods=["POST"])
def create_ticket():
    data = request.get_json(force=True) or {}
    name = data.get("name")
    email = data.get("email")
    subject = data.get("subject", "Support Request")
    message = data.get("message", "")
    phone = data.get("phone")
    source = data.get("source", "command-center")

    if not all([name, email, subject, message]):
        return jsonify({"error": "Missing required fields"}), 400

    if not all([ZENDESK_DOMAIN, ZENDESK_EMAIL, ZENDESK_API_TOKEN]):
        logger.warning("Zendesk credentials not configured; skipping API call")
        return jsonify({"status": "queued"}), 200

    try:
        url = f"https://{ZENDESK_DOMAIN}.zendesk.com/api/v2/tickets.json"
        auth = f"{ZENDESK_EMAIL}/token:{ZENDESK_API_TOKEN}"
        headers = {
            "Authorization": "Basic " + base64.b64encode(auth.encode()).decode(),
            "Content-Type": "application/json",
        }
        payload = {
            "ticket": {
                "subject": subject,
                "comment": {
                    "body": f"{message}\nPhone: {phone or 'N/A'}\nSource: {source}"
                },
                "requester": {"name": name, "email": email},
                "priority": "normal",
            }
        }
        resp = requests.post(url, headers=headers, json=payload, timeout=10)
        resp.raise_for_status()
        ticket_id = resp.json().get("ticket", {}).get("id")
        return jsonify({"status": "success", "ticketId": ticket_id}), 200
    except Exception as e:
        logger.error(f"Zendesk ticket creation failed: {e}")
        return jsonify({"error": "Failed to create ticket"}), 500
