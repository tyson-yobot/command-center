import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "server")))
from modules.rag.ragEngine import get_documents, ingest_documents

from flask import Blueprint, jsonify
from pyairtable import Table
from dotenv import load_dotenv
load_dotenv()
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "server")))
rag_router = Blueprint("rag_router", __name__)


@rag_router.route("/api/rag/chunks", methods=["GET"])
def get_rag_chunks():
    try:
        table = Table(
            os.getenv("AIRTABLE_API_KEY"),
            "appRt8V3tH4g5Z5if",  # ✅ BASE ID
            "tblhxA9YOTf4ynJi2"   # ✅ TABLE ID
        )
        records = table.all()
        return jsonify(records)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
