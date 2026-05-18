from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from extensions import db
from models.document import Document
from services.docx_extractor import extract_text_from_docx
from services.pdf_extractor import extract_text_from_pdf, extract_text_from_txt

upload_bp = Blueprint("upload", __name__)

ALLOWED_EXTENSIONS = {"pdf", "txt", "docx"}


def _allowed(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@upload_bp.route("/api/upload", methods=["POST"])
def upload_document():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if not file or not file.filename:
        return jsonify({"error": "No file selected"}), 400

    if not _allowed(file.filename):
        return jsonify({"error": "Only PDF, DOCX, and TXT files are allowed"}), 400

    file_bytes = file.read()
    if not file_bytes:
        return jsonify({"error": "File is empty"}), 400

    ext = file.filename.rsplit(".", 1)[1].lower()
    try:
        if ext == "pdf":
            content_text = extract_text_from_pdf(file_bytes)
        elif ext == "docx":
            content_text = extract_text_from_docx(file_bytes)
        else:
            content_text = extract_text_from_txt(file_bytes)
    except Exception as exc:
        return jsonify({"error": f"Failed to extract text: {exc}"}), 400

    if not content_text:
        return jsonify({"error": "No text could be extracted from the file"}), 400

    doc = Document(
        filename=file.filename,
        file_type=ext,
        content_text=content_text,
    )
    db.session.add(doc)
    try:
        db.session.commit()
    except SQLAlchemyError as exc:
        db.session.rollback()
        return jsonify(
            {
                "error": (
                    "Database error — check DATABASE_URL in .env. "
                    f"Details: {exc}"
                )
            }
        ), 503

    return jsonify({"doc_id": doc.id, "filename": doc.filename}), 201
