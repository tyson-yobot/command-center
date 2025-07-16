from flask import Blueprint, request, jsonify
from server.modules.rag.ragEngine import get_documents, ingest_documents


rag_router = Blueprint("rag_router", __name__)

@rag_router.route("/api/rag/documents", methods=["GET"])
def fetch_documents():
    try:
        documents = get_documents()
        return jsonify(documents)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@rag_router.route("/api/rag/ingest", methods=["POST"])
def ingest():
    try:
        content = request.json
        result = ingest_documents(content)
        return jsonify({"status": "success", "result": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
