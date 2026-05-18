from collections.abc import Generator

from openai import OpenAI

from config import Config
from services import normalize_history

SYSTEM_PROMPT = (
    "You are an expert document analyst. Answer questions based on the document "
    "content provided. Be precise, cite relevant sections when helpful, and say "
    "when the document does not contain enough information."
)


def _build_messages(document_text: str, history: list[dict], query: str) -> list[dict]:
    messages = [
        {
            "role": "system",
            "content": f"{SYSTEM_PROMPT}\n\n--- DOCUMENT ---\n{document_text}\n--- END DOCUMENT ---",
        }
    ]
    for item in normalize_history(history):
        messages.append({"role": item["role"], "content": item["content"]})
    messages.append({"role": "user", "content": query})
    return messages


def stream_analysis(
    document_text: str,
    history: list[dict],
    query: str,
    model: str | None = None,
) -> Generator[str, None, None]:
    if not Config.OPENAI_API_KEY:
        yield "[Error: OPENAI_API_KEY is not configured]"
        return

    client = OpenAI(
        api_key=Config.OPENAI_API_KEY,
        base_url=Config.OPENAI_BASE_URL or None,
    )
    stream = client.chat.completions.create(
        model=model or Config.OPENAI_MODEL,
        messages=_build_messages(document_text, history, query),
        stream=True,
    )
    for chunk in stream:
        if not chunk.choices:
            continue
        delta = getattr(chunk.choices[0].delta, "content", None)
        if delta:
            yield delta
