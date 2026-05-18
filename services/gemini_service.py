from collections.abc import Generator

from config import Config
from services import normalize_history

SYSTEM_PROMPT = (
    "You are an expert document analyst. Answer questions based on the document "
    "content provided. Be precise, cite relevant sections when helpful, and say "
    "when the document does not contain enough information."
)


def _build_openai_messages(document_text: str, history: list[dict], query: str) -> list[dict]:
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


def _stream_via_proxy(document_text: str, history: list[dict], query: str, model: str) -> Generator[str, None, None]:
    from openai import OpenAI
    client = OpenAI(api_key=Config.GEMINI_API_KEY, base_url=Config.GEMINI_BASE_URL)
    stream = client.chat.completions.create(
        model=model,
        messages=_build_openai_messages(document_text, history, query),
        stream=True,
    )
    for chunk in stream:
        if not chunk.choices:
            continue
        delta = getattr(chunk.choices[0].delta, "content", None)
        if delta:
            yield delta


def _stream_native(document_text: str, history: list[dict], query: str, model: str) -> Generator[str, None, None]:
    from google import genai
    from google.genai import types
    client = genai.Client(api_key=Config.GEMINI_API_KEY)
    contents = []
    for item in normalize_history(history):
        role = "model" if item["role"] == "assistant" else "user"
        contents.append(types.Content(role=role, parts=[types.Part(text=item["content"])]))
    contents.append(types.Content(role="user", parts=[types.Part(text=query)]))
    config = types.GenerateContentConfig(
        system_instruction=f"{SYSTEM_PROMPT}\n\n--- DOCUMENT ---\n{document_text}\n--- END DOCUMENT ---",
    )
    for chunk in client.models.generate_content_stream(model=model, contents=contents, config=config):
        if chunk.text:
            yield chunk.text


def stream_analysis(
    document_text: str,
    history: list[dict],
    query: str,
    model: str | None = None,
) -> Generator[str, None, None]:
    if not Config.GEMINI_API_KEY:
        yield "[Error: GEMINI_API_KEY is not configured]"
        return

    resolved_model = model or Config.GEMINI_MODEL

    if Config.GEMINI_BASE_URL:
        yield from _stream_via_proxy(document_text, history, query, resolved_model)
    else:
        yield from _stream_native(document_text, history, query, resolved_model)
