import os

from flask import Flask, jsonify
from flask_cors import CORS

from config import Config
from extensions import db
from routes import analyze_bp, history_bp, upload_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.secret_key = Config.SECRET_KEY or "dev-secret-key"
    app.config["UPLOAD_FOLDER"] = os.getenv("UPLOAD_FOLDER", Config.UPLOAD_FOLDER)
    app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024

    CORS(app)
    db.init_app(app)

    if not os.path.exists(app.config["UPLOAD_FOLDER"]):
        os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    app.register_blueprint(upload_bp)
    app.register_blueprint(analyze_bp)
    app.register_blueprint(history_bp)

    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({"status": "healthy"})

    with app.app_context():
        db.create_all()

    return app


if __name__ == "__main__":
    create_app().run(debug=True, port=5000)
