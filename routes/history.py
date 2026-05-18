from flask import Blueprint, jsonify

from sqlalchemy.exc import SQLAlchemyError

from extensions import db
from models.document import Document

history_bp = Blueprint("history", __name__)


@history_bp.route("/api/documents", methods=["GET"])
def list_documents():
    docs = (
        db.session.query(Document)
        .order_by(Document.created_at.desc())
        .all()
    )
    return jsonify({"documents": [d.to_dict() for d in docs]})


@history_bp.route("/api/documents/<int:doc_id>", methods=["GET"])
def get_document(doc_id: int):
    doc = db.session.get(Document, doc_id)
    if not doc:
        return jsonify({"error": "Document not found"}), 404
    return jsonify(doc.to_dict())


@history_bp.route("/api/documents/<int:doc_id>", methods=["DELETE"])
def delete_document(doc_id: int):
    doc = db.session.get(Document, doc_id)
    if not doc:
        return jsonify({"error": "Document not found"}), 404

    try:
        db.session.delete(doc)
        db.session.commit()
    except SQLAlchemyError as exc:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete document: {exc}"}), 503

    return jsonify({"ok": True, "doc_id": doc_id})
