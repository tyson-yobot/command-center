from __future__ import annotations
import logging, os, json, csv, datetime
from typing import Dict, Any, List
import requests
from dotenv import load_dotenv
from pyairtable import Api, Table
from pyairtable.models.schema import fetch_schema

load_dotenv()

# ---------------------------------------------------------------------------
# CONSTANTS – NOTHING TO EDIT EVER
# ---------------------------------------------------------------------------
AIRTABLE_TOKEN   = os.getenv("AIRTABLE_TOKEN")
BASE_ID          = "appCoAtCZdARb4AM2"          # YoBot® Ops & Automation base
SCHEMA_LOG_TABLE = "🧪 Schema Log Table"        # destination table for pushes
SLACK_WEBHOOK    = "https://hooks.slack.com/services/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"

if not AIRTABLE_TOKEN:
    raise EnvironmentError("AIRTABLE_TOKEN is missing or invalid in your environment.")

api = Api(AIRTABLE_TOKEN)
logger = logging.getLogger("yobot.schema_exporter")
logger.setLevel(logging.INFO)
_formatter = logging.Formatter("%(asctime)s │ %(levelname)s │ %(message)s")
_stream = logging.StreamHandler(); _stream.setFormatter(_formatter); logger.addHandler(_stream)

TABLES_TO_EXPORT = [
    "📞 Voice Call Log", "🧪 QA Call Review Log", "📋 VoiceBot Script Tracker",
    "🎯 Lead Qualification Tracker", "🧠 NLP Keyword Tracker", "📁 Call Recording Tracker",
    "📊 Call Sentiment Log", "🚨 Escalation Tracker", "💼 Client Touchpoint Log",
    "📞 Missed Call Log", "🧞 Call Script A/B Test Log", "📣 Slack Alerts Log",
    "🔗 Integration Sync Tracker", "🧠 Bot Personality Pack Tracker", "📈 VoiceBot Performance Dashboard Log",
    "✅ Compliance Checklist Log", "🧮 Botalytics Monthly Log", "💃 File Upload Tracker",
    "✅ Follow-Up Reminder Tracker", "🧞 PDF Quote Generator Log", "🔐 Internal Security Checklist",
    "🔔 Slack Message Review Tracker", "🧑‍💼 Rep Scorecard Log", "📦 Order Tracker",
    "🧹 Add-On Modules", "🤖 Bot Packages", "🧞 Sales Orders", "🧬 CRM Contacts",
    "🧞 Invoice Tracker", "🎟️ Support Ticket Summary", "🎯 Deal Milestones",
    "📁 Task Template Table", "📌 Project Roadmap Tracker", "📊 Command Center · Metrics Tracker",
    "🧪 Integration Test Log", "🛡 Logger Integrity Tracker"
]

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _slack(msg: str):
    try:
        requests.post(SLACK_WEBHOOK, json={"text": repr(msg)}, timeout=5)
    except Exception as e:
        logger.warning(f"Slack post failed: {repr(e)}")

# ---------------------------------------------------------------------------
# Core Export Functions – CALL THESE, NEVER EDIT
# ---------------------------------------------------------------------------

def export_schema() -> Dict[str, Any]:
    logger.info(f"📄 Fetching schema for base {BASE_ID}")
    schema = fetch_schema(api, BASE_ID)
    logger.info(f"✅ {len(schema.get('tables', []))} tables in {BASE_ID}")
    _slack(f"✅ Schema exported for *{BASE_ID}* ({len(schema['tables'])} tables)")
    return schema

def snapshot_to_csv(path: str) -> None:
    schema = export_schema()
    rows: List[Dict[str, str]] = []
    for tbl in schema["tables"]:
        if tbl["name"] not in TABLES_TO_EXPORT:
            continue
        for fld in tbl["fields"]:
            rows.append({
                "base_id"   : BASE_ID,
                "base_name" : schema["name"],
                "table_id"  : tbl["id"],
                "table_name": tbl["name"],
                "field_name": fld["name"],
                "field_type": fld["type"],
                "captured"  : datetime.datetime.utcnow().isoformat()
            })
    with open(path, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=rows[0].keys())
        w.writeheader(); w.writerows(rows)
    logger.info(f"📂 CSV saved → {path} ({len(rows)} rows)"); _slack(f"📂 Schema CSV saved → {path}")

def push_snapshot_to_airtable() -> None:
    schema = export_schema()
    tbl = Table(AIRTABLE_TOKEN, BASE_ID, SCHEMA_LOG_TABLE)
    created = 0
    for t in schema["tables"]:
        if t["name"] not in TABLES_TO_EXPORT:
            continue
        for f in t["fields"]:
            tbl.create({
                "🧱 Base Name": schema["name"],
                "📄 Table Name": t["name"],
                "🏷 Field Name": f["name"],
                "🔠 Field Type": f["type"],
                "🕒 Timestamp": datetime.datetime.utcnow().isoformat()
            })
            created += 1
    logger.info(f"✅ {created} fields pushed to {SCHEMA_LOG_TABLE}")
    _slack(f"📄 {created} fields logged to *{SCHEMA_LOG_TABLE}*")
