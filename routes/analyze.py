import json
from datetime import datetime, timezone

from flask import Blueprint, Response, jsonify, request, stream_with_context

from extensions import db
from models.analysis_session import AnalysisSession
from models.document import Document
from services import claude_service, openai_service, gemini_service

analyze_bp = Blueprint("analyze", __name__)

SERVICES = {
    "claude": claude_service,
    "openai": openai_service,
    "gemini": gemini_service,
}

def _sse_event(data: dict) -> str:
    return f"data: {json.dumps(data)}\n\n"

@analyze_bp.route("/api/analyze", methods=["POST"])
def analyze_document():
    body = request.get_json(silent=True) or {}
    doc_id = body.get("doc_id")
    query = (body.get("query") or "").strip()
    history = body.get("history") or []
    session_id = body.get("session_id")
    provider = body.get("provider", "claude")
    model = body.get("model") or None

    if provider not in SERVICES:
        return jsonify({"error": f"Unknown provider '{provider}'"}), 400
    if not doc_id:
        return jsonify({"error": "doc_id is required"}), 400
    if not query:
        return jsonify({"error": "query is required"}), 400

    doc = db.session.get(Document, doc_id)
    if not doc:
        return jsonify({"error": "Document not found"}), 404

    session = None
    if session_id:
        session = db.session.get(AnalysisSession, session_id)
        if session and session.document_id != doc.id:
            return jsonify({"error": "Session does not belong to this document"}), 400

    if not session:
        session = AnalysisSession(
            document_id=doc.id,
            messages=list(history),
            provider=provider,
        )
        db.session.add(session)
        db.session.flush()
    else:
        session.provider = provider
        if history:
            session.messages = list(history)

    service = SERVICES[provider]
    collected: list[str] = []

    def generate():
        yield _sse_event({"type": "start", "session_id": session.id})
        try:
            for chunk in service.stream_analysis(doc.content_text, list(session.messages), query, model=model):
                collected.append(chunk)
                yield _sse_event({"type": "chunk", "content": chunk})
        except Exception as exc:
            yield _sse_event({"type": "error", "message": str(exc)})
            return

        full_response = "".join(collected)
        session.messages = list(session.messages) + [
            {"role": "user", "content": query},
            {"role": "assistant", "content": full_response},
        ]
        session.updated_at = datetime.now(timezone.utc)
        db.session.commit()

        yield _sse_event(
            {
                "type": "done",
                "session_id": session.id,
                "history": session.messages,
            }
        )

    return Response(
        stream_with_context(generate()),
        mimetype="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )

@analyze_bp.route("/api/sessions/<int:session_id>", methods=["GET"])
def get_session(session_id: int):
    session = db.session.get(AnalysisSession, session_id)
    if not session:
        return jsonify({"error": "Session not found"}), 404
    return jsonify(
        {
            "session_id": session.id,
            "document_id": session.document_id,
            "provider": session.provider,
            "history": session.messages,
            "created_at": session.created_at.isoformat() if session.created_at else None,
            "updated_at": session.updated_at.isoformat() if session.updated_at else None,
        }
    )
