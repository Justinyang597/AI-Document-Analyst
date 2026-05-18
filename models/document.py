from datetime import datetime, timezone

from extensions import db


class Document(db.Model):
    __tablename__ = "documents"

    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(512), nullable=False)
    file_type = db.Column(db.String(16), nullable=False)
    content_text = db.Column(db.Text, nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    sessions = db.relationship(
        "AnalysisSession",
        back_populates="document",
        cascade="all, delete-orphan",
    )

    def to_dict(self):
        preview = self.content_text[:200] + "..." if len(self.content_text) > 200 else self.content_text
        return {
            "id": self.id,
            "filename": self.filename,
            "file_type": self.file_type,
            "preview": preview,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
