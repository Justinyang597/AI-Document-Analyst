const API_BASE = import.meta.env.VITE_API_URL || "";

async function parseJsonResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await res.text();
    if (text.trimStart().startsWith("<!")) {
      throw new Error(
        "Server returned HTML instead of JSON. Is Flask running on port 5000? " +
          "If using npm run dev, start the backend in another terminal."
      );
    }
    throw new Error(text.slice(0, 200) || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function fetchDocuments() {
  const res = await fetch(`${API_BASE}/api/documents`);
  const data = await parseJsonResponse(res);
  if (!res.ok) throw new Error(data.error || "Failed to load documents");
  return data.documents;
}

export async function deleteDocument(docId) {
  const res = await fetch(`${API_BASE}/api/documents/${docId}`, {
    method: "DELETE",
  });
  const data = await parseJsonResponse(res);
  if (!res.ok) throw new Error(data.error || "Failed to delete document");
  return data;
}

export async function uploadFile(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    body: form,
  });
  const data = await parseJsonResponse(res);
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data;
}

export async function analyzeDocument({
  docId,
  query,
  provider,
  model,
  history,
  sessionId,
  onChunk,
  onStart,
  onDone,
}) {
  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      doc_id: docId,
      query,
      provider,
      model,
      history,
      session_id: sessionId,
    }),
  });

  if (!res.ok) {
    const data = await parseJsonResponse(res).catch(() => ({}));
    throw new Error(data.error || "Analysis failed");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const raw = line.slice(6).trim();
      if (!raw) continue;

      let event;
      try {
        event = JSON.parse(raw);
      } catch {
        continue;
      }

      if (event.type === "start" && event.session_id) {
        onStart?.(event.session_id);
      } else if (event.type === "chunk" && event.content) {
        onChunk?.(event.content);
      } else if (event.type === "error") {
        throw new Error(event.message || "Stream error");
      } else if (event.type === "done") {
        onDone?.(event.history, event.session_id);
      }
    }
  }
}
