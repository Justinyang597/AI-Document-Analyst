import { useCallback, useEffect, useState } from "react";
import ChatPanel from "./components/ChatPanel";
import ProviderToggle from "./components/ProviderToggle";
import ModelSelector, { DEFAULT_MODELS } from "./components/ModelSelector";
import Sidebar from "./components/Sidebar";
import UploadPanel from "./components/UploadPanel";
import ThemeToggle from "./components/ThemeToggle";
import { analyzeDocument, deleteDocument, fetchDocuments, uploadFile } from "./api";
import "./App.css";

function getInitialTheme() {
  return document.documentElement.getAttribute("data-theme") || "light";
}

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [activeDocId, setActiveDocId] = useState(null);
  const [activeFilename, setActiveFilename] = useState(null);
  const [provider, setProvider] = useState("claude");
  const [model, setModel] = useState(DEFAULT_MODELS["claude"]);
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(getInitialTheme);
  const [deletingId, setDeletingId] = useState(null);

  const handleProviderChange = (p) => {
    setProvider(p);
    setModel(DEFAULT_MODELS[p]);
  };

  const loadDocuments = useCallback(async () => {
    try {
      const docs = await fetchDocuments();
      setDocuments(docs);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleDelete = async (docId) => {
    setDeletingId(docId);
    setError(null);
    try {
      await deleteDocument(docId);
      if (activeDocId === docId) {
        setActiveDocId(null);
        setActiveFilename(null);
        setMessages([]);
        setSessionId(null);
      }
      await loadDocuments();
    } catch (e) {
      setError(e.message);
    } finally {
      setDeletingId(null);
    }
  };

  const selectDocument = (doc) => {
    setActiveDocId(doc.id);
    setActiveFilename(doc.filename);
    setMessages([]);
    setSessionId(null);
    setError(null);
  };

  const handleUpload = async (file) => {
    setIsUploading(true);
    setError(null);
    try {
      const { doc_id, filename } = await uploadFile(file);
      await loadDocuments();
      setActiveDocId(doc_id);
      setActiveFilename(filename);
      setMessages([]);
      setSessionId(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSend = async (query) => {
    if (!activeDocId || !query.trim() || isAnalyzing) return;

    const userMessage = { role: "user", content: query.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setIsAnalyzing(true);
    setError(null);

    const assistantPlaceholder = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantPlaceholder]);

    const historyBefore = messages;

    try {
      await analyzeDocument({
        docId: activeDocId,
        query: query.trim(),
        provider,
        model,
        history: historyBefore,
        sessionId,
        onChunk: (chunk) => {
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last?.role === "assistant") {
              next[next.length - 1] = {
                ...last,
                content: last.content + chunk,
              };
            }
            return next;
          });
        },
        onStart: (id) => setSessionId(id),
        onDone: (history, id) => {
          if (id) setSessionId(id);
          if (history?.length) setMessages(history);
        },
      });
    } catch (e) {
      setError(e.message);
      setMessages((prev) => {
        const next = [...prev];
        if (next[next.length - 1]?.role === "assistant" && !next[next.length - 1].content) {
          next.pop();
        }
        return next;
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="app">
      <Sidebar
        documents={documents}
        activeDocId={activeDocId}
        onSelect={selectDocument}
        onRefresh={loadDocuments}
        onDelete={handleDelete}
        deletingId={deletingId}
      />
      <main className="main">
        <header className="header">
          <div className="header-left">
            <div className="brand">
              <div className="brand-mark" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L4 7v10l8 5 8-5V7l-8-5z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 12l8-5M12 12L4 7M12 12v10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h1>Document Analyst</h1>
                <p className="brand-sub">Powered by AI</p>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <ProviderToggle provider={provider} onChange={handleProviderChange} />
            <ModelSelector provider={provider} model={model} onChange={setModel} />
            <ThemeToggle theme={theme} onChange={setTheme} />
          </div>
        </header>

        <div className="main-body">
          {error && (
            <div className="banner error" role="alert">
              <span className="banner-icon">!</span>
              {error}
            </div>
          )}

          {!activeDocId ? (
            <UploadPanel onUpload={handleUpload} isUploading={isUploading} />
          ) : (
            <div className="workspace">
              <div className="doc-bar">
                <div className="doc-bar-icon" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="doc-bar-text">
                  <span className="doc-label">Active document</span>
                  <span className="doc-name">{activeFilename}</span>
                </div>
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => {
                    setActiveDocId(null);
                    setActiveFilename(null);
                    setMessages([]);
                    setSessionId(null);
                  }}
                >
                  New upload
                </button>
              </div>
              <ChatPanel
                messages={messages}
                onSend={handleSend}
                isLoading={isAnalyzing}
                disabled={!activeDocId}
                provider={provider}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
