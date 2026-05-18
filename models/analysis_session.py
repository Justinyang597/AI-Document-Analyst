from datetime import datetime, timezone

from extensions import db


class AnalysisSession(db.Model):
    __tablename__ = "analysis_sessions"

    id = db.Column(db.Integer, primary_key=True)
    document_id = db.Column(
        db.Integer,
        db.ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False,
    )
    messages = db.Column(db.JSON, nullable=False, default=list)
    provider = db.Column(db.String(32), nullable=False, default="gemini")
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    document = db.relationship("Document", back_populates="sessions")
