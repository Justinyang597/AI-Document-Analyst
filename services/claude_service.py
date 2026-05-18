from collections.abc import Generator

import anthropic

from config import Config

SYSTEM_PROMPT = (
    "You are an expert document analyst. Answer questions based on the document "
    "content provided. Be precise, cite relevant sections when helpful, and say "
    "when the document does not contain enough information."
)


def _build_messages(history: list[dict], query: str) -> list[dict]:
    messages = []
    for item in history:
        if item.get("role") in ("user", "assistant") and item.get("content"):
            messages.append({"role": item["role"], "content": item["content"]})
    messages.append({"role": "user", "content": query})
    return messages


def stream_analysis(
    document_text: str,
    history: list[dict],
    query: str,
    model: str | None = None,
) -> Generator[str, None, None]:
    if not Config.ANTHROPIC_API_KEY:
        yield "[Error: ANTHROPIC_API_KEY is not configured]"
        return

    client = anthropic.Anthropic(
        api_key=Config.ANTHROPIC_API_KEY,
        base_url=Config.ANTHROPIC_BASE_URL,
    )

    with client.messages.stream(
        model=model or Config.ANTHROPIC_MODEL,
        max_tokens=4096,
        system=f"{SYSTEM_PROMPT}\n\n--- DOCUMENT ---\n{document_text}\n--- END DOCUMENT ---",
        messages=_build_messages(history, query),
    ) as stream:
        for text in stream.text_stream:
            if text:
                yield text
