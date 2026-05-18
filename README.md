# AI Document Analyst

A full-stack web app that lets you upload documents and have a streaming conversation with an AI about their contents. Powered by Claude Haiku via the Anthropic API.

[Demo](docs/demo.gif)

## Features

- **Multi-provider AI** — switch between Claude Haiku, GPT-4o Mini, and Gemini Flash with one click
- **Instant upload** — drag-and-drop or click to upload PDF, DOCX, or TXT files
- **Auto-summary** — as soon as a document is uploaded, the AI summarises it in bullet points automatically
- **Streaming chat** — responses stream token-by-token in real time
- **Markdown rendering** — responses render with full formatting (lists, code blocks, tables, headings)
- **Session persistence** — conversations are saved to PostgreSQL so you can pick up where you left off
- **Document history** — sidebar lets you switch between all previously uploaded documents
- **Dark / light mode** — system-aware theme toggle

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, react-markdown |
| Backend | Python, Flask, Server-Sent Events |
| AI | Claude Haiku · GPT-4o Mini · Gemini Flash |
| Database | PostgreSQL (via SQLAlchemy) |
| PDF parsing | PyMuPDF |

## Quick deploy (Docker)

The fastest way to run the app — one command starts everything (app + database).

```bash
git clone https://github.com/your-username/ai-document-analyst.git
cd ai-document-analyst
cp .env.example .env   # then fill in your API keys
docker compose up --build
```

Open **http://localhost** in your browser.  
The database initialises automatically on first run. Uploaded files and the database are persisted in Docker volumes so data survives container restarts.

---

## Manual setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL database (local or hosted — [Supabase](https://supabase.com) free tier works)
- An Anthropic API key (or a compatible proxy key)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/ai-document-analyst.git
cd ai-document-analyst
```

### 2. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

```env
SECRET_KEY=change-me-in-production
DATABASE_URL=postgresql://user:password@host:5432/dbname
ANTHROPIC_API_KEY=your-api-key-here
ANTHROPIC_BASE_URL=https://api.anthropic.com
```

### 3. Start the backend

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
python app.py
```

The Flask server starts on `http://localhost:5000`.

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Project structure

```
├── app.py                  # Flask app entry point
├── config.py               # Environment-based configuration
├── extensions.py           # SQLAlchemy instance
├── models/                 # SQLAlchemy models
├── routes/
│   ├── analyze.py          # POST /api/analyze  (SSE streaming)
│   ├── upload.py           # POST /api/upload
│   └── history.py          # GET  /api/documents
├── services/
│   └── claude_service.py   # Anthropic streaming wrapper
└── frontend/
    └── src/
        ├── App.jsx
        ├── api.js
        └── components/
            ├── ChatPanel.jsx
            ├── Sidebar.jsx
            ├── UploadPanel.jsx
            └── ThemeToggle.jsx
```

## Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `SECRET_KEY` | Yes | — | Flask session secret |
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `ANTHROPIC_API_KEY` | Yes | — | API key for Claude |
| `ANTHROPIC_BASE_URL` | No | `https://yunwu.ai` | Override base URL (for proxies) |
| `ANTHROPIC_MODEL` | No | `claude-haiku-4-5-20251001` | Model ID |
| `UPLOAD_FOLDER` | No | `uploads/` | Local folder for uploaded files |

## License

MIT
